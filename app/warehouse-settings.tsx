import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Shield, Clock, Users, MapPin, Phone, Calendar, RefreshCw, Package } from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  StoreBasicInfoModal,
  StoreContactInfoModal,
  StoreWorkingHoursModal,
  AddStoreStaffModal,
  ManageStoreStaffModal,
  StorePermissionsModal,
} from "../components/store-settings-modals";

export default function StoreSettings() {
  const router = useRouter();
  const { warehouseId: storeId } = useLocalSearchParams();

  // Modal states
  const [basicInfoModalVisible, setBasicInfoModalVisible] = useState(false);
  const [contactInfoModalVisible, setContactInfoModalVisible] = useState(false);
  const [workingHoursModalVisible, setWorkingHoursModalVisible] = useState(false);
  const [addStaffModalVisible, setAddStaffModalVisible] = useState(false);
  const [manageStaffModalVisible, setManageStaffModalVisible] = useState(false);
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);

  // Get store settings
  const {
    data: storeData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.stores.settings.getSettings.queryOptions({
      storeId: Number(storeId),
    })
  );

  // Get subscription status
  const { data: subscriptionData } = useQuery(
    trpc.stores.settings.getSubscription.queryOptions({
      storeId: Number(storeId),
    })
  );

  // Get store staff
  const { data: staffData, refetch: refetchStaff } = useQuery(
    trpc.stores.settings.staff.getStaff.queryOptions({
      storeId: Number(storeId),
    })
  );

  // Mutations
  const updateBasicInfoMutation = useMutation(trpc.stores.settings.updateBasicInfo.mutationOptions());
  const updateContactInfoMutation = useMutation(trpc.stores.settings.updateContactInfo.mutationOptions());
  const updateWorkingHoursMutation = useMutation(trpc.stores.settings.updateWorkingHours.mutationOptions());
  const addStaffMutation = useMutation(trpc.stores.settings.staff.addStaff.mutationOptions());
  const removeStaffMutation = useMutation(trpc.stores.settings.staff.removeStaff.mutationOptions());
  const updatePermissionsMutation = useMutation(trpc.stores.settings.staff.updatePermissions.mutationOptions());
  const requestRenewalMutation = useMutation(trpc.stores.settings.requestRenewal.mutationOptions());

  const store = storeData?.store;
  const subscription = subscriptionData?.subscription;
  const staff = staffData?.staff || [];

  // Handle basic info save
  const queryClient = useQueryClient();
  const handleBasicInfoSave = (data: any) => {
    updateBasicInfoMutation.mutate(
      {
        storeId: Number(storeId),
        ...data,
      },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم تحديث المعلومات الأساسية بنجاح");
          setBasicInfoModalVisible(false);
          refetch();
          // Invalidate queries to refresh data on other screens
          queryClient.invalidateQueries(trpc.stores.getUserApprovedStores.queryKey);
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message);
        },
      }
    );
  };

  // Handle contact info save
  const handleContactInfoSave = (data: any) => {
    updateContactInfoMutation.mutate(
      {
        storeId: Number(storeId),
        ...data,
      },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم تحديث معلومات الاتصال بنجاح");
          setContactInfoModalVisible(false);
          refetch();
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message);
        },
      }
    );
  };

  // Handle working hours save
  const handleWorkingHoursSave = (workingHours: any) => {
    updateWorkingHoursMutation.mutate(
      {
        storeId: Number(storeId),
        workingHours,
      },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم تحديث ساعات العمل بنجاح");
          setWorkingHoursModalVisible(false);
          refetch();
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message);
        },
      }
    );
  };

  // Handle add staff
  const handleAddStaff = (data: any) => {
    addStaffMutation.mutate(
      {
        storeId: Number(storeId),
        ...data,
      },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم إضافة الموظف بنجاح");
          setAddStaffModalVisible(false);
          refetchStaff();
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message);
        },
      }
    );
  };

  // Handle remove staff
  const handleRemoveStaff = (veterinarianId: number) => {
    removeStaffMutation.mutate(
      {
        storeId: Number(storeId),
        veterinarianId,
      },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم إزالة الموظف بنجاح");
          refetchStaff();
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message);
        },
      }
    );
  };

  // Handle save permissions
  const handleSavePermissions = (permissions: any) => {
    updatePermissionsMutation.mutate(
      { storeId: Number(storeId), permissions },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم تحديث الصلاحيات بنجاح");
          setPermissionsModalVisible(false);
          refetchStaff();
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message);
        },
      }
    );
  };

  const handleSettingPress = (settingType: string) => {
    switch (settingType) {
      case "store-info":
        setBasicInfoModalVisible(true);
        break;
      case "contact-info":
        setContactInfoModalVisible(true);
        break;
      case "working-hours":
        setWorkingHoursModalVisible(true);
        break;
      case "staff-management":
        setManageStaffModalVisible(true);
        break;
      case "permissions":
        setPermissionsModalVisible(true);
        break;
    }
  };

  const handleRenewSubscription = () => {
    // Check if already has pending renewal
    if (subscription?.hasPendingRenewal) {
      Alert.alert("طلب قيد المراجعة", "يوجد طلب تجديد قيد المراجعة بالفعل. سيتم إشعارك عند الموافقة عليه.");
      return;
    }

    Alert.alert(
      "تأكيد التجديد",
      "هل تريد إرسال طلب تجديد اشتراك المذخر لمدة سنة إضافية؟\n\nسيتم مراجعة الطلب من قبل الإدارة.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد",
          onPress: () => {
            requestRenewalMutation.mutate(
              { storeId: Number(storeId) },
              {
                onSuccess: () => {
                  Alert.alert(
                    "تم بنجاح",
                    "تم إرسال طلب التجديد بنجاح. سيتم مراجعته من قبل الإدارة وسيتم إشعارك عند الموافقة.",
                    [
                      {
                        text: "حسناً",
                        onPress: () => {
                          // Refresh subscription data
                          refetch();
                        },
                      },
                    ]
                  );
                },
                onError: (error) => {
                  Alert.alert("خطأ", error.message);
                },
              }
            );
          },
        },
      ]
    );
  };

  const settingsGroups = [
    {
      title: "معلومات المذخر",
      items: [
        {
          id: "store-info",
          title: "معلومات أساسية",
          subtitle: "اسم المذخر، العنوان، الوصف",
          icon: MapPin,
          onPress: () => handleSettingPress("store-info"),
        },
        {
          id: "contact-info",
          title: "معلومات الاتصال",
          subtitle: "الهاتف، البريد الإلكتروني، الموقع",
          icon: Phone,
          onPress: () => handleSettingPress("contact-info"),
        },
        {
          id: "working-hours",
          title: "ساعات العمل",
          subtitle: "أوقات فتح وإغلاق المذخر",
          icon: Clock,
          onPress: () => handleSettingPress("working-hours"),
        },
      ],
    },
    {
      title: "إدارة الموظفين",
      items: [
        {
          id: "staff-management",
          title: "إدارة الموظفين",
          subtitle: `${staff.length} موظف`,
          icon: Users,
          onPress: () => handleSettingPress("staff-management"),
        },
        {
          id: "permissions",
          title: "الصلاحيات",
          subtitle: "تحديد صلاحيات الوصول للموظفين",
          icon: Shield,
          onPress: () => handleSettingPress("permissions"),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    return (
      <TouchableOpacity key={item.id} style={styles.settingItem} onPress={item.onPress} activeOpacity={0.7}>
        <View style={styles.settingContent}>
          <View style={styles.settingIcon}>
            <item.icon size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <ArrowLeft size={16} color={COLORS.darkGray} style={{ transform: [{ rotate: "180deg" }] }} />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: COLORS.error }}>حدث خطأ: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إعدادات المذخر</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Store Info Card */}
          <View style={styles.storeCard}>
            <View style={styles.storeHeader}>
              <View style={styles.storeIconContainer}>
                <Package size={24} color={COLORS.white} />
              </View>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store?.name || "مذخر"}</Text>
                <Text style={styles.storeStatus}>{subscription?.isActive ? "نشط" : "غير نشط"} - Premium</Text>
              </View>
            </View>
          </View>

          {/* Subscription Settings */}
          {subscription && (
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <Calendar size={20} color={COLORS.primary} />
                <Text style={styles.subscriptionTitle}>إعدادات الاشتراك</Text>
              </View>

              <View style={styles.subscriptionContent}>
                <View
                  style={[
                    styles.subscriptionBadge,
                    {
                      backgroundColor: subscription.isActive ? COLORS.success : COLORS.error,
                    },
                  ]}
                >
                  <Text style={styles.subscriptionBadgeText}>
                    {subscription.status === "expiring_soon"
                      ? "قريب الانتهاء"
                      : subscription.status_under_treatment === "active"
                        ? "نشط"
                        : "غير نشط"}
                  </Text>
                </View>
                <Text style={styles.subscriptionPlan}>اشتراك المذخر المميز</Text>

                <View style={styles.subscriptionDates}>
                  {subscription.startDate && (
                    <View style={styles.dateItem}>
                      <Calendar size={16} color={COLORS.darkGray} />
                      <Text style={styles.dateLabel}>تاريخ البدء:</Text>
                      <Text style={styles.dateValue}>
                        {new Date(subscription.startDate).toLocaleDateString("ar-EG")}
                      </Text>
                    </View>
                  )}

                  {subscription.endDate && (
                    <View style={styles.dateItem}>
                      <Calendar size={16} color={COLORS.darkGray} />
                      <Text style={styles.dateLabel}>تاريخ الانتهاء:</Text>
                      <Text style={styles.dateValue}>{new Date(subscription.endDate).toLocaleDateString("ar-EG")}</Text>
                    </View>
                  )}

                  {subscription.daysRemaining !== null && (
                    <View style={styles.dateItem}>
                      <Calendar size={16} color={COLORS.darkGray} />
                      <Text style={styles.dateLabel}>الأيام المتبقية:</Text>
                      <Text
                        style={[
                          styles.dateValue,
                          {
                            color: subscription.daysRemaining < 30 ? COLORS.warning : COLORS.success,
                          },
                        ]}
                      >
                        {subscription.daysRemaining} يوم
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.subscriptionActions}>
                  <TouchableOpacity
                    style={[styles.renewButton, requestRenewalMutation.isPending && { opacity: 0.6 }]}
                    onPress={handleRenewSubscription}
                    disabled={requestRenewalMutation.isPending || subscription?.needsRenewal}
                  >
                    {requestRenewalMutation.isPending ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <>
                        <RefreshCw size={16} color={COLORS.white} />
                        <Text style={styles.renewButtonText}>
                          {subscription?.needsRenewal ? "قيد المراجعة" : "تجديد الاشتراك"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.followUpButton}
                    onPress={() => Alert.alert("متابعة الاشتراك", "عرض تفاصيل الاشتراك والفواتير")}
                  >
                    <Text style={styles.followUpButtonText}>متابعة الاشتراك</Text>
                  </TouchableOpacity>
                </View>

                {subscription?.needsRenewal && (
                  <View style={styles.pendingRenewalBanner}>
                    <View style={styles.pendingRenewalIcon}>
                      <Clock size={16} color={COLORS.warning} />
                    </View>
                    <Text style={styles.pendingRenewalText}>يوجد طلب تجديد قيد المراجعة</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Settings Groups */}
          {settingsGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.settingsGroup}>
              <View style={styles.groupTitleContainer}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                {group.title === "إدارة الموظفين" && (
                  <TouchableOpacity style={styles.addButton} onPress={() => setAddStaffModalVisible(true)}>
                    <Text style={styles.addButtonText}>+ إضافة</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.groupContainer}>
                {group.items.map((item, itemIndex) => (
                  <View key={item.id}>
                    {renderSettingItem(item)}
                    {itemIndex < group.items.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      {store && (
        <>
          <StoreBasicInfoModal
            visible={basicInfoModalVisible}
            onClose={() => setBasicInfoModalVisible(false)}
            initialData={{
              name: store.name,
              address: store.address,
              description: store.description,
              category: store.category,
              latitude: store.latitude,
              longitude: store.longitude,
              images: typeof store.images === "string" ? JSON.parse(store.images) : store.images || [],
            }}
            onSave={handleBasicInfoSave}
            isLoading={updateBasicInfoMutation.isPending}
          />

          <StoreContactInfoModal
            visible={contactInfoModalVisible}
            onClose={() => setContactInfoModalVisible(false)}
            initialData={{
              phone: store.phone || "",
              email: store.email,
              website: store.website,
            }}
            onSave={handleContactInfoSave}
            isLoading={updateContactInfoMutation.isPending}
          />

          <StoreWorkingHoursModal
            visible={workingHoursModalVisible}
            onClose={() => setWorkingHoursModalVisible(false)}
            initialData={store.workingHours}
            onSave={handleWorkingHoursSave}
            isLoading={updateWorkingHoursMutation.isPending}
          />
        </>
      )}

      <AddStoreStaffModal
        visible={addStaffModalVisible}
        onClose={() => setAddStaffModalVisible(false)}
        onSave={handleAddStaff}
        isLoading={addStaffMutation.isPending}
      />

      <ManageStoreStaffModal
        visible={manageStaffModalVisible}
        onClose={() => setManageStaffModalVisible(false)}
        staff={staff}
        onRemove={handleRemoveStaff}
        isLoading={removeStaffMutation.isPending}
      />

      <StorePermissionsModal
        visible={permissionsModalVisible}
        onClose={() => setPermissionsModalVisible(false)}
        staff={staff}
        onSave={handleSavePermissions}
        isLoading={updatePermissionsMutation.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  storeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  storeHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  storeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  storeInfo: {
    flex: 1,
    marginRight: 16,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  storeStatus: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: "600",
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitleContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  groupContainer: {
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 2,
    textAlign: "right",
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
  },
  subscriptionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  subscriptionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  subscriptionContent: {
    gap: 12,
  },
  subscriptionBadge: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  subscriptionPlan: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "right",
  },
  subscriptionDates: {
    gap: 8,
  },
  dateItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: "right",
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  subscriptionActions: {
    flexDirection: "row-reverse",
    gap: 12,
    marginTop: 8,
  },
  renewButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  renewButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  followUpButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  followUpButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },

  pendingRenewalBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFF4E5",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  pendingRenewalIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.warning + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  pendingRenewalText: {
    fontSize: 13,
    color: COLORS.warning,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
});
