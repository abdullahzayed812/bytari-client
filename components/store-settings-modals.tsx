import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Switch } from "react-native";
import { COLORS } from "../constants/colors";
import { X, Save, MapPin, Phone, Mail, Globe, Clock, Users, Shield, Trash2 } from "lucide-react-native";
import { ImageGalleryUploader } from "./ImageGalleryUploader";
import { useToastContext } from "../providers/ToastProvider";
import { ConfirmationModal } from "./ConfirmationModal";

// ==================== STORE BASIC INFO MODAL ====================
export const StoreBasicInfoModal = ({
  visible,
  onClose,
  initialData,
  onSave,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  initialData: any;
  onSave: (data: any) => void;
  isLoading: boolean;
}) => {
  const { showToast } = useToastContext();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setAddress(initialData.address || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "");
      setLatitude(initialData.latitude?.toString() || "");
      setLongitude(initialData.longitude?.toString() || "");
      setImages(initialData.images || []);
    }
  }, [initialData]);

  const handleSave = () => {
    if (!name.trim()) {
      showToast({ type: "error", message: "اسم المذخر مطلوب" });
      return;
    }
    if (!address.trim()) {
      showToast({ type: "error", message: "العنوان مطلوب" });
      return;
    }

    onSave({
      name: name.trim(),
      address: address.trim(),
      description: description.trim(),
      category: category.trim(),
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      images,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>معلومات أساسية</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>اسم المذخر *</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="أدخل اسم المذخر" placeholderTextColor={COLORS.darkGray} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>العنوان *</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="أدخل العنوان"
                placeholderTextColor={COLORS.darkGray}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الوصف</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="وصف المذخر"
                placeholderTextColor={COLORS.darkGray}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الفئة</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="مثال: أدوية بيطرية، أعلاف، مستلزمات"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الإحداثيات (اختياري)</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  value={latitude}
                  onChangeText={setLatitude}
                  placeholder="خط العرض"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  value={longitude}
                  onChangeText={setLongitude}
                  placeholder="خط الطول"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ImageGalleryUploader images={images} onImagesChange={setImages} maxImages={5} label="صور المذخر" />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.saveButton, isLoading && styles.disabledButton]} onPress={handleSave} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Save size={20} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>حفظ</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==================== STORE CONTACT INFO MODAL ====================
export const StoreContactInfoModal = ({
  visible,
  onClose,
  initialData,
  onSave,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  initialData: any;
  onSave: (data: any) => void;
  isLoading: boolean;
}) => {
  const { showToast } = useToastContext();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    if (initialData) {
      setPhone(initialData.phone || "");
      setEmail(initialData.email || "");
      setWebsite(initialData.website || "");
      setFacebook(initialData.facebook || "");
      setInstagram(initialData.instagram || "");
      setWhatsapp(initialData.whatsapp || "");
    }
  }, [initialData]);

  const handleSave = () => {
    if (!phone.trim()) {
      showToast({ type: "error", message: "رقم الهاتف مطلوب" });
      return;
    }

    onSave({
      phone: phone.trim(),
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      facebook: facebook.trim() || undefined,
      instagram: instagram.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>معلومات الاتصال</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Phone size={18} color={COLORS.primary} />
                <Text style={styles.label}>رقم الهاتف *</Text>
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="أدخل رقم الهاتف"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Mail size={18} color={COLORS.primary} />
                <Text style={styles.label}>البريد الإلكتروني</Text>
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Globe size={18} color={COLORS.primary} />
                <Text style={styles.label}>الموقع الإلكتروني</Text>
              </View>
              <TextInput
                style={styles.input}
                value={website}
                onChangeText={setWebsite}
                placeholder="https://example.com"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Globe size={18} color={COLORS.primary} />
                <Text style={styles.label}>فيس بوك</Text>
              </View>
              <TextInput
                style={styles.input}
                value={facebook}
                onChangeText={setFacebook}
                placeholder="https://example.com"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Globe size={18} color={COLORS.primary} />
                <Text style={styles.label}>انستجرام</Text>
              </View>
              <TextInput
                style={styles.input}
                value={instagram}
                onChangeText={setInstagram}
                placeholder="https://example.com"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Globe size={18} color={COLORS.primary} />
                <Text style={styles.label}>واتساب</Text>
              </View>
              <TextInput
                style={styles.input}
                value={whatsapp}
                onChangeText={setWhatsapp}
                placeholder="https://example.com"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.saveButton, isLoading && styles.disabledButton]} onPress={handleSave} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Save size={20} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>حفظ</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==================== STORE WORKING HOURS MODAL ====================
export const StoreWorkingHoursModal = ({
  visible,
  onClose,
  initialData,
  onSave,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  initialData: string;
  onSave: (data: string) => void;
  isLoading: boolean;
}) => {
  const [workingHours, setWorkingHours] = useState("");

  useEffect(() => {
    if (initialData) {
      setWorkingHours(initialData);
    }
  }, [initialData]);

  const handleSave = () => {
    onSave(workingHours);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>ساعات العمل</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Clock size={18} color={COLORS.primary} />
                <Text style={styles.label}>أوقات العمل</Text>
              </View>
              <Text style={styles.helpText}>مثال: السبت - الخميس: 9:00 ص - 9:00 م{"\n"}الجمعة: 4:00 م - 10:00 م</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={workingHours}
                onChangeText={setWorkingHours}
                placeholder="أدخل ساعات العمل"
                placeholderTextColor={COLORS.darkGray}
                multiline
                numberOfLines={6}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.saveButton, isLoading && styles.disabledButton]} onPress={handleSave} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Save size={20} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>حفظ</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==================== ADD STORE STAFF MODAL ====================
export const AddStoreStaffModal = ({
  visible,
  onClose,
  onSave,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}) => {
  const { showToast } = useToastContext();
  const [email, setEmail] = useState("vet1@example.com");

  const handleSave = () => {
    if (!email.trim()) {
      showToast({ type: "error", message: "البريد الإلكتروني مطلوب" });
      return;
    }

    onSave({
      email: email.trim(),
    });

    // Reset form
    setEmail("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>إضافة موظف</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>البريد الإلكتروني *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.saveButton, isLoading && styles.disabledButton]} onPress={handleSave} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Users size={20} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>إضافة موظف</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==================== MANAGE STORE STAFF MODAL ====================
export const ManageStoreStaffModal = ({
  visible,
  onClose,
  staff,
  onRemove,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  staff: any[];
  onRemove: (employeeId: number) => void;
  isLoading: boolean;
}) => {
  const { showToast } = useToastContext();
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; employeeId: number | null; name: string }>({
    visible: false,
    employeeId: null,
    name: "",
  });

  const handleRemove = (employeeId: number, name: string) => {
    setConfirmModal({ visible: true, employeeId, name });
  };

  const confirmRemove = () => {
    if (confirmModal.employeeId) {
      onRemove(confirmModal.employeeId);
      showToast({
        type: "success",
        message: `تم إزالة ${confirmModal.name} من المذخر`,
      });
    }
    setConfirmModal({ visible: false, employeeId: null, name: "" });
  };

  const cancelRemove = () => {
    setConfirmModal({ visible: false, employeeId: null, name: "" });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>إدارة الموظفين</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {staff.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={48} color={COLORS.darkGray} />
                <Text style={styles.emptyText}>لا يوجد موظفين</Text>
              </View>
            ) : (
              staff.map((member) => (
                <View key={member.id} style={styles.staffCard}>
                  <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>{member.name}</Text>
                    <Text style={styles.staffEmail}>{member.email}</Text>
                    {member.role && (
                      <Text style={styles.staffRole}>
                        {member.role === "all"
                          ? "صلاحيات كاملة"
                          : member.role === "view_edit_inventory"
                            ? "عرض وتعديل المخزون"
                            : member.role === "view_only"
                              ? "عرض فقط"
                              : "إدارة الطلبات"}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(member.id, member.name)} disabled={isLoading}>
                    <Trash2 size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      <ConfirmationModal
        visible={confirmModal.visible}
        title="تأكيد الإزالة"
        message={`هل تريد إزالة ${confirmModal.name} من المذخر؟`}
        type="warning"
        confirmText="إزالة"
        cancelText="إلغاء"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        isLoading={isLoading}
      />
    </Modal>
  );
};

const permissionTypes = [
  {
    id: "all",
    title: "جميع الصلاحيات",
    description: "وصول كامل لجميع الميزات والإعدادات",
    role: "store_manager",
  },
  {
    id: "view_edit_inventory",
    title: "إدارة المخزون",
    description: "عرض وتعديل المنتجات وإدارة المخزون",
    role: "inventory_specialist",
  },
  {
    id: "view_only",
    title: "عرض المنتجات فقط",
    description: "الاطلاع على المنتجات والمخزون بدون تعديل",
    role: "viewer",
  },
  {
    id: "orders_only",
    title: "إدارة الطلبات فقط",
    description: "معالجة الطلبات وتتبعها بدون صلاحيات المخزون",
    role: "orders_staff",
  },
];

// ==================== STORE PERMISSIONS MODAL ====================
export const StorePermissionsModal = ({
  visible,
  onClose,
  staff,
  onSave,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  staff: any[];
  onSave: (permissions: any[]) => void;
  isLoading: boolean;
}) => {
  // Track each staff member's selected permission
  const [staffPermissions, setStaffPermissions] = useState<{ [key: number]: string }>({});

  // Initialize permissions when staff is loaded
  useEffect(() => {
    if (staff.length > 0 && Object.keys(staffPermissions).length === 0) {
      const initialPermissions: { [key: number]: string } = {};
      staff.forEach((member) => {
        initialPermissions[member.id] = member.role || "view_edit_inventory";
      });
      setStaffPermissions(initialPermissions);
    }
  }, [staff]);

  const handlePermissionChange = (staffId: number, permissionId: string) => {
    setStaffPermissions((prev) => ({
      ...prev,
      [staffId]: permissionId,
    }));
  };

  const handleSave = () => {
    const permissions = Object.entries(staffPermissions).map(([staffId, permission]) => ({
      veterinarianId: Number(staffId),
      permission,
    }));
    onSave(permissions);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>صلاحيات موظفي المذخر</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {staff.length === 0 ? (
              <View style={styles.emptyState}>
                <Shield size={50} color={COLORS.darkGray} />
                <Text style={styles.emptyText}>لا يوجد موظفون لتعيين الصلاحيات</Text>
              </View>
            ) : (
              staff.map((member) => (
                <View key={member.id} style={styles.permissionCard}>
                  {/* Staff info */}
                  <View style={styles.permissionHeader}>
                    <Text style={styles.permissionName}>{member.name}</Text>
                    {member.specialization && <Text style={styles.permissionRole}>{member.specialization}</Text>}
                  </View>

                  {/* Permission list */}
                  <View style={styles.permissionOptions}>
                    {permissionTypes?.map((permission) => (
                      <TouchableOpacity
                        key={permission.id}
                        style={[styles.permissionOption, staffPermissions[member.id] === permission.id && styles.permissionOptionSelected]}
                        onPress={() => handlePermissionChange(member.id, permission.id)}
                      >
                        {/* Radio */}
                        <View style={styles.permissionRadio}>
                          {staffPermissions[member.id] === permission.id && <View style={styles.permissionRadioInner} />}
                        </View>

                        {/* Text */}
                        <View style={styles.permissionTextContainer}>
                          <Text style={[styles.permissionTitle, staffPermissions[member.id] === permission.id && styles.permissionTitleSelected]}>
                            {permission.title}
                          </Text>
                          <Text style={styles.permissionDescription}>{permission.description}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Divider */}
                  <View style={styles.permissionDivider} />
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          {staff.length > 0 && (
            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.cancelButton, isLoading && styles.disabledButton]} onPress={onClose} disabled={isLoading}>
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.saveButton, isLoading && styles.disabledButton]} onPress={handleSave} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveButtonText}>حفظ الصلاحيات</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
  },
  modalContent: {
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  labelRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "left",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  halfInput: {
    flex: 1,
  },
  row: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: "left",
    lineHeight: 18,
  },
  radioOption: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    marginBottom: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
    textAlign: "left",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 12,
    textAlign: "center",
  },
  staffCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "left",
  },
  staffEmail: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: "left",
  },
  staffDetail: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 2,
    textAlign: "left",
  },
  staffRole: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "left",
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  permissionCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  permissionName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "left",
  },
  permissionRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  permissionLabel: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: "left",
    flex: 1,
  },

  permissionHeader: {
    marginBottom: 12,
  },
  permissionRole: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: "left",
  },
  permissionOptions: {
    gap: 8,
  },
  permissionOption: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    backgroundColor: COLORS.gray,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  permissionOptionSelected: {
    backgroundColor: COLORS.primary + "10",
    borderColor: COLORS.primary,
  },
  permissionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.darkGray,
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  permissionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "left",
    marginBottom: 4,
  },
  permissionTitleSelected: {
    color: COLORS.primary,
  },
  permissionDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "left",
  },
  permissionDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginTop: 24,
  },
  permissionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
});
