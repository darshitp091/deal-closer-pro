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
import {
  isRazorpayLoaded,
  openRazorpayCheckout,
  type RazorpayHandlerResponse,
} from "@/lib/razorpay";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  planId: PlanId | null;
}

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planName: string;
  userEmail: string | null;
  userName: string;
  userPhone: string;
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

    if (!isRazorpayLoaded()) {
      toast({
        title: "Payment unavailable",
        description: "Razorpay couldn't load. Refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Server creates the Razorpay order and persists our DB row.
      const { data, error } = await supabase.functions.invoke<CreateOrderResponse>(
        "razorpay-create-order",
        { body: { planId: plan.id } },
      );

      if (error || !data) {
        throw new Error(error?.message ?? "Could not start payment");
      }

      // 2. Open Razorpay Checkout.
      openRazorpayCheckout(
        {
          key: data.keyId,
          order_id: data.orderId,
          amount: data.amount,
          currency: data.currency,
          name: "Ishwari Socials",
          description: `${data.planName} plan — ${plan.deals} guaranteed deal${plan.deals > 1 ? "s" : ""}`,
          prefill: {
            name: data.userName,
            email: data.userEmail ?? undefined,
            contact: data.userPhone,
          },
          notes: { plan_id: plan.id },
          theme: { color: "#2563eb" },
          handler: async (resp: RazorpayHandlerResponse) => {
            // 3. Server verifies signature and marks order paid.
            const { error: verifyErr } = await supabase.functions.invoke(
              "razorpay-verify-payment",
              { body: resp },
            );

            if (verifyErr) {
              toast({
                title: "Verification failed",
                description:
                  "Your payment may have gone through but we couldn't confirm it. Contact support with order " +
                  resp.razorpay_order_id,
                variant: "destructive",
              });
              navigate(`/payment/failure?order=${resp.razorpay_order_id}`);
              return;
            }

            onClose();
            navigate(`/payment/success?order=${resp.razorpay_order_id}`);
          },
          modal: {
            ondismiss: () => setLoading(false),
          },
        },
        (resp) => {
          console.warn("Razorpay payment failed", resp);
          toast({
            title: "Payment failed",
            description: "Please try again or use a different method.",
            variant: "destructive",
          });
          setLoading(false);
        },
      );
    } catch (err) {
      toast({
        title: "Payment error",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      setLoading(false);
    }
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
