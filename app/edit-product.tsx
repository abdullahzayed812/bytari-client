import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import Button from "../components/Button";
import { Upload } from "lucide-react-native";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { trpc } from "../lib/trpc";
import { useToastContext } from "../providers/ToastProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  brand: string;
  images: string[];
}

export default function EditProductScreen() {
  const { isRTL } = useI18n();
  const { id } = useLocalSearchParams();
  const { showToast } = useToastContext();

  const queryClient = useQueryClient();

  // 🔹 Fetch product from API
  const { data, isLoading, isError } = useQuery(
    trpc.stores.products.get.queryOptions({
      productId: Number(id),
    })
  );

  // 🔹 Update product mutation
  const updateProductMutation = useMutation(trpc.stores.products.update.mutationOptions());

  // 🔹 Local form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    brand: "",
    images: [],
  });

  // 🔹 Initialize form when product data is loaded
  useEffect(() => {
    if (data?.product) {
      const product = data.product;
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        price: product.price?.toString() || "",
        stock: product.stockQuantity?.toString() || "",
        brand: "", // إذا كان عندك حقل العلامة التجارية مستقبلاً
        images: product.image ? [product.image] : [],
      });
    }
  }, [data]);

  const categories = [
    { id: "medicine", name: "أدوية" },
    { id: "equipment", name: "معدات" },
    { id: "supplements", name: "مكملات" },
    { id: "tools", name: "أدوات" },
  ];

  const handleSubmit = async () => {
    if (!formData.name.trim()) return showToast({ type: "error", message: "اسم المنتج مطلوب" });
    if (!formData.price.trim()) return showToast({ type: "error", message: "السعر مطلوب" });
    if (!formData.stock.trim()) return showToast({ type: "error", message: "الكمية مطلوبة" });

    try {
      await updateProductMutation.mutateAsync({
        productId: Number(id),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.stock),
        image: formData.images[0],
        inStock: parseInt(formData.stock) > 0,
      } as any);

      showToast({ type: "success", message: `تم تحديث المنتج ${formData.name} بنجاح` });
      queryClient.invalidateQueries(trpc.stores.getUserStores.queryKey);
      router.back();
    } catch (error: any) {
      showToast({ type: "error", message: error.message || "حدث خطأ أثناء تحديث المنتج" });
    }
  };

  const handleImageUpload = () => {
    showToast({ type: "info", message: "سيتم إضافة ميزة رفع الصور قريباً" });
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, "https://via.placeholder.com/300x200"],
    }));
  };

  // 🔹 Show loading state
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loaderText}>جاري تحميل بيانات المنتج...</Text>
      </View>
    );
  }

  // 🔹 Show error state
  if (isError || !data?.product) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>حدث خطأ أثناء تحميل بيانات المنتج</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "تعديل المنتج" }} />

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات المنتج</Text>

            {/* اسم المنتج */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>اسم المنتج *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData((p) => ({ ...p, name: text }))}
                placeholder="أدخل اسم المنتج"
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            {/* الوصف */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>الوصف</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData((p) => ({ ...p, description: text }))}
                placeholder="وصف المنتج"
                multiline
                numberOfLines={3}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            {/* الفئة */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>الفئة *</Text>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryButton, formData.category === category.id && styles.selectedCategoryButton]}
                    onPress={() => setFormData((p) => ({ ...p, category: category.id }))}
                  >
                    <Text
                      style={[styles.categoryText, formData.category === category.id && styles.selectedCategoryText]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* السعر */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>السعر *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData((p) => ({ ...p, price: text }))}
                placeholder="السعر"
                keyboardType="numeric"
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            {/* الكمية */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>الكمية المتوفرة *</Text>
              <TextInput
                style={styles.input}
                value={formData.stock}
                onChangeText={(text) => setFormData((p) => ({ ...p, stock: text }))}
                placeholder="عدد القطع المتوفرة"
                keyboardType="numeric"
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            {/* العلامة التجارية */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>العلامة التجارية</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData((p) => ({ ...p, brand: text }))}
                placeholder="اسم العلامة التجارية"
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            {/* الصور */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>صور المنتج</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
                <Upload size={24} color={COLORS.primary} />
                <Text style={styles.uploadText}>إضافة صورة</Text>
              </TouchableOpacity>
              {formData.images.length > 0 && (
                <View style={styles.imagesContainer}>
                  {formData.images.map((image, i) => (
                    <Image key={i} source={{ uri: image }} style={styles.previewImage} />
                  ))}
                </View>
              )}
            </View>
          </View>

          <Button
            title={updateProductMutation.isPending ? "جاري التحديث..." : "تحديث المنتج"}
            onPress={handleSubmit}
            disabled={updateProductMutation.isPending}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray },
  content: { padding: 16 },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.black, marginBottom: 16, textAlign: "right" },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.black, marginBottom: 8, textAlign: "right" },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  categoryContainer: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedCategoryButton: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryText: { fontSize: 14, color: COLORS.darkGray, fontWeight: "500" },
  selectedCategoryText: { color: COLORS.white, fontWeight: "600" },
  uploadButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    backgroundColor: COLORS.gray,
  },
  uploadText: { fontSize: 16, color: COLORS.primary, marginRight: 8, fontWeight: "600" },
  imagesContainer: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, marginTop: 12 },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  submitButton: { marginBottom: 20 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loaderText: { marginTop: 12, color: COLORS.darkGray, fontSize: 16 },
  errorText: { color: "red", fontSize: 16, textAlign: "center" },
});
