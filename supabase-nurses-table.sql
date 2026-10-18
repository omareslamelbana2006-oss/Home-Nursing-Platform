-- Create nurses table for managing nursing staff
CREATE TABLE IF NOT EXISTS nurses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  passkey TEXT NOT NULL,
  is_supervisor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE nurses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is managed by admin)
CREATE POLICY "Admin can manage nurses" ON nurses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS nurses_name_idx ON nurses(name);
CREATE INDEX IF NOT EXISTS nurses_phone_idx ON nurses(phone);

-- Insert default supervisor (Mohamed Ali)
INSERT INTO nurses (name, phone, passkey, is_supervisor)
VALUES ('مستر محمد علي', '01018699395', '*Mohamed2000*', true)
ON CONFLICT DO NOTHING;
