import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Platform } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import Button from "../components/Button";
import { Package } from "lucide-react-native";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { useApp } from "../providers/AppProvider";
import { trpc } from "../lib/trpc";
import { useMutation } from "@tanstack/react-query";
import { ImageGalleryUploader } from "../components/ImageGalleryUploader";
import { useToastContext } from "../providers/ToastProvider";

interface StoreProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  images: string[];
}

export default function AddStoreProductScreen() {
  useI18n();
  const { showToast } = useToastContext();
  const { userMode } = useApp();
  const { storeId, storeType } = useLocalSearchParams<{ storeId?: string; storeType?: string }>();

  // Determine store type from params or userMode
  const currentStoreType = storeType || (userMode === "veterinarian" ? "veterinarian" : "pet_owner");
  const [formData, setFormData] = useState<StoreProductFormData>({
    name: "طعام كلاب ممتاز",
    description: "طعام جاف عالي الجودة للكلاب البالغة، غني بالبروتين والفيتامينات.",
    category: "طعام",
    price: "25.00",
    stock: "100",
    images: [],
  });

  const createProductMutation = useMutation(trpc.stores.products.create.mutationOptions());

  // Categories based on store type
  const getCategories = () => {
    if (currentStoreType === "veterinarian") {
      return [
        { id: "medicine", name: "أدوية" },
        { id: "equipment", name: "معدات طبية" },
        { id: "surgical", name: "أدوات جراحية" },
        { id: "diagnostic", name: "أدوات تشخيص" },
        { id: "vaccines", name: "لقاحات" },
        { id: "supplements", name: "مكملات غذائية" },
        { id: "poultry", name: "الدواجن" },
      ];
    }
    return [
      { id: "food", name: "طعام" },
      { id: "accessories", name: "إكسسوارات" },
      { id: "toys", name: "ألعاب" },
      { id: "grooming", name: "العناية" },
      { id: "medicine", name: "أدوية" },
      { id: "equipment", name: "معدات" },
    ];
  };

  const categories = getCategories();

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast({ type: "error", message: "اسم المنتج مطلوب" });
      return;
    }
    if (!formData.price.trim()) {
      showToast({ type: "error", message: "السعر مطلوب" });
      return;
    }
    if (!formData.stock.trim()) {
      showToast({ type: "error", message: "الكمية مطلوبة" });
      return;
    }

    createProductMutation.mutate(
      {
        storeId: storeId,
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category as any, // Ensure it matches backend enum
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        images: formData.images,
        discountPrice: undefined,
        brand: undefined,
        expiryDate: undefined,
        batchNumber: undefined,
        isFeatured: false,
      } as any,
      {
        onSuccess: (response: any) => {
          if (response.success) {
            showToast({ type: "success", message: response.message || "تم إضافة المنتج بنجاح" });
            router.back();
          } else {
            showToast({ type: "error", message: "حدث خطأ أثناء إضافة المنتج" });
          }
        },
        onError: (error: any) => {
          console.error(error);
          showToast({ type: "error", message: error.message || "حدث خطأ أثناء إضافة المنتج" });
        },
      }
    );
  };

  // Image upload is now handled by ImageGalleryUploader component

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "إضافة منتج جديد",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Package size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>إضافة منتج جديد</Text>
          <Text style={styles.headerSubtitle}>
            {currentStoreType === "veterinarian" ? "متجر الطبيب البيطري" : "متجر صاحب الحيوان"}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم المنتج *</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل اسم المنتج"
              value={formData.name}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="وصف المنتج وفوائده"
              value={formData.description}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              textAlign="right"
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الفئة *</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryChip, formData.category === category.id && styles.selectedCategoryChip]}
                  onPress={() => setFormData((prev) => ({ ...prev, category: category.id }))}
                >
                  <Text style={[styles.categoryText, formData.category === category.id && styles.selectedCategoryText]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>السعر (دينار عراقي) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.price}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, price: text }))}
                keyboardType="decimal-pad"
                textAlign="right"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>الكمية *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.stock}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, stock: text }))}
                keyboardType="number-pad"
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ImageGalleryUploader
              images={formData.images}
              onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
              maxImages={5}
              label="صور المنتج"
              aspect={[1, 1]}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={createProductMutation.isPending ? "جاري الإضافة..." : "إضافة المنتج"}
          onPress={handleSubmit}
          type="primary"
          disabled={createProductMutation.isPending}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 12,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 4,
    textAlign: "center",
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: 8,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  selectedCategoryText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  petTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  petTypeChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: 8,
  },
  selectedPetTypeChip: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  petTypeText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  selectedPetTypeText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageItem: {
    position: "relative",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: COLORS.red,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: "center",
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  submitButton: {
    width: "100%",
  },
});
