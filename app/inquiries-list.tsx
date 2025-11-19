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
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Plus,
} from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { COLORS } from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/providers/AppProvider";

type StatusFilter = "all" | "pending" | "answered" | "closed";

export default function UserInquiriesListScreen() {
  const router = useRouter();
  const { user } = useApp();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data, isLoading, refetch, isRefetching } = useQuery(
    trpc.inquiries.listForUser.queryOptions({ userId: user?.id })
  );

  const statusConfig = {
    all: { label: "الكل", color: COLORS.darkGray, icon: FileText },
    pending: { label: "قيد المراجعة", color: "#F59E0B", icon: Clock },
    answered: { label: "تم الرد", color: "#10B981", icon: CheckCircle },
    closed: { label: "مغلق", color: "#6B7280", icon: XCircle },
  };

  const categories = [
    { value: "all", label: "الكل" },
    { value: "technical", label: "تقني" },
    { value: "billing", label: "فواتير" },
    { value: "general", label: "عام" },
    { value: "account", label: "حساب" },
    { value: "other", label: "أخرى" },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleNewInquiry = () => {
    router.push("/new-inquiry");
  };

  const filteredInquiries = data?.inquiries?.filter((inquiry) => {
    const matchesSearch =
      inquiry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusCount = (status: StatusFilter) => {
    if (!data?.inquiries) return 0;

    if (status === "all") {
      return data.inquiries.length;
    }

    return data.inquiries.filter((c) => c.status === status).length;
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
          <Text style={styles.headerTitle}>استفساراتي</Text>
          <TouchableOpacity onPress={handleNewInquiry} style={styles.addButton}>
            <Plus size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في الاستفسارات..."
              placeholderTextColor={COLORS.lightGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
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

        {/* Category Filters */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFiltersContainer}
            contentContainerStyle={styles.categoryFiltersContent}
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category.value;

              return (
                <TouchableOpacity
                  key={category.value}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(category.value)}
                >
                  <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
              <Text style={styles.loadingText}>جاري تحميل الاستفسارات...</Text>
            </View>
          ) : filteredInquiries && filteredInquiries.length > 0 ? (
            <>
              <Text style={styles.resultsCount}>{filteredInquiries.length} استفسار</Text>
              {filteredInquiries.map((inquiry) => (
                <TouchableOpacity
                  key={inquiry.id}
                  style={styles.inquiryCard}
                  onPress={() =>
                    router.push({
                      pathname: "/inquiry-details",
                      params: { id: inquiry.id },
                    })
                  }
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: statusConfig[inquiry.status as StatusFilter]?.color || COLORS.darkGray,
                          },
                        ]}
                      />
                      <Text style={styles.statusText}>
                        {statusConfig[inquiry.status as StatusFilter]?.label || inquiry.status}
                      </Text>
                    </View>
                    {inquiry.category && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {categories.find((c) => c.value === inquiry.category)?.label || inquiry.category}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.inquiryIdRow}>
                    <Text style={styles.inquiryId}>#{inquiry.id}</Text>
                  </View>

                  <Text style={styles.inquiryTitle} numberOfLines={2}>
                    {inquiry.title}
                  </Text>

                  <Text style={styles.inquiryContent} numberOfLines={3}>
                    {inquiry.content}
                  </Text>

                  {inquiry.petName && (
                    <View style={styles.petNameContainer}>
                      <Text style={styles.petNameLabel}>الحيوان:</Text>
                      <Text style={styles.petNameText}>{inquiry.petName}</Text>
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <View style={styles.metaInfo}>
                      <Clock size={14} color={COLORS.darkGray} />
                      <Text style={styles.metaText}>
                        {new Date(inquiry.createdAt || "").toLocaleDateString("ar-SA", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </View>
                    {inquiry.responsesCount > 0 && (
                      <View style={styles.responsesInfo}>
                        <MessageCircle size={14} color={COLORS.primary} />
                        <Text style={styles.responsesText}>{inquiry.responsesCount} رد</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <FileText size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyTitle}>{searchQuery ? "لا توجد نتائج بحث" : "لا توجد استفسارات"}</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? "جرب البحث بكلمات مختلفة" : "ابدأ بإضافة استفسارك الأول"}
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleNewInquiry}>
                <Plus size={20} color={COLORS.white} />
                <Text style={styles.emptyButtonText}>إضافة استفسار جديد</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        {filteredInquiries && filteredInquiries.length > 0 && (
          <TouchableOpacity style={styles.fab} onPress={handleNewInquiry}>
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
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
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
    textAlign: "right",
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
    flexDirection: "row",
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
  categoryFiltersContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  categoryFiltersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  categoryChipTextActive: {
    color: COLORS.white,
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
  inquiryCard: {
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: "row",
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
  categoryBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
  },
  inquiryIdRow: {
    marginBottom: 8,
  },
  inquiryId: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  inquiryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  inquiryContent: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  petNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  petNameLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  petNameText: {
    fontSize: 13,
    color: COLORS.black,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.darkGray,
  },
  responsesInfo: {
    flexDirection: "row",
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
    flexDirection: "row",
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
