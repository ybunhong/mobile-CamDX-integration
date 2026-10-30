import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, commonStyles, spacing, typography } from '../../theme';
import type { UserInfo } from '../../types/identity';

function parseUserInfo(value?: string): UserInfo | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as UserInfo;
  } catch {
    return null;
  }
}

export default function EnrollSuccessScreen() {
  const { userInfo, replaced } = useLocalSearchParams<{
    userInfo?: string;
    replaced?: string;
  }>();
  const data = parseUserInfo(userInfo);
  const wasReplaced = replaced === 'true';

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>{wasReplaced ? '✓ Face updated' : '✓ Face added'}</Text>
        <Text style={commonStyles.subtitle}>
          {wasReplaced
            ? 'This ID number already had a record, so it was replaced — the count did not go up.'
            : "Face features are now held in the local server's memory and will disappear when it restarts."}
        </Text>
      </View>

      {data && (
        <View style={[commonStyles.section, styles.section]}>
          <Text style={commonStyles.sectionTitle}>Enrolled record</Text>
          <View style={styles.row}>
            <Text style={styles.label}>ID number</Text>
            <Text style={styles.value}>{data.idNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Name (EN)</Text>
            <Text style={styles.value}>
              {data.lastNameEn} {data.firstNameEn}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Name (KH)</Text>
            <Text style={styles.value}>
              {data.lastNameKh} {data.firstNameKh}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={commonStyles.button} onPress={() => router.replace('/')}>
          <Text style={commonStyles.buttonText}>Back to home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[commonStyles.buttonSecondary, styles.secondButton]}
          onPress={() => router.replace('/verify/capture')}
        >
          <Text style={commonStyles.buttonSecondaryText}>Verify someone</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySecondary,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  actions: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  secondButton: {
    marginTop: spacing.md,
  },
});
