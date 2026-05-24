import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { ActivityIndicator, View, useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { CelebrationWatcher } from '@/components/celebration-watcher';
import { Onboarding } from '@/components/onboarding';
import { HabitsProvider } from '@/context/habits-context';
import { DevToolsPanel } from '@/dev/dev-tools-panel';
import { useHabits } from '@/hooks/use-habits';

function AppContent() {
  const { appState, isLoading } = useHabits();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!appState.onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <>
      <AppTabs />
      <CelebrationWatcher />
    </>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <HabitsProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppContent />
        <DevToolsPanel />
      </ThemeProvider>
    </HabitsProvider>
  );
}
