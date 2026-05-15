/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";
import { handlePreflight, jsonResponse } from "../_shared/cors.ts";

interface VerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Constant-time string compare to avoid timing attacks.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing Authorization header" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (userErr || !user) {
      return jsonResponse({ error: "Invalid session" }, 401);
    }

    const body = (await req.json()) as VerifyRequest;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return jsonResponse({ error: "Missing payment fields" }, 400);
    }

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    // Razorpay's contract: signature = HMAC_SHA256(order_id|payment_id, key_secret)
    const expected = createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!timingSafeEqual(expected, razorpay_signature)) {
      console.warn("Signature mismatch for order", razorpay_order_id);
      // Mark the order as failed so it isn't left dangling.
      await supabase
        .from("orders")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("razorpay_order_id", razorpay_order_id)
        .eq("user_id", user.id);

      return jsonResponse({ error: "Signature verification failed" }, 400);
    }

    // Signature valid → mark as paid. Idempotent: if already paid, this is a no-op.
    const { data: order, error: updErr } = await supabase
      .from("orders")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "paid",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updErr || !order) {
      console.error("Order update failed:", updErr);
      return jsonResponse({ error: "Order not found" }, 404);
    }

    return jsonResponse({ success: true, orderId: order.id });
  } catch (err) {
    console.error("verify-payment error:", err);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
