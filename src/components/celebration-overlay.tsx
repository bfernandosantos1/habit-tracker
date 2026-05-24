import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { CelebrationLevel } from '@/context/habits-context';

const COLORS = ['#4CAF50', '#FFC107', '#2196F3', '#FF5722', '#9C27B0', '#00BCD4', '#FF9800', '#E91E63'];
const CONFETTI_COUNT = 30;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  level: CelebrationLevel;
  onFinish: () => void;
};

function ConfettiPiece({
  index,
  color,
  startDelay,
}: {
  index: number;
  color: string;
  startDelay: number;
}) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  const startX = useMemo(
    () => Math.random() * SCREEN_WIDTH,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index]
  );
  const drift = useMemo(
    () => (Math.random() - 0.5) * 120,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index]
  );

  useEffect(() => {
    translateY.value = withDelay(
      startDelay,
      withTiming(600 + Math.random() * 200, {
        duration: 1200 + Math.random() * 600,
        easing: Easing.out(Easing.quad),
      })
    );
    translateX.value = withDelay(
      startDelay,
      withTiming(drift, { duration: 1400 })
    );
    rotate.value = withDelay(
      startDelay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration: 1400 })
    );
    opacity.value = withDelay(
      startDelay + 800,
      withTiming(0, { duration: 600 })
    );
  }, [translateY, translateX, rotate, opacity, startDelay, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        { left: startX, backgroundColor: color },
        style,
      ]}
    />
  );
}

export function CelebrationOverlay({ level, onFinish }: Props) {
  const bannerOpacity = useSharedValue(0);
  const bannerScale = useSharedValue(0.5);

  useEffect(() => {
    if (level === 'challenge') {
      bannerOpacity.value = withTiming(1, { duration: 300 });
      bannerScale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) });

      const timeout = setTimeout(() => {
        bannerOpacity.value = withTiming(0, { duration: 400 });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [level, bannerOpacity, bannerScale]);

  useEffect(() => {
    if (!level || level === 'single') {
      onFinish();
      return;
    }
    const timeout = setTimeout(() => {
      runOnJS(onFinish)();
    }, 2500);
    return () => clearTimeout(timeout);
  }, [level, onFinish]);

  if (!level || level === 'single') return null;

  const bannerStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
    transform: [{ scale: bannerScale.value }],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <ConfettiPiece
          key={i}
          index={i}
          color={COLORS[i % COLORS.length]}
          startDelay={Math.random() * 300}
        />
      ))}
      {level === 'challenge' && (
        <Animated.View style={[styles.banner, bannerStyle]}>
          <ThemedText style={styles.bannerText}>
            🎉 Challenge Complete! 🎉
          </ThemedText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  confetti: {
    position: 'absolute',
    top: -10,
    width: 8,
    height: 14,
    borderRadius: 2,
  },
  banner: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 16,
  },
  bannerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
});
