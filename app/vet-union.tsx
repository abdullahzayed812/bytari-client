import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useRouter, Stack } from "expo-router";
import {
  Users,
  Award,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Plus,
  Edit3,
  Megaphone,
  Building2,
  Heart,
  Bell,
} from "lucide-react-native";

interface UnionService {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface News {
  id: string;
  title: string;
  date: string;
  summary: string;
}

export default function VetUnionScreen() {
  const { isSuperAdmin, isAuthenticated, isModerator, moderatorPermissions } = useApp();
  // const { canAccessUnion } = usePermissions();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);

  const services: UnionService[] = [
    {
      id: "1",
      title: "التسجيل والعضوية",
      description: "تسجيل الأطباء البيطريين الجدد وتجديد عضوية الأعضاء الحاليين وفقاً لقانون النقابة",
      icon: <Users size={24} color={COLORS.white} />,
      color: "#3B82F6",
    },
    {
      id: "2",
      title: "إجازة ممارسة المهنة",
      description: "استخراج وتجديد إجازات ممارسة مهنة الطب البيطري وفقاً لقانون رقم 31 لسنة 1986",
      icon: <Award size={24} color={COLORS.white} />,
      color: "#10B981",
    },
    {
      id: "3",
      title: "التعليم المستمر",
      description: "برامج التطوير المهني والدورات التخصصية والمؤتمرات العلمية السنوية",
      icon: <Calendar size={24} color={COLORS.white} />,
      color: "#F59E0B",
    },
    {
      id: "4",
      title: "الشهادات المهنية",
      description: "إصدار شهادات الخبرة والممارسة والشهادات المطلوبة للعمل الحكومي والخاص",
      icon: <FileText size={24} color={COLORS.white} />,
      color: "#EF4444",
    },
  ];

  const news: News[] = [
    {
      id: "1",
      title: "المؤتمر العلمي السنوي الثامن والثلاثون لنقابة الأطباء البيطريين العراقية",
      date: "2024-11-15",
      summary:
        'تدعو نقابة الأطباء البيطريين العراقية جميع الزملاء لحضور المؤتمر العلمي السنوي الذي سيقام في فندق بابل الدولي ببغداد تحت شعار "الطب البيطري الحديث وتحديات المستقبل" بمشاركة خبراء محليين وعرب...',
    },
    {
      id: "2",
      title: "حملة التطعيم الوطنية ضد إنفلونزا الطيور في العراق",
      date: "2024-10-20",
      summary:
        "بالتنسيق مع وزارة الزراعة ودائرة البيطرة، أطلقت النقابة حملة شاملة للتطعيم ضد إنفلونزا الطيور في جميع المحافظات العراقية لحماية الثروة الداجنة والوقاية من انتشار المرض...",
    },
    {
      id: "3",
      title: "دورة تدريبية في جراحة الحيوانات الصغيرة والتخدير الحديث",
      date: "2024-09-10",
      summary:
        "نظمت النقابة بالتعاون مع كلية الطب البيطري جامعة بغداد دورة تدريبية متخصصة في جراحة الحيوانات الصغيرة وتقنيات التخدير الحديثة بمشاركة 120 طبيب بيطري من مختلف المحافظات...",
    },
    {
      id: "4",
      title: "إقرار لائحة آداب وسلوك مهنة الطب البيطري المحدثة",
      date: "2024-08-25",
      summary:
        "أقر مجلس النقابة اللائحة المحدثة لآداب وسلوك مهنة الطب البيطري في العراق والتي تتضمن المعايير المهنية الحديثة وقواعد الممارسة الأخلاقية للأطباء البيطريين وفقاً للمعايير الدولية...",
    },
  ];

  const handleServicePress = (serviceId: string) => {
    console.log("Service pressed:", serviceId);
  };

  const handleContactPress = (type: "phone" | "email" | "website") => {
    console.log("Contact pressed:", type);
  };

  const handleFollowPress = async () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    // const newFollowStatus = await followUnion();
    // setIsFollowing(newFollowStatus || false);

    // if (newFollowStatus) {
    //   console.log("تم متابعة النقابة بنجاح");
    // } else {
    //   console.log("تم إلغاء متابعة النقابة");
    // }
  };

  // React.useEffect(() => {
  //   setIsFollowing(isFollowingUnion() || false);
  // }, [isFollowingUnion]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "نقابة الأطباء البيطريين العراقية",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: () => {
            // Only super admin or users with union management permissions can see these buttons
            const canManageUnion = isSuperAdmin || (isModerator && moderatorPermissions?.sections?.includes("union"));

            return canManageUnion ? (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/union-management-dashboard");
                  }}
                  style={[styles.headerButton, styles.addButton]}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/union-settings");
                  }}
                  style={[styles.headerButton, styles.editButton]}
                >
                  <Edit3 size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ) : null;
          },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Union Info */}
        <View style={styles.unionInfoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Emblem_of_Iraq.svg/200px-Emblem_of_Iraq.svg.png",
              }}
              style={styles.unionLogo}
            />
          </View>
          <Text style={styles.unionTitle}>نقابة الأطباء البيطريين العراقية</Text>
          <Text style={styles.unionDescription}>
            نقابة الأطباء البيطريين العراقية هي المؤسسة المهنية الرسمية التي تأسست عام 1959 بموجب قانون النقابات المهنية
            رقم 35 لسنة 1959. تمثل النقابة جميع الأطباء البيطريين المرخصين في العراق وتعمل على تنظيم وتطوير مهنة الطب
            البيطري، وحماية حقوق الأعضاء، ورفع مستوى الخدمات البيطرية والصحة الحيوانية في جمهورية العراق. يبلغ عدد أعضاء
            النقابة حوالي 8000 طبيب بيطري موزعين على جميع المحافظات العراقية.
          </Text>

          {/* Follow Button */}
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollowPress}
            activeOpacity={0.8}
          >
            <View style={styles.followButtonContent}>
              {isFollowing ? (
                <>
                  <Bell size={20} color={COLORS.white} />
                  <Text style={styles.followButtonText}>متابع</Text>
                </>
              ) : (
                <>
                  <Heart size={20} color={COLORS.white} />
                  <Text style={styles.followButtonText}>متابعة</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Union Announcements */}
        <View style={styles.announcementsSection}>
          <View style={styles.announcementHeader}>
            <Text style={styles.sectionTitle}>إعلانات النقابة</Text>
            {(isSuperAdmin || isModerator) && (
              <TouchableOpacity
                onPress={() => {
                  router.push("/add-union-announcement?branchId=main");
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
              <Megaphone size={24} color={COLORS.primary} />
            </View>
            <View style={styles.announcementContent}>
              <Text style={styles.announcementTitle}>إعلان مهم من النقابة</Text>
              <Text style={styles.announcementText}>
                تدعو نقابة الأطباء البيطريين العراقية جميع الأعضاء لحضور الاجتماع العام الذي سيعقد يوم الأحد الموافق
                15/12/2024 في مقر النقابة ببغداد لمناقشة آخر التطورات والقرارات المهمة.
              </Text>
              <Text style={styles.announcementDate}>تاريخ النشر: 2024-12-01</Text>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>الخدمات</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, { backgroundColor: service.color }]}
                onPress={() => handleServicePress(service.id)}
                activeOpacity={0.8}
              >
                <View style={styles.serviceIcon}>{service.icon}</View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Union Branches */}
        <View style={styles.branchesSection}>
          <Text style={styles.sectionTitle}>فروع النقابة البيطرية في العراق</Text>
          <TouchableOpacity
            style={styles.branchesCard}
            onPress={() => router.push("/union-branches")}
            activeOpacity={0.8}
          >
            <View style={styles.branchesIcon}>
              <Building2 size={32} color={COLORS.white} />
            </View>
            <View style={styles.branchesContent}>
              <Text style={styles.branchesTitle}>فروع النقابة في المحافظات</Text>
              <Text style={styles.branchesDescription}>
                تصفح جميع فروع النقابة البيطرية في المحافظات العراقية بما في ذلك إقليم كردستان
              </Text>
              <View style={styles.branchesStats}>
                <Text style={styles.branchesStatsText}>18 محافظة • 25 فرع</Text>
              </View>
            </View>
            <ExternalLink size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* News & Updates */}
        <View style={styles.newsSection}>
          <Text style={styles.sectionTitle}>الأخبار والإعلانات</Text>
          {news.map((item) => (
            <View key={item.id} style={styles.newsCard}>
              <Text style={styles.newsDate}>{item.date}</Text>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsSummary}>{item.summary}</Text>
              <TouchableOpacity style={styles.readMoreButton}>
                <Text style={styles.readMoreText}>اقرأ المزيد</Text>
                <ExternalLink size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>معلومات الاتصال</Text>

          <View style={styles.contactCard}>
            <TouchableOpacity style={styles.contactItem} onPress={() => handleContactPress("phone")}>
              <Phone size={20} color={COLORS.primary} />
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>الهاتف</Text>
                <Text style={styles.contactValue}>+964 1 717 6543</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => handleContactPress("phone")}>
              <Phone size={20} color={COLORS.primary} />
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>الهاتف الثاني</Text>
                <Text style={styles.contactValue}>+964 1 717 2891</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => handleContactPress("email")}>
              <Mail size={20} color={COLORS.primary} />
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>البريد الإلكتروني</Text>
                <Text style={styles.contactValue}>info@iraqvetunion.org</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.contactItem}>
              <MapPin size={20} color={COLORS.primary} />
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>العنوان</Text>
                <Text style={styles.contactValue}>
                  بغداد - الكرادة الشرقية - شارع أبو نواس - مجمع النقابات المهنية - الطابق الثالث
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.contactItem} onPress={() => handleContactPress("website")}>
              <ExternalLink size={20} color={COLORS.primary} />
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>الموقع الإلكتروني</Text>
                <Text style={styles.contactValue}>www.iraqvetunion.org</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
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
  unionInfoSection: {
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
  unionLogo: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },
  unionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "center",
  },
  unionDescription: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 24,
  },
  servicesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
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
  newsSection: {
    padding: 16,
  },
  newsCard: {
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
  newsDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: "right",
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: "right",
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 4,
  },
  readMoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  contactSection: {
    padding: 16,
    paddingBottom: 32,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "600",
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
    backgroundColor: COLORS.success || "#28a745",
  },
  editButton: {
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
    backgroundColor: COLORS.primary,
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
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
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
    color: COLORS.primary,
    fontWeight: "600",
    textAlign: "right",
  },
  branchesSection: {
    padding: 16,
  },
  branchesCard: {
    backgroundColor: COLORS.primary,
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
  followButton: {
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.success || "#28a745",
  },
  followButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  followButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
