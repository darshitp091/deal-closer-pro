-- Additive Razorpay migration. This does not create, drop, or recreate tables,
-- so it is safe when the existing schema was already applied by Vercel.
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS provider_order_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS amount_paise INTEGER,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS notes JSONB,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'razorpay_order_id'
    ) THEN
      EXECUTE $sql$
        UPDATE public.orders
        SET provider_order_id = COALESCE(provider_order_id, razorpay_order_id::TEXT)
        WHERE provider_order_id IS NULL
      $sql$;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'razorpay_payment_id'
    ) THEN
      EXECUTE $sql$
        UPDATE public.orders
        SET provider_payment_id = COALESCE(provider_payment_id, razorpay_payment_id::TEXT)
        WHERE provider_payment_id IS NULL
      $sql$;
    END IF;

    EXECUTE $sql$
      UPDATE public.orders
      SET
        provider = COALESCE(provider, 'razorpay'),
        currency = COALESCE(currency, 'INR'),
        status = COALESCE(status, 'created'),
        updated_at = COALESCE(updated_at, now())
      WHERE provider IS NULL
         OR currency IS NULL
         OR status IS NULL
         OR updated_at IS NULL
    $sql$;
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    ALTER TABLE public.orders
      ALTER COLUMN provider SET DEFAULT 'razorpay',
      ALTER COLUMN currency SET DEFAULT 'INR',
      ALTER COLUMN status SET DEFAULT 'created',
      ALTER COLUMN updated_at SET DEFAULT now();
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    CREATE UNIQUE INDEX IF NOT EXISTS orders_provider_order_id_idx
      ON public.orders(provider_order_id)
      WHERE provider_order_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
    CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    COMMENT ON COLUMN public.orders.provider_order_id IS 'Razorpay order id for new orders';
    COMMENT ON COLUMN public.orders.provider_payment_id IS 'Razorpay payment id for new orders';
  END IF;
END
$$;
