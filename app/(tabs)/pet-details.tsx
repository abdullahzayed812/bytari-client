import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import Button from "../../components/Button 2";
import { Camera, Edit3, Trash2, X, AlertTriangle } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "../../lib/trpc";
import { useToastContext } from "@/providers/ToastProvider";

export default function PetDetailsScreen() {
  const { t } = useI18n();
  const { userMode, user } = useApp();
  const router = useRouter();
  const { id, clinicAccess } = useLocalSearchParams<{
    id: string;
    clinicAccess?: string;
  }>();
  const { showToast } = useToastContext();

  const [activeTab, setActiveTab] = useState<
    "info" | "medical" | "vaccinations" | "reminders"
  >("info");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    gender: "",
    weight: "",
    color: "",
    image: "",
    medicalHistory: "",
    vaccinations: "",
    isLost: false,
  });

  const isClinicAccess = clinicAccess === "true" && userMode === "veterinarian";
  const isOwner = !isClinicAccess && userMode === "pet_owner";
  const isAdmin = userMode === "admin";

  // Fetch pet details based on user mode
  const petQuery = useQuery({
    ...trpc.admin.pets.getProfile.queryOptions({
      petId: Number(id),
      // adminId: Number(user?.id) || 0,
    }),
    // enabled: !!id && !!user?.id && isAdmin,
  });

  // Fallback to regular pet query for non-admin users
  // const regularPetQuery = useQuery({
  //   ...trpc.pets.getAllForAdmin.queryOptions({
  //     petId: Number(id),
  //     adminId: Number(user?.id),
  //   }),
  //   enabled: !!id && !isAdmin,
  // });

  const pet = petQuery.data;
  const isLoading = petQuery.isLoading;

  const createApprovalMutation = useMutation(
    trpc.pets.createApprovalRequest.mutationOptions({})
  );

  // Update pet mutation for admin
  const updatePetMutation = useMutation(
    trpc.admin.updatePetProfile.mutationOptions({})
  );

  // Delete pet mutation for admin
  const deletePetMutation = useMutation(
    trpc.admin.deletePet.mutationOptions({})
  );

  // Regular update for pet owners
  const updatePetOwnerMutation = useMutation(
    trpc.pets.update.mutationOptions({})
  );

  // Initialize edit form when pet data is loaded
  useEffect(() => {
    if (pet) {
      setEditForm({
        name: pet.name || "",
        type: pet.type || "",
        breed: pet.breed || "",
        age: pet.age?.toString() || "",
        gender: pet.gender || "",
        weight: pet.weight?.toString() || "",
        color: pet.color || "",
        image: pet.image || "",
        medicalHistory: pet.medicalHistory || "",
        vaccinations: pet.vaccinations || "",
        isLost: pet.isLost || false,
      });
    }
  }, [pet]);

  const handleReportLost = () => {
    if (pet) {
      router.push({
        pathname: "/report-lost-pet",
        params: { petId: pet.id },
      });
    }
  };

  const handlePetImageUpload = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("خطأ", "نحتاج إلى إذن للوصول إلى الصور");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEditForm((prev) => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء اختيار الصورة");
    }
  };

  const handleEditPet = () => {
    if (!pet) return;
    setShowEditModal(true);
  };

  const submitEditPet = async () => {
    if (!editForm.name || !editForm.type) {
      Alert.alert("خطأ", "يرجى ملء الحقول المطلوبة");
      return;
    }

    if (!pet || !user) return;

    if (isAdmin) {
      // Admin update with all fields
      updatePetMutation.mutate(
        {
          petId: pet.id,
          adminId: user.id,
          name: editForm.name.trim(),
          type: editForm.type,
          breed: editForm.breed.trim() || undefined,
          age: editForm.age ? parseInt(editForm.age) : undefined,
          gender: editForm.gender as "male" | "female" | undefined,
          weight: editForm.weight ? parseFloat(editForm.weight) : undefined,
          color: editForm.color.trim() || undefined,
          image: editForm.image || undefined,
          medicalHistory: editForm.medicalHistory.trim() || undefined,
          vaccinations: editForm.vaccinations.trim() || undefined,
          isLost: editForm.isLost,
        },
        {
          onSuccess: () => {
            showToast({
              message: "تم تحديث معلومات الحيوان بنجاح",
              type: "success",
            });
            setShowEditModal(false);
            trpc.admin.getPetProfile.invalidate();
          },
          onError: (error) => {
            showToast({
              message: error.message || "حدث خطأ أثناء تحديث الحيوان",
              type: "error",
            });
          },
        }
      );
    } else {
      // Pet owner update (limited fields)
      updatePetOwnerMutation.mutate(
        {
          id: pet.id,
          name: editForm.name.trim(),
          type: editForm.type as "dog" | "cat" | "rabbit" | "bird" | "other",
          breed: editForm.breed.trim() || undefined,
          age: editForm.age ? parseInt(editForm.age) : undefined,
          gender: editForm.gender as "male" | "female",
          weight: editForm.weight ? parseFloat(editForm.weight) : undefined,
          color: editForm.color.trim() || undefined,
          image: editForm.image || undefined,
        },
        {
          onSuccess: () => {
            showToast({
              message: "تم تحديث معلومات الحيوان بنجاح",
              type: "success",
            });
            setShowEditModal(false);
            trpc.pets.getById.invalidate();
          },
          onError: (error) => {
            showToast({
              message: error.message || "حدث خطأ أثناء تحديث الحيوان",
              type: "error",
            });
          },
        }
      );
    }
  };

  const handleDeletePet = () => {
    if (!pet || !user || !isAdmin) return;

    Alert.alert(
      "حذف الحيوان",
      "هل أنت متأكد من حذف هذا الحيوان؟ هذا الإجراء لا يمكن التراجع عنه.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: () => {
            deletePetMutation.mutate(
              {
                petId: pet.id,
                adminId: user.id,
                reason: "Admin deletion",
              },
              {
                onSuccess: () => {
                  showToast({
                    message: "تم حذف الحيوان بنجاح",
                    type: "success",
                  });
                  router.back();
                },
                onError: (error) => {
                  showToast({
                    message: error.message || "حدث خطأ أثناء حذف الحيوان",
                    type: "error",
                  });
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleCancelFollowUp = () => {
    Alert.alert(
      "إلغاء المتابعات",
      "هل تريد إلغاء جميع طلبات المتابعة المعلقة لهذا الحيوان؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "نعم",
          onPress: () => {
            Alert.alert("تم", "تم إلغاء جميع طلبات المتابعة المعلقة");
          },
        },
      ]
    );
  };

  const handleAdoptionBreeding = (type: string) => {
    Alert.alert("عرض للتبني", "هل تريد عرض هذا الحيوان للتبني؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "نعم",
        onPress: () => {
          // ✅ Validate required fields
          if (!pet?.name?.trim()) {
            showToast({
              type: "error",
              message: "يرجى إدخال اسم الحيوان",
            });
            return;
          }
          if (!pet?.age > 0) {
            showToast({
              type: "error",
              message: "يرجى إدخال عمر الحيوان",
            });
            return;
          }
          if (!pet?.color?.trim()) {
            showToast({
              type: "error",
              message: "يرجى إدخال لون الحيوان",
            });
            return;
          }
          // if (!pet?.location?.trim()) {
          //   showToast({
          //     type: "error",
          //     message: "يرجى إدخال الموقع",
          //   });
          //   return;
          // }
          // if (!pet?.description?.trim()) {
          //   showToast({
          //     type: "error",
          //     message: "يرجى إدخال وصف الحيوان",
          //   });
          //   return;
          // }
          if (!user) {
            showToast({
              type: "error",
              message: "يرجى تسجيل الدخول أولاً",
            });
            return;
          }

          createApprovalMutation.mutate(
            {
              name: pet?.name,
              type: pet?.type,
              breed: pet?.breed || undefined,
              age: pet?.age ? parseInt(pet?.age) : undefined,
              gender: pet?.gender,
              weight: pet?.weight ? parseFloat(pet?.weight) : undefined,
              color: pet?.color || undefined,
              image: pet?.image,
              ownerId: parseInt(user.id.toString()),
              requestType: type,
              description: pet?.description,
              images: [pet?.image],
              contactInfo: pet?.contactInfo || undefined,
              location: pet?.location,
              price: pet?.price ? parseFloat(pet?.price) : undefined,
              specialRequirements: pet.specialRequirements || undefined,
            },
            {
              onSuccess: (data) => {
                showToast({
                  type: "success",
                  message:
                    data?.message ||
                    "تم إرسال الطلب بنجاح وهو الآن في انتظار موافقة الإدارة",
                });
                // trpc.pets.getApproved.invalidate();
              },
              onError: (error) => {
                showToast({
                  type: "error",
                  message: error.message || "حدث خطأ أثناء إرسال الطلب",
                });
              },
            }
          );

          // Alert.alert("تم", "تم عرض الحيوان للتبني بنجاح");
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Pet not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {createApprovalMutation.isPending ? (
          <ActivityIndicator size="large" />
        ) : null}
      </View>
      <View style={styles.header}>
        <Image source={{ uri: pet.image }} style={styles.petImage} />
        <View style={styles.petInfo}>
          <View style={styles.petNameRow}>
            <Text style={styles.petName}>{pet.name}</Text>
            <TouchableOpacity onPress={handleEditPet} style={styles.editIcon}>
              <Edit3 size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.petType}>
            {t(`${pet.type}`)} {pet.breed ? `- ${pet.breed}` : ""}
          </Text>

          <View style={styles.petDetailsRow}>
            <View style={styles.petDetailItem}>
              <Text style={styles.petDetailLabel}>{t("العمر")}</Text>
              <Text style={styles.petDetailValue}>{pet.age} سنة</Text>
            </View>

            <View style={styles.petDetailItem}>
              <Text style={styles.petDetailLabel}>{t("الجنس")}</Text>
              <Text style={styles.petDetailValue}>
                {pet.gender === "male" ? t("`ذكر`") : t("انثى")}
              </Text>
            </View>

            {pet.weight && (
              <View style={styles.petDetailItem}>
                <Text style={styles.petDetailLabel}>{t("الوزن")}</Text>
                <Text style={styles.petDetailValue}>{pet.weight} كجم</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "info" && styles.activeTab]}
          onPress={() => setActiveTab("info")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "info" && styles.activeTabText,
            ]}
          >
            معلومات
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "medical" && styles.activeTab]}
          onPress={() => setActiveTab("medical")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "medical" && styles.activeTabText,
            ]}
          >
            السجل الطبي
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "vaccinations" && styles.activeTab]}
          onPress={() => setActiveTab("vaccinations")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "vaccinations" && styles.activeTabText,
            ]}
          >
            التطعيمات
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "reminders" && styles.activeTab]}
          onPress={() => setActiveTab("reminders")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "reminders" && styles.activeTabText,
            ]}
          >
            التذكيرات
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === "info" && (
          <View>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>معلومات عامة</Text>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t("اللون")}</Text>
                <Text style={styles.infoValue}>{pet.color || "غير محدد"}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>رقم المعرف</Text>
                <Text style={styles.infoValue}>{pet.id}</Text>
              </View>

              {pet.isLost && (
                <View style={styles.lostBanner}>
                  <AlertTriangle size={20} color={COLORS.error} />
                  <Text style={styles.lostBannerText}>هذا الحيوان مفقود</Text>
                </View>
              )}

              {/* Show owner info for admin */}
              {isAdmin && "ownerName" in pet && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                    معلومات المالك
                  </Text>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>الاسم</Text>
                    <Text style={styles.infoValue}>{pet.ownerName}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>البريد الإلكتروني</Text>
                    <Text style={styles.infoValue}>{pet.ownerEmail}</Text>
                  </View>
                </>
              )}

              {/* Medical History - Admin only */}
              {isAdmin && pet.medicalHistory && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                    التاريخ الطبي
                  </Text>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoValue}>{pet.medicalHistory}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Owner Actions */}
            {isOwner && (
              <View style={styles.ownerActions}>
                <Button
                  title="إلغاء المتابعات"
                  onPress={handleCancelFollowUp}
                  type="outline"
                  size="medium"
                  style={styles.actionButton}
                  icon={<X size={16} color={COLORS.primary} />}
                />

                <Button
                  title={t("بلغ عن حوان مفقود")}
                  onPress={handleReportLost}
                  type="outline"
                  size="medium"
                  style={styles.actionButton}
                />

                <View style={styles.adoptionBreedingButtons}>
                  <Button
                    title="عرض للتبني"
                    onPress={() => handleAdoptionBreeding("adoption")}
                    type="primary"
                    size="medium"
                    style={[styles.actionButton, styles.adoptionButton]}
                  />

                  <Button
                    title="عرض للتزاوج"
                    onPress={() => handleAdoptionBreeding("breeding")}
                    type="primary"
                    size="medium"
                    style={[styles.actionButton, styles.breedingButton]}
                  />
                </View>
              </View>
            )}

            {/* Admin Actions */}
            {isAdmin && (
              <View style={styles.adminActions}>
                <Button
                  title="حذف الحيوان"
                  onPress={handleDeletePet}
                  type="outline"
                  size="medium"
                  style={[styles.actionButton, styles.deleteButton]}
                  icon={<Trash2 size={16} color={COLORS.error} />}
                />
              </View>
            )}
          </View>
        )}

        {activeTab === "medical" && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("السحل الطبي")}</Text>
            </View>

            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                لا يوجد سجلات طبية متاحة
              </Text>
            </View>
          </View>
        )}

        {activeTab === "vaccinations" && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("التطعيمات")}</Text>
            </View>

            {pet.vaccinations ? (
              <View style={styles.recordCard}>
                <Text style={styles.recordValue}>{pet.vaccinations}</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>لا يوجد تطعيمات</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "reminders" && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("التذكيرات")}</Text>
            </View>

            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا يوجد تذكيرات</Text>
            </View>
          </View>
        )}
      </View>

      {/* Edit Pet Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تعديل معلومات الحيوان</Text>
            <TouchableOpacity
              onPress={submitEditPet}
              disabled={
                updatePetMutation.isPending || updatePetOwnerMutation.isPending
              }
            >
              <Text style={styles.saveButton}>
                {updatePetMutation.isPending || updatePetOwnerMutation.isPending
                  ? "جاري الحفظ..."
                  : "حفظ"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>صورة الحيوان</Text>
              <View style={styles.imageUploadContainer}>
                <TouchableOpacity
                  onPress={handlePetImageUpload}
                  style={styles.imageUploadButton}
                >
                  {editForm.image ? (
                    <Image
                      source={{ uri: editForm.image }}
                      style={styles.uploadedImage}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Camera size={32} color={COLORS.darkGray} />
                      <Text style={styles.imagePlaceholderText}>
                        اضغط لاختيار صورة
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {editForm.image && (
                  <TouchableOpacity
                    onPress={() =>
                      setEditForm((prev) => ({ ...prev, image: "" }))
                    }
                    style={styles.removeImageButton}
                  >
                    <X size={16} color={COLORS.white} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>اسم الحيوان *</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.name}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, name: text }))
                }
                placeholder="أدخل اسم الحيوان"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>نوع الحيوان *</Text>
              <View style={styles.typeSelector}>
                {["dog", "cat", "rabbit", "bird", "other"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      editForm.type === type && styles.selectedTypeOption,
                    ]}
                    onPress={() => setEditForm((prev) => ({ ...prev, type }))}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        editForm.type === type && styles.selectedTypeOptionText,
                      ]}
                    >
                      {type === "dog"
                        ? "كلب"
                        : type === "cat"
                        ? "قطة"
                        : type === "rabbit"
                        ? "أرنب"
                        : type === "bird"
                        ? "طائر"
                        : "أخرى"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>السلالة</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.breed}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, breed: text }))
                }
                placeholder="أدخل السلالة"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>العمر (سنة)</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.age}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({ ...prev, age: text }))
                  }
                  placeholder="العمر"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>الوزن (كجم)</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.weight}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({ ...prev, weight: text }))
                  }
                  placeholder="الوزن"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>الجنس</Text>
              <View style={styles.genderSelector}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editForm.gender === "male" && styles.selectedGenderOption,
                  ]}
                  onPress={() =>
                    setEditForm((prev) => ({ ...prev, gender: "male" }))
                  }
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      editForm.gender === "male" &&
                        styles.selectedGenderOptionText,
                    ]}
                  >
                    ذكر
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editForm.gender === "female" && styles.selectedGenderOption,
                  ]}
                  onPress={() =>
                    setEditForm((prev) => ({ ...prev, gender: "female" }))
                  }
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      editForm.gender === "female" &&
                        styles.selectedGenderOptionText,
                    ]}
                  >
                    أنثى
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>اللون</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.color}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, color: text }))
                }
                placeholder="أدخل لون الحيوان"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            {/* Admin-only fields */}
            {isAdmin && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>التاريخ الطبي</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={editForm.medicalHistory}
                    onChangeText={(text) =>
                      setEditForm((prev) => ({ ...prev, medicalHistory: text }))
                    }
                    placeholder="أدخل التاريخ الطبي"
                    placeholderTextColor={COLORS.darkGray}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>التطعيمات</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={editForm.vaccinations}
                    onChangeText={(text) =>
                      setEditForm((prev) => ({ ...prev, vaccinations: text }))
                    }
                    placeholder="أدخل التطعيمات"
                    placeholderTextColor={COLORS.darkGray}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        editForm.isLost && styles.checkboxChecked,
                      ]}
                      onPress={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          isLost: !prev.isLost,
                        }))
                      }
                    >
                      {editForm.isLost && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                    <Text style={styles.checkboxLabel}>الحيوان مفقود</Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
    color: COLORS.darkGray,
  },
  header: {
    padding: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  petInfo: {
    flex: 1,
    marginRight: 16,
  },
  petName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  petType: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  petDetailsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  petDetailItem: {
    alignItems: "center",
  },
  petDetailLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  petDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  tabsContainer: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
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
  content: {
    padding: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  lostBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  lostBannerText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.error,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.gray,
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  recordCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  recordValue: {
    fontSize: 14,
    color: COLORS.black,
  },
  notFoundText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
    color: COLORS.darkGray,
  },
  petNameRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  editIcon: {
    padding: 4,
  },
  ownerActions: {
    gap: 16,
  },
  adminActions: {
    gap: 16,
    marginTop: 16,
  },
  adoptionBreedingButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  adoptionButton: {
    backgroundColor: "#10B981",
  },
  breedingButton: {
    backgroundColor: "#8B5CF6",
  },
  deleteButton: {
    borderColor: COLORS.error,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "right",
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  formHalf: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  selectedTypeOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeOptionText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  selectedTypeOptionText: {
    color: COLORS.white,
  },
  genderSelector: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  selectedGenderOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderOptionText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  selectedGenderOptionText: {
    color: COLORS.white,
  },
  imageUploadContainer: {
    position: "relative",
    alignItems: "center",
  },
  imageUploadButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.gray,
  },
  uploadedImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  imagePlaceholder: {
    alignItems: "center",
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  removeImageButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.black,
  },
});
