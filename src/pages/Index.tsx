import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProcessSection from "@/components/ProcessSection";
import TrustSection from "@/components/TrustSection";
import AboutSection from "@/components/AboutSection";
import PricingSection from "@/components/PricingSection";
import Testimonial from "@/components/Testimonial";
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

  // Restore pending plan after Google OAuth redirect
  useEffect(() => {
    if (authLoading || !user) return;

    const pending = sessionStorage.getItem(
      PENDING_PLAN_KEY
    ) as PlanId | null;

    if (pending) {
      sessionStorage.removeItem(PENDING_PLAN_KEY);
      setPaymentPlan(pending);
    }
  }, [user, authLoading]);

  const handleBuy = (planId: PlanId) => {
    if (!user) {
      sessionStorage.setItem(PENDING_PLAN_KEY, planId);

      openAuth(() => {
        sessionStorage.removeItem(PENDING_PLAN_KEY);
        setPaymentPlan(planId);
      });

      return;
    }

    setPaymentPlan(planId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <HeroSection />

        <ProcessSection />

        <TrustSection />

        <AboutSection />

        {/* Testimonial Section */}
        <Testimonial />

        {/* Pricing Section */}
        <PricingSection />

        <PolicyHighlights />
      </main>

      <Chatbot />

      <Footer />

      <PaymentModal
        open={paymentPlan !== null}
        onClose={() => setPaymentPlan(null)}
        planId={paymentPlan}
      />
    </div>
  );
}
