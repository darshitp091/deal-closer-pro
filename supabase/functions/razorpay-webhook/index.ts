/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendPaymentEmails } from "../_shared/payment-email.ts";
import {
  razorpaySignature,
  signaturesMatch,
} from "../_shared/razorpay.ts";

interface RazorpayWebhook {
  event: string;
  payload: {
    payment?: { entity?: { id?: string; order_id?: string; status?: string } };
    refund?: { entity?: { payment_id?: string; status?: string } };
  };
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const secret =
      Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ??
      Deno.env.get("RAZORPAY_KEY_SECRET");
    const signature = req.headers.get("X-Razorpay-Signature");
    if (!secret || !signature) return new Response("Missing signature", { status: 401 });

    const rawBody = await req.text();
    const expected = razorpaySignature(rawBody, secret);
    if (!signaturesMatch(expected, signature)) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(rawBody) as RazorpayWebhook;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (event.event === "payment.captured") {
      const payment = event.payload.payment?.entity;
      if (!payment?.order_id || !payment.id) return new Response("ok");

      const { data: order, error } = await supabase
        .from("orders")
        .update({
          provider_payment_id: payment.id,
          status: "paid",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("provider_order_id", payment.order_id)
        .in("status", ["created", "failed"])
        .select("user_id, plan_id, amount_paise")
        .maybeSingle();

      if (error) {
        console.error("Webhook order update failed:", error);
        return new Response("Database error", { status: 500 });
      }

      if (order) {
        const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
        const user = userData.user;
        if (user?.email) {
          try {
            await sendPaymentEmails({
              customerName: (user.user_metadata?.full_name as string | undefined) ?? "Customer",
              customerEmail: user.email,
              customerPhone: (user.user_metadata?.phone as string | undefined) ?? "",
              planName: order.plan_id,
              amountInr: order.amount_paise / 100,
              orderId: payment.order_id,
              paymentId: payment.id,
            });
          } catch (emailError) {
            console.error("Payment email notification failed:", emailError);
          }
        }
      }
    } else if (event.event === "payment.failed") {
      const payment = event.payload.payment?.entity;
      if (payment?.order_id) {
        await supabase
          .from("orders")
          .update({
            provider_payment_id: payment.id ?? null,
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("provider_order_id", payment.order_id)
          .in("status", ["created", "failed"]);
      }
    } else if (event.event === "refund.processed") {
      const paymentId = event.payload.refund?.entity?.payment_id;
      if (paymentId) {
        await supabase
          .from("orders")
          .update({ status: "refunded", updated_at: new Date().toISOString() })
          .eq("provider_payment_id", paymentId)
          .eq("status", "paid");
      }
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("razorpay webhook error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
