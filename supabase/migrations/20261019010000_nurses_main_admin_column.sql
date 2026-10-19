CREATE TABLE IF NOT EXISTS public.nurses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  passkey text NOT NULL,
  is_main_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.nurses
  ADD COLUMN IF NOT EXISTS is_main_admin boolean DEFAULT false;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'nurses'
      AND column_name = 'is_supervisor'
  ) THEN
    UPDATE public.nurses
    SET is_main_admin = coalesce(is_main_admin, false) OR coalesce(is_supervisor, false);
  END IF;
END $$;

ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_manage_nurses" ON public.nurses;
DROP POLICY IF EXISTS "Admin can manage nurses" ON public.nurses;
DROP POLICY IF EXISTS "Allow public access to nurses" ON public.nurses;

CREATE POLICY "Allow public access to nurses" ON public.nurses
  FOR ALL
  USING (true)
  WITH CHECK (true);
