import { createHmac } from "node:crypto";

export function razorpayCredentials(): { keyId: string; secret: string } {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !secret) {
    throw new Error("Razorpay credentials not configured");
  }
  return { keyId, secret };
}

export function razorpayHeaders(): Record<string, string> {
  const { keyId, secret } = razorpayCredentials();
  const encoded = btoa(`${keyId}:${secret}`);
  return {
    Authorization: `Basic ${encoded}`,
    "Content-Type": "application/json",
  };
}

export function razorpaySignature(
  payload: string,
  secret: string,
): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function signaturesMatch(expected: string, actual: string): boolean {
  if (expected.length !== actual.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ actual.charCodeAt(index);
  }
  return mismatch === 0;
}

export const razorpayBaseUrl = "https://api.razorpay.com/v1";
