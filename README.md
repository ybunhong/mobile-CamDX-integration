# On-device eKYC for Cambodian ID cards

An Expo app that verifies identity **on the phone**. Face detection, silent liveness, image
quality and face matching all run natively on the device — no photo is uploaded, no API key is
used, and there is no per-check cost.

A small local server keeps enrolments in memory so a person can be enrolled once and verified
many times.

## Two flows

```
Home
├─ Add face
│   ID form → photograph the card's portrait → liveness-checked selfie → saved
└─ Verify identity
    Selfie or ID-card scan → matched against every enrolment
```

Enrolment stores the ID fields plus two face feature vectors: one from the card portrait and one
from the selfie. Verification compares like with like, so a card scan is matched against card
portraits and the SDK's similarity calibration decides the verdict.

## Requirements

- Node 20+
- **A development build.** The face engine is native C++; Expo Go cannot load it.
- The local server and the phone must share a network.

## Run it

```bash
npm install
npm run server          # enrolment store on :3001 (in memory, cleared on restart)
npm start               # then open the installed dev client
```

Build the dev client once:

```bash
eas build --profile development -p android
```

On first use the app downloads the 17 MB `Pikachu` model pack (SHA-256 verified) and caches it;
later runs work offline.

## Checks

```bash
npm run typecheck       # tsc against tsconfig.src.json
npm run test:server     # boots the server and exercises every endpoint
```

CI runs both on every push and pull request (`.github/workflows/ci.yml`).

## Project layout

```
src/app/            expo-router screens: home, enroll/*, verify/*
src/components/     IdCardForm, CameraStage, DevBuildNotice
src/services/       LivenessService (model + face pipeline), ApiClient
src/types/          shared identity types
src/utils/          input sanitisation and validators
server/             in-memory enrolment store + smoke test
```

## Tuning

`src/services/LivenessService.ts` holds `LIVENESS_THRESHOLD` (0.5) and `QUALITY_THRESHOLD` (0.4),
plus the detection settings tuned for faces printed on ID cards (`detectPixelLevel: 640`,
threshold `0.35`). Face-match acceptance uses the SDK's own recommended cosine threshold.

## Licence notes

App code is covered by the repository's MIT licence. The InspireFace **model pack** is distributed
by the [InspireFace](https://github.com/HyperInspire/InspireFace) project and carries its own terms
— review them before publishing to an app store.
