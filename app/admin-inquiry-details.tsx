import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { ArrowLeft, HelpCircle, User, Clock, MessageCircle, CheckCircle, Bot } from "lucide-react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { COLORS } from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import AdminReplyForm from "@/components/AdminReplyForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ImageAttachmentViewer from "@/components/ImageAttachmentViewer";
import { useI18n } from "@/providers/I18nProvider";

type StatusFilter = "pending" | "assigned" | "answered" | "closed";

export default function AdminInquiryDetailsScreen() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const inquiryId = typeof id === "string" ? parseInt(id) : 0;

  const { data, isLoading, refetch } = useQuery(
    trpc.inquiries.getDetails.queryOptions({
      inquiryId,
    })
  );

  const statusColors: Record<StatusFilter, string> = {
    pending: "#F59E0B",
    assigned: "#3B82F6",
    answered: "#10B981",
    closed: "#6B7280",
  };

  const statusLabels: Record<StatusFilter, string> = {
    pending: t("status.pending"),
    assigned: t("status.assigned"),
    answered: t("status.answered"),
    closed: t("status.closed"),
  };

  const priorityColors: Record<string, string> = {
    low: "#6B7280",
    normal: "#3B82F6",
    high: "#F59E0B",
    urgent: "#EF4444",
  };

  const priorityLabels: Record<string, string> = {
    low: t("priority.low"),
    normal: t("priority.normal"),
    high: t("priority.high"),
    urgent: t("priority.urgent"),
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
            <Text style={styles.headerTitle}>{t("adminInquiry.title")}</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t("common.loadingDetails")}</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!data?.inquiry) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("adminInquiry.title")}</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.emptyContainer}>
            <HelpCircle size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>{t("adminInquiry.notFound")}</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const { inquiry, responses } = data;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل الاستفسار</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inquiryCard}>
            <View style={styles.inquiryHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <User size={24} color={COLORS.white} />
                </View>
                <View>
                  <Text style={styles.userName}>{inquiry.user?.name || t("common.user")}</Text>
                  <Text style={styles.userEmail}>{inquiry.user?.email || ""}</Text>
                  <Text style={styles.userType}>{inquiry.user?.userType === "vet" ? t("userType.vet") : t("userType.user")}</Text>
                </View>
              </View>
              <View style={styles.badges}>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[inquiry.status as StatusFilter] }]}>
                  <Text style={styles.statusBadgeText}>{statusLabels[inquiry.status as StatusFilter]}</Text>
                </View>
                {inquiry.priority && inquiry.priority !== "normal" && (
                  <View style={[styles.priorityBadge, { backgroundColor: priorityColors[inquiry.priority] }]}>
                    <Text style={styles.priorityBadgeText}>{priorityLabels[inquiry.priority]}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.inquiryMeta}>
              <View style={styles.metaItem}>
                <Clock size={16} color={COLORS.darkGray} />
                <Text style={styles.metaText}>
                  {new Date(inquiry.createdAt || "").toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              {inquiry.category && (
                <View style={styles.metaItem}>
                  <HelpCircle size={16} color={COLORS.darkGray} />
                  <Text style={styles.metaText}>{inquiry.category}</Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            <Text style={styles.inquiryTitle}>{inquiry.title}</Text>
            <Text style={styles.inquiryContent}>{inquiry.content}</Text>

            <ImageAttachmentViewer attachments={inquiry.attachments} />
          </View>

          {responses && responses.length > 0 && (
            <View style={styles.responsesSection}>
              <View style={styles.responsesSectionHeader}>
                <MessageCircle size={20} color={COLORS.primary} />
                <Text style={styles.responsesSectionTitle}>{t("adminInquiry.responses")} ({responses.length})</Text>
              </View>

              {responses.map((response, index) => (
                <View key={response.id} style={styles.responseCard}>
                  <View style={styles.responseHeader}>
                    <View style={styles.responderInfo}>
                      <View style={[styles.responderAvatar, response.isOfficial && styles.responderAvatarOfficial]}>
                        <User size={16} color={COLORS.white} />
                      </View>
                      <View>
                        <Text style={styles.responderName}>
                          {response.isAiGenerated && !response.responder?.name
                            ? t("userType.ai")
                            : response.responder?.name || t("userType.supervisor")}
                        </Text>
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
                        <Text style={styles.officialBadgeText}>{t("common.officialReply")}</Text>
                      </View>
                    )}
                    {response.isAiGenerated && (
                      <View style={styles.aiGeneratedBadge}>
                        <Bot size={14} color={COLORS.white} />
                        <Text style={styles.aiGeneratedBadgeText}>AI</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.responseContent}>{response.content}</Text>

                  <ImageAttachmentViewer attachments={response.attachments} />

                  {response.keepConversationOpen && (
                    <View style={styles.conversationOpenBadge}>
                      <Text style={styles.conversationOpenText}>{t("common.conversationOpen")}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {inquiry.status !== "closed" && (
            <AdminReplyForm
              type="inquiry"
              itemId={inquiry.id}
              moderatorId={1}
              onReplySuccess={() => {
                queryClient.invalidateQueries(trpc.inquiries.getList.queryKey);
                queryClient.invalidateQueries(trpc.inquiries.getDetails.queryKey);
              }}
            />
          )}

          {inquiry.status === "closed" && (
            <View style={styles.closedCard}>
              <Text style={styles.closedText}>{t("common.conversationClosed")}</Text>
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
    flexDirection: "row-reverse",
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
  inquiryCard: {
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
  inquiryHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
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
  inquiryMeta: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row-reverse",
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
  inquiryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
  },
  inquiryContent: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 24,
  },

  responsesSection: {
    marginBottom: 16,
  },
  responsesSectionHeader: {
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  responderInfo: {
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
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
  aiGeneratedBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  aiGeneratedBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
  },
});
