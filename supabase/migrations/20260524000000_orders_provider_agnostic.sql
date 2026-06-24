-- ============================================================
-- Align public.orders with the Cashfree integration.
--
-- The live `orders` table was a leftover ad-hoc Lovable table
-- (id, user_id, order_id, amount, status, email, phone, created_at)
-- that pre-existed migration 20260509, so that migration's
-- `CREATE TABLE IF NOT EXISTS orders` was a no-op and the table never
-- got the columns the app needs.
--
-- The table has 0 rows, so we drop and recreate it cleanly with the
-- provider-agnostic schema the edge functions and success page use.
-- This is deterministic whether starting from the leftover table or
-- from a fresh replay of the earlier migrations.
-- ============================================================

DROP TABLE IF EXISTS public.orders CASCADE;

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,                  -- 'starter' | 'growth'
  amount_paise INTEGER NOT NULL,          -- amount in paise (₹2000 = 200000)
  currency TEXT NOT NULL DEFAULT 'INR',
  provider TEXT NOT NULL DEFAULT 'cashfree',
  provider_order_id TEXT,                 -- Cashfree order_id
  provider_payment_id TEXT,               -- Cashfree cf_payment_id
  status TEXT NOT NULL DEFAULT 'created', -- created | paid | failed | refunded
  notes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A provider's order id must be unique. NULLs are allowed (e.g. a
-- half-created row), but real ids never collide.
CREATE UNIQUE INDEX orders_provider_order_id_idx ON public.orders(provider_order_id);
CREATE INDEX orders_user_id_idx ON public.orders(user_id);
CREATE INDEX orders_status_idx  ON public.orders(status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders only. All writes happen through the
-- edge functions using the service-role key, which bypasses RLS — so
-- there is deliberately no client INSERT/UPDATE policy.
CREATE POLICY "Users read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);
