import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { camdigikeyService } from '../services/CamDigiKeyService';
import { borderRadius, colors, commonStyles, spacing } from '../theme';
import { CamDigiKeyUserInfo, VerificationResult } from '../types/camdigikey';

export default function VerificationScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  const { userInfo, idImage, livenessImages, actions } = useLocalSearchParams();
  const userInfoData: CamDigiKeyUserInfo = userInfo ? JSON.parse(userInfo as string) : null;
  const idImageData: string = idImage as string;
  const livenessImagesData: string[] = livenessImages ? JSON.parse(livenessImages as string) : [];
  const actionsData: string[] = actions ? JSON.parse(actions as string) : [];

  const handleVerification = async () => {
    setIsLoading(true);
    
    try {
      const result = await camdigikeyService.completeVerification(
        userInfoData,
        idImageData,
        livenessImagesData,
        actionsData
      );
      
      setVerificationResult(result);
      
      if (result.success) {
        Alert.alert(
          'Verification Successful',
          'Your identity has been verified successfully',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Verification Failed',
          'Please check your information and try again',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return colors.success;
    if (score >= 0.5) return colors.warning;
    return colors.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>Identity Verification</Text>
        <Text style={commonStyles.subtitle}>Review your information before verification</Text>
      </View>

      <View style={styles.content}>
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>User Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Number:</Text>
            <Text style={styles.infoValue}>{userInfoData?.idNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name (KH):</Text>
            <Text style={styles.infoValue}>{userInfoData?.firstNameKh} {userInfoData?.lastNameKh}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name (EN):</Text>
            <Text style={styles.infoValue}>{userInfoData?.firstNameEn} {userInfoData?.lastNameEn}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender:</Text>
            <Text style={styles.infoValue}>{userInfoData?.gender === 'M' ? 'Male' : 'Female'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth:</Text>
            <Text style={styles.infoValue}>{userInfoData?.dob}</Text>
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Capture Summary</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Card:</Text>
            <Text style={styles.infoValue}>✓ Captured</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Liveness Steps:</Text>
            <Text style={styles.infoValue}>{livenessImagesData.length}/3 Completed</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Actions:</Text>
            <Text style={styles.infoValue}>{actionsData.join(', ')}</Text>
          </View>
        </View>

        {verificationResult && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.sectionTitle}>Verification Results</Text>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>User Info Score:</Text>
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreValue, { color: getScoreColor(verificationResult.userInfoScore) }]}>
                  {(verificationResult.userInfoScore * 100).toFixed(1)}%
                </Text>
                <Text style={[styles.scoreLabel, { color: getScoreColor(verificationResult.userInfoScore) }]}>
                  {getScoreLabel(verificationResult.userInfoScore)}
                </Text>
              </View>
            </View>

            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Face-Document Score:</Text>
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreValue, { color: getScoreColor(verificationResult.faceDocumentScore) }]}>
                  {(verificationResult.faceDocumentScore * 100).toFixed(1)}%
                </Text>
                <Text style={[styles.scoreLabel, { color: getScoreColor(verificationResult.faceDocumentScore) }]}>
                  {getScoreLabel(verificationResult.faceDocumentScore)}
                </Text>
              </View>
            </View>

            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Face-MOI Score:</Text>
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreValue, { color: getScoreColor(verificationResult.faceMoiScore) }]}>
                  {(verificationResult.faceMoiScore * 100).toFixed(1)}%
                </Text>
                <Text style={[styles.scoreLabel, { color: getScoreColor(verificationResult.faceMoiScore) }]}>
                  {getScoreLabel(verificationResult.faceMoiScore)}
                </Text>
              </View>
            </View>

            {verificationResult.incorrectFields.length > 0 && (
              <View style={styles.errorSection}>
                <Text style={styles.errorTitle}>Incorrect Fields:</Text>
                {verificationResult.incorrectFields.map((field, index) => (
                  <Text key={index} style={styles.errorText}>• {field}</Text>
                ))}
              </View>
            )}

            <View style={[styles.resultBanner, { backgroundColor: verificationResult.success ? colors.success : colors.error }]}>
              <Text style={styles.resultText}>
                {verificationResult.success ? '✓ Verification Successful' : '✗ Verification Failed'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {!verificationResult ? (
            <>
              <TouchableOpacity style={commonStyles.buttonSecondary} onPress={() => router.back()}>
                <Text style={commonStyles.buttonSecondaryText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[commonStyles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerification}
                disabled={isLoading}
              >
                <Text style={commonStyles.buttonText}>
                  {isLoading ? 'Verifying...' : 'Start Verification'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.newVerificationButton}
              onPress={() => {
                setVerificationResult(null);
                router.replace('/id-form');
              }}
            >
              <Text style={styles.newVerificationButtonText}>New Verification</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  infoValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreLabel: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorSection: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorTitle: {
    color: colors.error,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  resultBanner: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resultText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(225, 61, 61, 0.5)',
  },
  newVerificationButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  newVerificationButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});