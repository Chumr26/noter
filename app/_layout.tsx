import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotesStore } from '@/store/notesStore';
import { getThemeColors } from '@/constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const loadNotes = useNotesStore((state) => state.loadNotes);
  const colors = getThemeColors(colorScheme);

  // Load notes on app start
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="note/[id]" 
            options={{ 
              presentation: 'transparentModal',
              animation: 'slide_from_bottom',
              gestureEnabled: true,
              fullScreenGestureEnabled: true,
              animationTypeForReplace: 'push',
              animationDuration: 250,
            }} 
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
