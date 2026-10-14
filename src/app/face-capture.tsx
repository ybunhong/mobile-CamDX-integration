import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, spacing, borderRadius, commonStyles, cameraStyles } from '../theme';

export default function FaceCaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState('front');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const { userInfo } = useLocalSearchParams();
  const userInfoData = userInfo ? JSON.parse(userInfo as string) : null;

  if (!permission) {
    return <View style={commonStyles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={commonStyles.container}>
        <Text style={commonStyles.body}>We need camera permission to capture your face</Text>
        <TouchableOpacity style={commonStyles.button} onPress={requestPermission}>
          <Text style={commonStyles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function captureFace() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedImage(photo.uri);
        
        setTimeout(() => {
          router.push({
            pathname: '/verification',
            params: {
              userInfo: JSON.stringify(userInfoData),
              faceImage: photo.uri,
            },
          });
        }, 500);
      } catch (error) {
        console.error('Error capturing face:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        Alert.alert(
          'Capture Failed',
          `Failed to capture face: ${errorMessage}. Please try again.`,
          [
            { text: 'Retry', onPress: captureFace },
            { text: 'Cancel' }
          ]
        );
      }
    } else {
      Alert.alert(
        'Camera Error',
        'Camera is not ready. Please wait a moment and try again.',
        [{ text: 'OK' }]
      );
    }
  }

  return (
    <View style={cameraStyles.cameraContainer}>
      <CameraView style={cameraStyles.camera} facing={facing} ref={cameraRef} />
      
      <View style={cameraStyles.overlay}>
        <View style={cameraStyles.cameraHeader}>
          <Text style={cameraStyles.cameraTitle}>Capture Your Face</Text>
          <Text style={cameraStyles.cameraSubtitle}>Position your face within the frame</Text>
          <TouchableOpacity style={cameraStyles.flipButton} onPress={toggleCameraFacing}>
            <Text style={cameraStyles.flipButtonText}>🔄 Flip Camera</Text>
          </TouchableOpacity>
        </View>

        {capturedImage ? (
          <View style={styles.capturedIndicator}>
            <Text style={styles.capturedText}>✓ Photo Captured!</Text>
            <Text style={styles.capturedSubtext}>Proceeding to verification...</Text>
          </View>
        ) : (
          <>
            <View style={styles.faceGuide}>
              <View style={styles.faceOval} />
              <Text style={styles.faceGuideText}>Position your face here</Text>
            </View>

            <View style={cameraStyles.cameraFooter}>
              <TouchableOpacity style={styles.captureButton} onPress={captureFace}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  capturedIndicator: {
    ...commonStyles.centerContent,
    padding: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: borderRadius.md,
  },
  capturedText: {
    ...commonStyles.h3,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  capturedSubtext: {
    ...commonStyles.caption,
    color: colors.textSecondary,
  },
  faceGuide: {
    ...commonStyles.centerContent,
    flex: 1,
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
  faceGuideText: {
    ...commonStyles.body,
    color: colors.text,
    textAlign: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xl,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    margin: 5,
  },
});
