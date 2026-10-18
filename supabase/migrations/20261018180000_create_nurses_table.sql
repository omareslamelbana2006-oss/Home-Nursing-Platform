-- Create nurses table for managing nursing staff
CREATE TABLE IF NOT EXISTS nurses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  passkey text NOT NULL,
  is_supervisor boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nurses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is managed by admin)
DROP POLICY IF EXISTS "anon_manage_nurses" ON nurses;
CREATE POLICY "anon_manage_nurses" ON nurses
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_nurses_name ON nurses(name);
CREATE INDEX IF NOT EXISTS idx_nurses_phone ON nurses(phone);

-- Insert default supervisor (Mohamed Ali)
INSERT INTO nurses (name, phone, passkey, is_supervisor)
VALUES ('مستر محمد علي', '01018699395', '*Mohamed2000*', true)
ON CONFLICT DO NOTHING;
