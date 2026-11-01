/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handlePreflight, jsonResponse } from "../_shared/cors.ts";
import { getServerPlan } from "../_shared/plans.ts";
import {
  razorpayBaseUrl,
  razorpayCredentials,
  razorpayHeaders,
} from "../_shared/razorpay.ts";

interface CreateOrderRequest {
  planId: string;
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

    const { planId } = await req.json() as CreateOrderRequest;
    const plan = getServerPlan(planId);
    if (!plan) return jsonResponse({ error: "Unknown plan" }, 400);

    const { keyId, secret } = razorpayCredentials();
    const callbackBaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
    if (!callbackBaseUrl) {
      return jsonResponse({ error: "Supabase URL is not configured" }, 500);
    }
    const amountPaise = plan.priceInr * 100;
    const referenceId = `ishwari_${user.id.slice(0, 8)}_${Date.now()}`;
    const razorpayResponse = await fetch(`${razorpayBaseUrl}/payment_links`, {
      method: "POST",
      headers: {
        ...razorpayHeaders(),
        Authorization: `Basic ${btoa(`${keyId}:${secret}`)}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        reference_id: referenceId,
        description: `${plan.name} plan`,
        customer: {
          name: (user.user_metadata?.full_name as string | undefined) ?? "Customer",
          email: user.email ?? "",
          contact: (user.user_metadata?.phone as string | undefined) ?? "",
        },
        notify: { email: false, sms: false },
        reminder_enable: false,
        callback_url: `${callbackBaseUrl}/functions/v1/razorpay-callback?reference_id=${encodeURIComponent(referenceId)}`,
        callback_method: "get",
      }),
    });

    if (!razorpayResponse.ok) {
      console.error("Razorpay order create failed:", razorpayResponse.status, await razorpayResponse.text());
      return jsonResponse({ error: "Failed to create payment order" }, 502);
    }

    const paymentLink = await razorpayResponse.json() as {
      id?: string;
      amount?: number;
      short_url?: string;
    };
    if (!paymentLink.id || paymentLink.amount !== amountPaise || !paymentLink.short_url) {
      console.error("Invalid Razorpay payment link response:", paymentLink);
      return jsonResponse({ error: "Failed to start payment" }, 502);
    }

    const { error: insertErr } = await supabase.from("orders").insert({
      user_id: user.id,
      plan_id: plan.id,
      amount_paise: amountPaise,
      currency: "INR",
      provider: "razorpay",
      provider_order_id: paymentLink.id,
      status: "created",
      notes: { plan_name: plan.name, reference_id: referenceId },
    });
    if (insertErr) {
      console.error("DB insert failed:", insertErr);
      return jsonResponse({ error: "Could not record order" }, 500);
    }

    return jsonResponse({
      orderId: paymentLink.id,
      paymentLinkUrl: paymentLink.short_url,
    });
  } catch (err) {
    console.error("razorpay create-order error:", err);
    return jsonResponse({ error: "Payment provider not configured or unavailable" }, 500);
  }
});
