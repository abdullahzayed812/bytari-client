import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import React, { useState } from "react";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Clock, Users, CheckCircle } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { trpc } from "../lib/trpc";
import { useMutation } from "@tanstack/react-query";

interface RegistrationFormData {
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  specialRequests?: string;
}

export default function CourseRegistrationScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get course details from params
  const courseId = params.courseId as string;
  const courseName = params.courseName as string;
  const courseDate = params.courseDate as string;
  const courseLocation = params.courseLocation as string;
  const courseDuration = params.courseDuration as string;
  const coursePrice = params.coursePrice as string;
  const courseOrganizer = params.courseOrganizer as string;

  const [formData, setFormData] = useState<RegistrationFormData>({
    participantName: "",
    participantEmail: "",
    participantPhone: "",
    specialRequests: "",
  });

  const submitRegistrationMutation = useMutation(
    trpc.courses.register.mutationOptions({
      onSuccess: (data) => {
        if (data.success) {
          Alert.alert("تم التسجيل بنجاح", data.message, [
            {
              text: "موافق",
              onPress: () => router.back(),
            },
          ]);
        } else {
          Alert.alert("خطأ", data.message);
        }
      },
      onError: (error) => {
        console.error("Registration error:", error);
        Alert.alert("خطأ", "حدث خطأ أثناء إرسال طلب التسجيل");
      },
    })
  );

  const handleSubmit = () => {
    if (!formData.participantName.trim()) {
      Alert.alert("خطأ", "يرجى إدخال الاسم الكامل");
      return;
    }

    if (!formData.participantEmail.trim()) {
      Alert.alert("خطأ", "يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!formData.participantPhone.trim()) {
      Alert.alert("خطأ", "يرجى إدخال رقم الهاتف");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.participantEmail)) {
      Alert.alert("خطأ", "يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    // Fire mutation
    submitRegistrationMutation.mutate({
      courseId,
      courseName,
      participantName: formData.participantName,
      participantEmail: formData.participantEmail,
      participantPhone: formData.participantPhone,
      specialRequests: formData.specialRequests,
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "تسجيل في الدورة",
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

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Course Information Card */}
        <View style={styles.courseInfoCard}>
          <View style={styles.courseHeader}>
            <CheckCircle size={24} color={COLORS.primary} />
            <Text style={styles.courseTitle}>{courseName}</Text>
          </View>

          <View style={styles.courseDetails}>
            <View style={styles.detailRow}>
              <User size={16} color={COLORS.darkGray} />
              <Text style={styles.detailText}>{courseOrganizer}</Text>
            </View>
            <View style={styles.detailRow}>
              <Calendar size={16} color={COLORS.darkGray} />
              <Text style={styles.detailText}>{courseDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={16} color={COLORS.darkGray} />
              <Text style={styles.detailText}>{courseLocation}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={16} color={COLORS.darkGray} />
              <Text style={styles.detailText}>{courseDuration}</Text>
            </View>
            <View style={styles.detailRow}>
              <Users size={16} color={COLORS.darkGray} />
              <Text style={styles.detailText}>السعر: {coursePrice}</Text>
            </View>
          </View>
        </View>

        {/* Registration Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>معلومات المتقدم</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>الاسم الكامل *</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={COLORS.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={formData.participantName}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, participantName: text }))}
                placeholder="أدخل اسمك الكامل"
                placeholderTextColor={COLORS.lightGray}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>البريد الإلكتروني *</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color={COLORS.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={formData.participantEmail}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, participantEmail: text }))}
                placeholder="example@email.com"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign={isRTL ? "right" : "left"}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>رقم الهاتف *</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={COLORS.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={formData.participantPhone}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, participantPhone: text }))}
                placeholder="+966 5X XXX XXXX"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="phone-pad"
                textAlign={isRTL ? "right" : "left"}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>طلبات خاصة (اختياري)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.specialRequests}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, specialRequests: text }))}
              placeholder="أي طلبات أو ملاحظات خاصة..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              textAlign={isRTL ? "right" : "left"}
            />
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsCard}>
          <Text style={styles.termsTitle}>شروط وأحكام التسجيل</Text>
          <Text style={styles.termsText}>
            • يجب الحضور في الوقت المحدد{"\n"}• في حالة الإلغاء، يرجى الإشعار قبل 48 ساعة على الأقل{"\n"}• سيتم إرسال
            تأكيد التسجيل عبر البريد الإلكتروني{"\n"}• الرسوم غير قابلة للاسترداد بعد بدء الدورة{"\n"}• يحق للمنظم إلغاء
            الدورة في حالة عدم اكتمال العدد المطلوب
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitRegistrationMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitRegistrationMutation.isPending}
        >
          <Text style={styles.submitButtonText}>
            {submitRegistrationMutation.isPending ? "جاري الإرسال..." : "تأكيد التسجيل"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  courseInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
  },
  courseDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    minHeight: 100,
  },
  termsCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
