/*
  # Oil Spill Detection System - Full Schema

  Creates the oil_spill_detections table with all columns, RLS policies,
  indexes, the statistics view, and the updated_at trigger.
*/

CREATE TABLE IF NOT EXISTS oil_spill_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  status text NOT NULL,
  detected_at timestamptz DEFAULT now(),
  confidence double precision,
  source text,
  created_at timestamptz DEFAULT now(),
  severity text,
  area_affected_km2 double precision,
  response_status text DEFAULT 'Pending',
  validation_status text DEFAULT 'Unverified',
  sar_image_url text,
  optical_image_url text,
  copernicus_product_id text,
  wind_speed_ms double precision,
  sea_state text,
  notes text,
  tags text[],
  news_correlation jsonb,
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180),
  CONSTRAINT valid_status CHECK (status IN ('Oil spill', 'Non Oil spill')),
  CONSTRAINT valid_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  CONSTRAINT valid_severity CHECK (severity IS NULL OR severity IN ('Low', 'Medium', 'High', 'Critical')),
  CONSTRAINT valid_area CHECK (area_affected_km2 IS NULL OR area_affected_km2 >= 0),
  CONSTRAINT valid_response_status CHECK (response_status IS NULL OR response_status IN ('Pending', 'Investigating', 'Responding', 'Contained', 'Cleaned')),
  CONSTRAINT valid_validation_status CHECK (validation_status IS NULL OR validation_status IN ('Unverified', 'Verified', 'False Positive'))
);

ALTER TABLE oil_spill_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON oil_spill_detections FOR SELECT TO anon USING (true);

CREATE POLICY "Public insert access"
  ON oil_spill_detections FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Public update access"
  ON oil_spill_detections FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Public delete access"
  ON oil_spill_detections FOR DELETE TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_oil_spill_detections_status ON oil_spill_detections(status);
CREATE INDEX IF NOT EXISTS idx_oil_spill_detections_detected_at ON oil_spill_detections(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_oil_spill_detections_coordinates ON oil_spill_detections(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_severity ON oil_spill_detections(severity);
CREATE INDEX IF NOT EXISTS idx_response_status ON oil_spill_detections(response_status);
CREATE INDEX IF NOT EXISTS idx_validation_status ON oil_spill_detections(validation_status);
CREATE INDEX IF NOT EXISTS idx_updated_at ON oil_spill_detections(updated_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_oil_spill_detections_updated_at
BEFORE UPDATE ON oil_spill_detections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE VIEW oil_spill_statistics AS
SELECT
    COUNT(*) as total_detections,
    COUNT(*) FILTER (WHERE status = 'Oil spill') as oil_spills,
    COUNT(*) FILTER (WHERE status = 'Non Oil spill') as non_oil_spills,
    COUNT(*) FILTER (WHERE validation_status = 'Verified') as verified_spills,
    COUNT(*) FILTER (WHERE severity = 'Critical') as critical_spills,
    AVG(area_affected_km2) FILTER (WHERE area_affected_km2 IS NOT NULL) as avg_area_affected,
    COUNT(*) FILTER (WHERE detected_at > now() - interval '24 hours') as last_24h,
    COUNT(*) FILTER (WHERE detected_at > now() - interval '7 days') as last_week
FROM oil_spill_detections;
