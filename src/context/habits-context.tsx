import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AppState,
  Challenge,
  Habit,
  isChallengeComplete,
  migrateV1Habits,
  todayKey,
} from '@/types/habit';

const HABITS_KEY = 'habits_v2';
const CHALLENGES_KEY = 'challenges';
const APP_STATE_KEY = 'app_state';
const V1_HABITS_KEY = 'habits';

export type CelebrationLevel = 'single' | 'allDone' | 'challenge' | null;

export type HabitsContextValue = {
  habits: Habit[];
  challenges: Challenge[];
  appState: AppState;
  isLoading: boolean;
  celebrationLevel: CelebrationLevel;
  clearCelebration: () => void;

  addHabit: (habit: Omit<Habit, 'id' | 'completions' | 'createdAt'>) => void;
  deleteHabit: (id: string) => void;
  updateHabit: (id: string, updates: Partial<Pick<Habit, 'name' | 'emoji' | 'type' | 'targetCount'>>) => void;
  toggleHabit: (id: string) => void;
  incrementHabit: (id: string) => void;
  decrementHabit: (id: string) => void;

  startChallenge: (challenge: Omit<Challenge, 'id'>) => void;

  completeOnboarding: (habits: Omit<Habit, 'id' | 'completions' | 'createdAt'>[]) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
};

export const HabitsContext = createContext<HabitsContextValue | null>(null);

const DEFAULT_APP_STATE: AppState = {
  onboardingComplete: false,
  notificationsEnabled: false,
};

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [appState, setAppState] = useState<AppState>(DEFAULT_APP_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [celebrationLevel, setCelebrationLevel] = useState<CelebrationLevel>(null);

  // Load data on mount
  useEffect(() => {
    (async () => {
      try {
        const [habitsData, challengesData, appStateData, v1Data] =
          await Promise.all([
            AsyncStorage.getItem(HABITS_KEY),
            AsyncStorage.getItem(CHALLENGES_KEY),
            AsyncStorage.getItem(APP_STATE_KEY),
            AsyncStorage.getItem(V1_HABITS_KEY),
          ]);

        if (habitsData) {
          setHabits(JSON.parse(habitsData));
        } else if (v1Data) {
          // Migrate from v1
          const migrated = migrateV1Habits(JSON.parse(v1Data));
          setHabits(migrated);
          await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(migrated));
          // Mark onboarding complete since they had v1 data
          const migratedState: AppState = { onboardingComplete: true, notificationsEnabled: false };
          setAppState(migratedState);
          await AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(migratedState));
        }

        if (challengesData) setChallenges(JSON.parse(challengesData));
        if (appStateData) setAppState(JSON.parse(appStateData));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Persist helpers
  const saveHabits = useCallback((updated: Habit[]) => {
    setHabits(updated);
    AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
  }, []);

  const saveChallenges = useCallback((updated: Challenge[]) => {
    setChallenges(updated);
    AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(updated));
  }, []);

  const saveAppState = useCallback((updated: AppState) => {
    setAppState(updated);
    AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(updated));
  }, []);

  // Check if all habits are done for today
  const checkAllDone = useCallback(
    (updatedHabits: Habit[]) => {
      const today = todayKey();
      return (
        updatedHabits.length > 0 &&
        updatedHabits.every(
          (h) => (h.completions[today] ?? 0) >= h.targetCount
        )
      );
    },
    []
  );

  // Check if any active challenge just completed
  const checkChallengeCompletion = useCallback(
    (updatedHabits: Habit[], currentChallenges: Challenge[]) => {
      const active = currentChallenges.filter((c) => !c.completedDate);
      for (const challenge of active) {
        if (isChallengeComplete(challenge, updatedHabits)) {
          const updated = currentChallenges.map((c) =>
            c.id === challenge.id
              ? { ...c, completedDate: todayKey() }
              : c
          );
          saveChallenges(updated);
          return true;
        }
      }
      return false;
    },
    [saveChallenges]
  );

  // --- Habit CRUD ---

  const addHabit = useCallback(
    (habit: Omit<Habit, 'id' | 'completions' | 'createdAt'>) => {
      const newHabit: Habit = {
        ...habit,
        id: Date.now().toString(),
        completions: {},
        createdAt: todayKey(),
      };
      saveHabits([...habits, newHabit]);
    },
    [habits, saveHabits]
  );

  const deleteHabit = useCallback(
    (id: string) => {
      saveHabits(habits.filter((h) => h.id !== id));
    },
    [habits, saveHabits]
  );

  const updateHabit = useCallback(
    (id: string, updates: Partial<Pick<Habit, 'name' | 'emoji' | 'type' | 'targetCount'>>) => {
      saveHabits(habits.map((h) => (h.id === id ? { ...h, ...updates } : h)));
    },
    [habits, saveHabits]
  );

  const toggleHabit = useCallback(
    (id: string) => {
      const today = todayKey();
      const updated = habits.map((h) => {
        if (h.id !== id) return h;
        const current = h.completions[today] ?? 0;
        const done = current >= h.targetCount;
        return {
          ...h,
          completions: {
            ...h.completions,
            [today]: done ? 0 : h.targetCount,
          },
        };
      });
      saveHabits(updated);

      // Celebration logic
      if (checkChallengeCompletion(updated, challenges)) {
        setCelebrationLevel('challenge');
      } else if (checkAllDone(updated)) {
        setCelebrationLevel('allDone');
      } else {
        const habit = updated.find((h) => h.id === id);
        if (habit && (habit.completions[today] ?? 0) >= habit.targetCount) {
          setCelebrationLevel('single');
        }
      }
    },
    [habits, challenges, saveHabits, checkAllDone, checkChallengeCompletion]
  );

  const incrementHabit = useCallback(
    (id: string) => {
      const today = todayKey();
      const updated = habits.map((h) => {
        if (h.id !== id) return h;
        const current = h.completions[today] ?? 0;
        if (current >= h.targetCount) return h;
        return {
          ...h,
          completions: { ...h.completions, [today]: current + 1 },
        };
      });
      saveHabits(updated);

      const habit = updated.find((h) => h.id === id);
      if (habit && (habit.completions[today] ?? 0) >= habit.targetCount) {
        if (checkChallengeCompletion(updated, challenges)) {
          setCelebrationLevel('challenge');
        } else if (checkAllDone(updated)) {
          setCelebrationLevel('allDone');
        } else {
          setCelebrationLevel('single');
        }
      }
    },
    [habits, challenges, saveHabits, checkAllDone, checkChallengeCompletion]
  );

  const decrementHabit = useCallback(
    (id: string) => {
      const today = todayKey();
      const updated = habits.map((h) => {
        if (h.id !== id) return h;
        const current = h.completions[today] ?? 0;
        if (current <= 0) return h;
        return {
          ...h,
          completions: { ...h.completions, [today]: current - 1 },
        };
      });
      saveHabits(updated);
    },
    [habits, saveHabits]
  );

  // --- Challenges ---

  const startChallenge = useCallback(
    (challenge: Omit<Challenge, 'id'>) => {
      const newChallenge: Challenge = {
        ...challenge,
        id: Date.now().toString(),
      };
      saveChallenges([...challenges, newChallenge]);
    },
    [challenges, saveChallenges]
  );

  // --- Onboarding ---

  const completeOnboarding = useCallback(
    (newHabits: Omit<Habit, 'id' | 'completions' | 'createdAt'>[]) => {
      const created: Habit[] = newHabits.map((h, i) => ({
        ...h,
        id: (Date.now() + i).toString(),
        completions: {},
        createdAt: todayKey(),
      }));
      saveHabits(created);

      // Create 3-day challenge
      const challenge: Challenge = {
        id: (Date.now() + 100).toString(),
        title: '3-Day Kickoff',
        description: 'Complete all your habits for 3 days straight!',
        habitIds: created.map((h) => h.id),
        durationDays: 3,
        startDate: todayKey(),
        type: 'onboarding',
      };
      saveChallenges([challenge]);

      saveAppState({ ...appState, onboardingComplete: true });
    },
    [appState, saveHabits, saveChallenges, saveAppState]
  );

  const setNotificationsEnabled = useCallback(
    (enabled: boolean) => {
      saveAppState({ ...appState, notificationsEnabled: enabled });
    },
    [appState, saveAppState]
  );

  const clearCelebration = useCallback(() => {
    setCelebrationLevel(null);
  }, []);

  const value = useMemo<HabitsContextValue>(
    () => ({
      habits,
      challenges,
      appState,
      isLoading,
      celebrationLevel,
      clearCelebration,
      addHabit,
      deleteHabit,
      updateHabit,
      toggleHabit,
      incrementHabit,
      decrementHabit,
      startChallenge,
      completeOnboarding,
      setNotificationsEnabled,
    }),
    [
      habits,
      challenges,
      appState,
      isLoading,
      celebrationLevel,
      clearCelebration,
      addHabit,
      deleteHabit,
      updateHabit,
      toggleHabit,
      incrementHabit,
      decrementHabit,
      startChallenge,
      completeOnboarding,
      setNotificationsEnabled,
    ]
  );

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
}
