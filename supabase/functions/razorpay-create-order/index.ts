/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handlePreflight, jsonResponse } from "../_shared/cors.ts";
import { getServerPlan } from "../_shared/plans.ts";

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

    // 2. Validate plan and derive amount SERVER-SIDE.
    // Never trust a client-supplied amount.
    const body = (await req.json()) as CreateOrderRequest;
    const plan = getServerPlan(body.planId);
    if (!plan) {
      return jsonResponse({ error: "Unknown plan" }, 400);
    }

    const amountPaise = plan.priceInr * 100;

    // 3. Create order on Razorpay.
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) {
      console.error("Razorpay keys not configured");
      return jsonResponse({ error: "Payment provider not configured" }, 500);
    }

    const auth = btoa(`${keyId}:${keySecret}`);
    const receipt = `rcpt_${user.id.slice(0, 8)}_${Date.now()}`;

    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt,
        notes: {
          user_id: user.id,
          user_email: user.email ?? "",
          plan_id: plan.id,
        },
      }),
    });

    if (!rzpRes.ok) {
      const text = await rzpRes.text();
      console.error("Razorpay order create failed:", rzpRes.status, text);
      return jsonResponse(
        { error: "Failed to create payment order" },
        502,
      );
    }

    const rzpOrder = await rzpRes.json() as {
      id: string;
      amount: number;
      currency: string;
    };

    // 4. Persist a row in our orders table BEFORE returning to client.
    const { error: insertErr } = await supabase.from("orders").insert({
      user_id: user.id,
      plan_id: plan.id,
      amount_paise: amountPaise,
      currency: "INR",
      razorpay_order_id: rzpOrder.id,
      status: "created",
      notes: { receipt, plan_name: plan.name },
    });

    if (insertErr) {
      console.error("DB insert failed:", insertErr);
      return jsonResponse({ error: "Could not record order" }, 500);
    }

    // 5. Return to client. Note: keyId is the PUBLIC key — safe to expose.
    return jsonResponse({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId,
      planName: plan.name,
      userEmail: user.email,
      userName: user.user_metadata?.full_name ?? "",
      userPhone: user.user_metadata?.phone ?? "",
    });
  } catch (err) {
    console.error("create-order error:", err);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
