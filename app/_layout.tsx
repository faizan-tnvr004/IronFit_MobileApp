import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { ActivityProvider } from '@/context/ActivityContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useRouter, useSegments } from 'expo-router';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  
  return (
    <AuthProvider>
      <ActivityProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthGate />
        </ThemeProvider>
      </ActivityProvider>
    </AuthProvider>
  );
}

// Separate component to use auth context
function AuthGate() {
  const { user, userProfile, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'admin';
    
    if (!user && !inAuthGroup) {
      // Redirect unauthenticated users to login
      router.replace('/login');
    } else if (user && (segments[0] === 'login' || segments[0] === 'signup')) {
      // Redirect authenticated users away from login/signup
      if (userProfile) {
        router.replace('/(tabs)');
      } else {
        router.replace('/profile-setup');
      }
    } else if (user && !userProfile && segments[0] !== 'profile-setup') {
      // If user is authenticated but has no profile, force profile setup
      router.replace('/profile-setup');
    } else if (user && userProfile && segments[0] === 'profile-setup') {
      // If user is on setup but already has profile, go to main app
      router.replace('/(tabs)');
    }
  }, [user, userProfile, isLoading, segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="signup" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="add-activity" options={{ headerShown: false, presentation: 'transparentModal', animation: 'fade' }} />
          <Stack.Screen name="running" options={{ headerShown: false }} />
          <Stack.Screen name="cycling" options={{ headerShown: false }} />
          <Stack.Screen name="walking" options={{ headerShown: false }} />
          <Stack.Screen name="swimming" options={{ headerShown: false }} />
          <Stack.Screen name="dancing" options={{ headerShown: false }} />
      <Stack.Screen name="yoga" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
    </Stack>
  );
}