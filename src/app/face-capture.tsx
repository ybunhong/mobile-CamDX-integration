import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import CameraStage from '../components/CameraStage';
import DevBuildNotice from '../components/DevBuildNotice';
import {
  LIVENESS_THRESHOLD,
  QUALITY_THRESHOLD,
  isLivenessAvailable,
  livenessService,
} from '../services/LivenessService';
import type { FaceAnalysis, IdentityCheckResult } from '../types/identity';

const SHOTS = 3;

/** Keeps the frame with the highest liveness score among those containing a face. */
function bestFrame(results: FaceAnalysis[]): FaceAnalysis | null {
  const usable = results.filter((result) => result.faceDetected && result.feature);
  if (usable.length === 0) return null;
  return usable.reduce((best, current) => (current.liveness > best.liveness ? current : best));
}

export default function FaceCaptureScreen() {
  const { userInfo, referenceFeature } = useLocalSearchParams<{
    userInfo?: string;
    referenceFeature?: string;
  }>();
  const [hint, setHint] = useState<string>();

  if (!isLivenessAvailable()) return <DevBuildNotice />;

  const handlePhotos = async (uris: string[]) => {
    setHint('Reading your face on this device…');

    try {
      const analyses: FaceAnalysis[] = [];
      for (const [index, uri] of uris.entries()) {
        setHint(`Analysing frame ${index + 1} of ${uris.length}…`);
        analyses.push(await livenessService.analyze(uri));
      }

      const best = bestFrame(analyses);
      if (!best?.feature) {
        setHint(undefined);
        Alert.alert(
          'No face detected',
          'Hold the phone steady with your whole face inside the oval, in good light, then try again.',
        );
        return;
      }

      if (!referenceFeature) {
        setHint(undefined);
        Alert.alert('Missing ID photo', 'Please capture your ID card again.');
        router.replace('/id-form');
        return;
      }

      setHint('Comparing with your ID photo…');
      const comparison = livenessService.compare(referenceFeature, best.feature);

      const result: IdentityCheckResult = {
        liveness: best.liveness,
        quality: best.quality,
        matchScore: comparison.similarity,
        matchPercentage: comparison.percentage,
        matched: comparison.matched,
        passed:
          best.liveness >= LIVENESS_THRESHOLD &&
          best.quality >= QUALITY_THRESHOLD &&
          comparison.matched,
        timestamp: Date.now(),
      };

      router.replace({
        pathname: '/verification',
        params: { userInfo: userInfo ?? '', result: JSON.stringify(result) },
      });
    } catch (error) {
      setHint(undefined);
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Verification failed', message);
    }
  };

  return (
    <CameraStage
      facing="front"
      title="Face check"
      subtitle="Hold still. We take three frames to score liveness."
      guide="oval"
      shots={SHOTS}
      busyLabel={hint ?? 'Reading your face on this device…'}
      onPhotos={handlePhotos}
    />
  );
}
