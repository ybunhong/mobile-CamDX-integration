# RAYU.md

This file provides guidance to RAYU when working with code in this repository.

## What this is

Expo (SDK 58, React Native 0.88) eKYC app for Cambodian ID cards. The user enters ID details, photographs the card, then takes a selfie. **All verification runs on-device** through InspireFace (`react-native-nitro-inspire-face`, native C++): silent liveness, image quality, and selfie↔ID-photo face match. No backend, no proxy, no API keys, no photo upload.

Because the liveness engine is native code, **Expo Go cannot run this app** — it needs a development build (`expo prebuild` or EAS).

## Commands

```bash
npm start                 # Expo dev server (needs a dev build, not Expo Go)
npm run android / ios / web

npm run typecheck         # tsc against tsconfig.src.json — the ONLY clean typecheck
npm test                  # jest; no tests exist yet (only empty __tests__ dirs)
npx jest --passWithNoTests

eas build --profile development -p android   # dev client with the native modules
```

`npx tsc --noEmit` (the root config) is **not** usable: `tsconfig.json` includes `archive/`, whose broken file aborts semantic checking and hides real errors in `src/`. Always use `npm run typecheck`.

`npm run lint` maps to `expo lint`, but no ESLint config or dependency is installed; running it scaffolds one first.

## Architecture

### Flow (`src/app/`, expo-router, `typedRoutes` on)

`index` → `id-form` → `document-capture` → `face-capture` → `verification`. All screens are headerless; `index.tsx` only redirects to `/id-form`.

State is passed as **JSON in router params**, not a store:

- `id-form.tsx` → `components/IdCardForm.tsx`; validates (via `utils/security.ts`) and pushes `{ userInfo }` to `/document-capture`.
- `document-capture.tsx` → back camera, one shot. `livenessService.analyze()` must find a face; the resulting **feature vector (base64)** is the reference, pushed as `{ userInfo, referenceFeature }` to `/face-capture`.
- `face-capture.tsx` → front camera, **3 shots** taken by `CameraStage`. Analyses them serially, keeps the frame with the highest liveness score, compares it to the reference, and `router.replace`s to `/verification` with `{ userInfo, result }`.
- `verification.tsx` → pure results screen (no network): liveness, quality, match percentage, verdict.

`components/CameraStage.tsx` owns camera permission, preview, guide overlay, capture button, and the N-shot loop. Screens only supply copy + an `onPhotos(uris)` handler.

### `src/services/LivenessService.ts`

Singleton `livenessService`. Responsibilities:

- `init()` — `launchWithRemoteModel(MODEL_URL, MODEL_SHA256)` (verified Pikachu checksum, 17 MB, cached after first download) then creates one `InspireFace` session. Guarded by a promise so concurrent calls don't double-launch; a failed init resets so it can be retried.
- `analyze(uri)` — `createImageBitmapFromFilePath(3, path)` → `createImageStreamFromBitmap` → `executeFaceTrack` → **`multipleFacePipelineProcess`** (this is what populates liveness/quality) → `getRGBLivenessConfidence()` / `getFaceQualityConfidence()` → `extractFaceFeature`. Note `file://` must be stripped to a filesystem path.
- `compare(a, b)` — `faceComparison` cosine similarity, threshold from `getRecommendedCosineThreshold()`, display % from `cosineSimilarityConvertToPercentage()`.

Thresholds live here as `LIVENESS_THRESHOLD` / `QUALITY_THRESHOLD` and are consumed by `face-capture.tsx`.

### Validation and styling

- `src/utils/security.ts` — input sanitization plus validators: ID = exactly 9 digits, dates = `YYYY-MM-DD`, gender `M|F`, names non-empty after sanitizing (Khmer must stay valid). Used by `IdCardForm`.
- `src/theme.ts` — the design system: colors, spacing, radius, typography, `commonStyles`, `cameraStyles`. All screens use `StyleSheet` + these tokens. **NativeWind/Tailwind is installed but unused in `src/`** — style new UI through `theme.ts`.

## Gotchas

- **Expo version mismatch:** `AGENTS.md` points at `docs.expo.dev/versions/v57.0.0/`, but the project is SDK 58 / RN 0.88. Read the v58 docs.
- **Nothing here runs in Expo Go.** `react-native-nitro-inspire-face` / `react-native-nitro-modules` are native; use `eas build --profile development` or `npx expo prebuild`.
- **Web is no longer supported.** `LivenessService` imports a native-only module, so `npm run web` / `expo export --platform web` will fail. The app targets Android/iOS.
- The model is downloaded on first use, so the **first verification needs a network connection**; afterwards `ModelManager` serves it from cache. To bundle it instead, download `Pikachu` into `assets/models/` and add the package's config plugin with `{ modelName: 'Pikachu', modelDir: 'assets/models' }`.
- `archive/` holds the retired integrations (`camdigikey/`, `didit/` — the old Express proxy, `start-all.sh`, `WEB_SETUP.md`). `archive/camdigikey/camdigikey.ts` is a broken file that breaks the root `tsc` run. Do not follow anything in `archive/`.
- `README.md`, `SECURITY.md`, `FUTURE_PROOF.md`, `camdx-docs.md` and `mockoon-config.json` predate the current flow (CamDigiKey era). Don't treat them as current.
- A live Didit API key was previously committed in `app.json` and still exists in git history; rotate it in the Didit dashboard if that account is still active.
- `expo-env.d.ts` is gitignored but generated by Expo; `.expo/types/router.d.ts` (typed routes) is generated by `expo start` — run `npx expo start` briefly after adding a route or `router.push` will fail to typecheck.
- `example/` is a gitignored Expo template, not part of the app.
