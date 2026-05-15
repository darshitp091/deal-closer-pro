import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type Mode = "login" | "signup";

export default function AuthModal() {
  const { isAuthOpen, closeAuth } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Use at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, phone } },
        });
        if (error) throw error;

        // Some Supabase setups require email confirmation; in that case
        // there's no session yet. Try a direct sign-in for the no-confirm flow.
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          const { error: loginErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (loginErr) {
            // Most likely email confirmation required — surface that clearly.
            toast({
              title: "Check your email",
              description: "Confirm your address to finish signing up.",
            });
            reset();
            setLoading(false);
            return;
          }
        }
        toast({ title: "Account created!" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({ title: "Welcome back!" });
      }

      reset();
      // closeAuth + post-auth callback are triggered by AuthProvider
      // when onAuthStateChange fires, so no need to call closeAuth here.
    } catch (err) {
      toast({
        title: "Auth error",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
    // On success, browser redirects → page reload → AuthProvider picks up session.
  };

  return (
    <Dialog open={isAuthOpen} onOpenChange={(v) => !v && closeAuth()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{mode === "login" ? "Sign in" : "Create account"}</DialogTitle>
        </DialogHeader>

        <div className="bg-white px-8 py-10">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2.5 rounded-md mb-4 bg-white hover:bg-gray-50 transition font-medium disabled:opacity-50"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt=""
              className="w-5 h-5"
            />
            <span className="text-gray-700">Continue with Google</span>
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                />
              </>
            )}

            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 transition py-2.5 rounded-md font-semibold disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create your account"}
            </button>
          </form>

          <p className="text-sm mt-6 text-center text-gray-700">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-blue-600 hover:underline"
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
