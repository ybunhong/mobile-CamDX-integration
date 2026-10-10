import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, cameraStyles, colors, spacing } from '../theme';
import { CamDigiKeyUserInfo, LivenessAction, LivenessStep } from '../types/camdigikey';

export default function LivenessCaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState('front');
  const [currentStep, setCurrentStep] = useState(0);
  const [livenessSteps, setLivenessSteps] = useState<LivenessStep[]>([
    { action: '1', instruction: 'Turn your face to the LEFT', completed: false },
    { action: '2', instruction: 'Turn your face to the RIGHT', completed: false },
    { action: '3', instruction: 'Nod your head UP and DOWN', completed: false },
  ]);
  const [finalLivenessImage, setFinalLivenessImage] = useState<string | null>(null);
  
  const { userInfo, idImage } = useLocalSearchParams();
  const userInfoData: CamDigiKeyUserInfo = userInfo ? JSON.parse(userInfo as string) : null;
  const idImageData: string = idImage as string;

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

  async function captureLivenessStep() {
    console.log('Liveness capture button pressed, cameraRef.current:', cameraRef.current);
    if (cameraRef.current) {
      try {
        console.log('Attempting to take liveness picture...');
        const photo = await cameraRef.current.takePictureAsync();
        console.log('Liveness photo captured:', photo.uri);
        
        const updatedSteps = [...livenessSteps];
        updatedSteps[currentStep] = {
          ...updatedSteps[currentStep],
          completed: true,
          imageUri: photo.uri,
        };
        setLivenessSteps(updatedSteps);
        
        if (currentStep === livenessSteps.length - 1) {
          setFinalLivenessImage(photo.uri);
        }

        if (currentStep < livenessSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          Alert.alert(
            'Liveness Check Complete',
            'All liveness steps completed successfully',
            [
              {
                text: 'Proceed to Verification',
                onPress: () => {
                  router.push({
                    pathname: '/verification',
                    params: {
                      userInfo: JSON.stringify(userInfoData),
                      idImage: idImageData,
                      livenessImages: JSON.stringify([finalLivenessImage || photo.uri]),
                      actions: JSON.stringify(updatedSteps.map(s => s.action)),
                    },
                  });
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error('Error capturing liveness:', error);
        Alert.alert('Error', 'Failed to capture liveness step');
      }
    } else {
      console.error('Camera ref is null for liveness');
      Alert.alert('Error', 'Camera not ready');
    }
  }

  function resetStep() {
    const updatedSteps = [...livenessSteps];
    updatedSteps[currentStep] = {
      ...updatedSteps[currentStep],
      completed: false,
      imageUri: undefined,
    };
    setLivenessSteps(updatedSteps);
  }

  function getInstructionIcon(action: LivenessAction) {
    switch (action) {
      case '1':
        return '← Turn Left';
      case '2':
        return '→ Turn Right';
      case '3':
        return '↕ Nod Head';
      default:
        return '';
    }
  }

  return (
    <View style={cameraStyles.cameraContainer}>
      <CameraView style={cameraStyles.camera} facing={facing} ref={cameraRef} />
      
      <View style={cameraStyles.overlay}>
        <View style={cameraStyles.cameraHeader}>
          <Text style={cameraStyles.cameraTitle}>Liveness Check</Text>
          <Text style={cameraStyles.cameraSubtitle}>Step {currentStep + 1} of {livenessSteps.length}</Text>
          <TouchableOpacity style={cameraStyles.flipButton} onPress={toggleCameraFacing}>
            <Text style={cameraStyles.flipButtonText}>🔄 Flip Camera</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          {livenessSteps.map((step, index) => (
            <View
              key={index}
              style={[
                styles.progressStep,
                index === currentStep && styles.progressStepActive,
                step.completed && styles.progressStepCompleted,
              ]}
            >
              <Text style={styles.progressStepText}>{index + 1}</Text>
            </View>
          ))}
        </View>

        <View style={styles.instructionContainer}>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionIcon}>
              {getInstructionIcon(livenessSteps[currentStep].action)}
            </Text>
            <Text style={styles.instructionText}>
              {livenessSteps[currentStep].instruction}
            </Text>
          </View>
        </View>

        <View style={styles.faceGuide}>
          <View style={styles.faceOutline} />
          <Text style={styles.faceGuideText}>Position your face here</Text>
        </View>

        <View style={cameraStyles.buttonContainer}>
          <TouchableOpacity 
            style={cameraStyles.cancelButton} 
            onPress={() => {
              if (currentStep > 0) {
                setCurrentStep(currentStep - 1);
              } else {
                router.back();
              }
            }}
          >
            <Text style={cameraStyles.cancelButtonText}>Back</Text>
          </TouchableOpacity>
          
          {livenessSteps[currentStep].completed ? (
            <TouchableOpacity style={styles.resetButton} onPress={resetStep}>
              <Text style={styles.resetButtonText}>Retake</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={cameraStyles.captureButton} onPress={captureLivenessStep}>
              <Text style={cameraStyles.captureButtonText}>Capture</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressStepActive: {
    backgroundColor: `rgba(225, 61, 61, 0.5)`,
    borderColor: colors.primary,
  },
  progressStepCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  progressStepText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionContainer: {
    paddingHorizontal: spacing.xxxl,
    marginBottom: spacing.xxl,
  },
  instructionBox: {
    backgroundColor: `rgba(225, 61, 61, 0.3)`,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  instructionIcon: {
    color: colors.text,
    fontSize: 32,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  instructionText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
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
  resetButton: {
    flex: 1,
    backgroundColor: colors.warning,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
