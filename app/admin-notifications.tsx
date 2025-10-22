import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Bell, AlertTriangle, Info, X, FileText, User, Building, Store } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
// import { trpc } from "../lib/trpc";

interface AdminNotification {
  id: number;
  type: "approval_request" | "system_alert" | "user_report";
  title: string;
  content: string;
  relatedResourceType?: string | null;
  relatedResourceId?: number | null;
  actionUrl?: string | null;
  isRead: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: Date;
  readAt?: Date | null;
}

export default function AdminNotificationsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");

  // Fetch notifications from backend
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.admin.notifications.getNotifications.queryOptions({
      filter, // pass filter to backend if it supports it
    })
  );

  const notifications: AdminNotification[] = useMemo(() => {
    if (!notificationsData) return [];
    // If backend already filters, you may skip additional filter here.
    return (notificationsData as any).notifications as AdminNotification[];
  }, [notificationsData]);

  // Mutations
  const markAsReadMutation = useMutation(
    trpc.admin.notifications.markAsRead.mutationOptions({
      onSuccess: () => {
        refetch();
      },
      onError: () => {
        Alert.alert("خطأ", "تعذر وضع الاشعار كمقروء");
      },
    })
  );

  const deleteNotificationMutation = useMutation(
    trpc.admin.notifications.delete.mutationOptions({
      onSuccess: () => {
        refetch();
      },
      onError: () => {
        Alert.alert("خطأ", "تعذر حذف الإشعار");
      },
    })
  );

  const getNotificationIcon = (type: AdminNotification["type"], relatedResourceType?: string | null) => {
    if (type === "approval_request") {
      switch (relatedResourceType) {
        case "vet_registration":
          return <User size={20} color={COLORS.primary} />;
        case "clinic_activation":
          return <Building size={20} color={COLORS.info} />;
        case "store_activation":
          return <Store size={20} color={COLORS.warning} />;
        default:
          return <FileText size={20} color={COLORS.primary} />;
      }
    }
    switch (type) {
      case "user_report":
        return <AlertTriangle size={20} color={COLORS.warning} />;
      case "system_alert":
        return <Info size={20} color={COLORS.info} />;
      default:
        return <Bell size={20} color={COLORS.gray} />;
    }
  };

  const getPriorityColor = (priority: AdminNotification["priority"]) => {
    switch (priority) {
      case "urgent":
        return COLORS.error;
      case "high":
        return COLORS.warning;
      case "normal":
        return COLORS.info;
      case "low":
        return COLORS.success;
      default:
        return COLORS.gray;
    }
  };

  const markAsRead = (id: number) => {
    markAsReadMutation.mutate({ notificationId: id });
  };

  const deleteNotification = (id: number) => {
    Alert.alert("حذف الإشعار", "هل أنت متأكد من حذف هذا الإشعار؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deleteNotificationMutation.mutate({ notificationId: id });
        },
      },
    ]);
  };

  const handleNotificationPress = (notification: AdminNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    } else if (notification.type === "approval_request") {
      router.push("/admin-approvals");
    }
  };

  const formatTime = (date: string | Date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `منذ ${minutes} دقيقة`;
    } else if (hours < 24) {
      return `منذ ${hours} ساعة`;
    } else {
      return `منذ ${days} يوم`;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "إشعارات الإدارة",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "إشعارات الإدارة",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color={COLORS.error} />
          <Text style={styles.errorText}>حدث خطأ في تحميل الإشعارات</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "إشعارات الإدارة",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" as const },
        }}
      />

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.activeFilter]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.activeFilterText]}>الكل</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "unread" && styles.activeFilter]}
          onPress={() => setFilter("unread")}
        >
          <Text style={[styles.filterText, filter === "unread" && styles.activeFilterText]}>غير مقروءة</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "high" && styles.activeFilter]}
          onPress={() => setFilter("high")}
        >
          <Text style={[styles.filterText, filter === "high" && styles.activeFilterText]}>عالية الأولوية</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.isRead && styles.unreadCard]}
              onPress={() => handleNotificationPress(notification as AdminNotification)}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.notificationInfo}>
                  {getNotificationIcon(
                    notification.type as AdminNotification["type"],
                    notification.relatedResourceType
                  )}
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    {notification.type === "approval_request" && (
                      <Text style={styles.notificationFrom}>طلب موافقة جديد</Text>
                    )}
                  </View>
                </View>

                <View style={styles.notificationActions}>
                  <View
                    style={[
                      styles.priorityIndicator,
                      { backgroundColor: getPriorityColor(notification.priority as AdminNotification["priority"]) },
                    ]}
                  />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <X size={16} color={COLORS.gray} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.notificationMessage}>{notification.content}</Text>

              <View style={styles.notificationFooter}>
                <Text style={styles.timestamp}>{formatTime(notification.createdAt)}</Text>
                {!notification.isRead && <View style={styles.unreadIndicator} />}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Bell size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>لا توجد إشعارات</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  activeFilterText: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: "#f8f9ff",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  notificationInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  notificationFrom: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  notificationActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deleteButton: {
    padding: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.gray,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.error,
    marginTop: 16,
    textAlign: "center",
  },
  errorDetails: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
