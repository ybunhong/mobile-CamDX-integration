import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import CameraStage from '../components/CameraStage';
import DevBuildNotice from '../components/DevBuildNotice';
import { isLivenessAvailable, livenessService } from '../services/LivenessService';

export default function DocumentCaptureScreen() {
  const { userInfo } = useLocalSearchParams<{ userInfo?: string }>();
  const [hint, setHint] = useState<string>();

  if (!isLivenessAvailable()) return <DevBuildNotice />;

  const handlePhoto = async ([uri]: string[]) => {
    setHint('Reading the photo on this device…');

    try {
      const analysis = await livenessService.analyze(uri);

      if (!analysis.faceDetected || !analysis.feature) {
        setHint(undefined);
        Alert.alert(
          'No face found',
          'We could not find a portrait on that photo. Try again with the photo page of your ID card, well lit and in focus.',
        );
        return;
      }

      router.push({
        pathname: '/face-capture',
        params: {
          userInfo: userInfo ?? '',
          referenceFeature: analysis.feature,
        },
      });
    } catch (error) {
      setHint(undefined);
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Could not read the photo', message);
    }
  };

  return (
    <CameraStage
      facing="back"
      title="ID card photo"
      subtitle="Photograph the page with your portrait. Nothing leaves your device."
      guide="card"
      busyLabel={hint ?? 'Reading the photo on this device…'}
      onPhotos={handlePhoto}
    />
  );
}
