/*
# Storage bucket for prescriptions

## Overview
Creates a public storage bucket for doctor prescription file uploads from the booking wizard.
Allows anon + authenticated to upload and read prescription files (images/PDFs).

## Changes
- Create `prescriptions` bucket (public)
- Add INSERT + SELECT policies on storage.objects for the prescriptions bucket
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'prescriptions') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('prescriptions', 'prescriptions', true);
  END IF;
END $$;

DROP POLICY IF EXISTS "anon_upload_prescriptions" ON storage.objects;
CREATE POLICY "anon_upload_prescriptions" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'prescriptions');

DROP POLICY IF EXISTS "anon_read_prescriptions" ON storage.objects;
CREATE POLICY "anon_read_prescriptions" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'prescriptions');
