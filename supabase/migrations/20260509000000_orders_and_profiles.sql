-- ============================================================
-- profiles: replaces the awkwardly-named "deal-closer-database"
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create a profile row whenever a new auth.users row appears.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- orders: replaces ad-hoc "purchases", structured for Razorpay
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,                 -- 'starter' | 'growth'
  amount_paise INTEGER NOT NULL,         -- amount in paise (₹2000 = 200000)
  currency TEXT NOT NULL DEFAULT 'INR',
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'created',-- created | paid | failed | refunded
  notes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx  ON public.orders(status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders only.
CREATE POLICY "Users read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- No client-side INSERT/UPDATE allowed — only the edge functions
-- (running with the service-role key) write to this table.
