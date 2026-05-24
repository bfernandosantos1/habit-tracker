import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Challenge, getChallengeDayProgress, Habit } from '@/types/habit';

type Props = {
  challenge: Challenge;
  habits: Habit[];
  onStart?: () => void;
  showStartButton?: boolean;
};

export function ChallengeCard({ challenge, habits, onStart, showStartButton }: Props) {
  const theme = useTheme();
  const isCompleted = !!challenge.completedDate;
  const progress = getChallengeDayProgress(challenge, habits);
  const daysCompleted = progress.filter(Boolean).length;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.title}>{challenge.title}</ThemedText>
          {isCompleted && (
            <ThemedText style={styles.completedBadge}>✅</ThemedText>
          )}
        </View>
        <ThemedText themeColor="textSecondary" style={styles.description}>
          {challenge.description}
        </ThemedText>
      </View>

      {/* Day progress dots */}
      <View style={styles.progressRow}>
        {progress.map((done, i) => (
          <View key={i} style={styles.dayColumn}>
            <View
              style={[
                styles.dayDot,
                {
                  backgroundColor: done ? '#4CAF50' : theme.backgroundSelected,
                },
              ]}
            >
              {done && <ThemedText style={styles.dayCheck}>✓</ThemedText>}
            </View>
            <ThemedText themeColor="textSecondary" style={styles.dayLabel}>
              Day {i + 1}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Progress summary */}
      <View style={styles.footer}>
        <ThemedText themeColor="textSecondary" style={styles.footerText}>
          {isCompleted
            ? 'Completed!'
            : `${daysCompleted}/${challenge.durationDays} days`}
        </ThemedText>
        {showStartButton && onStart && (
          <Pressable onPress={onStart} style={styles.startButton}>
            <ThemedText style={styles.startButtonText}>Start</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  header: { gap: Spacing.one },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: { fontSize: 18, fontWeight: '700' },
  completedBadge: { fontSize: 16 },
  description: { fontSize: 14 },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  dayColumn: { alignItems: 'center', gap: Spacing.one },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCheck: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dayLabel: { fontSize: 11 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: { fontSize: 14, fontWeight: '500' },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  startButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
