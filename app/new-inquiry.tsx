import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, Alert } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, Stack } from "expo-router";
import { Send, Camera, X } from "lucide-react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useApp } from "@/providers/AppProvider";
import * as ImagePicker from "expo-image-picker";

const categories = ["عام", "تغذية", "سلوكيات", "أمراض جلدية", "تطعيمات", "أخرى"];

export default function NewInquiryScreen() {
  const { isRTL } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const [newInquiry, setNewInquiry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("عام");
  const [prescriptionFile, setPrescriptionFile] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const createInquiryMutation = useMutation(trpc.inquiries.create.mutationOptions());

  const pickFile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("خطأ", "نحتاج إلى إذن للوصول إلى الملفات");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setPrescriptionFile(asset.uri);
      setFileType(asset.type === "video" ? "video" : "image");
    }
  };

  const removeFile = () => {
    setPrescriptionFile(null);
    setFileType(null);
  };

  const handleSubmitInquiry = () => {
    if (!newInquiry.trim()) {
      Alert.alert("خطأ", "يرجى كتابة نص الاستفسار");
      return;
    }
    if (!user) {
      Alert.alert("خطأ", "يرجى تسجيل الدخول أولاً");
      return;
    }

    createInquiryMutation.mutate(
      {
        userId: Number(user.id),
        title: `استفسار في فئة: ${selectedCategory}`,
        content: newInquiry,
        category: selectedCategory,
        priority: "normal" as const,
        attachments: prescriptionFile ? JSON.stringify([{ uri: prescriptionFile, type: fileType }]) : undefined,
      },
      {
        onSuccess: (result) => {
          const message = result.message || "تم إرسال الاستفسار بنجاح. سيتم الرد عليه قريباً.";
          Alert.alert("نجح", message, [
            {
              text: "موافق",
              onPress: () => {
                setNewInquiry("");
                setSelectedCategory("عام");
                setPrescriptionFile(null);
                setFileType(null);
                router.push("/vet-inquiries");
              },
            },
          ]);
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "حدث خطأ أثناء إرسال الاستفسار");
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "استفسار جديد",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* New Inquiry Form */}
        <View style={styles.newInquirySection}>
          <Text style={styles.sectionTitle}>استفسار جديد</Text>

          <View style={styles.categorySelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryButton, selectedCategory === category && styles.selectedCategory]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="اكتب استفسارك هنا..."
              placeholderTextColor={COLORS.darkGray}
              value={newInquiry}
              onChangeText={setNewInquiry}
              multiline
              numberOfLines={4}
              textAlign={isRTL ? "right" : "left"}
            />

            {/* Prescription File Upload */}
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>رفع صورة او فيديو (اختياري)</Text>

              {prescriptionFile ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: prescriptionFile }} style={styles.prescriptionImage} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeFile}>
                    <X size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadButton} onPress={pickFile}>
                  <Camera size={24} color={COLORS.primary} />
                  <Text style={styles.uploadButtonText}>اختر الملف</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.sendButton,
                (createInquiryMutation.isPending || !newInquiry.trim()) && styles.sendButtonDisabled,
              ]}
              onPress={handleSubmitInquiry}
              disabled={createInquiryMutation.isPending || !newInquiry.trim()}
            >
              <Send size={20} color={COLORS.white} />
              <Text style={styles.sendButtonText}>{createInquiryMutation.isPending ? "جاري الإرسال..." : "إرسال"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Previous Inquiries Section */}
        <PreviousInquiries />
      </ScrollView>
    </View>
  );
}

function PreviousInquiries() {
  // NOTE: This assumes a `listForUser` procedure exists on the `inquiries` router
  const { data: inquiries, isLoading, error } = useQuery(trpc.inquiries.listForUser.queryOptions());

  if (isLoading) {
    return <Text style={styles.sectionTitle}>جاري تحميل الاستفسارات السابقة...</Text>;
  }

  if (error) {
    return <Text style={styles.sectionTitle}>خطأ في تحميل الاستفسارات: {error.message}</Text>;
  }

  return (
    <View style={styles.inquiriesSection}>
      <Text style={styles.sectionTitle}>استفساراتك السابقة</Text>
      {inquiries && inquiries.length > 0 ? (
        inquiries.map((inquiry) => (
          <View key={inquiry.id} style={styles.inquiryCard}>
            <View style={styles.inquiryHeader}>
              <View style={styles.statusContainer}>
                <View style={[styles.statusIndicator, inquiry.status === "answered" ? {} : styles.pendingIndicator]} />
                <Text style={[styles.statusText, inquiry.status === "answered" ? {} : styles.pendingText]}>
                  {inquiry.status === "answered" ? "تم الرد" : "في الانتظar"}
                </Text>
              </View>
              <Text style={styles.dateText}>{new Date(inquiry.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{inquiry.category}</Text>
            </View>
            <Text style={styles.questionText}>{inquiry.content}</Text>
            {inquiry.reply && (
              <View style={styles.answerContainer}>
                <Text style={styles.answerLabel}>الإجابة:</Text>
                <Text style={styles.answerText}>{inquiry.reply}</Text>
              </View>
            )}
          </View>
        ))
      ) : (
        <Text>لا توجد استفسارات سابقة.</Text>
      )}
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
    padding: 16,
  },
  newInquirySection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
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
    textAlign: "center",
  },
  categorySelector: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.black,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  inputContainer: {
    gap: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    minHeight: 100,
    textAlignVertical: "top",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.darkGray,
    opacity: 0.6,
  },
  imageSection: {
    marginVertical: 8,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 16,
    gap: 8,
    backgroundColor: "#F8FAFC",
  },
  uploadButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  imageContainer: {
    position: "relative",
    alignSelf: "center",
  },
  prescriptionImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  inquiriesSection: {
    gap: 12,
  },
  inquiryCard: {
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
  inquiryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  pendingIndicator: {
    backgroundColor: COLORS.warning,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.success,
  },
  pendingText: {
    color: COLORS.warning,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  questionText: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 24,
    marginBottom: 8,
    textAlign: "right",
  },
  answerContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.success,
    marginBottom: 4,
    textAlign: "right",
  },
  answerText: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
    textAlign: "right",
  },
});
