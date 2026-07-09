/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handlePreflight, jsonResponse } from "../_shared/cors.ts";
import { cashfreeBaseUrl, cashfreeHeaders } from "../_shared/cashfree.ts";

interface VerifyRequest {
  orderId: string;
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

    const { orderId } = (await req.json()) as VerifyRequest;
    if (!orderId) {
      return jsonResponse({ error: "Missing orderId" }, 400);
    }

    let headers: Record<string, string>;
    try {
      headers = cashfreeHeaders();
    } catch {
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    // Source of truth: fetch the order from Cashfree. Never trust the
    // client's claim that payment succeeded.
    const cfRes = await fetch(`${cashfreeBaseUrl()}/orders/${orderId}`, {
      method: "GET",
      headers,
    });

    if (!cfRes.ok) {
      const text = await cfRes.text();
      console.error("Cashfree order fetch failed:", cfRes.status, text);
      return jsonResponse({ error: "Could not verify payment" }, 502);
    }

    const cfOrder = await cfRes.json() as { order_status: string };
    const paid = cfOrder.order_status === "PAID";

    if (!paid) {
      // ACTIVE means the customer hasn't finished (or simply closed the
      // checkout) — leave the order untouched so a retry or the webhook can
      // still complete it. Only terminal statuses are recorded as failed,
      // and never over a row the webhook already marked paid.
      const terminal = ["EXPIRED", "TERMINATED", "FAILED"];
      if (terminal.includes(cfOrder.order_status)) {
        await supabase
          .from("orders")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("provider_order_id", orderId)
          .eq("user_id", user.id)
          .in("status", ["created", "failed"]); // never over paid/refunded
      }

      return jsonResponse({ paid: false, status: cfOrder.order_status });
    }

    // Grab a payment id for our records (best-effort).
    let paymentId: string | null = null;
    try {
      const payRes = await fetch(
        `${cashfreeBaseUrl()}/orders/${orderId}/payments`,
        { method: "GET", headers },
      );
      if (payRes.ok) {
        const payments = await payRes.json() as Array<{
          cf_payment_id: string | number;
          payment_status: string;
        }>;
        const success = payments.find((p) => p.payment_status === "SUCCESS");
        if (success) paymentId = String(success.cf_payment_id);
      }
    } catch (e) {
      console.warn("Could not fetch payment id (non-fatal):", e);
    }

    // Idempotent: flips created → paid; a no-op if the webhook got there
    // first. Only set provider_payment_id when we actually found one, so we
    // never clobber an id the webhook already recorded.
    const update: Record<string, unknown> = {
      status: "paid",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (paymentId) update.provider_payment_id = paymentId;

    // Only advance a still-open order to paid. Never overwrite a row that is
    // already `paid` (avoids re-stamping paid_at) or — critically — `refunded`:
    // Cashfree keeps order_status = PAID even after a refund, so re-verifying a
    // refunded order (e.g. the customer reopens the old success link) must NOT
    // flip it back to paid.
    const { error: updErr } = await supabase
      .from("orders")
      .update(update)
      .eq("provider_order_id", orderId)
      .eq("user_id", user.id)
      .in("status", ["created", "failed"]);

    if (updErr) {
      console.error("Order update failed:", updErr);
      return jsonResponse({ error: "Could not update order" }, 500);
    }

    // Cashfree confirms payment. If no row matched the guard above it was
    // already paid or refunded — leave it as-is and still report paid.
    return jsonResponse({ paid: true, orderId });
  } catch (err) {
    console.error("cashfree verify-payment error:", err);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
