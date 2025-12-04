import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Image, Platform } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import Button from "../components/Button";
import { ImageIcon } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/providers/ToastProvider";
import { ImageGalleryUploader } from "../components/ImageGalleryUploader";

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  brand: string;
  images: string[];
}

export default function AddProductScreen() {
  const { isRTL } = useI18n();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "باراسيتامول 500 مجم",
    description: "دواء مسكن وخافض للحرارة",
    category: "medicine",
    price: "5.50",
    stock: "100",
    brand: "شركة فارما",
    images: [],
  });

  const queryClient = useQueryClient();

  const { warehouseId } = useLocalSearchParams();
  const { showToast } = useToastContext();

  const addProductMutation = useMutation(trpc.stores.products.create.mutationOptions());

  const categories = [
    { id: "medicine", name: "أدوية" },
    { id: "equipment", name: "معدات" },
    { id: "supplements", name: "مكملات" },
    { id: "tools", name: "أدوات" },
  ];

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert("خطأ", "اسم المنتج مطلوب");
      return;
    }
    if (!formData.price.trim()) {
      Alert.alert("خطأ", "السعر مطلوب");
      return;
    }
    if (!formData.stock.trim()) {
      Alert.alert("خطأ", "الكمية مطلوبة");
      return;
    }
    if (formData.images.length === 0) {
      Alert.alert("خطأ", "يجب إضافة صورة واحدة على الأقل للمنتج");
      return;
    }

    addProductMutation.mutate(
      {
        storeId: Number(warehouseId),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.stock, 10),
        category: formData.category,
        brand: formData.brand,
        images: formData.images,
        inStock: parseInt(formData.stock, 10) > 0,
      } as any,
      {
        onSuccess: () => {
          showToast({ type: "success", message: "تم إضافة المنتج بنجاح" });
          router.back();
          queryClient.invalidateQueries(trpc.stores.getUserStoresProcedure.queryKey);
        },
        onError: () => {
          showToast({ type: "error", message: "حدث خطا أثناء إضافة المنتج" });
        },
      }
    );
  };


  return (
    <>
      <Stack.Screen
        options={{
          title: "إضافة منتج جديد",
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات المنتج</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>اسم المنتج *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                placeholder="أدخل اسم المنتج"
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الوصف</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                placeholder="وصف المنتج"
                multiline
                numberOfLines={3}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الفئة *</Text>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryButton, formData.category === category.id && styles.selectedCategoryButton]}
                    onPress={() => setFormData((prev) => ({ ...prev, category: category.id }))}
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>السعر *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, price: text }))}
                placeholder="السعر بالدولار"
                keyboardType="numeric"
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الكمية المتوفرة *</Text>
              <TextInput
                style={styles.input}
                value={formData.stock}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, stock: text }))}
                placeholder="عدد القطع المتوفرة"
                keyboardType="numeric"
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>العلامة التجارية</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, brand: text }))}
                placeholder="اسم العلامة التجارية"
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>صور المنتج</Text>
              <ImageGalleryUploader
                images={formData.images}
                onImagesChange={(images: string[]) => setFormData((prev) => ({ ...prev, images }))}
                maxImages={5}
                title="صور المنتج"
              />
            </View>
          </View>

          <Button
            title={addProductMutation.isPending ? "جاري الإضافة..." : "إضافة المنتج"}
            onPress={handleSubmit}
            disabled={addProductMutation.isPending}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  selectedCategoryText: {
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
  submitButton: {
    marginBottom: 20,
  },
});
