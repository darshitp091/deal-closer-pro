import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProcessSection from "@/components/ProcessSection";
import TrustSection from "@/components/TrustSection";
import AboutSection from "@/components/AboutSection";
import PricingSection from "@/components/PricingSection";
import PolicyHighlights from "@/components/PolicyHighlights";
import Chatbot from "@/components/Chatbot";
import Footer from "@/components/Footer";
import PaymentModal from "@/components/PaymentModal";

import { useAuth } from "@/lib/auth";
import type { PlanId } from "@/lib/plans";

const PENDING_PLAN_KEY = "pendingPlanId";

export default function Index() {
  const { user, loading: authLoading, openAuth } = useAuth();
  const [paymentPlan, setPaymentPlan] = useState<PlanId | null>(null);

  // After a Google OAuth redirect the page reloads and the in-memory callback
  // is gone. If the user was mid-purchase, sessionStorage holds the planId —
  // restore it once the session is confirmed.
  useEffect(() => {
    if (authLoading || !user) return;
    const pending = sessionStorage.getItem(PENDING_PLAN_KEY) as PlanId | null;
    if (pending) {
      sessionStorage.removeItem(PENDING_PLAN_KEY);
      setPaymentPlan(pending);
    }
  }, [user, authLoading]);

  const handleBuy = (planId: PlanId) => {
    if (!user) {
      // Persist planId so the Google OAuth redirect path can recover it.
      sessionStorage.setItem(PENDING_PLAN_KEY, planId);
      openAuth(() => {
        // Email/password path: callback fires in the same page session.
        // Clear sessionStorage so the useEffect above doesn't double-open.
        sessionStorage.removeItem(PENDING_PLAN_KEY);
        setPaymentPlan(planId);
      });
      return;
    }
    setPaymentPlan(planId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <TrustSection />
      <ProcessSection />
      <AboutSection />
      <PricingSection onBuy={handleBuy} />
      <PolicyHighlights />
      <Footer />
      <Chatbot />

      <PaymentModal
        open={paymentPlan !== null}
        onClose={() => setPaymentPlan(null)}
        planId={paymentPlan}
      />
    </div>
  );
}
