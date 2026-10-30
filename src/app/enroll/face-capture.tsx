import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import CameraStage from '../../components/CameraStage';
import DevBuildNotice from '../../components/DevBuildNotice';
import { apiClient } from '../../services/ApiClient';
import {
  LIVENESS_THRESHOLD,
  QUALITY_THRESHOLD,
  isLivenessAvailable,
  livenessService,
} from '../../services/LivenessService';
import type { FaceAnalysis, UserInfo } from '../../types/identity';

const SHOTS = 3;

function bestFrame(results: FaceAnalysis[]): FaceAnalysis | null {
  const usable = results.filter((result) => result.feature);
  if (usable.length === 0) return null;
  return usable.reduce((best, current) => (current.liveness > best.liveness ? current : best));
}

export default function EnrollFaceCaptureScreen() {
  const { userInfo, documentFeature } = useLocalSearchParams<{
    userInfo?: string;
    documentFeature?: string;
  }>();
  const [hint, setHint] = useState<string>();

  if (!isLivenessAvailable()) return <DevBuildNotice />;

  const handlePhotos = async (uris: string[]) => {
    setHint('Checking liveness on this device…');

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
          'Hold the phone steady with your whole face inside the oval, in good light.',
        );
        return;
      }

      if (best.liveness < LIVENESS_THRESHOLD || best.quality < QUALITY_THRESHOLD) {
        setHint(undefined);
        Alert.alert(
          'Liveness check failed',
          `Liveness ${(best.liveness * 100).toFixed(0)}% (need ${LIVENESS_THRESHOLD * 100}%), ` +
            `quality ${(best.quality * 100).toFixed(0)}% (need ${QUALITY_THRESHOLD * 100}%). ` +
            'Use even lighting and look straight at the camera.',
        );
        return;
      }

      const parsedUserInfo = userInfo ? (JSON.parse(userInfo) as UserInfo) : null;
      if (!parsedUserInfo || !documentFeature) {
        setHint(undefined);
        Alert.alert('Missing data', 'Please restart the enrolment from the ID form.');
        router.replace('/');
        return;
      }

      setHint('Saving to the local server…');
      const saved = await apiClient.enroll({
        idNumber: parsedUserInfo.idNumber,
        userInfo: parsedUserInfo,
        selfieFeature: best.feature,
        documentFeature,
      });

      router.replace({
        pathname: '/enroll/success',
        params: {
          userInfo: JSON.stringify(parsedUserInfo),
          replaced: String(saved.replaced),
        },
      });
    } catch (error) {
      setHint(undefined);
      Alert.alert(
        'Could not save enrolment',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  };

  return (
    <CameraStage
      facing="front"
      title="Enrolment selfie"
      subtitle="Look straight ahead. Three frames are checked for liveness."
      guide="oval"
      shots={SHOTS}
      busyLabel={hint ?? 'Checking liveness on this device…'}
      onPhotos={handlePhotos}
    />
  );
}
