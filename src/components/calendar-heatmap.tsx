import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  completions: Record<string, number>;
  targetCount: number;
  days?: number;
};

export function CalendarHeatmap({
  completions,
  targetCount,
  days = 30,
}: Props) {
  const theme = useTheme();

  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  }

  return (
    <View style={styles.grid}>
      {dates.map((date) => {
        const count = completions[date] ?? 0;
        const ratio = targetCount > 0 ? Math.min(count / targetCount, 1) : 0;
        let bg: string;
        if (ratio === 0) {
          bg = theme.backgroundSelected;
        } else if (ratio < 0.5) {
          bg = '#81C784';
        } else if (ratio < 1) {
          bg = '#66BB6A';
        } else {
          bg = '#4CAF50';
        }
        return (
          <View
            key={date}
            style={[styles.cell, { backgroundColor: bg }]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  cell: {
    width: 16,
    height: 16,
    borderRadius: Spacing.half,
  },
});
