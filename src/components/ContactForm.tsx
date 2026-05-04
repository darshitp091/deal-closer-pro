import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, CheckCircle, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  selectedPlan: string;
}

const planAmounts: Record<string, number> = {
  "Starter – ₹2,000/year": 2000,
  "Growth – ₹3,000/year": 3000,
};

const ContactForm = ({ open, onClose, selectedPlan }: ContactFormProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const leadData = {
      name: (formData.get("name") as string).trim(),
      company_name: (formData.get("company") as string).trim(),
      email: (formData.get("email") as string).trim(),
      phone: (formData.get("phone") as string).trim(),
      product_type: (formData.get("product") as string).trim(),
      target_market: (formData.get("market") as string).trim(),
      selected_plan: selectedPlan,
    };

    const amount = planAmounts[selectedPlan] || 2000;

    try {
      // Try to create payment order via edge function
      const { data, error } = await supabase.functions.invoke("create-order", {
        body: {
          ...leadData,
          plan: selectedPlan,
          amount,
        },
      });

      if (error || !data?.payment_session_id) {
        // Fallback: just store lead if payment isn't configured yet
        console.log("Payment not configured, storing lead directly:", error);
        const { error: leadError } = await supabase.from("leads").insert(leadData);
        if (leadError) {
          toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
          setLoading(false);
          return;
        }
        setLoading(false);
        setSubmitted(true);
        return;
      }

      // If Cashfree is configured, load checkout
      if (typeof window !== "undefined" && (window as any).Cashfree) {
        const cashfree = await (window as any).Cashfree({ mode: "sandbox" });
        cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_self",
        });
      } else {
        // If Cashfree SDK not loaded, store lead and show success
        await supabase.from("leads").insert(leadData);
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Error:", err);
      // Fallback: store lead directly
      await supabase.from("leads").insert(leadData);
      setSubmitted(true);
    }

    setLoading(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setSubmitted(false), 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-xl p-8 w-full max-w-md shadow-card relative"
          >
            <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>

            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle size={48} className="text-primary mx-auto" />
                <h3 className="font-display text-xl font-semibold">Thank You!</h3>
                <p className="text-sm text-muted-foreground font-body">
                  Our team will contact you within 12 hours to get started on your deal.
                </p>
                <Button variant="gold" onClick={handleClose}>Close</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard size={20} className="text-primary" />
                  <h3 className="font-display text-xl font-semibold">Get Started</h3>
                </div>
                <p className="text-sm text-muted-foreground font-body mb-6">
                  Selected plan: <span className="text-primary font-medium">{selectedPlan}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input name="name" placeholder="Your Name" required className="bg-background border-border" />
                  <Input name="company" placeholder="Company Name" required className="bg-background border-border" />
                  <Input name="email" type="email" placeholder="Email Address" required className="bg-background border-border" />
                  <Input name="phone" type="tel" placeholder="Phone Number" required className="bg-background border-border" />
                  <Input name="address" placeholder="Business Address" required className="bg-background border-border" />
                  <Input name="product" placeholder="Product Type (e.g. Textiles, Electronics)" required className="bg-background border-border" />
                  <Input name="market" placeholder="Target Market / Region" required className="bg-background border-border" />

                  <Button variant="gold" size="lg" className="w-full" type="submit" disabled={loading}>
                    {loading ? "Processing..." : <>Proceed to Payment <Send size={16} /></>}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center font-body">
                    🔒 Secure payment via Cashfree • 100% Money-Back Guarantee
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactForm;
