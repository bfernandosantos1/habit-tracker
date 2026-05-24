import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCompletionCount, getStreak, Habit, isHabitComplete, todayKey } from '@/types/habit';

type Props = {
  habit: Habit;
  onToggle: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onLongPress: () => void;
  onPress?: () => void;
};

export function HabitCard({
  habit,
  onToggle,
  onIncrement,
  onDecrement,
  onLongPress,
  onPress,
}: Props) {
  const theme = useTheme();
  const today = todayKey();
  const done = isHabitComplete(habit, today);
  const count = getCompletionCount(habit, today);
  const streak = getStreak(habit);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (habit.type === 'daily') {
      scale.value = withSequence(
        withSpring(1.2, { damping: 4, stiffness: 300 }),
        withSpring(1, { damping: 8 })
      );
      onToggle();
    } else {
      if (count < habit.targetCount) {
        scale.value = withSequence(
          withSpring(1.15, { damping: 4, stiffness: 300 }),
          withSpring(1, { damping: 8 })
        );
        onIncrement();
      }
    }
  };

  return (
    <Pressable
      onPress={onPress ?? handlePress}
      onLongPress={onLongPress}
    >
      <ThemedView
        type="backgroundElement"
        style={[styles.card, done && styles.cardDone]}
      >
        <View style={styles.left}>
          <ThemedText style={styles.emoji}>{habit.emoji}</ThemedText>
          <View style={styles.info}>
            <ThemedText
              style={[styles.name, done && styles.nameDone]}
            >
              {habit.name}
            </ThemedText>
            <View style={styles.metaRow}>
              {streak > 0 && (
                <ThemedText themeColor="textSecondary" style={styles.streak}>
                  🔥 {streak}d
                </ThemedText>
              )}
              {habit.type === 'volume' && (
                <ThemedText themeColor="textSecondary" style={styles.streak}>
                  {count}/{habit.targetCount}
                </ThemedText>
              )}
            </View>
          </View>
        </View>

        <Animated.View style={animatedStyle}>
          {habit.type === 'daily' ? (
            <Pressable onPress={handlePress}>
              <View
                style={[
                  styles.checkbox,
                  { borderColor: done ? '#4CAF50' : theme.textSecondary },
                  done && styles.checkboxDone,
                ]}
              >
                {done && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </View>
            </Pressable>
          ) : (
            <View style={styles.volumeControls}>
              <Pressable
                onPress={() => {
                  if (count > 0) onDecrement();
                }}
                style={[
                  styles.volButton,
                  { backgroundColor: theme.backgroundSelected },
                ]}
              >
                <ThemedText style={styles.volButtonText}>−</ThemedText>
              </Pressable>
              <View style={styles.ringContainer}>
                <View
                  style={[
                    styles.ringOuter,
                    { borderColor: done ? '#4CAF50' : theme.backgroundSelected },
                  ]}
                >
                  <ThemedText style={[styles.ringText, done && { color: '#4CAF50' }]}>
                    {count}
                  </ThemedText>
                </View>
              </View>
              <Pressable
                onPress={handlePress}
                style={[
                  styles.volButton,
                  {
                    backgroundColor:
                      count < habit.targetCount ? '#4CAF50' : theme.backgroundSelected,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.volButtonText,
                    count < habit.targetCount && { color: '#fff' },
                  ]}
                >
                  +
                </ThemedText>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  cardDone: { opacity: 0.7 },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 },
  emoji: { fontSize: 28 },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '500' },
  nameDone: { textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', gap: Spacing.two, marginTop: 2 },
  streak: { fontSize: 13 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  volButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volButtonText: { fontSize: 18, fontWeight: '600' },
  ringContainer: { alignItems: 'center' },
  ringOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringText: { fontSize: 14, fontWeight: '700' },
});
