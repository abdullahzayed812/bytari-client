import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
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
} from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  const { isSuperAdmin, hasAdminAccess, /* sendNotification ,*/ isModerator, moderatorPermissions } = useApp();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: branch, isLoading, error } = useQuery(trpc.union.branch.get.queryOptions(parseInt(id as string)));
  const [isFollowing, setIsFollowing] = useState<boolean>(branch?.isFollowing || false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (branch) {
      setIsFollowing(branch.isFollowing);
    }
  }, [branch]);

  const followMutation = useMutation(
    trpc.union.follow.toggle.mutationOptions({
      onSuccess: (data) => {
        setIsFollowing(data.isFollowing);
        queryClient.invalidateQueries(trpc.union.branch.get.queryKey(parseInt(id as string) as any));
        queryClient.invalidateQueries(trpc.union.branch.list.queryKey as any);
      },
    })
  );

  const handleFollowToggle = () => {
    if (branch) {
      followMutation.mutate({ branchId: branch.id });
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
            isSuperAdmin ||
            hasAdminAccess ||
            (isModerator && moderatorPermissions?.sections?.includes("union-branches")) ? (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => router.push(`/add-union-announcement?branchId=${branch.id}`)}
                  style={[styles.headerButton, styles.addButton]}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(`/edit-union-branch?id=${branch.id}`)}
                  style={[styles.headerButton, styles.editButton]}
                >
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
            {(isSuperAdmin ||
              hasAdminAccess ||
              (isModerator && moderatorPermissions?.sections?.includes("union-branches"))) && (
              <TouchableOpacity
                onPress={() => router.push(`/add-union-announcement?branchId=${branch.id}`)}
                style={styles.addAnnouncementButton}
              >
                <Plus size={16} color={COLORS.primary} />
                <Text style={styles.addAnnouncementText}>إضافة إعلان</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.topAnnouncementsList}>
            {branch?.announcements?.slice(0, 2)?.map((announcement) => (
              <View key={announcement.id} style={styles.topAnnouncementCard}>
                <View style={styles.announcementHeader}>
                  <View
                    style={[styles.announcementType, { backgroundColor: getAnnouncementTypeColor(announcement.type) }]}
                  >
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

                {announcement.image && (
                  <View style={styles.announcementImageContainer}>
                    <Image source={{ uri: announcement.image }} style={styles.announcementImage} />
                  </View>
                )}

                {announcement.link && (
                  <TouchableOpacity style={styles.announcementLink}>
                    <Link size={16} color={COLORS.primary} />
                    <Text style={styles.announcementLinkText}>{announcement.linkText || "رابط ذات صلة"}</Text>
                    <ExternalLink size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                )}

                <View style={styles.announcementFooter}>
                  {announcement.author && <Text style={styles.announcementAuthor}>بواسطة: {announcement.author}</Text>}
                  {announcement.views && <Text style={styles.announcementViews}>{announcement.views} مشاهدة</Text>}
                </View>

                {(isSuperAdmin ||
                  hasAdminAccess ||
                  (isModerator && moderatorPermissions?.sections?.includes("union-branches"))) && (
                  <View style={styles.announcementActions}>
                    <TouchableOpacity
                      style={styles.editAnnouncementButton}
                      onPress={() =>
                        router.push(`/edit-union-announcement?branchId=${branch.id}&announcementId=${announcement.id}`)
                      }
                    >
                      <Edit3 size={14} color={COLORS.primary} />
                      <Text style={styles.editAnnouncementText}>تعديل</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
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
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing || branch.isFollowing ? styles.followingButton : styles.notFollowingButton,
            ]}
            onPress={handleFollowToggle}
          >
            {isFollowing || branch.isFollowing ? (
              <BellOff size={16} color={COLORS.white} />
            ) : (
              <Bell size={16} color={COLORS.primary} />
            )}
            <Text
              style={[
                styles.followButtonText,
                isFollowing || branch.isFollowing ? styles.followingText : styles.notFollowingText,
              ]}
            >
              {isFollowing || branch.isFollowing ? "متابعة" : "متابعة"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Branch Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نبذة عن النقابة</Text>
          <Text style={styles.description}>{branch.description}</Text>
          <View style={styles.establishedInfo}>
            <Calendar size={16} color={COLORS.primary} />
            <Text style={styles.establishedText}>تأسست عام {branch.establishedYear}</Text>
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

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الخدمات المقدمة</Text>
          <View style={styles.servicesList}>
            {branch.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <View style={styles.serviceBullet} />
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Previous Announcements and News */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الأخبار والإعلانات السابقة</Text>
            {(isSuperAdmin ||
              hasAdminAccess ||
              (isModerator && moderatorPermissions?.sections?.includes("union-branches"))) && (
              <TouchableOpacity
                onPress={() => router.push(`/add-union-announcement?branchId=${branch.id}`)}
                style={styles.addAnnouncementButton}
              >
                <Plus size={16} color={COLORS.primary} />
                <Text style={styles.addAnnouncementText}>إضافة إعلان</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.announcementsList}>
            {branch?.announcements?.slice(2)?.map((announcement) => (
              <View key={announcement.id} style={styles.announcementCard}>
                <View style={styles.announcementHeader}>
                  <View
                    style={[styles.announcementType, { backgroundColor: getAnnouncementTypeColor(announcement.type) }]}
                  >
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

                {announcement.image && (
                  <View style={styles.announcementImageContainer}>
                    <Image source={{ uri: announcement.image }} style={styles.announcementImage} />
                  </View>
                )}

                {announcement.link && (
                  <TouchableOpacity style={styles.announcementLink}>
                    <Link size={16} color={COLORS.primary} />
                    <Text style={styles.announcementLinkText}>{announcement.linkText || "رابط ذات صلة"}</Text>
                    <ExternalLink size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                )}

                <View style={styles.announcementFooter}>
                  {announcement.author && <Text style={styles.announcementAuthor}>بواسطة: {announcement.author}</Text>}
                  {announcement.views && <Text style={styles.announcementViews}>{announcement.views} مشاهدة</Text>}
                </View>

                {(isSuperAdmin ||
                  hasAdminAccess ||
                  (isModerator && moderatorPermissions?.sections?.includes("union-branches"))) && (
                  <View style={styles.announcementActions}>
                    <TouchableOpacity
                      style={styles.editAnnouncementButton}
                      onPress={() =>
                        router.push(`/edit-union-announcement?branchId=${branch.id}&announcementId=${announcement.id}`)
                      }
                    >
                      <Edit3 size={14} color={COLORS.primary} />
                      <Text style={styles.editAnnouncementText}>تعديل</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
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
  branchHeader: {
    backgroundColor: COLORS.white,
    padding: 20,
    flexDirection: "row",
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
    textAlign: "right",
  },
  branchGovernorate: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "right",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  followButton: {
    flexDirection: "row",
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
    textAlign: "right",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
  },
  description: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 24,
    textAlign: "right",
    marginBottom: 12,
  },
  establishedInfo: {
    flexDirection: "row",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: "right",
  },
  statsContainer: {
    flexDirection: "row",
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
    textAlign: "right",
  },
  presidentTitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  servicesList: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: "row",
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
    textAlign: "right",
  },
  addAnnouncementButton: {
    flexDirection: "row",
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
    flexDirection: "row",
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
    textAlign: "right",
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  announcementContent: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    textAlign: "right",
  },
  announcementActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  editAnnouncementButton: {
    flexDirection: "row",
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
    flexDirection: "row",
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
    textAlign: "right",
  },
  announcementFooter: {
    flexDirection: "row",
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});
