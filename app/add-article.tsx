import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useApp } from "../providers/AppProvider";
import { ImageGalleryUploader } from "@/components/ImageGalleryUploader";
import { FileUploader } from "@/components/FileUploader";
import { ArrowLeft, Plus } from "lucide-react-native";
import Button from "@/components/Button 2";

export default function AddArticleScreen() {
  const router = useRouter();
  const quiryClient = useQueryClient();
  const { user } = useApp();

  const [formData, setFormData] = useState({
    title: "عنوان المقال",
    author: "محمد عمر هاشم الماجدي",
    authorTitle: "كتاب عن تربيه الحيوانات",
    content: "محتوى الكتاب",
    category: "التصنيف",
  });

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>("");

  // const createArticleMutation = trpc.admin.content.createMagazine.useMutation();
  const createArticleMutation = useMutation(trpc.admin.content.createMagazine.mutationOptions());

  // Image upload is now handled by ImageUploader component



  const handleSave = () => {
    if (selectedImages.length === 0) {
      Alert.alert("خطأ", "صورة الغلاف مطلوبة");
      return;
    }

    if (!formData.title || !formData.author) {
      Alert.alert("خطأ", "عنوان الكتاب مطلوب");
      return;
    }

    if (!formData.content && !selectedFileUrl) {
      Alert.alert("خطأ", "محتوى الكتاب مطلوب");
      return;
    }

    createArticleMutation.mutate(
      {
        adminId: user?.id ? Number(user.id) : 1,
        title: formData.title,
        description: formData.content || formData.authorTitle,
        author: formData.author,
        authorTitle: formData.authorTitle,
        category: formData.category as any,
        coverImage: selectedImages[0],
        pdfUrl: selectedFileUrl,
        publishDate: new Date(),
      } as any,
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم إضافة المقال بنجاح");
          router.back();
          quiryClient.invalidateQueries(trpc.content.listMagazineArticles.queryKey);
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "فشل في إضافة المقال");
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إضافة مقال جديد",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={styles.inputGroup}>
              <ImageGalleryUploader
                images={selectedImages}
                onImagesChange={setSelectedImages}
                maxImages={1}
                label="صورة غلاف المقال *"
                aspect={[16, 9]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان المقال *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="أدخل عنوان المقال"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم الكاتب *</Text>
            <TextInput
              style={styles.input}
              value={formData.author}
              onChangeText={(text) => setFormData({ ...formData, author: text })}
              placeholder="أدخل اسم الكاتب"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>مسمى الكاتب</Text>
            <TextInput
              style={styles.input}
              value={formData.authorTitle}
              onChangeText={(text) => setFormData({ ...formData, authorTitle: text })}
              placeholder="أدخل مسمى الكاتب"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>التصنيف</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              placeholder="أدخل تصنيف المقال"
              textAlign="right"
            />
          </View>

          <View style={styles.fileSection}>
            <FileUploader
              fileUrl={selectedFileUrl}
              onFileChange={setSelectedFileUrl}
              label="ملف المقال (اختياري)"
              placeholder="اختيار ملف المقال (PDF)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>محتوى المقال {!selectedFileUrl && "*"}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              placeholder={selectedFileUrl ? "محتوى اختياري (تم رفع ملف)" : "أدخل محتوى المقال"}
              textAlign="right"
              multiline
              numberOfLines={8}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={createArticleMutation.isPending ? "جاري الإضافة..." : "إضافة المقال"}
          onPress={handleSave}
          type="primary"
          size="large"
          icon={<Plus size={20} color={COLORS.white} />}
          disabled={createArticleMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
    backgroundColor: COLORS.white,
    margin: 10,
    borderRadius: 12,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  imagePlaceholder: {
    width: 200,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  imageSubText: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 4,
  },
  fileSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  filePlaceholder: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  filePlaceholderText: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  fileSubText: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 4,
  },
  fileInfo: {
    fontSize: 10,
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 12,
  },
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  fileButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 150,
    textAlignVertical: "top",
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});
