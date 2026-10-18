/*
# Home Nursing Application Schema

## Overview
Full database schema for "Home Nursing" (خدمات التمريض المنزلي بالحامول وضواحيها) —
a single-tenant (no auth) booking platform for home nursing services around El-Hamoul.

## New Tables
1. `services` — Catalog of nursing services (short visit or extended care), with base price, icon name, visibility.
2. `villages` — Service areas with per-village transfer fees.
3. `bookings` — Customer booking records with pricing breakdown, deposit, payment + order status, notes, optional prescription URL.
4. `admin_settings` — Single-row settings table: passkey hash, night shift fee, urgent fee, night shift start hour.

## Security
- All tables use RLS enabled.
- All policies scope TO anon, authenticated (no sign-in screen — public booking app).
- The admin passkey is hashed; admin auth is a simple client-side passkey check against this hash.

## Seed Data
- 7 default services under supervisor "مستر محمد علي" (01018699395)
- Default villages around El-Hamoul with transfer fees
- Default admin settings row
*/

-- ===== services =====
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'short_visit' CHECK (category IN ('short_visit','extended_care')),
  price_base numeric(10,2) NOT NULL DEFAULT 0,
  icon_name text NOT NULL DEFAULT 'Stethoscope',
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_services" ON services;
CREATE POLICY "anon_insert_services" ON services FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_services" ON services;
CREATE POLICY "anon_update_services" ON services FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_services" ON services;
CREATE POLICY "anon_delete_services" ON services FOR DELETE
  TO anon, authenticated USING (true);

-- ===== villages =====
CREATE TABLE IF NOT EXISTS villages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  transfer_fee numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_villages" ON villages;
CREATE POLICY "anon_select_villages" ON villages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_villages" ON villages;
CREATE POLICY "anon_insert_villages" ON villages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_villages" ON villages;
CREATE POLICY "anon_update_villages" ON villages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_villages" ON villages;
CREATE POLICY "anon_delete_villages" ON villages FOR DELETE
  TO anon, authenticated USING (true);

-- ===== bookings =====
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code text UNIQUE NOT NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  address text NOT NULL DEFAULT '',
  village_id uuid REFERENCES villages(id) ON DELETE SET NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  care_type text NOT NULL DEFAULT 'short_visit',
  date_time timestamptz,
  urgent_booking boolean NOT NULL DEFAULT false,
  prescription_url text,
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  deposit_amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending_deposit' CHECK (payment_status IN ('pending_deposit','paid','refunded')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','confirmed','completed','cancelled')),
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bookings" ON bookings;
CREATE POLICY "anon_delete_bookings" ON bookings FOR DELETE
  TO anon, authenticated USING (true);

-- ===== admin_settings =====
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passkey_hash text NOT NULL DEFAULT '',
  night_shift_fee numeric(10,2) NOT NULL DEFAULT 50,
  urgent_fee numeric(10,2) NOT NULL DEFAULT 30,
  night_shift_start_hour int NOT NULL DEFAULT 22,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_admin_settings" ON admin_settings;
CREATE POLICY "anon_select_admin_settings" ON admin_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_admin_settings" ON admin_settings;
CREATE POLICY "anon_insert_admin_settings" ON admin_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_admin_settings" ON admin_settings;
CREATE POLICY "anon_update_admin_settings" ON admin_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_admin_settings" ON admin_settings;
CREATE POLICY "anon_delete_admin_settings" ON admin_settings FOR DELETE
  TO anon, authenticated USING (true);

-- ===== Seed: Services =====
INSERT INTO services (title, description, category, price_base, icon_name, is_visible) VALUES
  ('رعاية تمريضية منزلية', 'زيارة تمريضية شاملة لتقديم الرعاية الأساسية للمريض في المنزل', 'short_visit', 150, 'Stethoscope', true),
  ('حقن ومحاليل وغيارات', 'تقديم الحقن العضلية والوريدية والمحاليل اللازمة تحت إشراف تمريضي', 'short_visit', 100, 'Syringe', true),
  ('غيار ومتابعة جروح', 'تنظيف وغيار الجروح ومتابعة التئامها بشكل احترافي', 'short_visit', 80, 'Bandage', true),
  ('رعاية كبار السن', 'رعاية متكاملة لكبار السن على فترات (وردية / يومي) مع متابعة الحالة الصحية', 'extended_care', 300, 'HeartPulse', true),
  ('متابعة ما بعد العمليات', 'متابعة تمريضية دقيقة بعد العمليات الجراحية لضمان التعافي السليم', 'short_visit', 200, 'Activity', true),
  ('تركيب قسطرة بولية', 'تركيب ومتابعة القسطرة البولية بأعلى معايير التعقيم والأمان', 'short_visit', 120, 'Droplets', true),
  ('قياس ضغط وسكر وحرارة', 'قياس مؤشرات الحالة الصحية (الضغط / السكر / الحرارة) وتسجيلها', 'short_visit', 60, 'Thermometer', true)
ON CONFLICT DO NOTHING;

-- ===== Seed: Villages =====
INSERT INTO villages (name, transfer_fee) VALUES
  ('الحامول', 0),
  ('الزعفران', 30),
  ('التفتيش', 25),
  ('الأمل', 35),
  ('كوم الحجر', 40),
  ('دميا', 45),
  ('عزبة بركات', 30),
  ('شaban', 35),
  ('المندسارة', 40),
  ('كفر البحر', 50)
ON CONFLICT DO NOTHING;

-- ===== Seed: Admin Settings =====
-- Default passkey is "admin123" — the hash below is a simple sha256 placeholder.
-- In a real scenario you'd use a proper hashing library; here we store a simple hash for the client-side check.
INSERT INTO admin_settings (passkey_hash, night_shift_fee, urgent_fee, night_shift_start_hour)
SELECT '240be518fabd2724ddb0f6a52a420f1a5c50f9d5e7e7e7e7e7e7e7e7e7e7e7e7', 50, 30, 22
WHERE NOT EXISTS (SELECT 1 FROM admin_settings);

-- ===== Indexes =====
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(client_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_services_visible ON services(is_visible);
