/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handlePreflight, jsonResponse } from "../_shared/cors.ts";
import {
  razorpayBaseUrl,
  razorpayCredentials,
  razorpayHeaders,
  razorpaySignature,
  signaturesMatch,
} from "../_shared/razorpay.ts";
import { sendPaymentEmails } from "../_shared/payment-email.ts";

interface VerifyRequest {
  orderId: string;
  paymentId: string;
  signature: string;
}

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Missing Authorization header" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !user) return jsonResponse({ error: "Invalid session" }, 401);

    const body = await req.json() as VerifyRequest;
    if (!body.orderId || !body.paymentId || !body.signature) {
      return jsonResponse({ error: "Missing payment verification fields" }, 400);
    }

    const { secret } = razorpayCredentials();
    const expected = razorpaySignature(`${body.orderId}|${body.paymentId}`, secret);
    if (!signaturesMatch(expected, body.signature)) {
      return jsonResponse({ error: "Invalid payment signature" }, 400);
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("plan_id, amount_paise, currency, status")
      .eq("provider_order_id", body.orderId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (orderErr || !order) {
      return jsonResponse({ error: "Payment order not found" }, 404);
    }

    const paymentResponse = await fetch(`${razorpayBaseUrl}/payments/${body.paymentId}`, {
      headers: razorpayHeaders(),
    });
    if (!paymentResponse.ok) {
      console.error("Razorpay payment fetch failed:", paymentResponse.status, await paymentResponse.text());
      return jsonResponse({ error: "Could not verify payment" }, 502);
    }
    const payment = await paymentResponse.json() as {
      order_id?: string;
      amount?: number;
      currency?: string;
      status?: string;
    };
    if (
      payment.order_id !== body.orderId ||
      payment.amount !== order.amount_paise ||
      payment.currency !== order.currency ||
      payment.status !== "captured"
    ) {
      return jsonResponse({ paid: false, status: payment.status ?? "unknown" });
    }

    const now = new Date().toISOString();
    const { data: updatedOrder, error: updateErr } = await supabase
      .from("orders")
      .update({
        provider_payment_id: body.paymentId,
        status: "paid",
        paid_at: now,
        updated_at: now,
      })
      .eq("provider_order_id", body.orderId)
      .eq("user_id", user.id)
      .in("status", ["created", "failed"])
      .select("plan_id, amount_paise, status")
      .maybeSingle();

    if (updateErr) {
      console.error("Order update failed:", updateErr);
      return jsonResponse({ error: "Could not update order" }, 500);
    }

    if (updatedOrder) {
      try {
        await sendPaymentEmails({
          customerName: (user.user_metadata?.full_name as string | undefined) ?? "Customer",
          customerEmail: user.email ?? "",
          customerPhone: (user.user_metadata?.phone as string | undefined) ?? "",
          planName: updatedOrder.plan_id,
          amountInr: updatedOrder.amount_paise / 100,
          orderId: body.orderId,
          paymentId: body.paymentId,
        });
      } catch (emailError) {
        console.error("Payment email notification failed:", emailError);
      }
    }

    return jsonResponse({ paid: true, orderId: body.orderId });
  } catch (err) {
    console.error("razorpay verify-payment error:", err);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
