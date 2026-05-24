import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type BarData = {
  label: string;
  value: number;
};

type Props = {
  data: BarData[];
  height?: number;
  barColor?: string;
};

function Bar({
  value,
  maxValue,
  height,
  color,
  index,
}: {
  value: number;
  maxValue: number;
  height: number;
  color: string;
  index: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * 60,
      withTiming(maxValue > 0 ? value / maxValue : 0, { duration: 400 })
    );
  }, [value, maxValue, index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: Math.max(4, progress.value * height),
    backgroundColor: color,
  }));

  return <Animated.View style={[styles.bar, animatedStyle]} />;
}

export function BarChart({ data, height = 120, barColor = '#4CAF50' }: Props) {
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  return (
    <View style={styles.container}>
      <View style={[styles.barsRow, { height }]}>
        {data.map((item, i) => (
          <View key={item.label} style={styles.barColumn}>
            <Bar
              value={item.value}
              maxValue={maxValue}
              height={height}
              color={barColor}
              index={i}
            />
          </View>
        ))}
      </View>
      <View style={styles.labelsRow}>
        {data.map((item) => (
          <View key={item.label} style={styles.barColumn}>
            <ThemedText themeColor="textSecondary" style={styles.label}>
              {item.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  barColumn: { flex: 1, alignItems: 'center' },
  bar: {
    width: '70%',
    borderRadius: 4,
    minHeight: 4,
  },
  labelsRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  label: { fontSize: 11, textAlign: 'center' },
});
