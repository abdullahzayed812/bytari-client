import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  MessageSquare,
  AlertCircle,
} from "lucide-react-native";
import { Stack } from "expo-router";
import { useApp } from "../../providers/AppProvider";
import { trpc } from "../../lib/trpc";
import { useQuery } from "@tanstack/react-query";

interface Notification {
  id: string;
  type: "clinic" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon?: string;
}

export default function NotificationsScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { user } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notificationsQuery = useQuery(
    trpc.notifications.list.queryOptions(
      { userId: parseInt(user?.id || "0") },
      {
        enabled: !!user?.id && !isNaN(parseInt(user.id)),
        refetchOnMount: true,
        refetchOnWindowFocus: true,
      }
    )
  );

  useEffect(() => {
    if (notificationsQuery.data?.success) {
      const dbNotifications: Notification[] =
        notificationsQuery.data.notifications.map((notif: any) => ({
          id: notif.id.toString(),
          type: notif.type || "system",
          title: notif.title,
          message: notif.message || notif.content,
          time: notif.createdAt,
          read: notif.isRead,
        }));

      setNotifications(dbNotifications);
    }
  }, [notificationsQuery.data]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
      case "order":
        return <Building2 size={20} color={COLORS.primary} />;
      case "inquiry":
        return <AlertCircle size={20} color={COLORS.warning} />;
      case "system":
      default:
        return <Bell size={20} color={COLORS.darkGray} />;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "الآن";
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    console.log("Notification pressed:", notification.id);
    // Example navigation logic:
    if (notification?.type === "appointment") {
      router.push("/appointments");
    } else if (notification?.type === "order") {
      router.push("/orders");
    } else if (notification?.type === "inquiry") {
      router.push("/inquiries");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "الإشعارات",
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: {
            color: COLORS.black,
            fontSize: 18,
            fontWeight: "bold",
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              {isRTL ? (
                <ArrowRight size={24} color={COLORS.black} />
              ) : (
                <ArrowLeft size={24} color={COLORS.black} />
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notificationsQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل الإشعارات...</Text>
          </View>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard,
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View
                style={[
                  styles.notificationContent,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <View style={styles.iconContainer}>
                  {getNotificationIcon(notification.type)}
                </View>

                <View
                  style={[
                    styles.textContainer,
                    {
                      flex: 1,
                      marginLeft: isRTL ? 0 : 12,
                      marginRight: isRTL ? 12 : 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.notificationTitle,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {notification.title}
                  </Text>
                  <Text
                    style={[
                      styles.notificationMessage,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                    numberOfLines={2}
                  >
                    {notification.message}
                  </Text>
                  <Text
                    style={[
                      styles.notificationTime,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {formatTime(notification.time)}
                  </Text>
                </View>

                {!notification.read && <View style={styles.unreadIndicator} />}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Bell size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyStateText}>لا توجد إشعارات</Text>
            <Text style={styles.emptyStateSubtext}>
              ستظهر الإشعارات هنا عند وصولها
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationContent: {
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    justifyContent: "flex-start",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.lightGray,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: "center",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
});
