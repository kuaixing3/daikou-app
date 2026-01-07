import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Keep the splash screen open while we resolve authentication
// This is important to prevent a flash of the login screen before redirection.
// SplashScreen.preventAutoHideAsync(); // You might need to install expo-splash-screen

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until authentication state is loaded
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to the sign-up page if the user is not logged in
      // and not already in the auth flow.
      router.replace('/(auth)/signup');
    } else if (user && inAuthGroup) {
      // Redirect to the main app if the user is logged in
      // and currently in the auth flow.
      router.replace('/(tabs)');
    }
    
    // After resolution, hide the splash screen
    // if (isLoading) SplashScreen.hideAsync();

  }, [user, isLoading, segments, router]);

  // Render nothing while waiting for auth resolution to avoid flashing screens
  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      {/* The main app flow */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* The authentication flow */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      {/* Modal screens */}
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AuthProvider>
  );
}
