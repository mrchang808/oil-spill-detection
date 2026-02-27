# Oil Spill Web — Development Guidelines

## 1) Project Info

- **Project name:** `oil-spill-web` (Vite + React + TypeScript app)
- **Primary goal:** visualize and manage oil spill detections using map-based UI, satellite data, and ML-assisted classification.
- **Main domains:**
  - Frontend map and analytics UI
  - Copernicus Data Space integration (Sentinel imagery search/process)
  - Supabase-backed detection storage
  - Optional Python inference pipeline for image classification

## 2) What It’s About

This project provides a web interface for:

- Viewing oil spill detections on an interactive map
- Filtering/searching detections
- Inspecting detection details and confidence/severity metadata
- Pulling satellite products from Copernicus (Sentinel-1 / Sentinel-2)
- Running a local ML pipeline (`ResNet18`) to classify downloaded imagery into `oil` / `no_oil`

## 2.1) Folder Structure

```text
oil-spill-web/
├─ src/
│  ├─ components/
│  │  ├─ common/
│  │  ├─ filters/
│  │  ├─ layout/
│  │  ├─ map/
│  │  ├─ modals/
│  │  ├─ stats/
│  │  └─ ui/
│  ├─ hooks/
│  ├─ models/
│  ├─ scripts/
│  ├─ services/
│  │  └─ copernicus/
│  ├─ types/
│  ├─ App.tsx
│  └─ main.tsx
├─ supabase/
│  └─ migrations/
├─ temp_inference/
│  ├─ input/
│  └─ output/
│     ├─ oil/
│     └─ no_oil/
├─ package.json
├─ tsconfig.json
├─ tsconfig.app.json
├─ vite.config.ts
└─ requirements.txt
```

### Structure Notes
- `src/components`: UI building blocks grouped by feature area.
- `src/services`: integration layer for Supabase and Copernicus APIs.
- `src/scripts`: pipeline orchestration (Node + Python bridge scripts).
- `src/models`: ML model artifact(s) used for local inference.
- `src/types`: shared TypeScript domain types.
- `supabase/migrations`: SQL schema and migration history.
- `temp_inference`: local transient IO for pipeline runs.

## 3) Tech Stack

### Frontend
- React 18
- TypeScript 5 (strict mode)
- Vite 7
- Tailwind CSS
- Leaflet (map rendering)
- Lucide React (icons)

### Data / Services
- Supabase (`@supabase/supabase-js`)
- Copernicus Data Space APIs (OData + Process API)

### ML / Scripting
- Python
- PyTorch (`torch`, `torchvision`)
- Pillow
- Node script orchestration (`ts-node`, `node-fetch`, `dotenv`)

## 4) Important Commands

## Install

```bash
npm install
```

## Run frontend locally

```bash
npm run dev
```

## Type-check

```bash
npm run typecheck
```

## Lint

```bash
npm run lint
```

## Production build / preview

```bash
npm run build
npm run preview
```

## Python dependencies (for ML pipeline)

```bash
pip install -r requirements.txt
```

## Run ML pipeline (optional)

Use the existing script from project root:

```bash
npx ts-node src/scripts/run-ml-pipeline.ts
```

> On Windows, ensure `python` is available in PATH for the pipeline script.

## 5) Environment Setup

Create `.env` or `.env.local` in project root with required variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

VITE_COPERNICUS_CLIENT_ID=
VITE_COPERNICUS_CLIENT_SECRET=

# Optional for server-side scripting / pipeline writes
SUPABASE_SERVICE_ROLE_KEY=
```

### Notes
- Frontend Supabase client requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Copernicus auth requires `VITE_COPERNICUS_CLIENT_ID` and `VITE_COPERNICUS_CLIENT_SECRET`.
- The ML pipeline can use `SUPABASE_SERVICE_ROLE_KEY` for privileged writes.
- Never commit `.env`, `.env.local`, or any key/token file to GitHub.
- If secrets were ever exposed in logs, screenshots, or commits, rotate them before push.

## 6) Workflow (Recommended)

1. Pull latest changes and install/update dependencies.
2. Ensure env vars are present.
3. Start dev server with `npm run dev`.
4. Implement feature/fix in small focused commits.
5. Run `npm run typecheck` and `npm run lint` before opening PR.
6. If feature touches ML flow, run pipeline sanity check locally.
7. Validate map behavior, filters, modal details, and API-driven data paths.

## 7) Code Style & Engineering Rules

### TypeScript Rules (strict by default)
- Keep `strict: true` assumptions intact.
- **Prefer explicit types** for function params, returns, and public interfaces.
- Avoid `any`; use precise types, generics, or `unknown` with safe narrowing.
- Do not weaken compiler settings to make code pass.
- Keep `noUnusedLocals` and `noUnusedParameters` clean.

### Imports & Paths
- Prefer path alias imports using `@/` for `src` modules.
- Keep imports grouped and minimal (remove dead imports).
- Avoid deep relative import chains when alias is clearer.

### React Rules
- Use functional components and hooks.
- Keep components focused and split large UI blocks into small reusable parts.
- Keep side-effects in `useEffect` and avoid effect overreach.
- Preserve existing provider structure (`ErrorBoundary`, `ToastProvider`, `StrictMode`).

### API / Data Rules
- Keep service-layer logic in `src/services/*`.
- Keep UI components free of heavy API/auth logic.
- Handle network failure paths explicitly (empty states, fallback behavior, logging).
- Avoid hardcoding secrets or credentials in source.

### Styling Rules
- Follow existing Tailwind utility conventions.
- Reuse existing UI patterns/components before introducing new primitives.
- Keep map/legend/filter UX consistent with current interactions.

### General Maintainability
- Prefer small, composable functions.
- Use clear naming (`verbNoun` for functions, domain-based type names).
- Keep comments for non-obvious intent only; avoid stating the obvious.
- Update docs when behavior, env vars, or commands change.

## 8) Project-Specific Helpful Notes

- TS path alias is configured as `@/* -> ./src/*` (`tsconfig.json`, mirrored in `vite.config.ts`).
- Vite dev server proxies are configured for Copernicus endpoints:
  - `/odata`
  - `/process-api`
  - `/copernicus-auth` (OAuth token endpoint proxy to avoid browser CORS)
  - `/wms`
- Browser-direct Copernicus OAuth calls fail due to CORS; always use the proxy in dev.
- React StrictMode in dev intentionally double-invokes effects; duplicate mount/cleanup logs are expected locally.
- Model file currently used by pipeline:
  - `src/models/best_resnet18_dartis_csiro_sos_greek.pt`
- Temporary inference artifacts are written under:
  - `temp_inference/input`
  - `temp_inference/output/oil`
  - `temp_inference/output/no_oil`

## 9) Known Risks & Guardrails

Use this section as the baseline risk checklist before shipping changes.

### A) Build & Tooling Risks

**Known Risk:** Lint can fail/crash due to TypeScript + ESLint plugin version mismatch.

**Guardrails:**
- Keep `typescript`, `eslint`, and `typescript-eslint` versions compatible and pinned together.
- Run both checks locally before PR:
  - `npm run typecheck`
  - `npm run lint`
- Do not merge when either command fails.

### B) Type Safety Risks

**Known Risk:** Strict mode is enabled; unused variables and weak typing break CI quickly.

**Guardrails:**
- Keep strict flags intact (`strict`, `noUnusedLocals`, `noUnusedParameters`).
- Prefer explicit interfaces/types for API payloads and utility functions.
- Avoid `any`; use `unknown` + narrowing if type is uncertain.
- Require `tsc --noEmit` clean output for merge readiness.

### C) Database / RLS Risks

**Known Risk:** Frontend uses anon key, but writes (`update/delete`) require matching RLS policies.

**Guardrails:**
- Whenever adding or changing a frontend write path, add/verify matching RLS policy in migrations.
- Keep policy changes in versioned SQL migrations under `supabase/migrations`.
- Current baseline migration for write paths:
  - `supabase/migrations/20250226_add_rls_update_delete_policies.sql`
- Validate these operations end-to-end in dev:
  - read list
  - update one detection
  - delete one detection (if UI supports it)

### D) Migration Drift Risks

**Known Risk:** App expects objects (e.g., `oil_spill_statistics` view) that exist only after enhanced migrations.

**Guardrails:**
- Apply all migrations in order for new environments.
- Document required DB objects whenever introducing new queries/views/triggers.
- Add a startup verification checklist for required tables/views/functions.

### E) Map & Data Flow Risks

**Known Risk:** Marker interaction currently relies on custom window events; this is brittle and easy to desync.

**Guardrails:**
- Prefer typed prop callbacks (`onMarkerClick`) over global event dispatch where possible.
- Keep one clear ownership path for marker selection state.
- Validate map flows after changes:
  - marker click opens correct modal record
  - filters update markers correctly
  - layer toggle does not break map rendering

### F) React Effect / State Risks

**Known Risk:** Partial effect dependencies can cause stale data (filters changed but no refetch).

**Guardrails:**
- For fetch effects, include all filter keys that affect query behavior.
- If intentionally excluding deps, add a short comment explaining why.
- Use `useRef` concurrency guards for async fetches when needed.

### G) Async Resource Leak Risks

**Known Risk:** Object URLs and timers can leak memory if not cleaned up.

**Guardrails:**
- Always pair `URL.createObjectURL` with `URL.revokeObjectURL` on close/unmount.
- Clear all timers/intervals in effect cleanup.
- Cancel/ignore async results when component unmounts.

### H) External API Reliability Risks

**Known Risk:** Copernicus and geocoding calls can fail intermittently or due to parameter format issues.

**Guardrails:**
- Validate and encode API query parameters (especially time/date and location inputs).
- Handle non-200 responses with user-visible fallback states.
- Avoid assuming optional image URLs are always present.
- Keep auth/token exchange behind backend/proxy endpoints to avoid client-side CORS failures.

### I) Environment Configuration Risks

**Known Risk:** Missing env variables hard-fail startup or API integrations.

**Guardrails:**
- Keep `.env/.env.local` requirements up to date in this file.
- Add fail-fast checks with clear error messages for required keys.
- Before local run, verify:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_COPERNICUS_CLIENT_ID`
  - `VITE_COPERNICUS_CLIENT_SECRET`

### J) Guardrail Checklist (PR Gate)

Before opening a PR, verify all are true:

- `npm run typecheck` passes
- `npm run lint` passes
- Required migrations are included and documented
- RLS policies align with read/write behavior
- Map interactions + filters + modal flow are manually sanity-tested
- Async cleanups (timers/object URLs/subscriptions) are present

### K) Spill Lifecycle / Cleanse-Time Risks

**Known Risk:** Timeline can become unrealistically cumulative if detections never expire or close.

**Guardrails:**
- Treat each spill as a time-bounded event, not a permanent marker.
- Add/maintain explicit lifecycle fields for temporal validity (at minimum one of):
  - `resolved_at` (preferred)
  - `dissipated_at`
  - `cleanup_completed_at`
  - `valid_until` (fallback TTL)
- Rendering rule must include both start and end bounds:
  - show when `detected_at <= t`
  - hide when `t > resolution_time`
- Resolution time source priority should be deterministic and documented in code.
- If no explicit resolution signal exists, use a configurable TTL policy per source/severity (not hardcoded magic constants).
- Keep lifecycle logic scalable:
  - compute effective resolution server-side when possible
  - index temporal fields used for timeline queries
  - avoid per-frame expensive recomputation for large datasets
- Add QA checks for timeline realism:
  - historical spills no longer visible years later unless explicitly unresolved
  - cleaned/contained spills disappear according to policy
  - playback at scale remains responsive

## 10) Done Criteria for Changes

A change is considered ready when:

- It compiles under strict TypeScript (`npm run typecheck`)
- Lint passes (`npm run lint`)
- App behavior is validated in local dev (`npm run dev`)
- Any new config/env requirements are documented
- Changes are scoped and do not introduce unrelated refactors

## 11) GitHub Push Readiness (Mandatory)

Use this exact gate before every push.

### A) Security Gate

- Confirm no secrets are staged:
  - `.env`, `.env.local`, service-role keys, Copernicus secrets
- Ensure `.gitignore` still excludes env files.
- If any secret was previously exposed, rotate it first.

### B) Quality Gate

- `npm install`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

All four must pass.

### C) Runtime Gate

- Run `npm run dev` and sanity-check:
  - map loads without reinitializing on modal open
  - detection modal opens/closes correctly
  - satellite thumbnails load
  - `Preview Full Size` works

### D) Database Gate

- Confirm migrations include schema + policy changes for this feature.
- For current write UI behavior, ensure UPDATE/DELETE/INSERT RLS policies are active.

### E) Git Hygiene Gate

- `git status` is clean except intended files.
- Keep commits small and scoped by concern (UI, services, migrations, docs).
- Do not commit temporary artifacts (`temp_inference/*`, generated outputs, local debug files).

### F) Push Sequence (Windows-friendly)

```bash
git status
git add .
git commit -m "feat: <short, scoped summary>"
git push
```

For Supabase CLI on Windows, do not use `npm install -g supabase`.
Use supported install methods (Scoop/winget) or run via `npx`/`npm exec` where appropriate.

## 12) Product Roadmap (High-Impact Upgrades)

This roadmap is prioritized for fastest user value with lowest implementation risk.

### Priority 1 — Timeline Playback (Map UX)

- Add bottom map timeline slider with `Play/Pause`.
- Show detections as lifecycle events (appear at detection time, disappear at computed resolution/cleanse time).
- Keep playback lightweight (client-side filtering first, no backend changes required).

### Priority 2 — Visual Analytics Dashboard

- Replace text-only trend blocks with charts:
  - spills by severity (pie)
  - detections over time (bar/line)
- Recommended library: `recharts`.
- Keep chart data derivation in memoized selectors.

### Priority 3 — Dark Mode (GIS usability)

- Add UI theme toggle using existing Tailwind dark variants.
- Add dark basemap option in Leaflet (e.g., CartoDB Dark Matter).
- Persist theme in local storage.

### Priority 4 — Weather/Wind Overlay (Operational context)

- Integrate wind direction/speed near selected detection.
- Draw a simple drift cone/arrow overlay for short-term spill movement estimate.
- Start with read-only visualization before predictive modeling.

### Priority 5 — AIS Vessel Context (Attribution workflow)

- Add nearby vessel markers around spill coordinates + timestamp.
- Optional: vessel track line history for context.
- Prefer backend proxy + caching for provider limits and key protection.

### Delivery Strategy

- **Sprint 1:** Timeline + charts + dark mode.
- **Sprint 2:** Weather drift overlay MVP.
- **Sprint 3:** AIS pilot integration.

### Architecture Guardrails for Roadmap Work

- Keep third-party API logic in `src/services/*`.
- Do not expose paid provider secrets in frontend.
- Add feature flags for new map overlays to protect baseline UX.
- Every roadmap feature must pass section 11 pre-push gate.
