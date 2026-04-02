import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useRouter, Stack } from "expo-router";
import {
  Users,
  ExternalLink,
  Plus,
  Edit3,
  Megaphone,
  Building2,
  Heart,
  Bell,
  Award,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  UserCheck,
} from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UnionService {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function VetUnionScreen() {
  const { isSuperAdmin, isAuthenticated, isModerator, moderatorPermissions } = useApp();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(trpc.union.main.get.queryOptions());
  const unionInfo = data?.union;

  const canManageUnion = isSuperAdmin || moderatorPermissions?.unionManagement;

  const services: UnionService[] = useMemo(() => {
    return unionInfo?.services?.map((service: any) => ({
      ...service,
      icon: <Users size={24} color={COLORS.white} />,
    }));
  }, [unionInfo]);

  const [isFollowing, setIsFollowing] = useState(unionInfo?.isFollowing || false);
  const [isRegistered, setIsRegistered] = useState((unionInfo as any)?.isRegistered || false);

  useEffect(() => {
    if (unionInfo) {
      setIsFollowing(unionInfo.isFollowing);
      setIsRegistered(!!(unionInfo as any).isRegistered);
    }
  }, [unionInfo]);

  const followMutation = useMutation(
    trpc.union.follow.toggle.mutationOptions({
      onSuccess: (data) => {
        setIsFollowing(data.isFollowing);
        queryClient.invalidateQueries(trpc.union.main.get.queryKey as any);
      },
      onError: (error) => {
        // Handle error
      },
    }),
  );

  const registerMutation = useMutation(trpc.union.registration.toggle.mutationOptions());

  const handleFollowPress = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (unionInfo) {
      followMutation.mutate({ mainUnionId: unionInfo.id });
    }
  };

  const handleRegisterPress = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (!unionInfo) return;
    if (isRegistered) {
      Alert.alert("إلغاء التسجيل", "هل تريد إلغاء تسجيلك في النقابة؟", [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد الإلغاء",
          style: "destructive",
          onPress: () => {
            registerMutation.mutate(
              { mainUnionId: unionInfo.id },
              {
                onSuccess: (data) => setIsRegistered(data.isRegistered),
              },
            );
          },
        },
      ]);
    } else {
      Alert.alert(
        "تسجيل في النقابة",
        "سيتم تسجيلك ضمن هذه النقابة. سيتمكن مسؤولو النقابة من الوصول إلى معلوماتك الشخصية كالاسم والبريد الإلكتروني ورقم الهاتف. هل تريد المتابعة؟",
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "تأكيد التسجيل",
            onPress: () => {
              registerMutation.mutate(
                { mainUnionId: unionInfo.id },
                {
                  onSuccess: (data) => setIsRegistered(data.isRegistered),
                },
              );
            },
          },
        ],
      );
    }
  };

  const handleContactPress = async (type: "phone" | "email" | "website", value: string | null) => {
    if (!value) return;

    let url;
    switch (type) {
      case "phone":
        url = `tel:${value}`;
        break;
      case "email":
        url = `mailto:${value}`;
        break;
      case "website":
        url = value.startsWith("http") ? value : `https://${value}`;
        break;
      default:
        return;
    }

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error(`Don't know how to open this URL: ${url}`);
      Alert.alert("خطأ", "لا يمكن فتح الرابط");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error fetching data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: unionInfo?.name || "نقابة الأطباء البيطريين العراقية",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: () => {
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
                uri:
                  unionInfo?.logoUrl ||
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Emblem_of_Iraq.svg/200px-Emblem_of_Iraq.svg.png",
              }}
              style={styles.unionLogo}
            />
          </View>
          <Text style={styles.unionTitle}>{unionInfo?.name}</Text>
          <Text style={styles.unionDescription}>{unionInfo?.description}</Text>

          {/* Follow + Register Buttons */}
          <View style={styles.actionButtonsRow}>
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

            <TouchableOpacity
              style={[styles.registerButton, isRegistered && styles.registeredButton]}
              onPress={handleRegisterPress}
              activeOpacity={0.8}
              disabled={registerMutation.isPending}
            >
              <View style={styles.followButtonContent}>
                <UserCheck size={20} color={isRegistered ? COLORS.white : COLORS.primary} />
                <Text style={[styles.registerButtonText, isRegistered && styles.registeredButtonText]}>
                  {isRegistered ? "مسجل" : "تسجيل"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Union Announcements */}
        <View style={styles.announcementsSection}>
          <View style={styles.announcementHeader}>
            <Text style={styles.sectionTitle}>إعلانات النقابة</Text>
            {canManageUnion && (
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
          <AnnouncementsList mainUnionId={unionInfo?.id} />
        </View>

        {/* Services */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>الخدمات</Text>
          <View style={styles.servicesGrid}>
            {services?.map((service, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.serviceCard, { backgroundColor: service.color }]}
                // onPress={() => handleServicePress(service.id)}
                activeOpacity={0.8}
              >
                <View style={styles.serviceIcon}>{service.icon}</View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Member Management — admin only */}
        {canManageUnion && (
          <View style={styles.managementSection}>
            <Text style={styles.sectionTitle}>إدارة الأعضاء</Text>
            <View style={styles.managementCardsRow}>
              <TouchableOpacity
                style={styles.managementCard}
                onPress={() =>
                  router.push({
                    pathname: "/union-members-list",
                    params: { type: "followers", mainUnionId: String(unionInfo?.id), title: "متابعو النقابة" },
                  })
                }
              >
                <Bell size={28} color={COLORS.primary} />
                <Text style={styles.managementCardTitle}>المتابعون</Text>
                {((unionInfo as any)?.followersCount ?? 0) > 0 && (
                  <View style={styles.managementBadge}>
                    <Text style={styles.managementBadgeText}>{(unionInfo as any).followersCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.managementCard}
                onPress={() =>
                  router.push({
                    pathname: "/union-members-list",
                    params: { type: "members", mainUnionId: String(unionInfo?.id), title: "أعضاء النقابة" },
                  })
                }
              >
                <Users size={28} color={COLORS.success || "#28a745"} />
                <Text style={styles.managementCardTitle}>الأعضاء المسجلون</Text>
                {((unionInfo as any)?.membersCount ?? 0) > 0 && (
                  <View style={[styles.managementBadge, { backgroundColor: COLORS.success || "#28a745" }]}>
                    <Text style={styles.managementBadgeText}>{(unionInfo as any).membersCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

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

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>معلومات الاتصال</Text>

          <View style={styles.contactCard}>
            <TouchableOpacity style={styles.contactItem} onPress={() => handleContactPress("phone", unionInfo?.phone1)}>
              <Phone size={20} color={COLORS.primary} />
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>الهاتف</Text>
                <Text style={styles.contactValue}>{unionInfo?.phone1}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => handleContactPress("phone", unionInfo?.phone2)}>
              <Phone size={20} color={COLORS.primary} />
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>الهاتف الثاني</Text>
                <Text style={styles.contactValue}>{unionInfo?.phone2}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => handleContactPress("email", unionInfo?.email)}>
              <Mail size={20} color={COLORS.primary} />
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>البريد الإلكتروني</Text>
                <Text style={styles.contactValue}>{unionInfo?.email}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.contactItem}>
              <MapPin size={20} color={COLORS.primary} />
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>العنوان</Text>
                <Text style={styles.contactValue}>{unionInfo?.address}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContactPress("website", unionInfo?.website)}
            >
              <ExternalLink size={20} color={COLORS.primary} />
              <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>الموقع الإلكتروني</Text>
                <Text style={styles.contactValue}>{unionInfo?.website}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ... inside the component, add this new component
function AnnouncementsList({ mainUnionId }: { mainUnionId?: number }) {
  const { data: announcements, isLoading } = useQuery(trpc.union.announcement.list.queryOptions({ mainUnionId }));

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (!announcements || announcements.length === 0) {
    return <Text>لا توجد إعلانات حالياً</Text>;
  }

  const handleLinkPress = async (url: string) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("خطأ", `لا يمكن فتح الرابط: ${url}`);
    }
  };

  return (
    <View>
      {announcements?.reverse()?.map((announcement) => (
        <View key={announcement.id} style={styles.announcementBox}>
          <View style={styles.announcementIcon}>
            <Megaphone size={24} color={COLORS.primary} />
          </View>

          <View style={styles.announcementContent}>
            <Text style={styles.announcementTitle}>{announcement.title}</Text>
            {announcement?.image ? (
              <View style={{ height: 150, borderRadius: 20 }}>
                <Image
                  source={{ uri: announcement.image || "" }}
                  style={{ width: "100%", height: 150, resizeMode: "cover", borderRadius: 10 }}
                />
              </View>
            ) : null}
            {announcement?.link ? (
              <TouchableOpacity onPress={() => handleLinkPress(announcement.link)}>
                <Text style={[styles.announcementText, styles.linkText]}>{announcement.link}</Text>
              </TouchableOpacity>
            ) : null}
            <Text style={styles.announcementText}>{announcement.content}</Text>
            <Text style={styles.announcementDate}>
              تاريخ النشر: {new Date(announcement?.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      ))}
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
    textAlign: "left",
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
    textAlign: "left",
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: "left",
  },
  readMoreButton: {
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addAnnouncementButton: {
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 5,
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
    color: COLORS.primary,
    fontWeight: "600",
    textAlign: "left",
  },
  linkText: {
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  branchesSection: {
    padding: 16,
  },
  branchesCard: {
    backgroundColor: COLORS.primary,
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
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginTop: 16,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  followingButton: {
    backgroundColor: COLORS.success || "#28a745",
  },
  registerButton: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: "transparent",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  registeredButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  registerButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  registeredButtonText: {
    color: COLORS.white,
  },
  managementSection: {
    padding: 16,
  },
  managementCardsRow: {
    flexDirection: "row-reverse",
    gap: 12,
    justifyContent: "space-between",
  },
  managementCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  managementCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginTop: 8,
    textAlign: "center",
  },
  managementBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  managementBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  followButtonContent: {
    flexDirection: "row-reverse",
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
