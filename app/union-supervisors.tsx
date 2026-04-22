import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React from "react";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useRouter, Stack } from "expo-router";
import { UserCheck, Building2, Mail, Trash2 } from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/providers/ToastProvider";

export default function UnionSupervisorsScreen() {
  const { isSuperAdmin, moderatorPermissions } = useApp();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();

  const canManage = isSuperAdmin || moderatorPermissions?.unionManagement;

  const { data, isLoading, error } = useQuery(trpc.union.supervisors.list.queryOptions());
  const supervisors = data?.supervisors ?? [];

  const removeMutation = useMutation(trpc.union.supervisors.remove.mutationOptions());

  const handleRemove = (supervisorId: number, name: string) => {
    Alert.alert(
      "إزالة المشرف",
      `هل تريد إزالة "${name}" من قائمة المشرفين؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إزالة",
          style: "destructive",
          onPress: () =>
            removeMutation.mutate(
              { supervisorId },
              {
                onSuccess: () => {
                  showToast({ type: "success", message: "تمت إزالة المشرف بنجاح" });
                  queryClient.invalidateQueries(trpc.union.supervisors.list.queryKey() as any);
                },
                onError: (e) => showToast({ type: "error", message: e.message }),
              },
            ),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "مشرفو النقابة",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>حدث خطأ أثناء تحميل البيانات</Text>
        </View>
      ) : supervisors.length === 0 ? (
        <View style={styles.centerBox}>
          <UserCheck size={48} color="#ccc" />
          <Text style={styles.emptyText}>لا يوجد مشرفون حتى الآن</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Text style={styles.countLabel}>{supervisors.length} مشرف مسجل</Text>
          {supervisors.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.card}
              onPress={() => router.push({ pathname: "/user-profile", params: { userId: String(s.userId) } })}
              activeOpacity={0.8}
            >
              <View style={styles.cardIconCol}>
                <View style={styles.avatarCircle}>
                  <UserCheck size={24} color={COLORS.primary} />
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.supervisorName}>{s.userName ?? "—"}</Text>
                <View style={styles.infoRow}>
                  <Mail size={13} color="#888" />
                  <Text style={styles.infoText}>{s.userEmail ?? "—"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Building2 size={13} color={COLORS.primary} />
                  <Text style={styles.branchText}>
                    {s.branchName ?? "—"}
                    {s.branchGovernorate ? ` · ${s.branchGovernorate}` : ""}
                  </Text>
                </View>
              </View>

              {canManage && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemove(s.id, s.userName ?? "")}
                  disabled={removeMutation.isPending}
                >
                  <Trash2 size={18} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loader: { marginTop: 60 },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  errorText: { fontSize: 15, color: COLORS.error },
  emptyText: { fontSize: 15, color: "#aaa", marginTop: 8 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  countLabel: {
    fontSize: 13,
    color: "#888",
    textAlign: "right",
    marginBottom: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIconCol: { alignItems: "center" },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EBF5FF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: { flex: 1, gap: 4 },
  supervisorName: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },
  infoText: { fontSize: 12, color: "#666", textAlign: "right" },
  branchText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
    textAlign: "right",
  },
  removeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },
});
