import { useState } from "react";
import type { User } from "@supabase/supabase-js";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProcessSection from "@/components/ProcessSection";
import TrustSection from "@/components/TrustSection";
import AboutSection from "@/components/AboutSection";
import PricingSection from "@/components/PricingSection";
import PolicyHighlights from "@/components/PolicyHighlights";
import ContactForm from "@/components/ContactForm";
import Chatbot from "@/components/Chatbot";
import Footer from "@/components/Footer";
import PaymentModal from "@/components/PaymentModal";

interface IndexProps {
  user: User | null;
}

const Index = ({ user }: IndexProps) => {
  const [formOpen, setFormOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const handleBuy = (plan: string) => {
    console.log("HANDLE BUY:", plan);
console.log("paymentOpen:", paymentOpen);
    setSelectedPlan(plan);
    setPaymentOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <TrustSection />
      <ProcessSection />
      <AboutSection />

      {/* Pricing section triggers Buy */}
      <PricingSection onBuy={handleBuy} />

      <PolicyHighlights />

      {/* Optional contact form (if you still want it) */}
      <ContactForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        selectedPlan={selectedPlan}
      />

      <Footer />
      <Chatbot />

      {/* Payment Modal */}
    {paymentOpen && (
  <PaymentModal
    open={paymentOpen}
    onClose={() => setPaymentOpen(false)}
    plan={selectedPlan}
    userEmail={"test@gmail.com"}
    userName={"Test User"}
    userId={"123"}
  />
)}
    
    </div>
  );
};

export default Index;