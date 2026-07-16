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

// Mirrors the navigation performed by handleNotificationPress in mobile/app/(tabs)/notifications.tsx —
// keep the two in sync: same notification `type` must land on the same screen with the same params,
// whether the user tapped it from the in-app list or from a push notification.
function navigateFromNotificationData(data: Record<string, unknown>) {
  try {
    const type = data?.type as string | undefined;
    switch (type) {
      case "appointment":
      case "appointment_counter_proposed":
      case "appointment_confirmed":
      case "appointment_reminder":
        router.push("/appointments" as never);
        break;
      case "order":
        router.push("/orders" as never);
        break;
      case "inquiry":
        router.push({ pathname: "/inquiry-details", params: { id: String(data?.inquiryId ?? "") } } as never);
        break;
      case "consultation":
        router.push({ pathname: "/consultation-details", params: { id: String(data?.consultationId ?? "") } } as never);
        break;
      case "lost_pet_sighting":
        router.push({ pathname: "/lost-pet", params: { id: String(data?.lostPetId ?? "") } } as never);
        break;
      case "union_supervisor_assignment":
        router.push({ pathname: "/union-branch-details", params: { id: String(data?.branchId ?? "") } } as never);
        break;
      case "announcement":
        if (data?.branchId) {
          router.push({ pathname: "/union-branch-details", params: { id: String(data.branchId) } } as never);
        } else if (data?.mainUnionId) {
          router.push("/vet-union" as never);
        }
        break;
      case "system":
        router.push({ pathname: "/messages", params: { id: String(data?.inquiryId ?? "") } } as never);
        break;
      case "new_product":
        router.push({ pathname: "/store-details", params: { id: String(data?.storeId ?? "") } } as never);
        break;
      case "vet_added":
        router.push({ pathname: "/clinic-dashboard", params: { clinicId: String(data?.clinicId ?? "") } } as never);
        break;
      case "clinic_access_request":
        router.push({ pathname: "/pet-details", params: { petId: String(data?.petId ?? "") } } as never);
        break;
      case "info":
        router.push("/(tabs)/messages" as never);
        break;
      case "medical_action_request":
        router.push({ pathname: "/pet-details", params: { petId: String(data?.petId ?? "") } } as never);
        break;
      case "clinic_chat":
        router.push({
          pathname: "/clinic-chat-thread",
          params: {
            chatId: String(data?.chatId ?? ""),
            senderRole: String(data?.recipientRole ?? ""),
            clinicId: String(data?.clinicId ?? ""),
            petName: "",
          },
        } as never);
        break;
      case "poultry_farm_chat":
        router.push({ pathname: "/poultry-farm-chat-thread", params: { chatId: String(data?.chatId ?? "") } } as never);
        break;
      case "new_vaccination":
      case "vaccination_due":
        router.push({ pathname: "/(tabs)/pet-details", params: { petId: String(data?.petId ?? ""), openSection: "vaccinations" } } as never);
        break;
      case "new_reminder":
      case "reminder_due":
        router.push({ pathname: "/(tabs)/pet-details", params: { petId: String(data?.petId ?? ""), openSection: "reminders" } } as never);
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
