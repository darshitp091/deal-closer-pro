-- ============================================================
-- Make orders provider-agnostic so Razorpay and Cashfree can
-- coexist in the same table. Only one provider is live at a
-- time (controlled by the PAYMENT_PROVIDER env toggle), but the
-- schema must hold rows from either.
-- ============================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS provider_order_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_payment_id TEXT;

-- Backfill the generic columns from the existing Razorpay columns
-- so historical rows (and the success page) keep working.
UPDATE public.orders
  SET provider_order_id = razorpay_order_id,
      provider_payment_id = razorpay_payment_id
  WHERE provider_order_id IS NULL;

-- Razorpay-specific columns are no longer mandatory: Cashfree rows
-- leave them NULL. (Postgres allows multiple NULLs under a UNIQUE
-- constraint, so the existing razorpay_order_id UNIQUE stays valid.)
ALTER TABLE public.orders ALTER COLUMN razorpay_order_id DROP NOT NULL;

-- A provider's order id must be unique. NULLs are allowed (e.g. a
-- half-created row), but real ids never collide.
CREATE UNIQUE INDEX IF NOT EXISTS orders_provider_order_id_idx
  ON public.orders(provider_order_id);

CREATE INDEX IF NOT EXISTS orders_provider_idx
  ON public.orders(provider);
