-- Enhanced Oil Spill Detection Schema with Additional Fields

-- Add new columns to existing table
ALTER TABLE oil_spill_detections 
ADD COLUMN IF NOT EXISTS severity text CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
ADD COLUMN IF NOT EXISTS area_affected_km2 double precision CHECK (area_affected_km2 >= 0),
ADD COLUMN IF NOT EXISTS response_status text DEFAULT 'Pending' CHECK (response_status IN ('Pending', 'Investigating', 'Responding', 'Contained', 'Cleaned')),
ADD COLUMN IF NOT EXISTS validation_status text DEFAULT 'Unverified' CHECK (validation_status IN ('Unverified', 'Verified', 'False Positive')),
ADD COLUMN IF NOT EXISTS sar_image_url text,
ADD COLUMN IF NOT EXISTS optical_image_url text,
ADD COLUMN IF NOT EXISTS copernicus_product_id text,
ADD COLUMN IF NOT EXISTS wind_speed_ms double precision,
ADD COLUMN IF NOT EXISTS sea_state text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS tags text[], -- Array of tags for categorization
ADD COLUMN IF NOT EXISTS news_correlation jsonb, -- Store related news articles
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_severity ON oil_spill_detections(severity);
CREATE INDEX IF NOT EXISTS idx_response_status ON oil_spill_detections(response_status);
CREATE INDEX IF NOT EXISTS idx_validation_status ON oil_spill_detections(validation_status);
CREATE INDEX IF NOT EXISTS idx_tags ON oil_spill_detections USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_updated_at ON oil_spill_detections(updated_at DESC);

-- Full text search index for notes
CREATE INDEX IF NOT EXISTS idx_notes_fts ON oil_spill_detections USING gin(to_tsvector('english', notes));

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_oil_spill_detections_updated_at 
BEFORE UPDATE ON oil_spill_detections 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for statistics
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
