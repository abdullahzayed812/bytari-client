import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack } from "expo-router";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Plus,
  Edit,
  Award,
  Heart,
  Bell,
  Building2,
  ExternalLink,
  Megaphone,
  Users,
  FileText,
  Calendar,
} from "lucide-react-native";

import { useApp } from "../providers/AppProvider";
import { trpc } from "../lib/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";

interface Hospital {
  id: number;
  name: string;
  location: string;
  province: string;
  phone: string;
  workingHours: string;
  description: string;
  specialties: string[];
  image: string;
  rating: number;
  isMain: boolean;
  status: string;
  followersCount: number;
  announcementsCount: number;
}

interface Announcement {
  id: number;
  hospitalId: number;
  title: string;
  content: string;
  type: "news" | "announcement" | "event";
  image?: string;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function VetHospitalsScreen() {
  const router = useRouter();
  const { isSuperAdmin, isAuthenticated, isModerator, moderatorPermissions } = useApp();
  const [showProvinceHospitals, setShowProvinceHospitals] = useState<boolean>(false);
  const [followedHospitals, setFollowedHospitals] = useState<number[]>([]);

  // tRPC queries and mutations
  const { data: mainHospitalData, isLoading: mainHospitalLoading } = useQuery(
    trpc.hospitals.getMainHospital.queryOptions({})
  );
  const { data: provinceHospitalsData, isLoading: provinceHospitalsLoading } = useQuery(
    trpc.hospitals.getAll.queryOptions({
      isMain: false,
      status: "active",
      limit: 50,
    })
  );
  const { data: followedHospitalsData, refetch: refetchFollowedHospitals } = useQuery(
    trpc.hospitals.getFollowedHospitals.queryOptions(undefined, {
      enabled: isAuthenticated,
    })
  );
  const { data: latestAnnouncements, isLoading: announcementsLoading } = useQuery(
    trpc.announcements.getLatest.queryOptions({
      limit: 3,
    })
  );

  const followMutation = useMutation(trpc.hospitals.follow.mutationOptions());
  const unfollowMutation = useMutation(trpc.hospitals.unfollow.mutationOptions());

  // Update followed hospitals list
  useEffect(() => {
    if (followedHospitalsData) {
      setFollowedHospitals(followedHospitalsData.map((hospital) => hospital.id));
    }
  }, [followedHospitalsData]);

  const handleFollowHospital = async (hospitalId: number) => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    try {
      if (followedHospitals.includes(hospitalId)) {
        await unfollowMutation.mutateAsync({ hospitalId });
        setFollowedHospitals((prev) => prev.filter((id) => id !== hospitalId));
        Alert.alert("تم", "تم إلغاء المتابعة بنجاح");
      } else {
        await followMutation.mutateAsync({ hospitalId });
        setFollowedHospitals((prev) => [...prev, hospitalId]);
        Alert.alert("تم", "تم متابعة المستشفى بنجاح. ستصلك الإشعارات عند نشر أخبار جديدة.");
      }
      refetchFollowedHospitals();
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ أثناء عملية المتابعة");
    }
  };

  const handleEditHospital = (hospitalId: number) => {
    router.push(`/edit-hospital?id=${hospitalId}`);
  };

  const handleAddAnnouncement = (hospitalId?: number) => {
    router.push(`/add-hospital-announcement${hospitalId ? `?hospitalId=${hospitalId}` : ""}`);
  };

  const handleHospitalPress = (hospital: Hospital) => {
    router.push(`/hospital-details?id=${hospital.id}`);
  };

  const renderHospitalCard = (hospital: Hospital) => {
    const isFollowed = followedHospitals.includes(hospital.id);
    const canManageHospital = isSuperAdmin || isModerator;

    return (
      <View key={hospital.id} style={[styles.hospitalCard, hospital.isMain && styles.mainHospitalCard]}>
        <Image
          source={{ uri: hospital.image || "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400" }}
          style={styles.hospitalImage}
          defaultSource={{ uri: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400" }}
        />

        <View style={styles.hospitalInfo}>
          <View style={styles.hospitalHeader}>
            <Text style={[styles.hospitalName, hospital.isMain && styles.mainHospitalName]}>{hospital.name}</Text>
            {hospital.isMain && (
              <View style={styles.mainBadge}>
                <Award size={16} color={COLORS.white} />
                <Text style={styles.mainBadgeText}>رئيسي</Text>
              </View>
            )}
          </View>

          <View style={styles.hospitalDetails}>
            <View style={styles.detailRow}>
              <MapPin size={16} color="#0EA5E9" />
              <Text style={styles.detailText}>{hospital.location}</Text>
            </View>

            <View style={styles.detailRow}>
              <Phone size={16} color="#0EA5E9" />
              <Text style={styles.detailText}>{hospital.phone}</Text>
            </View>

            <View style={styles.detailRow}>
              <Clock size={16} color="#0EA5E9" />
              <Text style={styles.detailText}>{hospital.workingHours}</Text>
            </View>

            <View style={styles.detailRow}>
              <Star size={16} color="#F59E0B" />
              <Text style={styles.detailText}>
                {hospital.rating} ⭐ ({hospital.followersCount} متابع)
              </Text>
            </View>
          </View>

          <Text style={styles.cardHospitalDescription}>{hospital.description}</Text>

          <View style={styles.specialtiesContainer}>
            {hospital.specialties?.map((specialty, index) => (
              <View key={index} style={styles.specialtyBadge}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>

          <View style={styles.hospitalActions}>
            <TouchableOpacity
              style={[styles.cardFollowButton, isFollowed && styles.followedButton]}
              onPress={() => handleFollowHospital(hospital.id)}
              disabled={followMutation.isPending || unfollowMutation.isPending}
            >
              <Heart size={16} color={isFollowed ? "#0EA5E9" : COLORS.white} fill={isFollowed ? "#0EA5E9" : "none"} />
              <Text style={[styles.cardFollowButtonText, isFollowed && styles.followedButtonText]}>
                {isFollowed ? "متابع" : "متابعة"}
              </Text>
            </TouchableOpacity>

            {canManageHospital && (
              <TouchableOpacity style={styles.cardEditButton} onPress={() => handleEditHospital(hospital.id)}>
                <Edit size={16} color={COLORS.white} />
                <Text style={styles.editButtonText}>تعديل</Text>
              </TouchableOpacity>
            )}

            {canManageHospital && (
              <TouchableOpacity
                style={styles.cardAddAnnouncementButton}
                onPress={() => handleAddAnnouncement(hospital.id)}
              >
                <Plus size={16} color={COLORS.white} />
                <Text style={styles.addAnnouncementButtonText}>إعلان</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderAnnouncement = (announcement: Announcement & { hospital?: Hospital }) => {
    const getTypeColor = (type: string) => {
      switch (type) {
        case "news":
          return "#0EA5E9";
        case "announcement":
          return "#10B981";
        case "event":
          return "#F59E0B";
        default:
          return "#6B7280";
      }
    };

    const getTypeText = (type: string) => {
      switch (type) {
        case "news":
          return "خبر";
        case "announcement":
          return "إعلان";
        case "event":
          return "فعالية";
        default:
          return "عام";
      }
    };

    return (
      <View key={announcement.id} style={styles.announcementCard}>
        <View style={styles.announcementHeader}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(announcement.type) }]}>
            <Text style={styles.typeBadgeText}>{getTypeText(announcement.type)}</Text>
          </View>
          <Text style={styles.announcementDate}>{new Date(announcement.createdAt).toLocaleDateString("ar-SA")}</Text>
        </View>

        <Text style={styles.announcementTitle}>{announcement.title}</Text>
        <Text style={styles.announcementContent}>{announcement.content}</Text>

        {announcement.hospital && <Text style={styles.hospitalNameText}>من: {announcement.hospital.name}</Text>}
      </View>
    );
  };

  if (mainHospitalLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loadingText}>جاري تحميل بيانات المستشفيات...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "المستشفيات البيطرية العراقية",
          headerStyle: { backgroundColor: "#0EA5E9" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: () => {
            const canManageHospitals =
              isSuperAdmin || (isModerator && moderatorPermissions?.sections?.includes("hospitals"));

            return canManageHospitals ? (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/hospitals-management-dashboard");
                  }}
                  style={[styles.headerButton, styles.addButton]}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/hospitals-settings");
                  }}
                  style={[styles.headerButton, styles.headerEditButton]}
                >
                  <Edit size={20} color="#0EA5E9" />
                </TouchableOpacity>
              </View>
            ) : null;
          },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!showProvinceHospitals ? (
          // Main Hospital View
          <>
            {/* Hospital Info */}
            <View style={styles.hospitalInfoSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={{
                    uri: mainHospitalData?.image || "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200",
                  }}
                  style={styles.hospitalLogo}
                  defaultSource={{ uri: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200" }}
                />
              </View>
              <Text style={styles.hospitalTitle}>المستشفيات البيطرية العراقية</Text>
              <Text style={styles.hospitalDescription}>
                شبكة المستشفيات البيطرية العراقية هي المؤسسة الطبية الرسمية التي تقدم الخدمات البيطرية المتخصصة في جميع
                أنحاء العراق. تضم الشبكة المستشفى المركزي الرئيسي في بغداد بالإضافة إلى مستشفيات متخصصة في جميع
                المحافظات العراقية، وتعمل على تقديم أفضل الخدمات الطبية للحيوانات وحماية الصحة الحيوانية في جمهورية
                العراق.
              </Text>

              {/* Follow Button */}
              <TouchableOpacity
                style={[
                  styles.mainFollowButton,
                  followedHospitals.includes(mainHospitalData?.id!) && styles.followingButton,
                ]}
                onPress={() => mainHospitalData && handleFollowHospital(mainHospitalData.id)}
                activeOpacity={0.8}
                disabled={followMutation.isPaused || unfollowMutation.isPaused}
              >
                <View style={styles.followButtonContent}>
                  {followedHospitals.includes(mainHospitalData?.id!) ? (
                    <>
                      <Bell size={20} color={COLORS.white} />
                      <Text style={styles.mainFollowButtonText}>متابع</Text>
                    </>
                  ) : (
                    <>
                      <Heart size={20} color={COLORS.white} />
                      <Text style={styles.mainFollowButtonText}>متابعة</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Latest Announcements */}
            <View style={styles.announcementsSection}>
              <View style={styles.announcementHeader}>
                <Text style={styles.sectionTitle}>آخر الإعلانات</Text>
                {/* {(isSuperAdmin || isModerator) && (
                  <TouchableOpacity
                    onPress={() => handleAddAnnouncement(mainHospitalData?.id)}
                    style={styles.addAnnouncementButton}
                  >
                    <Plus size={16} color={COLORS.white} />
                    <Text style={styles.addAnnouncementText}>إضافة إعلان</Text>
                  </TouchableOpacity>
                )} */}
              </View>

              {announcementsLoading ? (
                <ActivityIndicator size="small" color="#0EA5E9" />
              ) : latestAnnouncements && latestAnnouncements.length > 0 ? (
                latestAnnouncements.map((item) => renderAnnouncement(item.announcement))
              ) : (
                <View style={styles.noDataContainer}>
                  <Megaphone size={32} color="#6B7280" />
                  <Text style={styles.noDataText}>لا توجد إعلانات حالياً</Text>
                </View>
              )}
            </View>

            {/* Services Section (Keep as static content) */}
            <View style={styles.servicesSection}>
              <Text style={styles.sectionTitle}>الخدمات</Text>
              <View style={styles.servicesGrid}>
                <TouchableOpacity style={[styles.serviceCard, { backgroundColor: "#0EA5E9" }]}>
                  <View style={styles.serviceIcon}>
                    <Users size={24} color={COLORS.white} />
                  </View>
                  <Text style={styles.serviceTitle}>الفحص والتشخيص</Text>
                  <Text style={styles.serviceDescription}>
                    فحص شامل وتشخيص دقيق للحيوانات باستخدام أحدث التقنيات الطبية
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.serviceCard, { backgroundColor: "#10B981" }]}>
                  <View style={styles.serviceIcon}>
                    <Award size={24} color={COLORS.white} />
                  </View>
                  <Text style={styles.serviceTitle}>الجراحة المتقدمة</Text>
                  <Text style={styles.serviceDescription}>عمليات جراحية متخصصة بأيدي أمهر الأطباء البيطريين</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.serviceCard, { backgroundColor: "#F59E0B" }]}>
                  <View style={styles.serviceIcon}>
                    <Calendar size={24} color={COLORS.white} />
                  </View>
                  <Text style={styles.serviceTitle}>الطوارئ 24/7</Text>
                  <Text style={styles.serviceDescription}>خدمة طوارئ على مدار الساعة لجميع أنواع الحيوانات</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.serviceCard, { backgroundColor: "#EF4444" }]}>
                  <View style={styles.serviceIcon}>
                    <FileText size={24} color={COLORS.white} />
                  </View>
                  <Text style={styles.serviceTitle}>التطعيمات والوقاية</Text>
                  <Text style={styles.serviceDescription}>برامج تطعيم شاملة ووقاية من الأمراض المعدية</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Hospital Card */}
            {mainHospitalData && (
              <View style={styles.hospitalsSection}>
                <Text style={styles.sectionTitle}>المستشفى البيطري المركزي</Text>
                <TouchableOpacity onPress={() => handleHospitalPress(mainHospitalData)}>
                  {renderHospitalCard(mainHospitalData)}
                </TouchableOpacity>
              </View>
            )}

            {/* Button to show province hospitals */}
            <View style={styles.branchesSection}>
              <Text style={styles.sectionTitle}>مستشفيات المحافظات العراقية</Text>
              <TouchableOpacity
                style={styles.branchesCard}
                onPress={() => setShowProvinceHospitals(true)}
                activeOpacity={0.8}
              >
                <View style={styles.branchesIcon}>
                  <Building2 size={32} color={COLORS.white} />
                </View>
                <View style={styles.branchesContent}>
                  <Text style={styles.branchesTitle}>مستشفيات المحافظات</Text>
                  <Text style={styles.branchesDescription}>
                    تصفح جميع المستشفيات البيطرية في المحافظات العراقية المتخصصة في الرعاية البيطرية
                  </Text>
                  <View style={styles.branchesStats}>
                    <Text style={styles.branchesStatsText}>
                      {provinceHospitalsData?.totalCount || 0} مستشفى • {provinceHospitalsData?.hospitals.length || 0}{" "}
                      محافظة
                    </Text>
                  </View>
                </View>
                <ExternalLink size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Province Hospitals View
          <>
            <View style={styles.hospitalsSection}>
              <Text style={styles.sectionTitle}>مستشفيات المحافظات</Text>
              {provinceHospitalsLoading ? (
                <ActivityIndicator size="large" color="#0EA5E9" />
              ) : provinceHospitalsData?.hospitals && provinceHospitalsData?.hospitals?.length > 0 ? (
                provinceHospitalsData?.hospitals?.map((hospital) => (
                  <TouchableOpacity key={hospital.id} onPress={() => handleHospitalPress(hospital)}>
                    {renderHospitalCard(hospital)}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Building2 size={32} color="#6B7280" />
                  <Text style={styles.noDataText}>لا توجد مستشفيات في المحافظات حالياً</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  noDataContainer: {
    alignItems: "center",
    padding: 32,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginVertical: 8,
  },
  noDataText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  announcementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  hospitalNameText: {
    fontSize: 12,
    color: "#0EA5E9",
    fontWeight: "600",
    marginTop: 8,
    textAlign: "left",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
  },
  hospitalInfoSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  hospitalLogo: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },
  hospitalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "center",
  },
  hospitalDescription: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 24,
  },
  mainFollowButton: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  followingButton: {
    backgroundColor: "#10B981",
  },
  followButtonContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mainFollowButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: "#10B981",
  },
  headerEditButton: {
    backgroundColor: COLORS.white,
  },
  announcementsSection: {
    padding: 16,
    paddingBottom: 0,
  },
  announcementHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addAnnouncementButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addAnnouncementText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  announcementBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row-reverse",
    borderLeftWidth: 4,
    borderLeftColor: "#0EA5E9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  announcementIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  announcementContent: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  announcementText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    textAlign: "left",
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: "#0EA5E9",
    fontWeight: "600",
    textAlign: "left",
  },
  servicesSection: {
    padding: 16,
  },
  servicesGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  serviceCard: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 12,
    color: COLORS.white,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 16,
  },
  branchesSection: {
    padding: 16,
  },
  branchesCard: {
    backgroundColor: "#0EA5E9",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  branchesIcon: {
    marginRight: 16,
  },
  branchesContent: {
    flex: 1,
  },
  branchesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 6,
    textAlign: "left",
  },
  branchesDescription: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 20,
    textAlign: "left",
    marginBottom: 8,
  },
  branchesStats: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-end",
  },
  branchesStatsText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },

  hospitalsSection: {
    padding: 16,
  },
  hospitalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  mainHospitalCard: {
    borderWidth: 2,
    borderColor: "#0EA5E9",
  },
  hospitalImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  hospitalInfo: {
    padding: 16,
  },
  hospitalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
    textAlign: "left",
  },
  mainHospitalName: {
    color: "#0EA5E9",
  },
  mainBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  mainBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  hospitalDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: "left",
  },
  cardHospitalDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: "left",
  },
  specialtiesContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  specialtyBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    color: "#0EA5E9",
    fontSize: 12,
    fontWeight: "600",
  },
  hospitalActions: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  cardFollowButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0EA5E9",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  followedButton: {
    backgroundColor: "#E0F2FE",
    borderWidth: 1,
    borderColor: "#0EA5E9",
  },
  cardFollowButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  followedButtonText: {
    color: "#0EA5E9",
  },
  cardEditButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  cardAddAnnouncementButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addAnnouncementButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
