/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

// This endpoint is called by Razorpay (server → server), not by the
// browser — it must be PUBLIC (no JWT). Auth comes from the
// X-Razorpay-Signature header signed with the webhook secret.

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        status: string;
        amount: number;
        method?: string;
      };
    };
    order?: {
      entity: { id: string; status: string };
    };
  };
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not set");
      return new Response("Misconfigured", { status: 500 });
    }

    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return new Response("Missing signature", { status: 401 });
    }

    // CRITICAL: read the raw body for HMAC. Do NOT JSON.parse before verifying.
    const rawBody = await req.text();
    const expected = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (!timingSafeEqual(expected, signature)) {
      console.warn("Webhook signature mismatch");
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(rawBody) as RazorpayWebhookEvent;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    switch (event.event) {
      case "payment.captured": {
        const p = event.payload.payment?.entity;
        if (!p) break;
        // Idempotent — only flips created → paid. If verify-payment already
        // marked it paid, this is a harmless no-op.
        await supabase
          .from("orders")
          .update({
            razorpay_payment_id: p.id,
            status: "paid",
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", p.order_id)
          .neq("status", "paid");
        break;
      }

      case "payment.failed": {
        const p = event.payload.payment?.entity;
        if (!p) break;
        await supabase
          .from("orders")
          .update({
            razorpay_payment_id: p.id,
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", p.order_id)
          .neq("status", "paid"); // don't overwrite a successful payment
        break;
      }

      // Other events (refund.created etc.) can be handled here later.
      default:
        console.log("Unhandled webhook event:", event.event);
    }

    // Always 2xx if signature was valid — Razorpay retries non-2xx.
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("webhook error:", err);
    // Return 500 so Razorpay retries.
    return new Response("Internal error", { status: 500 });
  }
});
