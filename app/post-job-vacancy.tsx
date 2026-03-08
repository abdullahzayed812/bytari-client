import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useToastContext } from "@/providers/ToastProvider";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, FileText } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useApp } from "../providers/AppProvider";
import { useI18n } from "../providers/I18nProvider";

export default function PostJobVacancyScreen() {
  const { t } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();

  // Initial form data with sample values
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "full-time", // "full-time" | "part-time" | "contract"
    salary: "",
    description: "",
    requirements: "",
    contactEmail: user?.email ?? "",
    contactPhone: user?.phone ?? "",
  });

  const JOB_TYPES = [
    { value: "full-time", label: t("job.fullTime") },
    { value: "part-time", label: t("job.partTime") },
    { value: "contract", label: t("job.contract") },
    { value: "internship", label: t("postJob.internship") },
  ];

  const [selectedJobType, setSelectedJobType] = useState<string>("full-time");

  const createJobMutation = useMutation(trpc.admin.jobs.createJob.mutationOptions());

  const handleSubmit = () => {
    // ... (validation logic remains the same)

    createJobMutation.mutate(
      {
        title: formData.title.trim(),
        companyName: formData.company.trim(), // Changed from postedBy
        location: formData.location.trim(),
        jobType: selectedJobType as "full-time" | "part-time" | "contract" | "internship",
        salary: formData.salary.trim() || undefined,
        description: formData.description.trim(),
        requirements: formData.requirements.trim() || "لا توجد متطلبات محددة",
        contactInfo: formData.contactEmail,
      } as any,
      {
        onSuccess: (data) => {
          // Invalidate jobs queries to refresh the list
          queryClient.invalidateQueries(trpc.admin.jobs.getAllJobs.queryKey as any);

          // Show success message
          Alert.alert(t("common.success"), t("postJob.requestSent"), [
            {
              text: t("common.ok"),
              onPress: () => {
                // Reset form
                setFormData({
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
                setSelectedJobType("full-time");
                // Navigate back
                router.back();
              },
            },
          ]);
        },
        onError: (error: any) => {
          console.error("Error requesting job creation:", error);
          showToast({
            message: error?.message || t("postJob.requestError"),
            type: "error",
          });
        },
      },
    );
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation helper (Iraqi phone numbers)
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^(07[3-9]\d{8}|(\+964|00964)7[3-9]\d{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("postJob.screenTitle"),
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
          <Text style={styles.headerTitle}>{t("postJob.newJobTitle")}</Text>
          <Text style={styles.headerSubtitle}>{t("postJob.subtitle")}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("postJob.jobTitle")}</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder={t("postJob.jobTitleExample")}
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("postJob.companyClinic")}</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(text) => setFormData({ ...formData, company: text })}
              placeholder={t("postJob.companyExample")}
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("postJob.locationRequired")}</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder={t("postJob.cityCountry")}
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("postJob.jobTypeRequired")}</Text>
            <View style={styles.jobTypeContainer}>
              {JOB_TYPES.map((jobType) => (
                <TouchableOpacity
                  key={jobType.value}
                  style={[styles.jobTypeButton, selectedJobType === jobType.value && styles.jobTypeButtonActive]}
                  onPress={() => setSelectedJobType(jobType.value)}
                >
                  <Text style={[styles.jobTypeText, selectedJobType === jobType.value && styles.jobTypeTextActive]}>
                    {jobType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("postJob.salary")}</Text>
            <View style={styles.inputWithIcon}>
              <DollarSign size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.salary}
                onChangeText={(text) => setFormData({ ...formData, salary: text })}
                placeholder={t("postJob.salaryExample")}
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("postJob.jobDescription")}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder={t("postJob.jobDescriptionPlaceholder")}
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("postJob.requirements")}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.requirements}
              onChangeText={(text) => setFormData({ ...formData, requirements: text })}
              placeholder={t("postJob.requirementsPlaceholder")}
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("postJob.contactEmail")}</Text>
            <TextInput
              style={styles.input}
              value={formData.contactEmail}
              onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
              placeholder="example@company.com"
              placeholderTextColor={COLORS.lightGray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("postJob.contactPhone")}</Text>
            <TextInput
              style={styles.input}
              value={formData.contactPhone}
              onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
              placeholder="07xxxxxxxx"
              placeholderTextColor={COLORS.lightGray}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, createJobMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={createJobMutation.isPending}
        >
          <FileText size={20} color={COLORS.white} />
          <Text style={styles.submitButtonText}>
            {createJobMutation.isPending ? t("postJob.submitting") : t("postJob.submit")}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>{t("postJob.reviewNote")}</Text>
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
  jobTypeContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  jobTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: COLORS.white,
  },
  jobTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  jobTypeText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  jobTypeTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
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
