import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Home } from "lucide-react";
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

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const orderId = params.get("order");
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !orderId) {
      setLoading(false);
      return;
    }
    supabase
      .from("orders")
      .select("id, plan_id, amount_paise, status, created_at")
      .eq("razorpay_order_id", orderId)
      .single()
      .then(({ data }) => {
        setOrder(data as OrderRow | null);
        setLoading(false);
      });
  }, [authLoading, user, orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center space-y-4">
        <CheckCircle2 size={56} className="text-primary mx-auto" />
        <h1 className="font-display text-2xl font-bold">Payment received</h1>
        <p className="text-sm text-muted-foreground">
          Thank you. Our team will reach out within 12 hours to start working on your account.
        </p>

        {loading ? (
          <p className="text-xs text-muted-foreground">Loading order details…</p>
        ) : order ? (
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
        ) : (
          <p className="text-xs text-muted-foreground">
            Order reference: {orderId ?? "—"}
          </p>
        )}

        <Button variant="gold" asChild className="w-full">
          <Link to="/">
            <Home size={16} /> Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}
