import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import {
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Phone,
  Clock,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Bird,
} from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { FilterTab, FilterTabs } from "@/components/FilterTabs";
import { useToastContext } from "@/providers/ToastProvider";
import { useApp } from "@/providers/AppProvider";
import { COLORS } from "@/constants/colors";

interface PoultryFarm {
  id: number;
  name: string;
  location: string;
  address?: string;
  farmType?: string;
  capacity: number;
  phone?: string;
  email?: string;
  isActive: boolean;
  isVerified: boolean;
  status: string; // pending | active | rejected | deactivated | banned
  needsRenewal: boolean;
  reviewingRenewalRequest: boolean;
  activationStartDate?: string | null;
  activationEndDate?: string | null;
  createdAt: string;
  owner: {
    id?: number;
    name?: string;
    email?: string;
  };
}

const FARM_TYPE_MAP: Record<string, string> = {
  broiler: "تسمين",
  layer: "بياض",
  breeder: "أمهات",
  mixed: "مختلط",
};

export default function AdminPoultryFarmsManagement() {
  const { user } = useApp();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();

  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "pending" | "renewal" | "deactive" | "banned">("all");
  const [selectedFarm, setSelectedFarm] = useState<PoultryFarm | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Activate modal state
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activationStartDate, setActivationStartDate] = useState("");
  const [activationEndDate, setActivationEndDate] = useState("");

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Ban modal state
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data, isLoading, refetch } = useQuery(trpc.poultryFarms.list.queryOptions({}));
  const farms: PoultryFarm[] = useMemo(() => (data as any)?.farms || [], [data]);

  const activateMutation = useMutation(trpc.poultryFarms.activate.mutationOptions());
  const rejectMutation = useMutation(trpc.poultryFarms.reject.mutationOptions());
  const banMutation = useMutation(trpc.poultryFarms.ban.mutationOptions());
  const deactivateMutation = useMutation(trpc.poultryFarms.deactivate.mutationOptions());
  const deleteMutation = useMutation(trpc.poultryFarms.adminDelete.mutationOptions());

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
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredFarms = useMemo(() => {
    let result = farms;
    if (searchQuery.trim()) {
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    switch (selectedFilter) {
      case "active":
        return result.filter((f) => f.status === "active" && f.isActive && !f.needsRenewal);
      case "pending":
        return result.filter((f) => f.status === "pending");
      case "renewal":
        return result.filter((f) => f.needsRenewal);
      case "deactive":
        return result.filter((f) => f.status === "rejected" || f.status === "deactivated");
      case "banned":
        return result.filter((f) => f.status === "banned");
      default:
        return result;
    }
  }, [farms, searchQuery, selectedFilter]);

  const tabs: FilterTab<"all" | "active" | "pending" | "renewal" | "deactive" | "banned">[] = useMemo(
    () => [
      { id: "all", label: "الكل", count: farms.length },
      {
        id: "active",
        label: "نشط",
        icon: CheckCircle,
        iconColor: "#27AE60",
        count: farms.filter((f) => f.status === "active" && f.isActive && !f.needsRenewal).length,
      },
      {
        id: "pending",
        label: "قيد المراجعة",
        icon: Clock,
        iconColor: "#F39C12",
        count: farms.filter((f) => f.status === "pending").length,
      },
      {
        id: "renewal",
        label: "تجديد",
        icon: RefreshCw,
        iconColor: "#E74C3C",
        count: farms.filter((f) => f.needsRenewal).length,
      },
      {
        id: "deactive",
        label: "غير نشط",
        icon: XCircle,
        iconColor: "#95A5A6",
        count: farms.filter((f) => f.status === "rejected" || f.status === "deactivated").length,
      },
      {
        id: "banned",
        label: "محظور",
        icon: AlertTriangle,
        iconColor: "#7F1D1D",
        count: farms.filter((f) => f.status === "banned").length,
      },
    ],
    [farms]
  );

  const confirmActivate = useCallback(() => {
    if (!selectedFarm) return;
    if (!activationStartDate || !activationEndDate) {
      showToast({ type: "error", message: "يجب تحديد تواريخ التفعيل (يوم/شهر/سنة)" });
      return;
    }
    activateMutation.mutate(
      {
        farmId: selectedFarm.id,
        activationStartDate: parseDate(activationStartDate),
        activationEndDate: parseDate(activationEndDate),
      },
      {
        onSuccess: () => {
          showToast({ type: "success", message: "تم تفعيل الحقل بنجاح" });
          queryClient.invalidateQueries(trpc.poultryFarms.list.queryKey() as any);
          refetch();
          setShowActivateModal(false);
          setShowDetailModal(false);
          setActivationStartDate("");
          setActivationEndDate("");
        },
        onError: (err) => showToast({ type: "error", message: err.message }),
      }
    );
  }, [selectedFarm, activationStartDate, activationEndDate]);

  const confirmReject = useCallback(() => {
    if (!selectedFarm || !rejectionReason.trim()) {
      showToast({ type: "error", message: "يجب إدخال سبب الرفض" });
      return;
    }
    rejectMutation.mutate(
      { farmId: selectedFarm.id, rejectionReason: rejectionReason.trim() },
      {
        onSuccess: () => {
          showToast({ type: "success", message: "تم رفض الحقل" });
          queryClient.invalidateQueries(trpc.poultryFarms.list.queryKey() as any);
          refetch();
          setShowRejectModal(false);
          setShowDetailModal(false);
          setRejectionReason("");
        },
        onError: (err) => showToast({ type: "error", message: err.message }),
      }
    );
  }, [selectedFarm, rejectionReason]);

  const confirmBan = useCallback(() => {
    if (!selectedFarm || !banReason.trim()) {
      showToast({ type: "error", message: "يجب إدخال سبب الحظر" });
      return;
    }
    banMutation.mutate(
      { farmId: selectedFarm.id, reason: banReason.trim() },
      {
        onSuccess: () => {
          showToast({ type: "success", message: "تم حظر الحقل" });
          queryClient.invalidateQueries(trpc.poultryFarms.list.queryKey() as any);
          refetch();
          setShowBanModal(false);
          setShowDetailModal(false);
          setBanReason("");
        },
        onError: (err) => showToast({ type: "error", message: err.message }),
      }
    );
  }, [selectedFarm, banReason]);

  const confirmDeactivate = useCallback((farm: PoultryFarm) => {
    Alert.alert("إيقاف التفعيل", `هل تريد إيقاف تفعيل "${farm.name}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إيقاف",
        style: "destructive",
        onPress: () =>
          deactivateMutation.mutate(
            { farmId: farm.id },
            {
              onSuccess: () => {
                showToast({ type: "success", message: "تم إيقاف تفعيل الحقل" });
                queryClient.invalidateQueries(trpc.poultryFarms.list.queryKey() as any);
                refetch();
                setShowDetailModal(false);
              },
              onError: (err) => showToast({ type: "error", message: err.message }),
            }
          ),
      },
    ]);
  }, [deactivateMutation]);

  const handleDelete = useCallback(
    (farm: PoultryFarm) => {
      Alert.alert("حذف الحقل", `هل أنت متأكد من حذف "${farm.name}"؟`, [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: () =>
            deleteMutation.mutate(
              { farmId: farm.id },
              {
                onSuccess: () => {
                  showToast({ type: "success", message: "تم الحذف" });
                  queryClient.invalidateQueries(trpc.poultryFarms.list.queryKey() as any);
                  refetch();
                  setShowDetailModal(false);
                },
                onError: (err) => showToast({ type: "error", message: err.message }),
              }
            ),
        },
      ]);
    },
    [deleteMutation]
  );

  const renderActivateModal = () => (
    <Modal visible={showActivateModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.actionModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>تحديد تواريخ التفعيل</Text>
            <TouchableOpacity
              onPress={() => {
                setShowActivateModal(false);
                setActivationStartDate("");
                setActivationEndDate("");
              }}
            >
              <XCircle size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>تاريخ البدء (يوم/شهر/سنة):</Text>
          <TextInput
            style={styles.dateInput}
            value={activationStartDate}
            onChangeText={setActivationStartDate}
            placeholder="مثال: 9/4/2025"
            placeholderTextColor="#aaa"
            textAlign="right"
          />

          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>تاريخ الانتهاء (يوم/شهر/سنة):</Text>
          <TextInput
            style={styles.dateInput}
            value={activationEndDate}
            onChangeText={setActivationEndDate}
            placeholder="مثال: 9/4/2026"
            placeholderTextColor="#aaa"
            textAlign="right"
          />

          <Text style={styles.dateNote}>
            سيتم تفعيل حقل الدواجن من تاريخ البدء حتى تاريخ الانتهاء
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.cancelBtn]}
              onPress={() => {
                setShowActivateModal(false);
                setActivationStartDate("");
                setActivationEndDate("");
              }}
            >
              <Text style={styles.cancelBtnText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.confirmBtn]}
              onPress={confirmActivate}
              disabled={activateMutation.isPending}
            >
              <CheckCircle size={18} color="#fff" />
              <Text style={styles.confirmBtnText}>تفعيل</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRejectModal = () => (
    <Modal visible={showRejectModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.actionModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>رفض الطلب</Text>
            <TouchableOpacity onPress={() => { setShowRejectModal(false); setRejectionReason(""); }}>
              <XCircle size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>سبب الرفض:</Text>
          <TextInput
            style={styles.reasonInput}
            value={rejectionReason}
            onChangeText={setRejectionReason}
            placeholder="اكتب سبب الرفض هنا..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            textAlign="right"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.cancelBtn]}
              onPress={() => { setShowRejectModal(false); setRejectionReason(""); }}
            >
              <Text style={styles.cancelBtnText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.rejectBtn]}
              onPress={confirmReject}
              disabled={rejectMutation.isPending}
            >
              <XCircle size={18} color="#fff" />
              <Text style={styles.confirmBtnText}>رفض</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderBanModal = () => (
    <Modal visible={showBanModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.actionModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>حظر الحقل</Text>
            <TouchableOpacity onPress={() => { setShowBanModal(false); setBanReason(""); }}>
              <XCircle size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>سبب الحظر:</Text>
          <TextInput
            style={styles.reasonInput}
            value={banReason}
            onChangeText={setBanReason}
            placeholder="اكتب سبب الحظر هنا..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            textAlign="right"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.cancelBtn]}
              onPress={() => { setShowBanModal(false); setBanReason(""); }}
            >
              <Text style={styles.cancelBtnText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#7F1D1D" }]}
              onPress={confirmBan}
              disabled={banMutation.isPending}
            >
              <AlertTriangle size={18} color="#fff" />
              <Text style={styles.confirmBtnText}>حظر</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDetailModal = () => {
    if (!selectedFarm) return null;
    const daysRemaining = getDaysRemaining(selectedFarm.activationEndDate);
    const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;

    return (
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.detailModalHeader}>
              <Text style={styles.modalTitle}>تفاصيل الحقل</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Text style={styles.closeBtn}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailScroll}>
              {/* Status banner */}
              {selectedFarm.needsRenewal && (
                <View style={styles.renewalBanner}>
                  <AlertTriangle size={18} color="#fff" />
                  <Text style={styles.renewalBannerText}>
                    {selectedFarm.reviewingRenewalRequest
                      ? "طلب تجديد قيد المراجعة"
                      : "انتهى الاشتراك – يحتاج تجديد"}
                  </Text>
                </View>
              )}

              {isExpiringSoon && (
                <View style={[styles.renewalBanner, { backgroundColor: "#F39C12" }]}>
                  <AlertTriangle size={18} color="#fff" />
                  <Text style={styles.renewalBannerText}>ينتهي الاشتراك خلال {daysRemaining} يوم</Text>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>معلومات الحقل</Text>
                <InfoRow label="الاسم" value={selectedFarm.name} />
                <InfoRow label="الموقع" value={selectedFarm.location} />
                {selectedFarm.address && <InfoRow label="العنوان" value={selectedFarm.address} />}
                {selectedFarm.farmType && <InfoRow label="نوع الإنتاج" value={FARM_TYPE_MAP[selectedFarm.farmType] || selectedFarm.farmType} />}
                <InfoRow label="السعة" value={`${selectedFarm.capacity} طير`} />
                {selectedFarm.phone && <InfoRow label="الهاتف" value={selectedFarm.phone} />}
                {selectedFarm.email && <InfoRow label="البريد" value={selectedFarm.email} />}
                <InfoRow label="تاريخ التسجيل" value={formatDate(selectedFarm.createdAt)} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>معلومات المالك</Text>
                <InfoRow label="الاسم" value={selectedFarm.owner?.name || "—"} />
                <InfoRow label="البريد الإلكتروني" value={selectedFarm.owner?.email || "—"} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>الاشتراك</Text>
                <InfoRow
                  label="الحالة"
                  value={
                    selectedFarm.status === "active" ? "نشط"
                    : selectedFarm.status === "pending" ? "قيد المراجعة"
                    : selectedFarm.status === "rejected" ? "مرفوض"
                    : selectedFarm.status === "deactivated" ? "موقوف"
                    : selectedFarm.status === "banned" ? "محظور"
                    : selectedFarm.needsRenewal ? "منتهي"
                    : "غير محدد"
                  }
                  valueColor={
                    selectedFarm.status === "active" ? "#27AE60"
                    : selectedFarm.status === "banned" ? "#7F1D1D"
                    : "#E74C3C"
                  }
                />
                <InfoRow label="تاريخ البدء" value={formatDate(selectedFarm.activationStartDate)} />
                <InfoRow label="تاريخ الانتهاء" value={formatDate(selectedFarm.activationEndDate)} />
                {daysRemaining !== null && (
                  <InfoRow
                    label="الأيام المتبقية"
                    value={daysRemaining > 0 ? `${daysRemaining} يوم` : "منتهي"}
                    valueColor={daysRemaining > 0 ? (isExpiringSoon ? "#F39C12" : "#27AE60") : "#E74C3C"}
                  />
                )}
              </View>
            </ScrollView>

            {/* Action buttons */}
            <View style={styles.detailActions}>
              {/* Pending → activate or reject */}
              {selectedFarm.status === "pending" && (
                <>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.activateActionBtn]}
                    onPress={() => { setShowDetailModal(false); setShowActivateModal(true); }}
                  >
                    <CheckCircle size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>تفعيل</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectActionBtn]}
                    onPress={() => { setShowDetailModal(false); setShowRejectModal(true); }}
                  >
                    <XCircle size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>رفض</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Renewal → renew with new dates */}
              {selectedFarm.needsRenewal && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.activateActionBtn]}
                  onPress={() => { setShowDetailModal(false); setShowActivateModal(true); }}
                >
                  <RefreshCw size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>تجديد الاشتراك</Text>
                </TouchableOpacity>
              )}

              {/* Active → deactivate */}
              {selectedFarm.status === "active" && !selectedFarm.needsRenewal && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#95A5A6" }]}
                  onPress={() => confirmDeactivate(selectedFarm)}
                >
                  <XCircle size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>إيقاف</Text>
                </TouchableOpacity>
              )}

              {/* Rejected/Deactivated → reactivate */}
              {(selectedFarm.status === "rejected" || selectedFarm.status === "deactivated") && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.activateActionBtn]}
                  onPress={() => { setShowDetailModal(false); setShowActivateModal(true); }}
                >
                  <CheckCircle size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>إعادة تفعيل</Text>
                </TouchableOpacity>
              )}

              {/* Ban button (available for non-banned farms) */}
              {selectedFarm.status !== "banned" && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#7F1D1D" }]}
                  onPress={() => { setShowDetailModal(false); setShowBanModal(true); }}
                >
                  <AlertTriangle size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>حظر</Text>
                </TouchableOpacity>
              )}

              {/* Unban */}
              {selectedFarm.status === "banned" && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.activateActionBtn]}
                  onPress={() => { setShowDetailModal(false); setShowActivateModal(true); }}
                >
                  <CheckCircle size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>رفع الحظر وتفعيل</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteActionBtn]}
                onPress={() => handleDelete(selectedFarm)}
              >
                <Trash2 size={18} color="#fff" />
                <Text style={styles.actionBtnText}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderFarmItem = ({ item }: { item: PoultryFarm }) => {
    const daysRemaining = getDaysRemaining(item.activationEndDate);
    const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;
    const statusColor =
      item.status === "active" && !item.needsRenewal ? "#27AE60"
      : item.status === "banned" ? "#7F1D1D"
      : item.status === "rejected" || item.status === "deactivated" ? "#95A5A6"
      : item.needsRenewal ? "#E74C3C"
      : "#F39C12";
    const statusLabel =
      item.status === "active" && !item.needsRenewal ? "نشط"
      : item.status === "banned" ? "محظور"
      : item.status === "rejected" ? "مرفوض"
      : item.status === "deactivated" ? "موقوف"
      : item.needsRenewal ? "تجديد"
      : "قيد المراجعة";

    return (
      <TouchableOpacity
        style={[
          styles.farmCard,
          item.needsRenewal && styles.farmCardRenewal,
          item.status === "banned" && styles.farmCardBanned,
          (item.status === "rejected" || item.status === "deactivated") && styles.farmCardDeactive,
        ]}
        onPress={() => { setSelectedFarm(item); setShowDetailModal(true); }}
      >
        <View style={styles.farmCardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.farmName}>{item.name}</Text>
            <Text style={styles.farmLocation}>{item.location}</Text>
            <Text style={styles.farmOwner}>المالك: {item.owner?.name || "—"}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusBadgeText}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.farmCardMeta}>
          {item.farmType && (
            <View style={styles.metaItem}>
              <Bird size={13} color="#666" />
              <Text style={styles.metaText}>{FARM_TYPE_MAP[item.farmType] || item.farmType}</Text>
            </View>
          )}
          {item.phone && (
            <View style={styles.metaItem}>
              <Phone size={13} color="#666" />
              <Text style={styles.metaText}>{item.phone}</Text>
            </View>
          )}
          {item.activationEndDate && (
            <View style={styles.metaItem}>
              <Calendar size={13} color={isExpiringSoon ? "#F39C12" : "#666"} />
              <Text style={[styles.metaText, isExpiringSoon && { color: "#F39C12" }]}>
                ينتهي: {formatDate(item.activationEndDate)}
                {daysRemaining !== null && daysRemaining > 0 && ` (${daysRemaining} يوم)`}
              </Text>
            </View>
          )}
        </View>

        {/* Renewal card */}
        {item.needsRenewal && (
          <View style={styles.renewalCard}>
            <AlertTriangle size={15} color="#E74C3C" />
            <Text style={styles.renewalCardText}>
              {item.reviewingRenewalRequest ? "طلب التجديد قيد المراجعة" : "طلب تجديد الاشتراك"}
            </Text>
          </View>
        )}

        {/* Banned card */}
        {item.status === "banned" && (
          <View style={[styles.renewalCard, { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#7F1D1D" }]}>
            <AlertTriangle size={15} color="#7F1D1D" />
            <Text style={[styles.renewalCardText, { color: "#7F1D1D" }]}>هذا الحقل محظور</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "إدارة حقول الدواجن", headerStyle: { backgroundColor: "#F59E0B" }, headerTintColor: "#fff" }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة حقول الدواجن",
          headerStyle: { backgroundColor: "#F59E0B" },
          headerTintColor: "#fff",
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث عن حقل أو مالك..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
      </View>

      <FilterTabs tabs={tabs} selectedTab={selectedFilter} onTabPress={setSelectedFilter} activeColor="#F59E0B" />

      <FlatList
        data={filteredFarms}
        renderItem={renderFarmItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bird size={48} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد حقول دواجن</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد حقول في هذه الفئة"}
            </Text>
          </View>
        }
      />

      {renderDetailModal()}
      {renderActivateModal()}
      {renderRejectModal()}
      {renderBanModal()}
    </SafeAreaView>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  listContainer: { padding: 15, paddingBottom: 30 },

  // Farm card
  farmCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  farmCardRenewal: { borderWidth: 1.5, borderColor: "#E74C3C" },
  farmCardBanned: { borderWidth: 1.5, borderColor: "#7F1D1D", opacity: 0.85 },
  farmCardDeactive: { borderWidth: 1, borderColor: "#ccc", opacity: 0.75 },
  farmCardHeader: { flexDirection: "row-reverse", alignItems: "flex-start", marginBottom: 10 },
  farmName: { fontSize: 16, fontWeight: "bold", color: "#333", textAlign: "right" },
  farmLocation: { fontSize: 13, color: "#666", marginTop: 2, textAlign: "right" },
  farmOwner: { fontSize: 13, color: "#888", marginTop: 2, textAlign: "right" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 8 },
  statusBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  farmCardMeta: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 10 },
  metaItem: { flexDirection: "row-reverse", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#666" },
  renewalCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  renewalCardText: { color: "#E74C3C", fontSize: 13, fontWeight: "600" },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  actionModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
  },
  modalHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  fieldLabel: { fontSize: 14, color: "#555", textAlign: "right", marginBottom: 6 },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#f8f9fa",
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#f8f9fa",
    minHeight: 100,
  },
  dateNote: { fontSize: 12, color: "#888", textAlign: "right", marginTop: 10 },
  modalButtons: { flexDirection: "row-reverse", gap: 10, marginTop: 20 },
  modalBtn: { flex: 1, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 10, gap: 6 },
  cancelBtn: { backgroundColor: "#f0f0f0" },
  cancelBtnText: { color: "#555", fontWeight: "600" },
  confirmBtn: { backgroundColor: "#27AE60" },
  rejectBtn: { backgroundColor: "#E74C3C" },
  confirmBtnText: { color: "#fff", fontWeight: "600" },

  // Detail modal
  detailModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    flex: 0,
  },
  detailModalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeBtn: { fontSize: 28, color: "#999", lineHeight: 30 },
  detailScroll: { paddingHorizontal: 16, paddingTop: 8 },
  section: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#333", marginBottom: 10, textAlign: "right" },
  infoRow: { flexDirection: "row-reverse", justifyContent: "space-between", paddingVertical: 5 },
  infoLabel: { fontSize: 13, color: "#888", flex: 1, textAlign: "right" },
  infoValue: { fontSize: 13, color: "#333", flex: 2, textAlign: "right" },
  detailActions: {
    flexDirection: "row-reverse",
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 5,
  },
  activateActionBtn: { backgroundColor: "#27AE60" },
  rejectActionBtn: { backgroundColor: "#E74C3C" },
  deleteActionBtn: { backgroundColor: "#95A5A6" },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  renewalBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E74C3C",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    marginHorizontal: 0,
  },
  renewalBannerText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  emptyContainer: { flex: 1, alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#999", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#bbb", marginTop: 6 },
});
