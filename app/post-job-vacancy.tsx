import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, FileText } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

export default function PostJobVacancyScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    salary: "",
    description: "",
    requirements: "",
    contactEmail: "",
    contactPhone: "",
  });

  const createJobMutation = useMutation(trpc.admin.jobs.createJob.mutationOptions());

  const handleSubmit = () => {
    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createJobMutation.mutate(
      {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        salary: formData.salary,
        description: formData.description,
        requirements: formData.requirements,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
      },
      {
        onSuccess: () => {
          Alert.alert("تم الإرسال", "تم إرسال إعلان الوظيفة للإدارة للمراجعة والموافقة", [
            { text: "موافق", onPress: () => router.back() },
          ]);
        },
        onError: (error) => {
          Alert.alert("فشل الإرسال", error.message);
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "إعلان وظيفة",
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
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Briefcase size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>إعلان وظيفة جديدة</Text>
          <Text style={styles.headerSubtitle}>أضف تفاصيل الوظيفة المطلوبة</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان الوظيفة *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="مثال: طبيب بيطري - عيادة الحيوانات الأليفة"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم الشركة/العيادة *</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(text) => setFormData({ ...formData, company: text })}
              placeholder="مثال: عيادة الرحمة البيطرية"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الموقع *</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="المدينة، المنطقة"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نوع الوظيفة</Text>
            <View style={styles.inputWithIcon}>
              <Clock size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.type}
                onChangeText={(text) => setFormData({ ...formData, type: text })}
                placeholder="دوام كامل / دوام جزئي / مؤقت"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الراتب المتوقع</Text>
            <View style={styles.inputWithIcon}>
              <DollarSign size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.salary}
                onChangeText={(text) => setFormData({ ...formData, salary: text })}
                placeholder="مثال: 8000 - 12000 ريال"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>وصف الوظيفة *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="اكتب وصفاً مفصلاً عن الوظيفة والمهام المطلوبة..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>المتطلبات والمؤهلات</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.requirements}
              onChangeText={(text) => setFormData({ ...formData, requirements: text })}
              placeholder="اذكر المؤهلات والخبرات المطلوبة..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>البريد الإلكتروني للتواصل</Text>
            <TextInput
              style={styles.input}
              value={formData.contactEmail}
              onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
              placeholder="example@company.com"
              placeholderTextColor={COLORS.lightGray}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الهاتف للتواصل</Text>
            <TextInput
              style={styles.input}
              value={formData.contactPhone}
              onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
              placeholder="05xxxxxxxx"
              placeholderTextColor={COLORS.lightGray}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <FileText size={20} color={COLORS.white} />
          <Text style={styles.submitButtonText}>إرسال للمراجعة</Text>
        </TouchableOpacity>

        <Text style={styles.note}>* سيتم مراجعة إعلان الوظيفة من قبل الإدارة قبل نشره في قائمة الوظائف المتاحة</Text>
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
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    gap: 8,
  },
  inputText: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  textArea: {
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  note: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
  },
});
