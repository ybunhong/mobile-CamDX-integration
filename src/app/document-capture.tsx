import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, cameraStyles, colors, spacing } from '../theme';
import { CamDigiKeyUserInfo } from '../types/camdigikey';

export default function DocumentCaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const { userInfo } = useLocalSearchParams();
  const userInfoData: CamDigiKeyUserInfo = userInfo ? JSON.parse(userInfo as string) : null;

  if (!permission) {
    return <View style={cameraStyles.cameraContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={cameraStyles.cameraContainer}>
        <View style={cameraStyles.permissionContainer}>
          <Text style={cameraStyles.message}>We need your permission to show the camera</Text>
          <TouchableOpacity onPress={requestPermission} style={cameraStyles.button}>
            <Text style={cameraStyles.buttonText}>Grant permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function captureDocument() {
    console.log('Capture button pressed, cameraRef.current:', cameraRef.current);
    if (cameraRef.current) {
      try {
        console.log('Attempting to take picture...');
        const photo = await cameraRef.current.takePictureAsync();
        console.log('Photo captured:', photo.uri);
        console.log('Photo object:', JSON.stringify(photo));
        setCapturedImage(photo.uri);
        
        setTimeout(() => {
          console.log('Navigating to liveness capture');
          console.log('UserInfo:', JSON.stringify(userInfoData));
          console.log('ID Image:', photo.uri);
          router.push({
            pathname: '/liveness-capture',
            params: {
              userInfo: JSON.stringify(userInfoData),
              idImage: photo.uri,
            },
          });
        }, 500);
      } catch (error) {
        console.error('Error capturing document:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        Alert.alert(
          'Capture Failed',
          `Failed to capture document: ${errorMessage}. Please try again.`,
          [
            { text: 'Retry', onPress: captureDocument },
            { text: 'Cancel' }
          ]
        );
      }
    } else {
      console.error('Camera ref is null');
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
          <Text style={cameraStyles.cameraTitle}>Capture ID Card</Text>
          <Text style={cameraStyles.cameraSubtitle}>Position your ID card within the frame</Text>
          <TouchableOpacity style={cameraStyles.flipButton} onPress={toggleCameraFacing}>
            <Text style={cameraStyles.flipButtonText}>🔄 Flip Camera</Text>
          </TouchableOpacity>
        </View>

        {capturedImage ? (
          <View style={styles.capturedIndicator}>
            <Text style={styles.capturedText}>✓ Photo Captured!</Text>
            <Text style={styles.capturedSubtext}>Navigating to liveness check...</Text>
          </View>
        ) : (
          <>
            {facing === 'front' ? (
              <View style={styles.faceGuide}>
                <View style={styles.faceOutline} />
                <Text style={styles.faceGuideText}>Position your face here</Text>
              </View>
            ) : (
              <>
                <View style={styles.documentFrame}>
                  <View style={styles.cornerTopLeft} />
                  <View style={styles.cornerTopRight} />
                  <View style={styles.cornerBottomLeft} />
                  <View style={styles.cornerBottomRight} />
                </View>

                <View style={styles.instructions}>
                  <Text style={styles.instructionText}>• Ensure good lighting</Text>
                  <Text style={styles.instructionText}>• Keep ID card flat and steady</Text>
                  <Text style={styles.instructionText}>• Avoid glare and shadows</Text>
                </View>
              </>
            )}
          </>
        )}

        <View style={cameraStyles.buttonContainer}>
          <TouchableOpacity style={cameraStyles.cancelButton} onPress={() => router.back()}>
            <Text style={cameraStyles.cancelButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cameraStyles.captureButton} onPress={captureDocument}>
            <Text style={cameraStyles.captureButtonText}>Capture</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  documentFrame: {
    flex: 1,
    margin: spacing.xxxl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: borderRadius.sm,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopColor: colors.primary,
    borderLeftColor: colors.primary,
  },
  cornerTopRight: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopColor: colors.primary,
    borderRightColor: colors.primary,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomColor: colors.primary,
    borderLeftColor: colors.primary,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomColor: colors.primary,
    borderRightColor: colors.primary,
  },
  instructions: {
    paddingHorizontal: spacing.xxxl,
    marginBottom: spacing.xxl,
  },
  instructionText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  faceGuide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  faceOutline: {
    width: 200,
    height: 280,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 100,
    marginBottom: spacing.lg,
  },
  faceGuideText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  capturedIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  capturedText: {
    color: colors.success,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  capturedSubtext: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
