import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Don't throw at module load — let marketing pages render so devs can
  // visually verify the site without full env setup. Auth/payment will
  // fail at use-time with a clear error instead.
  console.warn(
    "[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Auth and payment features will not work until you create a .env file.",
  );
}

export const supabase = createClient<Database>(
  url ?? "https://placeholder.supabase.co",
  anonKey ?? "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
