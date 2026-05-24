import { useContext } from 'react';

import { HabitsContext, HabitsContextValue } from '@/context/habits-context';

export function useHabits(): HabitsContextValue {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
}
