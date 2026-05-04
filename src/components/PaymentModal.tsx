import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { load } from "@cashfreepayments/cashfree-js";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  plan: string;
  userEmail: string;
  userName: string;
  userId: string;
}

const PLAN_PRICES: Record<string, number> = {
  Starter: 2000,
  Growth: 3000,
};

const PaymentModal = ({
  open,
  onClose,
  plan,
  userEmail,
  userName,
  userId,
}: any) => {
  const [loading, setLoading] = useState(false);

  const price = PLAN_PRICES[plan] || 4999;

  if (!open) return null;
  const handlePayment = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-cashfree-order", {
        body: { plan, amount: price, userId, userEmail, userName },
      });

      console.log("FUNCTION RESPONSE:", data);
      console.log("FUNCTION ERROR:", error);

      if (error || !data?.payment_session_id) {
        console.log("FULL BACKEND RESPONSE:", data);
        throw new Error(data?.error || "Order creation failed");
      }

      const cashfree = await load({
        mode:
          import.meta.env.VITE_CASHFREE_MODE === "production"
            ? "production"
            : "sandbox",
      });

      const result = await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal",

      });
      if (!data.payment_session_id) {
        console.error("Session missing");
        return;
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentDetails) {
        // ✅ Only now mark as success
        await supabase.from("purchases").insert({
          order_id: data.order_id,
          user_id: userId,
          plan,
          amount: price,
          status: "paid",
        });

        toast({
          title: "Payment successful",
          description: `You bought ${plan}`,
        });

        onClose();
      }

    } catch (err: any) {
      toast({
        title: "Payment failed",
        description: err.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy {plan}</DialogTitle>
        </DialogHeader>

        <p>Amount: ₹{price}</p>

        <button onClick={handlePayment} disabled={loading}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;