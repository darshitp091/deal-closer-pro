import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 EMAIL LOGIN + SIGNUP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Minimum 6 characters required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone,
            },
          },
        });

        if (error) throw error;

        // 🔥 AUTO LOGIN
        if (!data.session) {
          const { error: loginError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (loginError) throw loginError;
        }

        // ✅ SAVE PROFILE
        const user = data.user;

        if (user) {
          await supabase.from("deal-closer-database").upsert({
            id: user.id,
            email: user.email,
            full_name: name,
            phone: phone,
          });
        }

        toast({
          title: "Account created!",
        });

        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // ✅ ENSURE PROFILE EXISTS (for login / Google users)
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (user) {
          await supabase.from("deal-closer-database").upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || "",
          });
        }

        toast({
          title: "Welcome back!",
        });

        onClose();
      }

      setEmail("");
      setPassword("");
      setName("");
      setPhone("");
    } catch (err: any) {
      toast({
        title: "Auth error",
        description: err.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  // 🔥 GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl">

        <DialogHeader className="sr-only">
          <DialogTitle>
            {mode === "login" ? "Login" : "Signup"}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-white px-8 py-10">

          <h1 className="text-2xl font-bold mb-6 text-center">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>

          {/* GOOGLE BUTTON */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2.5 rounded-md mb-4 bg-white hover:bg-gray-50 transition font-medium"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              className="w-5 h-5"
            />
            <span className="text-gray-700">Continue with Google</span>
          </button>

          {/* DIVIDER */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === "signup" && (
              <>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                />

                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
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
              className="w-full bg-yellow-400 hover:bg-yellow-500 transition py-2.5 rounded-md font-semibold"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create your account"}
            </button>
          </form>

          {/* SWITCH */}
          <p className="text-sm mt-6 text-center">
            {mode === "login"
              ? "New here?"
              : "Already have an account?"}{" "}
            <button
              onClick={() =>
                setMode(mode === "login" ? "signup" : "login")
              }
              className="text-blue-600 hover:underline"
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;