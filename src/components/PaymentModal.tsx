import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { getPlan, type PlanId } from "@/lib/plans";
import { useAuth } from "@/lib/auth";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  planId: PlanId | null;
}

interface RazorpayCreateOrderResponse {
  orderId: string;
  paymentLinkUrl: string;
}

export default function PaymentModal({
  open,
  onClose,
  planId,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const plan = planId ? getPlan(planId) : null;

  const handlePay = async () => {
    if (!plan) return;
    setLoading(true);
    try {
      await payWithRazorpay();
    } catch (err) {
      toast({
        title: "Payment error",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const payWithRazorpay = async () => {
    if (!plan) return;

    // 1. Server creates the Razorpay order and persists our DB row.
    const { data, error } =
      await supabase.functions.invoke<RazorpayCreateOrderResponse>(
        "razorpay-create-order",
        { body: { planId: plan.id } },
      );

    if (error || !data) {
      throw new Error(error?.message ?? "Could not start payment");
    }

    onClose();
    window.location.assign(data.paymentLinkUrl);
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !loading && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm purchase — {plan.name}</DialogTitle>
          <DialogDescription>
            {plan.deals} guaranteed deal{plan.deals > 1 ? "s" : ""} ·
            100% money-back guarantee
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">{plan.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Term</span>
            <span className="font-medium">12 months</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-border">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">
              ₹{plan.priceInr.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handlePay} disabled={loading}>
            {loading ? "Opening Razorpay..." : `Pay ₹${plan.priceInr.toLocaleString("en-IN")}`}
          </Button>
        </DialogFooter>

        <p className="text-xs text-muted-foreground text-center">
          🔒 Secured by Razorpay
        </p>
      </DialogContent>
    </Dialog>
  );
}
