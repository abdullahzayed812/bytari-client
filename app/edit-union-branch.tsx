import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Save, Trash2, Plus, Edit3, X, Upload, Camera } from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UnionService {
  id: string;
  title: string;
  description: string;
  color: string;
}

interface UnionBranch {
  id: string;
  name: string;
  governorate: string;
  region: "central" | "northern" | "southern" | "kurdistan";
  address: string;
  phone: string;
  email: string;
  president: string;
  membersCount: number;
  isFollowing: boolean;
  rating: number;
  description: string;
  establishedYear: number;
  services: UnionService[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: "general" | "urgent" | "event" | "meeting";
  isImportant: boolean;
  image?: string;
  link?: string;
  linkText?: string;
  author?: string;
  views?: number;
  createdAt: string;
}

export default function EditUnionBranchScreen() {
  const { isSuperAdmin, hasAdminAccess, isModerator, moderatorPermissions } = useApp();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();

  const {
    data: originalBranch,
    isLoading,
    error,
  } = useQuery(trpc.union.branch.get.queryOptions(parseInt(id as string)));

  const { data: announcements, isLoading: isAnnouncementsLoading } = useQuery({
    ...trpc.union.announcement.list.queryOptions({ branchId: Number(id) }),
    enabled: !!id,
  });

  const [formData, setFormData] = useState<UnionBranch | null>(null);

  useEffect(() => {
    if (originalBranch) {
      const branch = originalBranch as any;
      setFormData({
        ...branch,
        services: Array.isArray(branch.services) ? branch.services : [],
      });
    }
  }, [originalBranch]);

  const updateBranchMutation = useMutation(trpc.union.branch.update.mutationOptions());

  const navigateToAddAnnouncement = () => {
    router.push(`/add-union-announcement?branchId=${id}`);
  };

  const handleSave = () => {
    Alert.alert("حفظ التغييرات", "هل أنت متأكد من حفظ جميع التغييرات؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حفظ",
        onPress: () => {
          updateBranchMutation.mutate(formData as any, {
            onSuccess: () => {
              queryClient.invalidateQueries(trpc.union.branch.get.queryKey(parseInt(id as string)));
              Alert.alert("تم الحفظ", "تم حفظ التغييرات بنجاح", [{ text: "موافق", onPress: () => router.back() }]);
            },
            onError: (error) => {
              Alert.alert("خطأ", "حدث خطأ أثناء حفظ التغييرات");
            },
          });
        },
      },
    ]);
  };

  const handleServiceUpdate = (serviceId: string, field: "title" | "description" | "color", value: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev?.services?.map((service) =>
        service?.id === serviceId ? { ...service, [field]: value } : service
      ),
    }));
  };

  const addNewService = () => {
    const newService: UnionService = {
      id: Date.now().toString(),
      title: "خدمة جديدة",
      description: "وصف الخدمة الجديدة",
      color: "#6B7280",
    };
    setFormData((prev) => ({
      ...prev,
      services: [...(prev?.services || []), newService],
    }));
  };

  const removeService = (serviceId: string) => {
    Alert.alert("حذف الخدمة", "هل أنت متأكد من حذف هذه الخدمة؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          setFormData((prev) => ({
            ...prev,
            services: prev.services.filter((service) => service.id !== serviceId),
          }));
        },
      },
    ]);
  };

  const deleteAnnouncementMutation = useMutation(trpc.union.announcement.delete.mutationOptions());

  const handleDeleteAnnouncement = (announcementId: string) => {
    Alert.alert("حذف الإعلان", "هل أنت متأكد من حذف هذا الإعلان؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deleteAnnouncementMutation.mutate(parseInt(announcementId), {
            onSuccess: () => {
              queryClient.invalidateQueries(trpc.union.announcement.list.queryKey as any);
            },
          });
        },
      },
    ]);
  };

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case "urgent":
        return COLORS.error;
      case "meeting":
        return COLORS.primary;
      case "event":
        return COLORS.success;
      default:
        return COLORS.darkGray;
    }
  };

  if (
    !isSuperAdmin &&
    !hasAdminAccess &&
    !(isModerator && moderatorPermissions?.sections?.includes("union-branches"))
  ) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "غير مصرح" }} />
        <View style={styles.noPermissionContainer}>
          <Text style={styles.noPermissionText}>ليس لديك صلاحية لتعديل معلومات النقابة</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading || !formData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error fetching data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "تعديل معلومات النقابة",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold", fontSize: 16 },
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={updateBranchMutation.isPending}>
              <Save size={20} color={COLORS.white} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>اسم النقابة</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              placeholder="اسم النقابة"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>المحافظة</Text>
            <TextInput
              style={styles.textInput}
              value={formData.governorate}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, governorate: text }))}
              placeholder="المحافظة"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>رئيس النقابة</Text>
            <TextInput
              style={styles.textInput}
              value={formData.president}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, president: text }))}
              placeholder="رئيس النقابة"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>سنة التأسيس</Text>
            <TextInput
              style={styles.textInput}
              value={formData.establishedYear.toString()}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, establishedYear: parseInt(text) || 0 }))}
              placeholder="سنة التأسيس"
              keyboardType="numeric"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>عدد الأعضاء</Text>
            <TextInput
              style={styles.textInput}
              value={formData.membersCount.toString()}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, membersCount: parseInt(text) || 0 }))}
              placeholder="عدد الأعضاء"
              keyboardType="numeric"
              textAlign="right"
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الاتصال</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>العنوان</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={formData.address}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, address: text }))}
              placeholder="العنوان الكامل"
              multiline
              numberOfLines={3}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>رقم الهاتف</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
              placeholder="رقم الهاتف"
              keyboardType="phone-pad"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
              placeholder="البريد الإلكتروني"
              keyboardType="email-address"
              textAlign="right"
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نبذة عن النقابة</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={formData.description}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
            placeholder="نبذة تعريفية عن النقابة"
            multiline
            numberOfLines={5}
            textAlign="right"
          />
        </View>

        {/* Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>خدمات النقابة</Text>
            <TouchableOpacity style={styles.addServiceButton} onPress={addNewService}>
              <Plus size={16} color={COLORS.white} />
              <Text style={styles.addServiceText}>إضافة خدمة</Text>
            </TouchableOpacity>
          </View>

          {formData?.services?.map((service, index) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceCardHeader}>
                <Text style={styles.serviceNumber}>الخدمة {index + 1}</Text>
                <TouchableOpacity onPress={() => removeService(service.id)} style={styles.removeServiceButton}>
                  <X size={16} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>عنوان الخدمة</Text>
                <TextInput
                  style={styles.textInput}
                  value={service.title}
                  onChangeText={(text) => handleServiceUpdate(service.id, "title", text)}
                  placeholder="عنوان الخدمة"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>وصف الخدمة</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={service.description}
                  onChangeText={(text) => handleServiceUpdate(service.id, "description", text)}
                  placeholder="وصف الخدمة"
                  multiline
                  numberOfLines={3}
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>لون الخدمة</Text>
                <View style={styles.colorPicker}>
                  <View style={[styles.colorPreview, { backgroundColor: service.color }]} />
                  <TextInput
                    style={styles.colorInput}
                    value={service.color}
                    onChangeText={(text) => handleServiceUpdate(service.id, "color", text)}
                    placeholder="#000000"
                    autoCapitalize="none"
                    textAlign="left"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity onPress={navigateToAddAnnouncement} style={styles.addButton}>
              <Plus size={16} color={COLORS.white} />
              <Text style={styles.addButtonText}>إضافة إعلان</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>الإعلانات والأخبار</Text>
          </View>

          {isAnnouncementsLoading ? (
            <ActivityIndicator />
          ) : (
            <View style={styles.announcementsList}>
              {announcements?.map((announcement) => (
                <View key={announcement.id} style={styles.announcementCard}>
                  <View style={styles.announcementHeader}>
                    <View style={styles.announcementActions}>
                      <TouchableOpacity
                        onPress={() => handleDeleteAnnouncement(announcement.id)}
                        style={styles.deleteButton}
                      >
                        <Trash2 size={14} color={COLORS.error} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => router.push(`/edit-union-announcement?id=${announcement.id}`)}
                        style={styles.editButton}
                      >
                        <Edit3 size={14} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.announcementMeta}>
                      <View
                        style={[
                          styles.announcementType,
                          { backgroundColor: getAnnouncementTypeColor(announcement.type) },
                        ]}
                      >
                        <Text style={styles.announcementTypeText}>{getAnnouncementTypeLabel(announcement.type)}</Text>
                      </View>
                      {announcement.isImportant && (
                        <View style={styles.importantBadge}>
                          <Text style={styles.importantText}>مهم</Text>
                        </View>
                      )}
                      <Text style={styles.announcementDate}>
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <Text style={styles.announcementContent}>{announcement.content}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noPermissionText: {
    fontSize: 18,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 8,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "left",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: "left",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  addServiceButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addServiceText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  serviceCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  serviceCardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  removeServiceButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#FEE2E2",
  },
  colorPicker: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  colorInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  addButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  announcementForm: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "left",
  },
  switchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  formActions: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    gap: 8,
  },
  formButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  cancelButtonText: {
    color: COLORS.darkGray,
    fontSize: 14,
    fontWeight: "600",
  },
  saveFormButton: {
    backgroundColor: COLORS.primary,
  },
  saveFormButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  announcementsList: {
    gap: 12,
  },
  announcementCard: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  announcementHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  announcementActions: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  announcementMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "flex-end",
  },
  announcementType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  announcementTypeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "600",
  },
  importantBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  importantText: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: "bold",
  },
  announcementDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  announcementContent: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    textAlign: "left",
  },
  imagePreviewContainer: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F8F9FA",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  imageActions: {
    flexDirection: "row-reverse",
    padding: 12,
    gap: 8,
  },
  changeImageButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  removeImageButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  imageActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
  },
});
