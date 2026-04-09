import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Inter_300Light, Inter_400Regular, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Colors } from '@/constants/theme';

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

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

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
      </Stack>
    </ThemeProvider>
  );
}
