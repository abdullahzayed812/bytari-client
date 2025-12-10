import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "../constants/colors";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { ImageGalleryUploader } from "@/components/ImageGalleryUploader";
import { FileUploader } from "@/components/FileUploader";
import { ArrowLeft, Save } from "lucide-react-native";
import Button from "@/components/Button 2";

export default function EditArticleScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();
  const articleId = parseInt(id as string);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    authorTitle: "",
    content: "",
    image: "",
    category: "",
  });

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>("");

  const { data, isLoading, error } = useQuery(trpc.content.getArticleById.queryOptions({ id: articleId }));
  const article = useMemo(() => (data as any)?.article, [data]);
  const updateArticleMutation = useMutation(trpc.content.updateArticle.mutationOptions());

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        author: article.author,
        authorTitle: article.authorTitle,
        content: article.content,
        image: article.coverImage,
        category: article.category,
      });
      setSelectedImages(article.coverImage ? [article.coverImage] : []);
      setSelectedFileUrl(article.filePath || "");
    }
  }, [article]);



  const handleSave = () => {
    updateArticleMutation.mutate(
      {
        id: articleId,
        ...formData,
        coverImage: selectedImages[0],
        filePath: selectedFileUrl,
      } as any,
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم تحديث المقال بنجاح");
          queryClient.invalidateQueries(trpc.content.getArticleById.queryKey);
          router.back();
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "فشل في تحديث المقال");
        },
      }
    );
  };

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "تعديل المقال",
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
            <ImageGalleryUploader
              images={selectedImages}
              onImagesChange={setSelectedImages}
              maxImages={1}
              label="صورة غلاف المقال"
              aspect={[16, 9]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان المقال</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="أدخل عنوان المقال"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم الكاتب</Text>
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
              placeholder="تغيير ملف المقال (PDF)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>محتوى المقال</Text>
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
          title={updateArticleMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          onPress={handleSave}
          type="primary"
          size="large"
          icon={<Save size={20} color={COLORS.white} />}
          disabled={updateArticleMutation.isPending}
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
  articleImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
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
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});
