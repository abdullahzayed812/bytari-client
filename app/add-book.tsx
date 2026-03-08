import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import { ArrowLeft, Plus } from "lucide-react-native";
import Button from "../components/Button 2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { ImageGalleryUploader } from "@/components/ImageGalleryUploader";
import { FileUploader } from "@/components/FileUploader";
import { useI18n } from "@/providers/I18nProvider";

export default function AddBookScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    pages: "",
    category: "",
    language: "",
  });

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>("");

  const categories = ["تشريح", "أمراض", "جراحة", "صيدلة", "تغذية", "طب وقائي", "تشخيص"];

  const createBookMutation = useMutation(trpc.content.createBook.mutationOptions());

  const handleSave = () => {
    if (!formData.title || !formData.author || !formData.category) {
      Alert.alert(t("common.error"), t("validation.required"));
      return;
    }

    if (!selectedFileUrl) {
      Alert.alert(t("common.error"), t("addBook.uploadFileRequired"));
      return;
    }

    createBookMutation.mutate(
      {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        pageCount: formData.pages ? parseInt(formData.pages) : undefined,
        category: formData.category,
        language: formData.language,
        coverImage: selectedImages[0] || "",
        filePath: selectedFileUrl,
      } as any,
      {
        onSuccess: () => {
          Alert.alert(t("common.success"), t("addBook.addSuccess"));
          queryClient.invalidateQueries(trpc.content.listVetBooks.queryKey as any);
          router.back();
        },
        onError: (error: any) => {
          Alert.alert(t("common.error"), error.message || t("addBook.addFailed"));
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: t("addBook.title"),
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
              label={t("addBook.bookImage")}
              aspect={[3, 4]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("addBook.bookTitle")}</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder={t("addBook.enterTitle")}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("addBook.author")}</Text>
            <TextInput
              style={styles.input}
              value={formData.author}
              onChangeText={(text) => setFormData({ ...formData, author: text })}
              placeholder={t("addBook.enterAuthor")}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("addBook.categoryRequired")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryButton, formData.category === category && styles.selectedCategoryButton]}
                  onPress={() => setFormData({ ...formData, category })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.category === category && styles.selectedCategoryButtonText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("common.description")}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder={t("addBook.enterDesc")}
              textAlign="right"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("addBook.pageCount")}</Text>
            <TextInput
              style={styles.input}
              value={formData.pages}
              onChangeText={(text) => setFormData({ ...formData, pages: text })}
              placeholder={t("addBook.enterPageCount")}
              textAlign="right"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("addBook.language")}</Text>
            <View style={styles.languageContainer}>
              {[t("addBook.arabic"), t("addBook.english"), t("addBook.french")].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.languageButton, formData.language === lang && styles.selectedLanguageButton]}
                  onPress={() => setFormData({ ...formData, language: lang })}
                >
                  <Text
                    style={[styles.languageButtonText, formData.language === lang && styles.selectedLanguageButtonText]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* File Upload Section */}
          <View style={styles.inputGroup}>
            <FileUploader
              fileUrl={selectedFileUrl}
              onFileChange={setSelectedFileUrl}
              label={t("addBook.bookFile")}
              placeholder={t("addBook.selectFile")}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={createBookMutation.isPending ? t("common.loading") : t("addBook.addBook")}
          onPress={handleSave}
          type="primary"
          size="large"
          icon={<Plus size={20} color={COLORS.white} />}
          disabled={createBookMutation.isPending}
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
    width: 120,
    height: 160,
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
    textAlign: "left",
    marginBottom: 12,
  },
  fileButton: {
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
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
    textAlign: "left",
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
    height: 100,
    textAlignVertical: "top",
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },

  categoryScroll: {
    flexDirection: "row-reverse",
    marginVertical: 10,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: 8,
    backgroundColor: COLORS.white,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  selectedCategoryButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },

  languageContainer: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    gap: 10,
  },
  languageButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedLanguageButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  languageButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  selectedLanguageButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});
