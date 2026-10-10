# CamDigiKey eKYC Mobile App

A minimal Expo application for Cambodian identity verification using CamDigiKey integration.

## Features

- **ID Information Form**: Capture and validate Cambodian ID card details
- **Document Capture**: Camera-based ID card capture with front/back camera support
- **Liveness Check**: Multi-step face verification (turn left, turn right, nod)
- **Verification**: Mock API integration with verification scores
- **Dark Theme**: Apple glass dark theme with red wine primary color

## Tech Stack

- **Framework**: Expo SDK ~57.0.24
- **Navigation**: Expo Router ~57.0.22
- **Camera**: expo-camera ^57.0.5
- **Styling**: NativeWind ^4.2.7 with Tailwind CSS ^3.4.19
- **Language**: TypeScript ~6.0.3
- **Testing**: Jest with React Native Testing Library

## Installation

```bash
npm install
```

## Running the App

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
src/
├── app/                    # Expo Router pages
│   ├── id-form.tsx        # ID information input
│   ├── document-capture.tsx
│   ├── liveness-capture.tsx
│   └── verification.tsx
├── components/
│   └── IdCardForm.tsx     # Reusable ID form component
├── services/
│   └── CamDigiKeyService.ts
├── types/
│   └── camdigikey.ts      # TypeScript type definitions
└── theme.ts               # Centralized theme configuration
```

## Verification Flow

1. **ID Form** → Enter user information (ID number, names, dates)
2. **Document Capture** → Capture ID card photo
3. **Liveness Check** → Complete 3-step face verification
4. **Verification** → Display verification scores and results

## Mock API

The app currently uses a mock CamDigiKey API. To enable real API integration:

1. Update `USE_MOCK` in `src/services/CamDigiKeyService.ts`
2. Configure the real API endpoint
3. Provide valid credentials

## Theme

The app uses a centralized theme system with:
- **Primary Color**: Red Wine (#e13d3d)
- **Background**: Dark (#1a1a1a)
- **Surface**: Dark Gray (#2a2a2a)
- **Text**: White with secondary gray

## Camera Permissions

The app requires camera access for document and liveness capture. Permissions are configured in:
- iOS: `app.json` (NSCameraUsageDescription)
- Android: `app.json` (CAMERA permission)

## Version

- **Current**: 1.0.0
- **Expo SDK**: 57.0.24
- **React Native**: 0.86.3

## Development Notes

- Read Expo SDK 57 documentation: https://docs.expo.dev/versions/v57.0.0/
- No backend/database - uses mock verification
- Client-side only - no actual face analysis implemented
