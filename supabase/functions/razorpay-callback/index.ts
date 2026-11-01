/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendPaymentEmails } from "../_shared/payment-email.ts";
import {
  razorpayBaseUrl,
  razorpayHeaders,
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
    if (req.method !== "GET") return redirect(siteUrl, "/payment/failure");

    const url = new URL(req.url);
    const paymentLinkId = url.searchParams.get("razorpay_payment_link_id");
    const referenceId = url.searchParams.get("razorpay_payment_link_reference_id") ??
      url.searchParams.get("reference_id");
    if (!paymentLinkId || !referenceId) {
      return redirect(siteUrl, "/payment/failure");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("user_id, provider_order_id, plan_id, amount_paise, currency, status, notes")
      .eq("provider_order_id", paymentLinkId)
      .eq("notes->>reference_id", referenceId)
      .maybeSingle();
    if (orderErr || !order) return redirect(siteUrl, "/payment/failure");

    const paymentLinkResponse = await fetch(
      `${razorpayBaseUrl}/payment_links/${encodeURIComponent(paymentLinkId)}`,
      { headers: razorpayHeaders() },
    );
    if (!paymentLinkResponse.ok) {
      console.error("Razorpay payment link fetch failed:", paymentLinkResponse.status);
      return redirect(siteUrl, "/payment/failure", paymentLinkId);
    }

    const paymentLink = await paymentLinkResponse.json() as {
      id?: string;
      amount?: number;
      currency?: string;
      status?: string;
      payments?: { items?: Array<{ id?: string; status?: string }> };
    };
    const payment = paymentLink.payments?.items?.find((item) => item.status === "captured");
    if (
      paymentLink.id !== paymentLinkId ||
      paymentLink.amount !== order.amount_paise ||
      paymentLink.currency !== order.currency ||
      paymentLink.status !== "paid" ||
      !payment?.id
    ) {
      return redirect(siteUrl, "/payment/failure", paymentLinkId);
    }

    const now = new Date().toISOString();
    const { data: paidOrder, error: updateErr } = await supabase
      .from("orders")
      .update({
        provider_payment_id: payment.id,
        status: "paid",
        paid_at: now,
        updated_at: now,
      })
      .eq("provider_order_id", paymentLinkId)
      .in("status", ["created", "failed"])
      .select("user_id, plan_id, amount_paise")
      .maybeSingle();
    if (updateErr) {
      console.error("Payment link order update failed:", updateErr);
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
            orderId: paymentLinkId,
            paymentId: payment.id,
          });
        } catch (emailError) {
          console.error("Payment email notification failed:", emailError);
        }
      }
    }

    return redirect(siteUrl, "/payment/success", paymentLinkId);
  } catch (error) {
    console.error("razorpay payment link callback error:", error);
    return redirect(siteUrl, "/payment/failure");
  }
});
