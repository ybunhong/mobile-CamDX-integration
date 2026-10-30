import { TurboModuleRegistry } from 'react-native';
import type { Session, SessionCustomParameter } from 'react-native-nitro-inspire-face';
import type { FaceAnalysis } from '../types/identity';

/**
 * Pikachu is the smallest InspireFace model pack (17 MB) and supports silent
 * (passive) liveness. The checksum is the published SHA-256 of the release
 * asset; launchWithRemoteModel verifies it and caches the file after the first
 * download, so later launches work offline.
 */
const MODEL_URL = 'https://github.com/HyperInspire/InspireFace/releases/download/v1.x/Pikachu';
const MODEL_SHA256 = '5037ba1f49905b783a1c973d5d58b834a645922cc2814c8e3ca630a38dc24431';

/** Below this liveness score the capture is treated as a spoof. */
export const LIVENESS_THRESHOLD = 0.5;
/** Reject blurry frames before trusting the liveness score. */
export const QUALITY_THRESHOLD = 0.4;

export const NATIVE_UNAVAILABLE_MESSAGE =
  'The on-device face engine is not available in Expo Go. Install a development build ' +
  '(eas build --profile development -p android) to run verification.';

const SESSION_PARAMS: SessionCustomParameter = {
  enableLiveness: true,
  enableFaceQuality: true,
  enableRecognition: true,
};

type Sdk = typeof import('react-native-nitro-inspire-face');

let sdk: Sdk | null = null;

/**
 * The SDK registers its TurboModule at import time, so a static import would
 * crash every screen that touched it (Expo Go has no native module). Requiring
 * it lazily keeps the UI mountable and turns a missing module into a readable
 * error instead of a red screen.
 */
/**
 * `TurboModuleRegistry.get` returns null when the module isn't linked (Expo Go),
 * whereas requiring the SDK throws from module scope. Probe first so the
 * require never runs in a runtime that cannot satisfy it.
 */
function isNitroLinked(): boolean {
  try {
    return TurboModuleRegistry.get('NitroModules') != null;
  } catch {
    return false;
  }
}

function loadSdk(): Sdk {
  if (sdk) return sdk;

  if (!isNitroLinked()) throw new Error(NATIVE_UNAVAILABLE_MESSAGE);

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sdk = require('react-native-nitro-inspire-face') as Sdk;
    return sdk;
  } catch {
    sdk = null;
    throw new Error(NATIVE_UNAVAILABLE_MESSAGE);
  }
}

/** True when the native face engine is linked (a dev build, not Expo Go). */
export function isLivenessAvailable(): boolean {
  try {
    loadSdk();
    return true;
  } catch {
    return false;
  }
}

function toFilesystemPath(uri: string): string {
  return uri.startsWith('file://') ? uri.slice('file://'.length) : uri;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

class LivenessService {
  private session: Session | null = null;
  private ready: Promise<void> | null = null;

  /** Downloads the model if needed and creates the session exactly once. */
  async init(): Promise<void> {
    if (this.session) return;

    this.ready ??= (async () => {
      const { InspireFace, DetectMode, launchWithRemoteModel } = loadSdk();

      if (!InspireFace.isLaunched()) {
        await launchWithRemoteModel(MODEL_URL, MODEL_SHA256);
      }

      const session = InspireFace.createSession(
        SESSION_PARAMS,
        DetectMode.ALWAYS_DETECT,
        1,
        -1,
        -1,
      );
      session.setFaceDetectThreshold(0.5);
      this.session = session;
    })().catch((error: unknown) => {
      // Allow a later retry (e.g. the model download failed while offline).
      this.ready = null;
      throw error;
    });

    return this.ready;
  }

  /**
   * Runs detection, the liveness/quality pipeline, and feature extraction on a
   * single photo.
   */
  async analyze(photoUri: string): Promise<FaceAnalysis> {
    await this.init();
    const session = this.session;
    if (!session) throw new Error('Face engine session is not ready');

    const { CameraRotation, InspireFace } = loadSdk();
    const bitmap = InspireFace.createImageBitmapFromFilePath(3, toFilesystemPath(photoUri));
    const stream = InspireFace.createImageStreamFromBitmap(bitmap, CameraRotation.ROTATION_0);

    const faces = session.executeFaceTrack(stream);
    if (faces.length === 0) {
      return { faceDetected: false, liveness: 0, quality: 0, feature: null };
    }

    const face = faces[0];
    session.multipleFacePipelineProcess(stream, [face], SESSION_PARAMS);

    return {
      faceDetected: true,
      liveness: clamp01(session.getRGBLivenessConfidence()[0] ?? 0),
      quality: clamp01(session.getFaceQualityConfidence()[0] ?? 0),
      feature: InspireFace.toBase64(session.extractFaceFeature(stream, face.token)),
    };
  }

  /** Compares two base64 feature vectors using the SDK's own calibration. */
  compare(referenceFeature: string, probeFeature: string) {
    const { InspireFace } = loadSdk();

    const similarity = InspireFace.faceComparison(
      InspireFace.fromBase64(referenceFeature),
      InspireFace.fromBase64(probeFeature),
    );

    return {
      similarity,
      percentage: InspireFace.cosineSimilarityConvertToPercentage(similarity),
      matched: similarity >= InspireFace.getRecommendedCosineThreshold(),
    };
  }
}

export const livenessService = new LivenessService();
