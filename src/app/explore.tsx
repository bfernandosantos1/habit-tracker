import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarChart } from '@/components/bar-chart';
import { CalendarHeatmap } from '@/components/calendar-heatmap';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useHabits } from '@/hooks/use-habits';
import { useTheme } from '@/hooks/use-theme';
import { getStreak, isHabitComplete, todayKey } from '@/types/habit';

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  }
  return days;
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StatsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { habits } = useHabits();

  const today = todayKey();
  const last7 = getLast7Days();

  // Weekly completion rate per day
  const weeklyData = last7.map((date) => {
    const d = new Date(date + 'T12:00:00');
    const completed = habits.filter((h) => isHabitComplete(h, date)).length;
    const rate = habits.length > 0 ? completed / habits.length : 0;
    return {
      label: SHORT_DAYS[d.getDay()],
      value: Math.round(rate * 100),
    };
  });

  // Overall stats
  const totalCompletions = habits.reduce((sum, h) => {
    return sum + Object.values(h.completions).filter((c) => c >= h.targetCount).length;
  }, 0);
  const bestStreak = Math.max(0, ...habits.map((h) => getStreak(h)));

  // 30-day consistency
  const last30: string[] = [];
  for (let i = 29; i >= 0; i--) {
    last30.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  }
  const possibleCompletions = habits.length * 30;
  const actualCompletions = last30.reduce((sum, date) => {
    return sum + habits.filter((h) => isHabitComplete(h, date)).length;
  }, 0);
  const consistency =
    possibleCompletions > 0
      ? Math.round((actualCompletions / possibleCompletions) * 100)
      : 0;

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
        <ThemedText type="title">Stats</ThemedText>

        {/* Summary cards */}
        <View style={styles.cardRow}>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText style={styles.cardNumber}>{habits.length}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.cardLabel}>
              Habits
            </ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText style={styles.cardNumber}>{totalCompletions}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.cardLabel}>
              Check-ins
            </ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText style={styles.cardNumber}>🔥 {bestStreak}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.cardLabel}>
              Best streak
            </ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText style={styles.cardNumber}>{consistency}%</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.cardLabel}>
              30d consistency
            </ThemedText>
          </ThemedView>
        </View>

        {/* Weekly bar chart */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          This week
        </ThemedText>
        <ThemedView type="backgroundElement" style={styles.chartCard}>
          {habits.length > 0 ? (
            <BarChart data={weeklyData} height={140} barColor="#4CAF50" />
          ) : (
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              Add habits to see weekly stats
            </ThemedText>
          )}
        </ThemedView>

        {/* Per-habit heatmaps */}
        {habits.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Last 30 days
            </ThemedText>
            {habits.map((habit) => (
              <ThemedView
                key={habit.id}
                type="backgroundElement"
                style={styles.heatmapCard}
              >
                <View style={styles.heatmapHeader}>
                  <ThemedText style={styles.heatmapEmoji}>
                    {habit.emoji}
                  </ThemedText>
                  <ThemedText style={styles.heatmapName}>
                    {habit.name}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.heatmapStreak}>
                    🔥 {getStreak(habit)}d
                  </ThemedText>
                </View>
                <CalendarHeatmap
                  completions={habit.completions}
                  targetCount={habit.targetCount}
                  days={30}
                />
              </ThemedView>
            ))}
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
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  card: {
    flex: 1,
    minWidth: '40%',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  cardNumber: { fontSize: 22, fontWeight: '700' },
  cardLabel: { fontSize: 11, marginTop: Spacing.one, textAlign: 'center' },
  sectionTitle: { marginTop: Spacing.five },
  chartCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  emptyText: { textAlign: 'center', paddingVertical: Spacing.four },
  heatmapCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  heatmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  heatmapEmoji: { fontSize: 22 },
  heatmapName: { fontSize: 16, fontWeight: '600', flex: 1 },
  heatmapStreak: { fontSize: 13 },
});
