/**
 * admin-poultry-traders-management.tsx
 * Admin screen — manage poultry trader accounts (approve/suspend).
 */
import React, { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, Clock } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";
import { useToastContext } from "../providers/ToastProvider";

const STATUS_TABS = [
  { key: "pending", label: "معلق" },
  { key: "active", label: "نشط" },
  { key: "suspended", label: "موقوف" },
];

export default function AdminPoultryTradersManagementScreen() {
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");

  const { data, isLoading, refetch } = useQuery(
    trpc.poultry.traders.list.queryOptions({ status: statusFilter as any })
  );

  const activateMutation = useMutation(
    trpc.poultry.traders.activate.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم تفعيل حساب التاجر" });
        queryClient.invalidateQueries(trpc.poultry.traders.list.queryKey());
      },
      onError: (e: any) => showToast({ type: "error", message: e.message }),
    })
  );

  const updateStatusMutation = useMutation(
    trpc.poultry.traders.updateStatus.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم تحديث الحالة" });
        queryClient.invalidateQueries(trpc.poultry.traders.list.queryKey());
      },
    })
  );

  const traders = data?.traders || [];

  return (
    <>
      <Stack.Screen
        options={{
          title: "إدارة تجار الدواجن",
          headerStyle: { backgroundColor: "#064E3B" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {/* Status Tabs */}
        <View style={styles.tabs}>
          {STATUS_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, statusFilter === tab.key && styles.tabActive]}
              onPress={() => setStatusFilter(tab.key)}
            >
              <Text style={[styles.tabText, statusFilter === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ flex: 1, marginTop: 40 }} color={COLORS.primary} size="large" />
        ) : traders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>لا يوجد تجار في هذه الفئة</Text>
          </View>
        ) : (
          <FlatList
            data={traders}
            keyExtractor={(item: any) => item.id.toString()}
            contentContainerStyle={styles.list}
            onRefresh={refetch}
            refreshing={isLoading}
            renderItem={({ item }: { item: any }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.traderName}>{item.businessName}</Text>
                  <View style={[
                    styles.statusBadge,
                    item.status === "active" ? styles.statusActive :
                    item.status === "pending" ? styles.statusPending :
                    styles.statusSuspended
                  ]}>
                    <Text style={styles.statusText}>{
                      item.status === "active" ? "نشط" :
                      item.status === "pending" ? "معلق" : "موقوف"
                    }</Text>
                  </View>
                </View>

                <View style={styles.detail}>
                  <Text style={styles.detailLabel}>النوع:</Text>
                  <Text style={styles.detailValue}>{item.traderType}</Text>
                </View>
                <View style={styles.detail}>
                  <Text style={styles.detailLabel}>المحافظة:</Text>
                  <Text style={styles.detailValue}>{item.governorate}</Text>
                </View>
                <View style={styles.detail}>
                  <Text style={styles.detailLabel}>الهاتف:</Text>
                  <Text style={styles.detailValue}>{item.phone}</Text>
                </View>
                {item.ownerName && (
                  <View style={styles.detail}>
                    <Text style={styles.detailLabel}>المالك:</Text>
                    <Text style={styles.detailValue}>{item.ownerName}</Text>
                  </View>
                )}

                <View style={styles.actions}>
                  {item.status === "pending" && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => activateMutation.mutate({ traderId: item.id, durationDays: 365 })}
                    >
                      <Check size={14} color={COLORS.white} />
                      <Text style={styles.actionBtnText}>تفعيل</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === "active" && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.suspendBtn]}
                      onPress={() => updateStatusMutation.mutate({ traderId: item.id, status: "suspended" })}
                    >
                      <X size={14} color={COLORS.white} />
                      <Text style={styles.actionBtnText}>تعليق</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === "suspended" && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => updateStatusMutation.mutate({ traderId: item.id, status: "active" })}
                    >
                      <Check size={14} color={COLORS.white} />
                      <Text style={styles.actionBtnText}>إعادة تفعيل</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => updateStatusMutation.mutate({ traderId: item.id, status: "rejected" })}
                  >
                    <X size={14} color={COLORS.white} />
                    <Text style={styles.actionBtnText}>رفض</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
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
  tabText: { fontSize: 13, color: COLORS.darkGray, fontWeight: "500" },
  tabTextActive: { color: "#064E3B", fontWeight: "700" },
  list: { padding: 16 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: COLORS.darkGray },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  traderName: { fontSize: 15, fontWeight: "700", color: COLORS.black, flex: 1, textAlign: "right" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, marginLeft: 8 },
  statusActive: { backgroundColor: "#D1FAE5" },
  statusPending: { backgroundColor: "#FEF3C7" },
  statusSuspended: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 11, fontWeight: "600", color: COLORS.black },
  detail: { flexDirection: "row-reverse", marginBottom: 4, gap: 6 },
  detailLabel: { fontSize: 13, color: COLORS.darkGray, fontWeight: "500" },
  detailValue: { fontSize: 13, color: COLORS.black, flex: 1, textAlign: "right" },
  actions: { flexDirection: "row-reverse", gap: 8, marginTop: 12 },
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
  suspendBtn: { backgroundColor: "#D97706" },
  rejectBtn: { backgroundColor: COLORS.error },
  actionBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 13 },
});
