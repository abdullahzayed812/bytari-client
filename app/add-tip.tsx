import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import { ArrowLeft, Plus, Upload } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useApp } from "@/providers/AppProvider";
import Button from "../components/Button";
import { ImageGalleryUploader } from "../components/ImageGalleryUploader";
import { useI18n } from "@/providers/I18nProvider";

export default function AddTipScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useApp();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    images: [] as string[],
  });

  // const createTipMutation = trpc.admin.content.createTip.useMutation();
  const createTipMutation = useMutation(trpc.admin.content.createTip.mutationOptions());

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      Alert.alert(t("common.error"), t("validation.required"));
      return;
    }

    createTipMutation.mutate(
      {
        adminId: user?.id ? Number(user.id) : 1,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        images: formData.images,
      } as any,
      {
        onSuccess: () => {
          Alert.alert(t("common.success"), t("addTip.addSuccess"));
          queryClient.invalidateQueries(trpc.content.listTips.queryKey());
          router.back();
        },
        onError: (error: any) => {
          Alert.alert(t("common.error"), error.message || t("addTip.addFailed"));
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: t("addTip.title"),
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
          <ImageGalleryUploader
            images={formData.images}
            onImagesChange={(images) => setFormData({ ...formData, images })}
            maxImages={5}
            label={t("addTip.tipImages")}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("addTip.tipTitle")}</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder={t("addTip.enterTitle")}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("addTip.category")}</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              placeholder={t("addTip.enterCategory")}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("addTip.content")}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              placeholder={t("addTip.enterContent")}
              textAlign="right"
              multiline
              numberOfLines={6}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={createTipMutation.isPending ? t("common.loading") : t("addTip.addTip")}
          onPress={handleSave}
          type="primary"
          size="large"
          disabled={createTipMutation.isPending}
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
    height: 120,
    textAlignVertical: "top",
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});
