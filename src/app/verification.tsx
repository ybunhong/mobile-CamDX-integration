import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, commonStyles, spacing } from '../theme';
import type { IdentityCheckResult, UserInfo } from '../types/identity';

function parseParam<T>(value?: string): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function scoreColor(score: number): string {
  if (score >= 0.8) return colors.success;
  if (score >= 0.5) return colors.warning;
  return colors.error;
}

function scoreLabel(score: number): string {
  if (score >= 0.8) return 'High';
  if (score >= 0.5) return 'Medium';
  return 'Low';
}

export default function VerificationScreen() {
  const params = useLocalSearchParams<{ userInfo?: string; result?: string }>();
  const userInfo = parseParam<UserInfo>(params.userInfo);
  const result = parseParam<IdentityCheckResult>(params.result);

  if (!result) {
    return (
      <View style={commonStyles.container}>
        <View style={commonStyles.header}>
          <Text style={commonStyles.title}>No result</Text>
          <Text style={commonStyles.subtitle}>Start a new verification to see scores.</Text>
        </View>
        <TouchableOpacity style={commonStyles.button} onPress={() => router.replace('/id-form')}>
          <Text style={commonStyles.buttonText}>Start over</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>Verification Result</Text>
        <Text style={commonStyles.subtitle}>Checked on this device — no photo was uploaded</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.verdictBanner}>
          <Text style={styles.verdictText}>{result.passed ? '✓ Verified' : '✗ Not verified'}</Text>
          <Text style={styles.verdictHint}>
            {result.passed
              ? 'Liveness, image quality and face match all passed.'
              : 'One or more checks did not pass. Try again in better light.'}
          </Text>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Liveness & Quality</Text>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Liveness (anti-spoof)</Text>
            <View style={styles.scoreValueBox}>
              <Text style={[styles.scoreValue, { color: scoreColor(result.liveness) }]}>
                {(result.liveness * 100).toFixed(1)}%
              </Text>
              <Text style={styles.scoreHint}>{scoreLabel(result.liveness)}</Text>
            </View>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Image quality</Text>
            <View style={styles.scoreValueBox}>
              <Text style={[styles.scoreValue, { color: scoreColor(result.quality) }]}>
                {(result.quality * 100).toFixed(1)}%
              </Text>
              <Text style={styles.scoreHint}>{scoreLabel(result.quality)}</Text>
            </View>
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Face Match</Text>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Selfie vs ID photo</Text>
            <View style={styles.scoreValueBox}>
              <Text style={[styles.scoreValue, { color: scoreColor(result.matchPercentage / 100) }]}>
                {result.matchPercentage.toFixed(1)}%
              </Text>
              <Text style={styles.scoreHint}>
                {result.matched ? 'Match' : 'No match'} · cosine {result.matchScore.toFixed(3)}
              </Text>
            </View>
          </View>
        </View>

        {userInfo && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.sectionTitle}>ID Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID number</Text>
              <Text style={styles.infoValue}>{userInfo.idNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name (KH)</Text>
              <Text style={styles.infoValue}>
                {userInfo.lastNameKh} {userInfo.firstNameKh}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name (EN)</Text>
              <Text style={styles.infoValue}>
                {userInfo.lastNameEn} {userInfo.firstNameEn}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of birth</Text>
              <Text style={styles.infoValue}>{userInfo.dob}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={commonStyles.buttonSecondary}
            onPress={() =>
              router.replace({
                pathname: '/face-capture',
                params: { userInfo: params.userInfo ?? '' },
              })
            }
          >
            <Text style={commonStyles.buttonSecondaryText}>Retry face</Text>
          </TouchableOpacity>
          <TouchableOpacity style={commonStyles.button} onPress={() => router.replace('/id-form')}>
            <Text style={commonStyles.buttonText}>Start over</Text>
          </TouchableOpacity>
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
  verdictBanner: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verdictText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  verdictHint: {
    color: colors.textSecondary,
    fontSize: 14,
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
    flex: 1,
  },
  scoreValueBox: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  scoreHint: {
    color: colors.textTertiary,
    fontSize: 12,
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
    flexShrink: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
