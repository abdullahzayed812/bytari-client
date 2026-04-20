import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useToastContext } from "../providers/ToastProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { ArrowRightLeft, CheckCircle, XCircle, Clock, Send, Inbox } from "lucide-react-native";

export default function PetTransferRequestsScreen() {
  const { user } = useApp();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  const sentQuery = useQuery(trpc.pets.transfer.getSent.queryOptions());
  const receivedQuery = useQuery(trpc.pets.transfer.getReceived.queryOptions());

  const respondMutation = useMutation(trpc.pets.transfer.respond.mutationOptions());
  const cancelMutation = useMutation(trpc.pets.transfer.cancel.mutationOptions());

  const invalidate = () => {
    queryClient.invalidateQueries(trpc.pets.transfer.getSent.queryKey as any);
    queryClient.invalidateQueries(trpc.pets.transfer.getReceived.queryKey as any);
    queryClient.invalidateQueries(trpc.pets.getUserPets.queryKey as any);
  };

  const handleRespond = (transferId: number, action: "approve" | "reject") => {
    respondMutation.mutate(
      { transferId, action },
      {
        onSuccess: () => {
          showToast({
            type: "success",
            message: action === "approve" ? "تم قبول طلب النقل بنجاح. الحيوان الآن في حسابك." : "تم رفض طلب النقل.",
          });
          invalidate();
        },
        onError: (error) => {
          showToast({ type: "error", message: error.message || "حدث خطأ" });
        },
      },
    );
  };

  const handleCancel = (transferId: number) => {
    cancelMutation.mutate(
      { transferId },
      {
        onSuccess: () => {
          showToast({ type: "success", message: "تم إلغاء طلب النقل." });
          invalidate();
        },
        onError: (error) => {
          showToast({ type: "error", message: error.message || "حدث خطأ" });
        },
      },
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "معلق", color: COLORS.warning, icon: <Clock size={12} color={COLORS.white} /> };
      case "approved":
        return { label: "مقبول", color: COLORS.success, icon: <CheckCircle size={12} color={COLORS.white} /> };
      case "rejected":
        return { label: "مرفوض", color: COLORS.error, icon: <XCircle size={12} color={COLORS.white} /> };
      default:
        return { label: status, color: COLORS.darkGray, icon: null };
    }
  };

  const sentTransfers = sentQuery.data?.transfers || [];
  const receivedTransfers = receivedQuery.data?.transfers || [];
  const isLoading = activeTab === "sent" ? sentQuery.isLoading : receivedQuery.isLoading;
  const isMutating = respondMutation.isPending || cancelMutation.isPending;

  const renderPetCard = (item: any, mode: "sent" | "received") => {
    const badge = getStatusBadge(item.status);
    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          {item.petImage ? (
            <Image source={{ uri: item.petImage }} style={styles.petImage} />
          ) : (
            <View style={styles.petImagePlaceholder}>
              <Text style={styles.petImagePlaceholderText}>🐾</Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.petName}>{item.petName}</Text>
            <Text style={styles.petType}>{item.petType}</Text>
            <View style={[styles.statusBadge, { backgroundColor: badge.color }]}>
              {badge.icon}
              <Text style={styles.statusBadgeText}>{badge.label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.transferDirection}>
          <ArrowRightLeft size={14} color={COLORS.darkGray} />
          {mode === "sent" ? (
            <Text style={styles.transferDirectionText}>
              إلى: {item.toUserName} ({item.toUserEmail})
            </Text>
          ) : (
            <Text style={styles.transferDirectionText}>
              من: {item.fromUserName} ({item.fromUserEmail})
            </Text>
          )}
        </View>

        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>

        {item.status === "pending" && mode === "received" && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn, isMutating && { opacity: 0.6 }]}
              onPress={() => handleRespond(item.id, "approve")}
              disabled={isMutating}
            >
              {respondMutation.isPending ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <CheckCircle size={14} color={COLORS.white} />
                  <Text style={styles.actionBtnText}>قبول</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn, isMutating && { opacity: 0.6 }]}
              onPress={() => handleRespond(item.id, "reject")}
              disabled={isMutating}
            >
              {respondMutation.isPending ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <XCircle size={14} color={COLORS.white} />
                  <Text style={styles.actionBtnText}>رفض</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {item.status === "pending" && mode === "sent" && (
          <TouchableOpacity style={[styles.cancelBtn, isMutating && { opacity: 0.6 }]} onPress={() => handleCancel(item.id)} disabled={isMutating}>
            {cancelMutation.isPending ? <ActivityIndicator size="small" color={COLORS.error} /> : <Text style={styles.cancelBtnText}>إلغاء الطلب</Text>}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>طلبات نقل الملكية</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === "received" && styles.activeTab]} onPress={() => setActiveTab("received")}>
          <Inbox size={16} color={activeTab === "received" ? COLORS.primary : COLORS.darkGray} />
          <Text style={[styles.tabText, activeTab === "received" && styles.activeTabText]}>مستلمة ({receivedTransfers.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === "sent" && styles.activeTab]} onPress={() => setActiveTab("sent")}>
          <Send size={16} color={activeTab === "sent" ? COLORS.primary : COLORS.darkGray} />
          <Text style={[styles.tabText, activeTab === "sent" && styles.activeTabText]}>مرسلة ({sentTransfers.length})</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {activeTab === "received" &&
            (receivedTransfers.length === 0 ? (
              <View style={styles.emptyState}>
                <Inbox size={48} color={COLORS.lightGray} />
                <Text style={styles.emptyText}>لا توجد طلبات مستلمة</Text>
              </View>
            ) : (
              receivedTransfers.map((item) => renderPetCard(item, "received"))
            ))}

          {activeTab === "sent" &&
            (sentTransfers.length === 0 ? (
              <View style={styles.emptyState}>
                <Send size={48} color={COLORS.lightGray} />
                <Text style={styles.emptyText}>لا توجد طلبات مرسلة</Text>
              </View>
            ) : (
              sentTransfers.map((item) => renderPetCard(item, "sent"))
            ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
  },
  tabs: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  petImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  petImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  petImagePlaceholderText: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
  },
  petType: {
    fontSize: 13,
    color: COLORS.darkGray,
    textAlign: "left",
  },
  statusBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  transferDirection: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  transferDirectionText: {
    fontSize: 13,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: "left",
  },
  dateText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "left",
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row-reverse",
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  approveBtn: {
    backgroundColor: COLORS.success,
  },
  rejectBtn: {
    backgroundColor: COLORS.error,
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
    marginTop: 4,
  },
  cancelBtnText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
});
