import React, { useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useApp } from "../providers/AppProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const { setHasSeenSplash, isAuthenticated } = useApp();
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  const animateSequence = useCallback(() => {
    // Background fade in
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Logo animations sequence
    Animated.sequence([
      // Logo fade in and scale up
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Small bounce effect
      Animated.spring(logoScale, {
        toValue: 1.1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Mark splash as seen and navigate appropriately after animation completes
      setTimeout(async () => {
        setHasSeenSplash(true);
        await AsyncStorage.setItem("hasSeenSplash", "true");

        // Navigate based on authentication status
        if (isAuthenticated) {
          console.log("User is authenticated, navigating to main app");
          router.replace("/(tabs)/" as any);
        } else {
          console.log("User is not authenticated, navigating to onboarding");
          router.replace("/onboarding");
        }
      }, 2000);
    });
  }, [
    backgroundOpacity,
    logoOpacity,
    logoScale,
    setHasSeenSplash,
    isAuthenticated,
  ]);

  useEffect(() => {
    animateSequence();
  }, [animateSequence]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.background,
          {
            opacity: backgroundOpacity,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={{
            uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/64oi11w6c780w68ybqvcc",
          }}
          style={styles.logo}
          contentFit="contain"
          transition={300}
        />
      </Animated.View>

      {/* Decorative elements */}
      <Animated.View
        style={[
          styles.circle1,
          {
            opacity: backgroundOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.circle2,
          {
            opacity: backgroundOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(248, 255, 254, 1)",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  logo: {
    width: width * 0.8,
    height: width * 0.8,
    maxWidth: 400,
    maxHeight: 400,
  },
  circle1: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    top: height * 0.1,
    right: -width * 0.3,
    zIndex: 1,
  },
  circle2: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: "rgba(76, 175, 80, 0.05)",
    bottom: height * 0.1,
    left: -width * 0.2,
    zIndex: 1,
  },
});
