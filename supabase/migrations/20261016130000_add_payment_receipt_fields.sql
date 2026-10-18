ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS sender_number text,
  ADD COLUMN IF NOT EXISTS receipt_url text;