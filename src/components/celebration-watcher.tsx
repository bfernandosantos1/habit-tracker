import { useEffect } from 'react';

import { CelebrationOverlay } from '@/components/celebration-overlay';
import { useHabits } from '@/hooks/use-habits';
import { useCelebrations } from '@/hooks/use-celebrations';

export function CelebrationWatcher() {
  const { celebrationLevel, clearCelebration } = useHabits();
  const { celebrate } = useCelebrations();

  useEffect(() => {
    if (celebrationLevel) {
      celebrate(celebrationLevel);
    }
  }, [celebrationLevel, celebrate]);

  return (
    <CelebrationOverlay level={celebrationLevel} onFinish={clearCelebration} />
  );
}
