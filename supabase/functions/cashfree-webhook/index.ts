/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

// Called by Cashfree server-to-server, so it must be PUBLIC (no JWT).
// IMPORTANT: this requires `verify_jwt = false` for this function in
// supabase/config.toml, otherwise the gateway rejects it with 401.
//
// Cashfree signature scheme (API version 2023-08-01):
//   signature = base64( HMAC_SHA256( timestamp + rawBody, SECRET_KEY ) )
// with timestamp from the x-webhook-timestamp header.

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

interface CashfreeWebhookEvent {
  type: string;
  data: {
    order?: { order_id: string };
    payment?: { cf_payment_id: string | number; payment_status: string };
    refund?: { refund_status: string };
  };
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Cashfree signs with your Secret Key.
    const secret = Deno.env.get("CASHFREE_SECRET_KEY");
    if (!secret) {
      console.error("CASHFREE_SECRET_KEY not set");
      return new Response("Misconfigured", { status: 500 });
    }

    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    if (!signature || !timestamp) {
      return new Response("Missing signature", { status: 401 });
    }

    // CRITICAL: read the raw body. Signature is over (timestamp + rawBody).
    const rawBody = await req.text();
    const expected = createHmac("sha256", secret)
      .update(timestamp + rawBody)
      .digest("base64");

    if (!timingSafeEqual(expected, signature)) {
      console.warn("Cashfree webhook signature mismatch");
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(rawBody) as CashfreeWebhookEvent;
    const orderId = event.data.order?.order_id;
    const paymentId = event.data.payment?.cf_payment_id;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    switch (event.type) {
      case "PAYMENT_SUCCESS_WEBHOOK": {
        if (!orderId) break;
        // Idempotent — only flips non-paid rows to paid.
        await supabase
          .from("orders")
          .update({
            provider_payment_id: paymentId != null ? String(paymentId) : null,
            status: "paid",
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("provider_order_id", orderId)
          .neq("status", "paid");
        break;
      }

      case "PAYMENT_FAILED_WEBHOOK":
      case "PAYMENT_USER_DROPPED_WEBHOOK": {
        if (!orderId) break;
        await supabase
          .from("orders")
          .update({
            provider_payment_id: paymentId != null ? String(paymentId) : null,
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("provider_order_id", orderId)
          .neq("status", "paid"); // never overwrite a successful payment
        break;
      }

      case "REFUND_STATUS_WEBHOOK": {
        // Only mark refunded when Cashfree confirms the refund succeeded.
        const refundStatus = event.data.refund?.refund_status;
        if (!orderId || refundStatus !== "SUCCESS") break;
        await supabase
          .from("orders")
          .update({
            status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("provider_order_id", orderId)
          .eq("status", "paid"); // only refund rows that were actually paid
        break;
      }

      default:
        console.log("Unhandled Cashfree webhook type:", event.type);
    }

    // Always 2xx once the signature is valid — Cashfree retries non-2xx.
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("cashfree webhook error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
