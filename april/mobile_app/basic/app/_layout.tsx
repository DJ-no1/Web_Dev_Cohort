import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Inter_300Light, Inter_400Regular, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Handle notifications conditionally for Android Expo Go support
const isAndroid = Platform.OS === 'android';
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const canUseNotifications = Platform.OS !== 'web' && (!isAndroid || !isExpoGo);

let Notifications: any;
if (canUseNotifications) {
  Notifications = require('expo-notifications');
}

if (canUseNotifications && Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [loaded] = useFonts({
    'Inter-Light': Inter_300Light,
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  const { settings } = useStore();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle background notification updates
  useEffect(() => {
    if (!canUseNotifications || !Notifications) return;
    
    if (!settings.runInBackground || !settings.isTimerConfigured) {
      if (!settings.runInBackground) {
        Notifications.cancelAllScheduledNotificationsAsync();
      }
      return;
    }

    const updateTimerNotification = async () => {
      const baseNowMs = Date.now();
      const effectiveNowMs = settings.timerPausedAt !== null ? settings.timerPausedAt : baseNowMs;
      const sessionDurationMs = (
        (settings.countdownDays * 24 * 60 * 60) +
        (settings.countdownHours * 60 * 60) +
        (settings.countdownMinutes * 60)
      ) * 1000;
      const elapsedMs = effectiveNowMs - settings.timerStartAt;
      const distance = Math.max(0, sessionDurationMs - elapsedMs);

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
      const body = distance <= 0 
        ? "Countdown Finished!" 
        : `Remaining: ${days}D ${hours}H ${minutes}M`;

      await Notifications.scheduleNotificationAsync({
        identifier: 'chronos-timer',
        content: {
          title: "Chronos Countdown Active",
          body,
          autoDismiss: false,
          sticky: true,
          color: Colors.primary,
        },
        trigger: null,
      });
    };

    updateTimerNotification();
    const interval = setInterval(updateTimerNotification, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [settings.runInBackground, settings.isTimerConfigured, settings.timerPausedAt, settings.timerStartAt, settings.countdownDays, settings.countdownHours, settings.countdownMinutes]);

  if (!loaded) {
    return null;
  }

  // Force strict Dark mode to match Chronos
  const chronosTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.background,
      card: Colors.surfaceHigh,
      text: Colors.primary,
      border: Colors.outlineVariant,
      primary: Colors.primary,
    },
  };

  return (
    <ThemeProvider value={chronosTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
