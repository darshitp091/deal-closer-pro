// Shared Cashfree Payment Gateway helpers for edge functions.
//
// Cashfree API differs from Razorpay in a few important ways:
//   - amounts are in MAJOR units (rupees, e.g. 2000.00) — NOT paise
//   - auth is via x-client-id / x-client-secret headers (not Basic auth)
//   - the API version is pinned with the x-api-version header
//   - the client confirms a payment by fetching order status, not by
//     verifying an HMAC signature (that's only for webhooks)

const API_VERSION = "2023-08-01";

export function cashfreeEnv(): "sandbox" | "production" {
  const env = (Deno.env.get("CASHFREE_ENV") ?? "sandbox").toLowerCase();
  return env === "production" ? "production" : "sandbox";
}

export function cashfreeBaseUrl(): string {
  return cashfreeEnv() === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

// Throws if credentials are missing so callers can return a clean 500.
export function cashfreeHeaders(): Record<string, string> {
  const appId = Deno.env.get("CASHFREE_APP_ID");
  const secret = Deno.env.get("CASHFREE_SECRET_KEY");
  if (!appId || !secret) {
    throw new Error("Cashfree credentials not configured");
  }
  return {
    "Content-Type": "application/json",
    "x-api-version": API_VERSION,
    "x-client-id": appId,
    "x-client-secret": secret,
  };
}
