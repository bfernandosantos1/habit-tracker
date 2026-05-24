import { useEffect, useState } from 'react';

import { getSimulatedDate, onDateChange } from '@/dev/dev-date';
import { todayKey } from '@/types/habit';

/**
 * Returns the current "today" key (real or simulated)
 * and re-renders the component when the dev date changes.
 */
export function useDevDate(): string {
  const [date, setDate] = useState(todayKey());

  useEffect(() => {
    return onDateChange(() => {
      setDate(getSimulatedDate() ?? new Date().toISOString().slice(0, 10));
    });
  }, []);

  return date;
}
