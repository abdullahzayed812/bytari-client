import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { ImageGalleryUploader } from "@/components/ImageGalleryUploader";
import { FileUploader } from "@/components/FileUploader";
import { ArrowLeft, Plus } from "lucide-react-native";
import Button from "@/components/Button 2";
import { useI18n } from "@/providers/I18nProvider";

export default function AddArticleScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const quiryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    authorTitle: "",
    content: "",
    category: "",
  });

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>("");

  // const createArticleMutation = trpc.admin.content.createMagazine.useMutation();
  const createArticleMutation = useMutation(trpc.content.createArticle.mutationOptions());

  // Image upload is now handled by ImageUploader component

  const handleSave = () => {
    if (selectedImages.length === 0) {
      Alert.alert(t("common.error"), t("addArticle.coverRequired"));
      return;
    }

    if (!formData.title || !formData.author) {
      Alert.alert(t("common.error"), t("addArticle.titleRequired"));
      return;
    }

    if (!formData.content && !selectedFileUrl) {
      Alert.alert(t("common.error"), t("addArticle.contentRequired"));
      return;
    }

    createArticleMutation.mutate(
      {
        title: formData.title,
        description: formData.content || formData.authorTitle,
        author: formData.author,
        authorTitle: formData.authorTitle,
        category: formData.category as any,
        coverImage: selectedImages[0],
        filePath: selectedFileUrl,
        publishedDate: new Date(),
      } as any,
      {
        onSuccess: () => {
          Alert.alert(t("common.success"), t("addArticle.addSuccess"));
          router.back();
          quiryClient.invalidateQueries(trpc.content.listMagazineArticles.queryKey);
        },
        onError: (error) => {
          Alert.alert(t("common.error"), error.message || t("addArticle.addFailed"));
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: t("addArticle.title"),
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
                label={t("addArticle.coverImage")}
                aspect={[16, 9]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("addArticle.articleTitle")}</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder={t("addArticle.enterTitle")}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("addArticle.authorName")}</Text>
            <TextInput
              style={styles.input}
              value={formData.author}
              onChangeText={(text) => setFormData({ ...formData, author: text })}
              placeholder={t("addArticle.enterAuthor")}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("addArticle.authorTitleLabel")}</Text>
            <TextInput
              style={styles.input}
              value={formData.authorTitle}
              onChangeText={(text) => setFormData({ ...formData, authorTitle: text })}
              placeholder={t("addArticle.enterAuthorTitle")}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("addTip.category")}</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              placeholder={t("addArticle.enterCategory")}
              textAlign="right"
            />
          </View>

          <View style={styles.fileSection}>
            <FileUploader
              fileUrl={selectedFileUrl}
              onFileChange={setSelectedFileUrl}
              label={t("addArticle.fileOptional")}
              placeholder={t("addArticle.selectFile")}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("addArticle.contentLabel")}{!selectedFileUrl && " *"}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              placeholder={selectedFileUrl ? t("addArticle.contentOptional") : t("addArticle.enterContent")}
              textAlign="right"
              multiline
              numberOfLines={8}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={createArticleMutation.isPending ? t("common.loading") : t("addArticle.addArticle")}
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
    // alignItems: "center",
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
