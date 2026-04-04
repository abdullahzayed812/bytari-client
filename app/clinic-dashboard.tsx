import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState, useMemo } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Search,
  Star,
  MapPin,
  Phone,
  Users,
  Stethoscope,
  Bell,
  Syringe,
  Settings,
  Heart,
  Send,
  X,
  Camera as CameraIcon,
  MessageCircle,
} from "lucide-react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/providers/AppProvider";
import { useToastContext } from "@/providers/ToastProvider";
import { ImageUploader } from "@/components/ImageUploader";
import { useI18n } from "@/providers/I18nProvider";

export default function ClinicDashboard() {
  const router = useRouter();
  const { user } = useApp();
  const { clinicId } = useLocalSearchParams();
  const { t } = useI18n();

  const { showToast } = useToastContext();
  const [searchQuery, setSearchQuery] = useState("");
  // camera permissions

  const [filteredAnimals, setFilteredAnimals] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [cameraRef, setCameraRef] = useState<React.LegacyRef<any> | null>(null); // reference to camera

  // use expo-camera hook for permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const handleOpenScanner = async () => {
    // if permission unknown or not granted, ask
    let granted = cameraPermission?.granted;
    if (!granted) {
      const res = await requestCameraPermission();
      granted = res.granted;
    }
    if (granted) {
      setScanned(false);
      setShowScanner(true);
    } else {
      Alert.alert("صلاحية الكاميرا", "لم يتم منح صلاحية الكاميرا. لا يمكن مسح الباركود.");
    }
  };
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageImage, setMessageImage] = useState("");

  const sendMessageMutation = useMutation(trpc.clinics.sendMessageToFollowers.mutationOptions());

  const handleSendMessage = async () => {
    if (!messageTitle.trim() || !messageBody.trim()) {
      showToast({ type: "error", message: t("clinic.dashboard.enterTitleAndMessage") });
      return;
    }
    try {
      const result = await sendMessageMutation.mutateAsync({
        clinicId: Number(clinicId),
        title: messageTitle.trim(),
        message: messageBody.trim(),
        ...(messageImage ? { imageUrl: messageImage } : {}),
      });
      showToast({ type: "success", message: `تم إرسال الرسالة إلى ${result.count} متابع` });
      setShowMessageModal(false);
      setMessageTitle("");
      setMessageBody("");
      setMessageImage("");
    } catch {
      showToast({ type: "error", message: "حدث خطأ أثناء إرسال الرسالة" });
    }
  };

  const { data: clinicData, isLoading: isClinicDataLoading } = useQuery({
    ...trpc.clinics.getDashboardData.queryOptions({ clinicId: Number(clinicId), userId: Number(user?.id) }),
    enabled: !!clinicId,
  });
  const clinic = useMemo(() => (clinicData as any)?.clinic, [clinicData]);
  const stats = useMemo(() => (clinicData as any)?.stats, [clinicData]);
  const access = useMemo(() => (clinicData as any)?.access, [clinicData]);
  const permissions = useMemo(() => (clinicData as any)?.permissions, [clinicData]);

  const { data: unreadData } = useQuery({
    ...trpc.clinics.chat.getUnreadCount.queryOptions({ clinicId: Number(clinicId) }),
    enabled: !!clinicId,
    refetchInterval: 30000,
  });
  const chatUnreadCount = (unreadData as any)?.count ?? 0;

  const { data: allPets, isLoading: isAllPetsLoading } = useQuery(trpc.pets.getAllPets.queryOptions({}));

  const { data: clinicPets, isLoading: isClinicPetsLoading } = useQuery({
    ...trpc.clinics.getLatestPets.queryOptions({
      clinicId: Number(clinicId),
      limit: 5, // Show 5 latest pets
    }),
    enabled: !!clinicId,
  });

  const isLoading = isClinicDataLoading || isAllPetsLoading || isClinicPetsLoading;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل بيانات العيادة...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "تحت العلاج":
        return COLORS.warning;
      case "متعافي":
        return COLORS.success;
      case "فحص دوري":
        return COLORS.primary;
      default:
        return COLORS.darkGray;
    }
  };

  const handleSearch = (query?: string, options: { updateInput?: boolean } = { updateInput: true }) => {
    const q = String(query ?? searchQuery ?? "");

    if (!q.trim()) {
      Alert.alert("تنبيه", "يرجى إدخال نص للبحث");
      return;
    }

    if (query !== undefined && options.updateInput) {
      setSearchQuery(q);
    }

    setIsSearching(true);

    const results = allPets?.pets?.filter((animal: any) => {
      const lower = q.toLowerCase();
      return (
        (animal.id && animal.id.toString().toLowerCase().includes(lower)) ||
        (animal.name && animal.name.toLowerCase().includes(lower)) ||
        (animal.owner && animal.owner.toLowerCase().includes(lower)) ||
        (animal.type && animal.type.toLowerCase().includes(lower)) ||
        (animal.breed && animal.breed.toLowerCase().includes(lower))
      );
    });

    setFilteredAnimals(results);

    if (results.length === 0) {
      Alert.alert("نتائج البحث", "لم يتم العثور على نتائج مطابقة للبحث");
      setSearchQuery("");
      setFilteredAnimals([]);
      setIsSearching(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setShowScanner(false);
    handleSearch(data, { updateInput: false });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredAnimals([]);
    setIsSearching(false);
  };

  // const handleReportsAndStats = () => {
  //   Alert.alert("التقارير والإحصائيات", "اختر نوع التقرير المطلوب:", [
  //     { text: "إلغاء", style: "cancel" },
  //     { text: "تقرير شهري", onPress: () => generateMonthlyReport() },
  //     { text: "إحصائيات العيادة", onPress: () => showClinicStats() },
  //     { text: "تقرير الحيوانات", onPress: () => generateAnimalsReport() },
  //   ]);
  // };

  // const generateMonthlyReport = () => {
  //   Alert.alert("تقرير شهري", "تم إنشاء التقرير الشهري بنجاح");
  // };

  // const showClinicStats = () => {
  //   Alert.alert(
  //     "إحصائيات العيادة",
  //     `إجمالي الحيوانات: ${clinicData?.stats?.totalAnimals}\nالمرضى النشطون: ${clinicData?.stats?.activePatients}\nالعلاجات المكتملة: ${clinicData?.stats?.completedTreatments}\nمعدل النجاح: 95%\nمتوسط الزيارات اليومية: 12`,
  //   );
  // };

  // const generateAnimalsReport = () => {
  //   Alert.alert("تقرير الحيوانات", "تم إنشاء تقرير الحيوانات بنجاح");
  // };

  const handleAllAnimals = () => {
    // Navigate directly to clinic animals page
    router.push({
      pathname: "/clinic-animals",
      params: {
        clinicId: clinic.id,
        clinicName: clinic?.name,
      },
    });
  };

  const handleAnimalPress = (animal: any) => {
    router.push({
      pathname: "/(tabs)/pet-details",
      params: {
        petId: animal.id,
        clinicId: clinic.id,
        clinicAccess: permissions?.canEditPets || access?.isOwner ? "true" : "false",
      },
    });
  };

  const renderAnimalItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.animalCard} activeOpacity={0.8} onPress={() => handleAnimalPress(item)}>
      <Image source={{ uri: item.image }} style={styles.animalImage} />
      <View style={styles.animalInfo}>
        <View style={styles.animalHeader}>
          <Text style={styles.animalName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.animalDetails}>
          {item.type} - {item.breed}
        </Text>
        <Text style={styles.animalAge}>العمر: {item.age}</Text>
        <Text style={styles.ownerName}>المالك: {item.owner}</Text>
        <Text style={styles.lastVisit}>آخر زيارة: {item.lastVisit}</Text>
        <Text style={styles.animalId}>ID: {item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>لوحة العيادة</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Clinic Info Card */}
          <View style={styles.clinicCard}>
            <View style={styles.clinicHeader}>
              <View style={styles.clinicIconContainer}>
                <Stethoscope size={32} color={COLORS.white} />
              </View>
              <View style={styles.clinicInfo}>
                <View style={styles.clinicNameRow}>
                  <Text style={styles.clinicName}>{clinic?.name}</Text>
                  {clinic?.isPremium && (
                    <View style={styles.premiumBadge}>
                      <Star size={12} color={COLORS.white} fill={COLORS.white} />
                      <Text style={styles.premiumText}>Premium</Text>
                    </View>
                  )}
                </View>
                <View style={styles.clinicDetailRow}>
                  <MapPin size={14} color={COLORS.darkGray} />
                  <Text style={styles.clinicDetailText}>{clinic?.address}</Text>
                </View>
                <View style={styles.clinicDetailRow}>
                  <Phone size={14} color={COLORS.darkGray} />
                  <Text style={styles.clinicDetailText}>{clinic?.phone}</Text>
                </View>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats?.totalAnimals}</Text>
                <Text style={styles.statLabel}>إجمالي الحيوانات</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats?.activePatients}</Text>
                <Text style={styles.statLabel}>المرضى النشطون</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats?.completedTreatments}</Text>
                <Text style={styles.statLabel}>العلاجات المكتملة</Text>
              </View>
            </View>
          </View>

          {/* Search Section */}
          {access?.hasAccess ? (
            <View style={styles.searchSection}>
              <Text style={styles.sectionTitle}>البحث عن حيوان</Text>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="ادخل رقم ID أو اسمه أو اسم المالك"
                  placeholderTextColor={COLORS.darkGray}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={[styles.searchButton, { marginRight: 6 }]} onPress={handleOpenScanner}>
                  <CameraIcon size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(searchQuery)}>
                  <Search size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Search Results or Recent Animals Section */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{isSearching ? "نتائج البحث" : "الحيوانات الأخيرة"}</Text>
              {isSearching ? (
                <TouchableOpacity onPress={clearSearch}>
                  <Text style={styles.clearSearchText}>مسح البحث</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => handleAllAnimals()}>
                  <Text style={styles.viewAllText}>عرض الكل</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={isSearching ? filteredAnimals : clinicPets?.pets?.slice(0, 3)}
              renderItem={renderAnimalItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                isSearching ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>لا توجد نتائج للبحث</Text>
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>لا توجد حيوانات متاحة للعيادة</Text>
                    <Text style={styles.emptySubtext}>يجب طلب صلاحية الوصول من مالكي الحيوانات أولاً</Text>
                  </View>
                )
              }
            />

            {/* Scanner modal */}
            <Modal visible={showScanner} transparent={false} animationType="slide">
              <View style={{ flex: 1 }}>
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  ref={(ref: any) => setCameraRef(ref)}
                  barCodeScannerSettings={{
                    barCodeTypes: [
                      "qr",
                      "ean13",
                      "code128",
                      "ean8",
                      "upc_e",
                      "upc_a",
                      // add any types your barcodes use
                    ],
                  }}
                />

                {/* Overlay rectangle */}
                <View style={styles.scanOverlay}>
                  <View style={styles.scanFrame} />
                </View>

                <TouchableOpacity
                  style={{ position: "absolute", top: 40, right: 20 }}
                  onPress={() => {
                    setShowScanner(false);
                    setScanned(false);
                  }}
                >
                  <X size={30} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </Modal>
          </View>
          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.settingCard}
                onPress={() => router.push({ pathname: "/clinic-followups", params: { clinicId: clinic?.id } })}
              >
                <Heart size={20} color={COLORS.error} />
                <Text style={styles.settingText}>المتابعات</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/clinic-today-cases")}>
                <ClipboardList size={24} color={COLORS.primary} />
                <Text style={styles.actionText}>حالات اليوم</Text>
              </TouchableOpacity> */}
              <TouchableOpacity style={styles.actionCard} onPress={() => handleAllAnimals()}>
                <Users size={24} color={COLORS.success} />
                <Text style={styles.actionText}>جميع الحيوانات</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() =>
                  router.push({
                    pathname: "/clinic-reminders",
                    params: {
                      clinicId: clinic.id,
                      clinicName: clinic?.name,
                    },
                  })
                }
              >
                <Bell size={24} color={COLORS.warning} />
                <Text style={styles.actionText}>تذكيرات الحيوانات</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() =>
                  router.push({
                    pathname: "/clinic-vaccinations",
                    params: {
                      clinicId: clinic.id,
                      clinicName: clinic?.name,
                    },
                  })
                }
              >
                <Syringe size={24} color={COLORS.error} />
                <Text style={styles.actionText}>التطعيمات</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() =>
                  router.push({ pathname: "/clinic-chats", params: { clinicId: clinic?.id } })
                }
              >
                <View style={{ position: "relative" }}>
                  <MessageCircle size={24} color={COLORS.primary} />
                  {chatUnreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>
                        {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.actionText}>المحادثات</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Section */}
          {access?.isOwner ? (
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>إعدادات العيادة</Text>
              <View style={styles.settingsGrid}>
                <TouchableOpacity
                  style={styles.settingCard}
                  onPress={() => router.push({ pathname: "/clinic-settings", params: { clinicId: clinic?.id } })}
                >
                  <Settings size={20} color={COLORS.primary} />
                  <Text style={styles.settingText}>إعدادات عامة</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingCard} onPress={() => setShowMessageModal(true)}>
                  <Send size={20} color={COLORS.primary} />
                  <Text style={styles.settingText}>إرسال رسالة للمتابعين</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <Modal visible={showMessageModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>إرسال رسالة للمتابعين</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="عنوان الرسالة"
                value={messageTitle}
                onChangeText={setMessageTitle}
                textAlign="right"
              />
              <TextInput
                style={[styles.modalInput, { height: 100, textAlignVertical: "top" }]}
                placeholder="نص الرسالة"
                value={messageBody}
                onChangeText={setMessageBody}
                multiline
                textAlign="right"
              />
              <ImageUploader
                imageUri={messageImage}
                onUploadComplete={setMessageImage}
                label="صورة (اختياري)"
                aspect={[16, 9]}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
                  onPress={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.modalButtonText}>إرسال</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: COLORS.darkGray }]}
                  onPress={() => setShowMessageModal(false)}
                >
                  <Text style={styles.modalButtonText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
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
    flexDirection: "row-reverse",
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
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  clinicCard: {
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
  clinicHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 20,
  },
  clinicIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  clinicInfo: {
    flex: 1,
    marginRight: 16,
  },
  clinicNameRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  clinicName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  premiumBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  clinicDetailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  clinicDetailText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  statsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  searchSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "left",
  },
  searchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "left",
  },
  searchButton: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    padding: 12,
    marginLeft: 4,
  },
  recentSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  animalCard: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  animalInfo: {
    flex: 1,
    marginRight: 12,
  },
  animalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  animalName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  animalDetails: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  animalAge: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  lastVisit: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  animalId: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "bold",
    marginTop: 2,
  },
  clearSearchText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  actionsSection: {
    marginBottom: 24,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  settingCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 80,
    justifyContent: "center",
  },
  settingText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.black,
    marginTop: 6,
    textAlign: "center",
  },
  actionsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginTop: 8,
    textAlign: "center",
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    textAlign: "right",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 180,
    borderWidth: 3,
    borderColor: COLORS.white,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
});
