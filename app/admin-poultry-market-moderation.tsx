/**
 * admin-poultry-market-moderation.tsx
 * Admin screen — review and approve/delete pending poultry & egg market ads.
 */
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Modal, ScrollView, Linking } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, X, Phone, MessageCircle, MapPin, Clock, ChevronLeft, AlertTriangle } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";
import { useToastContext } from "../providers/ToastProvider";
import { POULTRY_TYPE_LABELS } from "../components/poultry/PoultryMarketCard";
import { EGG_TYPE_LABELS } from "../components/poultry/EggMarketCard";

const MARKET_TABS = [
  { key: "poultry", label: "الدواجن" },
  { key: "eggs", label: "البيض" },
];

const PRICING_METHOD_LABELS: Record<string, string> = {
  per_tray: "لكل طبقة",
  per_carton: "لكل كرتون",
  per_piece: "للقطعة",
  per_unit: "للوحدة",
};

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

function formatDateTime(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleDateString("ar-SA") + " • " + d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminPoultryMarketModerationScreen() {
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();
  const [marketTab, setMarketTab] = useState("poultry");

  // Detail modal
  const [selectedAd, setSelectedAd] = useState<any | null>(null);
  const [selectedAdType, setSelectedAdType] = useState<"poultry" | "eggs">("poultry");
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Confirm modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    confirmColor: string;
    onConfirm: () => void;
  } | null>(null);

  const poultryQuery = useQuery(trpc.poultry.market.getPending.queryOptions());
  const eggQuery = useQuery(trpc.poultry.eggMarket.getPending.queryOptions());

  const poultryApproveMutation = useMutation(
    trpc.poultry.market.review.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم الإجراء بنجاح" });
        queryClient.invalidateQueries(trpc.poultry.market.getPending.queryKey());
        queryClient.invalidateQueries(trpc.poultry.market.list.queryKey());
        setShowDetailModal(false);
        setShowConfirmModal(false);
      },
      onError: (e: any) => showToast({ type: "error", message: e.message }),
    }),
  );

  const eggApproveMutation = useMutation(
    trpc.poultry.eggMarket.review.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم الإجراء بنجاح" });
        queryClient.invalidateQueries(trpc.poultry.eggMarket.getPending.queryKey());
        queryClient.invalidateQueries(trpc.poultry.eggMarket.list.queryKey());
        setShowDetailModal(false);
        setShowConfirmModal(false);
      },
      onError: (e: any) => showToast({ type: "error", message: e.message }),
    }),
  );

  const poultryDeleteMutation = useMutation(
    trpc.poultry.market.adminDelete.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم حذف الإعلان" });
        queryClient.invalidateQueries(trpc.poultry.market.getPending.queryKey());
        queryClient.invalidateQueries(trpc.poultry.market.list.queryKey());
        setShowDetailModal(false);
        setShowConfirmModal(false);
      },
    }),
  );

  const eggDeleteMutation = useMutation(
    trpc.poultry.eggMarket.adminDelete.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم حذف الإعلان" });
        queryClient.invalidateQueries(trpc.poultry.eggMarket.getPending.queryKey());
        queryClient.invalidateQueries(trpc.poultry.eggMarket.list.queryKey());
        setShowDetailModal(false);
        setShowConfirmModal(false);
      },
    }),
  );

  const isLoading = marketTab === "poultry" ? poultryQuery.isLoading : eggQuery.isLoading;
  const poultryAds = poultryQuery.data?.ads || [];
  const eggAds = eggQuery.data?.ads || [];

  const requestConfirm = (config: typeof confirmConfig) => {
    setConfirmConfig(config);
    setShowConfirmModal(true);
  };

  const openDetail = (ad: any, type: "poultry" | "eggs") => {
    setSelectedAd(ad);
    setSelectedAdType(type);
    setShowDetailModal(true);
  };

  const isPending = poultryApproveMutation.isPending || eggApproveMutation.isPending || poultryDeleteMutation.isPending || eggDeleteMutation.isPending;

  const renderDetailModal = () => {
    if (!selectedAd) return null;
    const isPoultry = selectedAdType === "poultry";
    const typeLabel = isPoultry
      ? POULTRY_TYPE_LABELS[selectedAd.poultryType] || selectedAd.poultryType
      : EGG_TYPE_LABELS[selectedAd.eggType] || selectedAd.eggType;
    const icon = isPoultry ? "🐔" : "🥚";
    const unitLabel = isPoultry
      ? selectedAd.unit === "bird"
        ? "طير"
        : selectedAd.unit
      : selectedAd.unit === "tray"
        ? "طبقة"
        : selectedAd.unit === "carton"
          ? "كرتون"
          : selectedAd.unit;

    return (
      <Modal visible={showDetailModal} animationType="slide" transparent onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.detailOverlay}>
          <View style={styles.detailContent}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>
                {icon} {typeLabel}
              </Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <X size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedAd.images && selectedAd.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                  {selectedAd.images.map((uri: string, i: number) => (
                    <Image key={i} source={{ uri }} style={styles.modalImage} />
                  ))}
                </ScrollView>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>معلومات الإعلان</Text>
                {isPoultry && selectedAd.breed && <DetailRow label="السلالة" value={selectedAd.breed} />}
                <DetailRow label="الكمية" value={`${Number(selectedAd.quantity).toLocaleString()} ${unitLabel}`} />
                {selectedAd.pricePerUnit && (
                  <DetailRow label="السعر للوحدة" value={`${Number(selectedAd.pricePerUnit).toLocaleString()} د.ع`} valueColor="#059669" />
                )}
                {selectedAd.totalPrice && (
                  <DetailRow label="السعر الإجمالي" value={`${Number(selectedAd.totalPrice).toLocaleString()} د.ع`} valueColor="#059669" />
                )}
                {isPoultry && selectedAd.ageWeeks != null && <DetailRow label="العمر" value={`${selectedAd.ageWeeks} أسبوع`} />}
                {isPoultry && selectedAd.weightKg && <DetailRow label="الوزن" value={`${selectedAd.weightKg} كغ`} />}
                {!isPoultry && selectedAd.pricingMethod && (
                  <DetailRow label="طريقة التسعير" value={PRICING_METHOD_LABELS[selectedAd.pricingMethod] || selectedAd.pricingMethod} />
                )}
                {!isPoultry && selectedAd.productionDate && (
                  <DetailRow label="تاريخ الإنتاج" value={new Date(selectedAd.productionDate).toLocaleDateString("ar-SA")} />
                )}
              </View>

              {(selectedAd.governorate || selectedAd.region) && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>الموقع</Text>
                  {selectedAd.governorate && <DetailRow label="المحافظة" value={selectedAd.governorate} />}
                  {selectedAd.region && <DetailRow label="المنطقة" value={selectedAd.region} />}
                </View>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>معلومات البائع</Text>
                {selectedAd.sellerName && <DetailRow label="الاسم" value={selectedAd.sellerName} />}
                {selectedAd.contactPhone && <DetailRow label="الهاتف" value={selectedAd.contactPhone} />}
                {selectedAd.contactWhatsapp && <DetailRow label="واتساب" value={selectedAd.contactWhatsapp} />}
              </View>

              {selectedAd.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>ملاحظات</Text>
                  <Text style={styles.notesText}>{selectedAd.notes}</Text>
                </View>
              )}

              <View style={[styles.detailSection, { borderBottomWidth: 0 }]}>
                <DetailRow label="تاريخ النشر" value={formatDateTime(selectedAd.createdAt)} />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              {selectedAd.contactWhatsapp && (
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: "#25D366" }]}
                  onPress={() => Linking.openURL(`https://wa.me/${selectedAd.contactWhatsapp.replace(/\D/g, "")}`)}
                >
                  <MessageCircle size={16} color="#fff" />
                  <Text style={styles.modalActionText}>واتساب</Text>
                </TouchableOpacity>
              )}
              {selectedAd.contactPhone && (
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: COLORS.primary }]}
                  onPress={() => Linking.openURL(`tel:${selectedAd.contactPhone}`)}
                >
                  <Phone size={16} color="#fff" />
                  <Text style={styles.modalActionText}>اتصال</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: "#059669" }]}
                onPress={() =>
                  requestConfirm({
                    title: "الموافقة على الإعلان",
                    message: "هل تريد الموافقة على هذا الإعلان ونشره في السوق؟",
                    confirmText: "موافقة",
                    confirmColor: "#059669",
                    onConfirm: () =>
                      isPoultry
                        ? poultryApproveMutation.mutate({ adId: selectedAd.id, action: "approve" })
                        : eggApproveMutation.mutate({ adId: selectedAd.id, action: "approve" }),
                  })
                }
              >
                <Check size={16} color="#fff" />
                <Text style={styles.modalActionText}>موافقة</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: COLORS.error }]}
                onPress={() =>
                  requestConfirm({
                    title: "حذف الإعلان",
                    message: "هل تريد حذف هذا الإعلان نهائياً؟",
                    confirmText: "حذف",
                    confirmColor: COLORS.error,
                    onConfirm: () => (isPoultry ? poultryDeleteMutation.mutate({ adId: selectedAd.id }) : eggDeleteMutation.mutate({ adId: selectedAd.id })),
                  })
                }
              >
                <Trash2 size={16} color="#fff" />
                <Text style={styles.modalActionText}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderPoultryCard = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.card} onPress={() => openDetail(item, "poultry")} activeOpacity={0.8}>
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
          {item.governorate && (
            <View style={styles.cardMeta}>
              <MapPin size={11} color={COLORS.darkGray} />
              <Text style={styles.cardDetail}>{item.governorate}</Text>
            </View>
          )}
          {item.sellerName && <Text style={styles.cardDetail}>البائع: {item.sellerName}</Text>}
          <View style={styles.cardMeta}>
            <Clock size={11} color={COLORS.darkGray} />
            <Text style={styles.cardDetail}>{formatDateTime(item.createdAt)}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.detailsBtn} onPress={() => openDetail(item, "poultry")}>
        <Text style={styles.detailsBtnText}>التفاصيل والإجراءات</Text>
        <ChevronLeft size={14} color={COLORS.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEggCard = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.card} onPress={() => openDetail(item, "eggs")} activeOpacity={0.8}>
      <View style={styles.cardRow}>
        <View style={[styles.cardImagePlaceholder, { backgroundColor: "#FFFBEB" }]}>
          <Text style={styles.cardImageIcon}>🥚</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{EGG_TYPE_LABELS[item.eggType] || item.eggType}</Text>
          <Text style={styles.cardDetail}>
            الكمية: {item.quantity} {item.unit === "tray" ? "طبقة" : item.unit}
          </Text>
          {item.pricePerUnit && <Text style={styles.cardPrice}>{Number(item.pricePerUnit).toLocaleString()} د.ع</Text>}
          {item.governorate && (
            <View style={styles.cardMeta}>
              <MapPin size={11} color={COLORS.darkGray} />
              <Text style={styles.cardDetail}>{item.governorate}</Text>
            </View>
          )}
          {item.sellerName && <Text style={styles.cardDetail}>البائع: {item.sellerName}</Text>}
          <View style={styles.cardMeta}>
            <Clock size={11} color={COLORS.darkGray} />
            <Text style={styles.cardDetail}>{formatDateTime(item.createdAt)}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.detailsBtn} onPress={() => openDetail(item, "eggs")}>
        <Text style={styles.detailsBtnText}>التفاصيل والإجراءات</Text>
        <ChevronLeft size={14} color={COLORS.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
        {/* Confirm Modal */}
        <Modal visible={showConfirmModal} animationType="fade" transparent>
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmContent}>
              <View style={styles.confirmIconRow}>
                <AlertTriangle size={22} color={confirmConfig?.confirmColor || COLORS.primary} />
                <Text style={styles.confirmTitle}>{confirmConfig?.title}</Text>
              </View>
              <Text style={styles.confirmMessage}>{confirmConfig?.message}</Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity style={styles.confirmCancelBtn} onPress={() => setShowConfirmModal(false)}>
                  <Text style={styles.confirmCancelText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmActionBtn, { backgroundColor: confirmConfig?.confirmColor || COLORS.primary }]}
                  onPress={() => confirmConfig?.onConfirm()}
                  disabled={isPending}
                >
                  {isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmActionText}>{confirmConfig?.confirmText}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.tabs}>
          {MARKET_TABS.map((tab) => (
            <TouchableOpacity key={tab.key} style={[styles.tab, marketTab === tab.key && styles.tabActive]} onPress={() => setMarketTab(tab.key)}>
              <Text style={[styles.tabText, marketTab === tab.key && styles.tabTextActive]}>
                {tab.label}
                {tab.key === "poultry" && poultryAds.length > 0 && <Text style={styles.tabBadge}> ({poultryAds.length})</Text>}
                {tab.key === "eggs" && eggAds.length > 0 && <Text style={styles.tabBadge}> ({eggAds.length})</Text>}
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
              renderItem={({ item }: { item: any }) => renderPoultryCard(item)}
            />
          )
        ) : eggAds.length === 0 ? (
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
            renderItem={({ item }: { item: any }) => renderEggCard(item)}
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

  // Card
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
  cardRow: { flexDirection: "row-reverse", gap: 10, marginBottom: 8 },
  cardImage: { width: 80, height: 80, borderRadius: 8 },
  cardImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  cardImageIcon: { fontSize: 30 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: COLORS.black, textAlign: "right", marginBottom: 2 },
  cardSub: { fontSize: 12, color: COLORS.darkGray, textAlign: "right" },
  cardDetail: { fontSize: 12, color: COLORS.darkGray, textAlign: "right", marginTop: 2 },
  cardPrice: { fontSize: 14, fontWeight: "700", color: "#059669", textAlign: "right", marginTop: 2 },
  cardMeta: { flexDirection: "row-reverse", alignItems: "center", gap: 4, marginTop: 2 },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
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
    paddingBottom: 8,
  },
  detailHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailTitle: { fontSize: 18, fontWeight: "700", color: COLORS.black },
  imageScroll: { paddingHorizontal: 16, paddingVertical: 10 },
  modalImage: { width: 200, height: 150, borderRadius: 10, marginLeft: 10 },
  detailSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.darkGray, marginBottom: 8, textAlign: "right" },
  detailRow: { flexDirection: "row-reverse", justifyContent: "space-between", paddingVertical: 4 },
  detailLabel: { fontSize: 13, color: COLORS.darkGray, flex: 1, textAlign: "right" },
  detailValue: { fontSize: 13, fontWeight: "600", color: COLORS.black, flex: 2, textAlign: "right" },
  notesText: { fontSize: 13, color: COLORS.darkGray, textAlign: "right", lineHeight: 20 },
  modalActions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexWrap: "wrap",
  },
  modalActionBtn: {
    flex: 1,
    minWidth: "40%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  modalActionText: { color: COLORS.white, fontWeight: "600", fontSize: 13 },

  // Confirm modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
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
  confirmIconRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 10 },
  confirmTitle: { fontSize: 16, fontWeight: "700", color: COLORS.black, textAlign: "right" },
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
});
