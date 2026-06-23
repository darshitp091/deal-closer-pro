// Thin wrapper around the Cashfree JS SDK (@cashfreepayments/cashfree-js).
// The SDK is loaded on demand as an npm package and cached per environment mode.

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

const cashfreeInstances: Partial<Record<CashfreeMode, Promise<CashfreeInstance>>> = {};

async function getCashfree(mode: CashfreeMode): Promise<CashfreeInstance> {
  if (!cashfreeInstances[mode]) {
    cashfreeInstances[mode] = load({ mode }) as Promise<CashfreeInstance>;
  }
  return cashfreeInstances[mode]!;
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
