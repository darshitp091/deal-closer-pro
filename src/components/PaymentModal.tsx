import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { openCashfreeCheckout } from "@/lib/cashfree";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  planId: PlanId | null;
}

interface CashfreeCreateOrderResponse {
  orderId: string;
  paymentSessionId: string;
  mode: "sandbox" | "production";
  planName: string;
}

export default function PaymentModal({
  open,
  onClose,
  planId,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const plan = planId ? getPlan(planId) : null;

  const handlePay = async () => {
    if (!plan) return;
    setLoading(true);
    try {
      await payWithCashfree();
    } catch (err) {
      toast({
        title: "Payment error",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const payWithCashfree = async () => {
    if (!plan) return;

    // 1. Server creates the Cashfree order and persists our DB row.
    const { data, error } =
      await supabase.functions.invoke<CashfreeCreateOrderResponse>(
        "cashfree-create-order",
        { body: { planId: plan.id } },
      );

    if (error || !data) {
      throw new Error(error?.message ?? "Could not start payment");
    }

    // 2. Open Cashfree Checkout (modal). Resolves when the modal closes.
    const result = await openCashfreeCheckout(data.paymentSessionId, data.mode);

    if (result.error) {
      toast({
        title: "Payment failed",
        description:
          result.error.message ?? "Please try again or use a different method.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Cashfree fell back to a full-page redirect (return_url handles success).
    if (result.redirect) {
      return;
    }

    // 3. Server confirms payment by querying Cashfree (never trust the client).
    const { data: verify, error: verifyErr } =
      await supabase.functions.invoke<{ paid: boolean; status?: string }>(
        "cashfree-verify-payment",
        { body: { orderId: data.orderId } },
      );

    if (verify?.paid) {
      onClose();
      navigate(`/payment/success?order=${data.orderId}`);
      return;
    }

    // Network/server error during verify — payment may have gone through.
    // The webhook will update the order. Don't navigate to failure.
    if (verifyErr) {
      toast({
        title: "Could not confirm payment",
        description:
          "If money was deducted, it will be reflected shortly. Contact support with reference: " +
          data.orderId,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Not paid yet. If order is still open (user closed modal without
    // finishing), let them retry. Only terminal statuses go to failure.
    const terminal = ["EXPIRED", "TERMINATED", "FAILED"];
    if (verify?.status && !terminal.includes(verify.status)) {
      toast({
        title: "Payment not completed",
        description: "You can try again whenever you're ready.",
      });
      setLoading(false);
      return;
    }

    navigate(`/payment/failure?order=${data.orderId}`);
    setLoading(false);
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
            {loading ? "Opening Cashfree..." : `Pay ₹${plan.priceInr.toLocaleString("en-IN")}`}
          </Button>
        </DialogFooter>

        <p className="text-xs text-muted-foreground text-center">
          🔒 Secured by Cashfree
        </p>
      </DialogContent>
    </Dialog>
  );
}
