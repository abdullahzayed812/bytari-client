import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import {
  ArrowLeft,
  Search,
  Filter,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { COLORS } from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/providers/AppProvider";

type StatusFilter = "all" | "pending" | "answered" | "closed";
type UrgencyFilter = "all" | "low" | "medium" | "high" | "emergency";

export default function UserConsultationsListScreen() {
  const router = useRouter();
  const { user } = useApp();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useQuery(
    trpc.consultations.listForUser.queryOptions({
      userId: user?.id,
    })
  );

  const statusConfig = {
    all: { label: "الكل", color: COLORS.darkGray, icon: MessageCircle },
    pending: { label: "قيد المراجعة", color: "#F59E0B", icon: Clock },
    answered: { label: "تم الرد", color: "#10B981", icon: CheckCircle },
    closed: { label: "مغلق", color: "#6B7280", icon: XCircle },
  };

  const urgencyConfig = {
    all: { label: "الكل", color: COLORS.darkGray },
    low: { label: "منخفضة", color: "#6B7280" },
    medium: { label: "متوسطة", color: "#3B82F6" },
    high: { label: "عالية", color: "#F59E0B" },
    emergency: { label: "طارئة", color: "#EF4444" },
  };

  const handleBack = () => {
    router.back();
  };

  const handleNewConsultation = () => {
    router.push("/consultation");
  };

  const filteredConsultations = data?.consultations?.filter((consultation) => {
    const matchesSearch =
      !searchQuery.trim() ||
      consultation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || consultation.status === statusFilter;
    const matchesUrgency = urgencyFilter === "all" || consultation.urgencyLevel === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getStatusCount = (status: StatusFilter) => {
    if (!data?.consultations) return 0;

    if (status === "all") {
      return data.consultations.length;
    }

    return data.consultations.filter((c) => c.status === status).length;
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>استشاراتي</Text>
          <TouchableOpacity onPress={handleNewConsultation} style={styles.addButton}>
            <Plus size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في الاستشارات..."
              placeholderTextColor={COLORS.lightGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={showFilters ? COLORS.white : COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Status Filters */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusFiltersContainer}
            contentContainerStyle={styles.statusFiltersContent}
          >
            {(Object.keys(statusConfig) as StatusFilter[]).map((status) => {
              const config = statusConfig[status];
              const isActive = statusFilter === status;
              const StatusIcon = config.icon;
              const count = getStatusCount(status);

              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.statusFilterChip, isActive && { backgroundColor: config.color }]}
                  onPress={() => setStatusFilter(status)}
                >
                  <StatusIcon size={16} color={isActive ? COLORS.white : config.color} />
                  <Text style={[styles.statusFilterText, { color: isActive ? COLORS.white : config.color }]}>
                    {config.label}
                  </Text>
                  <View
                    style={[styles.countBadge, isActive ? styles.countBadgeActive : { backgroundColor: "#F3F4F6" }]}
                  >
                    <Text style={[styles.countBadgeText, { color: isActive ? config.color : COLORS.darkGray }]}>
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Urgency Filters (Collapsible) */}
        <View>
          {showFilters && (
            <View style={styles.urgencyFiltersContainer}>
              <Text style={styles.urgencyFiltersTitle}>مستوى الأهمية:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.urgencyFiltersContent}
              >
                {(Object.keys(urgencyConfig) as UrgencyFilter[]).map((urgency) => {
                  const config = urgencyConfig[urgency];
                  const isActive = urgencyFilter === urgency;

                  return (
                    <TouchableOpacity
                      key={urgency}
                      style={[styles.urgencyFilterChip, isActive && { backgroundColor: config.color }]}
                      onPress={() => setUrgencyFilter(urgency)}
                    >
                      <Text style={[styles.urgencyFilterText, { color: isActive ? COLORS.white : config.color }]}>
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>جاري تحميل الاستشارات...</Text>
            </View>
          ) : filteredConsultations && filteredConsultations.length > 0 ? (
            <>
              <Text style={styles.resultsCount}>{filteredConsultations.length} استشارة</Text>
              {filteredConsultations.map((consultation) => (
                <TouchableOpacity
                  key={consultation.id}
                  style={styles.consultationCard}
                  onPress={() =>
                    router.push({
                      pathname: "/consultation-details",
                      params: { id: consultation.id },
                    })
                  }
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              statusConfig[consultation.status as StatusFilter]?.color || COLORS.darkGray,
                          },
                        ]}
                      />
                      <Text style={styles.statusText}>
                        {statusConfig[consultation.status as StatusFilter]?.label || consultation.status}
                      </Text>
                    </View>
                    {consultation.urgencyLevel && consultation.urgencyLevel !== "medium" && (
                      <View
                        style={[
                          styles.urgencyBadge,
                          {
                            backgroundColor:
                              urgencyConfig[consultation.urgencyLevel as UrgencyFilter]?.color || COLORS.darkGray,
                          },
                        ]}
                      >
                        <AlertCircle size={12} color={COLORS.white} />
                        <Text style={styles.urgencyBadgeText}>
                          {urgencyConfig[consultation.urgencyLevel as UrgencyFilter]?.label ||
                            consultation.urgencyLevel}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.consultationTitle} numberOfLines={2}>
                    {consultation.title}
                  </Text>

                  <Text style={styles.consultationDescription} numberOfLines={3}>
                    {consultation.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.metaInfo}>
                      <Clock size={14} color={COLORS.darkGray} />
                      <Text style={styles.metaText}>
                        {new Date(consultation.createdAt || "").toLocaleDateString("ar-SA", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </View>
                    {consultation.responsesCount > 0 && (
                      <View style={styles.responsesInfo}>
                        <MessageCircle size={14} color={COLORS.primary} />
                        <Text style={styles.responsesText}>{consultation.responsesCount} رد</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <MessageCircle size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyTitle}>{searchQuery ? "لا توجد نتائج بحث" : "لا توجد استشارات"}</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? "جرب البحث بكلمات مختلفة" : "ابدأ بإضافة استشارتك الأولى"}
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleNewConsultation}>
                <Plus size={20} color={COLORS.white} />
                <Text style={styles.emptyButtonText}>إضافة استشارة جديدة</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        {filteredConsultations && filteredConsultations.length > 0 && (
          <TouchableOpacity style={styles.fab} onPress={handleNewConsultation}>
            <Plus size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
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
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row-reverse",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
    textAlign: "left",
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  statusFiltersContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  statusFiltersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statusFilterChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  statusFilterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  countBadge: {
    minWidth: 24,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  countBadgeActive: {
    backgroundColor: COLORS.white,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  urgencyFiltersContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  urgencyFiltersTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  urgencyFiltersContent: {
    gap: 8,
  },
  urgencyFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  urgencyFilterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  resultsCount: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
    fontWeight: "500",
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
  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.darkGray,
  },
  urgencyBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.white,
  },
  consultationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  consultationDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.darkGray,
  },
  responsesInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  responsesText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
