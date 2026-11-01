const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpayCheckoutResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: { error?: { description?: string } }) => void) => void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export type RazorpayCheckoutResult =
  | { response: RazorpayCheckoutResponse }
  | { error: string };

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay checkout"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export async function openRazorpayCheckout(options: {
  keyId: string;
  orderId: string;
  amountPaise: number;
  planName: string;
  callbackUrl: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}): Promise<RazorpayCheckoutResult> {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout is unavailable");
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: RazorpayCheckoutResult) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    const checkout = new window.Razorpay({
      key: options.keyId,
      amount: options.amountPaise,
      currency: "INR",
      name: "Ishwari Socials",
      description: `${options.planName} plan`,
      order_id: options.orderId,
      callback_url: options.callbackUrl,
      redirect: true,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      theme: { color: "#d4a72c" },
      handler: (response: RazorpayCheckoutResponse) => finish({ response }),
    });

    checkout.on("payment.failed", (response) =>
      finish({ error: response.error?.description ?? "Payment failed" }),
    );
    checkout.open();
  });
}
