/*
  # Oil Spill Detection System Database Schema

  ## Overview
  This migration creates the database infrastructure for storing and visualizing oil spill detection results.

  ## New Tables
  
  ### `oil_spill_detections`
  Stores oil spill detection records with geographic coordinates and detection status.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each detection record
  - `latitude` (double precision) - Geographic latitude coordinate (-90 to 90)
  - `longitude` (double precision) - Geographic longitude coordinate (-180 to 180)
  - `status` (text) - Detection result: either "Oil spill" or "Non Oil spill"
  - `detected_at` (timestamptz) - Timestamp when the detection was made
  - `confidence` (double precision, optional) - Detection confidence score (0.0 to 1.0)
  - `source` (text, optional) - Source of detection (e.g., satellite, sensor, manual)
  - `created_at` (timestamptz) - Record creation timestamp
  
  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the `oil_spill_detections` table
  - Public read access is granted to allow unauthenticated users to view detection data
  - This is a public-facing visualization tool, so no authentication is required for viewing
  
  ### Policies
  - **"Public read access"** - Allows anyone to SELECT detection records without authentication
  
  ## Indexes
  - Primary key index on `id` (automatic)
  - Index on `status` for efficient filtering by detection type
  - Index on `detected_at` for time-based queries and sorting
  
  ## Notes
  - The `status` field is constrained to only accept "Oil spill" or "Non Oil spill" values
  - Geographic coordinates are validated to ensure they fall within valid ranges
  - Timestamps default to the current time if not specified
*/

-- Create the oil_spill_detections table
CREATE TABLE IF NOT EXISTS oil_spill_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  status text NOT NULL,
  detected_at timestamptz DEFAULT now(),
  confidence double precision,
  source text,
  created_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180),
  CONSTRAINT valid_status CHECK (status IN ('Oil spill', 'Non Oil spill')),
  CONSTRAINT valid_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1))
);

-- Enable Row Level Security
ALTER TABLE oil_spill_detections ENABLE ROW LEVEL SECURITY;

-- Create public read access policy (no authentication required)
CREATE POLICY "Public read access"
  ON oil_spill_detections
  FOR SELECT
  TO anon
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_oil_spill_detections_status 
  ON oil_spill_detections(status);

CREATE INDEX IF NOT EXISTS idx_oil_spill_detections_detected_at 
  ON oil_spill_detections(detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_oil_spill_detections_coordinates 
  ON oil_spill_detections(latitude, longitude);