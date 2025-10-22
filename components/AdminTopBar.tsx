import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Bell, Search, MessageCircle, Shield } from "lucide-react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { useApp } from "@/providers/AppProvider";
import { useI18n } from "@/providers/I18nProvider";

interface AdminTopBarProps {
  onAdminDashboard?: () => void;
}

export function AdminTopBar({ onAdminDashboard }: AdminTopBarProps) {
  const router = useRouter();
  const { hasAdminAccess, isSuperAdmin, isModerator, moderatorPermissions } = useApp();
  const { isRTL } = useI18n();

  console.log({ hasAdminAccess, isSuperAdmin, isModerator, moderatorPermissions });

  const badgeStyle = {
    ...styles.badge,
    left: isRTL ? -4 : undefined,
    right: isRTL ? undefined : -4,
  };

  const moderatorBadgeStyle = {
    ...styles.moderatorBadge,
    left: isRTL ? -4 : undefined,
    right: isRTL ? undefined : -4,
  };

  // Get actual counts from database or fallback to 0
  const notificationsCount = 0;
  const messagesCount = 0;

  // Filter counts based on moderator permissions
  const getFilteredNotificationsCount = () => {
    if (!isModerator || !moderatorPermissions) return notificationsCount;

    // For moderators, show filtered count based on their permissions
    // This is a simplified version - in real implementation,
    // the backend should filter based on permissions
    return Math.floor(notificationsCount * 0.6); // Show 60% of notifications for moderators
  };

  const getFilteredMessagesCount = () => {
    if (!isModerator || !moderatorPermissions) return messagesCount;

    // For moderators, show filtered count based on their permissions
    // This is a simplified version - in real implementation,
    // the backend should filter based on permissions
    return Math.floor(messagesCount * 0.7); // Show 70% of messages for moderators
  };

  const handleAdminDashboard = () => {
    if (onAdminDashboard) {
      onAdminDashboard?.();
    } else {
      router.push("/admin-dashboard");
    }
  };

  const handleNotifications = () => {
    router.push("/admin-notifications");
  };

  const handleSearch = () => {
    router.push("/admin-search");
  };

  const handleMessages = () => {
    router.push("/admin-messages");
  };

  if (!hasAdminAccess && !isModerator) {
    console.log("AdminTopBar: Not showing - no admin access or moderator status");
    return null;
  }

  return (
    <View style={styles.container}>
      {/* أيقونات اليسار */}
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.iconButton} onPress={handleMessages} testID="admin-messages-button">
          <MessageCircle size={24} color={COLORS.white} />
          {getFilteredMessagesCount() > 0 && (
            <View style={isModerator && !moderatorPermissions?.superPermissions ? moderatorBadgeStyle : badgeStyle}>
              <Text
                style={
                  isModerator && !moderatorPermissions?.superPermissions ? styles.moderatorBadgeText : styles.badgeText
                }
              >
                {getFilteredMessagesCount() > 99 ? "99+" : getFilteredMessagesCount().toString()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={handleNotifications} testID="admin-notifications-button">
          <Bell size={24} color={COLORS.white} />
          {getFilteredNotificationsCount() > 0 && (
            <View style={isModerator && !moderatorPermissions?.superPermissions ? moderatorBadgeStyle : badgeStyle}>
              <Text
                style={
                  isModerator && !moderatorPermissions?.superPermissions ? styles.moderatorBadgeText : styles.badgeText
                }
              >
                {getFilteredNotificationsCount() > 99 ? "99+" : getFilteredNotificationsCount().toString()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={handleSearch} testID="admin-search-button">
          <Search size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* زر دخول الإدارة في اليمين - مخفي للمشرفين العاديين */}
      {isSuperAdmin && (!isModerator || moderatorPermissions?.superPermissions) && (
        <TouchableOpacity style={styles.adminButton} onPress={handleAdminDashboard} testID="admin-dashboard-button">
          <Shield size={18} color={COLORS.white} />
          <Text style={styles.adminButtonText}>{isSuperAdmin ? "الإدارة العامة" : "لوحة الإدارة"}</Text>
        </TouchableOpacity>
      )}

      {/* زر دخول الإدارة للمشرفين */}
      {isModerator && !moderatorPermissions?.superPermissions && (
        <TouchableOpacity
          style={styles.moderatorAdminButton}
          onPress={() => router.push("/moderator-quick-actions")}
          testID="moderator-admin-button"
        >
          <Shield size={16} color={COLORS.white} />
          <Text style={styles.moderatorText}>دخول الإدارة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftSection: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    left: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  moderatorBadge: {
    position: "absolute",
    top: -4,
    left: -4,
    backgroundColor: "#007AFF", // اللون الأزرق للمشرفين
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  moderatorBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  adminButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  adminButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  moderatorAdminButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  moderatorText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
