import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import CameraStage from '../../components/CameraStage';
import DevBuildNotice from '../../components/DevBuildNotice';
import { isLivenessAvailable, livenessService } from '../../services/LivenessService';

export default function EnrollDocumentCaptureScreen() {
  const { userInfo } = useLocalSearchParams<{ userInfo?: string }>();
  const [hint, setHint] = useState<string>();

  if (!isLivenessAvailable()) return <DevBuildNotice />;

  const handlePhoto = async ([uri]: string[]) => {
    setHint('Reading the portrait on your card…');

    try {
      const analysis = await livenessService.analyze(uri);

      if (!analysis.feature) {
        setHint(undefined);
        Alert.alert(
          'Portrait not detected',
          `No usable face on that photo (faces detected: ${analysis.faceCount}).\n\n` +
            'Lay the card flat, fill the frame with the portrait page, avoid glare, and hold the ' +
            'phone steady. You can also crop mentally: the printed photo should cover roughly a ' +
            'third of the frame.',
        );
        return;
      }

      router.push({
        pathname: '/enroll/face-capture',
        params: {
          userInfo: userInfo ?? '',
          documentFeature: analysis.feature,
        },
      });
    } catch (error) {
      setHint(undefined);
      Alert.alert(
        'Could not read the photo',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  };

  return (
    <CameraStage
      facing="back"
      title="ID card portrait"
      subtitle="Fill the frame with the photo page of your card."
      guide="card"
      busyLabel={hint ?? 'Reading the portrait on your card…'}
      onPhotos={handlePhoto}
    />
  );
}
