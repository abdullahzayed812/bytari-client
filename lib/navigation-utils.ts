import { router } from 'expo-router';

export function handleBackNavigation() {
  try {
    if (router.canGoBack()) {
      router.back();
    } else {
      // If we can't go back, go to the main tabs
      router.replace('/(tabs)');
    }
  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback to home
    router.replace('/(tabs)');
  }
}
