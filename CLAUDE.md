# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Expo Version Notice

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code. Expo SDK 56 has significant API changes from earlier versions.

## Commands

```bash
npm start          # Start Expo dev server (Metro bundler on port 8081)
npm run web        # Start with web target
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run lint       # ESLint
npx tsc --noEmit   # TypeScript check (strict mode)
npx expo install <pkg>  # Install SDK-compatible packages (always use this, not npm install)
```

## Architecture

**Expo Router file-based routing** — screens live in `src/app/`, each file is a route:
- `_layout.tsx` — Root layout. Wraps app in `HabitsProvider` > `ThemeProvider`. Gates on `appState.onboardingComplete` to show either `Onboarding` or `AppTabs`. Mounts `DevToolsPanel` and `CelebrationWatcher` at root level.
- `index.tsx` — Today tab (habit checklist)
- `challenges.tsx` — Challenges tab
- `explore.tsx` — Stats tab

**State management** — Single React context (`src/context/habits-context.tsx`) replaces all direct AsyncStorage access. All screens read/write through `useHabits()` hook. AsyncStorage keys: `habits_v2`, `challenges`, `app_state`. V1 migration from legacy `habits` key happens automatically on load.

**Data model** (`src/types/habit.ts`):
- `Habit.completions: Record<string, number>` — source of truth for both daily (0/1) and volume (0/N) habits, keyed by `"YYYY-MM-DD"`
- `todayKey()` — returns the current date string, respects `src/dev/dev-date.ts` simulated date for testing
- Helper functions (`isHabitComplete`, `getStreak`, `isChallengeComplete`, etc.) all live here

**Celebration system** — Three tiers (single/allDone/challenge) triggered from `habits-context.tsx`. `CelebrationWatcher` in `_layout.tsx` bridges context state to haptics (`expo-haptics`), audio (`expo-av`), and confetti overlay (`react-native-reanimated` animations).

**Tab navigation** — Platform-split: `app-tabs.tsx` (NativeTabs) and `app-tabs.web.tsx` (expo-router/ui Tabs). Adding a tab requires updating both files.

## Key Patterns

- **Path aliases**: `@/*` → `./src/*`, `@/assets/*` → `./assets/*` (configured in tsconfig.json)
- **Platform-specific files**: `.web.tsx` variants for web-only implementations (app-tabs, animated-icon, use-color-scheme)
- **Theming**: `useTheme()` returns `{ text, background, backgroundElement, backgroundSelected, textSecondary }`. Use `ThemedText` and `ThemedView` components. Accent green is `#4CAF50` (hardcoded, not in theme constants).
- **Spacing scale**: `Spacing.half` (2px) through `Spacing.six` (64px) from `src/constants/theme.ts`
- **Safe areas**: Always use `SafeAreaView` or `useSafeAreaInsets()`. Account for `BottomTabInset` (iOS: 50px, Android: 80px) in scrollable content.

## Dev Tools

`src/dev/` contains a time-travel testing system:
- `dev-date.ts` — module-level simulated date with listener system
- `dev-tools-panel.tsx` — floating FAB with day navigation and data reset
- `use-dev-date.ts` — hook that re-renders components when simulated date changes
- `todayKey()` automatically reads the simulated date — no special handling needed in feature code

When adding time-dependent features, use `todayKey()` from `@/types/habit` (never `new Date()` directly for date keys).
