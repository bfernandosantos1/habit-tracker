import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HabitCard } from '@/components/habit-card';
import { HabitDetailModal } from '@/components/habit-detail-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useDevDate } from '@/dev/use-dev-date';
import { useHabits } from '@/hooks/use-habits';
import { useTheme } from '@/hooks/use-theme';
import { Habit, isHabitComplete, HabitType } from '@/types/habit';

const EMOJIS = ['💪', '📚', '🧘', '💧', '🏃', '🎸', '✍️', '😴', '🥗', '💊'];

export default function HomeScreen() {
  const theme = useTheme();
  const {
    habits,
    addHabit,
    deleteHabit,
    toggleHabit,
    incrementHabit,
    decrementHabit,
  } = useHabits();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [habitType, setHabitType] = useState<HabitType>('daily');
  const [targetCount, setTargetCount] = useState('3');
  const [detailHabit, setDetailHabit] = useState<Habit | null>(null);
  const today = useDevDate();

  const handleAdd = useCallback(() => {
    const name = newName.trim();
    if (!name) return;
    addHabit({
      name,
      emoji: selectedEmoji,
      type: habitType,
      targetCount: habitType === 'daily' ? 1 : Math.max(1, parseInt(targetCount) || 1),
    });
    setNewName('');
    setSelectedEmoji(EMOJIS[0]);
    setHabitType('daily');
    setTargetCount('3');
    setShowAdd(false);
  }, [newName, selectedEmoji, habitType, targetCount, addHabit]);

  const handleDelete = useCallback(
    (id: string, name: string) => {
      Alert.alert('Delete habit', `Remove "${name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(id) },
      ]);
    },
    [deleteHabit]
  );

  const completedCount = habits.filter((h) => isHabitComplete(h, today)).length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title">Today</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              {completedCount}/{habits.length} completed
            </ThemedText>
          </View>
          <Pressable
            onPress={() => setShowAdd(!showAdd)}
            style={[
              styles.addButton,
              { backgroundColor: showAdd ? theme.backgroundSelected : theme.backgroundElement },
            ]}
          >
            <ThemedText style={styles.addButtonText}>
              {showAdd ? '✕' : '+'}
            </ThemedText>
          </Pressable>
        </View>

        {/* Progress bar */}
        <View
          style={[styles.progressTrack, { backgroundColor: theme.backgroundElement }]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: '#4CAF50',
                width: habits.length > 0
                  ? `${(completedCount / habits.length) * 100}%`
                  : '0%',
              },
            ]}
          />
        </View>

        {/* Add form */}
        {showAdd && (
          <ThemedView type="backgroundElement" style={styles.addForm}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Habit name..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              onSubmitEditing={handleAdd}
              autoFocus
            />

            {/* Habit type toggle */}
            <View style={styles.typeRow}>
              <Pressable
                onPress={() => setHabitType('daily')}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      habitType === 'daily' ? '#4CAF50' : theme.backgroundSelected,
                  },
                ]}
              >
                <ThemedText
                  style={[styles.typeText, habitType === 'daily' && { color: '#fff' }]}
                >
                  Daily ✓
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setHabitType('volume')}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      habitType === 'volume' ? '#4CAF50' : theme.backgroundSelected,
                  },
                ]}
              >
                <ThemedText
                  style={[styles.typeText, habitType === 'volume' && { color: '#fff' }]}
                >
                  Volume ×N
                </ThemedText>
              </Pressable>
              {habitType === 'volume' && (
                <TextInput
                  value={targetCount}
                  onChangeText={setTargetCount}
                  keyboardType="number-pad"
                  placeholder="×"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.targetInput,
                    { color: theme.text, borderColor: theme.backgroundSelected },
                  ]}
                />
              )}
            </View>

            {/* Emoji selector */}
            <View style={styles.emojiRow}>
              {EMOJIS.map((e) => (
                <Pressable
                  key={e}
                  onPress={() => setSelectedEmoji(e)}
                  style={[
                    styles.emojiOption,
                    selectedEmoji === e && { backgroundColor: theme.backgroundSelected },
                  ]}
                >
                  <ThemedText style={styles.emojiText}>{e}</ThemedText>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleAdd}
              style={[styles.saveButton, !newName.trim() && styles.saveButtonDisabled]}
            >
              <ThemedText style={styles.saveButtonText}>Add Habit</ThemedText>
            </Pressable>
          </ThemedView>
        )}

        {/* Habits list */}
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              onToggle={() => toggleHabit(item.id)}
              onIncrement={() => incrementHabit(item.id)}
              onDecrement={() => decrementHabit(item.id)}
              onLongPress={() => setDetailHabit(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <ThemedText themeColor="textSecondary">
                No habits yet. Tap + to add one!
              </ThemedText>
            </View>
          }
        />

        <HabitDetailModal
          habit={detailHabit}
          visible={!!detailHabit}
          onClose={() => setDetailHabit(null)}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  subtitle: { marginTop: Spacing.half },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { fontSize: 24, fontWeight: '300' },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginBottom: Spacing.three,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  addForm: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  typeButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  typeText: { fontSize: 14, fontWeight: '600' },
  targetInput: {
    width: 50,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    textAlign: 'center',
  },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  emojiOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: { fontSize: 20 },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  list: { gap: Spacing.two, paddingBottom: Spacing.four },
  empty: { alignItems: 'center', paddingVertical: Spacing.six },
});
