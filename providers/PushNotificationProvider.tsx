import React, { createContext, useContext, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import Constants from "expo-constants";
import { trpcClient } from "../lib/trpc";
import { useApp } from "./AppProvider";
import { useToastContext } from "./ToastProvider";

// Remote push notifications were removed from Expo Go in SDK 53.
// appOwnership === "expo" is the only reliable Expo Go identifier —
// executionEnvironment can report "storeClient" in dev builds too.
const IS_EXPO_GO = Constants.appOwnership === "expo";

const PUSH_TOKEN_KEY = "@bytari/push_token";

async function requestAndGetToken(
  onError: (stage: string, err: unknown) => void
): Promise<string | null> {
  if (Platform.OS === "web" || IS_EXPO_GO) return null;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    onError("permission", `status: ${status}`);
    return null;
  }

  try {
    const result = await Notifications.getDevicePushTokenAsync();
    return result.data;
  } catch (err) {
    console.warn("[Push] getDevicePushTokenAsync failed:", err);
    onError("getDevicePushTokenAsync", err);
    return null;
  }
}

function navigateFromNotificationData(data: Record<string, unknown>) {
  try {
    const type = data?.type as string | undefined;
    switch (type) {
      case "appointment":
      case "clinic_appointment":
        router.push("/appointments" as never);
        break;
      case "consultation":
        router.push("/consultation-list" as never);
        break;
      case "inquiry":
        router.push("/inquiries-list" as never);
        break;
      case "vaccination_due":
      case "new_vaccination":
        router.push("/(tabs)" as never);
        break;
      case "reminder_due":
      case "new_reminder":
        router.push("/reminders" as never);
        break;
      case "clinic_chat":
        router.push("/clinic-system" as never);
        break;
      case "lost_pet_sighting":
        router.push("/lost-pets-list" as never);
        break;
      case "new_product":
        router.push("/(tabs)" as never);
        break;
      default:
        router.push("/notifications" as never);
        break;
    }
  } catch {
    // Router not ready yet — silently ignore
  }
}

interface PushNotificationContextType {
  pushToken: string | null;
}

const PushNotificationContext = createContext<PushNotificationContextType>({
  pushToken: null,
});

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  const { showToast } = useToastContext();
  const [pushToken, setPushToken] = React.useState<string | null>(null);
  const registering = useRef(false);

  // Configure foreground notification behaviour and Android channel (real builds only)
  useEffect(() => {
    if (IS_EXPO_GO) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "الإشعارات",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4CAF50",
        sound: "default",
      });
    }
  }, []);

  // Register device token when the user logs in
  useEffect(() => {
    if (IS_EXPO_GO || !isAuthenticated || registering.current) return;

    let cancelled = false;
    registering.current = true;

    async function register() {
      const token = await requestAndGetToken((stage, err) => {
        showToast({ message: `[Push debug] ${stage}: ${String(err)}`, type: "error", duration: 6000 });
      });
      if (!token || cancelled) return;

      const platform = Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";

      try {
        await trpcClient.devices.register.mutate({ token, platform });
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
        if (!cancelled) setPushToken(token);
      } catch (err) {
        console.warn("[Push] Token registration failed:", err);
        showToast({ message: `[Push debug] register: ${String(err)}`, type: "error", duration: 6000 });
      }
    }

    register().finally(() => {
      registering.current = false;
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Remove token when the user logs out
  useEffect(() => {
    if (IS_EXPO_GO || isAuthenticated) return;

    async function unregister() {
      const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (!storedToken) return;
      try {
        await trpcClient.devices.remove.mutate({ token: storedToken });
      } catch {
        // Best-effort — server auto-purges stale tokens on next FCM error
      }
      await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
      setPushToken(null);
    }

    unregister().catch(() => {});
  }, [isAuthenticated]);

  // Foreground notification listener
  useEffect(() => {
    if (IS_EXPO_GO) return;
    const sub = Notifications.addNotificationReceivedListener(() => {});
    return () => sub.remove();
  }, []);

  // Notification tapped (background / killed state)
  useEffect(() => {
    if (IS_EXPO_GO) return;
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;
      navigateFromNotificationData(data);
    });
    return () => sub.remove();
  }, []);

  // App opened from a killed state via notification tap
  useEffect(() => {
    if (IS_EXPO_GO) return;
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data = response.notification.request.content.data as Record<string, unknown>;
      navigateFromNotificationData(data);
    });
  }, []);

  return <PushNotificationContext.Provider value={{ pushToken }}>{children}</PushNotificationContext.Provider>;
}

export function usePushNotification() {
  return useContext(PushNotificationContext);
}
