/**
 * link-farm-to-doctor.tsx
 * Vet doctor links to a farm via the farm's 6-char identifier code.
 */
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Trash2, MapPin, CheckCircle, Feather } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";
import { useToastContext } from "../providers/ToastProvider";
import { useApp } from "../providers/AppProvider";
import { PoultryFarmChatButton } from "../components/poultry/PoultryFarmChatButton";

const getFarmTypeLabel = (type: string) => {
  const types: Record<string, string> = { broiler: "تسمين", layer: "بياض" };
  return types[type] || type;
};

const getHealthStatusLabel = (status: string) => {
  const statuses: Record<string, string> = { healthy: "سليم", quarantine: "حجر صحي", sick: "مريض" };
  return statuses[status] || status;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return COLORS.success;
    case "inactive":
      return COLORS.warning;
    case "sick":
      return COLORS.error;
    default:
      return COLORS.darkGray;
  }
};

export default function LinkFarmToDoctorScreen() {
  const router = useRouter();
  const { user } = useApp();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();
  const [farmCode, setFarmCode] = useState("");

  const { data: linkedFarmsData, isLoading } = useQuery(trpc.poultry.farmDoctor.getMyFarms.queryOptions());

  const linkMutation = useMutation(
    trpc.poultry.farmDoctor.link.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم ربط الحقل بنجاح" });
        setFarmCode("");
        queryClient.invalidateQueries(trpc.poultry.farmDoctor.getMyFarms.queryKey() as any);
      },
      onError: (error: any) => {
        showToast({ type: "error", message: error.message || "كود الحقل غير صحيح" });
      },
    }),
  );

  const unlinkMutation = useMutation(
    trpc.poultry.farmDoctor.unlink.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم إلغاء الربط" });
        queryClient.invalidateQueries(trpc.poultry.farmDoctor.getMyFarms.queryKey() as any);
      },
      onError: (e: any) => showToast({ type: "error", message: e.message }),
    }),
  );

  const handleLink = () => {
    const code = farmCode.trim().toUpperCase();
    if (code.length !== 6) {
      showToast({ type: "error", message: "الكود يجب أن يكون 6 أحرف" });
      return;
    }
    linkMutation.mutate({ farmIdentifier: code });
  };

  const linkedFarms: any[] = linkedFarmsData?.farms || [];

  return (
    <>
      <Stack.Screen
        options={{
          title: "ربط حقل بالطبيب",
          headerStyle: { backgroundColor: "#064E3B" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* How it works */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🔗 كيفية الربط بحقل دواجن</Text>
            <Text style={styles.infoStep}>1. اطلب من صاحب الحقل كود الحقل المكون من 6 أحرف</Text>
            <Text style={styles.infoStep}>2. أدخل الكود في الحقل أدناه</Text>
            <Text style={styles.infoStep}>3. بعد الربط يمكنك الوصول لبيانات الحقل</Text>
          </View>

          {/* Link input */}
          <View style={styles.linkCard}>
            <Text style={styles.label}>كود الحقل</Text>
            <TextInput
              style={styles.codeInput}
              value={farmCode}
              onChangeText={(v) => setFarmCode(v.toUpperCase().replace(/[^A-F0-9]/g, ""))}
              placeholder="XXXXXX"
              maxLength={6}
              autoCapitalize="characters"
              textAlign="center"
            />
            <Text style={styles.codeHint}>الكود مكون من 6 أحرف/أرقام</Text>
            <TouchableOpacity
              style={[styles.linkBtn, (linkMutation.isPending || farmCode.length !== 6) && styles.linkBtnDisabled]}
              onPress={handleLink}
              disabled={linkMutation.isPending || farmCode.length !== 6}
            >
              {linkMutation.isPending ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Link2 size={16} color={COLORS.white} />
                  <Text style={styles.linkBtnText}>ربط الحقل</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Linked farms */}
          <Text style={styles.sectionTitle}>الحقول المرتبطة بي ({linkedFarms.length})</Text>

          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : linkedFarms.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏚️</Text>
              <Text style={styles.emptyText}>لا توجد حقول مرتبطة حالياً</Text>
            </View>
          ) : (
            linkedFarms.map((link: any) => (
              <TouchableOpacity
                key={link.linkId}
                style={styles.farmCard}
                onPress={() =>
                  router.push({
                    pathname: "/poultry-farm-details",
                    params: { id: link.farmId, workerMode: "1", workerPermissions: "add_daily_data", counterpartRole: "doctor" },
                  })
                }
                activeOpacity={0.8}
              >
                {/* Header */}
                <View style={styles.farmHeader}>
                  <View style={styles.farmIconContainer}>
                    <Feather size={28} color={COLORS.white} />
                  </View>
                  <View style={styles.farmInfoCol}>
                    <Text style={styles.farmName}>{link.farmName}</Text>
                    {link.farmGovernorate && (
                      <View style={styles.farmLocationRow}>
                        <MapPin size={13} color={COLORS.darkGray} />
                        <Text style={styles.farmLocation}>{link.farmGovernorate}</Text>
                      </View>
                    )}
                    <View style={styles.farmBadges}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(link.farmStatus) }]}>
                        <Text style={styles.badgeText}>
                          {link.farmStatus === "active" ? "نشط" : link.farmStatus === "inactive" ? "غير نشط" : link.farmStatus}
                        </Text>
                      </View>
                      {link.farmType && (
                        <View style={[styles.typeBadge, { backgroundColor: COLORS.primary }]}>
                          <Text style={styles.badgeText}>{getFarmTypeLabel(link.farmType)}</Text>
                        </View>
                      )}
                      {link.isVerified && (
                        <View style={[styles.verifiedBadge]}>
                          <CheckCircle size={10} color={COLORS.white} />
                          <Text style={styles.badgeText}>موثق</Text>
                        </View>
                      )}
                      <View style={styles.linkedBadge}>
                        <Link2 size={10} color="#1D4ED8" />
                        <Text style={styles.linkedBadgeText}>مرتبط</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Details row */}
                <View style={styles.farmDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>الطبقة</Text>
                    <Text style={styles.detailValue}>{(link.capacity ?? 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>الحالي</Text>
                    <Text style={styles.detailValue}>{(link.currentPopulation ?? 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>الصحة</Text>
                    <Text style={styles.detailValue}>{getHealthStatusLabel(link.healthStatus)}</Text>
                  </View>
                </View>

                {link.licenseNumber && (
                  <View style={styles.licenseInfo}>
                    <Text style={styles.licenseText}>رقم الترخيص: {link.licenseNumber}</Text>
                  </View>
                )}

                {link.ownerName && (
                  <View style={styles.ownerRow}>
                    <Text style={styles.ownerText}>المالك: {link.ownerName}</Text>
                    {link.ownerPhone && <Text style={styles.ownerPhone}>{link.ownerPhone}</Text>}
                  </View>
                )}

                {user?.id && (
                  <PoultryFarmChatButton
                    farmId={link.farmId}
                    counterpartId={Number(user.id)}
                    counterpartRole="doctor"
                    title={link.ownerName ?? link.farmName}
                  />
                )}

                {/* Unlink */}
                <TouchableOpacity style={styles.unlinkBtn} onPress={() => unlinkMutation.mutate({ linkId: link.linkId })}>
                  <Trash2 size={14} color={COLORS.error} />
                  <Text style={styles.unlinkBtnText}>إلغاء الربط</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 16, paddingBottom: 40 },

  infoCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoTitle: { fontSize: 14, fontWeight: "700", color: "#1D4ED8", textAlign: "right", marginBottom: 8 },
  infoStep: { fontSize: 13, color: "#1E40AF", textAlign: "right", marginBottom: 4, lineHeight: 20 },

  linkCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.black, marginBottom: 10, textAlign: "right", alignSelf: "flex-end", width: "100%" },
  codeInput: {
    width: "60%",
    borderWidth: 2,
    borderColor: "#064E3B",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: "700",
    color: "#064E3B",
    letterSpacing: 6,
    backgroundColor: "#F0FDF4",
    marginBottom: 6,
  },
  codeHint: { fontSize: 11, color: COLORS.darkGray, marginBottom: 14 },
  linkBtn: {
    flexDirection: "row-reverse",
    backgroundColor: "#064E3B",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: "center",
    gap: 8,
  },
  linkBtnDisabled: { opacity: 0.4 },
  linkBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 15 },

  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.black, textAlign: "right", marginBottom: 12 },
  empty: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: COLORS.darkGray },

  // Farm card
  farmCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  farmHeader: { flexDirection: "row-reverse", gap: 12, marginBottom: 12 },
  farmIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#064E3B",
    justifyContent: "center",
    alignItems: "center",
  },
  farmInfoCol: { flex: 1 },
  farmName: { fontSize: 15, fontWeight: "700", color: COLORS.black, textAlign: "right", marginBottom: 4 },
  farmLocationRow: { flexDirection: "row-reverse", alignItems: "center", gap: 4, marginBottom: 6 },
  farmLocation: { fontSize: 12, color: COLORS.darkGray },
  farmBadges: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  verifiedBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.success,
  },
  linkedBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#DBEAFE",
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: COLORS.white },
  linkedBadgeText: { fontSize: 11, fontWeight: "600", color: "#1D4ED8" },

  farmDetails: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  detailItem: { alignItems: "center" },
  detailLabel: { fontSize: 11, color: COLORS.darkGray },
  detailValue: { fontSize: 13, fontWeight: "700", color: COLORS.black, marginTop: 2 },

  licenseInfo: {
    backgroundColor: "#FFFBEB",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
  },
  licenseText: { fontSize: 11, color: "#92400E", textAlign: "right" },

  ownerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ownerText: { fontSize: 12, color: COLORS.darkGray },
  ownerPhone: { fontSize: 12, color: COLORS.primary },

  unlinkBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: "#FEF2F2",
  },
  unlinkBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.error },
});
