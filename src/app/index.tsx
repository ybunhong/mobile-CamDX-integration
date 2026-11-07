import { useObserve } from 'expo-observe';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiClient } from '../services/ApiClient';
import { borderRadius, colors, commonStyles, spacing, typography } from '../theme';

export default function HomeScreen() {
  const [count, setCount] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);
  const { markInteractive } = useObserve();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  useEffect(() => {
    apiClient
      .health()
      .then((status) => {
        setCount(status.count);
        setOffline(false);
      })
      .catch(() => setOffline(true));
  }, []);

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>Identity check</Text>
        <Text style={commonStyles.subtitle}>
          Everything is processed on this device. The local server only stores face features in
          memory.
        </Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={commonStyles.button}
          onPress={() => router.push('/enroll/id-form')}
        >
          <Text style={commonStyles.buttonText}>Add face</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Enter ID details, photograph the card, then take a selfie.</Text>

        <TouchableOpacity
          style={[commonStyles.buttonSecondary, styles.secondButton]}
          onPress={() => router.push('/verify/capture')}
        >
          <Text style={commonStyles.buttonSecondaryText}>Verify identity</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Scan an ID card or take a selfie to find a match.</Text>

        <View style={styles.status}>
          <Text style={styles.statusText}>
            {offline
              ? 'Local server not reachable — run `npm run server`'
              : count === null
                ? 'Checking local server…'
                : `${count} enrolment${count === 1 ? '' : 's'} in memory`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  hint: {
    ...typography.caption,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  secondButton: {
    marginTop: spacing.sm,
  },
  status: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: {
    ...typography.caption,
  },
});
