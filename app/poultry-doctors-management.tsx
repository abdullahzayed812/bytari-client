/**
 * poultry-doctors-management.tsx
 * Admin screen — view all doctor-farm links.
 */
import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";
import { useToastContext } from "../providers/ToastProvider";

export default function PoultryDoctorsManagementScreen() {
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(trpc.poultry.farmDoctor.getAllLinks.queryOptions());

  const removeMutation = useMutation(
    trpc.poultry.farmDoctor.removeDoctor.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم إلغاء ربط الطبيب" });
        queryClient.invalidateQueries(trpc.poultry.farmDoctor.getAllLinks.queryKey() as any);
      },
    }),
  );

  const links = data?.links || [];

  return (
    <>
      <Stack.Screen
        options={{
          title: "روابط الأطباء بالحقول",
          headerStyle: { backgroundColor: "#064E3B" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {isLoading ? (
          <ActivityIndicator style={{ flex: 1, marginTop: 40 }} color={COLORS.primary} size="large" />
        ) : links.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔗</Text>
            <Text style={styles.emptyText}>لا توجد روابط</Text>
          </View>
        ) : (
          <FlatList
            data={links}
            keyExtractor={(item: any) => item.linkId.toString()}
            contentContainerStyle={styles.list}
            onRefresh={refetch}
            refreshing={isLoading}
            renderItem={({ item }: { item: any }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.doctorName}>{item.doctorName || "طبيب بيطري"}</Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>نشط</Text>
                  </View>
                </View>

                <View style={styles.detail}>
                  <Text style={styles.detailLabel}>الحقل:</Text>
                  <Text style={styles.detailValue}>{item.farmName}</Text>
                </View>
                <View style={styles.detail}>
                  <Text style={styles.detailLabel}>المحافظة:</Text>
                  <Text style={styles.detailValue}>{item.farmGovernorate}</Text>
                </View>
                <View style={styles.detail}>
                  <Text style={styles.detailLabel}>البريد الإلكتروني:</Text>
                  <Text style={styles.detailValue}>{item.doctorEmail}</Text>
                </View>

                <TouchableOpacity style={styles.removeBtn} onPress={() => removeMutation.mutate({ linkId: item.linkId, farmId: item.farmId })}>
                  <Trash2 size={14} color={COLORS.white} />
                  <Text style={styles.removeBtnText}>إلغاء الربط</Text>
                </TouchableOpacity>
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
  doctorName: { fontSize: 15, fontWeight: "700", color: COLORS.black },
  activeBadge: { backgroundColor: "#D1FAE5", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  activeBadgeText: { fontSize: 11, fontWeight: "600", color: "#059669" },
  detail: { flexDirection: "row", marginBottom: 4, gap: 6 },
  detailLabel: { fontSize: 13, color: COLORS.darkGray, fontWeight: "500" },
  detailValue: { fontSize: 13, color: COLORS.black, flex: 1 },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 10,
    gap: 6,
  },
  removeBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 13 },
});
