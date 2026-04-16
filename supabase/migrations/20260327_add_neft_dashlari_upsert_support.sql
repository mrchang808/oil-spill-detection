-- Add unique constraint on copernicus_product_id for upsert support
-- and ensure INSERT RLS policy exists for anon role

-- 1. Add unique constraint (needed for ON CONFLICT upsert)
-- First, clean up any duplicate copernicus_product_id values if they exist
-- by keeping only the most recent row per copernicus_product_id
DELETE FROM oil_spill_detections a
USING oil_spill_detections b
WHERE a.copernicus_product_id IS NOT NULL
  AND a.copernicus_product_id = b.copernicus_product_id
  AND a.created_at < b.created_at;

-- Now add the unique constraint
ALTER TABLE oil_spill_detections
  DROP CONSTRAINT IF EXISTS unique_copernicus_product_id;

ALTER TABLE oil_spill_detections
  ADD CONSTRAINT unique_copernicus_product_id UNIQUE (copernicus_product_id);

-- 2. Ensure INSERT policy exists for anon role
-- (Idempotent: drops first if already exists to avoid errors)
DROP POLICY IF EXISTS "Public insert access" ON oil_spill_detections;

CREATE POLICY "Public insert access"
  ON oil_spill_detections
  FOR INSERT
  TO anon
  WITH CHECK (true);
