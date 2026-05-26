/**
 * admin-poultry-market-moderation.tsx
 * Admin screen — review and approve/delete pending poultry & egg market ads.
 */
import React, { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2 } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";
import { useToastContext } from "../providers/ToastProvider";
import { POULTRY_TYPE_LABELS } from "../components/poultry/PoultryMarketCard";
import { EGG_TYPE_LABELS } from "../components/poultry/EggMarketCard";

const MARKET_TABS = [
  { key: "poultry", label: "الدواجن" },
  { key: "eggs", label: "البيض" },
];

export default function AdminPoultryMarketModerationScreen() {
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();
  const [marketTab, setMarketTab] = useState("poultry");

  // Pending poultry ads
  const poultryQuery = useQuery(
    trpc.poultry.market.getPending.queryOptions()
  );

  // Pending egg ads
  const eggQuery = useQuery(
    trpc.poultry.eggMarket.getPending.queryOptions()
  );

  const poultryApproveMutation = useMutation(
    trpc.poultry.market.review.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم الإجراء بنجاح" });
        queryClient.invalidateQueries(trpc.poultry.market.getPending.queryKey());
        queryClient.invalidateQueries(trpc.poultry.market.list.queryKey());
      },
      onError: (e: any) => showToast({ type: "error", message: e.message }),
    })
  );

  const eggApproveMutation = useMutation(
    trpc.poultry.eggMarket.review.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم الإجراء بنجاح" });
        queryClient.invalidateQueries(trpc.poultry.eggMarket.getPending.queryKey());
        queryClient.invalidateQueries(trpc.poultry.eggMarket.list.queryKey());
      },
      onError: (e: any) => showToast({ type: "error", message: e.message }),
    })
  );

  const poultryDeleteMutation = useMutation(
    trpc.poultry.market.adminDelete.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم حذف الإعلان" });
        queryClient.invalidateQueries(trpc.poultry.market.getPending.queryKey());
        queryClient.invalidateQueries(trpc.poultry.market.list.queryKey());
      },
    })
  );

  const eggDeleteMutation = useMutation(
    trpc.poultry.eggMarket.adminDelete.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم حذف الإعلان" });
        queryClient.invalidateQueries(trpc.poultry.eggMarket.getPending.queryKey());
        queryClient.invalidateQueries(trpc.poultry.eggMarket.list.queryKey());
      },
    })
  );

  const isLoading = marketTab === "poultry" ? poultryQuery.isLoading : eggQuery.isLoading;
  const poultryAds = poultryQuery.data?.ads || [];
  const eggAds = eggQuery.data?.ads || [];

  return (
    <>
      <Stack.Screen
        options={{
          title: "مراجعة إعلانات السوق",
          headerStyle: { backgroundColor: "#064E3B" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.tabs}>
          {MARKET_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, marketTab === tab.key && styles.tabActive]}
              onPress={() => setMarketTab(tab.key)}
            >
              <Text style={[styles.tabText, marketTab === tab.key && styles.tabTextActive]}>
                {tab.label}
                {tab.key === "poultry" && poultryAds.length > 0 && (
                  <Text style={styles.tabBadge}> ({poultryAds.length})</Text>
                )}
                {tab.key === "eggs" && eggAds.length > 0 && (
                  <Text style={styles.tabBadge}> ({eggAds.length})</Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ flex: 1, marginTop: 40 }} color={COLORS.primary} size="large" />
        ) : marketTab === "poultry" ? (
          poultryAds.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>لا توجد إعلانات معلقة</Text>
            </View>
          ) : (
            <FlatList
              data={poultryAds}
              keyExtractor={(item: any) => item.id.toString()}
              contentContainerStyle={styles.list}
              onRefresh={poultryQuery.refetch}
              refreshing={poultryQuery.isLoading}
              renderItem={({ item }: { item: any }) => (
                <View style={styles.card}>
                  <View style={styles.cardRow}>
                    {item.images?.[0] ? (
                      <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
                    ) : (
                      <View style={styles.cardImagePlaceholder}>
                        <Text style={styles.cardImageIcon}>🐔</Text>
                      </View>
                    )}
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{POULTRY_TYPE_LABELS[item.poultryType] || item.poultryType}</Text>
                      {item.breed && <Text style={styles.cardSub}>{item.breed}</Text>}
                      <Text style={styles.cardDetail}>الكمية: {item.quantity} طير</Text>
                      {item.pricePerUnit && <Text style={styles.cardPrice}>{Number(item.pricePerUnit).toLocaleString()} د.ع</Text>}
                      <Text style={styles.cardDetail}>{item.governorate}</Text>
                      {item.sellerName && <Text style={styles.cardDetail}>البائع: {item.sellerName}</Text>}
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => poultryApproveMutation.mutate({ adId: item.id, action: "approve" })}
                    >
                      <Check size={14} color={COLORS.white} />
                      <Text style={styles.actionBtnText}>موافقة</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => poultryDeleteMutation.mutate({ adId: item.id })}
                    >
                      <Trash2 size={14} color={COLORS.white} />
                      <Text style={styles.actionBtnText}>حذف</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )
        ) : (
          eggAds.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>لا توجد إعلانات</Text>
            </View>
          ) : (
            <FlatList
              data={eggAds}
              keyExtractor={(item: any) => item.id.toString()}
              contentContainerStyle={styles.list}
              onRefresh={eggQuery.refetch}
              refreshing={eggQuery.isLoading}
              renderItem={({ item }: { item: any }) => (
                <View style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={styles.cardImagePlaceholder}>
                      <Text style={styles.cardImageIcon}>🥚</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{EGG_TYPE_LABELS[item.eggType] || item.eggType}</Text>
                      <Text style={styles.cardDetail}>الكمية: {item.quantity} {item.unit === "tray" ? "طاقة" : item.unit}</Text>
                      {item.pricePerUnit && <Text style={styles.cardPrice}>{Number(item.pricePerUnit).toLocaleString()} د.ع</Text>}
                      <Text style={styles.cardDetail}>{item.governorate}</Text>
                      {item.sellerName && <Text style={styles.cardDetail}>البائع: {item.sellerName}</Text>}
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => eggApproveMutation.mutate({ adId: item.id, action: "approve" })}
                    >
                      <Check size={14} color={COLORS.white} />
                      <Text style={styles.actionBtnText}>موافقة</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => eggDeleteMutation.mutate({ adId: item.id })}
                    >
                      <Trash2 size={14} color={COLORS.white} />
                      <Text style={styles.actionBtnText}>حذف</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  tabs: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#064E3B" },
  tabText: { fontSize: 14, color: COLORS.darkGray, fontWeight: "500" },
  tabTextActive: { color: "#064E3B", fontWeight: "700" },
  tabBadge: { color: COLORS.error },
  list: { padding: 16 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: COLORS.darkGray },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: { flexDirection: "row-reverse", gap: 10, marginBottom: 10 },
  cardImage: { width: 80, height: 80, borderRadius: 8 },
  cardImagePlaceholder: {
    width: 80, height: 80, borderRadius: 8,
    backgroundColor: "#F0FDF4", justifyContent: "center", alignItems: "center",
  },
  cardImageIcon: { fontSize: 30 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: COLORS.black, textAlign: "right", marginBottom: 2 },
  cardSub: { fontSize: 12, color: COLORS.darkGray, textAlign: "right" },
  cardDetail: { fontSize: 12, color: COLORS.darkGray, textAlign: "right", marginTop: 2 },
  cardPrice: { fontSize: 14, fontWeight: "700", color: "#059669", textAlign: "right", marginTop: 2 },
  actions: { flexDirection: "row-reverse", gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 8,
    gap: 4,
  },
  approveBtn: { backgroundColor: "#059669" },
  deleteBtn: { backgroundColor: COLORS.error },
  actionBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 13 },
});
