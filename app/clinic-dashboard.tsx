import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, FlatList, Alert, Modal, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState, useMemo, useCallback } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams, useFocusEffect } from "expo-router";
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
  ChevronDown,
  ChevronUp,
  Calendar,
  ClipboardList,
  Zap,
  UserCircle,
  BarChart2,
  Package,
  UserCog,
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
  const [showPetsList, setShowPetsList] = useState(true);
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
  const [messageLinkUrl, setMessageLinkUrl] = useState("");
  const [messageModalType, setMessageModalType] = useState<"followers" | "visitors">("followers");

  const sendToFollowersMutation = useMutation(trpc.clinics.sendMessageToFollowers.mutationOptions());
  const sendToVisitorsMutation = useMutation(trpc.clinics.sendMessageToVisitors.mutationOptions());

  const handleSendMessage = async () => {
    if (!messageTitle.trim() || !messageBody.trim()) {
      showToast({ type: "error", message: t("clinic.dashboard.enterTitleAndMessage") });
      return;
    }
    try {
      const payload = {
        clinicId: Number(clinicId),
        title: messageTitle.trim(),
        message: messageBody.trim(),
        ...(messageImage ? { imageUrl: messageImage } : {}),
        ...(messageLinkUrl.trim() ? { linkUrl: messageLinkUrl.trim() } : {}),
      };
      const result = messageModalType === "visitors" ? await sendToVisitorsMutation.mutateAsync(payload) : await sendToFollowersMutation.mutateAsync(payload);
      const audienceLabel = messageModalType === "visitors" ? "مراجع" : "متابع";
      showToast({ type: "success", message: `تم إرسال الرسالة إلى ${result.count} ${audienceLabel}` });
      setShowMessageModal(false);
      setMessageTitle("");
      setMessageBody("");
      setMessageImage("");
      setMessageLinkUrl("");
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

  const { data: unreadData, refetch: refetchUnread } = useQuery({
    ...trpc.clinics.chat.getUnreadCount.queryOptions({ clinicId: Number(clinicId) }),
    enabled: !!clinicId,
    refetchInterval: 30000,
  });
  const chatUnreadCount = (unreadData as any)?.count ?? 0;

  useFocusEffect(
    useCallback(() => {
      refetchUnread();
    }, [refetchUnread]),
  );

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
        fromClinic: "true",
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

  const renderHorizontalPetCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.horizontalPetCard} activeOpacity={0.8} onPress={() => handleAnimalPress(item)}>
      <Image source={{ uri: item.image }} style={styles.horizontalPetImage} />
      <Text style={styles.horizontalPetName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.horizontalPetType} numberOfLines={1}>{item.type}</Text>
      <Text style={styles.horizontalPetOwner} numberOfLines={1}>{item.owner}</Text>
      <Text style={styles.horizontalPetDate} numberOfLines={1}>{item.lastVisit}</Text>
      <View style={styles.horizontalPetBadges}>
        {item.hasMedical && (
          <View style={[styles.activityBadge, { backgroundColor: "#E8F5E9" }]}>
            <ClipboardList size={11} color={COLORS.success} />
          </View>
        )}
        {item.hasVaccination && (
          <View style={[styles.activityBadge, { backgroundColor: "#E3F2FD" }]}>
            <Syringe size={11} color={COLORS.primary} />
          </View>
        )}
        {item.hasReminder && (
          <View style={[styles.activityBadge, { backgroundColor: "#FFF3E0" }]}>
            <Bell size={11} color={COLORS.warning} />
          </View>
        )}
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
              <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12 }}>
                {isSearching ? (
                  <TouchableOpacity onPress={clearSearch}>
                    <Text style={styles.clearSearchText}>مسح البحث</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => handleAllAnimals()}>
                    <Text style={styles.viewAllText}>عرض الكل</Text>
                  </TouchableOpacity>
                )}
                {!isSearching && (
                  <TouchableOpacity onPress={() => setShowPetsList((v) => !v)}>
                    {showPetsList ? <ChevronUp size={20} color={COLORS.darkGray} /> : <ChevronDown size={20} color={COLORS.darkGray} />}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {isSearching && (
              <FlatList
                data={filteredAnimals}
                renderItem={renderAnimalItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>لا توجد نتائج للبحث</Text>
                  </View>
                }
              />
            )}

            {!isSearching && showPetsList && (
              <FlatList
                data={clinicPets?.pets?.slice(0, 5)}
                renderItem={renderHorizontalPetCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalPetList}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>لا توجد حيوانات سجلت بيانات في هذه العيادة</Text>
                  </View>
                }
              />
            )}

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
          {/* Today's Stats */}
          <View style={styles.todayStatsSection}>
            <Text style={styles.sectionTitle}>إحصائيات اليوم</Text>
            <View style={styles.todayStatsGrid}>
              <View style={[styles.todayStatCard, { backgroundColor: "#FFF3E0" }]}>
                <Bell size={20} color={COLORS.warning} />
                <Text style={[styles.todayStatNumber, { color: COLORS.warning }]}>{stats?.todayReminders ?? 0}</Text>
                <Text style={styles.todayStatLabel}>تذكيرات اليوم</Text>
              </View>
              <View style={[styles.todayStatCard, { backgroundColor: "#E8F5E9" }]}>
                <Syringe size={20} color={COLORS.success} />
                <Text style={[styles.todayStatNumber, { color: COLORS.success }]}>{stats?.todayVaccinations ?? 0}</Text>
                <Text style={styles.todayStatLabel}>تطعيمات اليوم</Text>
              </View>
              <View style={[styles.todayStatCard, { backgroundColor: "#E3F2FD" }]}>
                <Calendar size={20} color={COLORS.primary} />
                <Text style={[styles.todayStatNumber, { color: COLORS.primary }]}>{stats?.todayAppointments ?? 0}</Text>
                <Text style={styles.todayStatLabel}>مواعيد اليوم</Text>
              </View>
              <View style={[styles.todayStatCard, { backgroundColor: "#FCE4EC" }]}>
                <UserCircle size={20} color={COLORS.error} />
                <Text style={[styles.todayStatNumber, { color: COLORS.error }]}>{stats?.todayVisitors ?? 0}</Text>
                <Text style={styles.todayStatLabel}>المراجعين اليوم</Text>
              </View>
              <View style={[styles.todayStatCard, { backgroundColor: "#F3E5F5" }]}>
                <Users size={20} color="#9C27B0" />
                <Text style={[styles.todayStatNumber, { color: "#9C27B0" }]}>{stats?.totalDistinctAnimals ?? 0}</Text>
                <Text style={styles.todayStatLabel}>إجمالي الحيوانات</Text>
              </View>
            </View>
          </View>

          {/* Today's Tasks Panel */}
          <View style={styles.todayTasksSection}>
            <View style={styles.todayTasksHeader}>
              <Text style={styles.sectionTitle}>مهام اليوم</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: "/clinic-appointments", params: { clinicId: clinic?.id, clinicName: clinic?.name } })}>
                <Text style={styles.viewAllText}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.todayTasksList}>
              <TouchableOpacity
                style={styles.todayTaskRow}
                onPress={() => router.push({ pathname: "/clinic-appointments", params: { clinicId: clinic?.id, clinicName: clinic?.name } })}
              >
                <View style={[styles.todayTaskDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.todayTaskLabel}>مواعيد اليوم</Text>
                <View style={styles.todayTaskRight}>
                  <View style={[styles.todayTaskBadge, { backgroundColor: (stats?.todayAppointments ?? 0) > 0 ? "#E3F2FD" : COLORS.lightGray }]}>
                    <Text style={[styles.todayTaskBadgeText, { color: (stats?.todayAppointments ?? 0) > 0 ? COLORS.primary : COLORS.darkGray }]}>
                      {stats?.todayAppointments ?? 0}
                    </Text>
                  </View>
                  <ChevronDown size={16} color={COLORS.darkGray} style={{ transform: [{ rotate: "-90deg" }] }} />
                </View>
              </TouchableOpacity>

              <View style={styles.todayTaskDivider} />

              <TouchableOpacity
                style={styles.todayTaskRow}
                onPress={() => router.push({ pathname: "/clinic-vaccinations", params: { clinicId: clinic?.id, clinicName: clinic?.name } })}
              >
                <View style={[styles.todayTaskDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.todayTaskLabel}>تطعيمات اليوم</Text>
                <View style={styles.todayTaskRight}>
                  <View style={[styles.todayTaskBadge, { backgroundColor: (stats?.todayVaccinations ?? 0) > 0 ? "#E8F5E9" : COLORS.lightGray }]}>
                    <Text style={[styles.todayTaskBadgeText, { color: (stats?.todayVaccinations ?? 0) > 0 ? COLORS.success : COLORS.darkGray }]}>
                      {stats?.todayVaccinations ?? 0}
                    </Text>
                  </View>
                  <ChevronDown size={16} color={COLORS.darkGray} style={{ transform: [{ rotate: "-90deg" }] }} />
                </View>
              </TouchableOpacity>

              <View style={styles.todayTaskDivider} />

              <TouchableOpacity
                style={styles.todayTaskRow}
                onPress={() => router.push({ pathname: "/clinic-reminders", params: { clinicId: clinic?.id, clinicName: clinic?.name } })}
              >
                <View style={[styles.todayTaskDot, { backgroundColor: COLORS.warning }]} />
                <Text style={styles.todayTaskLabel}>تذكيرات اليوم</Text>
                <View style={styles.todayTaskRight}>
                  <View style={[styles.todayTaskBadge, { backgroundColor: (stats?.todayReminders ?? 0) > 0 ? "#FFF3E0" : COLORS.lightGray }]}>
                    <Text style={[styles.todayTaskBadgeText, { color: (stats?.todayReminders ?? 0) > 0 ? COLORS.warning : COLORS.darkGray }]}>
                      {stats?.todayReminders ?? 0}
                    </Text>
                  </View>
                  <ChevronDown size={16} color={COLORS.darkGray} style={{ transform: [{ rotate: "-90deg" }] }} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Access Grid */}
          <View style={styles.carouselSection}>
            <Text style={styles.sectionTitle}>الوصول السريع</Text>
            <View style={styles.quickGrid}>
              <TouchableOpacity
                style={[styles.quickCard, { backgroundColor: "#E3F2FD" }]}
                onPress={() => router.push({ pathname: "/clinic-quick-review", params: { clinicId: clinic?.id } })}
              >
                <Zap size={30} color={COLORS.primary} />
                <Text style={styles.quickLabel}>مراجعة سريعة</Text>
                <Text style={styles.quickCount}>{stats?.medicalAnimals ?? 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickCard, { backgroundColor: "#E8F5E9" }]}
                onPress={() => router.push({ pathname: "/clinic-full-exam", params: { clinicId: clinic?.id } })}
              >
                <ClipboardList size={30} color={COLORS.success} />
                <Text style={styles.quickLabel}>فحص كامل</Text>
                <Text style={styles.quickCount}>{stats?.medicalAnimals ?? 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickCard, { backgroundColor: "#FFF8E1" }]} onPress={handleAllAnimals}>
                <Users size={30} color="#FF9800" />
                <Text style={styles.quickLabel}>جميع الحيوانات</Text>
                <Text style={styles.quickCount}>{stats?.totalDistinctAnimals ?? 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickCard, { backgroundColor: "#FCE4EC" }]}
                onPress={() => router.push({ pathname: "/clinic-appointments", params: { clinicId: clinic?.id, clinicName: clinic?.name } })}
              >
                <View style={{ position: "relative" }}>
                  <Calendar size={30} color={COLORS.error} />
                  {(stats?.unreadAppointmentRequests ?? 0) > 0 && (
                    <View style={styles.carouselBadge}>
                      <Text style={styles.carouselBadgeText}>{stats?.unreadAppointmentRequests}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.quickLabel}>المواعيد</Text>
                <Text style={styles.quickCount}>{stats?.appointmentAnimals ?? 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickCard, { backgroundColor: "#E8F5E9" }]}
                onPress={() => router.push({ pathname: "/clinic-vaccinations", params: { clinicId: clinic?.id, clinicName: clinic?.name } })}
              >
                <View style={{ position: "relative" }}>
                  <Syringe size={30} color={COLORS.success} />
                  {(stats?.todayVaccinations ?? 0) > 0 && (
                    <View style={styles.carouselBadge}>
                      <Text style={styles.carouselBadgeText}>{stats?.todayVaccinations}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.quickLabel}>التطعيمات</Text>
                <Text style={styles.quickCount}>{stats?.vaccinationAnimals ?? 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickCard, { backgroundColor: "#FFF3E0" }]}
                onPress={() => router.push({ pathname: "/clinic-reminders", params: { clinicId: clinic?.id, clinicName: clinic?.name } })}
              >
                <View style={{ position: "relative" }}>
                  <Bell size={30} color={COLORS.warning} />
                  {(stats?.todayReminders ?? 0) > 0 && (
                    <View style={styles.carouselBadge}>
                      <Text style={styles.carouselBadgeText}>{stats?.todayReminders}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.quickLabel}>التذكيرات</Text>
                <Text style={styles.quickCount}>{stats?.reminderAnimals ?? 0}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Settings (owner only) */}
          {access?.isOwner ? (
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>الإعدادات السريعة</Text>
              <View style={styles.settingsGrid}>
                <TouchableOpacity
                  style={styles.settingCard}
                  onPress={() => router.push({ pathname: "/clinic-quick-review-settings", params: { clinicId: clinic?.id } })}
                >
                  <Zap size={20} color={COLORS.primary} />
                  <Text style={styles.settingText}>إعدادات المراجعة السريعة</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingCard}
                  onPress={() => {
                    setMessageModalType("visitors");
                    setShowMessageModal(true);
                  }}
                >
                  <Send size={20} color="#FF9800" />
                  <Text style={styles.settingText}>إرسال رسالة للمراجعين</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingCard}
                  onPress={() => {
                    setMessageModalType("followers");
                    setShowMessageModal(true);
                  }}
                >
                  <Send size={20} color={COLORS.primary} />
                  <Text style={styles.settingText}>إرسال رسالة للمتابعين</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingCard} onPress={() => router.push({ pathname: "/clinic-chats", params: { clinicId: clinic?.id } })}>
                  <View style={{ position: "relative" }}>
                    <MessageCircle size={20} color={COLORS.primary} />
                    {chatUnreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{chatUnreadCount > 99 ? "99+" : chatUnreadCount}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.settingText}>المحادثات</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingCard} onPress={() => Alert.alert("إدارة المخزون", "هذه الميزة قيد التطوير وستكون متاحة قريباً")}>
                  <Package size={20} color={COLORS.darkGray} />
                  <Text style={styles.settingText}>إدارة المخزون</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingCard} onPress={() => router.push({ pathname: "/clinic-staff", params: { clinicId: clinic?.id } })}>
                  <UserCog size={20} color={COLORS.success} />
                  <Text style={styles.settingText}>إدارة المستخدمين والأطباء</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingCard} onPress={() => Alert.alert("التقارير والإحصائيات", "هذه الميزة قيد التطوير وستكون متاحة قريباً")}>
                  <BarChart2 size={20} color={COLORS.warning} />
                  <Text style={styles.settingText}>التقارير والإحصائيات</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingCard} onPress={() => router.push({ pathname: "/clinic-settings", params: { clinicId: clinic?.id } })}>
                  <Settings size={20} color={COLORS.primary} />
                  <Text style={styles.settingText}>إعدادات العيادة</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <Modal visible={showMessageModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{messageModalType === "visitors" ? "إرسال رسالة للمراجعين" : "إرسال رسالة للمتابعين"}</Text>
              <TextInput style={styles.modalInput} placeholder="عنوان الرسالة" value={messageTitle} onChangeText={setMessageTitle} textAlign="right" />
              <TextInput
                style={[styles.modalInput, { height: 100, textAlignVertical: "top" }]}
                placeholder="نص الرسالة"
                value={messageBody}
                onChangeText={setMessageBody}
                multiline
                textAlign="right"
              />
              <ImageUploader imageUri={messageImage} onUploadComplete={setMessageImage} label="صورة (اختياري)" aspect={[16, 9]} />
              <TextInput
                style={styles.modalInput}
                placeholder="رابط (اختياري) https://..."
                value={messageLinkUrl}
                onChangeText={setMessageLinkUrl}
                textAlign="left"
                autoCapitalize="none"
                keyboardType="url"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
                  onPress={handleSendMessage}
                  disabled={sendToFollowersMutation.isPending || sendToVisitorsMutation.isPending}
                >
                  {sendToFollowersMutation.isPending || sendToVisitorsMutation.isPending ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.modalButtonText}>إرسال</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: COLORS.darkGray }]} onPress={() => setShowMessageModal(false)}>
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
  horizontalPetList: {
    paddingBottom: 4,
    gap: 10,
  },
  horizontalPetCard: {
    width: 130,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horizontalPetImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  horizontalPetName: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 2,
  },
  horizontalPetType: {
    fontSize: 11,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 2,
  },
  horizontalPetOwner: {
    fontSize: 10,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 2,
  },
  horizontalPetDate: {
    fontSize: 10,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 6,
  },
  horizontalPetBadges: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
  },
  activityBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
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
  todayStatsSection: {
    marginBottom: 24,
  },
  todayStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  todayStatCard: {
    width: "30%",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 4,
    minHeight: 88,
    justifyContent: "center",
  },
  todayStatNumber: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 2,
  },
  todayStatLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    textAlign: "center",
    fontWeight: "500",
  },
  todayTasksSection: {
    marginBottom: 24,
  },
  todayTasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  todayTasksList: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  todayTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  todayTaskDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  todayTaskLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
    fontWeight: "500",
  },
  todayTaskRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  todayTaskBadge: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignItems: "center",
  },
  todayTaskBadgeText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  todayTaskDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  carouselSection: {
    marginBottom: 24,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickCard: {
    width: "30.5%",
    padding: 8,
    // aspectRatio: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.black,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  quickCount: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: "center",
  },
  carouselBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  carouselBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "bold",
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsGrid: {
    flexDirection: "row",
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
