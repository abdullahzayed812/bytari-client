/**
 * admin-poultry-traders-management.tsx
 * Admin screen — manage poultry trader accounts (approve/suspend).
 */
import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, Calendar, RefreshCw, XCircle, CheckCircle, AlertTriangle, ChevronLeft } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";
import { useToastContext } from "../providers/ToastProvider";

const STATUS_TABS = [
  { key: "pending", label: "معلق" },
  { key: "active", label: "نشط" },
  { key: "suspended", label: "موقوف" },
];

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

export default function AdminPoultryTradersManagementScreen() {
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");

  // Detail modal
  const [selectedTrader, setSelectedTrader] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Activate modal
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedTraderId, setSelectedTraderId] = useState<number | null>(null);
  const [activationStartDate, setActivationStartDate] = useState("1/1/2026");
  const [activationEndDate, setActivationEndDate] = useState("1/1/2027");

  // Confirm modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    confirmColor: string;
    onConfirm: () => void;
  } | null>(null);

  const { data, isLoading, refetch } = useQuery(trpc.poultry.traders.list.queryOptions({ status: statusFilter as any }));

  const activateMutation = useMutation(trpc.poultry.traders.activate.mutationOptions());

  const updateStatusMutation = useMutation(
    trpc.poultry.traders.updateStatus.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم تحديث الحالة" });
        queryClient.invalidateQueries(trpc.poultry.traders.list.queryKey() as any);
        setShowDetailModal(false);
        setShowConfirmModal(false);
      },
      onError: (e: any) => showToast({ type: "error", message: e.message }),
    }),
  );

  const parseDate = (str: string) => {
    const [day, month, year] = str.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("ar-SA");
  };

  const getDaysRemaining = (endDate: string | null | undefined) => {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const openActivateModal = (traderId: number) => {
    setSelectedTraderId(traderId);
    setActivationStartDate("1/1/2026");
    setActivationEndDate("1/1/2027");
    setShowDetailModal(false);
    setShowActivateModal(true);
  };

  const requestConfirm = (config: typeof confirmConfig) => {
    setConfirmConfig(config);
    setShowConfirmModal(true);
  };

  const confirmActivate = useCallback(() => {
    if (!selectedTraderId || !activationStartDate || !activationEndDate) {
      showToast({ type: "error", message: "يجب تحديد تواريخ التفعيل (يوم/شهر/سنة)" });
      return;
    }
    activateMutation.mutate(
      {
        traderId: selectedTraderId,
        activationStartDate: parseDate(activationStartDate),
        activationEndDate: parseDate(activationEndDate),
      },
      {
        onSuccess: () => {
          showToast({ type: "success", message: "تم تفعيل / تجديد حساب التاجر بنجاح" });
          queryClient.invalidateQueries(trpc.poultry.traders.list.queryKey() as any);
          setShowActivateModal(false);
          setSelectedTraderId(null);
        },
        onError: (e: any) => showToast({ type: "error", message: e.message }),
      },
    );
  }, [selectedTraderId, activationStartDate, activationEndDate]);

  const traders = data?.traders || [];

  const renderDetailModal = () => {
    if (!selectedTrader) return null;
    const daysRemaining = getDaysRemaining(selectedTrader.activationEndDate);
    const isExpired = daysRemaining !== null && daysRemaining < 1;
    const isExpiringSoon = !isExpired && daysRemaining !== null && daysRemaining <= 30;

    return (
      <Modal visible={showDetailModal} animationType="slide" transparent onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.detailOverlay}>
          <View style={styles.detailContent}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>تفاصيل التاجر</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <XCircle size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
              {selectedTrader.reviewingRenewalRequest && (
                <View style={[styles.infoBanner, { backgroundColor: "#FEF3C7", borderColor: "#FCD34D" }]}>
                  <RefreshCw size={15} color="#D97706" />
                  <Text style={[styles.infoBannerText, { color: "#92400E" }]}>طلب تجديد قيد المراجعة</Text>
                </View>
              )}
              {isExpired && (
                <View style={[styles.infoBanner, { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }]}>
                  <AlertTriangle size={15} color={COLORS.error} />
                  <Text style={[styles.infoBannerText, { color: COLORS.error }]}>الاشتراك منتهي</Text>
                </View>
              )}
              {isExpiringSoon && (
                <View style={[styles.infoBanner, { backgroundColor: "#FEF3C7", borderColor: "#FCD34D" }]}>
                  <Calendar size={15} color="#D97706" />
                  <Text style={[styles.infoBannerText, { color: "#92400E" }]}>ينتهي الاشتراك خلال {daysRemaining} يوم</Text>
                </View>
              )}

              <View style={styles.detailSection}>
                <View style={styles.detailSectionHeader}>
                  <Text style={styles.detailSectionTitle}>معلومات التاجر</Text>
                  <View style={[
                    styles.statusBadge,
                    selectedTrader.status === "active" ? styles.statusActive :
                    selectedTrader.status === "pending" ? styles.statusPending : styles.statusSuspended,
                  ]}>
                    <Text style={styles.statusText}>
                      {selectedTrader.status === "active" ? "نشط" : selectedTrader.status === "pending" ? "معلق" : "موقوف"}
                    </Text>
                  </View>
                </View>
                <InfoRow label="اسم النشاط" value={selectedTrader.businessName || "—"} />
                {selectedTrader.tradeType && <InfoRow label="نوع التداول" value={selectedTrader.tradeType} />}
                {selectedTrader.governorate && <InfoRow label="المحافظة" value={selectedTrader.governorate} />}
                {selectedTrader.phone && <InfoRow label="الهاتف" value={selectedTrader.phone} />}
                {selectedTrader.email && <InfoRow label="البريد الإلكتروني" value={selectedTrader.email} />}
                {selectedTrader.licenseNumber && <InfoRow label="رقم الرخصة" value={selectedTrader.licenseNumber} />}
                {selectedTrader.description && <InfoRow label="الوصف" value={selectedTrader.description} />}
              </View>

              {(selectedTrader.userName || selectedTrader.userEmail || selectedTrader.userPhone) && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>معلومات المالك</Text>
                  {selectedTrader.userName && <InfoRow label="الاسم" value={selectedTrader.userName} />}
                  {selectedTrader.userEmail && <InfoRow label="البريد" value={selectedTrader.userEmail} />}
                  {selectedTrader.userPhone && <InfoRow label="الهاتف" value={selectedTrader.userPhone} />}
                </View>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>الاشتراك</Text>
                {selectedTrader.activationStartDate && (
                  <InfoRow label="تاريخ البدء" value={formatDate(selectedTrader.activationStartDate)} />
                )}
                {selectedTrader.activationEndDate && (
                  <InfoRow
                    label="تاريخ الانتهاء"
                    value={formatDate(selectedTrader.activationEndDate)}
                    valueColor={isExpired ? COLORS.error : isExpiringSoon ? "#D97706" : undefined}
                  />
                )}
                {daysRemaining !== null && (
                  <InfoRow
                    label="الأيام المتبقية"
                    value={daysRemaining > 0 ? `${daysRemaining} يوم` : "منتهي"}
                    valueColor={isExpired ? COLORS.error : isExpiringSoon ? "#D97706" : "#059669"}
                  />
                )}
                <InfoRow label="تاريخ التسجيل" value={new Date(selectedTrader.createdAt).toLocaleDateString("ar-SA")} />
              </View>
            </ScrollView>

            <View style={styles.detailActions}>
              {selectedTrader.status === "pending" && (
                <TouchableOpacity style={[styles.detailActionBtn, { backgroundColor: "#059669" }]} onPress={() => openActivateModal(selectedTrader.id)}>
                  <CheckCircle size={15} color="#fff" />
                  <Text style={styles.detailActionText}>تفعيل</Text>
                </TouchableOpacity>
              )}
              {selectedTrader.reviewingRenewalRequest && selectedTrader.status === "active" && (
                <TouchableOpacity style={[styles.detailActionBtn, { backgroundColor: "#0284C7" }]} onPress={() => openActivateModal(selectedTrader.id)}>
                  <RefreshCw size={15} color="#fff" />
                  <Text style={styles.detailActionText}>قبول التجديد</Text>
                </TouchableOpacity>
              )}
              {selectedTrader.status === "active" && (
                <TouchableOpacity
                  style={[styles.detailActionBtn, { backgroundColor: "#D97706" }]}
                  onPress={() => requestConfirm({
                    title: "تعليق الحساب",
                    message: `هل تريد تعليق حساب "${selectedTrader.businessName}"؟`,
                    confirmText: "تعليق",
                    confirmColor: "#D97706",
                    onConfirm: () => updateStatusMutation.mutate({ traderId: selectedTrader.id, status: "suspended" }),
                  })}
                >
                  <X size={15} color="#fff" />
                  <Text style={styles.detailActionText}>تعليق</Text>
                </TouchableOpacity>
              )}
              {selectedTrader.status === "suspended" && (
                <TouchableOpacity
                  style={[styles.detailActionBtn, { backgroundColor: "#059669" }]}
                  onPress={() => requestConfirm({
                    title: "إعادة تفعيل التاجر",
                    message: `هل تريد إعادة تفعيل حساب "${selectedTrader.businessName}"؟`,
                    confirmText: "إعادة التفعيل",
                    confirmColor: "#059669",
                    onConfirm: () => updateStatusMutation.mutate({ traderId: selectedTrader.id, status: "active" }),
                  })}
                >
                  <Check size={15} color="#fff" />
                  <Text style={styles.detailActionText}>إعادة تفعيل</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.detailActionBtn, { backgroundColor: COLORS.error }]}
                onPress={() => requestConfirm({
                  title: "رفض الطلب",
                  message: `هل تريد رفض حساب "${selectedTrader.businessName}" نهائياً؟`,
                  confirmText: "رفض",
                  confirmColor: COLORS.error,
                  onConfirm: () => updateStatusMutation.mutate({ traderId: selectedTrader.id, status: "cancelled" }),
                })}
              >
                <X size={15} color="#fff" />
                <Text style={styles.detailActionText}>رفض</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

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
        {/* Confirm Modal */}
        <Modal visible={showConfirmModal} animationType="fade" transparent>
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmContent}>
              <Text style={styles.confirmTitle}>{confirmConfig?.title}</Text>
              <Text style={styles.confirmMessage}>{confirmConfig?.message}</Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity style={styles.confirmCancelBtn} onPress={() => setShowConfirmModal(false)}>
                  <Text style={styles.confirmCancelText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmActionBtn, { backgroundColor: confirmConfig?.confirmColor || COLORS.primary }]}
                  onPress={() => { confirmConfig?.onConfirm(); }}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmActionText}>{confirmConfig?.confirmText}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Activate Modal */}
        <Modal visible={showActivateModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>تحديد تواريخ التفعيل</Text>
                <TouchableOpacity onPress={() => { setShowActivateModal(false); setSelectedTraderId(null); }}>
                  <XCircle size={24} color="#999" />
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>تاريخ البدء (يوم/شهر/سنة):</Text>
              <TextInput
                style={styles.dateInput}
                value={activationStartDate}
                onChangeText={setActivationStartDate}
                placeholder="مثال: 1/1/2026"
                placeholderTextColor="#aaa"
                textAlign="right"
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>تاريخ الانتهاء (يوم/شهر/سنة):</Text>
              <TextInput
                style={styles.dateInput}
                value={activationEndDate}
                onChangeText={setActivationEndDate}
                placeholder="مثال: 1/1/2027"
                placeholderTextColor="#aaa"
                textAlign="right"
              />

              <Text style={styles.dateNote}>سيتم تفعيل حساب التاجر من تاريخ البدء حتى تاريخ الانتهاء</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelModalBtn]}
                  onPress={() => { setShowActivateModal(false); setSelectedTraderId(null); }}
                >
                  <Text style={styles.cancelModalBtnText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.confirmModalBtn]}
                  onPress={confirmActivate}
                  disabled={activateMutation.isPending}
                >
                  {activateMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <CheckCircle size={18} color="#fff" />
                      <Text style={styles.confirmModalBtnText}>تفعيل</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Status Tabs */}
        <View style={styles.tabs}>
          {STATUS_TABS.map((tab) => (
            <TouchableOpacity key={tab.key} style={[styles.tab, statusFilter === tab.key && styles.tabActive]} onPress={() => setStatusFilter(tab.key)}>
              <Text style={[styles.tabText, statusFilter === tab.key && styles.tabTextActive]}>{tab.label}</Text>
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
            renderItem={({ item }: { item: any }) => {
              const days = item.activationEndDate
                ? Math.ceil((new Date(item.activationEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => { setSelectedTrader(item); setShowDetailModal(true); }}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.traderName}>{item.businessName}</Text>
                    <View style={[
                      styles.statusBadge,
                      item.status === "active" ? styles.statusActive :
                      item.status === "pending" ? styles.statusPending : styles.statusSuspended,
                    ]}>
                      <Text style={styles.statusText}>
                        {item.status === "active" ? "نشط" : item.status === "pending" ? "معلق" : "موقوف"}
                      </Text>
                    </View>
                  </View>

                  {item.tradeType && (
                    <View style={styles.detail}>
                      <Text style={styles.detailLabel}>النوع:</Text>
                      <Text style={styles.detailValue}>{item.tradeType}</Text>
                    </View>
                  )}
                  {item.governorate && (
                    <View style={styles.detail}>
                      <Text style={styles.detailLabel}>المحافظة:</Text>
                      <Text style={styles.detailValue}>{item.governorate}</Text>
                    </View>
                  )}
                  {item.phone && (
                    <View style={styles.detail}>
                      <Text style={styles.detailLabel}>الهاتف:</Text>
                      <Text style={styles.detailValue}>{item.phone}</Text>
                    </View>
                  )}
                  {(item.userName || item.ownerName) && (
                    <View style={styles.detail}>
                      <Text style={styles.detailLabel}>المالك:</Text>
                      <Text style={styles.detailValue}>{item.userName || item.ownerName}</Text>
                    </View>
                  )}

                  {item.activationEndDate && days !== null && (
                    <View style={styles.detail}>
                      <Calendar size={13} color={days < 1 ? COLORS.error : days < 30 ? "#D97706" : COLORS.success} />
                      <Text style={styles.detailLabel}>ينتهي:</Text>
                      <Text style={[styles.detailValue, { color: days < 1 ? COLORS.error : days < 30 ? "#D97706" : COLORS.black }]}>
                        {new Date(item.activationEndDate).toLocaleDateString("ar-SA")} ({days} يوم)
                      </Text>
                    </View>
                  )}

                  {item.reviewingRenewalRequest && (
                    <View style={styles.renewalBanner}>
                      <RefreshCw size={14} color="#D97706" />
                      <Text style={styles.renewalBannerText}>يوجد طلب تجديد قيد المراجعة</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() => { setSelectedTrader(item); setShowDetailModal(true); }}
                  >
                    <Text style={styles.detailsBtnText}>التفاصيل والإجراءات</Text>
                    <ChevronLeft size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>

      {renderDetailModal()}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  tabs: {
    flexDirection: "row",
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
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  traderName: { fontSize: 15, fontWeight: "700", color: COLORS.black, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, marginLeft: 8 },
  statusActive: { backgroundColor: "#D1FAE5" },
  statusPending: { backgroundColor: "#FEF3C7" },
  statusSuspended: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 11, fontWeight: "600", color: COLORS.black },
  detail: { flexDirection: "row", marginBottom: 4, gap: 6, alignItems: "center" },
  detailLabel: { fontSize: 13, color: COLORS.darkGray, fontWeight: "500" },
  detailValue: { fontSize: 13, color: COLORS.black, flex: 1 },
  renewalBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  renewalBannerText: { fontSize: 12, color: "#92400E", fontWeight: "600", flex: 1 },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  detailsBtnText: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },

  // Detail modal
  detailOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  detailContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailTitle: { fontSize: 17, fontWeight: "700", color: COLORS.black },
  detailScroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  infoBannerText: { fontSize: 13, fontWeight: "600", flex: 1 },
  detailSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailSectionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.darkGray, marginBottom: 8, textAlign: "right" },
  infoRow: { flexDirection: "row-reverse", justifyContent: "space-between", paddingVertical: 4 },
  infoLabel: { fontSize: 13, color: COLORS.darkGray, flex: 1, textAlign: "right" },
  infoValue: { fontSize: 13, fontWeight: "600", color: COLORS.black, flex: 2, textAlign: "right" },
  detailActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  detailActionBtn: {
    flex: 1,
    minWidth: "40%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 5,
  },
  detailActionText: { color: COLORS.white, fontWeight: "700", fontSize: 13 },

  // Confirm modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  confirmContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "100%",
  },
  confirmTitle: { fontSize: 16, fontWeight: "700", color: COLORS.black, textAlign: "right", marginBottom: 8 },
  confirmMessage: { fontSize: 14, color: COLORS.darkGray, textAlign: "right", lineHeight: 22, marginBottom: 20 },
  confirmButtons: { flexDirection: "row", gap: 10 },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  confirmCancelText: { fontSize: 14, color: COLORS.darkGray, fontWeight: "600" },
  confirmActionBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmActionText: { fontSize: 14, color: COLORS.white, fontWeight: "700" },

  // Activate modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: COLORS.black },
  fieldLabel: { fontSize: 13, color: COLORS.darkGray, fontWeight: "500", marginBottom: 6 },
  dateInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.black,
    backgroundColor: "#F9FAFB",
  },
  dateNote: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  modalButtons: { flexDirection: "row", gap: 10, marginTop: 16 },
  modalBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 8,
    gap: 6,
  },
  cancelModalBtn: { backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#D1D5DB" },
  cancelModalBtnText: { color: COLORS.darkGray, fontWeight: "600", fontSize: 14 },
  confirmModalBtn: { backgroundColor: "#059669" },
  confirmModalBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
});
