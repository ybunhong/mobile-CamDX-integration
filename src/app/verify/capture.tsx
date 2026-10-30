import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CameraStage from '../../components/CameraStage';
import DevBuildNotice from '../../components/DevBuildNotice';
import { apiClient } from '../../services/ApiClient';
import { isLivenessAvailable, livenessService } from '../../services/LivenessService';
import { borderRadius, colors, commonStyles, spacing, typography } from '../../theme';
import type { FaceAnalysis, MatchKind } from '../../types/identity';

type Mode = 'choose' | MatchKind;

const SHOTS: Record<MatchKind, number> = { document: 1, selfie: 3 };

function bestFrame(results: FaceAnalysis[]): FaceAnalysis | null {
  const usable = results.filter((result) => result.feature);
  if (usable.length === 0) return null;
  return usable.reduce((best, current) => (current.liveness > best.liveness ? current : best));
}

export default function VerifyCaptureScreen() {
  const [mode, setMode] = useState<Mode>('choose');
  const [hint, setHint] = useState<string>();
  const [count, setCount] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      setMode('choose');
      setHint(undefined);
      apiClient
        .health()
        .then((status) => setCount(status.count))
        .catch(() => setCount(null));
    }, []),
  );

  if (!isLivenessAvailable()) return <DevBuildNotice />;

  const handlePhotos = async (uris: string[]) => {
    if (mode === 'choose') return;

    setHint('Reading the face on this device…');

    try {
      const analyses: FaceAnalysis[] = [];
      for (const uri of uris) {
        analyses.push(await livenessService.analyze(uri));
      }

      const best = bestFrame(analyses);
      if (!best?.feature) {
        setHint(undefined);
        Alert.alert(
          'No face detected',
          mode === 'document'
            ? 'No portrait found on the card. Lay it flat, fill the frame and avoid glare.'
            : 'Hold steady with your whole face inside the oval, in good light.',
        );
        return;
      }

      setHint('Matching against enrolled faces…');
      const enrollments = await apiClient.listEnrollments();

      if (enrollments.length === 0) {
        setHint(undefined);
        Alert.alert('Nothing enrolled yet', 'Add a face first, then try verification again.');
        return;
      }

      const match = livenessService.findBestMatch(best.feature, mode, enrollments);
      if (!match) {
        setHint(undefined);
        Alert.alert('No comparable record', 'The stored enrolments have no reference for this input.');
        return;
      }

      router.push({
        pathname: '/verify/result',
        params: {
          kind: mode,
          match: JSON.stringify(match),
          liveness: String(best.liveness),
          quality: String(best.quality),
          enrolled: String(enrollments.length),
        },
      });
    } catch (error) {
      setHint(undefined);
      Alert.alert(
        'Verification failed',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  };

  if (mode === 'choose') {
    return (
      <View style={commonStyles.container}>
        <View style={commonStyles.header}>
          <Text style={commonStyles.title}>Verify identity</Text>
          <Text style={commonStyles.subtitle}>
            {count === null
              ? 'Local server not reachable — run `npm run server`.'
              : `${count} enrolment${count === 1 ? '' : 's'} available.`}
          </Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={commonStyles.button}
            onPress={() => setMode('selfie')}
          >
            <Text style={commonStyles.buttonText}>Use a selfie</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Liveness-checked live face.</Text>

          <TouchableOpacity
            style={[commonStyles.buttonSecondary, styles.secondButton]}
            onPress={() => setMode('document')}
          >
            <Text style={commonStyles.buttonSecondaryText}>Scan an ID card</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Matches the printed portrait.</Text>

          <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <CameraStage
      facing={mode === 'selfie' ? 'front' : 'back'}
      title={mode === 'selfie' ? 'Verification selfie' : 'Scan ID card'}
      subtitle={
        mode === 'selfie'
          ? 'Look straight ahead. Three frames are checked.'
          : 'Fill the frame with the photo page of the card.'
      }
      guide={mode === 'selfie' ? 'oval' : 'card'}
      shots={SHOTS[mode]}
      busyLabel={hint ?? 'Reading the face on this device…'}
      onPhotos={handlePhotos}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  hint: {
    ...typography.caption,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  secondButton: {
    marginTop: spacing.sm,
  },
  cancel: {
    marginTop: spacing.xl,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
