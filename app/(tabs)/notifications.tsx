import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, Bell, Building2, MessageSquare, AlertCircle } from "lucide-react-native";
import { Stack } from "expo-router";
import { useApp } from "../../providers/AppProvider";
import { trpc } from "../../lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function NotificationsScreen() {
  const { t, isRTL } = useI18n();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useApp();

  const { data, isLoading } = useQuery({
    ...trpc.notifications.list.queryOptions({ userId: Number(user?.id) }),
    enabled: !!user?.id,
  });
  const notifications: any = useMemo(() => (data as any)?.notifications, [data]);

  const markNotificationAsRead = useMutation(trpc.notifications.markAsRead.mutationOptions());

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
      case "order":
      case "new_product":
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
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "الآن";
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  const handleNotificationPress = async (notification: any) => {
    markNotificationAsRead.mutate({ userId: user?.id, notificationId: notification?.id } as any, {
      onSuccess: () => {
        // queryClient.invalidateQueries(trpc.notifications.list.queryKey as any);

        if (notification?.type === "appointment") {
          router.push("/appointments");
        } else if (notification?.type === "order") {
          router.push("/orders");
        } else if (notification?.type === "inquiry") {
          router.push({ pathname: "/inquiry-details", params: { id: notification?.data?.inquiryId } });
        } else if (notification?.type === "consultation") {
          router.push({ pathname: "/consultation-details", params: { id: notification?.data?.consultationId } });
        } else if (notification?.type === "lost_pet_sighting") {
          const data = notification?.data;
          router.push({ pathname: "/lost-pet", params: { id: data.lostPetId } });
        } else if (notification?.type === "union_supervisor_assignment") {
          const data = notification?.data;
          router.push({ pathname: "/union-branch-details", params: { id: data.branchId } });
        } else if (notification?.type === "announcement") {
          const data = notification.data;
          if (data.branchId) {
            router.push({
              pathname: "/union-branch-details",
              params: { id: data.branchId },
            });
          } else if (data.mainUnionId) {
            router.push("/vet-unions");
          }
        } else if (notification?.type === "system") {
          router.push({ pathname: "/messages", params: { id: notification?.data?.inquiryId } });
        } else if (notification?.type === "new_product") {
          router.push({ pathname: "/store-details", params: { id: notification?.data?.storeId } });
        } else if (notification?.type === "vet_added") {
          router.push({
            pathname: "/clinic-dashboard",
            params: { clinicId: notification?.data?.clinicId },
          });
        } else if (notification?.type === "clinic_access_request") {
          // console.log(notification);
          router.push({
            pathname: "/pet-details",
            params: { petId: notification?.data?.petId },
          });
        } else if (notification?.type === "info") {
          router.push({
            pathname: "/(tabs)/messages",
            // params: { petId: notification?.data?.petId },
          });
        }
      },
      onError: () => {},
    });
  };

  if (isLoading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>
      {/* <Stack.Screen
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              {isRTL ? <ArrowRight size={24} color={COLORS.black} /> : <ArrowLeft size={24} color={COLORS.black} />}
            </TouchableOpacity>
          ),
        }}
      /> */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل الإشعارات...</Text>
          </View>
        ) : notifications?.length > 0 ? (
          notifications?.map((notification: any) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.isRead && {
                  borderLeftWidth: isRTL ? 0 : 4,
                  borderRightWidth: isRTL ? 4 : 0,
                  borderColor: COLORS.primary,
                },
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={[styles.notificationContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <View style={styles.iconContainer}>{getNotificationIcon(notification.type)}</View>

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
                  <Text style={[styles.notificationTitle, { textAlign: isRTL ? "left" : "right" }]}>
                    {notification.title}
                  </Text>
                  <Text style={[styles.notificationMessage, { textAlign: isRTL ? "left" : "right" }]} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  <Text style={[styles.notificationTime, { textAlign: isRTL ? "left" : "right" }]}>
                    {formatTime(notification.time)}
                  </Text>
                </View>

                {!notification.isRead && <View style={styles.unreadIndicator} />}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Bell size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyStateText}>لا توجد إشعارات</Text>
            <Text style={styles.emptyStateSubtext}>ستظهر الإشعارات هنا عند وصولها</Text>
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
