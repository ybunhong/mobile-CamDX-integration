# On-device eKYC for Cambodian ID cards

Expo app that verifies an ID card and a selfie **entirely on the phone**. Nothing is uploaded: there is no backend, no API key, and no per-check cost.

## What it checks

1. **ID details** — 9-digit ID number, Khmer/English names, dates, gender (validated before capture).
2. **ID card photo** — the portrait is located and turned into a reference face feature.
3. **Selfie** — three frames are scored for **silent (passive) liveness** and image quality; the best frame is compared against the ID photo.

Liveness, quality, and face matching come from [InspireFace](https://github.com/HyperInspire/InspireFace) via `react-native-nitro-inspire-face`, running natively on CPU.

## Requirements

- Node 20+, an Expo account (or a local Android SDK)
- **A development build** — the native face SDK cannot run in Expo Go

## Install and run

```bash
npm install

# Build a dev client (native modules required)
eas build --profile development -p android

npm start          # then open the installed dev client
```

On first verification the app downloads the 17 MB `Pikachu` model pack (SHA-256 verified) and caches it; later runs work offline.

## Layout

```
src/app/            # expo-router screens: id-form → document-capture → face-capture → verification
src/components/     # IdCardForm, CameraStage (camera + N-shot capture)
src/services/       # LivenessService — model launch, analysis, face comparison
src/types/          # identity types shared across screens
src/utils/          # input sanitisation and validators
src/theme.ts        # colours, spacing, typography, shared styles
```

## Thresholds

`LIVENESS_THRESHOLD` (0.5) and `QUALITY_THRESHOLD` (0.4) live in `src/services/LivenessService.ts`. Face-match acceptance uses the SDK's own recommended cosine threshold rather than a hardcoded number.

## Licence notes

The app code is under the repository's MIT licence. The bundled/downloaded InspireFace **model pack** is distributed by the InspireFace project and carries its own terms — review them before publishing to an app store.
