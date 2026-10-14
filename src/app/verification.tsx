import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { diditService } from '../services/DiditService';
import { borderRadius, colors, commonStyles, spacing } from '../theme';
import { DiditUserInfo, DiditVerificationResult } from '../types/didit';

export default function VerificationScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<DiditVerificationResult | null>(null);
  
  const { userInfo, faceImage } = useLocalSearchParams();
  const userInfoData: DiditUserInfo = userInfo ? JSON.parse(userInfo as string) : null;
  const faceImageData: string = faceImage as string;

  const handleVerification = async () => {
    setIsLoading(true);
    
    try {
      const result = await diditService.completeVerification(faceImageData);
      
      setVerificationResult(result);
      
      if (result.success && result.livenessOutcome === 'live') {
        Alert.alert(
          'Verification Successful',
          'Your face has been verified successfully',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Verification Failed',
          `Liveness check: ${result.livenessOutcome}. Please try again.`,
          [
            { text: 'Try Again', onPress: () => setIsLoading(false) },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        'Verification Error',
        `${errorMessage}. Please check your connection and try again.`,
        [
          { text: 'Retry', onPress: handleVerification },
          { text: 'Cancel' }
        ]
      );
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

  const getOutcomeColor = (outcome: string) => {
    if (outcome === 'live' || outcome === 'match') return colors.success;
    if (outcome === 'not_live' || outcome === 'no_match') return colors.error;
    return colors.warning;
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
            <Text style={styles.infoLabel}>Face Image:</Text>
            <Text style={styles.infoValue}>✓ Captured</Text>
          </View>
        </View>

        {verificationResult && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.sectionTitle}>Verification Results</Text>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Liveness Score:</Text>
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreValue, { color: getScoreColor(verificationResult.livenessScore) }]}>
                  {(verificationResult.livenessScore * 100).toFixed(1)}%
                </Text>
                <Text style={[styles.scoreLabel, { color: getScoreColor(verificationResult.livenessScore) }]}>
                  {getScoreLabel(verificationResult.livenessScore)}
                </Text>
              </View>
            </View>

            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Liveness Outcome:</Text>
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreValue, { color: getOutcomeColor(verificationResult.livenessOutcome) }]}>
                  {verificationResult.livenessOutcome.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Quality Score:</Text>
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreValue, { color: getScoreColor(verificationResult.qualityScore) }]}>
                  {(verificationResult.qualityScore * 100).toFixed(1)}%
                </Text>
                <Text style={[styles.scoreLabel, { color: getScoreColor(verificationResult.qualityScore) }]}>
                  {getScoreLabel(verificationResult.qualityScore)}
                </Text>
              </View>
            </View>

            {verificationResult.matchScore > 0 && (
              <>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Face Match Score:</Text>
                  <View style={styles.scoreContainer}>
                    <Text style={[styles.scoreValue, { color: getScoreColor(verificationResult.matchScore) }]}>
                      {(verificationResult.matchScore * 100).toFixed(1)}%
                    </Text>
                    <Text style={[styles.scoreLabel, { color: getScoreColor(verificationResult.matchScore) }]}>
                      {getScoreLabel(verificationResult.matchScore)}
                    </Text>
                  </View>
                </View>

                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Match Outcome:</Text>
                  <View style={styles.scoreContainer}>
                    <Text style={[styles.scoreValue, { color: getOutcomeColor(verificationResult.matchOutcome) }]}>
                      {verificationResult.matchOutcome.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </>
            )}

            <View style={[styles.resultBanner, { backgroundColor: verificationResult.success && verificationResult.livenessOutcome === 'live' ? colors.success : colors.error }]}>
              <Text style={styles.resultText}>
                {verificationResult.success && verificationResult.livenessOutcome === 'live' 
                  ? '✓ Verification Successful' 
                  : '✗ Verification Failed'}
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
