import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useRouter } from "expo-router";
import { Search, Building2, ShoppingBag, Lightbulb, BookOpen, Newspaper, X } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useApp } from "../../providers/AppProvider";

type TabKey = "all" | "clinics" | "stores" | "tips" | "magazines" | "books";

interface Tab {
  key: TabKey;
  label: string;
}

const PET_OWNER_TABS: Tab[] = [
  { key: "all", label: "الكل" },
  { key: "clinics", label: "العيادات" },
  { key: "stores", label: "المتاجر" },
  { key: "tips", label: "النصائح" },
];

const VET_TABS: Tab[] = [
  { key: "all", label: "الكل" },
  { key: "clinics", label: "المكاتب البيطرية" },
  { key: "stores", label: "المتاجر" },
  { key: "magazines", label: "المجلة البيطرية" },
  { key: "books", label: "الكتب البيطرية" },
];

export default function SearchScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const { userMode } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const tabs = userMode === "veterinarian" ? VET_TABS : PET_OWNER_TABS;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const enabled = debouncedQuery.length >= 2;

  const { data, isLoading, isFetching } = useQuery({
    ...trpc.search.query.queryOptions({ query: enabled ? debouncedQuery : "xx" }),
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const clinics = (data as any)?.clinics ?? [];
  const stores = (data as any)?.stores ?? [];
  const tips = (data as any)?.tips ?? [];
  const magazines = (data as any)?.magazines ?? [];
  const books = (data as any)?.books ?? [];

  const visibleClinics = activeTab === "all" || activeTab === "clinics" ? clinics : [];
  const visibleStores = activeTab === "all" || activeTab === "stores" ? stores : [];
  const visibleTips = activeTab === "all" || activeTab === "tips" ? tips : [];
  const visibleMagazines = activeTab === "all" || activeTab === "magazines" ? magazines : [];
  const visibleBooks = activeTab === "all" || activeTab === "books" ? books : [];

  const totalResults = visibleClinics.length + visibleStores.length + visibleTips.length + visibleMagazines.length + visibleBooks.length;
  const hasQuery = debouncedQuery.length >= 2;
  const loading = isLoading && hasQuery;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Search Input */}
        <View style={[styles.searchContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Search size={20} color={COLORS.darkGray} />
          <TextInput
            style={[styles.searchInput, { textAlign: isRTL ? "right" : "left", marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}
            placeholder="ابحث عن العيادات، المتاجر، النصائح..."
            placeholderTextColor={COLORS.lightGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {isFetching && !isLoading && hasQuery && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 8 }} />}
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color={COLORS.darkGray} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.tabsContent, { flexDirection: isRTL ? "row" : "row-reverse" }]}
          style={styles.tabsContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && styles.tabActive]} onPress={() => setActiveTab(tab.key)}>
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {!hasQuery ? (
            <View style={styles.emptyHint}>
              <Search size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyHintText}>ابحث في {tabs.find((t) => t.key === activeTab)?.label ?? "جميع الأقسام"}</Text>
            </View>
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>جاري البحث...</Text>
            </View>
          ) : totalResults === 0 ? (
            <View style={styles.noResultsContainer}>
              <Search size={64} color={COLORS.lightGray} />
              <Text style={styles.noResultsText}>لا توجد نتائج</Text>
              <Text style={styles.noResultsSubtext}>جرب البحث بكلمات مختلفة</Text>
            </View>
          ) : (
            <View>
              <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left" }]}>نتائج البحث ({totalResults})</Text>

              {/* Clinics */}
              {visibleClinics.length > 0 && (
                <>
                  <Text style={[styles.groupLabel, { textAlign: isRTL ? "right" : "left" }]}>
                    {userMode === "veterinarian" ? "المكاتب البيطرية" : "العيادات"}
                  </Text>
                  {visibleClinics.map((clinic: any) => (
                    <TouchableOpacity
                      key={clinic.id}
                      style={styles.resultCard}
                      onPress={() => router.push({ pathname: "/clinic-profile", params: { id: clinic.id } })}
                    >
                      <View style={[styles.resultContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        <View style={styles.resultIconContainer}>
                          <Building2 size={22} color={COLORS.primary} />
                        </View>
                        <View style={[styles.resultTextContainer, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                          <Text style={[styles.resultTitle, { textAlign: isRTL ? "right" : "left" }]}>{clinic.name}</Text>
                          {clinic.address ? <Text style={[styles.resultSubtitle, { textAlign: isRTL ? "right" : "left" }]}>{clinic.address}</Text> : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Stores */}
              {visibleStores.length > 0 && (
                <>
                  <Text style={[styles.groupLabel, { textAlign: isRTL ? "right" : "left" }]}>المتاجر</Text>
                  {visibleStores.map((store: any) => (
                    <TouchableOpacity
                      key={store.id}
                      style={styles.resultCard}
                      onPress={() => router.push({ pathname: "/store-profile", params: { id: store.id } })}
                    >
                      <View style={[styles.resultContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        {store.logo ? (
                          <Image source={{ uri: store.logo }} style={styles.resultImage} />
                        ) : (
                          <View style={styles.resultIconContainer}>
                            <ShoppingBag size={22} color={COLORS.warning} />
                          </View>
                        )}
                        <View style={[styles.resultTextContainer, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                          <Text style={[styles.resultTitle, { textAlign: isRTL ? "right" : "left" }]}>{store.name}</Text>
                          {store.description ? (
                            <Text style={[styles.resultSubtitle, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={1}>
                              {store.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Tips (pet owner only) */}
              {visibleTips.length > 0 && (
                <>
                  <Text style={[styles.groupLabel, { textAlign: isRTL ? "right" : "left" }]}>النصائح</Text>
                  {visibleTips.map((tip: any) => (
                    <TouchableOpacity key={tip.id} style={styles.resultCard} onPress={() => router.push({ pathname: "/tip-details", params: { id: tip.id } })}>
                      <View style={[styles.resultContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        <View style={styles.resultIconContainer}>
                          <Lightbulb size={22} color={COLORS.success} />
                        </View>
                        <View style={[styles.resultTextContainer, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                          <Text style={[styles.resultTitle, { textAlign: isRTL ? "right" : "left" }]}>{tip.title}</Text>
                          {tip.summary ? (
                            <Text style={[styles.resultSubtitle, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={1}>
                              {tip.summary}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Magazines (vet only) */}
              {visibleMagazines.length > 0 && (
                <>
                  <Text style={[styles.groupLabel, { textAlign: isRTL ? "right" : "left" }]}>المجلة البيطرية</Text>
                  {visibleMagazines.map((mag: any) => (
                    <TouchableOpacity
                      key={mag.id}
                      style={styles.resultCard}
                      onPress={() => router.push({ pathname: "/vet-magazine-details", params: { id: mag.id } })}
                    >
                      <View style={[styles.resultContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        <View style={styles.resultIconContainer}>
                          <Newspaper size={22} color={COLORS.primary} />
                        </View>
                        <View style={[styles.resultTextContainer, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                          <Text style={[styles.resultTitle, { textAlign: isRTL ? "right" : "left" }]}>{mag.title}</Text>
                          {mag.description ? (
                            <Text style={[styles.resultSubtitle, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={1}>
                              {mag.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Books (vet only) */}
              {visibleBooks.length > 0 && (
                <>
                  <Text style={[styles.groupLabel, { textAlign: isRTL ? "right" : "left" }]}>الكتب البيطرية</Text>
                  {visibleBooks.map((book: any) => (
                    <TouchableOpacity
                      key={book.id}
                      style={styles.resultCard}
                      onPress={() => router.push({ pathname: "/vet-book-details", params: { id: book.id } })}
                    >
                      <View style={[styles.resultContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        <View style={styles.resultIconContainer}>
                          <BookOpen size={22} color={COLORS.success} />
                        </View>
                        <View style={[styles.resultTextContainer, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                          <Text style={[styles.resultTitle, { textAlign: isRTL ? "right" : "left" }]}>{book.title}</Text>
                          {book.description ? (
                            <Text style={[styles.resultSubtitle, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={1}>
                              {book.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    padding: 0,
  },
  tabsContainer: {
    marginBottom: 16,
    flexGrow: 0,
  },
  tabsContent: {
    gap: 8,
    paddingHorizontal: 2,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  resultsContainer: {
    flex: 1,
  },
  emptyHint: {
    paddingVertical: 80,
    alignItems: "center",
    gap: 12,
  },
  emptyHintText: {
    fontSize: 15,
    color: COLORS.lightGray,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkGray,
    marginBottom: 8,
    marginTop: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  resultContent: {
    alignItems: "center",
  },
  resultImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  resultIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  resultTextContainer: {
    flex: 1,
    gap: 3,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.black,
  },
  resultSubtitle: {
    fontSize: 13,
    color: COLORS.darkGray,
  },
  noResultsContainer: {
    paddingVertical: 80,
    alignItems: "center",
    gap: 8,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.darkGray,
    marginTop: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: "center",
  },
});
