/*
  # Oil Spill Detections Seed Data

  Populates oil_spill_detections with 55 realistic mock records spanning:
  - Global coordinates clustered near known oil-producing regions
  - Varied confidence levels, severities, areas, sources
  - Dates across the last 12 months
  - Mix of oil spill / non-oil spill classifications
*/

INSERT INTO oil_spill_detections (
  latitude, longitude, status, detected_at, confidence, severity,
  area_affected_km2, response_status, validation_status, source,
  wind_speed_ms, sea_state, copernicus_product_id, notes
) VALUES

-- ── Neft Dashlari (Caspian Sea, Azerbaijan) ────────────────────────────────
(40.2330,  50.8120, 'Oil spill',     NOW() - INTERVAL '2 days',    0.91, 'Critical', 12.40, 'Responding',    'Verified',       'Sentinel-1 SAR', 8.2, 'Rough',    'S1A_2026_NEFT_001', 'Platform leakage near Central Block A. Sheen extending NE.'),
(40.2450,  50.7530, 'Oil spill',     NOW() - INTERVAL '5 days',    0.84, 'High',      7.80, 'Investigating', 'Verified',       'Sentinel-1 SAR', 5.1, 'Moderate', 'S1A_2026_NEFT_002', 'Legacy platform W2. Aging riser connection suspected.'),
(40.2150,  50.8720, 'Oil spill',     NOW() - INTERVAL '9 days',    0.78, 'High',      5.20, 'Pending',       'Unverified',     'Sentinel-1 SAR', 6.7, 'Moderate', 'S1A_2026_NEFT_003', 'East production zone anomaly. Awaiting vessel inspection.'),
(40.2285,  50.8195, 'Non Oil spill', NOW() - INTERVAL '11 days',   0.31, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-2 MSI', 3.2, 'Calm',     'S2B_2026_NEFT_004', 'Sun glint artifact. Biogenic film confirmed after analysis.'),
(40.2400,  50.7650, 'Oil spill',     NOW() - INTERVAL '14 days',   0.88, 'Critical', 18.70, 'Contained',     'Verified',       'Sentinel-1 SAR', 9.4, 'Rough',    'S1A_2026_NEFT_005', 'Major spill from corroded subsea pipeline. Response deployed.'),
(40.2600,  50.8300, 'Non Oil spill', NOW() - INTERVAL '18 days',   0.22, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-1 SAR', 2.1, 'Calm',     'S1B_2026_NEFT_006', 'Algal bloom pattern. No hydrocarbon signature detected.'),
(40.1950,  50.8200, 'Oil spill',     NOW() - INTERVAL '22 days',   0.72, 'Medium',    3.40, 'Investigating', 'Unverified',     'Sentinel-1 SAR', 7.0, 'Moderate', 'S1A_2026_NEFT_007', 'Loading berth discharge anomaly during transfer operations.'),
(40.2700,  50.8550, 'Non Oil spill', NOW() - INTERVAL '26 days',   0.18, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-2 MSI', 1.8, 'Calm',     'S2A_2026_NEFT_008', 'Sediment plume from current flow. No oil presence.'),
(40.2100,  50.7350, 'Oil spill',     NOW() - INTERVAL '30 days',   0.81, 'High',      9.10, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 5.5, 'Moderate', 'S1B_2026_NEFT_009', 'SW outflow area. Pipeline micro-fracture. Cleanup completed.'),
(40.2550,  50.8000, 'Non Oil spill', NOW() - INTERVAL '35 days',   0.25, 'Low',       0.00, 'Pending',       'Unverified',     'Sentinel-1 SAR', 4.3, 'Calm',     'S1A_2026_NEFT_010', 'Marine biogenic slick. Low-wind surface film pattern.'),

-- ── Persian Gulf (UAE / Iran) ───────────────────────────────────────────────
(26.0860,  56.2620, 'Oil spill',     NOW() - INTERVAL '3 days',    0.93, 'Critical', 22.50, 'Responding',    'Verified',       'Sentinel-1 SAR', 10.1, 'Rough',   'S1A_2026_PG_001',   'Vessel collision near Strait of Hormuz. Major spill event.'),
(25.4200,  53.8800, 'Oil spill',     NOW() - INTERVAL '7 days',    0.76, 'High',      6.70, 'Investigating', 'Verified',       'Sentinel-1 SAR',  7.3, 'Moderate','S1B_2026_PG_002',   'Offshore rig discharge. Iranian territorial waters.'),
(27.1200,  56.5000, 'Non Oil spill', NOW() - INTERVAL '13 days',   0.28, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-2 MSI',  2.5, 'Calm',    'S2A_2026_PG_003',   'Natural oil seep confirmed. Biogenic origin.'),
(24.8500,  54.6800, 'Oil spill',     NOW() - INTERVAL '20 days',   0.69, 'Medium',    4.20, 'Contained',     'Verified',       'Sentinel-1 SAR',  6.2, 'Moderate','S1A_2026_PG_004',   'Abu Dhabi offshore field. Minor well leakage.'),
(26.7300,  55.9100, 'Oil spill',     NOW() - INTERVAL '45 days',   0.85, 'High',     11.30, 'Cleaned',       'Verified',       'Sentinel-1 SAR',  8.8, 'Rough',   'S1B_2026_PG_005',   'Tanker cleaning operations detected. Deliberate discharge.'),

-- ── Gulf of Mexico ─────────────────────────────────────────────────────────
(28.7360, -88.3660, 'Oil spill',     NOW() - INTERVAL '4 days',    0.89, 'Critical', 15.80, 'Responding',    'Verified',       'Sentinel-1 SAR',  9.6, 'Rough',   'S1A_2026_GOM_001',  'Macondo area. Deep-water platform pressure anomaly.'),
(29.1500, -90.2300, 'Oil spill',     NOW() - INTERVAL '8 days',    0.74, 'High',      8.40, 'Investigating', 'Unverified',     'Sentinel-1 SAR',  7.1, 'Moderate','S1B_2026_GOM_002',  'Louisiana offshore. Pipeline integrity check required.'),
(27.8000, -96.8000, 'Non Oil spill', NOW() - INTERVAL '16 days',   0.33, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-2 MSI',  3.8, 'Calm',    'S2B_2026_GOM_003',  'Natural seep area. Background seepage within normal range.'),
(25.7617, -91.6286, 'Oil spill',     NOW() - INTERVAL '25 days',   0.82, 'High',     10.60, 'Contained',     'Verified',       'Sentinel-1 SAR',  8.0, 'Rough',   'S1A_2026_GOM_004',  'Taylor Energy ongoing seep. New sheen extent detected.'),
(29.4523, -94.1234, 'Oil spill',     NOW() - INTERVAL '40 days',   0.67, 'Medium',    5.10, 'Cleaned',       'Verified',       'Sentinel-1 SAR',  5.9, 'Moderate','S1B_2026_GOM_005',  'Texas coast tanker discharge. Cleaned within 72 hours.'),
(28.3000, -88.9000, 'Non Oil spill', NOW() - INTERVAL '55 days',   0.21, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-1 SAR',  2.2, 'Calm',    'S1A_2026_GOM_006',  'Ship wake and current shear pattern. No oil detected.'),

-- ── North Sea ──────────────────────────────────────────────────────────────
(57.8900,   2.3400, 'Oil spill',     NOW() - INTERVAL '6 days',    0.87, 'High',      7.20, 'Investigating', 'Verified',       'Sentinel-1 SAR', 12.3, 'Very Rough','S1A_2026_NS_001',  'Forties pipeline system. Crack in aging infrastructure.'),
(61.3200,   2.5600, 'Oil spill',     NOW() - INTERVAL '12 days',   0.71, 'Medium',    4.80, 'Responding',    'Verified',       'Sentinel-1 SAR', 14.5, 'Very Rough','S1B_2026_NS_002',  'Shetland area. Vessel collision reported by coastguard.'),
(56.4500,   3.1200, 'Non Oil spill', NOW() - INTERVAL '19 days',   0.29, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-2 MSI',  8.7, 'Rough',   'S2A_2026_NS_003',  'Storm-related surface disturbance. No hydrocarbons confirmed.'),
(58.2300,   1.8700, 'Oil spill',     NOW() - INTERVAL '33 days',   0.78, 'High',      9.50, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 11.0, 'Very Rough','S1A_2026_NS_004',  'Brent Delta area. Legacy well seepage. UKCS jurisdiction.'),
(59.7100,   3.4500, 'Oil spill',     NOW() - INTERVAL '60 days',   0.65, 'Medium',    3.90, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 13.2, 'Rough',   'S1B_2026_NS_005',  'Norwegian sector spill. Fully remediated.'),

-- ── West Africa (Niger Delta) ──────────────────────────────────────────────
( 4.6500,   6.1200, 'Oil spill',     NOW() - INTERVAL '1 day',     0.95, 'Critical', 28.30, 'Responding',    'Verified',       'Sentinel-1 SAR',  4.5, 'Moderate','S1A_2026_WA_001',   'Niger Delta pipeline rupture. Community reports oil in mangroves.'),
( 3.8900,   6.8700, 'Oil spill',     NOW() - INTERVAL '10 days',   0.90, 'Critical', 19.60, 'Investigating', 'Verified',       'Sentinel-1 SAR',  5.1, 'Moderate','S1B_2026_WA_002',   'Artisanal refinery sabotage area. Acute spill event.'),
( 5.2400,   5.8900, 'Oil spill',     NOW() - INTERVAL '17 days',   0.77, 'High',      8.70, 'Pending',       'Unverified',     'Sentinel-1 SAR',  3.8, 'Calm',    'S1A_2026_WA_003',   'Bunkering vessel discharge. Night operation suspected.'),
( 4.1200,   7.3400, 'Non Oil spill', NOW() - INTERVAL '23 days',   0.24, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-2 MSI',  2.9, 'Calm',    'S2B_2026_WA_004',   'River sediment outflow. High turbidity area, no oil signature.'),
( 3.5600,   6.5600, 'Oil spill',     NOW() - INTERVAL '38 days',   0.83, 'High',     13.20, 'Contained',     'Verified',       'Sentinel-1 SAR',  6.0, 'Moderate','S1B_2026_WA_005',   'Offshore wellhead blowout. Boom deployed. Partially contained.'),

-- ── Mediterranean Sea ──────────────────────────────────────────────────────
(36.8500,  14.5600, 'Oil spill',     NOW() - INTERVAL '15 days',   0.73, 'Medium',    4.10, 'Investigating', 'Unverified',     'Sentinel-1 SAR',  5.5, 'Moderate','S1A_2026_MED_001',  'Sicilian Channel. Unknown vessel discharge.'),
(37.2300,  23.4500, 'Non Oil spill', NOW() - INTERVAL '28 days',   0.19, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-2 MSI',  2.0, 'Calm',    'S2A_2026_MED_002',  'Greek waters. Biological surface film. Marine algae origin.'),
(35.1200,  14.4500, 'Oil spill',     NOW() - INTERVAL '42 days',   0.68, 'Medium',    3.80, 'Cleaned',       'Verified',       'Sentinel-1 SAR',  6.8, 'Moderate','S1B_2026_MED_003',  'Malta offshore. Tanker bilge discharge confirmed.'),
(38.4500,  15.6700, 'Oil spill',     NOW() - INTERVAL '58 days',   0.81, 'High',      7.60, 'Cleaned',       'Verified',       'Sentinel-1 SAR',  7.5, 'Moderate','S1A_2026_MED_004',  'Southern Italy coast. Emergency response concluded.'),

-- ── Southeast Asia ─────────────────────────────────────────────────────────
( 5.4500, 103.7800, 'Oil spill',     NOW() - INTERVAL '2 days',    0.88, 'High',      9.30, 'Responding',    'Verified',       'Sentinel-1 SAR',  6.3, 'Moderate','S1A_2026_SEA_001',  'South China Sea. Malaysia offshore block spill.'),
( 1.2300, 104.5600, 'Oil spill',     NOW() - INTERVAL '21 days',   0.75, 'High',      6.10, 'Contained',     'Verified',       'Sentinel-1 SAR',  5.7, 'Moderate','S1B_2026_SEA_002',  'Singapore Strait. Vessel grounding and fuel leak.'),
( 3.8700, 108.9800, 'Non Oil spill', NOW() - INTERVAL '34 days',   0.27, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-2 MSI',  3.1, 'Calm',    'S2B_2026_SEA_003',  'Natural seep area. Biogenic hydrocarbon field.'),
( 6.1200, 106.4500, 'Oil spill',     NOW() - INTERVAL '47 days',   0.70, 'Medium',    4.50, 'Investigating', 'Unverified',     'Sentinel-1 SAR',  4.9, 'Moderate','S1A_2026_SEA_004',  'Java Sea. Tanker routing incident. Indonesian coast guard notified.'),

-- ── Black Sea ──────────────────────────────────────────────────────────────
(43.5600,  33.4500, 'Oil spill',     NOW() - INTERVAL '8 days',    0.80, 'High',      8.80, 'Investigating', 'Verified',       'Sentinel-1 SAR',  9.1, 'Rough',   'S1A_2026_BS_001',   'Ukrainian offshore infrastructure damage.'),
(42.1200,  29.8700, 'Oil spill',     NOW() - INTERVAL '27 days',   0.74, 'Medium',    5.60, 'Pending',       'Unverified',     'Sentinel-1 SAR',  7.8, 'Moderate','S1B_2026_BS_002',   'Turkish waters. Vessel emergency ballast discharge.'),
(44.7800,  37.2300, 'Non Oil spill', NOW() - INTERVAL '50 days',   0.23, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-2 MSI',  3.4, 'Calm',    'S2A_2026_BS_003',   'Krasnodar area. River outflow turbidity plume.'),

-- ── Arctic / Barents Sea ────────────────────────────────────────────────────
(70.4500,  52.3400, 'Oil spill',     NOW() - INTERVAL '32 days',   0.79, 'High',     11.70, 'Investigating', 'Verified',       'Sentinel-1 SAR', 14.8, 'Very Rough','S1A_2026_ARC_001', 'Barents Sea. Prirazlomnaya platform vicinity.'),
(72.1200,  55.6700, 'Non Oil spill', NOW() - INTERVAL '65 days',   0.20, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-1 SAR', 11.5, 'Rough',   'S1B_2026_ARC_002',  'Ice melt surface turbulence. No oil detected.'),

-- ── Gulf of Guinea ─────────────────────────────────────────────────────────
( 0.3400,   6.7800, 'Oil spill',     NOW() - INTERVAL '6 days',    0.86, 'High',      8.10, 'Responding',    'Verified',       'Sentinel-1 SAR',  4.2, 'Moderate','S1A_2026_GG_001',   'Equatorial Guinea offshore. FPSO offloading incident.'),
(-0.8900,   8.6700, 'Oil spill',     NOW() - INTERVAL '29 days',   0.71, 'Medium',    4.80, 'Cleaned',       'Verified',       'Sentinel-1 SAR',  3.9, 'Calm',    'S1B_2026_GG_002',   'Gabon coast. Subsea pipeline corrosion failure.'),

-- ── South America (Venezuela / Brazil) ────────────────────────────────────
(10.7800, -63.2300, 'Oil spill',     NOW() - INTERVAL '11 days',   0.83, 'High',      7.90, 'Investigating', 'Verified',       'Sentinel-1 SAR',  6.4, 'Moderate','S1A_2026_SA_001',   'Venezuelan coast. Lake Maracaibo offshore continuation.'),
(-1.4500, -49.8900, 'Oil spill',     NOW() - INTERVAL '36 days',   0.76, 'High',      9.20, 'Contained',     'Verified',       'Sentinel-1 SAR',  5.8, 'Moderate','S1B_2026_SA_002',   'Pará state, Brazil. Pre-salt field transfer incident.'),
( 5.6700, -57.8900, 'Non Oil spill', NOW() - INTERVAL '53 days',   0.26, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-2 MSI',  3.3, 'Calm',    'S2A_2026_SA_003',   'Guyana coast. Natural oil seep field. Background level.'),

-- ── Red Sea ────────────────────────────────────────────────────────────────
(23.5600,  38.7800, 'Oil spill',     NOW() - INTERVAL '18 days',   0.77, 'High',      6.30, 'Investigating', 'Unverified',     'Sentinel-1 SAR',  8.3, 'Rough',   'S1A_2026_RS_001',   'Saudi Red Sea coast. Ras Tanura regional pipeline.'),
(12.8900,  43.2300, 'Oil spill',     NOW() - INTERVAL '44 days',   0.69, 'Medium',    3.70, 'Pending',       'Unverified',     'Sentinel-1 SAR',  9.7, 'Rough',   'S1B_2026_RS_002',   'Bab el-Mandab strait. Conflict-related tanker damage.'),

-- ── Additional Caspian (Kazakhstan) ────────────────────────────────────────
(50.4500,  51.8900, 'Oil spill',     NOW() - INTERVAL '24 days',   0.82, 'High',      8.60, 'Investigating', 'Verified',       'Sentinel-1 SAR',  7.2, 'Moderate','S1A_2026_CAS_001',  'Kashagan field area. Subsea pipeline failure.'),
(46.8900,  52.3400, 'Non Oil spill', NOW() - INTERVAL '70 days',   0.17, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-2 MSI',  2.7, 'Calm',    'S2B_2026_CAS_002',  'Northern Caspian. Sediment resuspension event.'),

-- ── Older historical records (3–12 months ago) ─────────────────────────────
(40.2380,  50.7800, 'Oil spill',     NOW() - INTERVAL '90 days',   0.86, 'High',      9.80, 'Cleaned',       'Verified',       'Sentinel-1 SAR',  6.1, 'Moderate','S1A_2025_NEFT_001', 'Neft Dashlari pipeline junction PJ-1. Fully remediated Q1.'),
(28.9100, -89.4500, 'Oil spill',     NOW() - INTERVAL '120 days',  0.79, 'High',      7.30, 'Cleaned',       'Verified',       'Sentinel-1 SAR',  8.5, 'Rough',   'S1B_2025_GOM_001',  'Gulf of Mexico. Historical 2025 incident. Closed case.'),
(57.3400,   1.6700, 'Oil spill',     NOW() - INTERVAL '150 days',  0.73, 'Medium',    5.10, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 13.0, 'Very Rough','S1A_2025_NS_001',  'North Sea historical. Winter storm spill. Closed.'),
( 4.3200,   6.2100, 'Oil spill',     NOW() - INTERVAL '180 days',  0.92, 'Critical', 24.50, 'Cleaned',       'Verified',       'Sentinel-1 SAR',  5.0, 'Moderate','S1B_2025_WA_001',   'Niger Delta major incident. 6 months remediation completed.'),
(26.4500,  56.1200, 'Oil spill',     NOW() - INTERVAL '210 days',  0.80, 'High',      8.20, 'Cleaned',       'Verified',       'Sentinel-1 SAR',  7.8, 'Moderate','S1A_2025_PG_001',   'Persian Gulf historical. Tanker collision. Closed case.'),
(36.2300,  14.1200, 'Oil spill',     NOW() - INTERVAL '240 days',  0.68, 'Medium',    4.40, 'Cleaned',       'Verified',       'Sentinel-1 SAR',  6.5, 'Moderate','S1B_2025_MED_001',  'Mediterranean historical. Malta SAR zone. Closed.'),
(40.2200,  50.8300, 'Non Oil spill', NOW() - INTERVAL '270 days',  0.24, 'Low',       0.00, 'Pending',       'False Positive', 'Sentinel-2 MSI',  3.0, 'Calm',    'S2A_2025_NEFT_001', 'Neft Dashlari 2025. Seasonal algal bloom, no oil.'),
(29.0000, -90.0000, 'Oil spill',     NOW() - INTERVAL '300 days',  0.77, 'High',      6.90, 'Cleaned',       'Verified',       'Sentinel-1 SAR',  7.3, 'Moderate','S1A_2025_GOM_002',  'GOM 2025 Q2 incident. Hurricane season detection.'),
(60.1200,   2.9000, 'Oil spill',     NOW() - INTERVAL '330 days',  0.71, 'Medium',    4.60, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 15.2, 'Very Rough','S1B_2025_NS_002',  'North Sea 2025. Winter spill. Norwegian sector.'),
( 5.0000,   6.9000, 'Oil spill',     NOW() - INTERVAL '360 days',  0.88, 'High',     10.10, 'Cleaned',       'Verified',       'Sentinel-1 SAR',  4.8, 'Moderate','S1A_2025_WA_002',   'Niger Delta 2025 Q1 major event. Year-old incident.');
