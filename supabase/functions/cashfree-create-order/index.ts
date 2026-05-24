/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handlePreflight, jsonResponse } from "../_shared/cors.ts";
import { getServerPlan } from "../_shared/plans.ts";
import { cashfreeBaseUrl, cashfreeEnv, cashfreeHeaders } from "../_shared/cashfree.ts";

interface CreateOrderRequest {
  planId: string;
}

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    // 1. Authenticate the caller — extract Supabase JWT from header.
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

    // 2. Validate plan and derive amount SERVER-SIDE. Never trust the client.
    const body = (await req.json()) as CreateOrderRequest;
    const plan = getServerPlan(body.planId);
    if (!plan) {
      return jsonResponse({ error: "Unknown plan" }, 400);
    }

    // Cashfree amounts are in rupees (major units), not paise.
    const amountRupees = plan.priceInr;

    // Cashfree validates customer_phone (expects a 10-digit number). Signup
    // collects it into user_metadata.phone, but the raw value may carry a
    // country code, spaces or "+", so normalise to digits and take the last
    // 10. Fall back to a placeholder so order creation never hard-fails.
    const rawPhone = (user.user_metadata?.phone as string | undefined) ?? "";
    const digits = rawPhone.replace(/\D/g, "");
    const customerPhone = digits.length >= 10 ? digits.slice(-10) : "9999999999";
    const customerName = (user.user_metadata?.full_name as string | undefined) ?? "Customer";

    // Our own order id (also the Cashfree order_id). Must be unique.
    const orderId = `cf_${user.id.slice(0, 8)}_${Date.now()}`;

    let headers: Record<string, string>;
    try {
      headers = cashfreeHeaders();
    } catch {
      console.error("Cashfree keys not configured");
      return jsonResponse({ error: "Payment provider not configured" }, 500);
    }

    // return_url is used when Cashfree falls back to a full-page redirect.
    // {order_id} is substituted by Cashfree.
    const siteUrl = Deno.env.get("SITE_URL") ?? "";
    const returnUrl = siteUrl
      ? `${siteUrl.replace(/\/$/, "")}/payment/success?order={order_id}`
      : undefined;

    // 3. Create the order on Cashfree.
    const cfRes = await fetch(`${cashfreeBaseUrl()}/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amountRupees,
        order_currency: "INR",
        customer_details: {
          customer_id: user.id,
          customer_email: user.email ?? "",
          customer_phone: customerPhone,
          customer_name: customerName,
        },
        order_meta: returnUrl ? { return_url: returnUrl } : undefined,
        order_note: `${plan.name} plan`,
        order_tags: { user_id: user.id, plan_id: plan.id },
      }),
    });

    if (!cfRes.ok) {
      const text = await cfRes.text();
      console.error("Cashfree order create failed:", cfRes.status, text);
      return jsonResponse({ error: "Failed to create payment order" }, 502);
    }

    const cfOrder = await cfRes.json() as {
      order_id: string;
      payment_session_id: string;
      order_status: string;
    };

    if (!cfOrder.payment_session_id) {
      console.error("Cashfree returned no payment_session_id:", cfOrder);
      return jsonResponse({ error: "Failed to start payment" }, 502);
    }

    // 4. Persist the order BEFORE returning to the client. We keep the
    // amount in paise in our DB for consistency with existing rows.
    const { error: insertErr } = await supabase.from("orders").insert({
      user_id: user.id,
      plan_id: plan.id,
      amount_paise: amountRupees * 100,
      currency: "INR",
      provider: "cashfree",
      provider_order_id: cfOrder.order_id,
      status: "created",
      notes: { plan_name: plan.name },
    });

    if (insertErr) {
      console.error("DB insert failed:", insertErr);
      return jsonResponse({ error: "Could not record order" }, 500);
    }

    // 5. Return the session id the browser SDK needs.
    return jsonResponse({
      orderId: cfOrder.order_id,
      paymentSessionId: cfOrder.payment_session_id,
      mode: cashfreeEnv(),
      planName: plan.name,
    });
  } catch (err) {
    console.error("cashfree create-order error:", err);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
