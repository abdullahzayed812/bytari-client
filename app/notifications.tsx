import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert, Image } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { Stack, router } from "expo-router";
import {
  ArrowLeft,
  Bell,
  MessageSquare,
  AlertCircle,
  Calendar,
  Heart,
  ShoppingCart,
  Check,
  X,
  Flag,
  Store,
  ArrowRight,
} from "lucide-react-native";
import { useApp } from "../providers/AppProvider";
import Button from "../components/Button";
import { mockStoreNotifications } from "../mocks/data";
import { handleBackNavigation } from "../lib/navigation-utils";
import { useNotifications } from "@/providers/NotificationProvider";

interface VetNotification {
  id: string;
  type: "system" | "approval" | "reminder" | "advertisement";
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: "low" | "medium" | "high";
}

const mockVetNotifications: VetNotification[] = [
  {
    id: "1",
    type: "approval",
    title: "موافقة على متابعة الحالة",
    message: 'تمت الموافقة على طلب متابعة الحالة للحيوان "فلافي" من قبل المالك أحمد محمد',
    time: "2024-01-15T14:30:00Z",
    read: false,
    priority: "high",
  },
  {
    id: "2",
    type: "system",
    title: "تحديث النظام",
    message: "تم تحديث نظام إدارة العيادات البيطرية. يرجى مراجعة الميزات الجديدة",
    time: "2024-01-14T10:15:00Z",
    read: true,
    priority: "medium",
  },
  {
    id: "3",
    type: "reminder",
    title: "تذكير موعد",
    message: 'لديك موعد مع الحيوان "ماكس" في الساعة 3:00 مساءً اليوم',
    time: "2024-01-15T09:00:00Z",
    read: false,
    priority: "high",
  },
  {
    id: "4",
    type: "advertisement",
    title: "عرض خاص على الأدوية البيطرية",
    message: "خصم 20% على جميع الأدوية البيطرية لفترة محدودة. اطلب الآن!",
    time: "2024-01-13T16:45:00Z",
    read: true,
    priority: "low",
  },
  {
    id: "5",
    type: "approval",
    title: "رفض طلب إضافة سجل طبي",
    message: 'تم رفض طلب إضافة سجل طبي للحيوان "لولو" من قبل المالك سارة أحمد',
    time: "2024-01-12T11:20:00Z",
    read: false,
    priority: "medium",
  },
];

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const { userMode } = useApp();
  const { notifications, respondToNotification, reportClinic } = useNotifications();
  const [activeTab, setActiveTab] = useState<"pending" | "settings">("pending");
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: "general",
      title: "الإشعارات العامة",
      description: "تلقي إشعارات حول التحديثات والأخبار العامة",
      icon: <Bell size={24} color={COLORS.primary} />,
      enabled: true,
    },
    {
      id: "appointments",
      title: "المواعيد",
      description: "تذكيرات بمواعيد العيادات والفحوصات",
      icon: <Calendar size={24} color={COLORS.primary} />,
      enabled: true,
    },
    {
      id: "consultations",
      title: "الاستشارات",
      description: "إشعارات الردود على الاستشارات البيطرية",
      icon: <MessageSquare size={24} color={COLORS.primary} />,
      enabled: true,
    },
    {
      id: "health",
      title: "الصحة والرعاية",
      description: "تذكيرات التطعيمات والفحوصات الدورية",
      icon: <Heart size={24} color={COLORS.primary} />,
      enabled: false,
    },
    {
      id: "orders",
      title: "الطلبات",
      description: "تحديثات حالة الطلبات من المتجر",
      icon: <ShoppingCart size={24} color={COLORS.primary} />,
      enabled: true,
    },
    {
      id: "stores",
      title: "المذاخر البيطرية",
      description: "إشعارات المنتجات الجديدة من المذاخر المتابعة",
      icon: <Store size={24} color={COLORS.primary} />,
      enabled: true,
    },
    {
      id: "system",
      title: "النظام",
      description: "إشعارات النظام والتحديثات التقنية",
      icon: <AlertCircle size={24} color={COLORS.primary} />,
      enabled: false,
    },
  ]);

  const pendingNotifications = notifications.filter((n) => n.status === "pending");

  const getVetNotificationIcon = (type: string, priority: string) => {
    const color = priority === "high" ? COLORS.error : priority === "medium" ? COLORS.warning : COLORS.primary;

    switch (type) {
      case "approval":
        return <Check size={24} color={color} />;
      case "system":
        return <AlertCircle size={24} color={color} />;
      case "reminder":
        return <Calendar size={24} color={color} />;
      case "advertisement":
        return <ShoppingCart size={24} color={color} />;
      default:
        return <Bell size={24} color={color} />;
    }
  };

  const formatVetTime = (timeString: string) => {
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

  const handleApprove = async (notificationId: string) => {
    await respondToNotification(notificationId, "approved");
    Alert.alert("تم الموافقة", "تم الموافقة على الطلب وإضافته لملف الحيوان");
  };

  const handleReject = async (notificationId: string) => {
    Alert.alert("رفض الطلب", "هل أنت متأكد من رفض هذا الطلب؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "رفض",
        style: "destructive",
        onPress: async () => {
          await respondToNotification(notificationId, "rejected");
          Alert.alert("تم الرفض", "تم رفض الطلب");
        },
      },
    ]);
  };

  const handleReport = async (notificationId: string, clinicId: string, clinicName: string) => {
    Alert.alert(
      "الإبلاغ عن العيادة",
      `هل تريد الإبلاغ عن العيادة ${clinicName}؟ سيتم حظر هذه العيادة من الوصول لملفات حيواناتك.`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إبلاغ",
          style: "destructive",
          onPress: async () => {
            await reportClinic(clinicId, notificationId);
            Alert.alert("تم الإبلاغ", "تم الإبلاغ عن العيادة وحظرها من الوصول لملفات حيواناتك");
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "medical_record":
        return <Heart size={24} color={COLORS.primary} />;
      case "vaccination":
        return <Calendar size={24} color={COLORS.success} />;
      case "reminder":
        return <Bell size={24} color={COLORS.warning} />;
      case "follow_up":
        return <MessageSquare size={24} color={COLORS.info} />;
      case "store_product":
        return <Store size={24} color={COLORS.primary} />;
      default:
        return <AlertCircle size={24} color={COLORS.primary} />;
    }
  };

  const toggleNotification = (id: string) => {
    setNotificationSettings((prev) =>
      prev.map((setting) => (setting.id === id ? { ...setting, enabled: !setting.enabled } : setting))
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "الإشعارات",
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black, fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => handleBackNavigation()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "pending" && styles.activeTab]}
            onPress={() => setActiveTab("pending")}
          >
            <Text style={[styles.tabText, activeTab === "pending" && styles.activeTabText]}>
              {userMode === "veterinarian" ? "الإشعارات" : `الطلبات المعلقة (${pendingNotifications.length})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "settings" && styles.activeTab]}
            onPress={() => setActiveTab("settings")}
          >
            <Text style={[styles.tabText, activeTab === "settings" && styles.activeTabText]}>الإعدادات</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === "pending" ? (
            <View>
              {userMode === "veterinarian" ? (
                // Veterinarian notifications
                <View>
                  {mockVetNotifications.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Bell size={48} color={COLORS.lightGray} />
                      <Text style={styles.emptyStateText}>لا توجد إشعارات</Text>
                      <Text style={styles.emptyStateSubtext}>ستظهر هنا الإشعارات الخاصة بالطبيب البيطري</Text>
                    </View>
                  ) : (
                    mockVetNotifications.map((notification) => (
                      <View
                        key={notification.id}
                        style={[
                          styles.notificationCard,
                          !notification.read && styles.unreadNotification,
                          notification.priority === "high" && styles.highPriorityNotification,
                        ]}
                      >
                        <View style={styles.notificationHeader}>
                          {getVetNotificationIcon(notification.type, notification.priority)}
                          <View style={styles.notificationInfo}>
                            <Text style={styles.notificationTitle}>{notification.title}</Text>
                            <Text style={styles.notificationDate}>{formatVetTime(notification.time)}</Text>
                          </View>
                          {!notification.read && <View style={styles.unreadDot} />}
                        </View>

                        <Text style={styles.notificationMessage}>{notification.message}</Text>

                        {notification.type === "approval" && (
                          <View style={styles.approvalBadge}>
                            <Text style={styles.approvalBadgeText}>
                              {notification.message.includes("موافقة") ? "تمت الموافقة" : "تم الرفض"}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))
                  )}
                </View>
              ) : (
                // Pet owner notifications
                <View>
                  {/* Store Notifications Section */}
                  {mockStoreNotifications.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>إشعارات المذاخر البيطرية</Text>
                      {mockStoreNotifications.map((storeNotification) => (
                        <View key={storeNotification.id} style={styles.storeNotificationCard}>
                          <View style={styles.storeNotificationHeader}>
                            <Store size={24} color={COLORS.primary} />
                            <View style={styles.storeNotificationInfo}>
                              <Text style={styles.storeNotificationTitle}>{storeNotification.storeName}</Text>
                              <Text style={styles.storeNotificationDate}>
                                {new Date(storeNotification.createdAt).toLocaleDateString("ar-SA")}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.storeProductInfo}>
                            <Image source={{ uri: storeNotification.productImage }} style={styles.storeProductImage} />
                            <View style={styles.storeProductDetails}>
                              <Text style={styles.storeProductName}>{storeNotification.productName}</Text>
                              <Text style={styles.storeNotificationMessage}>{storeNotification.message}</Text>
                            </View>
                          </View>

                          <View style={styles.storeNotificationActions}>
                            <Button
                              title="عرض المنتج"
                              onPress={() => router.push(`/store-details?id=${storeNotification.storeId}`)}
                              type="primary"
                              size="small"
                              style={styles.storeActionButton}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Clinic Notifications Section */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>طلبات العيادات</Text>
                    {pendingNotifications.length === 0 ? (
                      <View style={styles.emptyState}>
                        <Bell size={48} color={COLORS.lightGray} />
                        <Text style={styles.emptyStateText}>لا توجد طلبات معلقة</Text>
                        <Text style={styles.emptyStateSubtext}>ستظهر هنا طلبات العيادات للموافقة عليها</Text>
                      </View>
                    ) : (
                      pendingNotifications.map((notification) => (
                        <View key={notification.id} style={styles.notificationCard}>
                          <View style={styles.notificationHeader}>
                            {getNotificationIcon(notification.type)}
                            <View style={styles.notificationInfo}>
                              <Text style={styles.notificationTitle}>{notification.title}</Text>
                              <Text style={styles.notificationClinic}>من: {notification.data?.clinicName}</Text>
                              <Text style={styles.notificationDate}>
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.notificationMessage}>{notification.message}</Text>

                          <View style={styles.notificationActions}>
                            <Button
                              title="موافق"
                              onPress={() => handleApprove(notification.id)}
                              type="primary"
                              size="small"
                              icon={<Check size={16} color={COLORS.white} />}
                              style={styles.actionButton}
                            />

                            <Button
                              title="رفض"
                              onPress={() => handleReject(notification.id)}
                              type="outline"
                              size="small"
                              icon={<X size={16} color={COLORS.error} />}
                              style={[styles.actionButton, styles.rejectButton]}
                            />

                            <Button
                              title="إبلاغ"
                              onPress={() =>
                                handleReport(
                                  notification.id,
                                  notification.data?.clinicId ?? "",
                                  notification.data?.clinicName ?? ""
                                )
                              }
                              type="outline"
                              size="small"
                              icon={<Flag size={16} color={COLORS.warning} />}
                              style={[styles.actionButton, styles.reportButton]}
                            />
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View>
              <View style={styles.header}>
                <Bell size={40} color={COLORS.white} />
                <Text style={styles.headerText}>تخصيص الإشعارات حسب تفضيلاتك</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>أنواع الإشعارات</Text>

                <View style={styles.settingsCard}>
                  {(userMode === "veterinarian"
                    ? [
                        {
                          id: "approvals",
                          title: "موافقات المرضى",
                          description: "إشعارات موافقة أو رفض المرضى لطلبات المتابعة",
                          icon: <Check size={24} color={COLORS.primary} />,
                          enabled: true,
                        },
                        {
                          id: "appointments",
                          title: "المواعيد",
                          description: "تذكيرات بمواعيد المرضى والفحوصات",
                          icon: <Calendar size={24} color={COLORS.primary} />,
                          enabled: true,
                        },
                        {
                          id: "system",
                          title: "النظام",
                          description: "إشعارات النظام والتحديثات التقنية",
                          icon: <AlertCircle size={24} color={COLORS.primary} />,
                          enabled: true,
                        },
                        {
                          id: "advertisements",
                          title: "الإعلانات",
                          description: "عروض المنتجات والخدمات البيطرية",
                          icon: <ShoppingCart size={24} color={COLORS.primary} />,
                          enabled: false,
                        },
                      ]
                    : notificationSettings
                  ).map((setting, index, array) => (
                    <View key={setting.id}>
                      <View style={styles.settingItem}>
                        <View style={styles.settingContent}>
                          {setting.icon}
                          <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>{setting.title}</Text>
                            <Text style={styles.settingDescription}>{setting.description}</Text>
                          </View>
                        </View>
                        <Switch
                          value={setting.enabled}
                          onValueChange={() => toggleNotification(setting.id)}
                          trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                          thumbColor={setting.enabled ? COLORS.white : COLORS.darkGray}
                        />
                      </View>
                      {index < array.length - 1 && <View style={styles.separator} />}
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>إعدادات إضافية</Text>

                <View style={styles.additionalCard}>
                  <View style={styles.additionalItem}>
                    <Text style={styles.additionalTitle}>الصوت</Text>
                    <Text style={styles.additionalDescription}>تشغيل صوت عند وصول الإشعارات</Text>
                    <Switch
                      value={true}
                      trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                      thumbColor={COLORS.white}
                    />
                  </View>

                  <View style={styles.separator} />

                  <View style={styles.additionalItem}>
                    <Text style={styles.additionalTitle}>الاهتزاز</Text>
                    <Text style={styles.additionalDescription}>اهتزاز الجهاز عند وصول الإشعارات</Text>
                    <Switch
                      value={false}
                      trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                      thumbColor={COLORS.darkGray}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>معلومات مهمة</Text>
                <View style={styles.infoCard}>
                  {userMode === "veterinarian" ? (
                    <>
                      <Text style={styles.infoText}>• ستتلقى إشعارات فورية عند موافقة أو رفض المرضى لطلباتك</Text>
                      <Text style={styles.infoText}>• تذكيرات المواعيد تساعدك في إدارة جدولك اليومي</Text>
                      <Text style={styles.infoText}>• يمكنك إيقاف الإعلانات التجارية حسب تفضيلك</Text>
                      <Text style={styles.infoText}>• إشعارات النظام مهمة لمتابعة التحديثات الجديدة</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.infoText}>• يمكنك تخصيص أنواع الإشعارات التي تريد تلقيها</Text>
                      <Text style={styles.infoText}>• الإشعارات المهمة مثل المواعيد لا يمكن إيقافها</Text>
                      <Text style={styles.infoText}>• يمكنك تغيير هذه الإعدادات في أي وقت</Text>
                      <Text style={styles.infoText}>• بعض الإشعارات قد تتطلب إذن من نظام التشغيل</Text>
                    </>
                  )}
                </View>
              </View>
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
    backgroundColor: COLORS.white,
  },
  tabsContainer: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    margin: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.darkGray,
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 12,
    alignItems: "flex-end",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 4,
  },
  notificationClinic: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: "right",
    marginBottom: 2,
  },
  notificationDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    textAlign: "right",
    marginBottom: 16,
  },
  notificationActions: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  rejectButton: {
    borderColor: COLORS.error,
  },
  reportButton: {
    borderColor: COLORS.warning,
  },
  backButton: {
    padding: 8,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  headerText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
    marginTop: 12,
  },
  section: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "right",
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
  },
  settingInfo: {
    marginRight: 16,
    alignItems: "flex-end",
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "right",
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
  },
  additionalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  additionalItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  additionalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
    textAlign: "right",
  },
  additionalDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    flex: 2,
    textAlign: "right",
    marginRight: 12,
  },
  infoSection: {
    margin: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "right",
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: "right",
    marginBottom: 8,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  highPriorityNotification: {
    borderLeftColor: COLORS.error,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  approvalBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-end",
    marginTop: 8,
  },
  approvalBadgeText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "bold",
  },
  storeNotificationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  storeNotificationHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  storeNotificationInfo: {
    flex: 1,
    marginRight: 12,
    alignItems: "flex-end",
  },
  storeNotificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 4,
  },
  storeNotificationDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  storeProductInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },
  storeProductImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  storeProductDetails: {
    flex: 1,
    marginRight: 12,
    alignItems: "flex-end",
  },
  storeProductName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 4,
  },
  storeNotificationMessage: {
    fontSize: 13,
    color: COLORS.darkGray,
    textAlign: "right",
    lineHeight: 18,
  },
  storeNotificationActions: {
    alignItems: "flex-end",
  },
  storeActionButton: {
    paddingHorizontal: 20,
  },
});
