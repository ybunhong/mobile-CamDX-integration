# RAYU.md

This file provides guidance to RAYU when working with code in this repository.

## What this is

Expo (SDK 58, React Native 0.88) eKYC app for Cambodian ID cards. The user enters ID details, photographs the card, then takes a selfie. **All verification runs on-device** through InspireFace (`react-native-nitro-inspire-face`, native C++): silent liveness, image quality, and selfie↔ID-photo face match. No backend, no proxy, no API keys, no photo upload.

Because the liveness engine is native code, **Expo Go cannot run this app** — it needs a development build (`expo prebuild` or EAS).

## Commands

```bash
npm run server            # local enrolment store on :3001 (in-memory, no .env needed)
npm start                 # Expo dev server (needs a dev build, not Expo Go)
npm run android / ios

npm run typecheck         # tsc against tsconfig.src.json
npm run test:server       # boots the server on :3101 and exercises every endpoint

eas build --profile development -p android   # dev client with the native modules
```

There is **no Jest suite** — it was removed along with `jest.config.js`, `__tests__` dirs and the Jest devDependencies. `.github/workflows/ci.yml` runs `npm run typecheck` + `npm run test:server` on every push and PR; run the same two commands before pushing.

`npm run typecheck` uses `tsconfig.src.json` so typechecking stays scoped to `src/`. The root `tsconfig.json` includes `**/*.ts`, so it will also pull in `server/*.js`-adjacent stray `.ts` files if any are ever added.

`npm run lint` maps to `expo lint`, but no ESLint config or dependency is installed; running it scaffolds one first.

## Architecture

### Flow (`src/app/`, expo-router, `typedRoutes` on)

Two independent flows branching from `index.tsx` (home). All screens are headerless; state is passed as **JSON in router params**, not a store.

**Enrolment — `index` → `/enroll/id-form` → `/enroll/document-capture` → `/enroll/face-capture` → `/enroll/success`**

- `enroll/id-form.tsx` → `components/IdCardForm.tsx` with an `onSubmit` prop; validates via `utils/security.ts`.
- `enroll/document-capture.tsx` → back camera, one shot; `analyze()` must find the printed portrait. Its **feature** becomes `documentFeature`.
- `enroll/face-capture.tsx` → front camera, **3 shots**; keeps the highest-liveness frame, enforces `LIVENESS_THRESHOLD` / `QUALITY_THRESHOLD`, then `POST /api/enrollments` with both features.
- `enroll/success.tsx` → confirmation + record summary.

**Verification — `index` → `/verify/capture` → `/verify/result`**

- `verify/capture.tsx` → chooser (selfie or ID card), then `CameraStage`. Fetches enrolments from the server and calls `livenessService.findBestMatch()`; like is matched against like (selfie↔selfieFeature, card↔documentFeature).
- `verify/result.tsx` → closest record, similarity %, liveness, quality, verdict.

`components/CameraStage.tsx` owns camera permission, preview, guide overlay, capture button, and the N-shot loop. Screens only supply copy + an `onPhotos(uris)` handler.

### `server/index.js` (local enrolment store)

Express on `0.0.0.0:3001`, **in memory only** — restarting loses every record. `POST /api/enrollments` (upsert keyed by `idNumber`), `GET /api/enrollments`, `DELETE /api/enrollments/:idNumber`, `GET /health`. Face matching is *not* done here: the device owns the SDK's similarity calibration, so it fetches the records and compares locally. `src/services/ApiClient.ts` resolves the host the same way the old proxy did (localhost / `10.0.2.2` / `<hostUri>`), so never hard-code an IP.

### `src/services/LivenessService.ts`

Singleton `livenessService`. Responsibilities:

- `init()` — `launchWithRemoteModel(MODEL_URL, MODEL_SHA256)` (verified Pikachu checksum, 17 MB, cached after first download) then creates one `InspireFace` session. Guarded by a promise so concurrent calls don't double-launch; a failed init resets so it can be retried.
- `analyze(uri)` — `createImageBitmapFromFilePath(3, path)` → `createImageStreamFromBitmap` → `executeFaceTrack` → **`multipleFacePipelineProcess`** (this is what populates liveness/quality) → `getRGBLivenessConfidence()` / `getFaceQualityConfidence()` → `extractFaceFeature`. Note `file://` must be stripped to a filesystem path.
- `compare(a, b)` — `faceComparison` cosine similarity, threshold from `getRecommendedCosineThreshold()`, display % from `cosineSimilarityConvertToPercentage()`.

Thresholds live here as `LIVENESS_THRESHOLD` / `QUALITY_THRESHOLD` and are consumed by `face-capture.tsx`.

### Validation and styling

- `src/utils/security.ts` — input sanitization plus validators: ID = exactly 9 digits, dates = `YYYY-MM-DD`, gender `M|F`, names non-empty after sanitizing (Khmer must stay valid). Used by `IdCardForm`.
- `src/theme.ts` — the design system: colors, spacing, radius, typography, `commonStyles`, `cameraStyles`. All screens use `StyleSheet` + these tokens. NativeWind/Tailwind was removed; style new UI through `theme.ts`.

## Gotchas

- **Expo version mismatch:** `AGENTS.md` points at `docs.expo.dev/versions/v57.0.0/`, but the project is SDK 58 / RN 0.88. Read the v58 docs.
- **Nothing here runs in Expo Go.** `react-native-nitro-inspire-face` / `react-native-nitro-modules` are native; use `eas build --profile development` or `npx expo prebuild`.
- **Web is no longer supported.** `LivenessService` imports a native-only module, so `npm run web` / `expo export --platform web` will fail. The app targets Android/iOS.
- **Card portraits are hard to detect.** A face printed on an ID card is small and flat, so the SDK's defaults miss it. `LivenessService` creates its session with `detectPixelLevel: 640`, `setFaceDetectThreshold(0.35)` and `setFilterMinimumFacePixelSize(24)`. `FaceAnalysis.faceCount` is surfaced in the error alert — if it reports `0`, detection (not the feature step) is the problem.
- The model is downloaded on first use, so the **first verification needs a network connection**; afterwards `ModelManager` serves it from cache. To bundle it instead, download `Pikachu` into `assets/models/` and add the package's config plugin with `{ modelName: 'Pikachu', modelDir: 'assets/models' }`.
- The retired CamDigiKey and Didit integrations were deleted from the working tree (they remain in git history under `archive/` in older commits). Anything you find about CamDigiKey in history is obsolete.
- A live Didit API key was previously committed in `app.json` and still exists in git history; rotate it in the Didit dashboard if that account is still active.
- `expo-env.d.ts` is gitignored but generated by Expo; `.expo/types/router.d.ts` (typed routes) is generated by `expo start` — run `npx expo start` briefly after adding a route or `router.push` will fail to typecheck.
- `android/` is generated by `npx expo prebuild` and gitignored; never edit it by hand — change `app.json` instead.
