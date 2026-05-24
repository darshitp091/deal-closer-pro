// Single switch that decides which payment provider is live.
//
// Both Razorpay and Cashfree code paths stay in the codebase; only the
// one named here actually runs. Flip providers by setting
// VITE_PAYMENT_PROVIDER in the environment (Vercel / .env) — no code edits.
//
// Defaults to Cashfree (the current active provider).

export type PaymentProvider = "razorpay" | "cashfree";

export const ACTIVE_PROVIDER: PaymentProvider =
  import.meta.env.VITE_PAYMENT_PROVIDER === "razorpay" ? "razorpay" : "cashfree";
