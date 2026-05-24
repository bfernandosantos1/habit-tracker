import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useHabits } from '@/hooks/use-habits';
import { useNotifications } from '@/hooks/use-notifications';
import { useTheme } from '@/hooks/use-theme';

const PRESET_HABITS = [
  { name: 'Exercise', emoji: '💪', type: 'daily' as const, targetCount: 1 },
  { name: 'Read', emoji: '📚', type: 'daily' as const, targetCount: 1 },
  { name: 'Meditate', emoji: '🧘', type: 'daily' as const, targetCount: 1 },
  { name: 'Drink water', emoji: '💧', type: 'volume' as const, targetCount: 8 },
  { name: 'Journal', emoji: '✍️', type: 'daily' as const, targetCount: 1 },
  { name: 'Walk 10k steps', emoji: '🏃', type: 'daily' as const, targetCount: 1 },
  { name: 'Sleep 8 hours', emoji: '😴', type: 'daily' as const, targetCount: 1 },
  { name: 'Eat healthy', emoji: '🥗', type: 'daily' as const, targetCount: 1 },
  { name: 'Practice guitar', emoji: '🎸', type: 'daily' as const, targetCount: 1 },
  { name: 'Take vitamins', emoji: '💊', type: 'daily' as const, targetCount: 1 },
  { name: 'No social media', emoji: '📵', type: 'daily' as const, targetCount: 1 },
  { name: 'Stretch', emoji: '🤸', type: 'daily' as const, targetCount: 1 },
];

export function Onboarding() {
  const theme = useTheme();
  const { completeOnboarding, setNotificationsEnabled } = useHabits();
  const { requestPermissions, scheduleReminders } = useNotifications();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleSelection = useCallback((index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else if (next.size < 5) {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleFinish = useCallback(async () => {
    const habits = Array.from(selected).map((i) => PRESET_HABITS[i]);
    completeOnboarding(habits);
  }, [selected, completeOnboarding]);

  const handleEnableNotifications = useCallback(async () => {
    const granted = await requestPermissions();
    if (granted) {
      await scheduleReminders();
      setNotificationsEnabled(true);
    }
    handleFinish();
  }, [requestPermissions, scheduleReminders, setNotificationsEnabled, handleFinish]);

  if (step === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.hero}>
            <ThemedText style={styles.bigEmoji}>🎯</ThemedText>
            <ThemedText type="title" style={styles.centerText}>
              Build better habits
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Track your daily habits, build streaks, and complete challenges to
              stay motivated.
            </ThemedText>
          </View>
          <Pressable
            onPress={() => setStep(1)}
            style={styles.primaryButton}
          >
            <ThemedText style={styles.primaryButtonText}>
              Get Started
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (step === 1) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.stepHeader}>
            <ThemedText type="subtitle">Pick your habits</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Choose up to 5 habits to start with. You can always add more later.
            </ThemedText>
          </View>

          <ScrollView
            contentContainerStyle={styles.habitGrid}
            style={styles.scrollArea}
          >
            {PRESET_HABITS.map((habit, i) => {
              const isSelected = selected.has(i);
              return (
                <Pressable key={i} onPress={() => toggleSelection(i)}>
                  <ThemedView
                    type={isSelected ? 'backgroundSelected' : 'backgroundElement'}
                    style={[
                      styles.habitOption,
                      isSelected && styles.habitOptionSelected,
                    ]}
                  >
                    <ThemedText style={styles.habitEmoji}>
                      {habit.emoji}
                    </ThemedText>
                    <ThemedText style={styles.habitName}>
                      {habit.name}
                    </ThemedText>
                    {habit.type === 'volume' && (
                      <ThemedText themeColor="textSecondary" style={styles.habitMeta}>
                        ×{habit.targetCount}/day
                      </ThemedText>
                    )}
                  </ThemedView>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.bottomActions}>
            <ThemedText themeColor="textSecondary" style={styles.selectionCount}>
              {selected.size}/5 selected
            </ThemedText>
            <Pressable
              onPress={() => setStep(2)}
              style={[
                styles.primaryButton,
                selected.size < 1 && styles.buttonDisabled,
              ]}
              disabled={selected.size < 1}
            >
              <ThemedText style={styles.primaryButtonText}>Continue</ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Step 2: Challenge intro
  if (step === 2) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.hero}>
            <ThemedText style={styles.bigEmoji}>🔥</ThemedText>
            <ThemedText type="subtitle" style={styles.centerText}>
              3-Day Kickoff Challenge
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Complete all {selected.size} habits for 3 days straight to unlock
              your first achievement. You'll get a celebration when you finish!
            </ThemedText>

            <View style={styles.challengePreview}>
              {[1, 2, 3].map((day) => (
                <View key={day} style={styles.challengeDay}>
                  <View
                    style={[
                      styles.challengeDot,
                      { backgroundColor: theme.backgroundSelected },
                    ]}
                  >
                    <ThemedText themeColor="textSecondary" style={styles.challengeDotText}>
                      {day}
                    </ThemedText>
                  </View>
                  <ThemedText themeColor="textSecondary" style={styles.challengeDayLabel}>
                    Day {day}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          <Pressable onPress={() => setStep(3)} style={styles.primaryButton}>
            <ThemedText style={styles.primaryButtonText}>
              Next
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Step 3: Enable notifications
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <ThemedText style={styles.bigEmoji}>🔔</ThemedText>
          <ThemedText type="subtitle" style={styles.centerText}>
            Stay on track
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Get gentle reminders in the morning and evening so you never miss a
            habit.
          </ThemedText>
        </View>

        <View style={styles.bottomActions}>
          <Pressable onPress={handleEnableNotifications} style={styles.primaryButton}>
            <ThemedText style={styles.primaryButtonText}>
              Enable Notifications
            </ThemedText>
          </Pressable>
          <Pressable onPress={handleFinish} style={styles.skipButton}>
            <ThemedText themeColor="textSecondary" style={styles.skipText}>
              Skip for now
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  bigEmoji: { fontSize: 64 },
  centerText: { textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  stepHeader: {
    paddingTop: Spacing.five,
    gap: Spacing.two,
    alignItems: 'center',
  },
  scrollArea: { flex: 1, marginTop: Spacing.three },
  habitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingBottom: Spacing.three,
    justifyContent: 'center',
  },
  habitOption: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  habitOptionSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  habitEmoji: { fontSize: 22 },
  habitName: { fontSize: 15, fontWeight: '500' },
  habitMeta: { fontSize: 12 },
  bottomActions: {
    gap: Spacing.two,
    alignItems: 'center',
    paddingTop: Spacing.three,
  },
  selectionCount: { fontSize: 14 },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonDisabled: { opacity: 0.4 },
  skipButton: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  skipText: { fontSize: 15 },
  challengePreview: {
    flexDirection: 'row',
    gap: Spacing.five,
    marginTop: Spacing.four,
  },
  challengeDay: { alignItems: 'center', gap: Spacing.one },
  challengeDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeDotText: { fontSize: 20, fontWeight: '700' },
  challengeDayLabel: { fontSize: 13 },
});
