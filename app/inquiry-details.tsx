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
  FileText,
  Mail,
  Phone,
} from "lucide-react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { COLORS } from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import UserReplyForm from "@/components/UserReplyForm";
import { useApp } from "@/providers/AppProvider";
import ImageAttachmentViewer from "@/components/ImageAttachmentViewer";

type InquiryStatusType = "pending" | "answered" | "closed";

export default function InquiryDetailsScreen() {
  const router = useRouter();
  const { user } = useApp();
  const { id } = useLocalSearchParams();
  const inquiryId = typeof id === "string" ? parseInt(id) : 0;

  // You'll need to create this tRPC procedure similar to consultations
  const { data, isLoading, refetch } = useQuery(
    trpc.inquiries.getDetails.queryOptions({
      inquiryId,
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
            <Text style={styles.headerTitle}>تفاصيل الاستفسار</Text>
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

  if (!data?.inquiry) {
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
          <View style={styles.emptyContainer}>
            <FileText size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>لم يتم العثور على الاستفسار</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleBack}>
              <Text style={styles.emptyButtonText}>العودة</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const { inquiry, responses } = data;
  const status = inquiry.status as InquiryStatusType;
  const StatusIcon = statusConfig[status]?.icon || AlertCircle;

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
          {/* Status Banner */}
          <View style={[styles.statusBanner, { backgroundColor: statusConfig[status]?.bgColor || "#F3F4F6" }]}>
            <StatusIcon size={24} color={statusConfig[status]?.color || COLORS.darkGray} />
            <View style={styles.statusBannerContent}>
              <Text style={styles.statusBannerTitle}>حالة الاستفسار</Text>
              <Text style={[styles.statusBannerLabel, { color: statusConfig[status]?.color || COLORS.darkGray }]}>
                {statusConfig[status]?.label || status}
              </Text>
            </View>
          </View>

          {/* Inquiry Info Card */}
          <View style={styles.inquiryCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>معلومات الاستفسار</Text>
              <View style={styles.inquiryIdBadge}>
                <Text style={styles.inquiryIdText}>#{inquiry.id}</Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.inquiryTitle}>{inquiry.title}</Text>

              <View style={styles.metaRow}>
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
              </View>

              {inquiry.petName && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>الحيوان:</Text>
                  <Text style={styles.infoValue}>{inquiry.petName}</Text>
                </View>
              )}

              {inquiry.category && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>الفئة:</Text>
                  <Text style={styles.infoValue}>{inquiry.category}</Text>
                </View>
              )}

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>المحتوى:</Text>
              <Text style={styles.descriptionText}>{inquiry.content}</Text>

              <ImageAttachmentViewer attachments={inquiry.attachments} />
            </View>
          </View>

          {/* Contact Info Card (if available) */}
          {(inquiry.contactEmail || inquiry.contactPhone) && (
            <View style={styles.contactCard}>
              <Text style={styles.cardTitle}>معلومات التواصل</Text>
              <View style={styles.cardContent}>
                {inquiry.contactEmail && (
                  <View style={styles.contactItem}>
                    <Mail size={18} color={COLORS.primary} />
                    <Text style={styles.contactText}>{inquiry.contactEmail}</Text>
                  </View>
                )}
                {inquiry.contactPhone && (
                  <View style={styles.contactItem}>
                    <Phone size={18} color={COLORS.primary} />
                    <Text style={styles.contactText}>{inquiry.contactPhone}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Responses Section */}
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
                        <User size={20} color={COLORS.white} />
                      </View>
                      <View>
                        <View style={styles.responderNameRow}>
                          <Text style={styles.responderName}>{"الفريق الطبي"}</Text>
                          {response.isOfficial && (
                            <View style={styles.officialBadge}>
                              <CheckCircle size={12} color={COLORS.white} />
                              <Text style={styles.officialBadgeText}>رد رسمي</Text>
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
                  <Text style={styles.responseContent}>{response.content}</Text>/
                  {/* <ImageAttachmentViewer attachments={response.attachments} /> */}
                </View>
              ))}
            </View>
          )}

          {/* Empty Responses State */}
          {(!responses || responses.length === 0) && status === "pending" && (
            <View style={styles.emptyResponsesCard}>
              <MessageCircle size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyResponsesTitle}>في انتظار الرد</Text>
              <Text style={styles.emptyResponsesText}>سيتم الرد على استفسارك في أقرب وقت ممكن من قبل فريق الإدارة</Text>
            </View>
          )}

          {inquiry?.status === "answered" ? (
            <UserReplyForm
              type="inquiry"
              itemId={inquiry.id}
              userId={+user?.id!}
              isConversationOpen={inquiry.status !== "closed"}
              onReplySuccess={refetch}
            />
          ) : null}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <AlertCircle size={20} color={COLORS.primary} />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>معلومة مهمة</Text>
              <Text style={styles.infoCardText}>
                يمكنك متابعة حالة استفساراتك من خلال قسم "استفساراتك السابقة" في الصفحة الرئيسية
              </Text>
            </View>
          </View>
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
    flexDirection: "row",
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
  inquiryCard: {
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
    flexDirection: "row",
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
  inquiryIdBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inquiryIdText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  cardContent: {
    padding: 16,
  },
  inquiryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
  },
  metaRow: {
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
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkGray,
    minWidth: 80,
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

  contactCard: {
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
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 15,
    color: COLORS.black,
    flex: 1,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  responderAvatarOfficial: {
    backgroundColor: COLORS.primary,
  },
  responderNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  responderName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.black,
  },
  officialBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  officialBadgeText: {
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
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
});
