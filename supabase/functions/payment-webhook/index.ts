/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // 🔓 Allow only POST
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // 📦 Get raw + parsed body
    const rawBody = await req.text();
    console.log("RAW BODY:", rawBody);

    const body = JSON.parse(rawBody);
    console.log("PARSED BODY:", body);

    // 🎯 Extract important data
    const orderId = body?.data?.order?.order_id;
    const paymentStatus = body?.data?.payment?.payment_status;

    console.log("ORDER:", orderId);
    console.log("STATUS:", paymentStatus);

    if (!orderId) {
      return new Response("Missing order id", { status: 400 });
    }

    // 🧠 Connect Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // 🔴 IMPORTANT
    );

    // 🔍 Check if already exists (avoid duplicates)
    const { data: existing } = await supabase
      .from("purchases")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existing) {
      console.log("⚠️ Already processed:", orderId);
      return new Response("Already processed", { status: 200 });
    }

    // ✅ Only save successful payments
    if (paymentStatus === "SUCCESS") {
      console.log("✅ PAYMENT SUCCESS");

      await supabase.from("purchases").insert({
        order_id: orderId,
        status: "paid",
      });
    } else {
      console.log("❌ PAYMENT FAILED");
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.log("🔥 WEBHOOK ERROR:", err);
    return new Response("ERROR", { status: 500 });
  }
});