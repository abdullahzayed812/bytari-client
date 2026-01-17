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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ImageGalleryUploader } from "../components/ImageGalleryUploader";
import { FileUploader } from "@/components/FileUploader";

// Interface for content items
type ContentItem = {
  id?: number;
  title: string;
  author?: string;
  description?: string;
  category?: string;
  image?: string;
  fileUrl?: string;
  fileName?: string;
  content?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  fileType?: string;
  publishDate?: string;
  coverImage?: string;
  isbn?: string;
  publisher?: string;
  publishYear?: string;
  pages?: string;
  language?: string;
  issueNumber?: string;

  // 👇 Added course-related fields
  organizer?: string; // اسم المنظم
  date?: string; // تاريخ الدورة
  location?: string; // مكان الدورة
  type?: "course" | "seminar"; // نوع الدورة
  duration?: string; // مدة الدورة
  capacity?: number; // عدد المقاعد
  price?: string; // سعر الدورة
  registrationType?: "link" | "internal"; // نوع التسجيل
  courseUrl?: string; // رابط الدورة
  status?: "active" | "inactive" | "completed"; // حالة الدورة
  thumbnailImage?: string; // صورة الغلاف
  images?: string[]; // صور إضافية
  tags?: string[]; // وسوم الدورة
};

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
  } else if (item.pdfUrl) {
    normalized.fileUrl = item.pdfUrl;
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

  // ⭐ CRITICAL FIX: Parse tags from JSON string to array
  if (item.tags) {
    try {
      normalized.tags = typeof item.tags === "string" ? JSON.parse(item.tags) : item.tags;
    } catch (e) {
      normalized.tags = [];
    }
  }

  // ⭐ Handle book-specific fields that might be null
  if (contentType === "books") {
    normalized.isbn = item.isbn || "";
    normalized.publisher = item.publisher || "";
    normalized.publishYear = item.publishYear || undefined;
    normalized.pages = item.pages || undefined;
    normalized.language = item.language || "ar";
  }

  // ⭐ Handle magazine-specific fields
  if (contentType === "articles") {
    normalized.issueNumber = item.issueNumber?.toString() || "";
    // Keep publishDate as string for the form, backend will convert it
    normalized.publishDate = item.publishDate
      ? typeof item.publishDate === "string"
        ? item.publishDate
        : item.publishDate.toISOString().split("T")[0]
      : "";
  }

  return normalized;
};

export default function AdminContentManagerScreen() {
  const { user, isSuperAdmin } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();

  const [contentType, setContentType] = useState<string>((params.type as string) || "articles");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [_, setSelectedFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [formData, setFormData] = useState<Partial<ContentItem>>({
    id: undefined,
    title: "",
    author: "",
    description: "",
    category: "",
    image: "",
    fileUrl: "",
    fileName: "",
    content: "",
    isActive: true,
    createdAt: "",
    updatedAt: "",
    fileType: "",
    coverImage: "",

    // Course-related fields
    organizer: "",
    date: "",
    location: "",
    type: "course",
    duration: "",
    capacity: undefined,
    price: "",
    registrationType: "internal",
    courseUrl: "",
    status: "active",
    thumbnailImage: "",
    images: [],
    tags: [],
  });

  const adminId = useMemo(() => user?.id, [user]);

  // Optimized queries with proper enabled flags
  const magazinesQuery = useQuery({
    ...trpc.content.listMagazineArticles.queryOptions({}),
    enabled: contentType === "articles",
  });

  const adsQuery = useQuery({
    ...trpc.admin.ads.getAll.queryOptions({ adminId }),
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
    ...trpc.stores.listActive.queryOptions({}),
    enabled: contentType === "stores",
  });

  const booksQuery = useQuery({
    ...trpc.content.listVetBooks.queryOptions({}),
    enabled: contentType === "books",
  });

  const tipsQuery = useQuery({
    ...trpc.content.listTips.queryOptions({}),
    enabled: contentType === "tips",
  });

  const petsQuery = useQuery({
    ...trpc.pets.getAllForAdmin.queryOptions({ adminId: user?.id ? Number(user.id) : 0 }),
    enabled: contentType === "pets",
  });

  // Updated mutations with proper query invalidation
  const mutations = {
    // Articles
    createMagazine: useMutation(trpc.admin.content.createMagazine.mutationOptions()),
    updateMagazine: useMutation(trpc.admin.content.updateMagazine.mutationOptions()),
    deleteMagazine: useMutation(trpc.admin.content.deleteMagazine.mutationOptions()),

    // Ads
    createAd: useMutation(trpc.admin.ads.create.mutationOptions()),
    updateAd: useMutation(trpc.admin.ads.update.mutationOptions()),
    deleteAd: useMutation(trpc.admin.ads.delete.mutationOptions()),

    // Courses
    createCourse: useMutation(trpc.admin.courses.create.mutationOptions()),
    updateCourse: useMutation(trpc.admin.courses.update.mutationOptions()),
    deleteCourse: useMutation(trpc.admin.courses.delete.mutationOptions()),

    // Clinics
    createClinic: useMutation(trpc.clinics.create.mutationOptions()),
    updateClinicActivation: useMutation(trpc.clinics.updateActivation.mutationOptions()),

    // Stores
    createStore: useMutation(trpc.stores.create.mutationOptions()),
    updateStoreHomeVisibility: useMutation(trpc.admin.content.updateStoreHomeVisibility.mutationOptions()),

    // Books
    createBook: useMutation(trpc.admin.content.createBook.mutationOptions()),
    updateBook: useMutation(trpc.admin.content.updateBook.mutationOptions()),
    deleteBook: useMutation(trpc.admin.content.deleteBook.mutationOptions()),

    // Tips
    createTip: useMutation(trpc.admin.content.createTip.mutationOptions()),
    updateTip: useMutation(trpc.admin.content.updateTip.mutationOptions()),
    deleteTip: useMutation(trpc.content.deleteTip.mutationOptions()),

    // Pets
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
        return queryClient.invalidateQueries(trpc.courses.getList.queryKey);
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
    // setFormData({});
    setSelectedImage(null);
    setSelectedFile(null);
    setIsModalVisible(true);
  }, []);

  const handleEdit = useCallback(
    (item: ContentItem) => {
      console.log("Editing item:", item);

      // ⭐ Normalize the item first to ensure proper data structure
      const normalizedItem = normalizeContentItem(item, contentType);

      setEditingItem(normalizedItem);

      // ⭐ Prepare form data with proper parsing
      const preparedFormData: Partial<ContentItem> = {
        ...normalizedItem,
        // Ensure tags is an array
        tags: normalizedItem.tags || [],
        // Ensure optional fields have proper defaults
        isbn: normalizedItem.isbn || "",
        publisher: normalizedItem.publisher || "",
        publishYear: normalizedItem.publishYear || undefined,
        pages: normalizedItem.pages || undefined,
      };

      setFormData(preparedFormData);
      setSelectedImage(normalizedItem.image || null);
      setSelectedFile(
        normalizedItem.fileUrl
          ? {
              uri: normalizedItem.fileUrl,
              name: normalizedItem.fileName || "file",
              type: normalizedItem.fileType || "application/pdf",
            }
          : null
      );
      setIsModalVisible(true);
    },
    [contentType]
  );

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
                ? { adminId: adminId, clinicId: item.id, isActive: false }
                : contentType === "stores"
                ? { adminId: adminId, storeId: item.id, showOnVetHome: false }
                : contentType === "articles"
                ? { adminId: adminId, magazineId: item.id }
                : contentType === "books"
                ? { adminId: adminId, bookId: item.id }
                : contentType === "tips"
                ? { adminId: adminId, tipId: item.id }
                : contentType === "pets"
                ? { adminId: adminId, petId: item.id }
                : { adminId: adminId, id: item.id };

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

    // ✅ Add additional required course validation
    if (contentType === "courses") {
      const requiredFields = [
        { key: "organizer", label: "اسم المنظم" },
        { key: "date", label: "تاريخ الدورة" },
        { key: "location", label: "مكان الدورة" },
        { key: "duration", label: "مدة الدورة" },
        { key: "capacity", label: "عدد المقاعد" },
        { key: "price", label: "سعر الدورة" },
        { key: "category", label: "التصنيف" },
        { key: "description", label: "وصف الدورة" },
        { key: "registrationType", label: "نوع التسجيل" },
      ];

      for (let field of requiredFields) {
        if (!formData[field.key]) {
          Alert.alert("خطأ", `يرجى إدخال ${field.label}`);
          return;
        }
      }

      // If registrationType is 'link', make sure courseUrl is provided
      if (formData.registrationType === "link" && !formData.courseUrl?.trim()) {
        Alert.alert("خطأ", "يرجى إدخال رابط الدورة");
        return;
      }
    }

    const saveParams =
      contentType === "books"
        ? {
            ...formData,
            adminId,
            bookId: Number(editingItem?.id),
            coverImage: selectedImage,
            filePath: formData.fileUrl,
          }
        : contentType === "tips"
        ? { ...formData, adminId, tipId: Number(editingItem?.id) }
        : contentType === "pets"
        ? { ...formData, adminId, petId: Number(editingItem?.id) }
        : contentType === "articles"
        ? {
            ...formData,
            adminId,
            magazineId: Number(editingItem?.id),
            coverImage: selectedImage,
            filePath: formData.fileUrl,
          }
        : contentType === "courses"
        ? {
            ...formData,
            thumbnailImage: selectedImage,
          }
        : { ...formData, adminId, id: Number(editingItem?.id), coverImage: selectedImage };

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
        mutations[updateKey].mutate(saveParams as any, {
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
    // Handle Courses Form
    if (contentType === "courses") {
      return (
        <View style={styles.formContainer}>
          {/* Course Title */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>عنوان الدورة *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title || ""}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
              placeholder="أدخل عنوان الدورة"
            />
          </View>

          {/* Organizer */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>اسم المنظم *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.organizer || ""}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, organizer: text }))}
              placeholder="أدخل اسم المنظم"
            />
          </View>

          {/* Date */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>تاريخ الدورة *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.date || ""}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, date: text }))}
              placeholder="YYYY-MM-DD"
            />
          </View>

          {/* Location */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>مكان الدورة *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.location || ""}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, location: text }))}
              placeholder="أدخل مكان الدورة"
            />
          </View>

          {/* Type */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>نوع النشاط *</Text>
            <View style={styles.radioGroup}>
              {[
                { key: "course", label: "دورة تدريبية" },
                { key: "seminar", label: "ندوة" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.radioOption}
                  onPress={() => setFormData((prev) => ({ ...prev, type: option.key }))}
                >
                  <View style={[styles.radioCircle, formData.type === option.key && styles.radioSelected]} />
                  <Text style={styles.radioText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>مدة الدورة *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.duration || ""}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, duration: text }))}
              placeholder="مثال: 3 أيام / أسبوع"
            />
          </View>

          {/* Capacity */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>عدد المقاعد *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.capacity?.toString() || ""}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, capacity: Number(text) || 0 }))}
              placeholder="أدخل عدد المقاعد"
              keyboardType="numeric"
            />
          </View>

          {/* Price */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>سعر الدورة *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.price || ""}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, price: text }))}
              placeholder="مثال: 100 ريال"
            />
          </View>

          {/* Category */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>التصنيف *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.category || ""}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, category: text }))}
              placeholder="أدخل تصنيف الدورة"
            />
          </View>

          {/* Registration Type */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>نوع التسجيل *</Text>
            <View style={styles.radioGroup}>
              {[
                { key: "internal", label: "تسجيل داخلي (يصل للإدارة)" },
                { key: "link", label: "رابط خارجي" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.radioOption}
                  onPress={() => setFormData((prev) => ({ ...prev, registrationType: option.key }))}
                >
                  <View
                    style={[styles.radioCircle, formData.registrationType === option.key && styles.radioSelected]}
                  />
                  <Text style={styles.radioText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* External Course Link */}
          {formData.registrationType === "link" && (
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>رابط التسجيل الخارجي</Text>
              <TextInput
                style={styles.textInput}
                value={formData.courseUrl || ""}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, courseUrl: text }))}
                placeholder="https://example.com"
                keyboardType="url"
              />
            </View>
          )}

          {/* Description */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>وصف الدورة *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description || ""}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
              placeholder="أدخل وصف الدورة"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Thumbnail Image */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>صورة الغلاف</Text>
            <ImageGalleryUploader
              images={selectedImage ? [selectedImage] : []}
              onImagesChange={(images) => {
                setSelectedImage(images[0] || null);
                setFormData((prev) => ({ ...prev, image: images[0] || undefined }));
              }}
              maxImages={1}
              label="صورة العنصر"
              aspect={[4, 3]}
            />
          </View>
        </View>
      );
    }

    // Default Form (for other content types)
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

        {/* Image Upload - Use ImageGalleryUploader for tips */}
        {contentType === "tips" ? (
          <View style={styles.formField}>
            <ImageGalleryUploader
              images={formData.images || []}
              onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
              maxImages={5}
              label="صور النصيحة"
            />
          </View>
        ) : (
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>الصورة</Text>
            <ImageGalleryUploader
              images={selectedImage ? [selectedImage] : []}
              onImagesChange={(images) => {
                setSelectedImage(images[0] || null);
                setFormData((prev) => ({ ...prev, image: images[0] || undefined }));
              }}
              maxImages={1}
              label="صورة العنصر"
              aspect={[4, 3]}
            />
          </View>
        )}

        <View style={styles.formField}>
          <FileUploader
            fileUrl={formData.fileUrl || ""}
            onFileChange={(url) => setFormData((prev) => ({ ...prev, fileUrl: url }))}
            label="ملف"
            placeholder="اختيار ملف"
          />
        </View>
      </View>
    );
  }, [formData, contentType, selectedImage]);

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
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
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
    // textAlign: "left",
  },
  viewModeContainer: {
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
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
    // textAlign: "left",
  },
  itemDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    // textAlign: "left",
  },
  itemAuthor: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 2,
    // textAlign: "left",
  },
  itemCategory: {
    fontSize: 12,
    color: COLORS.darkGray,
    // textAlign: "left",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemActions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
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
    paddingBottom: 100,
  },
  formField: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    // textAlign: "left",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    // textAlign: "left",
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
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: "row-reverse",
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
    // textAlign: "left",
  },
  itemDate: {
    fontSize: 11,
    color: COLORS.darkGray,
    marginTop: 2,
    // textAlign: "left",
  },
});
