-- Create nurses table for managing nursing staff
CREATE TABLE IF NOT EXISTS public.nurses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  passkey TEXT NOT NULL,
  is_main_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.nurses
  ADD COLUMN IF NOT EXISTS is_main_admin BOOLEAN DEFAULT FALSE;

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

-- Enable Row Level Security
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is managed by admin)
DROP POLICY IF EXISTS "Admin can manage nurses" ON public.nurses;
DROP POLICY IF EXISTS "anon_manage_nurses" ON public.nurses;
DROP POLICY IF EXISTS "Allow public access to nurses" ON public.nurses;
CREATE POLICY "Allow public access to nurses" ON public.nurses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS nurses_name_idx ON public.nurses(name);
CREATE INDEX IF NOT EXISTS nurses_phone_idx ON public.nurses(phone);

-- Insert default supervisor (Mohamed Ali)
INSERT INTO public.nurses (name, phone, passkey, is_main_admin)
VALUES ('مستر محمد علي', '01018699395', '*Mohamed2000*', true)
ON CONFLICT DO NOTHING;
