// Thin wrapper around the Cashfree JS SDK (@cashfreepayments/cashfree-js).
//
// Unlike Razorpay (loaded via a <script> tag in index.html), Cashfree is
// an npm package loaded on demand. The SDK is initialised once with the
// environment mode and reused.

import { load } from "@cashfreepayments/cashfree-js";

export type CashfreeMode = "sandbox" | "production";

interface CashfreeInstance {
  checkout: (opts: {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_modal";
  }) => Promise<CashfreeCheckoutResult>;
}

export interface CashfreeCheckoutResult {
  // Present when the checkout failed to even open / was rejected.
  error?: { message?: string };
  // Present on a successful in-modal completion.
  paymentDetails?: { paymentMessage?: string };
  // Present when the SDK chose a full-page redirect instead of the modal.
  redirect?: boolean;
}

let cashfreePromise: Promise<CashfreeInstance> | null = null;

async function getCashfree(mode: CashfreeMode): Promise<CashfreeInstance> {
  if (!cashfreePromise) {
    cashfreePromise = load({ mode }) as Promise<CashfreeInstance>;
  }
  return cashfreePromise;
}

// Opens the Cashfree checkout in a modal and resolves when it closes.
// `mode` comes from the create-order response so the SDK environment
// always matches the server's CASHFREE_ENV — nothing to keep in sync.
export async function openCashfreeCheckout(
  paymentSessionId: string,
  mode: CashfreeMode,
): Promise<CashfreeCheckoutResult> {
  const cashfree = await getCashfree(mode);
  return cashfree.checkout({ paymentSessionId, redirectTarget: "_modal" });
}
