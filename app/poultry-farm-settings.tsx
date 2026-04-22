import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Settings, Users, UserPlus, Trash2, ChevronDown, Check, Mail } from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/providers/AppProvider";
import { useToastContext } from "@/providers/ToastProvider";
import { COLORS } from "@/constants/colors";

const FARM_TYPE_OPTIONS = [
  { value: "broiler", label: "تسمين (دجاج لحم)" },
  { value: "layer", label: "بياض (دجاج بيض)" },
  { value: "breeder", label: "أمهات" },
  { value: "mixed", label: "مختلط" },
];

const HEALTH_STATUS_OPTIONS = [
  { value: "healthy", label: "سليم" },
  { value: "quarantine", label: "حجر صحي" },
  { value: "sick", label: "مريض" },
];

const PERMISSIONS_OPTIONS = [
  { value: "add_daily_data", label: "إضافة بيانات يومية" },
  { value: "view_only", label: "عرض فقط" },
];

export default function PoultryFarmSettingsScreen() {
  const { id, farmName } = useLocalSearchParams<{ id: string; farmName: string }>();
  const router = useRouter();
  const { user } = useApp();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"info" | "staff">("info");
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [newWorkerPermission, setNewWorkerPermission] = useState<"add_daily_data" | "view_only">("add_daily_data");

  // Farm info form
  const [form, setForm] = useState({
    name: "",
    location: "",
    address: "",
    farmType: "broiler",
    capacity: "",
    currentPopulation: "",
    phone: "",
    email: "",
    description: "",
    licenseNumber: "",
    contactPerson: "",
    healthStatus: "healthy",
  });

  // Load farm details to prefill form
  const farmQuery = useQuery(trpc.poultryFarms.getDetails.queryOptions({ farmId: Number(id) }));

  useEffect(() => {
    if (farmQuery.data?.farm) {
      const f = farmQuery.data.farm;
      setForm({
        name: f.name || "",
        location: f.location || "",
        address: f.address || "",
        farmType: (f as any).farmType || "broiler",
        capacity: f.capacity?.toString() || "",
        currentPopulation: (f as any).currentPopulation?.toString() || "",
        phone: (f as any).phone || "",
        email: (f as any).email || "",
        description: f.description || "",
        licenseNumber: (f as any).licenseNumber || "",
        contactPerson: (f as any).contactPerson || "",
        healthStatus: (f as any).healthStatus || "healthy",
      });
    }
  }, [farmQuery.data]);

  // Workers query
  const workersQuery = useQuery(trpc.poultryFarms.getWorkers.queryOptions({ farmId: Number(id) }));

  const updateMutation = useMutation(trpc.poultryFarms.update.mutationOptions());
  const deleteFarmMutation = useMutation(trpc.poultryFarms.delete.mutationOptions());
  const addWorkerMutation = useMutation(trpc.poultryFarms.addWorker.mutationOptions());
  const removeWorkerMutation = useMutation(trpc.poultryFarms.removeWorker.mutationOptions());
  const updatePermMutation = useMutation(trpc.poultryFarms.updateWorkerPermissions.mutationOptions());

  const handleSaveInfo = () => {
    if (!form.name.trim()) {
      showToast({ type: "error", message: "اسم الحقل مطلوب" });
      return;
    }
    updateMutation.mutate(
      {
        farmId: Number(id),
        ownerId: Number(user?.id),
        name: form.name.trim(),
        location: form.location.trim() || undefined,
        address: form.address.trim() || undefined,
        farmType: form.farmType as any,
        capacity: form.capacity ? parseInt(form.capacity) : undefined,
        currentPopulation: form.currentPopulation ? parseInt(form.currentPopulation) : undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        description: form.description.trim() || undefined,
        licenseNumber: form.licenseNumber.trim() || undefined,
        contactPerson: form.contactPerson.trim() || undefined,
        healthStatus: form.healthStatus as any,
      },
      {
        onSuccess: () => {
          showToast({ type: "success", message: "تم حفظ المعلومات بنجاح" });
          queryClient.invalidateQueries(trpc.poultryFarms.getDetails.queryKey({ farmId: Number(id) }) as any);
          queryClient.invalidateQueries(trpc.poultryFarms.list.queryKey() as any);
        },
        onError: (e) => showToast({ type: "error", message: e.message }),
      },
    );
  };

  const handleConfirmDeleteFarm = () => {
    deleteFarmMutation.mutate(
      { farmId: Number(id), ownerId: Number(user?.id) },
      {
        onSuccess: () => {
          setShowDeleteConfirmModal(false);
          showToast({ type: "success", message: "تم حذف حقل الدواجن بنجاح" });
          queryClient.invalidateQueries(trpc.poultryFarms.list.queryKey() as any);
          router.replace("/(tabs)/pets");
        },
        onError: (e) => showToast({ type: "error", message: e.message }),
      },
    );
  };

  const handleAddWorker = () => {
    if (!emailInput.trim()) {
      showToast({ type: "error", message: "أدخل البريد الإلكتروني" });
      return;
    }
    addWorkerMutation.mutate(
      {
        farmId: Number(id),
        email: emailInput.trim().toLowerCase(),
        permissions: newWorkerPermission,
        addedBy: Number(user?.id),
      },
      {
        onSuccess: (data) => {
          showToast({ type: "success", message: data.message });
          setEmailInput("");
          workersQuery.refetch();
        },
        onError: (e) => showToast({ type: "error", message: e.message }),
      },
    );
  };

  const handleRemoveWorker = (workerId: number, workerName: string) => {
    Alert.alert("إزالة الموظف", `هل تريد إزالة "${workerName}" من الحقل؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إزالة",
        style: "destructive",
        onPress: () =>
          removeWorkerMutation.mutate(
            { farmId: Number(id), workerId, removedBy: Number(user?.id) },
            {
              onSuccess: () => {
                showToast({ type: "success", message: "تمت الإزالة" });
                workersQuery.refetch();
              },
              onError: (e) => showToast({ type: "error", message: e.message }),
            },
          ),
      },
    ]);
  };

  const handleUpdatePermission = (workerId: number, perms: "add_daily_data" | "view_only") => {
    updatePermMutation.mutate(
      { workerId, permissions: perms, updatedBy: Number(user?.id) },
      {
        onSuccess: () => {
          showToast({ type: "success", message: "تم تحديث الصلاحية" });
          workersQuery.refetch();
        },
        onError: (e) => showToast({ type: "error", message: e.message }),
      },
    );
  };

  const workers = workersQuery.data?.workers || [];

  const renderField = (label: string, key: keyof typeof form, numeric = false) => (
    <View style={styles.fieldGroup} key={key}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={form[key]}
        onChangeText={(v) => setForm((p) => ({ ...p, [key]: v }))}
        keyboardType={numeric ? "numeric" : "default"}
        textAlign="right"
      />
    </View>
  );

  const renderSelect = (label: string, key: keyof typeof form, options: { value: string; label: string }[]) => (
    <View style={styles.fieldGroup} key={key}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.selectRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.selectChip, form[key] === opt.value && styles.selectChipActive]}
            onPress={() => setForm((p) => ({ ...p, [key]: opt.value }))}
          >
            <Text style={[styles.selectChipText, form[key] === opt.value && styles.selectChipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "إعدادات الحقل",
          headerStyle: { backgroundColor: "#F59E0B" },
          headerTintColor: "#fff",
        }}
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === "info" && styles.tabActive]} onPress={() => setActiveTab("info")}>
          <Settings size={16} color={activeTab === "info" ? "#F59E0B" : "#888"} />
          <Text style={[styles.tabText, activeTab === "info" && styles.tabTextActive]}>معلومات الحقل</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === "staff" && styles.tabActive]} onPress={() => setActiveTab("staff")}>
          <Users size={16} color={activeTab === "staff" ? "#F59E0B" : "#888"} />
          <Text style={[styles.tabText, activeTab === "staff" && styles.tabTextActive]}>الموظفون ({workers.length})</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "info" ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderField("اسم الحقل", "name")}
          {renderField("الموقع", "location")}
          {renderField("العنوان التفصيلي", "address")}
          {renderSelect("نوع الإنتاج", "farmType", FARM_TYPE_OPTIONS)}
          {renderField("الطاقة الاستيعابية (طير)", "capacity", true)}
          {renderField("العدد الحالي", "currentPopulation", true)}
          {renderField("رقم الهاتف", "phone")}
          {renderField("البريد الإلكتروني", "email")}
          {renderField("رقم الرخصة", "licenseNumber")}
          {renderField("الشخص المسؤول", "contactPerson")}
          {renderSelect("الحالة الصحية", "healthStatus", HEALTH_STATUS_OPTIONS)}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>وصف الحقل</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
              multiline
              numberOfLines={3}
              textAlign="right"
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, updateMutation.isPending && styles.saveBtnDisabled]}
            onPress={handleSaveInfo}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>حفظ التغييرات</Text>}
          </TouchableOpacity>

          {/* Danger zone */}
          <View style={styles.dangerZone}>
            <Text style={styles.dangerZoneTitle}>حذف الحقل</Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowDeleteConfirmModal(true)}>
              <Trash2 size={18} color="#fff" />
              <Text style={styles.deleteBtnText}>حذف الحقل نهائياً</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Add worker */}
          <View style={styles.addWorkerCard}>
            <Text style={styles.sectionTitle}>إضافة موظف جديد</Text>
            <View style={styles.emailRow}>
              <Mail size={18} color="#888" />
              <TextInput
                style={styles.emailInput}
                value={emailInput}
                onChangeText={setEmailInput}
                placeholder="البريد الإلكتروني للموظف"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="right"
              />
            </View>

            <Text style={styles.permLabel}>الصلاحية:</Text>
            <View style={styles.selectRow}>
              {PERMISSIONS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.selectChip, newWorkerPermission === opt.value && styles.selectChipActive]}
                  onPress={() => setNewWorkerPermission(opt.value as any)}
                >
                  <Text style={[styles.selectChipText, newWorkerPermission === opt.value && styles.selectChipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.addBtn, addWorkerMutation.isPending && styles.saveBtnDisabled]}
              onPress={handleAddWorker}
              disabled={addWorkerMutation.isPending}
            >
              {addWorkerMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <UserPlus size={18} color="#fff" />
                  <Text style={styles.addBtnText}>إضافة موظف</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Workers list */}
          <Text style={styles.sectionTitle}>الموظفون الحاليون ({workers.length})</Text>

          {workersQuery.isLoading ? (
            <ActivityIndicator color="#F59E0B" style={{ marginTop: 20 }} />
          ) : workers.length === 0 ? (
            <View style={styles.emptyWorkers}>
              <Users size={40} color="#ddd" />
              <Text style={styles.emptyText}>لا يوجد موظفون حتى الآن</Text>
            </View>
          ) : (
            workers.map((w) => (
              <View key={w.id} style={styles.workerCard}>
                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>{w.name}</Text>
                  <Text style={styles.workerEmail}>{w.email}</Text>
                  <Text style={styles.workerType}>{w.userType === "vet" ? "طبيب بيطري" : "مستخدم"}</Text>
                </View>

                {/* Permission toggle */}
                <View style={styles.workerActions}>
                  <View style={styles.permRow}>
                    {PERMISSIONS_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.permChip, w.permissions === opt.value && styles.permChipActive]}
                        onPress={() => handleUpdatePermission(w.id, opt.value as any)}
                      >
                        <Text style={[styles.permChipText, w.permissions === opt.value && styles.permChipTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveWorker(w.id, w.name || "")}>
                    <Trash2 size={16} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>حذف الحقل</Text>
            <Text style={styles.confirmMessage}>هل أنت متأكد من رغبتك في حذف هذا الحقل؟ سيتم حذف جميع البيانات المرتبطة به نهائياً.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={[styles.confirmBtn, styles.confirmBtnCancel]} onPress={() => setShowDeleteConfirmModal(false)}>
                <Text style={styles.confirmBtnCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.confirmBtnDelete, deleteFarmMutation.isPending && { opacity: 0.6 }]}
                onPress={handleConfirmDeleteFarm}
                disabled={deleteFarmMutation.isPending}
              >
                {deleteFarmMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.confirmBtnDeleteText}>حذف</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  tabs: {
    flexDirection: "row-reverse",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#F59E0B" },
  tabText: { fontSize: 14, color: "#888" },
  tabTextActive: { color: "#F59E0B", fontWeight: "600" },

  content: { flex: 1, padding: 16 },

  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, color: "#555", textAlign: "right", marginBottom: 6, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#fff",
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },

  selectRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 },
  selectChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  selectChipActive: { borderColor: "#F59E0B", backgroundColor: "#FFFBEB" },
  selectChipText: { fontSize: 12, color: "#666" },
  selectChipTextActive: { color: "#F59E0B", fontWeight: "600" },

  saveBtn: {
    backgroundColor: "#F59E0B",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 30,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Staff tab
  addWorkerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#333", textAlign: "right", marginBottom: 12 },
  emailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
    backgroundColor: "#fff",
    gap: 8,
    marginBottom: 12,
  },
  emailInput: { flex: 1, fontSize: 14, color: "#333", paddingVertical: 8 },
  permLabel: { fontSize: 13, color: "#555", textAlign: "right", marginBottom: 8 },
  addBtn: {
    backgroundColor: "#F59E0B",
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  addBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  emptyWorkers: { alignItems: "center", paddingTop: 40 },
  emptyText: { fontSize: 14, color: "#aaa", marginTop: 10 },

  workerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  workerInfo: { marginBottom: 10 },
  workerName: { fontSize: 15, fontWeight: "bold", color: "#333", textAlign: "right" },
  workerEmail: { fontSize: 12, color: "#888", textAlign: "right", marginTop: 2 },
  workerType: { fontSize: 11, color: "#F59E0B", textAlign: "right", marginTop: 2 },
  workerActions: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  permRow: { flex: 1, flexDirection: "row-reverse", gap: 6 },
  permChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  permChipActive: { borderColor: "#F59E0B", backgroundColor: "#FFFBEB" },
  permChipText: { fontSize: 11, color: "#666" },
  permChipTextActive: { color: "#F59E0B", fontWeight: "600" },
  removeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },

  dangerZone: {
    marginTop: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FEF2F2",
  },
  dangerZoneTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#DC2626",
    textAlign: "left",
    marginBottom: 12,
  },
  deleteBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingVertical: 13,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  deleteBtnText: { color: "#fff", fontSize: 15, fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmModal: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 10,
  },
  confirmMessage: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 22,
  },
  confirmActions: {
    flexDirection: "row-reverse",
    gap: 10,
    justifyContent: "center",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmBtnCancel: { backgroundColor: "#f0f0f0" },
  confirmBtnCancelText: { fontSize: 15, color: "#555", fontWeight: "600" },
  confirmBtnDelete: { backgroundColor: "#DC2626" },
  confirmBtnDeleteText: { fontSize: 15, color: "#fff", fontWeight: "bold" },
});
