import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import { ArrowLeft, Bell, CheckCircle, XCircle, Clock, AlertTriangle, Mail, User } from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useQuery } from "@tanstack/react-query";

interface ApprovalNotification {
  id: string;
  type: "veterinarian_approval" | "veterinarian_rejection" | "clinic_approval" | "store_approval";
  title: string;
  message: string;
  status: "approved" | "rejected" | "pending";
  createdAt: string;
  read: boolean;
  data?: {
    applicationId?: string;
    reason?: string;
  };
}

export default function ApprovalNotificationsScreen() {
  const router = useRouter();

  const { data: notifications, isLoading, error, refetch } = useQuery(trpc.pets.getUserApprovals.queryOptions());

  // TODO: Implement mutations for marking as read and deleting
  // const markAsReadMutation = useMutation(trpc.notifications.markAsRead.mutationOptions());
  // const deleteNotificationMutation = useMutation(trpc.notifications.delete.mutationOptions());

  const markAsRead = (notificationId: string) => {
    // markAsReadMutation.mutate({ id: notificationId }, { onSuccess: () => refetch() });
    console.log("Marking as read (not implemented):", notificationId);
  };

  const deleteNotification = (notificationId: string) => {
    Alert.alert("حذف الإشعار", "هل أنت متأكد من حذف هذا الإشعار؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          // deleteNotificationMutation.mutate({ id: notificationId }, { onSuccess: () => refetch() });
          console.log("Deleting (not implemented):", notificationId);
        },
      },
    ]);
  };

  const getNotificationIcon = (type: string, status: string) => {
    if (status === "approved") {
      return <CheckCircle size={24} color="#4CAF50" />;
    } else if (status === "rejected") {
      return <XCircle size={24} color="#F44336" />;
    } else {
      return <Clock size={24} color="#FF9800" />;
    }
  };

  const getNotificationColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#E8F5E8";
      case "rejected":
        return "#FFEBEE";
      case "pending":
        return "#FFF3E0";
      default:
        return COLORS.background;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "منذ قليل";
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return "منذ يوم واحد";
      } else if (diffInDays < 7) {
        return `منذ ${diffInDays} أيام`;
      } else {
        return date.toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    }
  };

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyStateTitle}>جاري تحميل الإشعارات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <AlertTriangle size={48} color={COLORS.error} />
          <Text style={styles.emptyStateTitle}>حدث خطأ</Text>
          <Text style={styles.emptyStateMessage}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>إشعارات الموافقات</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color={COLORS.lightGray} />
            <Text style={styles.emptyStateTitle}>لا توجد إشعارات</Text>
            <Text style={styles.emptyStateMessage}>ستظهر هنا إشعارات حالة طلباتك للموافقة</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                { backgroundColor: getNotificationColor(notification.status) },
                !notification.read && styles.unreadCard,
              ]}
              onPress={() => markAsRead(notification.id)}
              onLongPress={() => deleteNotification(notification.id)}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type, notification.status)}
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationTime}>{formatDate(notification.createdAt)}</Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </View>

              <Text style={styles.notificationMessage}>{notification.message}</Text>

              {notification.data?.reason && (
                <View style={styles.reasonContainer}>
                  <AlertTriangle size={16} color="#FF9800" />
                  <Text style={styles.reasonText}>السبب: {notification.data.reason}</Text>
                </View>
              )}

              <View style={styles.notificationActions}>
                {notification.status === "approved" && notification.type === "veterinarian_approval" && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      Alert.alert("تسجيل الدخول", "يمكنك الآن تسجيل الدخول بحسابك المُفعل كطبيب بيطري.", [
                        { text: "إلغاء", style: "cancel" },
                        {
                          text: "تسجيل الدخول",
                          onPress: () => router.push("/auth"),
                        },
                      ]);
                    }}
                  >
                    <User size={16} color={COLORS.primary} />
                    <Text style={styles.actionButtonText}>تسجيل الدخول</Text>
                  </TouchableOpacity>
                )}

                {notification.status === "rejected" && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      Alert.alert("إعادة التقديم", "يمكنك إعادة تقديم طلبك بعد تصحيح المعلومات المطلوبة.", [
                        { text: "إلغاء", style: "cancel" },
                        {
                          text: "إعادة التقديم",
                          onPress: () => router.push("/auth"),
                        },
                      ]);
                    }}
                  >
                    <Mail size={16} color={COLORS.primary} />
                    <Text style={styles.actionButtonText}>إعادة التقديم</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {notifications.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.markAllReadButton}
            onPress={() => {
              setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
            }}
          >
            <CheckCircle size={20} color={COLORS.white} />
            <Text style={styles.markAllReadText}>تحديد الكل كمقروء</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
  },
  unreadBadge: {
    backgroundColor: "#F44336",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.darkGray,
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateMessage: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
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
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: "right",
    lineHeight: 20,
    marginBottom: 12,
  },
  reasonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 13,
    color: "#E65100",
    marginLeft: 8,
    textAlign: "right",
    flex: 1,
  },
  notificationActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  markAllReadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  markAllReadText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
