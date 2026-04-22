import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, TextInput, Linking } from "react-native";
import React, { useEffect, useState } from "react";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  Star,
  Edit3,
  Plus,
  Calendar,
  MessageSquare,
  ExternalLink,
  Bell,
  BellOff,
  Link,
  UserCheck,
} from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Picker } from "@react-native-picker/picker";

interface UnionBranch {
  id: string;
  name: string;
  governorate: string;
  region: "central" | "northern" | "southern" | "kurdistan";
  address: string;
  phone: string;
  email: string;
  president: string;
  membersCount: number;
  isFollowing: boolean;
  announcements: Announcement[];
  rating: number;
  description: string;
  establishedYear: number;
  services: string[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: "general" | "urgent" | "event" | "meeting";
  isImportant: boolean;
  image?: string;
  link?: string;
  linkText?: string;
  author?: string;
  views?: number;
}

export default function UnionBranchDetailsScreen() {
  const { isSuperAdmin, user, moderatorPermissions, supervisedBranchIds } = useApp();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");

  const { data: branch, isLoading, error } = useQuery(trpc.union.branch.get.queryOptions(parseInt(id as string)));

  const { data: announcements, isLoading: isAnnouncementsLoading } = useQuery({
    ...trpc.union.announcement.list.queryOptions({ branchId: Number(branch?.id) }),
    enabled: !!branch?.id,
  });

  const [isFollowing, setIsFollowing] = useState<boolean>(branch?.isFollowing || false);
  const [isRegistered, setIsRegistered] = useState<boolean>(!!(branch as any)?.isRegistered);

  useEffect(() => {
    if (branch) {
      setIsFollowing(branch.isFollowing);
      setIsRegistered(!!(branch as any).isRegistered);
    }
  }, [branch]);

  const followMutation = useMutation(trpc.union.follow.toggle.mutationOptions());
  const registerMutation = useMutation(trpc.union.registration.toggle.mutationOptions());

  const assignSupervisorMutation = useMutation(trpc.union.branch.assignSupervisor.mutationOptions());

  const { data: supervisorsData } = useQuery({
    ...trpc.union.supervisors.list.queryOptions(),
    enabled: !!branch?.id,
  });
  const branchSupervisors = (supervisorsData?.supervisors ?? []).filter((s) => s.branchId === branch?.id);

  const handleAssignSupervisor = () => {
    if (branch && email) {
      assignSupervisorMutation.mutate(
        { branchId: branch.id, email: email },
        {
          onSuccess: () => {
            Alert.alert("عملية ناجحة", "تم اضافة المستخدم مشرف لفرع النقابة");
            setEmail("");
            queryClient.invalidateQueries(trpc.union.branch.get.queryKey as any);
          },
          onError: (error) => {
            Alert.alert("Error", error.message || "Failed to assign supervisor.");
          },
        },
      );
    }
  };

  const handleFollowToggle = () => {
    if (branch) {
      followMutation.mutate(
        { branchId: branch.id },
        {
          onSuccess: (data) => {
            setIsFollowing(data.isFollowing);
            queryClient.invalidateQueries(trpc.union.branch.get.queryKey as any);
            queryClient.invalidateQueries(trpc.union.branch.list.queryKey as any);
          },
        },
      );
    }
  };

  const handleRegisterToggle = () => {
    if (!branch) return;
    if (isRegistered) {
      Alert.alert("إلغاء التسجيل", `هل تريد إلغاء تسجيلك في فرع ${branch.name}؟`, [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد الإلغاء",
          style: "destructive",
          onPress: () => {
            registerMutation.mutate({ branchId: branch.id }, { onSuccess: (data) => setIsRegistered(data.isRegistered) });
          },
        },
      ]);
    } else {
      Alert.alert(
        "تسجيل في الفرع",
        `سيتم تسجيلك ضمن فرع ${branch.name}. سيتمكن مسؤولو الفرع من الوصول إلى معلوماتك الشخصية كالاسم والبريد الإلكتروني ورقم الهاتف. هل تريد المتابعة؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "تأكيد التسجيل",
            onPress: () => {
              registerMutation.mutate({ branchId: branch.id }, { onSuccess: (data) => setIsRegistered(data.isRegistered) });
            },
          },
        ],
      );
    }
  };

  const handleLinkPress = async (url: string) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("خطأ", `لا يمكن فتح الرابط: ${url}`);
    }
  };

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case "urgent":
        return COLORS.error;
      case "meeting":
        return COLORS.primary;
      case "event":
        return COLORS.success;
      default:
        return COLORS.darkGray;
    }
  };

  const getAnnouncementTypeLabel = (type: string) => {
    switch (type) {
      case "urgent":
        return "عاجل";
      case "meeting":
        return "اجتماع";
      case "event":
        return "فعالية";
      default:
        return "عام";
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} color="#FFD700" fill="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} color="#FFD700" fill="#FFD700" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} color="#E5E7EB" />);
    }

    return stars;
  };

  const canManageBranch = isSuperAdmin || moderatorPermissions?.unionManagement || supervisedBranchIds?.includes(branch?.id);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !branch) {
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
          title: branch.name,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold", fontSize: 16 },
          headerRight: () =>
            isSuperAdmin || moderatorPermissions?.unionManagement ? (
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => router.push(`/add-union-announcement?branchId=${branch.id}`)} style={[styles.headerButton, styles.addButton]}>
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push(`/edit-union-branch?id=${branch.id}`)} style={[styles.headerButton, styles.editButton]}>
                  <Edit3 size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : null,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Union Announcements - Top Priority */}
        <View style={styles.topAnnouncementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.topSectionTitle}>إعلانات النقابة</Text>
            {canManageBranch && (
              <TouchableOpacity onPress={() => router.push(`/add-union-announcement?branchId=${branch.id}`)} style={styles.addAnnouncementButton}>
                <Plus size={16} color={COLORS.primary} />
                <Text style={styles.addAnnouncementText}>إضافة إعلان</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.topAnnouncementsList}>
            {isAnnouncementsLoading ? (
              <ActivityIndicator />
            ) : (
              announcements?.slice(0, 2)?.map((announcement) => (
                <View key={announcement.id} style={styles.topAnnouncementCard}>
                  <View style={styles.announcementHeader}>
                    <View style={[styles.announcementType, { backgroundColor: getAnnouncementTypeColor(announcement.type) }]}>
                      <Text style={styles.announcementTypeText}>{getAnnouncementTypeLabel(announcement.type)}</Text>
                    </View>
                    {announcement.isImportant && (
                      <View style={styles.importantBadge}>
                        <Text style={styles.importantText}>مهم</Text>
                      </View>
                    )}
                    <Text style={styles.announcementDate}>{announcement.date}</Text>
                  </View>

                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <Text style={styles.announcementContent}>{announcement.content}</Text>

                  {announcement?.link ? (
                    <TouchableOpacity onPress={() => handleLinkPress(announcement.link)}>
                      <Text style={[styles.announcementText, styles.linkText]}>{announcement.link}</Text>
                    </TouchableOpacity>
                  ) : null}

                  {announcement.image && (
                    <View style={styles.announcementImageContainer} onPress={() => handleLinkPress(announcement.link)}>
                      <Image source={{ uri: announcement.image }} style={styles.announcementImage} />
                    </View>
                  )}

                  {announcement.link && (
                    <TouchableOpacity style={styles.announcementLink} onPress={() => handleLinkPress(announcement.link)}>
                      <Link size={16} color={COLORS.primary} />
                      <Text style={styles.announcementLinkText}>{announcement.linkText || "رابط ذات صلة"}</Text>
                      <ExternalLink size={14} color={COLORS.primary} />
                    </TouchableOpacity>
                  )}

                  <View style={styles.announcementFooter}>
                    {announcement.author && <Text style={styles.announcementAuthor}>بواسطة: {announcement.author}</Text>}
                    {announcement.views && <Text style={styles.announcementViews}>{announcement.views} مشاهدة</Text>}
                  </View>

                  {canManageBranch && (
                    <View style={styles.announcementActions}>
                      <TouchableOpacity
                        style={styles.editAnnouncementButton}
                        onPress={() => router.push(`/edit-union-announcement?branchId=${branch.id}&announcementId=${announcement.id}`)}
                      >
                        <Edit3 size={14} color={COLORS.primary} />
                        <Text style={styles.editAnnouncementText}>تعديل</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </View>

        {/* Branch Header */}
        <View style={styles.branchHeader}>
          <View style={styles.branchIcon}>
            <Building2 size={32} color={COLORS.primary} />
          </View>
          <View style={styles.branchMainInfo}>
            <Text style={styles.branchName}>{branch.name}</Text>
            <Text style={styles.branchGovernorate}>{branch.governorate}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>{renderStars(branch.rating)}</View>
              <Text style={styles.ratingText}>({branch.rating})</Text>
            </View>
          </View>
          <View style={styles.branchActions}>
            <TouchableOpacity
              style={[styles.followButton, isFollowing || branch.isFollowing ? styles.followingButton : styles.notFollowingButton]}
              onPress={handleFollowToggle}
            >
              {isFollowing || branch.isFollowing ? <BellOff size={16} color={COLORS.white} /> : <Bell size={16} color={COLORS.primary} />}
              <Text style={[styles.followButtonText, isFollowing || branch.isFollowing ? styles.followingText : styles.notFollowingText]}>
                {isFollowing || branch.isFollowing ? "متابع" : "متابعة"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.followButton, isRegistered ? styles.followingButton : styles.notFollowingButton]}
              onPress={handleRegisterToggle}
              disabled={registerMutation.isPending}
            >
              <UserCheck size={16} color={isRegistered ? COLORS.white : COLORS.primary} />
              <Text style={[styles.followButtonText, isRegistered ? styles.followingText : styles.notFollowingText]}>{isRegistered ? "مسجل" : "تسجيل"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الاتصال</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <MapPin size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{branch.address}</Text>
            </View>

            <TouchableOpacity style={styles.contactItem}>
              <Phone size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{branch.phone}</Text>
              <ExternalLink size={16} color={COLORS.darkGray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <Mail size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{branch.email}</Text>
              <ExternalLink size={16} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Branch Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إحصائيات النقابة</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Users size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{branch.membersCount.toLocaleString()}</Text>
              <Text style={styles.statLabel}>عضو مسجل</Text>
            </View>

            <View style={styles.statCard}>
              <MessageSquare size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>{branch?.announcements?.length}</Text>
              <Text style={styles.statLabel}>إعلان نشط</Text>
            </View>

            <View style={styles.statCard}>
              <Star size={24} color="#FFD700" />
              <Text style={styles.statNumber}>{branch.rating}</Text>
              <Text style={styles.statLabel}>تقييم النقابة</Text>
            </View>
          </View>
        </View>

        {/* President Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>رئيس النقابة</Text>
          <View style={styles.presidentCard}>
            <View style={styles.presidentInfo}>
              <Text style={styles.presidentName}>{branch.president}</Text>
              <Text style={styles.presidentTitle}>رئيس نقابة الأطباء البيطريين - {branch.governorate}</Text>
            </View>
          </View>
        </View>

        {(isSuperAdmin || moderatorPermissions?.unionManagement) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تعيين مشرف للنقابة</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل البريد الإلكتروني للمستخدم"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleAssignSupervisor}>
              <Text style={styles.buttonText}>Assign Supervisor</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Branch Supervisors */}
        {branchSupervisors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>مشرفو الفرع</Text>
            <View style={styles.supervisorsList}>
              {branchSupervisors.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.supervisorCard}
                  onPress={() => router.push({ pathname: "/user-profile", params: { userId: String(s.userId) } })}
                >
                  <View style={styles.supervisorAvatarCircle}>
                    <UserCheck size={22} color={COLORS.primary} />
                  </View>
                  <View style={styles.supervisorInfo}>
                    <Text style={styles.supervisorName}>{s.userName ?? "—"}</Text>
                    <Text style={styles.supervisorEmail}>{s.userEmail ?? "—"}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الخدمات المقدمة</Text>
          <View style={styles.servicesList}>
            {branch?.services?.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <View style={styles.serviceBullet} />
                <View>
                  <Text style={styles.serviceText}>{service?.title}</Text>
                  <Text style={styles.serviceText}>{service?.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Member Management — canManageBranch only */}
        {canManageBranch && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>إدارة الأعضاء</Text>
            <View style={styles.managementCardsRow}>
              <TouchableOpacity
                style={styles.managementCard}
                onPress={() =>
                  router.push({
                    pathname: "/union-members-list",
                    params: { type: "followers", branchId: String(branch.id), title: "متابعو الفرع" },
                  })
                }
              >
                <Bell size={28} color={COLORS.primary} />
                <Text style={styles.managementCardTitle}>المتابعون</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.managementCard}
                onPress={() =>
                  router.push({
                    pathname: "/union-members-list",
                    params: { type: "members", branchId: String(branch.id), title: "أعضاء الفرع" },
                  })
                }
              >
                <Users size={28} color={COLORS.success || "#28a745"} />
                <Text style={styles.managementCardTitle}>الأعضاء المسجلون</Text>
                {((branch as any)?.membersCount ?? 0) > 0 && (
                  <View style={[styles.managementBadge, { backgroundColor: COLORS.success || "#28a745" }]}>
                    <Text style={styles.managementBadgeText}>{(branch as any).membersCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
  branchHeader: {
    backgroundColor: COLORS.white,
    padding: 20,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  branchIcon: {
    marginRight: 16,
    marginTop: 4,
  },
  branchMainInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "left",
  },
  branchGovernorate: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "left",
  },
  ratingContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  starsContainer: {
    flexDirection: "row-reverse",
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  followButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    justifyContent: "center",
    gap: 6,
  },
  followingButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  notFollowingButton: {
    backgroundColor: "transparent",
    borderColor: COLORS.primary,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  followingText: {
    color: COLORS.white,
  },
  notFollowingText: {
    color: COLORS.primary,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 8,
    padding: 20,
  },
  topAnnouncementsSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: "left",
  },
  topAnnouncementsList: {
    gap: 16,
  },
  topAnnouncementCard: {
    backgroundColor: "#F0F9FF",
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "left",
  },
  description: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 24,
    textAlign: "left",
    marginBottom: 12,
  },
  establishedInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  establishedText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  contactInfo: {
    gap: 16,
  },
  contactItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: "left",
  },
  statsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  presidentCard: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  presidentInfo: {
    alignItems: "flex-end",
  },
  presidentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "left",
  },
  presidentTitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "left",
  },
  servicesList: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  serviceBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  serviceText: {
    fontSize: 16,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: "left",
  },
  addAnnouncementButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  addAnnouncementText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  announcementsList: {
    gap: 16,
  },
  announcementCard: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  announcementHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginBottom: 12,
  },
  announcementType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  announcementTypeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "600",
  },
  importantBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  importantText: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: "bold",
  },
  announcementDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: "left",
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  announcementContent: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    textAlign: "left",
  },
  announcementActions: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  editAnnouncementButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editAnnouncementText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  announcementImageContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  announcementImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  announcementLink: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  announcementLinkText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    textAlign: "left",
  },
  announcementFooter: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  announcementAuthor: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  announcementViews: {
    fontSize: 12,
    color: COLORS.darkGray,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    textAlign: "left",
  },
  announcementText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    textAlign: "left",
    marginBottom: 8,
  },
  linkText: {
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  branchActions: {
    flexDirection: "column",
    gap: 8,
  },
  managementCardsRow: {
    flexDirection: "row-reverse",
    gap: 12,
    justifyContent: "space-between",
  },
  managementCard: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  managementCardTitle: {
    fontSize: 13,
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
  supervisorsList: {
    gap: 10,
  },
  supervisorCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
  },
  supervisorAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EBF5FF",
    justifyContent: "center",
    alignItems: "center",
  },
  supervisorInfo: {
    flex: 1,
    gap: 3,
  },
  supervisorName: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
  },
  supervisorEmail: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
});
