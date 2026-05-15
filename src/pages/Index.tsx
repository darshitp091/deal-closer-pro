import { useState } from "react";

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

export default function Index() {
  const { user, openAuth } = useAuth();
  const [paymentPlan, setPaymentPlan] = useState<PlanId | null>(null);

  const handleBuy = (planId: PlanId) => {
    if (!user) {
      // Defer the purchase until after the user signs in.
      openAuth(() => setPaymentPlan(planId));
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
