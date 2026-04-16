/*
  # Add Global Oil Spill Detections

  Inserts 130 additional globally distributed oil spill detection records across
  8 major maritime and oil-producing regions:

  1. Gulf of Mexico (~25°N, 90°W) — 20 records
  2. North Sea (~56°N, 3°E) — 18 records
  3. Persian Gulf (~26°N, 52°E) — 18 records
  4. Niger Delta Coast (~4°N, 6°E) — 18 records
  5. South China Sea (~12°N, 112°E) — 16 records
  6. Mediterranean Sea (~34°N, 18°E) — 16 records
  7. Coast of Brazil / Santos Basin (~24°S, 43°W) — 14 records
  8. Caspian Sea / Neft Dashlari (~40.3°N, 50.5°E) — 10 records

  Data characteristics:
  - Coordinates jittered ±0.3–1.5° around region centers
  - Confidence scores span 0.12–0.97 (low/medium/high mix)
  - Area affected 0.2–85 km² to simulate small leaks and major spills
  - Detection dates spread across last 365 days
  - Mix of Oil spill / Non Oil spill statuses, all severities, all response states

  Security: All records inserted as anon, RLS policies already configured.
*/

INSERT INTO oil_spill_detections
  (latitude, longitude, status, detected_at, confidence, severity, area_affected_km2,
   response_status, validation_status, source, copernicus_product_id, notes)
VALUES

-- ══════════════════════════════════════════════════════
-- GULF OF MEXICO  (~25°N, ~90°W)  — 20 records
-- ══════════════════════════════════════════════════════
(25.842, -89.431, 'Oil spill',     NOW()-'3 days'::interval,  0.94, 'Critical', 42.10, 'Responding',    'Verified',       'Sentinel-1 SAR', 'S1A_GOM_001', 'Deepwater platform leak, large surface sheen drifting SW.'),
(24.711, -90.882, 'Oil spill',     NOW()-'8 days'::interval,  0.81, 'High',     18.50, 'Investigating', 'Verified',       'Sentinel-1 SAR', 'S1A_GOM_002', 'Pipeline rupture near Mississippi Canyon block.'),
(26.350, -88.920, 'Oil spill',     NOW()-'15 days'::interval, 0.73, 'High',     11.20, 'Responding',    'Verified',       'Sentinel-1 SAR', 'S1A_GOM_003', 'Subsea wellhead seepage detected via SAR backscatter anomaly.'),
(25.100, -91.550, 'Non Oil spill', NOW()-'22 days'::interval, 0.38, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_GOM_004', 'Algal bloom misclassified; biogenic film confirmed.'),
(24.300, -89.100, 'Oil spill',     NOW()-'30 days'::interval, 0.88, 'High',     22.30, 'Contained',     'Verified',       'Sentinel-1 SAR', 'S1A_GOM_005', 'Tanker collision spill, boom deployed, partially contained.'),
(26.800, -90.200, 'Oil spill',     NOW()-'45 days'::interval, 0.62, 'Medium',   6.80,  'Investigating', 'Unverified',     'Sentinel-1 SAR', 'S1A_GOM_006', 'Possible sheen from drilling operations, awaiting verification.'),
(25.520, -88.430, 'Non Oil spill', NOW()-'52 days'::interval, 0.29, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_GOM_007', 'Surface roughness pattern from wind shear, no hydrocarbon.'),
(24.900, -91.100, 'Oil spill',     NOW()-'60 days'::interval, 0.91, 'Critical', 58.40, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_GOM_008', 'Major blowout, cleanup operations complete after 45 days.'),
(27.100, -89.650, 'Oil spill',     NOW()-'75 days'::interval, 0.76, 'High',     14.70, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_GOM_009', 'Platform deck drainage overflow during storm event.'),
(25.410, -90.740, 'Non Oil spill', NOW()-'88 days'::interval, 0.41, 'Low',      0.00,  'Pending',       'Unverified',     'Sentinel-2 MSI', 'S2B_GOM_010', 'Sediment plume from Mississippi River outflow.'),
(24.150, -88.800, 'Oil spill',     NOW()-'100 days'::interval,0.69, 'Medium',   8.30,  'Contained',     'Verified',       'Sentinel-1 SAR', 'S1A_GOM_011', 'Corroded riser connection; slow seep confirmed by ROV.'),
(26.220, -91.900, 'Oil spill',     NOW()-'115 days'::interval,0.55, 'Medium',   4.20,  'Investigating', 'Unverified',     'Sentinel-1 SAR', 'S1A_GOM_012', 'Diffuse sheen near abandoned well site.'),
(25.970, -89.020, 'Oil spill',     NOW()-'130 days'::interval,0.83, 'High',     19.90, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_GOM_013', 'Wellhead valve seal failure; boom and skimmer deployed.'),
(24.580, -90.380, 'Non Oil spill', NOW()-'145 days'::interval,0.22, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_GOM_014', 'Sunglint artifact, no surface anomaly confirmed.'),
(25.730, -91.450, 'Oil spill',     NOW()-'160 days'::interval,0.78, 'High',     13.50, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_GOM_015', 'Separator unit malfunction on production platform.'),
(26.650, -88.650, 'Oil spill',     NOW()-'185 days'::interval,0.47, 'Medium',   3.80,  'Contained',     'Unverified',     'Sentinel-1 SAR', 'S1A_GOM_016', 'Minor sheen from routine drilling discharge.'),
(24.030, -90.950, 'Oil spill',     NOW()-'210 days'::interval,0.92, 'Critical', 71.20, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_GOM_017', 'Largest spill in region this year; multi-agency response.'),
(25.290, -89.570, 'Non Oil spill', NOW()-'240 days'::interval,0.35, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_GOM_018', 'Sargassum seaweed mat producing surface sheen appearance.'),
(26.480, -90.680, 'Oil spill',     NOW()-'270 days'::interval,0.61, 'Medium',   7.60,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_GOM_019', 'Aged infrastructure leak, plugged after 8 days.'),
(24.890, -88.230, 'Oil spill',     NOW()-'310 days'::interval,0.74, 'High',     15.30, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_GOM_020', 'Transfer hose disconnect during tanker loading.'),

-- ══════════════════════════════════════════════════════
-- NORTH SEA  (~56°N, ~3°E)  — 18 records
-- ══════════════════════════════════════════════════════
(56.821, 2.432,  'Oil spill',     NOW()-'2 days'::interval,  0.89, 'High',     16.80, 'Responding',    'Verified',       'Sentinel-1 SAR', 'S1A_NS_001',  'Forties pipeline leak, North Sea sheen extending 14km.'),
(57.430, 3.880,  'Oil spill',     NOW()-'9 days'::interval,  0.71, 'High',     9.40,  'Investigating', 'Verified',       'Sentinel-1 SAR', 'S1A_NS_002',  'Aging Brent field infrastructure corrosion detected.'),
(55.920, 1.650,  'Non Oil spill', NOW()-'17 days'::interval, 0.31, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_NS_003',  'Wave slick from tidal current; no hydrocarbon signature.'),
(58.100, 4.220,  'Oil spill',     NOW()-'25 days'::interval, 0.86, 'High',     21.00, 'Contained',     'Verified',       'Sentinel-1 SAR', 'S1A_NS_004',  'Subsea umbilical failure at Elgin-Franklin complex.'),
(56.340, 2.880,  'Oil spill',     NOW()-'38 days'::interval, 0.58, 'Medium',   5.50,  'Investigating', 'Unverified',     'Sentinel-1 SAR', 'S1A_NS_005',  'Minor sheen near Ekofisk production cluster.'),
(57.760, 1.920,  'Non Oil spill', NOW()-'50 days'::interval, 0.24, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_NS_006',  'Phytoplankton bloom; biogenic film confirmed by spectrometry.'),
(55.530, 3.760,  'Oil spill',     NOW()-'65 days'::interval, 0.93, 'Critical', 47.30, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_NS_007',  'Dunlin A platform blowout; emergency shutdown enacted.'),
(58.640, 2.540,  'Oil spill',     NOW()-'80 days'::interval, 0.67, 'Medium',   8.90,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_NS_008',  'Crane vessel fuel spill during heavy weather operations.'),
(56.080, 4.450,  'Oil spill',     NOW()-'95 days'::interval, 0.79, 'High',     12.60, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_NS_009',  'Flange failure on Sleipner gas condensate export line.'),
(57.200, 0.980,  'Non Oil spill', NOW()-'112 days'::interval,0.44, 'Low',      0.00,  'Pending',       'Unverified',     'Sentinel-2 MSI', 'S2B_NS_010',  'Ship wake pattern; confirmed clean by aerial surveillance.'),
(56.700, 3.120,  'Oil spill',     NOW()-'128 days'::interval,0.64, 'Medium',   6.20,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_NS_011',  'Pump seal failure on Statfjord unit production vessel.'),
(58.280, 4.680,  'Oil spill',     NOW()-'155 days'::interval,0.82, 'High',     17.40, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_NS_012',  'Ninian Central platform hydraulic oil spill.'),
(55.710, 2.200,  'Non Oil spill', NOW()-'170 days'::interval,0.27, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_NS_013',  'Jellyfish aggregation producing surface texture anomaly.'),
(57.550, 3.440,  'Oil spill',     NOW()-'192 days'::interval,0.72, 'High',     10.80, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_NS_014',  'Heidrun TLP tethered production line micro-fracture.'),
(56.150, 1.340,  'Oil spill',     NOW()-'220 days'::interval,0.53, 'Medium',   4.10,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_NS_015',  'Routine inspection finds historical seep from decommissioned well.'),
(58.900, 3.000,  'Oil spill',     NOW()-'255 days'::interval,0.88, 'High',     20.10, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_NS_016',  'Valhall field riser clamp failure, response boats deployed.'),
(57.020, 4.910,  'Oil spill',     NOW()-'290 days'::interval,0.61, 'Medium',   7.30,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_NS_017',  'Oseberg C export pump mechanical failure.'),
(55.400, 2.680,  'Non Oil spill', NOW()-'340 days'::interval,0.19, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_NS_018',  'Surface wind streaks misclassified by automated system.'),

-- ══════════════════════════════════════════════════════
-- PERSIAN GULF  (~26°N, ~52°E)  — 18 records
-- ══════════════════════════════════════════════════════
(26.320, 52.880, 'Oil spill',     NOW()-'1 day'::interval,   0.96, 'Critical', 38.70, 'Responding',    'Verified',       'Sentinel-1 SAR', 'S1A_PG_001',  'Crude export terminal overflow near Kharg Island.'),
(25.710, 51.440, 'Oil spill',     NOW()-'7 days'::interval,  0.84, 'High',     17.20, 'Investigating', 'Verified',       'Sentinel-1 SAR', 'S1A_PG_002',  'Offshore drilling platform seep, Qatar sector.'),
(27.100, 53.200, 'Non Oil spill', NOW()-'14 days'::interval, 0.36, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_PG_003',  'Wind-driven sediment resuspension from Hormuz Strait.'),
(25.080, 52.100, 'Oil spill',     NOW()-'21 days'::interval, 0.77, 'High',     13.90, 'Contained',     'Verified',       'Sentinel-1 SAR', 'S1A_PG_004',  'Tanker single-hull vessel minor collision, Abu Dhabi waters.'),
(26.880, 51.780, 'Oil spill',     NOW()-'33 days'::interval, 0.59, 'Medium',   5.80,  'Investigating', 'Unverified',     'Sentinel-1 SAR', 'S1A_PG_005',  'Aging pipeline along Iranian coastline; awaiting NIOC confirmation.'),
(24.900, 53.560, 'Non Oil spill', NOW()-'47 days'::interval, 0.28, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_PG_006',  'Biogenic surface film near Musandam Peninsula.'),
(26.500, 50.920, 'Oil spill',     NOW()-'58 days'::interval, 0.91, 'Critical', 54.80, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_PG_007',  'Al-Ahmadi loading terminal catastrophic valve failure.'),
(27.340, 52.340, 'Oil spill',     NOW()-'72 days'::interval, 0.65, 'Medium',   7.50,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_PG_008',  'Lavan Island offshore storage tank overflow.'),
(25.420, 51.020, 'Oil spill',     NOW()-'85 days'::interval, 0.80, 'High',     15.40, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_PG_009',  'Bahrain offshore field pump failure; response within 6 hours.'),
(26.150, 53.780, 'Non Oil spill', NOW()-'98 days'::interval, 0.42, 'Low',      0.00,  'Pending',       'Unverified',     'Sentinel-2 MSI', 'S2B_PG_010',  'Jellyfish bloom producing surface sheen near Qeshm.'),
(24.680, 52.680, 'Oil spill',     NOW()-'118 days'::interval,0.73, 'High',     11.10, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_PG_011',  'Sharjah offshore platform corroded manifold.'),
(27.620, 50.680, 'Oil spill',     NOW()-'140 days'::interval,0.57, 'Medium',   4.60,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_PG_012',  'Kuwait Oil Company offshore field minor seep.'),
(25.900, 52.440, 'Non Oil spill', NOW()-'162 days'::interval,0.33, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_PG_013',  'Thermal stratification artifact in SAR image.'),
(26.780, 53.980, 'Oil spill',     NOW()-'188 days'::interval,0.85, 'High',     20.80, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_PG_014',  'IOOC Persian platform export line pinhole fracture.'),
(25.280, 50.560, 'Oil spill',     NOW()-'215 days'::interval,0.48, 'Medium',   3.40,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_PG_015',  'Safaniyah field minor wellhead seepage.'),
(26.040, 51.860, 'Oil spill',     NOW()-'248 days'::interval,0.90, 'Critical', 63.10, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_PG_016',  'Ras Tanura terminal blowout, largest PG event of the year.'),
(27.500, 51.440, 'Non Oil spill', NOW()-'280 days'::interval,0.21, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_PG_017',  'Dust storm deposit creating surface film near Bushehr.'),
(25.600, 53.100, 'Oil spill',     NOW()-'330 days'::interval,0.69, 'Medium',   9.20,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_PG_018',  'Sirri field aging infrastructure subsea leak.'),

-- ══════════════════════════════════════════════════════
-- NIGER DELTA COAST  (~4°N, ~6°E)  — 18 records
-- ══════════════════════════════════════════════════════
(4.820, 6.430,  'Oil spill',     NOW()-'4 days'::interval,  0.93, 'Critical', 31.50, 'Responding',    'Verified',       'Sentinel-1 SAR', 'S1A_ND_001',  'Bonny export terminal pipeline rupture, large coastal sheen.'),
(3.980, 5.780,  'Oil spill',     NOW()-'10 days'::interval, 0.78, 'High',     14.20, 'Investigating', 'Verified',       'Sentinel-1 SAR', 'S1A_ND_002',  'Trans Niger Pipeline third-party interference spill.'),
(5.340, 6.920,  'Non Oil spill', NOW()-'18 days'::interval, 0.34, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_ND_003',  'Mangrove tannin runoff from seasonal flooding.'),
(4.450, 7.120,  'Oil spill',     NOW()-'27 days'::interval, 0.85, 'High',     23.60, 'Responding',    'Verified',       'Sentinel-1 SAR', 'S1A_ND_004',  'Bonga FPSO transfer line spill, shallow water.'),
(3.620, 6.340,  'Oil spill',     NOW()-'40 days'::interval, 0.61, 'Medium',   6.80,  'Investigating', 'Unverified',     'Sentinel-1 SAR', 'S1A_ND_005',  'Brass LNG terminal vicinity sheen, source disputed.'),
(5.100, 5.980,  'Non Oil spill', NOW()-'53 days'::interval, 0.25, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_ND_006',  'Agricultural runoff producing surface film.'),
(4.230, 7.550,  'Oil spill',     NOW()-'68 days'::interval, 0.90, 'Critical', 49.20, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_ND_007',  'Forcados terminal 48-inch export manifold catastrophic failure.'),
(3.810, 5.460,  'Oil spill',     NOW()-'82 days'::interval, 0.66, 'Medium',   8.10,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_ND_008',  'Escravos pipeline sabotage spill; cleanup 3 weeks.'),
(5.520, 6.650,  'Oil spill',     NOW()-'97 days'::interval, 0.82, 'High',     18.30, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_ND_009',  'Pennington field FPSO bilge water contamination.'),
(4.690, 7.860,  'Non Oil spill', NOW()-'113 days'::interval,0.40, 'Low',      0.00,  'Pending',       'Unverified',     'Sentinel-2 MSI', 'S2B_ND_010',  'River sediment plume from Niger Delta outflow.'),
(3.440, 6.820,  'Oil spill',     NOW()-'135 days'::interval,0.74, 'High',     12.80, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_ND_011',  'Otumara community pipeline corrosion spill.'),
(5.780, 7.230,  'Oil spill',     NOW()-'158 days'::interval,0.55, 'Medium',   4.50,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_ND_012',  'Shallow gas blow-out with surface oily residue.'),
(4.060, 6.080,  'Non Oil spill', NOW()-'180 days'::interval,0.30, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_ND_013',  'Aquatic vegetation bloom in tidal estuary.'),
(3.280, 5.640,  'Oil spill',     NOW()-'205 days'::interval,0.87, 'High',     21.40, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_ND_014',  'Submarine pipeline stress fracture near Warri river mouth.'),
(5.230, 7.680,  'Oil spill',     NOW()-'235 days'::interval,0.50, 'Medium',   3.90,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_ND_015',  'Offshore loading buoy hydraulic system rupture.'),
(4.900, 6.200,  'Oil spill',     NOW()-'265 days'::interval,0.95, 'Critical', 84.50, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_ND_016',  'Largest Niger Delta spill this year; international cleanup aid.'),
(3.650, 7.420,  'Non Oil spill', NOW()-'300 days'::interval,0.18, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_ND_017',  'Coastal upwelling pattern misidentified.'),
(4.380, 5.880,  'Oil spill',     NOW()-'345 days'::interval,0.71, 'High',     10.60, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_ND_018',  'Aged single-skin tanker ballast water contamination.'),

-- ══════════════════════════════════════════════════════
-- SOUTH CHINA SEA  (~12°N, ~112°E)  — 16 records
-- ══════════════════════════════════════════════════════
(11.920, 112.430, 'Oil spill',     NOW()-'5 days'::interval,  0.87, 'High',     19.20, 'Responding',    'Verified',       'Sentinel-1 SAR', 'S1A_SCS_001', 'Vanguard Bank drilling activity surface sheen.'),
(13.150, 111.680, 'Oil spill',     NOW()-'12 days'::interval, 0.72, 'High',     10.80, 'Investigating', 'Verified',       'Sentinel-1 SAR', 'S1A_SCS_002', 'Chinese CNOOC platform export line leak, Paracel area.'),
(10.820, 113.240, 'Non Oil spill', NOW()-'20 days'::interval, 0.37, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_SCS_003', 'Coral reef reflection artifact in satellite image.'),
(12.560, 110.920, 'Oil spill',     NOW()-'35 days'::interval, 0.83, 'High',     24.10, 'Contained',     'Verified',       'Sentinel-1 SAR', 'S1A_SCS_004', 'Petronas Carigali FPSO mooring line tanker collision.'),
(11.340, 113.870, 'Oil spill',     NOW()-'49 days'::interval, 0.56, 'Medium',   5.30,  'Investigating', 'Unverified',     'Sentinel-1 SAR', 'S1A_SCS_005', 'Contested waters; spill observed, source unconfirmed.'),
(13.800, 112.150, 'Non Oil spill', NOW()-'63 days'::interval, 0.29, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_SCS_006', 'Monsoon swell surface texture misidentified.'),
(10.440, 111.560, 'Oil spill',     NOW()-'78 days'::interval, 0.91, 'Critical', 52.40, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_SCS_007', 'Luconia field platform catastrophic wellhead blowout.'),
(12.100, 114.220, 'Oil spill',     NOW()-'92 days'::interval, 0.68, 'Medium',   8.60,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_SCS_008', 'Spratly Islands area seepage from natural fissure.'),
(11.670, 110.340, 'Oil spill',     NOW()-'108 days'::interval,0.79, 'High',     14.30, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_SCS_009', 'White Tiger field (Bach Ho) pipeline corrosion spill.'),
(13.420, 112.980, 'Non Oil spill', NOW()-'125 days'::interval,0.45, 'Low',      0.00,  'Pending',       'Unverified',     'Sentinel-2 MSI', 'S2B_SCS_010', 'Fishing vessel fuel sheen; below detection threshold.'),
(10.180, 113.640, 'Oil spill',     NOW()-'148 days'::interval,0.76, 'High',     16.90, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_SCS_011', 'Brunei Shell deepwater umbilical failure.'),
(12.780, 111.080, 'Oil spill',     NOW()-'175 days'::interval,0.53, 'Medium',   4.70,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_SCS_012', 'Nam Con Son gas field condensate surface sheen.'),
(11.050, 112.760, 'Non Oil spill', NOW()-'200 days'::interval,0.23, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_SCS_013', 'Typhoon wave foam pattern misclassified.'),
(13.600, 110.620, 'Oil spill',     NOW()-'230 days'::interval,0.88, 'High',     22.80, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_SCS_014', 'Da Rang field production platform export pump failure.'),
(11.480, 114.580, 'Oil spill',     NOW()-'275 days'::interval,0.60, 'Medium',   7.10,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_SCS_015', 'Reed Bank area natural seep, recurring location.'),
(12.320, 112.620, 'Non Oil spill', NOW()-'320 days'::interval,0.32, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_SCS_016', 'Sea surface temperature front artifact.'),

-- ══════════════════════════════════════════════════════
-- MEDITERRANEAN SEA  (~34°N, ~18°E)  — 16 records
-- ══════════════════════════════════════════════════════
(34.820, 18.430, 'Oil spill',     NOW()-'6 days'::interval,  0.84, 'High',     14.60, 'Responding',    'Verified',       'Sentinel-1 SAR', 'S1A_MED_001', 'Libya Zueitina terminal tanker loading spill.'),
(36.150, 17.680, 'Oil spill',     NOW()-'13 days'::interval, 0.69, 'Medium',   8.20,  'Investigating', 'Verified',       'Sentinel-1 SAR', 'S1A_MED_002', 'Offshore Sicily hydrocarbon seep detected by SAR.'),
(33.420, 19.220, 'Non Oil spill', NOW()-'23 days'::interval, 0.33, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_MED_003', 'Algal bloom from Nile River nutrient runoff.'),
(35.680, 16.920, 'Oil spill',     NOW()-'37 days'::interval, 0.88, 'High',     20.30, 'Contained',     'Verified',       'Sentinel-1 SAR', 'S1A_MED_004', 'ENI offshore Sicilian Channel platform wellhead seep.'),
(34.100, 20.560, 'Oil spill',     NOW()-'54 days'::interval, 0.55, 'Medium',   4.30,  'Investigating', 'Unverified',     'Sentinel-1 SAR', 'S1A_MED_005', 'Benghazi coastal waters: source vessel not identified.'),
(36.680, 18.120, 'Non Oil spill', NOW()-'70 days'::interval, 0.27, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_MED_006', 'Posidonia meadow surface residue.'),
(33.800, 17.540, 'Oil spill',     NOW()-'87 days'::interval, 0.93, 'Critical', 48.70, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_MED_007', 'Tanker grounding off Maltese coast; hull breach.'),
(35.280, 19.780, 'Oil spill',     NOW()-'102 days'::interval,0.66, 'Medium',   7.80,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_MED_008', 'Greek Aegean shipping lane bilge discharge.'),
(34.560, 16.380, 'Oil spill',     NOW()-'120 days'::interval,0.81, 'High',     17.50, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_MED_009', 'Tunisian offshore El Borma field production line leak.'),
(36.920, 19.440, 'Non Oil spill', NOW()-'138 days'::interval,0.43, 'Low',      0.00,  'Pending',       'Unverified',     'Sentinel-2 MSI', 'S2B_MED_010', 'Adriatic coastal sediment discharge from Po River.'),
(33.140, 18.880, 'Oil spill',     NOW()-'157 days'::interval,0.78, 'High',     13.10, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_MED_011', 'Egyptian Med Gas zone pipeline inspection finds leak.'),
(35.940, 16.060, 'Oil spill',     NOW()-'182 days'::interval,0.51, 'Medium',   3.80,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_MED_012', 'Lampedusa waters vessel anchor damage to pipeline.'),
(34.340, 20.980, 'Non Oil spill', NOW()-'208 days'::interval,0.26, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_MED_013', 'Sirocco wind event surface slick pattern.'),
(36.460, 17.360, 'Oil spill',     NOW()-'238 days'::interval,0.87, 'High',     22.00, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_MED_014', 'Italian Eni Adriatic drilling rig minor blowout.'),
(33.620, 19.640, 'Oil spill',     NOW()-'272 days'::interval,0.62, 'Medium',   6.40,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_MED_015', 'Gulf of Sidra natural bitumen seep, recurring annually.'),
(35.500, 18.560, 'Oil spill',     NOW()-'315 days'::interval,0.74, 'High',     11.90, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_MED_016', 'Malta channel historical spill from decommissioned tanker.'),

-- ══════════════════════════════════════════════════════
-- BRAZIL / SANTOS BASIN  (~24°S, ~43°W)  — 14 records
-- ══════════════════════════════════════════════════════
(-23.820, -43.430, 'Oil spill',     NOW()-'7 days'::interval,  0.91, 'Critical', 36.80, 'Responding',    'Verified',       'Sentinel-1 SAR', 'S1A_BR_001',  'Petrobras pre-salt FPSO P-70 riser flex failure.'),
(-24.680, -42.880, 'Oil spill',     NOW()-'16 days'::interval, 0.76, 'High',     12.50, 'Investigating', 'Verified',       'Sentinel-1 SAR', 'S1A_BR_002',  'Santos Basin deepwater connector leak at 2200m.'),
(-22.940, -43.980, 'Non Oil spill', NOW()-'28 days'::interval, 0.38, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_BR_003',  'Guanabara Bay sediment plume from Paraíba do Sul.'),
(-25.420, -43.660, 'Oil spill',     NOW()-'42 days'::interval, 0.82, 'High',     18.40, 'Contained',     'Verified',       'Sentinel-1 SAR', 'S1A_BR_004',  'Offshore Cubatão industrial effluent mixed spill.'),
(-23.380, -42.140, 'Oil spill',     NOW()-'57 days'::interval, 0.60, 'Medium',   6.10,  'Investigating', 'Unverified',     'Sentinel-1 SAR', 'S1A_BR_005',  'Campos Basin aging pipeline field anomaly.'),
(-24.180, -44.220, 'Non Oil spill', NOW()-'74 days'::interval, 0.31, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_BR_006',  'Phytoplankton bloom from Brazil current upwelling.'),
(-25.800, -42.560, 'Oil spill',     NOW()-'90 days'::interval, 0.89, 'High',     25.30, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_BR_007',  'Mexilhão gas condensate field surface contamination.'),
(-22.560, -43.200, 'Oil spill',     NOW()-'107 days'::interval,0.65, 'Medium',   7.90,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_BR_008',  'FPSO loading arm disconnect spill.'),
(-24.920, -44.680, 'Oil spill',     NOW()-'124 days'::interval,0.84, 'High',     19.60, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_BR_009',  'Pre-salt well intervention surface sheen.'),
(-23.140, -41.880, 'Non Oil spill', NOW()-'145 days'::interval,0.44, 'Low',      0.00,  'Pending',       'Unverified',     'Sentinel-2 MSI', 'S2B_BR_010',  'São Tomé cape current surface pattern.'),
(-25.100, -43.020, 'Oil spill',     NOW()-'170 days'::interval,0.72, 'High',     10.40, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_BR_011',  'Libra consortium FPSO emergency shutdown spill.'),
(-22.280, -44.560, 'Oil spill',     NOW()-'198 days'::interval,0.54, 'Medium',   4.20,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_BR_012',  'Historical tanker ballast contamination event.'),
(-24.460, -42.420, 'Non Oil spill', NOW()-'232 days'::interval,0.22, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_BR_013',  'Biomass surface slick from coastal kelp die-off.'),
(-23.640, -43.780, 'Oil spill',     NOW()-'285 days'::interval,0.80, 'High',     16.70, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_BR_014',  'Tupi field subsea tree cap connector fatigue failure.'),

-- ══════════════════════════════════════════════════════
-- CASPIAN SEA / NEFT DASHLARI  (~40.3°N, ~50.5°E)  — 10 records
-- ══════════════════════════════════════════════════════
(40.450, 50.320, 'Oil spill',     NOW()-'2 days'::interval,  0.95, 'Critical', 16.80, 'Responding',    'Verified',       'Sentinel-1 SAR', 'S1A_CASP_001','Neft Dashlari north cluster wellhead seal failure.'),
(40.180, 50.680, 'Oil spill',     NOW()-'11 days'::interval, 0.79, 'High',     11.20, 'Investigating', 'Verified',       'Sentinel-1 SAR', 'S1A_CASP_002','ACG field AIOC pipeline micro-fracture, Azeri sector.'),
(40.620, 50.140, 'Non Oil spill', NOW()-'24 days'::interval, 0.35, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_CASP_003','Caspian seiche-driven resuspension of bottom sediment.'),
(39.980, 50.860, 'Oil spill',     NOW()-'44 days'::interval, 0.86, 'High',     18.40, 'Contained',     'Verified',       'Sentinel-1 SAR', 'S1A_CASP_004','Shah Deniz field export riser integrity incident.'),
(40.340, 49.920, 'Oil spill',     NOW()-'66 days'::interval, 0.63, 'Medium',   7.30,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_CASP_005','Gunashli platform aging infrastructure overflow.'),
(40.720, 50.560, 'Non Oil spill', NOW()-'90 days'::interval, 0.28, 'Low',      0.00,  'Pending',       'Unverified',     'Sentinel-2 MSI', 'S2B_CASP_006','Wind-driven foam pattern on Caspian north section.'),
(40.060, 50.240, 'Oil spill',     NOW()-'118 days'::interval,0.88, 'High',     22.60, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_CASP_007','Turkmen sector legacy well re-perforation spill.'),
(40.530, 50.780, 'Oil spill',     NOW()-'155 days'::interval,0.52, 'Medium',   4.80,  'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_CASP_008','Neft Dashlari east cluster corroded bridge-platform leak.'),
(39.890, 50.480, 'Non Oil spill', NOW()-'200 days'::interval,0.31, 'Low',      0.00,  'Pending',       'False Positive', 'Sentinel-2 MSI', 'S2B_CASP_009','Algae bloom near Kura River delta outflow.'),
(40.280, 50.060, 'Oil spill',     NOW()-'260 days'::interval,0.74, 'High',     13.90, 'Cleaned',       'Verified',       'Sentinel-1 SAR', 'S1A_CASP_010','Chirag field export pump mechanical seal failure.')

ON CONFLICT (copernicus_product_id) DO NOTHING;
