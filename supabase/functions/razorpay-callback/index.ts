/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendPaymentEmails } from "../_shared/payment-email.ts";
import {
  razorpayBaseUrl,
  razorpayCredentials,
  razorpayHeaders,
  razorpaySignature,
  signaturesMatch,
} from "../_shared/razorpay.ts";

function redirect(siteUrl: string, path: string, orderId?: string): Response {
  const url = new URL(path, `${siteUrl.replace(/\/$/, "")}/`);
  if (orderId) url.searchParams.set("order", orderId);
  return Response.redirect(url, 303);
}

serve(async (req) => {
  const siteUrl = Deno.env.get("SITE_URL");
  if (!siteUrl) return new Response("Site URL is not configured", { status: 500 });

  try {
    if (req.method !== "POST") return redirect(siteUrl, "/payment/failure");

    const form = await req.formData();
    const orderId = String(form.get("razorpay_order_id") ?? "");
    const paymentId = String(form.get("razorpay_payment_id") ?? "");
    const signature = String(form.get("razorpay_signature") ?? "");
    if (!orderId || !paymentId || !signature) {
      return redirect(siteUrl, "/payment/failure", orderId);
    }

    const { secret } = razorpayCredentials();
    const expected = razorpaySignature(`${orderId}|${paymentId}`, secret);
    if (!signaturesMatch(expected, signature)) {
      console.warn("Razorpay callback signature mismatch");
      return redirect(siteUrl, "/payment/failure", orderId);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("user_id, plan_id, amount_paise, currency, status")
      .eq("provider_order_id", orderId)
      .maybeSingle();
    if (orderErr || !order) return redirect(siteUrl, "/payment/failure", orderId);

    const paymentResponse = await fetch(`${razorpayBaseUrl}/payments/${paymentId}`, {
      headers: razorpayHeaders(),
    });
    if (!paymentResponse.ok) {
      console.error("Razorpay callback payment fetch failed:", paymentResponse.status);
      return redirect(siteUrl, "/payment/failure", orderId);
    }

    const payment = await paymentResponse.json() as {
      order_id?: string;
      amount?: number;
      currency?: string;
      status?: string;
    };
    if (
      payment.order_id !== orderId ||
      payment.amount !== order.amount_paise ||
      payment.currency !== order.currency ||
      payment.status !== "captured"
    ) {
      return redirect(siteUrl, "/payment/failure", orderId);
    }

    const now = new Date().toISOString();
    const { data: paidOrder, error: updateErr } = await supabase
      .from("orders")
      .update({
        provider_payment_id: paymentId,
        status: "paid",
        paid_at: now,
        updated_at: now,
      })
      .eq("provider_order_id", orderId)
      .in("status", ["created", "failed"])
      .select("user_id, plan_id, amount_paise")
      .maybeSingle();

    if (updateErr) {
      console.error("Razorpay callback order update failed:", updateErr);
      return new Response("Could not update order", { status: 500 });
    }

    if (paidOrder) {
      const { data: userData } = await supabase.auth.admin.getUserById(paidOrder.user_id);
      const user = userData.user;
      if (user?.email) {
        try {
          await sendPaymentEmails({
            customerName: (user.user_metadata?.full_name as string | undefined) ?? "Customer",
            customerEmail: user.email,
            customerPhone: (user.user_metadata?.phone as string | undefined) ?? "",
            planName: paidOrder.plan_id,
            amountInr: paidOrder.amount_paise / 100,
            orderId,
            paymentId,
          });
        } catch (emailError) {
          console.error("Payment email notification failed:", emailError);
        }
      }
    }

    return redirect(siteUrl, "/payment/success", orderId);
  } catch (error) {
    console.error("razorpay callback error:", error);
    return redirect(siteUrl, "/payment/failure");
  }
});
