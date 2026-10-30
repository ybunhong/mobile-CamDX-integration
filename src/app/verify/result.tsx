import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, commonStyles, spacing, typography } from '../../theme';
import type { MatchKind, MatchResult } from '../../types/identity';

function parse<T>(value?: string): T | null {
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

export default function VerifyResultScreen() {
  const params = useLocalSearchParams<{
    kind?: string;
    match?: string;
    liveness?: string;
    quality?: string;
    enrolled?: string;
  }>();

  const match = parse<MatchResult>(params.match);
  const kind = (params.kind as MatchKind | undefined) ?? 'selfie';
  const liveness = Number(params.liveness ?? '0');
  const quality = Number(params.quality ?? '0');

  if (!match) {
    return (
      <View style={commonStyles.container}>
        <View style={commonStyles.header}>
          <Text style={commonStyles.title}>No result</Text>
          <Text style={commonStyles.subtitle}>Start a new verification.</Text>
        </View>
        <TouchableOpacity style={commonStyles.button} onPress={() => router.replace('/')}>
          <Text style={commonStyles.buttonText}>Back to home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const passed = match.matched;

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>{passed ? '✓ Match found' : '✗ No match'}</Text>
        <Text style={commonStyles.subtitle}>
          {kind === 'selfie' ? 'Selfie' : 'ID card portrait'} compared with{' '}
          {params.enrolled ?? '?'} enrolment{params.enrolled === '1' ? '' : 's'} on device.
        </Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.banner, { borderColor: passed ? colors.success : colors.error }]}>
          <Text style={styles.bannerText}>
            {passed ? 'Identity verified' : 'Not the same person as the closest record'}
          </Text>
          <Text style={styles.bannerHint}>
            {passed
              ? `${match.percentage.toFixed(1)}% similarity (cosine ${match.similarity.toFixed(3)})`
              : `Closest was ${match.percentage.toFixed(1)}% — below the SDK threshold`}
          </Text>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Closest enrolled record</Text>
          <View style={styles.row}>
            <Text style={styles.label}>ID number</Text>
            <Text style={styles.value}>{match.enrollment.idNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Name (EN)</Text>
            <Text style={styles.value}>
              {match.enrollment.userInfo.lastNameEn} {match.enrollment.userInfo.firstNameEn}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Name (KH)</Text>
            <Text style={styles.value}>
              {match.enrollment.userInfo.lastNameKh} {match.enrollment.userInfo.firstNameKh}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date of birth</Text>
            <Text style={styles.value}>{match.enrollment.userInfo.dob}</Text>
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Capture scores</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Face match</Text>
            <Text style={[styles.value, { color: scoreColor(match.percentage / 100) }]}>
              {match.percentage.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Liveness</Text>
            <Text style={[styles.value, { color: scoreColor(liveness) }]}>
              {(liveness * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Image quality</Text>
            <Text style={[styles.value, { color: scoreColor(quality) }]}>
              {(quality * 100).toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={commonStyles.buttonSecondary}
            onPress={() => router.replace('/verify/capture')}
          >
            <Text style={commonStyles.buttonSecondaryText}>Scan again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={commonStyles.button} onPress={() => router.replace('/')}>
            <Text style={commonStyles.buttonText}>Home</Text>
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
  banner: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    backgroundColor: colors.surface,
    marginBottom: spacing.xl,
  },
  bannerText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  bannerHint: {
    ...typography.caption,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySecondary,
    flex: 1,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
