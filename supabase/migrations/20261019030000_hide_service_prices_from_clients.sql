ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS hide_service_prices BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_settings;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$;
