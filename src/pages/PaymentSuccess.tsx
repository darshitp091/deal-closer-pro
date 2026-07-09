import { useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

interface OrderRow {
  id: string;
  plan_id: string;
  amount_paise: number;
  status: string;
  created_at: string;
}

// Cashfree redirects the customer back to the return_url for EVERY outcome —
// success, failure, and cancellation alike. So this page must verify the real
// status server-side and render accordingly; it must never assume success.
type Outcome = "loading" | "paid" | "failed" | "pending" | "unknown";

function outcomeFromStatus(status: string | undefined): Outcome {
  if (status === "paid") return "paid";
  if (status === "failed") return "failed";
  // "created" (Cashfree ACTIVE) means the customer cancelled or didn't finish —
  // no money was taken and they can retry.
  if (status === "created") return "pending";
  return "unknown";
}

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const orderId = params.get("order");
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [outcome, setOutcome] = useState<Outcome>("loading");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !orderId) {
      setOutcome("unknown");
      return;
    }

    const fetchOrder = async () => {
      const select = "id, plan_id, amount_paise, status, created_at";
      const { data } = await supabase
        .from("orders")
        .select(select)
        .eq("provider_order_id", orderId)
        .maybeSingle();

      // Redirect case: the customer usually lands here before the webhook
      // fires, so the row is still "created". Ask the server to confirm the
      // real status with Cashfree (source of truth) and flip the row, then
      // re-read it so the page reflects the verified outcome.
      let row = data as OrderRow | null;
      if (row && row.status !== "paid") {
        await supabase.functions.invoke("cashfree-verify-payment", {
          body: { orderId },
        });
        const { data: updated } = await supabase
          .from("orders")
          .select(select)
          .eq("provider_order_id", orderId)
          .maybeSingle();
        row = (updated as OrderRow | null) ?? row;
      }

      setOrder(row);
      setOutcome(row ? outcomeFromStatus(row.status) : "unknown");
    };

    fetchOrder();
  }, [authLoading, user, orderId]);

  const view = VIEWS[outcome];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center space-y-4">
        {view.icon}
        <h1 className="font-display text-2xl font-bold">{view.title}</h1>
        <p className="text-sm text-muted-foreground">{view.body}</p>

        {outcome === "paid" && order && (
          <div className="text-sm bg-secondary/50 rounded-md p-4 space-y-1 text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium capitalize">{order.plan_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                ₹{(order.amount_paise / 100).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{order.status}</span>
            </div>
          </div>
        )}

        {(outcome === "unknown" || outcome === "pending" || outcome === "failed") &&
          orderId && (
            <p className="text-xs text-muted-foreground">
              Reference: <span className="font-mono">{orderId}</span>
            </p>
          )}

        {outcome === "paid" ? (
          <Button variant="gold" asChild className="w-full">
            <Link to="/">
              <Home size={16} /> Back to home
            </Link>
          </Button>
        ) : outcome === "loading" ? null : (
          <div className="flex gap-2">
            <Button variant="goldOutline" asChild className="flex-1">
              <Link to="/#pricing">Try again</Link>
            </Button>
            <Button variant="gold" asChild className="flex-1">
              <Link to="/">
                <Home size={16} /> Home
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const VIEWS: Record<Outcome, { icon: ReactNode; title: string; body: string }> = {
  loading: {
    icon: <Loader2 size={56} className="text-muted-foreground mx-auto animate-spin" />,
    title: "Confirming your payment…",
    body: "Please wait while we verify your payment. This only takes a moment.",
  },
  paid: {
    icon: <CheckCircle2 size={56} className="text-primary mx-auto" />,
    title: "Payment received",
    body: "Thank you. Our team will reach out within 12 hours to start working on your account.",
  },
  pending: {
    icon: <Clock size={56} className="text-muted-foreground mx-auto" />,
    title: "Payment not completed",
    body: "It looks like the payment was cancelled or not finished. No money has been deducted — you can try again whenever you're ready.",
  },
  failed: {
    icon: <XCircle size={56} className="text-destructive mx-auto" />,
    title: "Payment didn't go through",
    body: "No money has been deducted. You can try again, or contact support if you were charged.",
  },
  unknown: {
    icon: <Clock size={56} className="text-muted-foreground mx-auto" />,
    title: "We couldn't confirm this payment",
    body: "If money was deducted it will be reflected shortly. Please contact support with the reference below if you don't receive a confirmation.",
  },
};
