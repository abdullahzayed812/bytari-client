import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState, useRef, useMemo } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";

import { useRouter, useFocusEffect } from "expo-router";
import { trpc } from "../lib/trpc";
import { Camera, X, Send } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import Card from "../components/Card";
import UserReplyForm from "../components/UserReplyForm";
import { useMutation, useQuery } from "@tanstack/react-query";

const petTypes = ["dog", "cat", "rabbit", "bird", "other"];

export default function ConsultationScreen() {
  const { t } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const [question, setQuestion] = useState("");
  const [selectedPetType, setSelectedPetType] = useState("");
  const [prescriptionFile, setPrescriptionFile] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);

  const createConsultationMutation = useMutation(trpc.consultations.create.mutationOptions());

  const handleSubmit = () => {
    if (!question.trim() || !selectedPetType) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (!user) {
      Alert.alert("خطأ", "يرجى تسجيل الدخول أولاً");
      return;
    }

    createConsultationMutation.mutate(
      {
        userId: Number(user.id),
        petType: selectedPetType,
        question: question,
        attachments: prescriptionFile ? JSON.stringify([{ uri: prescriptionFile, type: fileType }]) : undefined,
        priority: "normal" as const,
      },
      {
        onSuccess: (result) => {
          let message = result.message || "تم إرسال استشارتك بنجاح. سيتم الرد عليها قريباً.";
          Alert.alert("تم الإرسال", message);
          setQuestion("");
          setSelectedPetType("");
          setPrescriptionFile(null);
          setFileType(null);
          // Optionally, navigate away or refetch previous consultations
          router.replace("/(tabs)");
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "حدث خطأ أثناء إرسال الاستشارة");
        },
      }
    );
  };

  const pickFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow both images and videos
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setPrescriptionFile(selectedAsset.uri);

        // Set fileType based on MIME type or URI
        if (selectedAsset.type === "video" || selectedAsset.uri.endsWith(".mp4")) {
          setFileType("video");
        } else {
          setFileType("image");
        }
      }
    } catch (error) {
      console.error("File picking error:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء اختيار الملف");
    }
  };

  const removeFile = () => {
    setPrescriptionFile(null);
    setFileType(null);
  };

  return (
    <ScrollView ref={scrollViewRef} style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{t("consultation.title")}</Text>
      <Text style={styles.subtitle}>
        ارسل استشارتك وتفاصيل الحالة وارفع صورة او فيديو إن وجدت لنشخص الحالة بشكل دقيق
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t("consultation.petType")}</Text>
        <View style={styles.petTypesContainer}>
          {petTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.petTypeButton, selectedPetType === type && styles.selectedPetTypeButton]}
              onPress={() => handleSelectPetType(type)}
            >
              <Text style={[styles.petTypeText, selectedPetType === type && styles.selectedPetTypeText]}>
                {t(`pets.types.${type}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t("consultation.question")}</Text>
        <TextInput
          style={styles.textArea}
          placeholder="اكتب سؤالك هنا..."
          value={question}
          onChangeText={setQuestion}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholderTextColor={COLORS.darkGray}
        />
      </View>

      <View style={styles.formGroup}>
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
      </View>

      <TouchableOpacity
        style={[
          styles.sendButton,
          (createConsultationMutation.isPending || !question.trim() || !selectedPetType) && styles.sendButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={createConsultationMutation.isPending || !question.trim() || !selectedPetType}
      >
        <Send size={20} color={COLORS.white} />
        <Text style={styles.sendButtonText}>{createConsultationMutation.isPending ? "جاري الإرسال..." : "إرسال"}</Text>
      </TouchableOpacity>

      {/* Previous Consultations Section */}
      <PreviousConsultations />
    </ScrollView>
  );
}

function PreviousConsultations() {
  const { user } = useApp();
  const { t } = useI18n();
  // NOTE: This assumes a `listForUser` procedure exists on the `consultations` router
  const { data, isLoading, error } = useQuery(trpc.consultations.listForUser.queryOptions());

  const consultations = useMemo(() => (data as any)?.consultations, [data]);

  if (isLoading) {
    return <Text style={styles.previousConsultationsTitle}>جاري تحميل الاستشارات السابقة...</Text>;
  }

  if (error) {
    return <Text style={styles.previousConsultationsTitle}>خطأ في تحميل الاستشارات: {error.message}</Text>;
  }

  return (
    <View style={styles.previousConsultationsSection}>
      <Text style={styles.previousConsultationsTitle}>استشاراتك السابقة</Text>
      <Text style={styles.previousConsultationsSubtitle}>جميع استشاراتك السابقة بغض النظر عن حالة المحادثة</Text>

      {consultations && consultations.length > 0 ? (
        consultations.map((consultation) => (
          <View key={consultation.id} style={styles.consultationContainer}>
            <Card
              title={consultation.title}
              subtitle={new Date(consultation.createdAt).toLocaleDateString()}
              style={styles.consultationCard}
            >
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusIndicator,
                    consultation.status === "pending"
                      ? styles.statusPending
                      : consultation.status === "answered"
                      ? styles.statusAnswered
                      : styles.statusClosed,
                  ]}
                />
                <Text style={styles.statusText}>{t(`consultation.${consultation.status}`)}</Text>

                {/* Mock conversation status */}
                <View style={styles.conversationStatus}>
                  <Text
                    style={[
                      styles.conversationStatusText,
                      consultation.status === "answered" ? styles.openStatus : styles.closedStatus,
                    ]}
                  >
                    {consultation.status === "answered" ? "مفتوحة للرد" : "مغلقة"}
                  </Text>
                </View>
              </View>

              <Text style={styles.questionText}>{consultation.question}</Text>

              {consultation.response && (
                <View style={styles.responseContainer}>
                  <Text style={styles.responseLabel}>الإجابة:</Text>
                  <Text style={styles.answerText}>{consultation.response}</Text>
                </View>
              )}
            </Card>

            {consultation.status === "answered" && (
              <UserReplyForm
                type="consultation"
                itemId={Number(consultation.id)}
                userId={Number(user?.id) || 1}
                isConversationOpen={true} // Mock value
                onReplySuccess={() => {
                  console.log("Reply sent successfully");
                  // Refetch consultations list
                }}
              />
            )}
          </View>
        ))
      ) : (
        <Text>لا توجد استشارات سابقة.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: COLORS.black,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: COLORS.black,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  petTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  petTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPetTypeButton: {
    backgroundColor: COLORS.primary,
  },
  petTypeText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  selectedPetTypeText: {
    color: COLORS.white,
    fontWeight: "600",
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

  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    marginTop: 20,
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
  previousConsultationsSection: {
    marginTop: 20,
    maxHeight: 300,
  },
  previousConsultationsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: COLORS.black,
    textAlign: "center",
  },
  consultationCard: {
    marginBottom: 12,
    transform: [{ scale: 0.95 }],
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusPending: {
    backgroundColor: COLORS.warning,
  },
  statusAnswered: {
    backgroundColor: COLORS.success,
  },
  statusClosed: {
    backgroundColor: COLORS.darkGray,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  answerText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    textAlign: "right",
  },
  previousConsultationsSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  consultationContainer: {
    marginBottom: 16,
  },
  conversationStatus: {
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  conversationStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  openStatus: {
    color: COLORS.success,
  },
  closedStatus: {
    color: COLORS.error,
  },
  questionText: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
    lineHeight: 20,
  },
  responseContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.success,
    marginBottom: 4,
    textAlign: "right",
  },
});
