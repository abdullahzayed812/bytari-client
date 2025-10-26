import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { ArrowLeft, MessageCircle, Search } from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { COLORS } from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

type StatusFilter = "all" | "pending" | "assigned" | "answered" | "closed";

export default function AdminConsultationsListScreen() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery(
    trpc.consultations.getList.queryOptions({
      status: statusFilter,
      limit: 100,
    })
  );
  const consultations = useMemo(() => (data as any)?.consultations, [data]);

  const statusColors: Record<StatusFilter, string> = {
    all: "#6B7280",
    pending: "#F59E0B",
    assigned: "#3B82F6",
    answered: "#10B981",
    closed: "#6B7280",
  };

  const statusLabels: Record<StatusFilter, string> = {
    all: "الكل",
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

  const handleConsultationPress = (consultationId: number) => {
    router.push(`/admin-consultation-details?id=${consultationId}` as any);
  };

  const filteredConsultations =
    consultations?.filter(
      (consultation) =>
        consultation?.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultation.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الاستشارات</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.darkGray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في الاستشارات..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.darkGray}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {(["all", "pending", "assigned", "answered", "closed"] as StatusFilter[]).map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterButton, statusFilter === status && { backgroundColor: statusColors[status] }]}
                onPress={() => setStatusFilter(status)}
              >
                <Text style={[styles.filterButtonText, statusFilter === status && styles.filterButtonTextActive]}>
                  {statusLabels[status]}
                </Text>
                {data?.counts && (
                  <View style={[styles.filterBadge, statusFilter === status && styles.filterBadgeActive]}>
                    <Text style={[styles.filterBadgeText, statusFilter === status && styles.filterBadgeTextActive]}>
                      {data.counts[status]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>جاري تحميل الاستشارات...</Text>
            </View>
          ) : filteredConsultations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageCircle size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyTitle}>لا توجد استشارات</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? "لم يتم العثور على نتائج للبحث" : "لا توجد استشارات في هذه الفئة"}
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.consultationsList} showsVerticalScrollIndicator={false}>
              {filteredConsultations.map((consultation) => (
                <TouchableOpacity
                  key={consultation.id}
                  style={styles.consultationCard}
                  onPress={() => handleConsultationPress(consultation.id)}
                >
                  <View style={styles.consultationHeader}>
                    <View style={styles.consultationUserInfo}>
                      <View style={styles.consultationAvatar}>
                        <MessageCircle size={20} color={COLORS.white} />
                      </View>
                      <View>
                        <Text style={styles.consultationUserName}>{consultation.user?.name || "مستخدم"}</Text>
                        <Text style={styles.consultationDate}>
                          {new Date(consultation.createdAt || "").toLocaleDateString("ar-SA")}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.consultationBadges}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusColors[consultation.status as StatusFilter] },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>{statusLabels[consultation.status as StatusFilter]}</Text>
                      </View>
                      {consultation.priority && consultation.priority !== "normal" && (
                        <View
                          style={[styles.priorityBadge, { backgroundColor: priorityColors[consultation.priority] }]}
                        >
                          <Text style={styles.priorityBadgeText}>{priorityLabels[consultation.priority]}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text style={styles.consultationContent} numberOfLines={3}>
                    {consultation.question}
                  </Text>

                  <View style={styles.consultationFooter}>
                    <Text style={styles.consultationPetType}>
                      نوع الحيوان: {petTypeLabels[consultation.petType] || consultation.petType}
                    </Text>
                    {consultation.responsesCount > 0 && (
                      <Text style={styles.consultationResponses}>{consultation.responsesCount} رد</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
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
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "right",
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    maxHeight: 50,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  filterBadge: {
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  filterBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.black,
  },
  filterBadgeTextActive: {
    color: COLORS.white,
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
  emptyText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 8,
  },
  consultationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  consultationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  consultationUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  consultationAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  consultationUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  consultationDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  consultationBadges: {
    flexDirection: "row",
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
  },
  consultationContent: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  consultationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  consultationPetType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  consultationResponses: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
});
