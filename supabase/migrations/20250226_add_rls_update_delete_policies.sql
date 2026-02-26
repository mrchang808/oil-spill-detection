-- Add RLS Policies for UPDATE and DELETE Operations
-- 
-- Context: The UI allows updating detection records (severity, response_status, validation_status, notes, etc.)
-- and deleting detections. Without these policies, those operations will fail with 401 Unauthorized.
--
-- Security Model:
-- - For now, we allow public (anon) updates and deletes since this is a demo/visualization tool
-- - In production with authentication, replace 'anon' with 'authenticated' and add user ownership checks

-- Policy: Allow anonymous users to UPDATE detections
CREATE POLICY "Public update access"
  ON oil_spill_detections
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anonymous users to DELETE detections
CREATE POLICY "Public delete access"
  ON oil_spill_detections
  FOR DELETE
  TO anon
  USING (true);

-- Policy: Allow anonymous users to INSERT detections (for ML pipeline integration)
CREATE POLICY "Public insert access"
  ON oil_spill_detections
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ⚠️ PRODUCTION HARDENING (uncomment and modify when adding authentication):
--
-- DROP POLICY "Public update access" ON oil_spill_detections;
-- DROP POLICY "Public delete access" ON oil_spill_detections;
-- DROP POLICY "Public insert access" ON oil_spill_detections;
--
-- CREATE POLICY "Authenticated users can update their own detections"
--   ON oil_spill_detections
--   FOR UPDATE
--   TO authenticated
--   USING (auth.uid() = created_by)  -- Requires adding 'created_by uuid' column
--   WITH CHECK (auth.uid() = created_by);
--
-- CREATE POLICY "Authenticated users can delete their own detections"
--   ON oil_spill_detections
--   FOR DELETE
--   TO authenticated
--   USING (auth.uid() = created_by);
--
-- CREATE POLICY "Authenticated users can insert detections"
--   ON oil_spill_detections
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid() = created_by);
