import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, cameraStyles, colors, commonStyles, spacing, typography } from '../theme';

interface CameraStageProps {
  facing?: CameraType;
  title: string;
  subtitle: string;
  guide?: 'card' | 'oval';
  /** How many photos to take per press. Several frames give a steadier liveness score. */
  shots?: number;
  busyLabel?: string;
  onPhotos: (uris: string[]) => Promise<void>;
}

const SHOT_INTERVAL_MS = 350;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function CameraStage({
  facing = 'back',
  title,
  subtitle,
  guide = 'card',
  shots = 1,
  busyLabel = 'Analysing…',
  onPhotos,
}: CameraStageProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const [captured, setCaptured] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current || busy) return;

    setBusy(true);
    try {
      const uris: string[] = [];
      for (let i = 0; i < shots; i += 1) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
        if (!photo?.uri) throw new Error('Camera did not return an image');
        uris.push(photo.uri);
        if (i < shots - 1) await sleep(SHOT_INTERVAL_MS);
      }

      setCaptured(true);
      await onPhotos(uris);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Capture failed', message);
    } finally {
      setBusy(false);
      setCaptured(false);
    }
  };

  if (!permission) {
    return <View style={commonStyles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={cameraStyles.permissionContainer}>
        <Text style={cameraStyles.message}>We need camera access to verify your identity.</Text>
        <TouchableOpacity style={commonStyles.button} onPress={requestPermission}>
          <Text style={commonStyles.buttonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={cameraStyles.cameraContainer}>
      <CameraView style={cameraStyles.camera} facing={facing} ref={cameraRef} />

      <View style={cameraStyles.overlay}>
        <View style={cameraStyles.cameraHeader}>
          <Text style={cameraStyles.cameraTitle}>{title}</Text>
          <Text style={cameraStyles.cameraSubtitle}>{subtitle}</Text>
        </View>

        <View style={styles.guideArea}>
          {busy ? (
            <View style={styles.busyBox}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.busyText}>{captured ? busyLabel : 'Capturing…'}</Text>
            </View>
          ) : (
            <>
              <View style={guide === 'oval' ? styles.faceOval : styles.cardFrame} />
              <Text style={styles.guideText}>
                {guide === 'oval' ? 'Align your face inside the oval' : 'Fit the card inside the frame'}
              </Text>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.captureButton, busy && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={busy}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  guideArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  cardFrame: {
    width: '85%',
    aspectRatio: 1.585, // ID-1 card shape
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: 'rgba(225, 61, 61, 0.08)',
    marginBottom: spacing.md,
  },
  faceOval: {
    width: 250,
    height: 350,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: 'rgba(225, 61, 61, 0.1)',
    marginBottom: spacing.md,
  },
  guideText: {
    ...typography.body,
    textAlign: 'center',
  },
  busyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: borderRadius.md,
  },
  busyText: {
    ...typography.bodySecondary,
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.4,
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    margin: 6,
  },
});
