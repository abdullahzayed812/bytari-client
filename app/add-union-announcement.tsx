import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput, Switch, Image } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Save, X, Camera, Link, Calendar, MessageSquare } from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageUploader } from "@/components/ImageUploader";
import { useI18n } from "@/providers/I18nProvider";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: "general" | "urgent" | "event" | "meeting";
  isImportant: boolean;
  image?: string;
  link?: string;
  linkText?: string;
  author?: string;
  views?: number;
  branchId: string;
}

export default function AddUnionAnnouncementScreen() {
  const { t } = useI18n();
  const { isSuperAdmin, isModerator, supervisedBranchIds, user } = useApp();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { branchId } = useLocalSearchParams();

  // Form state - must be declared before any conditional returns
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: "",
    content: "",
    date: "",
    type: "general",
    isImportant: false,
    image: "",
    link: "",
    linkText: "",
    author: "",
    branchId: "",
  });

  // selectedImage state is no longer needed if ImageUpload component handles it
  // const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const createAnnouncementMutation = useMutation(trpc.union.announcement.create.mutationOptions());

  // Check if user has permission to add announcements
  if (!isSuperAdmin && !isModerator && !supervisedBranchIds.length) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: t("common.unauthorized") }} />
        <View style={styles.noPermissionContainer}>
          <Text style={styles.noPermissionText}>{t("addAnnouncement.noPermission")}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t("common.back")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Get branch name for display
  const getBranchName = (id: string): string => {
    if (id === "main") {
      return "نقابة الأطباء البيطريين العراقية - المقر الرئيسي";
    }
    const branches: { [key: string]: string } = {
      "1": "نقابة الأطباء البيطريين - بغداد",
      "2": "نقابة الأطباء البيطريين - البصرة",
      "3": "نقابة الأطباء البيطريين - أربيل",
      "4": "نقابة الأطباء البيطريين - الموصل",
      "5": "نقابة الأطباء البيطريين - النجف",
      "6": "نقابة الأطباء البيطريين - كربلاء",
      "7": "نقابة الأطباء البيطريين - السليمانية",
      "8": "نقابة الأطباء البيطريين - دهوك",
    };
    return branches[id] || "نقابة غير معروفة";
  };

  const branchName = getBranchName(branchId as string);

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      Alert.alert(t("common.error"), t("addAnnouncement.fillRequired"));
      return;
    }

    const announcementData = {
      title: formData.title,
      content: formData.content,
      type: formData.type as "general" | "urgent" | "event" | "meeting",
      isImportant: formData.isImportant || false,
      image: formData.image, // Use formData.image directly
      link: formData.link,
      linkText: formData.linkText,
      author: formData.author,
    };

    if (branchId === "main") {
      createAnnouncementMutation.mutate(
        { ...announcementData, mainUnionId: 1 },
        {
          onSuccess: (data) => {
            queryClient.invalidateQueries(trpc.union.announcement.list.queryKey as any);
            Alert.alert(
              t("common.success"),
              branchId === "main" ? t("addAnnouncement.savedWithNotif") : t("addAnnouncement.saved"),
              [
                {
                  text: t("common.ok"),
                  onPress: () => router.back(),
                },
              ]
            );
          },
          onError: (error) => {
            Alert.alert(t("common.error"), t("addAnnouncement.saveError"));
          },
        }
      );
    } else {
      createAnnouncementMutation.mutate(
        { ...announcementData, branchId: parseInt(branchId as string) },
        {
          onSuccess: (data) => {
            queryClient.invalidateQueries(trpc.union.announcement.list.queryKey as any);
            Alert.alert(
              t("common.success"),
              branchId === "main" ? t("addAnnouncement.savedWithNotif") : t("addAnnouncement.saved"),
              [
                {
                  text: t("common.ok"),
                  onPress: () => router.back(),
                },
              ]
            );
          },
          onError: (error) => {
            Alert.alert(t("common.error"), t("addAnnouncement.saveError"));
          },
        }
      );
    }
  };

  // handleImagePicker is no longer needed
  // const handleImagePicker = () => {
  //   // In a real app, this would open image picker
  //   Alert.alert("اختيار صورة", "اختر مصدر الصورة", [
  //     { text: "إلغاء", style: "cancel" },
  //     { text: "المعرض", onPress: () => console.log("Open gallery") },
  //     { text: "الكاميرا", onPress: () => console.log("Open camera") },
  //   ]);
  // };

  const getAnnouncementTypeLabel = (type: string) => {
    switch (type) {
      case "urgent":
        return t("addAnnouncement.typeUrgent");
      case "meeting":
        return t("addAnnouncement.typeMeeting");
      case "event":
        return t("addAnnouncement.typeEvent");
      default:
        return t("addAnnouncement.typeGeneral");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("addAnnouncement.screenTitle"),
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold", fontSize: 16 },
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButton}
              disabled={createAnnouncementMutation.isPending}
            >
              <Save size={20} color={COLORS.white} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Branch Info */}
        <View style={styles.branchInfoSection}>
          <View style={styles.branchIcon}>
            <MessageSquare size={24} color={COLORS.primary} />
          </View>
          <View style={styles.branchInfo}>
            <Text style={styles.branchTitle}>{t("addAnnouncement.addTo")}</Text>
            <Text style={styles.branchName}>{branchName}</Text>
          </View>
        </View>

        {/* Announcement Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("addAnnouncement.announcementInfo")}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("addAnnouncement.titleLabel")}</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
              placeholder={t("addAnnouncement.enterTitle")}
              textAlign="right"
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("addAnnouncement.contentLabel")}</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={formData.content}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, content: text }))}
              placeholder={t("addAnnouncement.enterContent")}
              multiline
              numberOfLines={6}
              textAlign="right"
              maxLength={1000}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("addAnnouncement.authorLabel")}</Text>
            <TextInput
              style={styles.textInput}
              value={formData.author}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, author: text }))}
              placeholder={t("addAnnouncement.enterAuthor")}
              textAlign="right"
            />
          </View>
        </View>

        {/* Announcement Type and Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("addAnnouncement.typeSection")}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("addAnnouncement.typeLabel")}</Text>
            <View style={styles.typeSelector}>
              {["general", "urgent", "event", "meeting"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, formData.type === type && styles.selectedTypeOption]}
                  onPress={() => setFormData((prev) => ({ ...prev, type: type as any }))}
                >
                  <Text style={[styles.typeOptionText, formData.type === type && styles.selectedTypeOptionText]}>
                    {getAnnouncementTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Switch
              value={formData.isImportant}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, isImportant: value }))}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={formData.isImportant ? COLORS.white : COLORS.gray}
            />
            <Text style={styles.switchLabel}>{t("addAnnouncement.important")}</Text>
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("addAnnouncement.additionalInfo")}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("addAnnouncement.dateLabel")}</Text>
            <View style={styles.dateInputContainer}>
              <Calendar size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.textInput, styles.dateInput]}
                value={formData.date}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("addAnnouncement.relatedLink")}</Text>
            <View style={styles.linkInputContainer}>
              <Link size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.textInput, styles.linkInput]}
                value={formData.link}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, link: text }))}
                placeholder="https://example.com"
                textAlign="right"
                keyboardType="url"
              />
            </View>
          </View>

          {formData.link && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("addAnnouncement.linkText")}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.linkText}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, linkText: text }))}
                placeholder={t("addAnnouncement.enterLinkText")}
                textAlign="right"
              />
            </View>
          )}
        </View>

        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("addAnnouncement.imageSection")}</Text>

          <ImageUploader
            onUploadComplete={(url) => setFormData((prev) => ({ ...prev, image: url }))}
            imageUri={formData.image}
          />
        </View>

        {/* Preview Section */}
        {formData.title && formData.content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("addAnnouncement.preview")}</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={styles.previewMeta}>
                  <View
                    style={[
                      styles.previewType,
                      {
                        backgroundColor:
                          formData.type === "urgent"
                            ? COLORS.error
                            : formData.type === "meeting"
                            ? COLORS.primary
                            : formData.type === "event"
                            ? COLORS.success
                            : COLORS.darkGray,
                      },
                    ]}
                  >
                    <Text style={styles.previewTypeText}>{getAnnouncementTypeLabel(formData.type || "general")}</Text>
                  </View>
                  {formData.isImportant && (
                    <View style={styles.previewImportantBadge}>
                      <Text style={styles.previewImportantText}>{t("addAnnouncement.importantBadge")}</Text>
                    </View>
                  )}
                  <Text style={styles.previewDate}>{formData.date}</Text>
                </View>
              </View>

              <Text style={styles.previewTitle}>{formData.title}</Text>
              <Text style={styles.previewContent}>{formData.content}</Text>
              <Text style={styles.previewContent}>{formData.link}</Text>

              {formData.author && <Text style={styles.previewAuthor}>{t("addAnnouncement.by")}{formData.author}</Text>}

              {formData.link && (
                <View style={styles.previewLink}>
                  <Link size={14} color={COLORS.primary} />
                  <Text style={styles.previewLinkText}>{formData.linkText || t("addAnnouncement.relatedLink")}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveActionButton, createAnnouncementMutation.isPending && styles.disabledButton]}
            onPress={handleSave}
            disabled={createAnnouncementMutation.isPending || !formData.title || !formData.content}
          >
            <Text style={styles.saveActionButtonText}>
              {createAnnouncementMutation.isPending ? t("common.sending") : t("addAnnouncement.publish")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noPermissionText: {
    fontSize: 18,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  branchInfoSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  branchIcon: {
    marginRight: 16,
  },
  branchInfo: {
    flex: 1,
  },
  branchTitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: "left",
  },
  branchName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "left",
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "left",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: "left",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  dateInputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  dateInput: {
    flex: 1,
  },
  linkInputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  linkInput: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: "transparent",
  },
  selectedTypeOption: {
    backgroundColor: COLORS.primary,
  },
  typeOptionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  selectedTypeOptionText: {
    color: COLORS.white,
  },
  switchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  removeImageButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  imageActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    gap: 12,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  previewCard: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  previewHeader: {
    marginBottom: 12,
  },
  previewMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  previewType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewTypeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "600",
  },
  previewImportantBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  previewImportantText: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: "bold",
  },
  previewDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: "left",
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  previewContent: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    textAlign: "left",
    marginBottom: 8,
  },
  previewAuthor: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "500",
    textAlign: "left",
    marginBottom: 8,
  },
  previewLink: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 8,
    gap: 6,
  },
  previewLinkText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    textAlign: "left",
  },
  actionSection: {
    flexDirection: "row-reverse",
    padding: 20,
    gap: 12,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  saveActionButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  saveActionButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
});
