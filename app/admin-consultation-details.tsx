import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { ArrowLeft, MessageCircle, User, Clock, CheckCircle, PawPrint } from "lucide-react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { COLORS } from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import AdminReplyForm from "@/components/AdminReplyForm";
import { useQuery } from "@tanstack/react-query";

type StatusFilter = "pending" | "assigned" | "answered" | "closed";

export default function AdminConsultationDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const consultationId = typeof id === "string" ? parseInt(id) : 0;

  const { data, isLoading, refetch } = useQuery(
    trpc.consultations.getDetails.queryOptions({
      consultationId,
    })
  );

  const statusColors: Record<StatusFilter, string> = {
    pending: "#F59E0B",
    assigned: "#3B82F6",
    answered: "#10B981",
    closed: "#6B7280",
  };

  const statusLabels: Record<StatusFilter, string> = {
    pending: "قيد الانتظار",
    assigned: "تم التعيين",
    answered: "تم الرد",
    closed: "مغلق",
  };

  const priorityColors: Record<string, string> = {
    low: "#6B7280",
    normal: "#3B82F6",
    high: "#F59E0B",
    urgent: "#EF4444",
  };

  const priorityLabels: Record<string, string> = {
    low: "منخفضة",
    normal: "عادية",
    high: "عالية",
    urgent: "عاجلة",
  };

  const petTypeLabels: Record<string, string> = {
    dog: "كلب",
    cat: "قطة",
    rabbit: "أرنب",
    bird: "طائر",
    other: "آخر",
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>تفاصيل الاستشارة</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>جاري تحميل التفاصيل...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!data?.consultation) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>تفاصيل الاستشارة</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.emptyContainer}>
            <MessageCircle size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>لم يتم العثور على الاستشارة</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const { consultation, responses } = data;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل الاستشارة</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.consultationCard}>
            <View style={styles.consultationHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <User size={24} color={COLORS.white} />
                </View>
                <View>
                  <Text style={styles.userName}>{consultation.user?.name || "مستخدم"}</Text>
                  <Text style={styles.userEmail}>{consultation.user?.email || ""}</Text>
                  <Text style={styles.userType}>{consultation.user?.userType === "vet" ? "طبيب بيطري" : "مستخدم"}</Text>
                </View>
              </View>
              <View style={styles.badges}>
                <View
                  style={[styles.statusBadge, { backgroundColor: statusColors[consultation.status as StatusFilter] }]}
                >
                  <Text style={styles.statusBadgeText}>{statusLabels[consultation.status as StatusFilter]}</Text>
                </View>
                {consultation.priority && consultation.priority !== "normal" && (
                  <View style={[styles.priorityBadge, { backgroundColor: priorityColors[consultation.priority] }]}>
                    <Text style={styles.priorityBadgeText}>{priorityLabels[consultation.priority]}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.consultationMeta}>
              <View style={styles.metaItem}>
                <Clock size={16} color={COLORS.darkGray} />
                <Text style={styles.metaText}>
                  {new Date(consultation.createdAt || "").toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              {consultation.petType && (
                <View style={styles.metaItem}>
                  <PawPrint size={16} color={COLORS.darkGray} />
                  <Text style={styles.metaText}>{petTypeLabels[consultation.petType] || consultation.petType}</Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>السؤال:</Text>
            <Text style={styles.consultationContent}>{consultation.question}</Text>

            {consultation.petAge && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>عمر الحيوان:</Text>
                <Text style={styles.infoValue}>{consultation.petAge}</Text>
              </View>
            )}

            {consultation.symptoms && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>الأعراض:</Text>
                <Text style={styles.infoValue}>{consultation.symptoms}</Text>
              </View>
            )}

            {consultation.attachments && (
              <View style={styles.attachmentsContainer}>
                <Text style={styles.attachmentsTitle}>المرفقات:</Text>
                <Text style={styles.attachmentsText}>{consultation.attachments}</Text>
              </View>
            )}
          </View>

          {responses && responses.length > 0 && (
            <View style={styles.responsesSection}>
              <View style={styles.responsesSectionHeader}>
                <MessageCircle size={20} color={COLORS.primary} />
                <Text style={styles.responsesSectionTitle}>الردود ({responses.length})</Text>
              </View>

              {responses.map((response) => (
                <View key={response.id} style={styles.responseCard}>
                  <View style={styles.responseHeader}>
                    <View style={styles.responderInfo}>
                      <View style={[styles.responderAvatar, response.isOfficial && styles.responderAvatarOfficial]}>
                        <User size={16} color={COLORS.white} />
                      </View>
                      <View>
                        <Text style={styles.responderName}>{response.responder?.name || "مشرف"}</Text>
                        <Text style={styles.responseDate}>
                          {new Date(response.createdAt || "").toLocaleDateString("ar-SA", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    </View>
                    {response.isOfficial && (
                      <View style={styles.officialBadge}>
                        <CheckCircle size={14} color={COLORS.white} />
                        <Text style={styles.officialBadgeText}>رد رسمي</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.responseContent}>{response.content}</Text>

                  {response.attachments && (
                    <View style={styles.responseAttachments}>
                      <Text style={styles.attachmentsText}>{response.attachments}</Text>
                    </View>
                  )}

                  {response.keepConversationOpen && (
                    <View style={styles.conversationOpenBadge}>
                      <Text style={styles.conversationOpenText}>المحادثة مفتوحة للرد</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {consultation.isConversationOpen && (
            <AdminReplyForm type="consultation" itemId={consultation.id} moderatorId={1} onReplySuccess={refetch} />
          )}

          {!consultation.isConversationOpen && (
            <View style={styles.closedCard}>
              <Text style={styles.closedText}>تم إغلاق المحادثة</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  consultationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  consultationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  userType: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
  },
  badges: {
    flexDirection: "row",
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  consultationMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  consultationContent: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 24,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkGray,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
  },
  attachmentsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  attachmentsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 6,
  },
  attachmentsText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  responsesSection: {
    marginBottom: 16,
  },
  responsesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  responsesSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  responseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  responseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  responderInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  responderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.darkGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  responderAvatarOfficial: {
    backgroundColor: COLORS.primary,
  },
  responderName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  responseDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  officialBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  officialBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
  },
  responseContent: {
    fontSize: 15,
    color: COLORS.black,
    lineHeight: 22,
  },
  responseAttachments: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
  },
  conversationOpenBadge: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#DBEAFE",
    borderRadius: 6,
  },
  conversationOpenText: {
    fontSize: 12,
    color: "#1E40AF",
    textAlign: "center",
    fontWeight: "500",
  },
  closedCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  closedText: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
});
