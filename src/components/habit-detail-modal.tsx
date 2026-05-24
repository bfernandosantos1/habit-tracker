import { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarHeatmap } from '@/components/calendar-heatmap';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useHabits } from '@/hooks/use-habits';
import { useTheme } from '@/hooks/use-theme';
import { getStreak, Habit, isHabitComplete } from '@/types/habit';

type Props = {
  habit: Habit | null;
  visible: boolean;
  onClose: () => void;
};

export function HabitDetailModal({ habit, visible, onClose }: Props) {
  const theme = useTheme();
  const { updateHabit, deleteHabit } = useHabits();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState('');

  const handleStartEdit = useCallback(() => {
    if (habit) {
      setName(habit.name);
      setEditingName(true);
    }
  }, [habit]);

  const handleSaveName = useCallback(() => {
    if (habit && name.trim()) {
      updateHabit(habit.id, { name: name.trim() });
    }
    setEditingName(false);
  }, [habit, name, updateHabit]);

  const handleDelete = useCallback(() => {
    if (!habit) return;
    Alert.alert('Delete habit', `Remove "${habit.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteHabit(habit.id);
          onClose();
        },
      },
    ]);
  }, [habit, deleteHabit, onClose]);

  if (!habit) return null;

  const streak = getStreak(habit);
  const totalDays = Object.values(habit.completions).filter(
    (c) => c >= habit.targetCount
  ).length;

  // Last 60 days completion
  const last60: string[] = [];
  for (let i = 59; i >= 0; i--) {
    last60.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  }
  const possible60 = 60;
  const actual60 = last60.filter((d) => isHabitComplete(habit, d)).length;
  const consistency = Math.round((actual60 / possible60) * 100);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safe}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeText}>Done</ThemedText>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Hero */}
            <View style={styles.hero}>
              <ThemedText style={styles.emoji}>{habit.emoji}</ThemedText>
              {editingName ? (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onBlur={handleSaveName}
                  onSubmitEditing={handleSaveName}
                  autoFocus
                  style={[styles.nameInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                />
              ) : (
                <Pressable onPress={handleStartEdit}>
                  <ThemedText type="subtitle">{habit.name}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.editHint}>
                    Tap to edit
                  </ThemedText>
                </Pressable>
              )}
              <ThemedText themeColor="textSecondary" style={styles.typeLabel}>
                {habit.type === 'daily' ? 'Daily habit' : `Volume: ${habit.targetCount}× per day`}
              </ThemedText>
            </View>

            {/* Stats cards */}
            <View style={styles.statsRow}>
              <ThemedView type="backgroundElement" style={styles.statCard}>
                <ThemedText style={styles.statNumber}>🔥 {streak}</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.statLabel}>
                  Current streak
                </ThemedText>
              </ThemedView>
              <ThemedView type="backgroundElement" style={styles.statCard}>
                <ThemedText style={styles.statNumber}>{totalDays}</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.statLabel}>
                  Total days
                </ThemedText>
              </ThemedView>
              <ThemedView type="backgroundElement" style={styles.statCard}>
                <ThemedText style={styles.statNumber}>{consistency}%</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.statLabel}>
                  60d consistency
                </ThemedText>
              </ThemedView>
            </View>

            {/* Heatmap */}
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Last 60 days
            </ThemedText>
            <ThemedView type="backgroundElement" style={styles.heatmapCard}>
              <CalendarHeatmap
                completions={habit.completions}
                targetCount={habit.targetCount}
                days={60}
              />
            </ThemedView>

            {/* Delete */}
            <Pressable onPress={handleDelete} style={styles.deleteButton}>
              <ThemedText style={styles.deleteText}>Delete Habit</ThemedText>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  closeButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  closeText: { fontSize: 17, fontWeight: '600', color: '#4CAF50' },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.four,
  },
  emoji: { fontSize: 56 },
  editHint: { fontSize: 12, textAlign: 'center', marginTop: 2 },
  nameInput: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    borderBottomWidth: 2,
    paddingBottom: Spacing.one,
    minWidth: 200,
  },
  typeLabel: { fontSize: 14, marginTop: Spacing.one },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  statNumber: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: Spacing.one, textAlign: 'center' },
  sectionTitle: { marginTop: Spacing.five, marginBottom: Spacing.two },
  heatmapCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  deleteButton: {
    marginTop: Spacing.six,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  deleteText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
});
