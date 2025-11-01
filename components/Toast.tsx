import { COLORS } from "@/constants/colors";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, Pressable } from "react-native";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  visible: boolean;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  duration = 3000,
  visible,
  onHide,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => hideToast(), duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  if (!visible) return null;

  const getToastColors = () => {
    switch (type) {
      case "success":
        return { backgroundColor: "#10b981", textColor: "#FFFFFF" };
      case "error":
        return { backgroundColor: "#ef4444", textColor: "#FFFFFF" };
      case "warning":
        return { backgroundColor: "#f59e0b", textColor: "#000000" };
      case "info":
      default:
        return { backgroundColor: "#F5F5F5", textColor: "#000000" };
    }
  };

  const { backgroundColor, textColor } = getToastColors();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable onPress={hideToast} style={styles.pressable}>
        <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  pressable: {
    width: "100%",
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
  },
});
