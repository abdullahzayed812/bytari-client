import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../providers/AppProvider';
import SplashScreen from './splash';

export default function IndexScreen() {
  const { isLoading, hasSeenSplash, isAuthenticated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!hasSeenSplash) {
        // Show splash screen first
        console.log('Showing splash screen');
        router.replace('/splash');
      } else if (isAuthenticated) {
        // User has seen splash and is authenticated, go to main app
        console.log('User authenticated, navigating to main app');
        router.replace('/(tabs)/' as any);
      } else {
        // User has seen splash but not authenticated, go to onboarding
        console.log('User not authenticated, navigating to onboarding');
        router.replace('/onboarding');
      }
    }
  }, [isLoading, hasSeenSplash, isAuthenticated, router]);

  // Show loading or splash screen while determining route
  if (isLoading || !hasSeenSplash) {
    return <SplashScreen />;
  }

  // Fallback loading view
  return (
    <View style={styles.container}>
      {/* This should rarely be seen as navigation should happen in useEffect */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});