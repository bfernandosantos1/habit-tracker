import { getSimulatedDate } from '@/dev/dev-date';

export type HabitType = 'daily' | 'volume';

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  type: HabitType;
  targetCount: number; // 1 for daily, N for volume
  completions: Record<string, number>; // "2026-05-24" -> count
  createdAt: string;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  habitIds: string[];
  durationDays: number;
  startDate: string;
  type: 'onboarding' | 'ongoing';
  completedDate?: string;
};

export type AppState = {
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
};

// --- Helpers ---

export function todayKey(): string {
  return getSimulatedDate() ?? new Date().toISOString().slice(0, 10);
}

export function getCompletionCount(habit: Habit, date: string): number {
  return habit.completions[date] ?? 0;
}

export function isHabitComplete(habit: Habit, date: string): boolean {
  return getCompletionCount(habit, date) >= habit.targetCount;
}

export function getStreak(habit: Habit): number {
  const dates = Object.entries(habit.completions)
    .filter(([, count]) => count >= habit.targetCount)
    .map(([date]) => date)
    .sort()
    .reverse();

  if (dates.length === 0) return 0;

  const today = todayKey();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T12:00:00');
    const curr = new Date(dates[i] + 'T12:00:00');
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.round(diff) === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function isChallengeComplete(
  challenge: Challenge,
  habits: Habit[]
): boolean {
  if (challenge.completedDate) return true;
  const start = new Date(challenge.startDate + 'T12:00:00');
  for (let d = 0; d < challenge.durationDays; d++) {
    const date = new Date(start.getTime() + d * 86400000)
      .toISOString()
      .slice(0, 10);
    for (const hid of challenge.habitIds) {
      const habit = habits.find((h) => h.id === hid);
      if (!habit || !isHabitComplete(habit, date)) return false;
    }
  }
  return true;
}

export function getChallengeDayProgress(
  challenge: Challenge,
  habits: Habit[]
): boolean[] {
  const start = new Date(challenge.startDate + 'T12:00:00');
  const progress: boolean[] = [];
  for (let d = 0; d < challenge.durationDays; d++) {
    const date = new Date(start.getTime() + d * 86400000)
      .toISOString()
      .slice(0, 10);
    const allDone = challenge.habitIds.every((hid) => {
      const habit = habits.find((h) => h.id === hid);
      return habit && isHabitComplete(habit, date);
    });
    progress.push(allDone);
  }
  return progress;
}

// --- Migration from v1 ---

type V1Habit = {
  id: string;
  name: string;
  emoji: string;
  completedDates: string[];
};

export function migrateV1Habits(old: V1Habit[]): Habit[] {
  return old.map((h) => {
    const completions: Record<string, number> = {};
    for (const date of h.completedDates) {
      completions[date] = 1;
    }
    return {
      id: h.id,
      name: h.name,
      emoji: h.emoji,
      type: 'daily' as const,
      targetCount: 1,
      completions,
      createdAt: h.completedDates.sort()[0] ?? todayKey(),
    };
  });
}
