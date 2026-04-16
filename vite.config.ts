import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { exec } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION FLAGS
// Set ENABLE_REAL_PIPELINE=true to run the actual Sentinel Hub + ML pipeline.
// Set ENABLE_SYNTHETIC_DEMO=true to generate a fake detection point every hour.
// Both can be active simultaneously if desired.
// ─────────────────────────────────────────────────────────────────────────────
const ENABLE_REAL_PIPELINE = true;
const ENABLE_SYNTHETIC_DEMO = false;

export default defineConfig({
  plugins: [
    react(),
    // ═══════════════════════════════════════════════════════════════════════
    // Neft Dashlari Pipeline + Synthetic Demo Generator
    // ═══════════════════════════════════════════════════════════════════════
    {
      name: 'neft-dashlari-api',
      configureServer(server) {
        // ── Real pipeline runner ──────────────────────────────────────────
        const scriptPath = path.resolve('src/scripts/run-neft-dashlari-pipeline.ts');
        const cmd = `node --loader ts-node/esm "${scriptPath}"`;

        function runRealPipeline(trigger: string): Promise<{ success: boolean; count: number; output: string; error?: string }> {
          return new Promise((resolve) => {
            console.log(`[${trigger}] Running Neft Dashlari pipeline...`);
            exec(cmd, { cwd: process.cwd(), timeout: 180000 }, (error, stdout, stderr) => {
              if (error) {
                console.error(`[${trigger}] Pipeline error:`, stderr || error.message);
                resolve({ success: false, count: 0, output: stdout, error: stderr || error.message });
                return;
              }
              const match = stdout.match(/(\d+) detection\(s\) upserted/);
              const count = match ? parseInt(match[1], 10) : 0;
              console.log(`[${trigger}] Pipeline complete — ${count} detection(s) upserted.`);
              resolve({ success: true, count, output: stdout });
            });
          });
        }

        // ── Synthetic demo generator ──────────────────────────────────────
        // 20 realistic hotspots across the Neft Dashlari (Oil Rocks) complex.
        // Each represents a plausible spill location: platform clusters,
        // pipeline junctions, loading berths, and aging infrastructure zones.
        const HOTSPOTS: Array<{ lat: number; lng: number; label: string; spillWeight: number }> = [
          // Central platform cluster (highest activity → highest spill risk)
          { lat: 40.2330, lng: 50.8120, label: 'Central Platform Block A',       spillWeight: 0.80 },
          { lat: 40.2285, lng: 50.8195, label: 'Central Platform Block B',       spillWeight: 0.75 },
          { lat: 40.2365, lng: 50.8060, label: 'North Central Manifold',         spillWeight: 0.70 },

          // Eastern production zone
          { lat: 40.2210, lng: 50.8580, label: 'East Production Platform E1',    spillWeight: 0.65 },
          { lat: 40.2150, lng: 50.8720, label: 'East Production Platform E2',    spillWeight: 0.60 },
          { lat: 40.2070, lng: 50.8850, label: 'East Wellhead Cluster',          spillWeight: 0.55 },

          // Western aging infrastructure (built 1950s–60s, prone to leaks)
          { lat: 40.2400, lng: 50.7650, label: 'West Legacy Platform W1',       spillWeight: 0.85 },
          { lat: 40.2450, lng: 50.7530, label: 'West Legacy Platform W2',       spillWeight: 0.82 },
          { lat: 40.2350, lng: 50.7420, label: 'Decommissioned Block W3',       spillWeight: 0.78 },

          // Pipeline corridors (subsea pipelines connecting platforms)
          { lat: 40.2300, lng: 50.8350, label: 'Pipeline Junction PJ-1',        spillWeight: 0.50 },
          { lat: 40.2180, lng: 50.8430, label: 'Pipeline Corridor Mid-East',    spillWeight: 0.45 },
          { lat: 40.2380, lng: 50.7800, label: 'Pipeline Corridor West',        spillWeight: 0.48 },

          // Loading / transfer berths
          { lat: 40.1950, lng: 50.8200, label: 'Southern Loading Berth',        spillWeight: 0.60 },
          { lat: 40.1900, lng: 50.8350, label: 'Tanker Transfer Point',         spillWeight: 0.58 },

          // Peripheral monitoring areas
          { lat: 40.2550, lng: 50.8000, label: 'North Watch Zone',              spillWeight: 0.30 },
          { lat: 40.2600, lng: 50.8300, label: 'NE Observation Area',           spillWeight: 0.25 },
          { lat: 40.1850, lng: 50.8600, label: 'SE Drift Zone',                 spillWeight: 0.35 },
          { lat: 40.2100, lng: 50.7350, label: 'SW Outflow Area',               spillWeight: 0.40 },

          // Deep-water platforms (newer, lower risk)
          { lat: 40.2700, lng: 50.8550, label: 'Deep-water Platform D1',        spillWeight: 0.20 },
          { lat: 40.2750, lng: 50.8750, label: 'Deep-water Platform D2',        spillWeight: 0.18 },
        ];

        // Severity notes for realistic descriptions
        const SPILL_CAUSES = [
          'corroded subsea pipeline flange',
          'wellhead valve seal failure',
          'aging riser connection',
          'platform deck drainage overflow',
          'transfer hose disconnect during loading',
          'micro-fracture in 1960s-era pipeline',
          'storm-damaged production manifold',
          'routine operational discharge',
          'separator unit malfunction',
          'corroded tank bottom plate',
        ];

        const NON_SPILL_NOTES = [
          'Natural oil seep — biogenic origin confirmed',
          'Sun glint on calm water misclassified initially',
          'Algal bloom (Nodularia sp.) producing surface sheen',
          'Current-driven sediment plume from Kura River outflow',
          'Ship wake turbulence pattern, no hydrocarbon signature',
          'Low-wind slick (marine biogenic film)',
        ];

        let syntheticCounter = 0;

        async function generateSyntheticDetection(trigger: string): Promise<{ success: boolean; count: number }> {
          const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
          const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

          if (!SUPABASE_URL || !SUPABASE_KEY) {
            console.error(`[${trigger}] ❌ Missing Supabase env vars — cannot insert synthetic detection.`);
            return { success: false, count: 0 };
          }

          // Pick a hotspot — weighted random selection favoring higher-risk locations
          const totalWeight = HOTSPOTS.reduce((sum, h) => sum + h.spillWeight, 0);
          let roll = Math.random() * totalWeight;
          let hotspot = HOTSPOTS[0];
          for (const h of HOTSPOTS) {
            roll -= h.spillWeight;
            if (roll <= 0) { hotspot = h; break; }
          }

          // Add small jitter (±150m) so repeated picks at the same hotspot aren't on the exact same pixel
          const jitterLat = (Math.random() - 0.5) * 0.003;  // ~150m
          const jitterLng = (Math.random() - 0.5) * 0.003;
          const lat = hotspot.lat + jitterLat;
          const lng = hotspot.lng + jitterLng;

          // Decide oil vs non-oil: use spillWeight as probability
          const isOil = Math.random() < hotspot.spillWeight;

          // Confidence: oil spills cluster 0.55–0.95, non-oil cluster 0.25–0.55
          const confidence = isOil
            ? 0.55 + Math.random() * 0.40
            : 0.10 + Math.random() * 0.45;

          // Severity based on confidence
          let severity: string;
          if (!isOil) severity = 'Low';
          else if (confidence > 0.85) severity = 'Critical';
          else if (confidence > 0.70) severity = 'High';
          else if (confidence > 0.55) severity = 'Medium';
          else severity = 'Low';

          // Area affected (only for oil spills, 0.5 – 18 km²)
          const areaAffected = isOil
            ? +(0.5 + Math.random() * (confidence > 0.8 ? 17.5 : 8)).toFixed(2)
            : 0;

          // Notes
          const cause = SPILL_CAUSES[Math.floor(Math.random() * SPILL_CAUSES.length)];
          const notes = isOil
            ? `${hotspot.label} — probable spill from ${cause}. ML confidence: ${(confidence * 100).toFixed(1)}%. Estimated area: ${areaAffected} km². [SYNTHETIC TEST]`
            : `${hotspot.label} — ${NON_SPILL_NOTES[Math.floor(Math.random() * NON_SPILL_NOTES.length)]}. ML confidence: ${(confidence * 100).toFixed(1)}%. [SYNTHETIC TEST]`;

          const now = new Date();
          syntheticCounter++;
          const productId = `synth-neft-${now.toISOString().replace(/[:.]/g, '-')}-${syntheticCounter}`;

          const record = {
            latitude: +lat.toFixed(6),
            longitude: +lng.toFixed(6),
            status: isOil ? 'Oil spill' : 'Non Oil spill',
            detected_at: now.toISOString(),
            confidence: +confidence.toFixed(4),
            severity,
            source: 'Neft Dashlari (Sentinel-1/2)',
            copernicus_product_id: productId,
            area_affected_km2: areaAffected,
            validation_status: isOil ? 'Verified' : 'Unverified',
            notes,
          };

          // Insert via Supabase REST API
          try {
            const { default: fetch } = await import('node-fetch');
            const response = await fetch(`${SUPABASE_URL}/rest/v1/oil_spill_detections`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal',
              },
              body: JSON.stringify(record),
            });

            if (!response.ok) {
              const text = await response.text();
              console.error(`[${trigger}] ❌ Supabase insert failed: ${response.status} ${text}`);
              return { success: false, count: 0 };
            }

            const emoji = isOil ? '🛢️' : '✅';
            console.log(`[${trigger}] ${emoji} Synthetic detection inserted: ${hotspot.label} → ${record.status} (${(confidence * 100).toFixed(1)}%, ${severity})`);
            return { success: true, count: 1 };
          } catch (err) {
            console.error(`[${trigger}] ❌ Fetch error:`, err);
            return { success: false, count: 0 };
          }
        }

        // ── HTTP endpoint (manual refresh from UI) ──────────────────────
        server.middlewares.use('/api/neft-dashlari', async (_req, res) => {
          res.setHeader('Content-Type', 'application/json');

          const results: Array<{ source: string; success: boolean; count: number }> = [];

          if (ENABLE_REAL_PIPELINE) {
            const r = await runRealPipeline('API');
            results.push({ source: 'real', ...r });
          }
          if (ENABLE_SYNTHETIC_DEMO) {
            const s = await generateSyntheticDetection('API-SYNTH');
            results.push({ source: 'synthetic', ...s });
          }

          const totalCount = results.reduce((sum, r) => sum + r.count, 0);
          const anySuccess = results.some(r => r.success);

          res.statusCode = anySuccess ? 200 : 500;
          res.end(JSON.stringify({
            success: anySuccess,
            count: totalCount,
            output: results.map(r => `[${r.source}] ${r.success ? '✓' : '✗'} ${r.count} detection(s)`).join('\n'),
          }));
        });

        // ── Automatic hourly execution ──────────────────────────────────
        const PIPELINE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
        const INITIAL_DELAY_MS = 10_000;              // 10 s after server start

        const parts: string[] = [];
        if (ENABLE_REAL_PIPELINE)   parts.push('real pipeline');
        if (ENABLE_SYNTHETIC_DEMO)  parts.push('synthetic demo');
        console.log(`[AUTO] Neft Dashlari [${parts.join(' + ')}] will auto-run every ${PIPELINE_INTERVAL_MS / 60000} min (first run in ${INITIAL_DELAY_MS / 1000}s)`);

        async function scheduledRun(trigger: string) {
          if (ENABLE_REAL_PIPELINE) {
            await runRealPipeline(trigger);
          }
          if (ENABLE_SYNTHETIC_DEMO) {
            await generateSyntheticDetection(`${trigger}-SYNTH`);
          }
        }

        // First run shortly after startup
        const initialTimer = setTimeout(() => scheduledRun('AUTO'), INITIAL_DELAY_MS);

        // Recurring runs
        const intervalTimer = setInterval(() => scheduledRun('AUTO-HOURLY'), PIPELINE_INTERVAL_MS);

        // Cleanup on server close
        server.httpServer?.on('close', () => {
          clearTimeout(initialTimer);
          clearInterval(intervalTimer);
          console.log('[AUTO] Neft Dashlari scheduler stopped.');
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // 1. OData Proxy (For searching metadata)
      '/odata': {
        target: 'https://catalogue.dataspace.copernicus.eu',
        changeOrigin: true,
        secure: false,
      },
      // 2. Process API Proxy (For fetching images statelessly)
      '/process-api': {
        target: 'https://sh.dataspace.copernicus.eu/api/v1/process',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/process-api/, ''),
      },
      // 3. Copernicus Auth Proxy (avoids browser CORS)
      '/copernicus-auth': {
        target: 'https://identity.dataspace.copernicus.eu',
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(
            /^\/copernicus-auth/,
            '/auth/realms/CDSE/protocol/openid-connect/token'
          ),
      },
      '/wms': {
        target: 'https://sh.dataspace.copernicus.eu',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/wms/, '/ogc/wms'),
      },
      // 5. Sentinel Hub Catalog Proxy (for Neft Dashlari browser refresh)
      '/catalog-api': {
        target: 'https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/catalog-api/, ''),
      },
    },
  },
});