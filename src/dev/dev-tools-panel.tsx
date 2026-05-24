import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getSimulatedDate, onDateChange, setSimulatedDate } from '@/dev/dev-date';

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`;
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function realToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DevToolsPanel() {
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    getSimulatedDate() ?? realToday()
  );

  // Subscribe to external date changes
  useEffect(() => {
    return onDateChange(() => {
      setCurrentDate(getSimulatedDate() ?? realToday());
    });
  }, []);

  const isSimulated = getSimulatedDate() !== null;
  const daysOffset = Math.round(
    (new Date(currentDate + 'T12:00:00').getTime() -
      new Date(realToday() + 'T12:00:00').getTime()) /
      86400000
  );

  const jumpTo = useCallback((date: string) => {
    setSimulatedDate(date);
    setCurrentDate(date);
  }, []);

  const handleReset = useCallback(() => {
    setSimulatedDate(null);
    setCurrentDate(realToday());
  }, []);

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Clear all data',
      'This will reset habits, challenges, and onboarding. The app will reload.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove([
              'habits',
              'habits_v2',
              'challenges',
              'app_state',
            ]);
            setSimulatedDate(null);
            // Force reload on web
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          },
        },
      ]
    );
  }, []);

  if (!open) {
    return (
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.fab, isSimulated && styles.fabActive]}
      >
        <ThemedText style={styles.fabText}>
          {isSimulated ? `🕐 ${daysOffset > 0 ? '+' : ''}${daysOffset}d` : '🛠'}
        </ThemedText>
      </Pressable>
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <ThemedText style={styles.panelTitle}>Dev Tools</ThemedText>
        <Pressable onPress={() => setOpen(false)}>
          <ThemedText style={styles.closeText}>✕</ThemedText>
        </Pressable>
      </View>

      {/* Time travel */}
      <ThemedText style={styles.sectionLabel}>Time Travel</ThemedText>
      <View style={styles.dateRow}>
        <Pressable
          onPress={() => jumpTo(shiftDate(currentDate, -1))}
          style={styles.dateButton}
        >
          <ThemedText style={styles.dateButtonText}>◀ Day</ThemedText>
        </Pressable>
        <View style={styles.dateDisplay}>
          <ThemedText style={styles.dateText}>
            {formatDisplay(currentDate)}
          </ThemedText>
          {isSimulated && (
            <ThemedText style={styles.offsetText}>
              {daysOffset > 0 ? '+' : ''}
              {daysOffset}d from today
            </ThemedText>
          )}
        </View>
        <Pressable
          onPress={() => jumpTo(shiftDate(currentDate, 1))}
          style={styles.dateButton}
        >
          <ThemedText style={styles.dateButtonText}>Day ▶</ThemedText>
        </Pressable>
      </View>

      {/* Quick jumps */}
      <View style={styles.quickRow}>
        <Pressable
          onPress={() => jumpTo(shiftDate(currentDate, -7))}
          style={styles.quickButton}
        >
          <ThemedText style={styles.quickText}>-7d</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => jumpTo(shiftDate(currentDate, -3))}
          style={styles.quickButton}
        >
          <ThemedText style={styles.quickText}>-3d</ThemedText>
        </Pressable>
        <Pressable onPress={handleReset} style={[styles.quickButton, styles.todayButton]}>
          <ThemedText style={[styles.quickText, { color: '#fff' }]}>Today</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => jumpTo(shiftDate(currentDate, 3))}
          style={styles.quickButton}
        >
          <ThemedText style={styles.quickText}>+3d</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => jumpTo(shiftDate(currentDate, 7))}
          style={styles.quickButton}
        >
          <ThemedText style={styles.quickText}>+7d</ThemedText>
        </Pressable>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <Pressable onPress={handleClearData} style={styles.dangerButton}>
          <ThemedText style={styles.dangerText}>Reset All Data</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  fabActive: {
    backgroundColor: '#FF9800',
  },
  fabText: { fontSize: 16, color: '#fff' },
  panel: {
    position: 'absolute',
    bottom: 80,
    right: 12,
    left: 12,
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
    zIndex: 9999,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  closeText: { color: '#aaa', fontSize: 20 },
  sectionLabel: {
    color: '#999',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dateButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  dateDisplay: { alignItems: 'center' },
  dateText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  offsetText: { color: '#FF9800', fontSize: 12, marginTop: 2 },
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    justifyContent: 'center',
  },
  quickButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todayButton: { backgroundColor: '#4CAF50' },
  quickText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  dangerButton: {
    backgroundColor: 'rgba(255,59,48,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dangerText: { color: '#FF3B30', fontSize: 13, fontWeight: '600' },
});
