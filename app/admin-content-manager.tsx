import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Camera,
  Edit3,
  Eye,
  EyeOff,
  Grid,
  Import,
  List,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

// Interface for content items
interface ContentItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  image?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  author?: string;
  category?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Content type configuration
type ContentTypeKey = "articles" | "ads" | "courses" | "clinics" | "stores" | "books" | "tips" | "pets";

const CONTENT_TYPES = [
  "articles",
  "ads",
  "courses",
  "clinics",
  "stores",
  "books",
  "tips",
  "pets",
  "union-announcement",
] as const;

const CONTENT_TYPE_TITLES: Record<string, string> = {
  ads: "الإعلانات",
  articles: "المقالات",
  clinics: "العيادات",
  stores: "المتاجر",
  books: "الكتب",
  tips: "النصائح",
  pets: "الحيوانات للتبني",
  courses: "الدورات والندوات",
  "union-announcement": "إعلانات النقابة",
};

const normalizeContentItem = (item: any, contentType: string): ContentItem => {
  // Base normalization
  const normalized: ContentItem = {
    id: item.id?.toString() || "",
    title: item.title || item.name || "بدون عنوان",
    description: item.description || item.summary || "",
    content: item.content || "",
    author: item.author || "",
    category: item.category || "",
  };

  // Handle different image field names
  if (item.image) {
    normalized.image = item.image;
  } else if (item.coverImage) {
    normalized.image = item.coverImage;
  } else if (item.thumbnailImage) {
    normalized.image = item.thumbnailImage;
  } else if (item.logo) {
    normalized.image = item.logo;
  } else if (item.imageUrl) {
    normalized.image = item.imageUrl;
  } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    normalized.image = item.images[0];
  }

  // Handle isActive field variations
  if (contentType === "books" || contentType === "tips") {
    normalized.isActive = item.isPublished ?? true;
  } else if (contentType === "stores") {
    normalized.isActive = item.showOnVetHome ?? item.isActive ?? true;
  } else {
    normalized.isActive = item.isActive ?? true;
  }

  // Handle file URLs
  if (item.fileUrl) {
    normalized.fileUrl = item.fileUrl;
  } else if (item.filePath) {
    normalized.fileUrl = item.filePath;
  } else if (item.videoUrl) {
    normalized.fileUrl = item.videoUrl;
  }

  if (item.fileName) {
    normalized.fileName = item.fileName;
  }

  if (item.fileType) {
    normalized.fileType = item.fileType;
  }

  // Add timestamps for display
  normalized.createdAt = item.createdAt;
  normalized.updatedAt = item.updatedAt;

  return normalized;
};

export default function AdminContentManagerScreen() {
  const { user, isSuperAdmin } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [contentType, setContentType] = useState<string>((params.type as string) || "articles");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState<Partial<ContentItem>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [_, setSelectedFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Optimized queries with proper enabled flags
  const magazinesQuery = useQuery({
    ...trpc.content.listMagazineArticles.queryOptions(),
    enabled: contentType === "articles",
  });

  const adsQuery = useQuery({
    ...trpc.admin.ads.getAll.queryOptions({ adminId: user?.id }),
    enabled: contentType === "ads" && !!user?.id,
  });

  const coursesQuery = useQuery({
    ...trpc.admin.courses.getList.queryOptions({}),
    enabled: contentType === "courses",
  });

  const clinicsQuery = useQuery({
    ...trpc.clinics.getActiveList.queryOptions({}),
    enabled: contentType === "clinics",
  });

  const storesQuery = useQuery({
    ...trpc.stores.list.queryOptions(),
    enabled: contentType === "stores",
  });

  const booksQuery = useQuery({
    ...trpc.content.listVetBooks.queryOptions(),
    enabled: contentType === "books",
  });

  const tipsQuery = useQuery({
    ...trpc.content.listTips.queryOptions(),
    enabled: contentType === "tips",
  });

  const petsQuery = useQuery({
    ...trpc.pets.getAllForAdmin.queryOptions({ adminId: user?.id }),
    enabled: contentType === "pets",
  });

  // Mutations
  const mutations = {
    createMagazine: useMutation(trpc.admin.content.createMagazine.mutationOptions()),
    updateMagazine: useMutation(trpc.admin.content.updateMagazine.mutationOptions()),
    deleteMagazine: useMutation(trpc.content.deleteArticle.mutationOptions()),
    createAd: useMutation(trpc.admin.ads.create.mutationOptions()),
    updateAd: useMutation(trpc.admin.ads.update.mutationOptions()),
    deleteAd: useMutation(trpc.admin.ads.delete.mutationOptions()),
    createCourse: useMutation(trpc.admin.courses.create.mutationOptions()),
    updateCourse: useMutation(trpc.admin.courses.update.mutationOptions()),
    deleteCourse: useMutation(trpc.admin.courses.delete.mutationOptions()),
    createClinic: useMutation(trpc.clinics.create.mutationOptions()),
    updateClinicActivation: useMutation(trpc.clinics.updateActivation.mutationOptions()),
    createStore: useMutation(trpc.stores.create.mutationOptions()),
    updateStoreHomeVisibility: useMutation(trpc.admin.content.updateStoreHomeVisibility.mutationOptions()),
    createBook: useMutation(trpc.admin.content.createBook.mutationOptions()),
    updateBook: useMutation(trpc.admin.content.updateBook.mutationOptions()),
    deleteBook: useMutation(trpc.admin.content.deleteBook.mutationOptions()),
    createTip: useMutation(trpc.admin.content.createTip.mutationOptions()),
    updateTip: useMutation(trpc.admin.content.updateTip.mutationOptions()),
    deleteTip: useMutation(trpc.content.deleteTip.mutationOptions()),
    createPet: useMutation(trpc.pets.create.mutationOptions()),
    updatePet: useMutation(trpc.admin.pets.updateProfile.mutationOptions()),
    deletePet: useMutation(trpc.admin.pets.delete.mutationOptions()),
  };

  // Get current query data
  const getCurrentQueryData = useCallback(() => {
    switch (contentType) {
      case "articles":
        return {
          data: magazinesQuery.data?.articles,
          isLoading: magazinesQuery.isLoading,
          isError: magazinesQuery.isError,
          error: magazinesQuery.error,
        };
      case "ads":
        return {
          data: adsQuery.data?.ads,
          isLoading: adsQuery.isLoading,
          isError: adsQuery.isError,
          error: adsQuery.error,
        };
      case "courses":
        return {
          data: coursesQuery.data?.courses,
          isLoading: coursesQuery.isLoading,
          isError: coursesQuery.isError,
          error: coursesQuery.error,
        };
      case "clinics":
        return {
          data: clinicsQuery.data?.clinics,
          isLoading: clinicsQuery.isLoading,
          isError: clinicsQuery.isError,
          error: clinicsQuery.error,
        };
      case "stores":
        return {
          data: storesQuery.data?.stores,
          isLoading: storesQuery.isLoading,
          isError: storesQuery.isError,
          error: storesQuery.error,
        };
      case "books":
        return {
          data: booksQuery.data?.books,
          isLoading: booksQuery.isLoading,
          isError: booksQuery.isError,
          error: booksQuery.error,
        };
      case "tips":
        return {
          data: tipsQuery.data?.tips,
          isLoading: tipsQuery.isLoading,
          isError: tipsQuery.isError,
          error: tipsQuery.error,
        };
      case "pets":
        return {
          data: petsQuery.data?.pets,
          isLoading: petsQuery.isLoading,
          isError: petsQuery.isError,
          error: petsQuery.error,
        };
      default:
        return { data: [], isLoading: false, isError: false, error: null };
    }
  }, [
    contentType,
    magazinesQuery,
    adsQuery,
    coursesQuery,
    clinicsQuery,
    storesQuery,
    booksQuery,
    tipsQuery,
    petsQuery,
  ]);

  const { data: rawData, isLoading, isError, error } = getCurrentQueryData();
  const items = useMemo(() => (Array.isArray(rawData) ? rawData : []), [rawData]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title?.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery) ||
        item.author?.toLowerCase().includes(lowerQuery)
    );
  }, [items, searchQuery]);

  // Refetch current query
  const refetchCurrentQuery = useCallback(() => {
    switch (contentType) {
      case "articles":
        return magazinesQuery.refetch();
      case "ads":
        return adsQuery.refetch();
      case "courses":
        return coursesQuery.refetch();
      case "clinics":
        return clinicsQuery.refetch();
      case "stores":
        return storesQuery.refetch();
      case "books":
        return booksQuery.refetch();
      case "tips":
        return tipsQuery.refetch();
      case "pets":
        return petsQuery.refetch();
      default:
        return Promise.resolve();
    }
  }, [
    contentType,
    magazinesQuery,
    adsQuery,
    coursesQuery,
    clinicsQuery,
    storesQuery,
    booksQuery,
    tipsQuery,
    petsQuery,
  ]);

  // Effect to handle super admin check
  useEffect(() => {
    if (!isSuperAdmin) {
      router.back();
    }
  }, [isSuperAdmin, router]);

  // Handle content type change
  const handleContentTypeChange = useCallback(
    (type: string) => {
      setContentType(type);
      setSearchQuery("");
      router.setParams({ type });
    },
    [router]
  );

  const getContentTypeTitle = useCallback((type: string) => {
    return CONTENT_TYPE_TITLES[type] || type;
  }, []);

  // Handlers
  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setFormData({});
    setSelectedImage(null);
    setSelectedFile(null);
    setIsModalVisible(true);
  }, []);

  const handleEdit = useCallback((item: ContentItem) => {
    setEditingItem(item);
    setFormData(item);
    setSelectedImage(item.image || null);
    setSelectedFile(
      item.fileUrl
        ? { uri: item.fileUrl, name: item.fileName || "file", type: item.fileType || "application/pdf" }
        : null
    );
    setIsModalVisible(true);
  }, []);

  const handleDelete = useCallback(
    (item: ContentItem) => {
      const deleteMessage =
        contentType === "clinics"
          ? `هل أنت متأكد من إلغاء تنشيط "${item.title}"؟`
          : contentType === "stores"
          ? `هل أنت متأكد من إخفاء "${item.title}" من الصفحة الرئيسية؟`
          : `هل أنت متأكد من حذف "${item.title}"؟`;

      Alert.alert("تأكيد الحذف", deleteMessage, [
        { text: "إلغاء", style: "cancel" },
        {
          text: contentType === "clinics" ? "إلغاء التنشيط" : contentType === "stores" ? "إخفاء" : "حذف",
          style: "destructive",
          onPress: () => {
            const deleteParams =
              contentType === "clinics"
                ? { clinicId: item.id, isActive: false }
                : contentType === "stores"
                ? { storeId: item.id, showOnVetHome: false }
                : contentType === "books"
                ? { bookId: item.id }
                : contentType === "tips"
                ? { tipId: item.id }
                : contentType === "pets"
                ? { petId: item.id }
                : { id: item.id };

            const mutationKey =
              contentType === "articles"
                ? "deleteMagazine"
                : contentType === "ads"
                ? "deleteAd"
                : contentType === "courses"
                ? "deleteCourse"
                : contentType === "books"
                ? "deleteBook"
                : contentType === "tips"
                ? "deleteTip"
                : contentType === "pets"
                ? "deletePet"
                : null;

            if (mutationKey && mutations[mutationKey]) {
              mutations[mutationKey].mutate(deleteParams, {
                onSuccess: () => {
                  Alert.alert(
                    "تم",
                    `تم ${
                      contentType === "clinics" ? "إلغاء تنشيط" : contentType === "stores" ? "إخفاء" : "حذف"
                    } العنصر بنجاح`
                  );
                  refetchCurrentQuery();
                },
                onError: (error: any) => {
                  Alert.alert(
                    "خطأ",
                    error.message ||
                      `فشل في ${
                        contentType === "clinics" ? "إلغاء تنشيط" : contentType === "stores" ? "إخفاء" : "حذف"
                      } العنصر`
                  );
                },
              });
            }
          },
        },
      ]);
    },
    [contentType, mutations, refetchCurrentQuery]
  );

  const handleSave = useCallback(() => {
    if (!formData.title?.trim()) {
      Alert.alert("خطأ", "يرجى إدخال العنوان");
      return;
    }

    const saveParams =
      contentType === "books"
        ? { ...formData, bookId: editingItem?.id }
        : contentType === "tips"
        ? { ...formData, tipId: editingItem?.id }
        : contentType === "pets"
        ? { ...formData, petId: editingItem?.id }
        : { ...formData, id: editingItem?.id };

    if (editingItem) {
      if (contentType === "clinics" || contentType === "stores") {
        Alert.alert("غير متوفر", `لا يمكن تحديث ${getContentTypeTitle(contentType)} من هنا حالياً`);
        return;
      }

      const updateKey =
        contentType === "articles"
          ? "updateMagazine"
          : contentType === "ads"
          ? "updateAd"
          : contentType === "courses"
          ? "updateCourse"
          : contentType === "books"
          ? "updateBook"
          : contentType === "tips"
          ? "updateTip"
          : contentType === "pets"
          ? "updatePet"
          : null;

      if (updateKey && mutations[updateKey]) {
        mutations[updateKey].mutate(saveParams, {
          onSuccess: () => {
            Alert.alert("تم", `تم تحديث ${getContentTypeTitle(contentType).slice(0, -1)} بنجاح`);
            setIsModalVisible(false);
            setFormData({});
            setEditingItem(null);
            setSelectedImage(null);
            setSelectedFile(null);
            refetchCurrentQuery();
          },
          onError: (error: any) => {
            Alert.alert("خطأ", error.message || `فشل في تحديث ${getContentTypeTitle(contentType).slice(0, -1)}`);
          },
        });
      }
    } else {
      const createKey =
        contentType === "articles"
          ? "createMagazine"
          : contentType === "ads"
          ? "createAd"
          : contentType === "courses"
          ? "createCourse"
          : contentType === "clinics"
          ? "createClinic"
          : contentType === "stores"
          ? "createStore"
          : contentType === "books"
          ? "createBook"
          : contentType === "tips"
          ? "createTip"
          : contentType === "pets"
          ? "createPet"
          : null;

      if (createKey && mutations[createKey]) {
        mutations[createKey].mutate(saveParams, {
          onSuccess: () => {
            Alert.alert("تم", `تم إضافة ${getContentTypeTitle(contentType).slice(0, -1)} بنجاح`);
            setIsModalVisible(false);
            setFormData({});
            setEditingItem(null);
            setSelectedImage(null);
            setSelectedFile(null);
            refetchCurrentQuery();
          },
          onError: (error: any) => {
            Alert.alert("خطأ", error.message || `فشل في إضافة ${getContentTypeTitle(contentType).slice(0, -1)}`);
          },
        });
      }
    }
  }, [contentType, formData, editingItem, mutations, getContentTypeTitle, refetchCurrentQuery]);

  const toggleActive = useCallback(
    (item: ContentItem) => {
      const toggleParams =
        contentType === "clinics"
          ? { clinicId: item.id, isActive: !item.isActive }
          : contentType === "stores"
          ? { storeId: item.id, showOnVetHome: !item.isActive }
          : contentType === "books"
          ? { bookId: item.id, isPublished: !item.isActive }
          : contentType === "tips"
          ? { tipId: item.id, isPublished: !item.isActive }
          : { id: item.id, isActive: !item.isActive, isPublished: !item.isActive };

      const updateKey =
        contentType === "articles"
          ? "updateMagazine"
          : contentType === "ads"
          ? "updateAd"
          : contentType === "courses"
          ? "updateCourse"
          : contentType === "clinics"
          ? "updateClinicActivation"
          : contentType === "stores"
          ? "updateStoreHomeVisibility"
          : contentType === "books"
          ? "updateBook"
          : contentType === "tips"
          ? "updateTip"
          : contentType === "pets"
          ? "updatePet"
          : null;

      if (updateKey && mutations[updateKey]) {
        mutations[updateKey].mutate(toggleParams, {
          onSuccess: () => {
            refetchCurrentQuery();
          },
        });
      }
    },
    [contentType, mutations, refetchCurrentQuery]
  );

  const pickImage = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("خطأ", "يجب السماح بالوصول إلى المعرض لاختيار الصور");
        return;
      }

      Alert.alert("اختيار الصورة", "كيف تريد إضافة الصورة؟", [
        {
          text: "من المعرض",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              setSelectedImage(result.assets[0].uri);
              setFormData((prev) => ({ ...prev, image: result.assets[0].uri }));
            }
          },
        },
        {
          text: "التقاط صورة",
          onPress: async () => {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
            if (!cameraPermission.granted) {
              Alert.alert("خطأ", "يجب السماح بالوصول إلى الكاميرا");
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              setSelectedImage(result.assets[0].uri);
              setFormData((prev) => ({ ...prev, image: result.assets[0].uri }));
            }
          },
        },
        { text: "إلغاء", style: "cancel" },
      ]);
    } catch (error: any) {
      Alert.alert("خطأ", `حدث خطأ أثناء اختيار الصورة: ${error.message}`);
    }
  }, []);

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setFormData((prev) => ({ ...prev, image: undefined }));
  }, []);

  // Render item for FlatList
  const renderItem = useCallback(
    ({ item: rawItem }: { item: any }) => {
      const item = normalizeContentItem(rawItem, contentType);

      return (
        <View style={[styles.itemCard, viewMode === "grid" && styles.gridItemCard]}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.description && (
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              {item.author && <Text style={styles.itemAuthor}>المؤلف: {item.author}</Text>}
              {item.category && <Text style={styles.itemCategory}>التصنيف: {item.category}</Text>}
              {item.createdAt && (
                <Text style={styles.itemDate}>{new Date(item.createdAt).toLocaleDateString("ar-EG")}</Text>
              )}
            </View>
            {item.image && <Image source={{ uri: item.image }} style={styles.itemImage} />}
          </View>

          <View style={styles.itemActions}>
            <TouchableOpacity style={[styles.actionButton, styles.toggleButton]} onPress={() => toggleActive(rawItem)}>
              {item.isActive ? <Eye size={16} color={COLORS.white} /> : <EyeOff size={16} color={COLORS.white} />}
              <Text style={styles.actionButtonText}>{item.isActive ? "نشط" : "مخفي"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.editActionButton]}
              onPress={() => handleEdit(rawItem)}
            >
              <Edit3 size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>تعديل</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(rawItem)}>
              <Trash2 size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>حذف</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [viewMode, contentType, toggleActive, handleEdit, handleDelete]
  );

  const keyExtractor = useCallback((item: ContentItem) => item.id, []);

  const renderFormFields = useCallback(() => {
    return (
      <View style={styles.formContainer}>
        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>العنوان *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.title || ""}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
            placeholder="أدخل العنوان"
            multiline
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>المؤلف/المسؤول</Text>
          <TextInput
            style={styles.textInput}
            value={formData.author || ""}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, author: text }))}
            placeholder="أدخل اسم المؤلف أو المسؤول"
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>التصنيف</Text>
          <TextInput
            style={styles.textInput}
            value={formData.category || ""}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, category: text }))}
            placeholder="أدخل التصنيف"
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>الوصف</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.description || ""}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
            placeholder="أدخل الوصف"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>الصورة</Text>
          {selectedImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <View style={styles.imageActions}>
                <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                  <Camera size={16} color={COLORS.white} />
                  <Text style={styles.imageActionText}>تغيير</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <X size={16} color={COLORS.white} />
                  <Text style={styles.imageActionText}>حذف</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Upload size={24} color={COLORS.primary} />
              <Text style={styles.uploadButtonText}>اختيار صورة</Text>
              <Text style={styles.uploadButtonSubtext}>من المعرض أو التقاط صورة جديدة</Text>
            </TouchableOpacity>
          )}
        </View>

        {contentType === "courses" ? (
          <>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>نوع التسجيل</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFormData((prev) => ({ ...prev, content: "internal" }))}
                >
                  <View style={[styles.radioCircle, formData.content === "internal" && styles.radioSelected]} />
                  <Text style={styles.radioText}>تسجيل داخلي (يصل للإدارة)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFormData((prev) => ({ ...prev, content: "link" }))}
                >
                  <View style={[styles.radioCircle, formData.content === "link" && styles.radioSelected]} />
                  <Text style={styles.radioText}>رابط خارجي</Text>
                </TouchableOpacity>
              </View>
            </View>

            {formData.content === "link" && (
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>رابط الدورة *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.fileUrl || ""}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, fileUrl: text, fileName: "رابط الدورة" }))}
                  placeholder="https://example.com/course"
                  keyboardType="url"
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>المحتوى التفصيلي</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.content || ""}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, content: text }))}
              placeholder="أدخل المحتوى التفصيلي"
              multiline
              numberOfLines={6}
            />
          </View>
        )}
      </View>
    );
  }, [formData, selectedImage, contentType, pickImage, removeImage]);

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `إدارة ${getContentTypeTitle(contentType)}`,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleAdd} style={styles.addHeaderButton}>
              <Plus size={24} color={COLORS.white} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Content Type Selector */}
      <View style={styles.selectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CONTENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeButton, contentType === type && styles.selectedTypeButton]}
              onPress={() => handleContentTypeChange(type)}
            >
              <Text style={[styles.typeButtonText, contentType === type && styles.selectedTypeButtonText]}>
                {getContentTypeTitle(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.darkGray} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث في العناصر..."
            textAlign="right"
          />
        </View>
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === "list" && styles.activeViewMode]}
            onPress={() => setViewMode("list")}
          >
            <List size={20} color={viewMode === "list" ? COLORS.white : COLORS.darkGray} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === "grid" && styles.activeViewMode]}
            onPress={() => setViewMode("grid")}
          >
            <Grid size={20} color={viewMode === "grid" ? COLORS.white : COLORS.darkGray} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Items List */}
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>جاري التحميل...</Text>
        </View>
      ) : isError ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>حدث خطأ أثناء تحميل البيانات</Text>
          <Text style={styles.emptySubtext}>{error?.message || "يرجى المحاولة مرة أخرى"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchCurrentQuery()}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{searchQuery ? "لا توجد نتائج للبحث" : "لا توجد عناصر"}</Text>
          {!searchQuery && (
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Plus size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>إضافة عنصر جديد</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          numColumns={viewMode === "grid" ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          columnWrapperStyle={viewMode === "grid" ? styles.gridRow : undefined}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingItem ? "تعديل" : "إضافة"} {getContentTypeTitle(contentType)}
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isLoading}
              style={[styles.saveButton, isLoading && styles.disabledButton]}
            >
              <Save size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>{renderFormFields()}</ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    padding: 8,
  },
  addHeaderButton: {
    padding: 8,
  },
  selectorContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  selectedTypeButton: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "500",
  },
  selectedTypeButtonText: {
    color: COLORS.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    // textAlign: "right",
  },
  viewModeContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    padding: 2,
  },
  viewModeButton: {
    padding: 6,
    borderRadius: 4,
  },
  activeViewMode: {
    backgroundColor: COLORS.primary,
  },
  listContent: {
    padding: 16,
  },
  gridRow: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 20,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridItemCard: {
    width: "48%",
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: "row-reverse",
    gap: 12,
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
    // textAlign: "right",
  },
  itemDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    // textAlign: "right",
  },
  itemAuthor: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 2,
    // textAlign: "right",
  },
  itemCategory: {
    fontSize: 12,
    color: COLORS.darkGray,
    // textAlign: "right",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  toggleButton: {
    backgroundColor: COLORS.primary,
  },
  editActionButton: {
    backgroundColor: "#F59E0B",
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  saveButton: {
    backgroundColor: COLORS.success || "#28a745",
    padding: 8,
    borderRadius: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    gap: 16,
  },
  formField: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    // textAlign: "right",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    // textAlign: "right",
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
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
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  changeImageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  removeImageButton: {
    flex: 1,
    flexDirection: "row",
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
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.darkGray,
    backgroundColor: COLORS.white,
  },
  radioSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  radioText: {
    fontSize: 16,
    color: COLORS.black,
    // textAlign: "right",
  },
  itemDate: {
    fontSize: 11,
    color: COLORS.darkGray,
    marginTop: 2,
    // textAlign: "right",
  },
});
