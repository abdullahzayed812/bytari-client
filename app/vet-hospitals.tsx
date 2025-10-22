import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Image } from "react-native";
import React, { useState } from "react";
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
import { usePermissions } from "../lib/permissions";

interface Hospital {
  id: string;
  name: string;
  location: string;
  phone: string;
  rating: number;
  image: string;
  isMain?: boolean;
  province?: string;
  specialties: string[];
  workingHours: string;
  description: string;
}

export default function VetHospitalsScreen() {
  const router = useRouter();
  const { isSuperAdmin, isAuthenticated, isModerator, moderatorPermissions } = useApp();
  // const { canAccessHospital } = usePermissions();
  const [showProvinceHospitals, setShowProvinceHospitals] = useState<boolean>(false);
  const [followedHospitals, setFollowedHospitals] = useState<string[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // Mock data for hospitals
  const mainHospital: Hospital = {
    id: "main",
    name: "المستشفى البيطري المركزي - بغداد",
    location: "بغداد - الكرادة",
    phone: "+964 770 123 4567",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400",
    isMain: true,
    specialties: ["جراحة", "طب داخلي", "أشعة", "مختبرات", "طوارئ"],
    workingHours: "24 ساعة",
    description: "المستشفى البيطري المركزي الرئيسي في العراق، يقدم خدمات طبية متكاملة للحيوانات",
  };

  const provinceHospitals: Hospital[] = [
    {
      id: "basra",
      name: "مستشفى البصرة البيطري",
      location: "البصرة - المركز",
      phone: "+964 771 234 5678",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400",
      province: "البصرة",
      specialties: ["طب عام", "جراحة", "تطعيمات"],
      workingHours: "8:00 ص - 8:00 م",
      description: "مستشفى بيطري متخصص في محافظة البصرة",
    },
    {
      id: "mosul",
      name: "مستشفى الموصل البيطري",
      location: "نينوى - الموصل",
      phone: "+964 772 345 6789",
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400",
      province: "نينوى",
      specialties: ["طب عام", "طوارئ", "تشخيص"],
      workingHours: "7:00 ص - 7:00 م",
      description: "مستشفى بيطري يخدم محافظة نينوى والمناطق المجاورة",
    },
    {
      id: "erbil",
      name: "مستشفى أربيل البيطري",
      location: "أربيل - المركز",
      phone: "+964 773 456 7890",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400",
      province: "أربيل",
      specialties: ["جراحة متقدمة", "طب داخلي", "أشعة"],
      workingHours: "8:00 ص - 10:00 م",
      description: "مستشفى بيطري حديث في إقليم كردستان",
    },
    {
      id: "najaf",
      name: "مستشفى النجف البيطري",
      location: "النجف - المركز",
      phone: "+964 774 567 8901",
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400",
      province: "النجف",
      specialties: ["طب عام", "تطعيمات", "فحوصات"],
      workingHours: "8:00 ص - 6:00 م",
      description: "مستشفى بيطري يخدم محافظة النجف الأشرف",
    },
  ];

  // Mock announcements data
  // const announcements: Announcement[] = [
  //   {
  //     id: '1',
  //     title: 'حملة تطعيم مجانية للحيوانات الأليفة',
  //     content: 'تعلن المستشفيات البيطرية العراقية عن إطلاق حملة تطعيم مجانية لجميع الحيوانات الأليفة خلال شهر مارس',
  //     date: '2024-03-01',
  //     type: 'announcement',
  //     hospitalId: 'main'
  //   },
  //   {
  //     id: '2',
  //     title: 'افتتاح قسم الجراحة المتقدمة',
  //     content: 'تم افتتاح قسم جديد للجراحة المتقدمة مجهز بأحدث التقنيات الطبية',
  //     date: '2024-02-28',
  //     type: 'news',
  //     hospitalId: 'main'
  //   },
  //   {
  //     id: '3',
  //     title: 'ورشة عمل حول الرعاية البيطرية',
  //     content: 'ورشة عمل تدريبية للأطباء البيطريين حول أحدث طرق الرعاية والعلاج',
  //     date: '2024-02-25',
  //     type: 'event'
  //   }
  // ];

  const handleFollowHospital = (hospitalId: string) => {
    if (followedHospitals.includes(hospitalId)) {
      setFollowedHospitals((prev) => prev.filter((id) => id !== hospitalId));
      Alert.alert("تم", "تم إلغاء المتابعة بنجاح");
    } else {
      setFollowedHospitals((prev) => [...prev, hospitalId]);
      Alert.alert("تم", "تم متابعة المستشفى بنجاح. ستصلك الإشعارات عند نشر أخبار جديدة.");
    }
  };

  const handleEditHospital = (hospitalId: string) => {
    router.push(`/edit-hospital?id=${hospitalId}`);
  };

  const handleAddAnnouncement = (hospitalId?: string) => {
    router.push(`/add-hospital-announcement${hospitalId ? `?hospitalId=${hospitalId}` : ""}`);
  };

  const handleHospitalPress = (hospital: Hospital) => {
    router.push(`/hospital-details?id=${hospital.id}`);
  };

  const renderHospitalCard = (hospital: Hospital) => {
    const isFollowed = followedHospitals.includes(hospital.id);

    // Check if current user can manage this specific hospital
    const canManageHospital = isSuperAdmin || isModerator;

    return (
      <View key={hospital.id} style={[styles.hospitalCard, hospital.isMain && styles.mainHospitalCard]}>
        <Image source={{ uri: hospital.image }} style={styles.hospitalImage} />

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
              <Text style={styles.detailText}>{hospital.rating} ⭐</Text>
            </View>
          </View>

          <Text style={styles.cardHospitalDescription}>{hospital.description}</Text>

          <View style={styles.specialtiesContainer}>
            {hospital.specialties.map((specialty, index) => (
              <View key={index} style={styles.specialtyBadge}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>

          <View style={styles.hospitalActions}>
            <TouchableOpacity
              style={[styles.cardFollowButton, isFollowed && styles.followedButton]}
              onPress={() => handleFollowHospital(hospital.id)}
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

  // const renderAnnouncement = (announcement: Announcement) => {
  //   const getTypeColor = (type: string) => {
  //     switch (type) {
  //       case 'news': return '#0EA5E9';
  //       case 'announcement': return '#10B981';
  //       case 'event': return '#F59E0B';
  //       default: return '#6B7280';
  //     }
  //   };

  //   const getTypeText = (type: string) => {
  //     switch (type) {
  //       case 'news': return 'خبر';
  //       case 'announcement': return 'إعلان';
  //       case 'event': return 'فعالية';
  //       default: return 'عام';
  //     }
  //   };

  //   return (
  //     <View key={announcement.id} style={styles.announcementCard}>
  //       <View style={styles.announcementHeader}>
  //         <View style={[styles.typeBadge, { backgroundColor: getTypeColor(announcement.type) }]}>
  //           <Text style={styles.typeBadgeText}>{getTypeText(announcement.type)}</Text>
  //         </View>
  //         <Text style={styles.announcementDate}>{announcement.date}</Text>
  //       </View>

  //       <Text style={styles.announcementTitle}>{announcement.title}</Text>
  //       <Text style={styles.announcementContent}>{announcement.content}</Text>

  //       <TouchableOpacity style={styles.readMoreButton}>
  //         <Eye size={16} color="#0EA5E9" />
  //         <Text style={styles.readMoreText}>قراءة المزيد</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // };

  const handleFollowPress = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    setIsFollowing(!isFollowing);
    Alert.alert("تم", isFollowing ? "تم إلغاء متابعة المستشفيات" : "تم متابعة المستشفيات بنجاح");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "المستشفيات البيطرية العراقية",
          headerStyle: { backgroundColor: "#0EA5E9" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: () => {
            // Only super admin or users with hospital management permissions can see these buttons
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
                  source={{ uri: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200" }}
                  style={styles.hospitalLogo}
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
                style={[styles.mainFollowButton, isFollowing && styles.followingButton]}
                onPress={handleFollowPress}
                activeOpacity={0.8}
              >
                <View style={styles.followButtonContent}>
                  {isFollowing ? (
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

            {/* Hospital Announcements */}
            <View style={styles.announcementsSection}>
              <View style={styles.announcementHeader}>
                <Text style={styles.sectionTitle}>إعلانات المستشفيات</Text>
                {(isSuperAdmin || isModerator) && (
                  <TouchableOpacity
                    onPress={() => {
                      router.push("/add-hospital-announcement?hospitalId=main");
                    }}
                    style={styles.addAnnouncementButton}
                  >
                    <Plus size={16} color={COLORS.white} />
                    <Text style={styles.addAnnouncementText}>إضافة إعلان</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.announcementBox}>
                <View style={styles.announcementIcon}>
                  <Megaphone size={24} color="#0EA5E9" />
                </View>
                <View style={styles.announcementContent}>
                  <Text style={styles.announcementTitle}>إعلان مهم من المستشفى المركزي</Text>
                  <Text style={styles.announcementText}>
                    تعلن المستشفيات البيطرية العراقية عن إطلاق حملة تطعيم مجانية لجميع الحيوانات الأليفة خلال شهر مارس
                    الحالي في جميع فروع المستشفيات بالمحافظات.
                  </Text>
                  <Text style={styles.announcementDate}>تاريخ النشر: 2024-03-01</Text>
                </View>
              </View>
            </View>

            {/* Services */}
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
            <View style={styles.hospitalsSection}>
              <Text style={styles.sectionTitle}>المستشفى البيطري المركزي</Text>
              {renderHospitalCard(mainHospital)}
            </View>

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
                    <Text style={styles.branchesStatsText}>18 محافظة • 25 مستشفى</Text>
                  </View>
                </View>
                <ExternalLink size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Province Hospitals View
          <>
            {/* Province Hospitals */}
            <View style={styles.hospitalsSection}>
              <Text style={styles.sectionTitle}>مستشفيات المحافظات</Text>
              {provinceHospitals.map((hospital) => (
                <TouchableOpacity key={hospital.id} onPress={() => handleHospitalPress(hospital)}>
                  {renderHospitalCard(hospital)}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: "row",
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
    flexDirection: "row",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addAnnouncementButton: {
    flexDirection: "row",
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
    flexDirection: "row",
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
    textAlign: "right",
  },
  announcementText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    textAlign: "right",
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: "#0EA5E9",
    fontWeight: "600",
    textAlign: "right",
  },
  servicesSection: {
    padding: 16,
  },
  servicesGrid: {
    flexDirection: "row",
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
    flexDirection: "row",
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
    textAlign: "right",
  },
  branchesDescription: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 20,
    textAlign: "right",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
    textAlign: "right",
  },
  mainHospitalName: {
    color: "#0EA5E9",
  },
  mainBadge: {
    flexDirection: "row",
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: "right",
  },
  cardHospitalDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: "right",
  },
  specialtiesContainer: {
    flexDirection: "row",
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
    flexDirection: "row",
    gap: 8,
  },
  cardFollowButton: {
    flex: 1,
    flexDirection: "row",
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
    flexDirection: "row",
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
    flexDirection: "row",
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
