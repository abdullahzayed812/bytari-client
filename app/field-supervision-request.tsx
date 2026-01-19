import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
  Award,
  Building2,
  Users,
  Send,
} from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "../providers/AppProvider";

interface FieldSupervisionFormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  experience: string;
  qualifications: string;
  previousExperience: string;
  farmName: string;
  farmLocation: string;
  farmCapacity: string;
  requestType: "supervision" | "vet_assignment" | "both";
}

export default function FieldSupervisionRequestScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useApp();

  // Initial form data with sample values
  const [formData, setFormData] = useState<FieldSupervisionFormData>({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 555 123 4567",
    location: "Nairobi, Kenya",
    education: "Bachelor's Degree in Agriculture",
    experience: "5 years",
    qualifications: "Certified Field Supervisor",
    previousExperience: "Worked with small and medium-scale farms",
    farmName: "Green Valley Farm",
    farmLocation: "Kiambu County",
    farmCapacity: "50 acres",
    requestType: "supervision",
  });

  const submitSupervisionMutation = useMutation(trpc.admin.jobs.submitFieldSupervisionRequest.mutationOptions());

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation (Iraqi numbers)
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^(07[3-9]\d{8}|(\+964|00964)7[3-9]\d{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleSubmit = () => {
    // Trim all inputs
    const trimmedData = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      location: formData.location.trim(),
      education: formData.education.trim(),
      experience: formData.experience.trim(),
      qualifications: formData.qualifications.trim(),
      previousExperience: formData.previousExperience.trim(),
      farmName: formData.farmName.trim(),
      farmLocation: formData.farmLocation.trim(),
      farmCapacity: formData.farmCapacity.trim(),
      requestType: formData.requestType,
    };

    // Validation - Required fields
    if (!trimmedData.fullName) {
      Alert.alert("خطأ", "يرجى إدخال الاسم الكامل");
      return;
    }

    if (!trimmedData.email) {
      Alert.alert("خطأ", "يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!isValidEmail(trimmedData.email)) {
      Alert.alert("خطأ", "يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    if (!trimmedData.phone) {
      Alert.alert("خطأ", "يرجى إدخال رقم الهاتف");
      return;
    }

    // if (!isValidPhone(trimmedData.phone)) {
    //   Alert.alert("خطأ", "يرجى إدخال رقم هاتف صحيح (مثال: 07701234567)");
    //   return;
    // }

    if (!trimmedData.farmName) {
      Alert.alert("خطأ", "يرجى إدخال اسم المزرعة");
      return;
    }

    if (!trimmedData.farmLocation) {
      Alert.alert("خطأ", "يرجى إدخال موقع المزرعة");
      return;
    }

    // Map request type to proper format for backend
    const requestTypeMap: Record<string, string> = {
      supervision: "routine_inspection",
      vet_assignment: "emergency",
      both: "consultation",
    };

    // Build description based on form data
    const descriptionParts = [];
    descriptionParts.push(`نوع الطلب: ${getRequestTypeText(trimmedData.requestType)}`);
    if (trimmedData.farmCapacity) {
      descriptionParts.push(`سعة المزرعة: ${trimmedData.farmCapacity} طائر`);
    }
    if (trimmedData.education) {
      descriptionParts.push(`المؤهل: ${trimmedData.education}`);
    }
    if (trimmedData.experience) {
      descriptionParts.push(`الخبرة: ${trimmedData.experience}`);
    }
    if (trimmedData.qualifications) {
      descriptionParts.push(`المؤهلات: ${trimmedData.qualifications}`);
    }
    if (trimmedData.previousExperience) {
      descriptionParts.push(`الخبرة السابقة: ${trimmedData.previousExperience}`);
    }

    const description = descriptionParts.join("\n\n");

    // Submit request
    submitSupervisionMutation.mutate(
      {
        farmName: trimmedData.farmName,
        farmLocation: trimmedData.farmLocation,
        ownerName: trimmedData.fullName,
        ownerPhone: trimmedData.phone,
        ownerEmail: trimmedData.email,
        requestType: requestTypeMap[trimmedData.requestType] as "routine_inspection" | "emergency" | "consultation",
        description: description,
        preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
      } as any,
      {
        onSuccess: (data) => {
          if (data.success) {
            // Invalidate field supervision requests queries
            queryClient.invalidateQueries(trpc.admin.jobs.getFieldSupervisionRequests.queryKey as any);

            const requestTypeText = getRequestTypeText(trimmedData.requestType);

            Alert.alert("تم الإرسال بنجاح", `تم ارسال الطلب وفي حال وجود وظيفة مناسبة لك سيتم التواصل معك`, [
              {
                text: "موافق",
                onPress: () => {
                  // Reset form
                  setFormData({
                    fullName: "",
                    email: "",
                    phone: "",
                    location: "",
                    education: "",
                    experience: "",
                    qualifications: "",
                    previousExperience: "",
                    farmName: "",
                    farmLocation: "",
                    farmCapacity: "",
                    requestType: "supervision",
                  });
                  // Navigate back
                  router.back();
                },
              },
            ]);
          } else {
            Alert.alert("خطأ", data.message || "حدث خطأ أثناء إرسال الطلب");
          }
        },
        onError: (error: any) => {
          console.error("Error submitting supervision request:", error);
          Alert.alert("خطأ", error?.message || "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
        },
      }
    );
  };

  const getRequestTypeText = (type: string): string => {
    switch (type) {
      case "supervision":
        return "إشراف";
      case "vet_assignment":
        return "تعيين طبيب بيطري";
      case "both":
        return "إشراف وتعيين طبيب";
      default:
        return "إشراف";
    }
  };

  const updateFormData = (field: keyof FieldSupervisionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "طلب إشراف حقول",
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
            <Shield size={32} color={COLORS.white} />
          </View>
          <Text style={styles.headerTitle}>طلب إشراف حقول</Text>
          <Text style={styles.headerSubtitle}>قدم طلباً للإشراف على الحقول والمزارع</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الاسم الكامل *</Text>
            <View style={styles.inputWithIcon}>
              <User size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.fullName}
                onChangeText={(text) => updateFormData("fullName", text)}
                placeholder="الاسم الأول والأخير"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>البريد الإلكتروني *</Text>
            <View style={styles.inputWithIcon}>
              <Mail size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.email}
                onChangeText={(text) => updateFormData("email", text)}
                placeholder="example@email.com"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الهاتف *</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.phone}
                onChangeText={(text) => updateFormData("phone", text)}
                placeholder="07xxxxxxxx"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>موقع الإقامة</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.location}
                onChangeText={(text) => updateFormData("location", text)}
                placeholder="المدينة، المنطقة"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          {/* <Text style={styles.sectionTitle}>معلومات المزرعة</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم المزرعة *</Text>
            <View style={styles.inputWithIcon}>
              <Building2 size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.farmName}
                onChangeText={(text) => updateFormData("farmName", text)}
                placeholder="أدخل اسم مزرعة الدواجن"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>موقع المزرعة *</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.farmLocation}
                onChangeText={(text) => updateFormData("farmLocation", text)}
                placeholder="المحافظة - المنطقة"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>سعة المزرعة (عدد الطيور)</Text>
            <View style={styles.inputWithIcon}>
              <Users size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.farmCapacity}
                onChangeText={(text) => updateFormData("farmCapacity", text)}
                placeholder="مثال: 50000"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="numeric"
              />
            </View>
          </View> */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نوع الطلب *</Text>
            <View style={styles.requestTypeContainer}>
              <TouchableOpacity
                style={[styles.requestTypeButton, formData.requestType === "supervision" && styles.activeRequestType]}
                onPress={() => updateFormData("requestType", "supervision")}
              >
                <Text
                  style={[
                    styles.requestTypeText,
                    formData.requestType === "supervision" && styles.activeRequestTypeText,
                  ]}
                >
                  طلب إشراف
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.requestTypeButton,
                  formData.requestType === "vet_assignment" && styles.activeRequestType,
                ]}
                onPress={() => updateFormData("requestType", "vet_assignment")}
              >
                <Text
                  style={[
                    styles.requestTypeText,
                    formData.requestType === "vet_assignment" && styles.activeRequestTypeText,
                  ]}
                >
                  طلب طبيب بيطري
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.requestTypeButton, formData.requestType === "both" && styles.activeRequestType]}
                onPress={() => updateFormData("requestType", "both")}
              >
                <Text style={[styles.requestTypeText, formData.requestType === "both" && styles.activeRequestTypeText]}>
                  كلاهما
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>المؤهلات والخبرة</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>المؤهل العلمي</Text>
            <View style={styles.inputWithIcon}>
              <GraduationCap size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.education}
                onChangeText={(text) => updateFormData("education", text)}
                placeholder="بكالوريوس الطب البيطري، الزراعة، الإنتاج الحيواني..."
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الخبرة في المجال البيطري</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.experience}
              onChangeText={(text) => updateFormData("experience", text)}
              placeholder="اذكر خبراتك في المجال البيطري وسنوات الخبرة..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الشهادات والمؤهلات الإضافية</Text>
            <View style={styles.inputWithIcon}>
              <Award size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.qualifications}
                onChangeText={(text) => updateFormData("qualifications", text)}
                placeholder="شهادات، دورات تدريبية، تراخيص..."
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الخبرة السابقة في إدارة المزارع</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.previousExperience}
              onChangeText={(text) => updateFormData("previousExperience", text)}
              placeholder="اذكر خبراتك السابقة في إدارة أو الإشراف على المزارع والحقول..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitSupervisionMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitSupervisionMutation.isPending}
        >
          {submitSupervisionMutation.isPending ? (
            <>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.submitButtonText}>جاري الإرسال...</Text>
            </>
          ) : (
            <>
              <Send size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>إرسال الطلب</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          سيتم مراجعة طلبك من قبل الادارة وفي حال وجود وظيفة مناسبة لك او اشراف سيتم التواصل معك على البريد الالكتروني
          او عن طريق رقم الهاتف
        </Text>
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
    backgroundColor: "#6f42c1",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
    marginTop: 8,
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
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: "#6f42c1",
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
    paddingHorizontal: 16,
  },
  requestTypeContainer: {
    flexDirection: "row-reverse",
    gap: 8,
    flexWrap: "wrap",
  },
  requestTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    alignItems: "center",
    minWidth: 100,
  },
  activeRequestType: {
    backgroundColor: "#6f42c1",
    borderColor: "#6f42c1",
  },
  requestTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  activeRequestTypeText: {
    color: COLORS.white,
  },
});
