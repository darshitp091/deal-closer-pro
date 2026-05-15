// Thin wrapper around the Razorpay Checkout SDK loaded via index.html.

export interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", cb: (resp: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export function isRazorpayLoaded(): boolean {
  return typeof window !== "undefined" && typeof window.Razorpay === "function";
}

export function openRazorpayCheckout(
  options: RazorpayOptions,
  onFailed?: (resp: unknown) => void,
): void {
  if (!window.Razorpay) {
    throw new Error("Razorpay SDK not loaded. Check index.html.");
  }
  const rzp = new window.Razorpay(options);
  if (onFailed) rzp.on("payment.failed", onFailed);
  rzp.open();
}
