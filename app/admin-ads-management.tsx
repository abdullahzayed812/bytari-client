import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useApp } from "@/providers/AppProvider";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  Edit3,
  Eye,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

interface Advertisement {
  id: number;
  title: string;
  content?: string;
  image?: string;
  link?: string;
  type: "banner" | "popup" | "inline" | "image_only" | "image_with_link";
  position?: string;
  interface: "pet_owner" | "vet" | "both";
  clickAction: "none" | "open_link" | "open_file";
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  clicks: number;
  impressions: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminAdsManagement() {
  const { user, userMode } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [filterInterface, setFilterInterface] = useState<
    "all" | "pet_owner" | "vet"
  >("all");

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    image: string;
    link: string;
    type: "banner" | "popup" | "inline" | "image_only" | "image_with_link";
    position: string;
    interface: "pet_owner" | "vet" | "both";
    clickAction: "none" | "open_link" | "open_file";
    startDate: string;
    endDate: string;
  }>({
    title: "",
    content: "",
    image: "",
    link: "",
    type: "banner",
    position: "",
    interface: "both",
    clickAction: "none",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  const {
    data: adsData,
    isLoading,
    refetch,
  } = useQuery(
    trpc.admin.ads.getAll.queryOptions({
      adminId: user?.id ? Number(user.id) : 1,
    })
  );
  const ads = useMemo(() => (adsData as any)?.ads, [adsData]);

  const createAdMutation = useMutation(trpc.admin.ads.create.mutationOptions());
  const updateAdMutation = useMutation(trpc.admin.ads.update.mutationOptions());
  const deleteAdMutation = useMutation(trpc.admin.ads.delete.mutationOptions());

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("خطأ", "نحتاج إلى إذن للوصول إلى معرض الصور");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      image: "",
      link: "",
      type: "banner",
      position: "",
      interface: "both",
      clickAction: "none",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
  };

  const handleCreateAd = () => {
    createAdMutation.mutate(
      {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        adminId: user?.id,
      },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم إنشاء الإعلان بنجاح");
          setShowCreateModal(false);
          resetForm();
          refetch();
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "فشل في إنشاء الإعلان");
        },
      }
    );
  };

  const handleEditAd = () => {
    if (!selectedAd) return;
    updateAdMutation.mutate(
      { ...formData, id: selectedAd.id },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم تحديث الإعلان بنجاح");
          setShowEditModal(false);
          setSelectedAd(null);
          resetForm();
          refetch();
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "فشل في تحديث الإعلان");
        },
      }
    );
  };

  const handleDeleteAd = (ad: Advertisement) => {
    Alert.alert("تأكيد الحذف", `هل أنت متأكد من حذف الإعلان "${ad.title}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deleteAdMutation.mutate(
            { id: ad.id },
            {
              onSuccess: () => {
                Alert.alert("نجح", "تم حذف الإعلان بنجاح");
                refetch();
              },
              onError: (error) => {
                Alert.alert("خطأ", error.message || "فشل في حذف الإعلان");
              },
            }
          );
        },
      },
    ]);
  };

  const openEditModal = (ad: Advertisement) => {
    setSelectedAd(ad);
    setFormData({
      title: ad.title,
      content: ad.content || "",
      image: ad.image || "",
      link: ad.link || "",
      type: ad.type,
      position: ad.position || "",
      interface: ad.interface,
      clickAction: ad.clickAction,
      startDate: ad.startDate.toISOString().split("T")[0],
      endDate: ad.endDate.toISOString().split("T")[0],
    });
    setShowEditModal(true);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "banner":
        return "بانر";
      case "popup":
        return "نافذة منبثقة";
      case "inline":
        return "مدمج";
      case "image_only":
        return "صورة فقط";
      case "image_with_link":
        return "صورة مع رابط";
      default:
        return type;
    }
  };

  const getInterfaceLabel = (interfaceType: string) => {
    switch (interfaceType) {
      case "pet_owner":
        return "أصحاب الحيوانات";
      case "vet":
        return "الأطباء البيطريين";
      case "both":
        return "كلا الواجهتين";
      default:
        return interfaceType;
    }
  };

  const getClickActionLabel = (action: string) => {
    switch (action) {
      case "none":
        return "بدون إجراء";
      case "open_link":
        return "فتح رابط";
      case "open_file":
        return "فتح ملف";
      default:
        return action;
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  const renderAdsList = () => (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>إدارة الإعلانات</Text>
        <Text style={styles.subtitle}>
          الواجهة الحالية:{" "}
          {userMode === "veterinarian"
            ? "الأطباء البيطريين"
            : "أصحاب الحيوانات"}
        </Text>
      </View>

      {/* Filter and Add Button */}
      <View style={styles.controlsContainer}>
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>تصفية حسب الواجهة:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterInterface === "all" && styles.activeFilterButton,
              ]}
              onPress={() => setFilterInterface("all")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterInterface === "all" && styles.activeFilterButtonText,
                ]}
              >
                الكل
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterInterface === "pet_owner" && styles.activeFilterButton,
              ]}
              onPress={() => setFilterInterface("pet_owner")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterInterface === "pet_owner" &&
                    styles.activeFilterButtonText,
                ]}
              >
                أصحاب الحيوانات
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterInterface === "vet" && styles.activeFilterButton,
              ]}
              onPress={() => setFilterInterface("vet")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterInterface === "vet" && styles.activeFilterButtonText,
                ]}
              >
                الأطباء
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>إضافة إعلان</Text>
        </TouchableOpacity>
      </View>

      {/* Ads List */}
      <View style={styles.adsContainer}>
        {ads.map((ad) => (
          <View key={ad.id} style={styles.adCard}>
            <View style={styles.adHeader}>
              <View style={styles.adInfo}>
                <Text style={styles.adTitle}>{ad.title}</Text>
                <View style={styles.adMeta}>
                  <View style={styles.adMetaItem}>
                    <Text style={styles.adMetaLabel}>النوع:</Text>
                    <Text style={styles.adMetaValue}>
                      {getTypeLabel(ad.type)}
                    </Text>
                  </View>
                  <View style={styles.adMetaItem}>
                    <Text style={styles.adMetaLabel}>الواجهة:</Text>
                    <Text style={styles.adMetaValue}>
                      {getInterfaceLabel(ad.interface)}
                    </Text>
                  </View>
                  <View style={styles.adMetaItem}>
                    <Text style={styles.adMetaLabel}>الإجراء:</Text>
                    <Text style={styles.adMetaValue}>
                      {getClickActionLabel(ad.clickAction)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.adStatus}>
                <View
                  style={[
                    styles.statusBadge,
                    ad.isActive ? styles.activeBadge : styles.inactiveBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      ad.isActive ? styles.activeText : styles.inactiveText,
                    ]}
                  >
                    {ad.isActive ? "نشط" : "معطل"}
                  </Text>
                </View>
              </View>
            </View>

            {ad.imageUrl && (
              <Image source={{ uri: ad.imageUrl }} style={styles.adImage} />
            )}

            {ad.description && (
              <Text style={styles.adContent}>{ad.description}</Text>
            )}

            <View style={styles.adStats}>
              <View style={styles.statItem}>
                <Eye size={16} color="#666" />
                <Text style={styles.statText}>{ad.impressions} مشاهدة</Text>
              </View>
              <View style={styles.statItem}>
                <BarChart3 size={16} color="#666" />
                <Text style={styles.statText}>{ad.clicks} نقرة</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statText}>
                  معدل النقر:{" "}
                  {ad.impressions > 0
                    ? ((ad.clicks / ad.impressions) * 100).toFixed(1)
                    : 0}
                  %
                </Text>
              </View>
            </View>

            <View style={styles.adActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditModal(ad)}
              >
                <Edit3 size={16} color="#4ECDC4" />
                <Text style={styles.actionButtonText}>تعديل</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteAd(ad)}
              >
                <Trash2 size={16} color="#FF6B6B" />
                <Text style={[styles.actionButtonText, { color: "#FF6B6B" }]}>
                  حذف
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderCreateModal = () => (
    <Modal visible={showCreateModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>إضافة إعلان جديد</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>عنوان الإعلان *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholder="أدخل عنوان الإعلان"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>المحتوى</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.content}
                onChangeText={(text) =>
                  setFormData({ ...formData, content: text })
                }
                placeholder="أدخل محتوى الإعلان"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>صورة الإعلان</Text>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickImage}
              >
                <Upload size={20} color="#4ECDC4" />
                <Text style={styles.imagePickerText}>
                  {formData.image ? "تغيير الصورة" : "رفع صورة"}
                </Text>
              </TouchableOpacity>
              {formData.image && (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: formData.image }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setFormData({ ...formData, image: "" })}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>الرابط</Text>
              <TextInput
                style={styles.formInput}
                value={formData.link}
                onChangeText={(text) =>
                  setFormData({ ...formData, link: text })
                }
                placeholder="https://example.com"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>نوع الإعلان</Text>
                <View style={styles.pickerContainer}>
                  {[
                    "banner",
                    "popup",
                    "inline",
                    "image_only",
                    "image_with_link",
                  ].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.pickerOption,
                        formData.type === type && styles.selectedPickerOption,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, type: type as any })
                      }
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          formData.type === type &&
                            styles.selectedPickerOptionText,
                        ]}
                      >
                        {getTypeLabel(type)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>الواجهة المستهدفة</Text>
                <View style={styles.pickerContainer}>
                  {["pet_owner", "vet", "both"].map((interfaceType) => (
                    <TouchableOpacity
                      key={interfaceType}
                      style={[
                        styles.pickerOption,
                        formData.interface === interfaceType &&
                          styles.selectedPickerOption,
                      ]}
                      onPress={() =>
                        setFormData({
                          ...formData,
                          interface: interfaceType as any,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          formData.interface === interfaceType &&
                            styles.selectedPickerOptionText,
                        ]}
                      >
                        {getInterfaceLabel(interfaceType)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>إجراء النقر</Text>
                <View style={styles.pickerContainer}>
                  {["none", "open_link", "open_file"].map((action) => (
                    <TouchableOpacity
                      key={action}
                      style={[
                        styles.pickerOption,
                        formData.clickAction === action &&
                          styles.selectedPickerOption,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, clickAction: action as any })
                      }
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          formData.clickAction === action &&
                            styles.selectedPickerOptionText,
                        ]}
                      >
                        {getClickActionLabel(action)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>الموقع</Text>
              <TextInput
                style={styles.formInput}
                value={formData.position}
                onChangeText={(text) =>
                  setFormData({ ...formData, position: text })
                }
                placeholder="مثل: home_top, sidebar, footer"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>تاريخ البداية</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.startDate}
                  onChangeText={(text) =>
                    setFormData({ ...formData, startDate: text })
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>تاريخ النهاية</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.endDate}
                  onChangeText={(text) =>
                    setFormData({ ...formData, endDate: text })
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleCreateAd}
            >
              <Text style={styles.saveButtonText}>إنشاء الإعلان</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal visible={showEditModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>تعديل الإعلان</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowEditModal(false);
                setSelectedAd(null);
                resetForm();
              }}
            >
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>عنوان الإعلان *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholder="أدخل عنوان الإعلان"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>المحتوى</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.content}
                onChangeText={(text) =>
                  setFormData({ ...formData, content: text })
                }
                placeholder="أدخل محتوى الإعلان"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>صورة الإعلان</Text>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickImage}
              >
                <Upload size={20} color="#4ECDC4" />
                <Text style={styles.imagePickerText}>
                  {formData.image ? "تغيير الصورة" : "رفع صورة"}
                </Text>
              </TouchableOpacity>
              {formData.image && (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: formData.image }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setFormData({ ...formData, image: "" })}
                  >
                    <X size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>الرابط</Text>
              <TextInput
                style={styles.formInput}
                value={formData.link}
                onChangeText={(text) =>
                  setFormData({ ...formData, link: text })
                }
                placeholder="https://example.com"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>نوع الإعلان</Text>
                <View style={styles.pickerContainer}>
                  {[
                    "banner",
                    "popup",
                    "inline",
                    "image_only",
                    "image_with_link",
                  ].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.pickerOption,
                        formData.type === type && styles.selectedPickerOption,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, type: type as any })
                      }
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          formData.type === type &&
                            styles.selectedPickerOptionText,
                        ]}
                      >
                        {getTypeLabel(type)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>الواجهة المستهدفة</Text>
                <View style={styles.pickerContainer}>
                  {["pet_owner", "vet", "both"].map((interfaceType) => (
                    <TouchableOpacity
                      key={interfaceType}
                      style={[
                        styles.pickerOption,
                        formData.interface === interfaceType &&
                          styles.selectedPickerOption,
                      ]}
                      onPress={() =>
                        setFormData({
                          ...formData,
                          interface: interfaceType as any,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          formData.interface === interfaceType &&
                            styles.selectedPickerOptionText,
                        ]}
                      >
                        {getInterfaceLabel(interfaceType)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>إجراء النقر</Text>
                <View style={styles.pickerContainer}>
                  {["none", "open_link", "open_file"].map((action) => (
                    <TouchableOpacity
                      key={action}
                      style={[
                        styles.pickerOption,
                        formData.clickAction === action &&
                          styles.selectedPickerOption,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, clickAction: action as any })
                      }
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          formData.clickAction === action &&
                            styles.selectedPickerOptionText,
                        ]}
                      >
                        {getClickActionLabel(action)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>الموقع</Text>
              <TextInput
                style={styles.formInput}
                value={formData.position}
                onChangeText={(text) =>
                  setFormData({ ...formData, position: text })
                }
                placeholder="مثل: home_top, sidebar, footer"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>تاريخ البداية</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.startDate}
                  onChangeText={(text) =>
                    setFormData({ ...formData, startDate: text })
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>تاريخ النهاية</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.endDate}
                  onChangeText={(text) =>
                    setFormData({ ...formData, endDate: text })
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowEditModal(false);
                setSelectedAd(null);
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleEditAd}>
              <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة الإعلانات",
          headerStyle: { backgroundColor: "#FF6B6B" },
          headerTintColor: "#fff",
        }}
      />

      {renderAdsList()}
      {renderCreateModal()}
      {renderEditModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    // textAlign: "left",
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    // textAlign: "left",
    marginTop: 5,
    fontFamily: "System",
  },
  controlsContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    // textAlign: "right",
    marginBottom: 10,
    fontFamily: "System",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeFilterButton: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "System",
  },
  activeFilterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "System",
  },
  adsContainer: {
    padding: 15,
    gap: 15,
  },
  adCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  adInfo: {
    flex: 1,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    // textAlign: "right",
    marginBottom: 8,
    fontFamily: "System",
  },
  adMeta: {
    gap: 4,
  },
  adMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adMetaLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "bold",
    fontFamily: "System",
  },
  adMetaValue: {
    fontSize: 14,
    color: "#333",
    fontFamily: "System",
  },
  adStatus: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "#d4edda",
  },
  inactiveBadge: {
    backgroundColor: "#f8d7da",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "System",
  },
  activeText: {
    color: "#155724",
  },
  inactiveText: {
    color: "#721c24",
  },
  adImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  adContent: {
    fontSize: 14,
    color: "#666",
    // textAlign: "right",
    marginBottom: 10,
    fontFamily: "System",
  },
  adStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginBottom: 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "System",
  },
  adActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#f8f9fa",
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "bold",
    fontFamily: "System",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "95%",
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "System",
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    maxHeight: 500,
    padding: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    marginBottom: 8,
    fontFamily: "System",
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "right",
    fontFamily: "System",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  formRow: {
    flexDirection: "row",
    gap: 10,
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedPickerOption: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },
  pickerOptionText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "System",
  },
  selectedPickerOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#666",
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "System",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#4ECDC4",
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "System",
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#4ECDC4",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    backgroundColor: "#f8f9fa",
    gap: 8,
  },
  imagePickerText: {
    fontSize: 16,
    color: "#4ECDC4",
    fontWeight: "bold",
    fontFamily: "System",
  },
  imagePreviewContainer: {
    position: "relative",
    marginTop: 10,
  },
  imagePreview: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 107, 107, 0.8)",
    borderRadius: 12,
    padding: 4,
  },
});
