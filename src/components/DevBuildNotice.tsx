import { StyleSheet, Text, View } from 'react-native';
import { NATIVE_UNAVAILABLE_MESSAGE } from '../services/LivenessService';
import { borderRadius, colors, commonStyles, spacing, typography } from '../theme';

/** Shown instead of the camera when the native face engine isn't linked (Expo Go). */
export default function DevBuildNotice() {
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>Development build required</Text>
        <Text style={commonStyles.subtitle}>Expo Go cannot run on-device face checks.</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.body}>{NATIVE_UNAVAILABLE_MESSAGE}</Text>
        <Text style={styles.command}>eas build --profile development -p android</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: {
    ...typography.bodySecondary,
    marginBottom: spacing.md,
  },
  command: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
