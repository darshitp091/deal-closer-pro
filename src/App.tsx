import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

import AuthModal from "@/components/AuthModal";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RefundPolicy from "./pages/RefundPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
const [phone, setPhone] = useState("");

 useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    setUser(user);
    setLoading(false);

    // 🔥 SAVE USER TO DB (VERY IMPORTANT)
    if (user) {
      const { error } = await supabase
        .from("deal-closer-database") // your table
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "",
        });

      if (error) {
        console.error("PROFILE SAVE ERROR:", error);
      }

      // ✅ CHECK PHONE
      const { data: profile } = await supabase
        .from("deal-closer-database")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile?.phone) {
        setShowPhoneModal(true); // you create this state
      }
    }
  };

  getUser();

  // ✅ Listen to auth changes (Google login etc)
  const { data: listener } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      const user = session?.user ?? null;
      setUser(user);

      if (user) {
        // 🔥 SAVE AGAIN (for Google redirect case)
        await supabase.from("deal-closer-database").upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "",
        });
      }
    }
  );

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);

const savePhone = async () => {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) return;

  await supabase
    .from("deal-closer-database")
    .update({ phone })
    .eq("id", user.id);

  setShowPhoneModal(false);
};

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index user={user} />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

        {/* 🔐 Auth Modal */}
        {!user && (
          <AuthModal
            open={true}
            onClose={() => { }}
          />
        )}
        {/* 📱 PHONE MODAL (ADD HERE) */}
{showPhoneModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-80">
      <h2 className="text-lg font-semibold mb-4">
        Enter your phone number
      </h2>

      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full border px-3 py-2 mb-4 rounded"
      />

      <button
        onClick={savePhone}
        className="w-full bg-yellow-400 py-2 rounded"
      >
        Save
      </button>
    </div>
  </div>
)}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;