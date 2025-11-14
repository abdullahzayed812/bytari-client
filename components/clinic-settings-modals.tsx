import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { COLORS } from "../constants/colors";
import { X, MapPin, Phone, Mail, Globe, Clock, Users, Trash2, Shield } from "lucide-react-native";

// ============== BASIC INFO MODAL ==============
interface BasicInfoModalProps {
  visible: boolean;
  onClose: () => void;
  initialData: {
    name: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export const BasicInfoModal: React.FC<BasicInfoModalProps> = ({ visible, onClose, initialData, onSave, isLoading }) => {
  const [name, setName] = useState(initialData.name);
  const [address, setAddress] = useState(initialData.address);
  const [latitude, setLatitude] = useState(initialData.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(initialData.longitude?.toString() || "");

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("خطأ", "اسم العيادة مطلوب");
      return;
    }
    if (!address.trim()) {
      Alert.alert("خطأ", "العنوان مطلوب");
      return;
    }

    onSave({
      name: name.trim(),
      address: address.trim(),
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تعديل المعلومات الأساسية</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Clinic Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>اسم العيادة *</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="أدخل اسم العيادة"
                  placeholderTextColor={COLORS.darkGray}
                  textAlign="right"
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>العنوان *</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="أدخل عنوان العيادة"
                  placeholderTextColor={COLORS.darkGray}
                  textAlign="right"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Location Coordinates */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الموقع الجغرافي (اختياري)</Text>
              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <TextInput
                    style={styles.input}
                    value={latitude}
                    onChangeText={setLatitude}
                    placeholder="خط العرض"
                    placeholderTextColor={COLORS.darkGray}
                    keyboardType="decimal-pad"
                    textAlign="right"
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
                  <TextInput
                    style={styles.input}
                    value={longitude}
                    onChangeText={setLongitude}
                    placeholder="خط الطول"
                    placeholderTextColor={COLORS.darkGray}
                    keyboardType="decimal-pad"
                    textAlign="right"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={isLoading}>
              <Text style={styles.saveButtonText}>{isLoading ? "جاري الحفظ..." : "حفظ"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============== CONTACT INFO MODAL ==============
interface ContactInfoModalProps {
  visible: boolean;
  onClose: () => void;
  initialData: {
    phone: string;
    email?: string | null;
    website?: string;
    facebook?: string;
    instagram?: string;
  };
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export const ContactInfoModal: React.FC<ContactInfoModalProps> = ({
  visible,
  onClose,
  initialData,
  onSave,
  isLoading,
}) => {
  const [phone, setPhone] = useState(initialData.phone || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [website, setWebsite] = useState(initialData.website || "");
  const [facebook, setFacebook] = useState(initialData.facebook || "");
  const [instagram, setInstagram] = useState(initialData.instagram || "");

  const handleSave = () => {
    if (!phone.trim()) {
      Alert.alert("خطأ", "رقم الهاتف مطلوب");
      return;
    }

    if (email && !email.includes("@")) {
      Alert.alert("خطأ", "البريد الإلكتروني غير صحيح");
      return;
    }

    onSave({
      phone: phone.trim(),
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      socialMedia: {
        facebook: facebook.trim() || undefined,
        instagram: instagram.trim() || undefined,
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تعديل معلومات الاتصال</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رقم الهاتف *</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="أدخل رقم الهاتف"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="phone-pad"
                  textAlign="right"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="أدخل البريد الإلكتروني"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="email-address"
                  textAlign="right"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Website */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الموقع الإلكتروني</Text>
              <View style={styles.inputContainer}>
                <Globe size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="www.example.com"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="url"
                  textAlign="right"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Social Media */}
            <Text style={styles.sectionTitle}>وسائل التواصل الاجتماعي</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>فيسبوك</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={facebook}
                  onChangeText={setFacebook}
                  placeholder="@YourPage"
                  placeholderTextColor={COLORS.darkGray}
                  textAlign="right"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>إنستغرام</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={instagram}
                  onChangeText={setInstagram}
                  placeholder="@YourPage"
                  placeholderTextColor={COLORS.darkGray}
                  textAlign="right"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={isLoading}>
              <Text style={styles.saveButtonText}>{isLoading ? "جاري الحفظ..." : "حفظ"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============== WORKING HOURS MODAL ==============
interface WorkingHoursModalProps {
  visible: boolean;
  onClose: () => void;
  initialData: any;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export const WorkingHoursModal: React.FC<WorkingHoursModalProps> = ({
  visible,
  onClose,
  initialData,
  onSave,
  isLoading,
}) => {
  const [workingHours, setWorkingHours] = useState(initialData);

  const handleSave = () => {
    onSave(workingHours);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تعديل ساعات العمل</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ساعات العمل</Text>
            <View style={styles.inputWithIcon}>
              <Clock size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputWithIconText}
                value={workingHours}
                onChangeText={(value) => setWorkingHours(value)}
                placeholder="مثال: السبت - الخميس: 8:00 ص - 6:00 م"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={isLoading}>
              <Text style={styles.saveButtonText}>{isLoading ? "جاري الحفظ..." : "حفظ"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface ServicesModalProps {
  visible: boolean;
  onClose: () => void;
  initialData: any;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export const ServicesModal: React.FC<ServicesModalProps> = ({ visible, onClose, initialData, onSave, isLoading }) => {
  const [services, setServices] = useState(initialData);

  const handleSave = () => {
    onSave(services);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تعديل خدمات العيادة</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>خدمات العيادة</Text>
            <View style={styles.inputWithIcon}>
              <Clock size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputWithIconText}
                value={services}
                onChangeText={(value) => setServices(value)}
                placeholder="جراحة، اشعة، تطعيمات"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={isLoading}>
              <Text style={styles.saveButtonText}>{isLoading ? "جاري الحفظ..." : "حفظ"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============== ADD STAFF MODAL ==============
interface AddStaffModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ visible, onClose, onSave, isLoading }) => {
  const [email, setEmail] = useState("vet1@example.com");
  const [licenseNumber, setLicenseNumber] = useState("LIC123123");
  const [specialization, setSpecialization] = useState("جراحة");
  const [experience, setExperience] = useState("3 سنوات");
  const [consultationFee, setConsultationFee] = useState("1200 دينار");

  const handleSave = () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("خطأ", "البريد الإلكتروني مطلوب وغير صحيح");
      return;
    }
    if (!licenseNumber.trim()) {
      Alert.alert("خطأ", "رقم الترخيص مطلوب");
      return;
    }

    onSave({
      email: email.trim(),
      licenseNumber: licenseNumber.trim(),
      specialization: specialization.trim() || undefined,
      experience: experience ? parseInt(experience) : undefined,
      consultationFee: consultationFee ? parseFloat(consultationFee) : undefined,
    });

    // Reset form
    setEmail("");
    setLicenseNumber("");
    setSpecialization("");
    setExperience("");
    setConsultationFee("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>إضافة موظف جديد</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>البريد الإلكتروني *</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="doctor@example.com"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="email-address"
                  textAlign="right"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* License Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رقم الترخيص *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  placeholder="أدخل رقم الترخيص"
                  placeholderTextColor={COLORS.darkGray}
                  textAlign="right"
                />
              </View>
            </View>

            {/* Specialization */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>التخصص</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={specialization}
                  onChangeText={setSpecialization}
                  placeholder="مثال: جراحة، باطنة، أسنان"
                  placeholderTextColor={COLORS.darkGray}
                  textAlign="right"
                />
              </View>
            </View>

            {/* Experience */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>سنوات الخبرة</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={experience}
                  onChangeText={setExperience}
                  placeholder="عدد السنوات"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="number-pad"
                  textAlign="right"
                />
              </View>
            </View>

            {/* Consultation Fee */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رسوم الاستشارة (دينار)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={consultationFee}
                  onChangeText={setConsultationFee}
                  placeholder="المبلغ"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="decimal-pad"
                  textAlign="right"
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={isLoading}>
              <Text style={styles.saveButtonText}>{isLoading ? "جاري الإضافة..." : "إضافة"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============== MANAGE STAFF MODAL ==============
interface ManageStaffModalProps {
  visible: boolean;
  onClose: () => void;
  staff: Array<{
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    specialization?: string | null;
    experience?: number | null;
    rating?: number | null;
    permissions?: Record<string, string | boolean>;
  }>;
  onRemove: (veterinarianId: number) => void;
  isLoading?: boolean;
}

const permissionTypes = [
  {
    id: "all",
    title: "جميع الصلاحيات",
    description: "الوصول الكامل لجميع الميزات",
    role: "chief_vet",
  },
  {
    id: "view_edit_pets",
    title: "عرض وتعديل ملفات الحيوانات",
    description: "إضافة وتعديل السجلات الطبية والتطعيمات",
    role: "veterinarian",
  },
  {
    id: "view_only",
    title: "عرض ملفات الحيوانات فقط",
    description: "الاطلاع على السجلات دون التعديل",
    role: "assistant",
  },
  {
    id: "appointments_only",
    title: "حجز المواعيد فقط",
    description: "إدارة المواعيد والحجوزات",
    role: "receptionist",
  },
];

export const ManageStaffModal: React.FC<ManageStaffModalProps> = ({ visible, onClose, staff, onRemove, isLoading }) => {
  const handleRemove = (staffMember: any) => {
    Alert.alert("تأكيد الحذف", `هل تريد إزالة ${staffMember.name} من العيادة؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إزالة",
        style: "destructive",
        onPress: () => onRemove(staffMember.id),
      },
    ]);
  };

  const getMemberRole = (role: string | boolean): string => {
    const roleType = permissionTypes.find((pt) => pt.id === role);

    if (!roleType?.role) return "";

    return roleType.title;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>إدارة الموظفين</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {staff.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={48} color={COLORS.darkGray} />
                <Text style={styles.emptyText}>لا يوجد موظفون</Text>
              </View>
            ) : (
              staff.map((member) => (
                <View key={member.id} style={styles.staffCard}>
                  <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>{member.name}</Text>
                    <Text style={styles.staffDetail}>{member.email}</Text>
                    {member.phone && <Text style={styles.staffDetail}>{member.phone}</Text>}
                    {member.specialization && <Text style={styles.staffSpecialization}>{member.specialization}</Text>}
                    {member.experience && <Text style={styles.staffExperience}>خبرة {member.experience} سنوات</Text>}
                    {member.permissions?.role && (
                      <Text style={styles.staffExperience}>{getMemberRole(member?.permissions?.role)}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(member)}
                    disabled={isLoading}
                  >
                    <Trash2 size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.button, styles.saveButton, { flex: 1 }]} onPress={onClose}>
              <Text style={styles.saveButtonText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============== PERMISSIONS MODAL ==============
interface PermissionsModalProps {
  visible: boolean;
  onClose: () => void;
  staff: Array<{
    id: number;
    name: string;
    specialization?: string | null;
    permissions?: Record<string, string | boolean>;
  }>;
  onSave: (permissions: any) => void;
  isLoading?: boolean;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ visible, onClose, staff, onSave, isLoading }) => {
  // State to track each staff member's permission
  const [staffPermissions, setStaffPermissions] = useState<{ [key: number]: string }>({});

  // Initialize permissions for all staff
  React.useEffect(() => {
    if (staff.length > 0 && Object.keys(staffPermissions).length === 0) {
      const initialPermissions: { [key: number]: string } = {};
      staff.forEach((member) => {
        // Default permission based on role or set to view_edit_pets
        initialPermissions[member.id] = member?.permissions?.role as string;
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
    // Convert to array format for saving
    const permissions = Object.entries(staffPermissions).map(([staffId, permission]) => ({
      veterinarianId: Number(staffId),
      permission,
    }));

    onSave(permissions);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>صلاحيات الموظفين</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {staff.length === 0 ? (
              <View style={styles.emptyState}>
                <Shield size={48} color={COLORS.darkGray} />
                <Text style={styles.emptyText}>لا يوجد موظفون لتعيين الصلاحيات</Text>
              </View>
            ) : (
              staff.map((member) => (
                <View key={member.id} style={styles.permissionStaffCard}>
                  {/* Staff Info */}
                  <View style={styles.permissionStaffHeader}>
                    <Text style={styles.permissionStaffName}>{member.name}</Text>
                    {member.specialization && <Text style={styles.permissionStaffRole}>{member.specialization}</Text>}
                  </View>

                  {/* Permission Options */}
                  <View style={styles.permissionOptions}>
                    {permissionTypes.map((permission) => (
                      <TouchableOpacity
                        key={permission.id}
                        style={[
                          styles.permissionOption,
                          staffPermissions[member.id] === permission.id && styles.permissionOptionSelected,
                        ]}
                        onPress={() => handlePermissionChange(member.id, permission.id)}
                      >
                        <View style={styles.permissionRadio}>
                          {staffPermissions[member.id] === permission.id && (
                            <View style={styles.permissionRadioInner} />
                          )}
                        </View>
                        <View style={styles.permissionContent}>
                          <Text
                            style={[
                              styles.permissionTitle,
                              staffPermissions[member.id] === permission.id && styles.permissionTitleSelected,
                            ]}
                          >
                            {permission.title}
                          </Text>
                          <Text style={styles.permissionDescription}>{permission.description}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Divider between staff members */}
                  {staff.indexOf(member) < staff.length - 1 && <View style={styles.permissionDivider} />}
                </View>
              ))
            )}

            {/* Permission Legend */}
            {staff.length > 0 && (
              <View style={styles.permissionLegend}>
                <Text style={styles.permissionLegendTitle}>ملاحظة:</Text>
                <Text style={styles.permissionLegendText}>
                  • الطبيب الرئيسي: يمكنه الوصول لجميع الميزات بما في ذلك إدارة العيادة والموظفين
                </Text>
                <Text style={styles.permissionLegendText}>
                  • الأطباء: يمكنهم عرض وتعديل السجلات الطبية وإضافة التطعيمات
                </Text>
                <Text style={styles.permissionLegendText}>• المساعدين: يمكنهم عرض السجلات الطبية فقط دون التعديل</Text>
                <Text style={styles.permissionLegendText}>• موظفي الاستقبال: يمكنهم حجز وإدارة المواعيد فقط</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          {staff.length > 0 && (
            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={isLoading}>
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={isLoading}>
                <Text style={styles.saveButtonText}>{isLoading ? "جاري الحفظ..." : "حفظ الصلاحيات"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ============== STYLES ==============
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  },
  modalBody: {
    padding: 16,
    maxHeight: "75%",
  },
  modalFooter: {
    flexDirection: "row-reverse",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  inputIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "right",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  row: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 12,
    textAlign: "right",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  emergencyContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary + "10",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  emergencyContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  dayContainer: {
    backgroundColor: COLORS.gray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  timeRow: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  timeInput: {
    flex: 1,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  timeValue: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: "100%",
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  staffCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.gray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "right",
  },
  staffDetail: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 2,
    textAlign: "right",
  },
  staffSpecialization: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },
  staffExperience: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: "right",
  },
  removeButton: {
    padding: 8,
    backgroundColor: COLORS.error + "20",
    borderRadius: 8,
    marginLeft: 12,
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
  },

  permissionStaffCard: {
    marginBottom: 24,
  },
  permissionStaffHeader: {
    marginBottom: 12,
  },
  permissionStaffName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 4,
  },
  permissionStaffRole: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: "right",
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
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 4,
  },
  permissionTitleSelected: {
    color: COLORS.primary,
  },
  permissionDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  permissionDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginTop: 24,
  },
  permissionLegend: {
    backgroundColor: COLORS.primary + "10",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  permissionLegendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 8,
  },
  permissionLegendText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
    marginBottom: 4,
    lineHeight: 18,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginVertical: 8,
    textAlign: "right",
    marginHorizontal: 15,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
  },
  inputWithIconText: {
    flex: 1,
    padding: 15,
    paddingLeft: 10,
    fontSize: 16,
    color: COLORS.black,
  },
});
