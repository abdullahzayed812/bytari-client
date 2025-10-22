import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter, Stack } from 'expo-router';
import { Bell, Check, Clock, AlertCircle, Heart, Home } from 'lucide-react-native';
import { trpc } from "../lib/trpc";

export default function PetListingNotificationsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data: notifications, refetch } = trpc.pets.listings.getNotifications.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval_request':
        return <Clock size={20} color="#F59E0B" />;
      case 'approved':
        return <Check size={20} color="#10B981" />;
      case 'rejected':
        return <AlertCircle size={20} color="#EF4444" />;
      default:
        return <Bell size={20} color={COLORS.primary} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'approval_request':
        return '#FEF3C7';
      case 'approved':
        return '#D1FAE5';
      case 'rejected':
        return '#FEE2E2';
      default:
        return '#EBF4FF';
    }
  };

  const getListingTypeIcon = (listingType: string) => {
    switch (listingType) {
      case 'adoption':
        return <Home size={16} color={COLORS.primary} />;
      case 'breeding':
        return <Heart size={16} color="#8B5CF6" />;
      case 'lost':
        return <AlertCircle size={16} color="#EF4444" />;
      default:
        return <Bell size={16} color={COLORS.darkGray} />;
    }
  };

  const renderNotificationCard = (notification: any) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationCard,
        { backgroundColor: getNotificationColor(notification.type) },
        !notification.isRead && styles.unreadCard,
      ]}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.iconContainer}>
          {getNotificationIcon(notification.type)}
        </View>
        <View style={styles.notificationInfo}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <View style={styles.listingInfo}>
            {getListingTypeIcon(notification.listingType)}
            <Text style={styles.listingName}>{notification.listingName}</Text>
          </View>
        </View>
        <Text style={styles.timestamp}>
          {new Date(notification.createdAt).toLocaleDateString('ar-SA', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <Text style={styles.notificationContent}>{notification.content}</Text>

      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'إشعارات الحيوانات',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <View style={styles.container}>
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {notifications && notifications.length > 0 ? (
            <>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>إشعاراتك</Text>
                <Text style={styles.headerSubtitle}>
                  تابع حالة طلبات الحيوانات التي أرسلتها
                </Text>
              </View>
              {notifications.map(renderNotificationCard)}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Bell size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyTitle}>لا توجد إشعارات</Text>
              <Text style={styles.emptySubtitle}>
                ستظهر هنا إشعارات حالة طلبات الحيوانات التي ترسلها
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: 'right',
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  listingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  listingName: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 4,
    textAlign: 'right',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.lightGray,
    textAlign: 'left',
  },
  notificationContent: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
    textAlign: 'right',
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});