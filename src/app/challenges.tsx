import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChallengeCard } from '@/components/challenge-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useHabits } from '@/hooks/use-habits';
import { useTheme } from '@/hooks/use-theme';
import { todayKey } from '@/types/habit';

const AVAILABLE_CHALLENGES = [
  {
    title: '7-Day Streak',
    description: 'Complete all your habits every day for a full week.',
    durationDays: 7,
    type: 'ongoing' as const,
  },
  {
    title: 'Perfect Week',
    description: 'Hit every single habit target for 5 straight days.',
    durationDays: 5,
    type: 'ongoing' as const,
  },
  {
    title: '14-Day Warrior',
    description: 'Two full weeks of consistency. You got this.',
    durationDays: 14,
    type: 'ongoing' as const,
  },
];

export default function ChallengesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { habits, challenges, startChallenge } = useHabits();

  const activeChallenges = challenges.filter((c) => !c.completedDate);
  const completedChallenges = challenges.filter((c) => c.completedDate);

  // Determine which preset challenges haven't been started
  const activeOrCompletedTitles = new Set(challenges.map((c) => c.title));
  const hasActiveOngoing = activeChallenges.some((c) => c.type === 'ongoing');

  const handleStart = useCallback(
    (preset: (typeof AVAILABLE_CHALLENGES)[number]) => {
      startChallenge({
        title: preset.title,
        description: preset.description,
        durationDays: preset.durationDays,
        type: preset.type,
        habitIds: habits.map((h) => h.id),
        startDate: todayKey(),
      });
    },
    [habits, startChallenge]
  );

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.three,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
        },
      ]}
    >
      <View style={styles.inner}>
        <ThemedText type="title">Challenges</ThemedText>

        {/* Active challenges */}
        {activeChallenges.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.section}>
              Active
            </ThemedText>
            <View style={styles.list}>
              {activeChallenges.map((c) => (
                <ChallengeCard key={c.id} challenge={c} habits={habits} />
              ))}
            </View>
          </>
        )}

        {/* No active challenges message */}
        {activeChallenges.length === 0 && habits.length > 0 && (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <ThemedText style={styles.emptyEmoji}>🏆</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              No active challenges. Start one below!
            </ThemedText>
          </ThemedView>
        )}

        {habits.length === 0 && (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              Add some habits first, then come back to start a challenge.
            </ThemedText>
          </ThemedView>
        )}

        {/* Available challenges */}
        {habits.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.section}>
              Available
            </ThemedText>
            <View style={styles.list}>
              {AVAILABLE_CHALLENGES.map((preset) => {
                const alreadyActive = activeOrCompletedTitles.has(preset.title);
                return (
                  <ChallengeCard
                    key={preset.title}
                    challenge={{
                      id: preset.title,
                      ...preset,
                      habitIds: habits.map((h) => h.id),
                      startDate: todayKey(),
                    }}
                    habits={habits}
                    showStartButton={!alreadyActive && !hasActiveOngoing}
                    onStart={() => handleStart(preset)}
                  />
                );
              })}
            </View>
          </>
        )}

        {/* Completed challenges */}
        {completedChallenges.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.section}>
              Completed
            </ThemedText>
            <View style={styles.list}>
              {completedChallenges.map((c) => (
                <ChallengeCard key={c.id} challenge={c} habits={habits} />
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.four },
  inner: { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' },
  section: { marginTop: Spacing.five },
  list: { gap: Spacing.two, marginTop: Spacing.two },
  emptyCard: {
    padding: Spacing.five,
    borderRadius: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, textAlign: 'center' },
});
