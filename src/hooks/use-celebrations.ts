import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

import { CelebrationLevel } from '@/context/habits-context';

const chimeSource = require('@/assets/sounds/chime.wav');

export function useCelebrations() {
  const soundRef = useRef<Audio.Sound | null>(null);

  const celebrate = useCallback(async (level: CelebrationLevel) => {
    if (!level || Platform.OS === 'web') return;

    try {
      if (level === 'single') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (level === 'allDone') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Play chime
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
        const { sound } = await Audio.Sound.createAsync(chimeSource);
        soundRef.current = sound;
        await sound.playAsync();
      } else if (level === 'challenge') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await new Promise((r) => setTimeout(r, 100));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        // Play chime
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
        const { sound } = await Audio.Sound.createAsync(chimeSource);
        soundRef.current = sound;
        await sound.playAsync();
      }
    } catch {
      // Haptics/sound may not be available on all devices
    }
  }, []);

  return { celebrate };
}
