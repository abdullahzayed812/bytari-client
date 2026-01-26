import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import {
  ArrowLeft,
  MessageCircle,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  PawPrint,
} from "lucide-react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { COLORS } from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import UserReplyForm from "@/components/UserReplyForm";
import { useApp } from "@/providers/AppProvider";
import ImageAttachmentViewer from "@/components/ImageAttachmentViewer";

type StatusType = "pending" | "answered" | "closed";

export default function ConsultationDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useApp();
  const consultationId = typeof id === "string" ? parseInt(id) : 0;

  const { data, isLoading, refetch } = useQuery(
    trpc.consultations.getDetails.queryOptions({
      consultationId,
    })
  );

  const statusConfig = {
    pending: {
      label: "قيد المراجعة",
      color: "#F59E0B",
      icon: Clock,
      bgColor: "#FEF3C7",
    },
    answered: {
      label: "تم الرد",
      color: "#10B981",
      icon: CheckCircle,
      bgColor: "#D1FAE5",
    },
    closed: {
      label: "مغلق",
      color: "#6B7280",
      icon: XCircle,
      bgColor: "#F3F4F6",
    },
  };

  const urgencyConfig = {
    low: { label: "منخفضة", color: "#6B7280" },
    medium: { label: "متوسطة", color: "#3B82F6" },
    high: { label: "عالية", color: "#F59E0B" },
    emergency: { label: "طارئة", color: "#EF4444" },
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
            <TouchableOpacity style={styles.emptyButton} onPress={handleBack}>
              <Text style={styles.emptyButtonText}>العودة</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const { consultation, responses } = data;
  const status = consultation.status as StatusType;
  const StatusIcon = statusConfig[status]?.icon || AlertCircle;

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
          {/* Status Banner */}
          <View style={[styles.statusBanner, { backgroundColor: statusConfig[status]?.bgColor || "#F3F4F6" }]}>
            <StatusIcon size={24} color={statusConfig[status]?.color || COLORS.darkGray} />
            <View style={styles.statusBannerContent}>
              <Text style={styles.statusBannerTitle}>حالة الاستشارة</Text>
              <Text style={[styles.statusBannerLabel, { color: statusConfig[status]?.color || COLORS.darkGray }]}>
                {statusConfig[status]?.label || status}
              </Text>
            </View>
          </View>

          {/* Consultation Card */}
          <View style={styles.consultationCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>معلومات الاستشارة</Text>
              {consultation.urgencyLevel && (
                <View
                  style={[
                    styles.urgencyBadge,
                    {
                      backgroundColor:
                        urgencyConfig[consultation.urgencyLevel as keyof typeof urgencyConfig]?.color ||
                        COLORS.darkGray,
                    },
                  ]}
                >
                  <AlertCircle size={14} color={COLORS.white} />
                  <Text style={styles.urgencyBadgeText}>
                    {urgencyConfig[consultation.urgencyLevel as keyof typeof urgencyConfig]?.label ||
                      consultation.urgencyLevel}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.consultationTitle}>{consultation.title}</Text>

              <View style={styles.metaRow}>
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
              </View>

              {consultation.category && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>الفئة:</Text>
                  <Text style={styles.infoValue}>{consultation.category}</Text>
                </View>
              )}

              {consultation.petId && (
                <View style={styles.infoItem}>
                  <PawPrint size={16} color={COLORS.primary} />
                  <Text style={styles.infoValue}>حيوان أليف مسجل</Text>
                </View>
              )}

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>الوصف:</Text>
              <Text style={styles.descriptionText}>{consultation.description}</Text>

              {consultation.symptoms && (
                <>
                  <Text style={styles.sectionTitle}>الأعراض:</Text>
                  <Text style={styles.descriptionText}>{consultation.symptoms}</Text>
                </>
              )}

              <ImageAttachmentViewer attachments={consultation.attachments} />
            </View>
          </View>

          {/* Responses Section */}
          {responses && responses.length > 0 && (
            <View style={styles.responsesSection}>
              <View style={styles.responsesSectionHeader}>
                <MessageCircle size={20} color={COLORS.primary} />
                <Text style={styles.responsesSectionTitle}>الردود ({responses.length})</Text>
              </View>

              {responses.map((response, index) => (
                <View key={response.id} style={styles.responseCard}>
                  <View style={styles.responseHeader}>
                    <View style={styles.responderInfo}>
                      <View style={[styles.responderAvatar, response.isFromVet && styles.responderAvatarVet]}>
                        <User size={20} color={COLORS.white} />
                      </View>
                      <View>
                        <View style={styles.responderNameRow}>
                          <Text style={styles.responderName}>{response?.user?.name || "الفريق الطبي"}</Text>
                          {response.isFromVet && (
                            <View style={styles.vetBadge}>
                              <CheckCircle size={12} color={COLORS.white} />
                              <Text style={styles.vetBadgeText}>طبيب بيطري</Text>
                            </View>
                          )}
                        </View>
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
                  </View>

                  <Text style={styles.responseContent}>{response.content}</Text>

                  <ImageAttachmentViewer attachments={response.attachments} />
                </View>
              ))}
            </View>
          )}

          {/* Empty Responses State */}
          {(!responses || responses.length === 0) && status === "pending" && (
            <View style={styles.emptyResponsesCard}>
              <MessageCircle size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyResponsesTitle}>في انتظار الرد</Text>
              <Text style={styles.emptyResponsesText}>سيتم الرد على استشارتك في أقرب وقت ممكن من قبل فريقنا الطبي</Text>
            </View>
          )}

          {consultation?.status === "answered" ? (
            <UserReplyForm
              type="consultation"
              itemId={consultation.id}
              userId={+user?.id!}
              isConversationOpen={consultation.status !== "closed"}
              onReplySuccess={refetch}
            />
          ) : null}
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  statusBannerContent: {
    flex: 1,
  },
  statusBannerTitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  statusBannerLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  consultationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  urgencyBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  urgencyBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  cardContent: {
    padding: 16,
  },
  consultationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
  },
  metaRow: {
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
  infoItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: COLORS.black,
    lineHeight: 24,
    marginBottom: 16,
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
    borderRightWidth: 4,
    borderRightColor: COLORS.primary,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  responseHeader: {
    marginBottom: 12,
  },
  responderInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  responderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.darkGray,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  responderAvatarVet: {
    backgroundColor: COLORS.primary,
  },
  responderNameRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  responderName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.black,
  },
  vetBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  vetBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
  },
  responseDate: {
    fontSize: 13,
    color: COLORS.darkGray,
  },
  responseContent: {
    fontSize: 15,
    color: COLORS.black,
    lineHeight: 23,
  },

  emptyResponsesCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyResponsesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyResponsesText: {
    fontSize: 15,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 22,
  },
  helpCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  helpButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
