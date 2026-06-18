import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Image,
} from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, UserCog, Plus, Trash2, Shield, Check } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useToastContext } from "@/providers/ToastProvider";

type StaffMember = {
  staffId: number;
  id: number;
  userId: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  specialization?: string | null;
  experience?: number | null;
  isVerified?: boolean | null;
  status?: string | null;
  permissions: {
    role: string;
    canViewPets: boolean;
    canEditPets: boolean;
    canAddMedicalRecords: boolean;
    canAddVaccinations: boolean;
    canManageAppointments: boolean;
    canViewReports: boolean;
    canManageStaff: boolean;
    canManageSettings: boolean;
  };
};

const ROLE_OPTIONS = [
  { key: "all", label: "صلاحيات كاملة" },
  { key: "view_edit_pets", label: "عرض وتعديل الحيوانات" },
  { key: "view_only", label: "عرض فقط" },
  { key: "appointments_only", label: "المواعيد فقط" },
];


export default function ClinicStaff() {
  const router = useRouter();
  const { clinicId } = useLocalSearchParams();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Add form
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<"all" | "view_edit_pets" | "view_only" | "appointments_only">("view_edit_pets");

  // Role editing
  const [editRole, setEditRole] = useState<"all" | "view_edit_pets" | "view_only" | "appointments_only">("view_edit_pets");

  const queryKey = { clinicId: Number(clinicId) };

  const { data, isLoading, refetch } = useQuery(
    trpc.clinics.settings.staff.getStaff.queryOptions(queryKey)
  );

  const addMutation = useMutation(trpc.clinics.settings.staff.addStaff.mutationOptions());
  const removeMutation = useMutation(trpc.clinics.settings.staff.removeStaff.mutationOptions());
  const updatePermsMutation = useMutation(trpc.clinics.settings.staff.updatePermissions.mutationOptions());

  const staff: StaffMember[] = (data as any)?.staff ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: trpc.clinics.settings.staff.getStaff.queryKey(queryKey) });

  const handleAdd = async () => {
    if (!addEmail.trim()) {
      showToast({ message: "يجب إدخال البريد الإلكتروني", type: "error" });
      return;
    }
    try {
      await addMutation.mutateAsync({
        clinicId: Number(clinicId),
        email: addEmail.trim().toLowerCase(),
        role: addRole,
      });
      showToast({ message: "تم إضافة الموظف بنجاح", type: "success" });
      setShowAddModal(false);
      setAddEmail("");
      invalidate();
    } catch (e: any) {
      showToast({ message: e.message || "حدث خطأ", type: "error" });
    }
  };

  const handleRemove = (s: StaffMember) => {
    Alert.alert("إزالة الموظف", `هل تريد إزالة ${s.name} من العيادة؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إزالة",
        style: "destructive",
        onPress: async () => {
          try {
            await removeMutation.mutateAsync({ clinicId: Number(clinicId), veterinarianId: s.id });
            showToast({ message: "تم إزالة الموظف", type: "success" });
            invalidate();
          } catch (e: any) {
            showToast({ message: e.message || "حدث خطأ", type: "error" });
          }
        },
      },
    ]);
  };

  const openPermissions = (s: StaffMember) => {
    setSelectedStaff(s);
    setEditRole((s.permissions.role as any) ?? "view_edit_pets");
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) return;
    try {
      await updatePermsMutation.mutateAsync({
        clinicId: Number(clinicId),
        permissions: [{ veterinarianId: selectedStaff.id, permission: editRole }],
      });
      showToast({ message: "تم تحديث الصلاحيات", type: "success" });
      setShowPermissionsModal(false);
      invalidate();
    } catch (e: any) {
      showToast({ message: e.message || "حدث خطأ", type: "error" });
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <UserCog size={20} color={COLORS.success} />
            <Text style={styles.headerTitle}>إدارة الموظفين والأطباء</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Plus size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : staff.length === 0 ? (
          <View style={styles.center}>
            <UserCog size={48} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>لا يوجد موظفون بعد</Text>
            <Text style={styles.emptySubtext}>أضف طبيباً أو موظفاً بريده الإلكتروني</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAddModal(true)}>
              <Plus size={16} color={COLORS.white} />
              <Text style={styles.emptyBtnText}>إضافة موظف</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {staff.map((s) => (
              <View key={s.staffId} style={styles.card}>
                <View style={styles.cardTop}>
                  {s.avatar ? (
                    <Image source={{ uri: s.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>{s.name?.[0] ?? "؟"}</Text>
                    </View>
                  )}
                  <View style={styles.cardInfo}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={styles.staffName}>{s.name}</Text>
                      {s.isVerified && <Shield size={14} color={COLORS.success} />}
                    </View>
                    {s.email && <Text style={styles.staffEmail}>{s.email}</Text>}
                    {s.specialization && <Text style={styles.staffSpec}>{s.specialization}</Text>}
                    <View style={styles.roleChip}>
                      <Text style={styles.roleChipText}>
                        {ROLE_OPTIONS.find((r) => r.key === s.permissions.role)?.label ?? s.permissions.role}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(s)}>
                    <Trash2 size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.permsBtn} onPress={() => openPermissions(s)}>
                    <Shield size={15} color={COLORS.primary} />
                    <Text style={styles.permsBtnText}>إدارة الصلاحيات</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Add Staff Modal */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>إضافة موظف / طبيب</Text>
              <TextInput
                style={styles.input}
                placeholder="البريد الإلكتروني للمستخدم"
                value={addEmail}
                onChangeText={setAddEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.fieldLabel}>الدور</Text>
              {ROLE_OPTIONS.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleOption, addRole === r.key && styles.roleOptionActive]}
                  onPress={() => setAddRole(r.key as any)}
                >
                  {addRole === r.key ? <Check size={16} color={COLORS.primary} /> : <View style={{ width: 16 }} />}
                  <Text style={[styles.roleOptionText, addRole === r.key && styles.roleOptionTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.modalBtns}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.primary }]} onPress={handleAdd} disabled={addMutation.isPending}>
                  {addMutation.isPending ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.modalBtnText}>إضافة</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.darkGray }]} onPress={() => setShowAddModal(false)}>
                  <Text style={styles.modalBtnText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Permissions Modal */}
        <Modal visible={showPermissionsModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>صلاحيات {selectedStaff?.name}</Text>
              <Text style={styles.fieldLabel}>اختر مستوى الصلاحيات</Text>
              {ROLE_OPTIONS.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleOption, editRole === r.key && styles.roleOptionActive]}
                  onPress={() => setEditRole(r.key as any)}
                >
                  {editRole === r.key ? <Check size={16} color={COLORS.primary} /> : <View style={{ width: 16 }} />}
                  <Text style={[styles.roleOptionText, editRole === r.key && styles.roleOptionTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.modalBtns}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.success }]} onPress={handleSavePermissions} disabled={updatePermsMutation.isPending}>
                  {updatePermsMutation.isPending ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.modalBtnText}>حفظ</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.darkGray }]} onPress={() => setShowPermissionsModal(false)}>
                  <Text style={styles.modalBtnText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.black },
  addButton: { backgroundColor: COLORS.primary, borderRadius: 8, padding: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.black, marginTop: 14 },
  emptySubtext: { fontSize: 13, color: COLORS.darkGray, textAlign: "center", marginTop: 6 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 18,
  },
  emptyBtnText: { color: COLORS.white, fontSize: 14, fontWeight: "bold" },
  listContent: { padding: 14, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },
  cardInfo: { flex: 1 },
  staffName: { fontSize: 15, fontWeight: "bold", color: COLORS.black },
  staffEmail: { fontSize: 12, color: COLORS.darkGray, marginTop: 2 },
  staffSpec: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
  roleChip: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary + "20",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleChipText: { fontSize: 11, color: COLORS.primary, fontWeight: "600" },
  removeBtn: { padding: 6 },
  cardActions: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    flexDirection: "row",
  },
  permsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  permsBtnText: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalBox: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalTitle: { fontSize: 17, fontWeight: "bold", color: COLORS.black, textAlign: "center", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: COLORS.black,
    marginBottom: 12,
  },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: COLORS.black, marginBottom: 8 },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "#F5F5F5",
  },
  roleOptionActive: { backgroundColor: COLORS.primary + "15", borderWidth: 1, borderColor: COLORS.primary },
  roleOptionText: { fontSize: 14, color: COLORS.darkGray },
  roleOptionTextActive: { color: COLORS.primary, fontWeight: "bold" },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 16 },
  modalBtn: { flex: 1, padding: 13, borderRadius: 8, alignItems: "center" },
  modalBtnText: { color: COLORS.white, fontSize: 15, fontWeight: "bold" },
});
