import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import {
  Building2,
  Phone,
  MapPin,
  FileImage,
  Mail,
  Search,
  Stethoscope,
  Pill,
  Camera,
  Crown,
  CheckCircle,
  Clock,
  Plus,
  Calendar,
  Shield,
  Edit3,
  Eye,
  EyeOff,
  Upload,
  FileText,
  Image as ImageIcon,
} from "lucide-react-native";

import { Stack, useRouter } from "expo-router";
import { useApp } from "../providers/AppProvider";
import { trpc } from "../lib/trpc";
import { useMutation } from "@tanstack/react-query";
import { useToastContext } from "@/providers/ToastProvider";

type ClinicRegistration = {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  licenseNumber: string;
  licenseImages: string[];
  images: string[];
  identityImages: string[];
};

type TreatmentCard = {
  id: string;
  clinicName: string;
  date: string;
  diagnosis: string;
  treatment: string;
  prescriptionImage?: string;
  status: "pending" | "approved" | "rejected";
  petId: string;
  ownerId: string;
};

type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "treatment_card" | "follow_up" | "general";
  isRead: boolean;
  createdAt: string;
  data?: any;
};

type Animal = {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  owner: string;
  lastVisit: string;
  status: "active" | "recovered" | "under_treatment";
};

type ClinicData = {
  name: string;
  location: string;
  phone: string;
  totalAnimals: number;
  activePatients: number;
  totalTreatments: number;
  isPremium: boolean;
};

export default function ClinicSystemScreen() {
  const router = useRouter();
  const { hasAdminAccess, isSuperAdmin } = useApp();
  const [activeTab, setActiveTab] = useState<
    "overview" | "register" | "subscription"
  >("overview");
  const [registrationData, setRegistrationData] = useState<ClinicRegistration>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    workingHours: "",
    licenseNumber: "",
    licenseImages: [],
    identityImages: [],
    images: [],
  });
  const [searchId, setSearchId] = useState("");
  const [searchResults, setSearchResults] = useState<Animal[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isClinicApproved, setIsClinicApproved] = useState(false);
  const [isSubscriptionVisible, setIsSubscriptionVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [showMedicalRecordForm, setShowMedicalRecordForm] = useState(false);
  const [showFollowUpConfirmation, setShowFollowUpConfirmation] =
    useState(false);
  const [treatmentData, setTreatmentData] = useState({
    diagnosis: "",
    treatment: "",
    prescriptionImage: "",
  });
  const [followUpReason, setFollowUpReason] = useState("");
  const [medicalRecordData, setMedicalRecordData] = useState({
    diagnosis: "",
    treatment: "",
    prescriptionImage: "",
  });
  const { showToast } = useToastContext();

  const registerClinic = useMutation(trpc.clinics.create.mutationOptions());

  // Load subscription visibility from storage
  useEffect(() => {
    const loadSubscriptionVisibility = async () => {
      try {
        const stored = await AsyncStorage.getItem("clinicSubscriptionVisible");
        setIsSubscriptionVisible(stored === "true");
      } catch (error) {
        console.error("Error loading subscription visibility:", error);
      }
    };
    loadSubscriptionVisibility();
  }, []);

  // Toggle subscription visibility (Admin only)
  const toggleSubscriptionVisibility = async () => {
    const newVisibility = !isSubscriptionVisible;
    setIsSubscriptionVisible(newVisibility);
    try {
      await AsyncStorage.setItem(
        "clinicSubscriptionVisible",
        newVisibility.toString()
      );
      console.log("Subscription visibility updated:", newVisibility);
    } catch (error) {
      console.error("Error saving subscription visibility:", error);
    }
  };

  // Mock clinic data - removed fake data
  const mockClinicData: ClinicData = {
    name: "",
    location: "",
    phone: "",
    totalAnimals: 0,
    activePatients: 0,
    totalTreatments: 0,
    isPremium: false,
  };

  const mockAnimals: Animal[] = [];

  const mockTreatments: TreatmentCard[] = [];

  const handleInputChange = (
    field: keyof ClinicRegistration,
    value: string
  ) => {
    setRegistrationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (type: "licenseImages" | "images") => {
    // Mock image upload - in production, implement actual image picker
    const mockImageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    setRegistrationData((prev) => ({
      ...prev,
      [type]: [...prev[type], mockImageUrl],
    }));
    Alert.alert("تم", "تم رفع الصورة بنجاح");
  };

  const removeImage = (type: "licenseImages" | "images", index: number) => {
    setRegistrationData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleRegisterClinic = async () => {
    if (
      !registrationData.name ||
      !registrationData.phone ||
      !registrationData.address ||
      !registrationData.licenseNumber
    ) {
      showToast({
        type: "error",
        message: "يرجى ملء جميع الحقول المطلوبة.",
      });
      return;
    }
    if (registrationData.licenseImages.length === 0) {
      showToast({
        type: "error",
        message: "صور الترخيص مطلوبة.",
      });
      return;
    }
    if (registrationData.identityImages.length === 0) {
      showToast({
        type: "error",
        message: "صورة الهويه مطلوبة.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Register the clinic
      registerClinic.mutate(registrationData, {
        onSuccess: (data) => {
          showToast({
            type: "success",
            message:
              data?.message ||
              "تم إرسال طلب تسجيل العيادة بنجاح. سيتم مراجعته من قبل الإدارة.",
          });

          // Reset form
          setRegistrationData({
            name: "",
            description: "",
            address: "",
            phone: "",
            email: "",
            workingHours: "",
            licenseNumber: "",
            licenseImages: [],
            images: [],
            identityImages: [],
          });

          // Navigate back after success
          setTimeout(() => {
            router.back();
          }, 1000);
        },
        onError: (error) => {
          console.error("Clinic registration error:", error);
          showToast({
            type: "error",
            message: error.message || "حدث خطأ أثناء تسجيل العيادة",
          });
        },
      });
    } catch (error) {
      Alert.alert(
        "خطأ",
        "حدث خطأ أثناء تسجيل العيادة. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubscribeNow = async () => {
    try {
      // Send subscription request to admin approvals
      const subscriptionRequest = {
        type: "clinic_subscription",
        clinicName: mockClinicData.name,
        clinicLocation: mockClinicData.location,
        clinicPhone: mockClinicData.phone,
        subscriptionType: "premium",
        price: "6 دولار/شهر",
        requestDate: new Date().toISOString(),
        status: "pending",
      };

      // Here you would normally send to backend
      console.log("Clinic subscription request:", subscriptionRequest);

      // Show success message to user
      Alert.alert(
        "تم إرسال الطلب",
        "تم إرسال طلب الاشتراك بنجاح. سيتم التواصل معك قريباً لتفعيل عيادتك.",
        [
          {
            text: "موافق",
            style: "default",
          },
        ]
      );
    } catch (error) {
      console.error("Error sending subscription request:", error);
      Alert.alert(
        "خطأ",
        "حدث خطأ أثناء إرسال طلب الاشتراك. يرجى المحاولة مرة أخرى."
      );
    }
  };

  const handleSearchAnimal = () => {
    if (!searchId.trim()) {
      Alert.alert("خطأ", "يرجى إدخال رقم ID الحيوان");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // Simulate search delay
    setTimeout(() => {
      const results = mockAnimals.filter(
        (animal) =>
          animal.id.toLowerCase().includes(searchId.toLowerCase()) ||
          animal.name.toLowerCase().includes(searchId.toLowerCase())
      );

      setSearchResults(results);
      setIsSearching(false);

      if (results.length === 0) {
        Alert.alert("لا توجد نتائج", "لم يتم العثور على حيوان بهذا الرقم");
      }
    }, 1000);
  };

  const openAnimalProfile = (animal: Animal) => {
    // Navigate to pet details page with the animal ID and clinic access
    router.push({
      pathname: "/pet-details",
      params: { id: animal.id, clinicAccess: "true" },
    });
  };

  const addTreatmentCard = (animal: Animal) => {
    if (!mockClinicData.isPremium) {
      Alert.alert(
        "خدمة مدفوعة",
        "هذه الخدمة متاحة فقط للعيادات المشتركة في الخطة المدفوعة"
      );
      return;
    }
    setSelectedAnimal(animal);
    setShowTreatmentForm(true);
  };

  const addFollowUpRequest = (animal: Animal) => {
    if (!mockClinicData.isPremium) {
      Alert.alert(
        "خدمة مدفوعة",
        "هذه الخدمة متاحة فقط للعيادات المشتركة في الخطة المدفوعة"
      );
      return;
    }
    setSelectedAnimal(animal);
    setShowFollowUpForm(true);
  };

  const addMedicalRecord = (animal: Animal) => {
    if (!mockClinicData.isPremium) {
      Alert.alert(
        "خدمة مدفوعة",
        "هذه الخدمة متاحة فقط للعيادات المشتركة في الخطة المدفوعة"
      );
      return;
    }
    setSelectedAnimal(animal);
    setShowMedicalRecordForm(true);
  };

  const submitTreatmentCard = () => {
    if (!treatmentData.diagnosis || !treatmentData.treatment) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    // Send notification to pet owner
    const notification: Notification = {
      id: Date.now().toString(),
      userId: selectedAnimal?.owner || "",
      title: "كرت صرف علاج جديد",
      message: `قامت عيادة ${mockClinicData.name} بإضافة كرت صرف علاج لحيوانك ${selectedAnimal?.name}`,
      type: "treatment_card",
      isRead: false,
      createdAt: new Date().toISOString(),
      data: {
        clinicName: mockClinicData.name,
        petName: selectedAnimal?.name,
        diagnosis: treatmentData.diagnosis,
        treatment: treatmentData.treatment,
      },
    };

    console.log("Treatment card notification sent:", notification);

    Alert.alert(
      "تم الإرسال",
      "تم إرسال كرت صرف العلاج إلى صاحب الحيوان وفي انتظار الموافقة"
    );

    setShowTreatmentForm(false);
    setTreatmentData({ diagnosis: "", treatment: "", prescriptionImage: "" });
    setSelectedAnimal(null);
  };

  const submitFollowUpRequest = () => {
    if (!followUpReason) {
      Alert.alert("خطأ", "يرجى إدخال سبب المتابعة");
      return;
    }

    // Send notification to pet owner
    const notification: Notification = {
      id: Date.now().toString(),
      userId: selectedAnimal?.owner || "",
      title: "طلب متابعة حالة الحيوان",
      message: `طلبت عيادة ${mockClinicData.name} متابعة حالة حيوانك ${selectedAnimal?.name}`,
      type: "follow_up",
      isRead: false,
      createdAt: new Date().toISOString(),
      data: {
        clinicName: mockClinicData.name,
        petName: selectedAnimal?.name,
        reason: followUpReason,
      },
    };

    console.log("Follow-up notification sent:", notification);

    setShowFollowUpForm(false);
    setFollowUpReason("");
    setShowFollowUpConfirmation(true);
  };

  const renderImageSection = (
    title: string,
    type: "licenseImages" | "images" | "identityImages",
    required: boolean = false
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title} {required && <Text style={styles.required}>*</Text>}
      </Text>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => handleImageUpload(type)}
      >
        <Upload size={20} color={COLORS.primary} />
        <Text style={styles.uploadButtonText}>رفع صورة</Text>
      </TouchableOpacity>

      {registrationData[type].length > 0 && (
        <View style={styles.imageGrid}>
          {registrationData[type].map((imageUrl, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: imageUrl }} style={styles.uploadedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(type, index)}
              >
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const submitMedicalRecord = () => {
    if (!medicalRecordData.diagnosis || !medicalRecordData.treatment) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    // Send notification to pet owner
    const notification: Notification = {
      id: Date.now().toString(),
      userId: selectedAnimal?.owner || "",
      title: "سجل طبي جديد",
      message: `قامت عيادة ${mockClinicData.name} بإضافة سجل طبي لحيوانك ${selectedAnimal?.name}`,
      type: "treatment_card",
      isRead: false,
      createdAt: new Date().toISOString(),
      data: {
        clinicName: mockClinicData.name,
        petName: selectedAnimal?.name,
        diagnosis: medicalRecordData.diagnosis,
        treatment: medicalRecordData.treatment,
      },
    };

    console.log("Medical record notification sent:", notification);

    Alert.alert(
      "تم الإرسال",
      "تم إرسال السجل الطبي إلى صاحب الحيوان وفي انتظار الموافقة"
    );

    setShowMedicalRecordForm(false);
    setMedicalRecordData({
      diagnosis: "",
      treatment: "",
      prescriptionImage: "",
    });
    setSelectedAnimal(null);
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.systemHeader}>
        <Building2 size={48} color={COLORS.primary} />
        <Text style={styles.systemTitle}>🏥 نظام العيادات (عيادة بيطرية)</Text>
      </View>

      <View style={styles.featureSection}>
        <Text style={styles.sectionTitle}>📋 تسجيل العيادة:</Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• نموذج خاص يتضمن:</Text>
          <Text style={styles.subFeatureItem}>○ اسم العيادة</Text>
          <Text style={styles.subFeatureItem}>○ رقم الهاتف</Text>
          <Text style={styles.subFeatureItem}>○ الوصف</Text>
          <Text style={styles.subFeatureItem}>○ العنوان</Text>
          <Text style={styles.subFeatureItem}>○ البريد الإلكتروني</Text>
          <Text style={styles.subFeatureItem}>○ ساعات العمل</Text>
          <Text style={styles.subFeatureItem}>○ رقم الترخيص</Text>
          <Text style={styles.subFeatureItem}>○ صور الترخيص</Text>
          <Text style={styles.subFeatureItem}>○ صور العيادة</Text>
        </View>
      </View>

      <View style={styles.featureSection}>
        <Text style={styles.sectionTitle}>
          ✅ بعد الموافقة من المشرف، تُفعّل الصلاحيات التالية:
        </Text>
      </View>

      <View style={styles.featureSection}>
        <Text style={styles.sectionTitle}>
          💊 كرت صرف العلاج (للعيادات المدفوعة فقط):
        </Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>
            • بعد اشتراك العيادة بالخطة المدفوعة، يظهر لها خيار إضافة كرت صرف
            علاج
          </Text>
          <Text style={styles.featureItem}>
            • يتم تعبئة اسم العيادة والتاريخ تلقائياً من النظام
          </Text>
          <Text style={styles.featureItem}>• تقوم العيادة فقط بكتابة:</Text>
          <Text style={styles.subFeatureItem}>○ التشخيص</Text>
          <Text style={styles.subFeatureItem}>○ العلاج</Text>
          <Text style={styles.featureItem}>
            • إمكانية رفع صورة الوصفة/التقرير الطبي وإرفاقها بالكرت مباشرة
          </Text>
          <Text style={styles.featureItem}>
            • يظهر الكرت في سجل الحيوان الخاص بالمستخدم مع الصورة المرفقة
          </Text>
        </View>
      </View>

      {/* Admin Controls */}
      {(hasAdminAccess || isSuperAdmin) && (
        <View style={styles.adminControls}>
          <View style={styles.adminHeader}>
            <Text style={styles.adminTitle}>🔧 إعدادات الإدارة</Text>
            <TouchableOpacity
              style={styles.editToggleButton}
              onPress={() => setIsEditMode(!isEditMode)}
            >
              <Edit3 size={16} color={COLORS.white} />
              <Text style={styles.editToggleText}>
                {isEditMode ? "إنهاء التعديل" : "تعديل"}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditMode && (
            <View style={styles.adminActions}>
              <TouchableOpacity
                style={styles.visibilityToggleButton}
                onPress={toggleSubscriptionVisibility}
              >
                {isSubscriptionVisible ? (
                  <EyeOff size={16} color={COLORS.white} />
                ) : (
                  <Eye size={16} color={COLORS.white} />
                )}
                <Text style={styles.visibilityToggleText}>
                  {isSubscriptionVisible ? "إخفاء الاشتراك" : "إظهار الاشتراك"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Subscription Plans - Only show if visible */}
      {isSubscriptionVisible && (
        <View style={styles.subscriptionPlansOverview}>
          <Text style={styles.sectionTitle}>💡 خطة الاشتراك للعيادات:</Text>
          <View style={[styles.planDetailCard, styles.premiumPlanDetail]}>
            <View style={styles.premiumHeader}>
              <Crown size={24} color={COLORS.primary} />
              <Text style={styles.planDetailTitle}>عيادة Premium</Text>
            </View>
            <View style={styles.planFeatures}>
              <View style={styles.featureRow}>
                <CheckCircle size={16} color={COLORS.success} />
                <Text style={styles.planFeatureText}>بحث عبر ID لأي حيوان</Text>
              </View>
              <View style={styles.featureRow}>
                <CheckCircle size={16} color={COLORS.success} />
                <Text style={styles.planFeatureText}>ظهور في قسم العيادات</Text>
              </View>
              <View style={styles.featureRow}>
                <CheckCircle size={16} color={COLORS.success} />
                <Text style={styles.planFeatureText}>استقبال رسائل إدارية</Text>
              </View>
              <View style={styles.featureRow}>
                <CheckCircle size={16} color={COLORS.success} />
                <Text style={styles.planFeatureText}>كروت صرف العلاج</Text>
              </View>
              <View style={styles.featureRow}>
                <CheckCircle size={16} color={COLORS.success} />
                <Text style={styles.planFeatureText}>إضافة السجلات الطبية</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>6 دولار/شهر</Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => setActiveTab("register")}
            >
              <Text style={styles.buttonText}>اشترك الآن</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit Mode Indicator */}
      {(hasAdminAccess || isSuperAdmin) && isEditMode && (
        <View style={styles.editModeIndicator}>
          <Edit3 size={16} color={COLORS.primary} />
          <Text style={styles.editModeText}>وضع التعديل مفعل</Text>
        </View>
      )}
    </View>
  );

  const renderRegistration = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>📋 تسجيل العيادة</Text>

      <Text style={styles.description}>
        املأ النموذج أدناه لتسجيل عيادتك البيطرية. سيتم مراجعة طلبك من قبل
        الإدارة قبل التفعيل.
      </Text>

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          المعلومات الأساسية <Text style={styles.required}>*</Text>
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>اسم العيادة *</Text>
          <TextInput
            style={styles.input}
            value={registrationData.name}
            onChangeText={(value) => handleInputChange("name", value)}
            placeholder="أدخل اسم العيادة"
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>الوصف</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={registrationData.description}
            onChangeText={(value) => handleInputChange("description", value)}
            placeholder="وصف مختصر عن العيادة وخدماتها"
            placeholderTextColor={COLORS.darkGray}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          معلومات الاتصال <Text style={styles.required}>*</Text>
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>العنوان *</Text>
          <View style={styles.inputWithIcon}>
            <MapPin size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.inputWithIconText}
              value={registrationData.address}
              onChangeText={(value) => handleInputChange("address", value)}
              placeholder="العنوان الكامل للعيادة"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>رقم الهاتف *</Text>
          <View style={styles.inputWithIcon}>
            <Phone size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.inputWithIconText}
              value={registrationData.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              placeholder="رقم الهاتف"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>البريد الإلكتروني</Text>
          <View style={styles.inputWithIcon}>
            <Mail size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.inputWithIconText}
              value={registrationData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="البريد الإلكتروني"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ساعات العمل</Text>
          <View style={styles.inputWithIcon}>
            <Clock size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.inputWithIconText}
              value={registrationData.workingHours}
              onChangeText={(value) => handleInputChange("workingHours", value)}
              placeholder="مثال: السبت - الخميس: 8:00 ص - 6:00 م"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>
        </View>
      </View>

      {/* License Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          معلومات الترخيص <Text style={styles.required}>*</Text>
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>رقم الترخيص *</Text>
          <View style={styles.inputWithIcon}>
            <FileText size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.inputWithIconText}
              value={registrationData.licenseNumber}
              onChangeText={(value) =>
                handleInputChange("licenseNumber", value)
              }
              placeholder="رقم ترخيص العيادة البيطرية"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>
        </View>
      </View>

      {/* Document Uploads */}
      {renderImageSection("صور الترخيص", "licenseImages", true)}
      {renderImageSection("صور العيادة", "images")}
      {renderImageSection("صورة الهوية", "identityImages", true)}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={handleRegisterClinic}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "جاري الإرسال..." : "إرسال طلب التسجيل"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        ملاحظة: سيتم مراجعة طلبك خلال 2-3 أيام عمل. ستصلك رسالة تأكيد عند
        الموافقة على الطلب.
      </Text>
    </View>
  );

  const renderDashboard = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>🩺 لوحة العيادة</Text>

      {!isClinicApproved ? (
        <View style={styles.pendingApproval}>
          <Clock size={48} color={COLORS.warning} />
          <Text style={styles.pendingText}>في انتظار موافقة المشرف</Text>
          <Text style={styles.pendingSubtext}>
            سيتم تفعيل الصلاحيات بعد الموافقة
          </Text>
        </View>
      ) : (
        <>
          {/* Clinic Info Card */}
          <View style={styles.clinicInfoCard}>
            <View style={styles.clinicHeader}>
              <Building2 size={32} color={COLORS.primary} />
              <View style={styles.clinicDetails}>
                <Text style={styles.clinicName}>{mockClinicData.name}</Text>
                <Text style={styles.clinicLocation}>
                  {mockClinicData.location}
                </Text>
                <Text style={styles.clinicPhone}>{mockClinicData.phone}</Text>
              </View>
              {mockClinicData.isPremium && (
                <View style={styles.premiumBadge}>
                  <Crown size={16} color={COLORS.primary} />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {mockClinicData.totalAnimals}
                </Text>
                <Text style={styles.statLabel}>إجمالي الحيوانات</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {mockClinicData.activePatients}
                </Text>
                <Text style={styles.statLabel}>المرضى النشطون</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {mockClinicData.totalTreatments}
                </Text>
                <Text style={styles.statLabel}>العلاجات المضافة</Text>
              </View>
            </View>
          </View>

          <View style={styles.searchSection}>
            <Text style={styles.sectionTitle}>🔍 البحث عن حيوان</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="أدخل رقم ID الحيوان أو اسمه"
                value={searchId}
                onChangeText={(text) => {
                  setSearchId(text);
                  if (!text.trim()) {
                    setSearchResults([]);
                    setHasSearched(false);
                  }
                }}
                textAlign="right"
                onSubmitEditing={handleSearchAnimal}
              />
              <TouchableOpacity
                style={[
                  styles.searchButton,
                  isSearching && styles.searchButtonDisabled,
                ]}
                onPress={handleSearchAnimal}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Text style={styles.searchButtonText}>...</Text>
                ) : (
                  <Search size={20} color={COLORS.white} />
                )}
              </TouchableOpacity>
            </View>

            {/* Search Results */}
            {hasSearched && (
              <View style={styles.searchResultsSection}>
                <Text style={styles.searchResultsTitle}>
                  {searchResults.length > 0
                    ? `نتائج البحث (${searchResults.length})`
                    : "لا توجد نتائج"}
                </Text>
                {searchResults.map((animal) => (
                  <TouchableOpacity
                    key={animal.id}
                    style={styles.searchResultCard}
                    onPress={() => openAnimalProfile(animal)}
                  >
                    <View style={styles.animalInfo}>
                      <View style={styles.animalHeader}>
                        <Text
                          style={[
                            styles.animalName,
                            styles.clickableAnimalName,
                          ]}
                        >
                          {animal.name}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            styles[`status_${animal.status}`],
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {animal.status === "active"
                              ? "نشط"
                              : animal.status === "recovered"
                              ? "متعافي"
                              : "تحت العلاج"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.animalDetails}>
                        {animal.type} - {animal.breed}
                      </Text>
                      <Text style={styles.animalDetails}>
                        العمر: {animal.age}
                      </Text>
                      <Text style={styles.animalDetails}>
                        المالك: {animal.owner}
                      </Text>
                      <Text style={styles.animalDetails}>
                        آخر زيارة: {animal.lastVisit}
                      </Text>
                    </View>
                    <Text style={styles.animalId}>#{animal.id}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Recent Animals */}
          <View style={styles.recentAnimalsSection}>
            <Text style={styles.sectionTitle}>🐾 الحيوانات الأخيرة</Text>
            {mockAnimals.map((animal) => (
              <TouchableOpacity
                key={animal.id}
                style={styles.animalCard}
                onPress={() => openAnimalProfile(animal)}
              >
                <View style={styles.animalInfo}>
                  <View style={styles.animalHeader}>
                    <Text
                      style={[styles.animalName, styles.clickableAnimalName]}
                    >
                      {animal.name}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        styles[`status_${animal.status}`],
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {animal.status === "active"
                          ? "نشط"
                          : animal.status === "recovered"
                          ? "متعافي"
                          : "تحت العلاج"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.animalDetails}>
                    {animal.type} - {animal.breed}
                  </Text>
                  <Text style={styles.animalDetails}>العمر: {animal.age}</Text>
                  <Text style={styles.animalDetails}>
                    المالك: {animal.owner}
                  </Text>
                  <Text style={styles.animalDetails}>
                    آخر زيارة: {animal.lastVisit}
                  </Text>
                </View>
                <Text style={styles.animalId}>#{animal.id}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Treatments */}
          <View style={styles.recentTreatmentsSection}>
            <Text style={styles.sectionTitle}>💊 العلاجات الأخيرة</Text>
            {mockTreatments.map((treatment) => (
              <View key={treatment.id} style={styles.treatmentCard}>
                <View style={styles.treatmentHeader}>
                  <Text style={styles.treatmentDate}>{treatment.date}</Text>
                  <Text style={styles.treatmentId}>#{treatment.id}</Text>
                </View>
                <Text style={styles.treatmentDiagnosis}>
                  التشخيص: {treatment.diagnosis}
                </Text>
                <Text style={styles.treatmentText}>
                  العلاج: {treatment.treatment}
                </Text>
                {treatment.prescriptionImage && (
                  <View style={styles.prescriptionImageContainer}>
                    <Camera size={16} color={COLORS.primary} />
                    <Text style={styles.prescriptionImageText}>
                      صورة الوصفة مرفقة
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>الإجراءات المتاحة</Text>
          </View>

          {/* Animal Profile Modal - Now shows clinic-specific actions */}
          {selectedAnimal &&
            !showTreatmentForm &&
            !showFollowUpForm &&
            !showMedicalRecordForm && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>الملف الشخصي للحيوان</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setSelectedAnimal(null)}
                    >
                      <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalBody}>
                    <View style={styles.animalProfileCard}>
                      <TouchableOpacity
                        onPress={() => openAnimalProfile(selectedAnimal)}
                      >
                        <Text
                          style={[
                            styles.animalProfileName,
                            styles.clickableAnimalName,
                          ]}
                        >
                          {selectedAnimal.name}
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.animalProfileType}>
                        {selectedAnimal.type} - {selectedAnimal.breed}
                      </Text>
                      <Text style={styles.animalProfileDetails}>
                        العمر: {selectedAnimal.age}
                      </Text>
                      <Text style={styles.animalProfileDetails}>
                        المالك: {selectedAnimal.owner}
                      </Text>
                      <Text style={styles.animalProfileDetails}>
                        آخر زيارة: {selectedAnimal.lastVisit}
                      </Text>
                      <Text style={styles.animalProfileDetails}>
                        رقم المعرف: #{selectedAnimal.id}
                      </Text>

                      {/* Follow Pet Button - Only for subscribed clinics */}
                      {mockClinicData.isPremium && (
                        <TouchableOpacity
                          style={styles.followPetButton}
                          onPress={() => addFollowUpRequest(selectedAnimal)}
                        >
                          <Stethoscope size={20} color={COLORS.white} />
                          <Text style={styles.actionButtonText}>
                            متابعة الحالة
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Clinic Actions - Only for subscribed clinics */}
                      {mockClinicData.isPremium && (
                        <View style={styles.clinicActionsContainer}>
                          <Text style={styles.clinicActionsTitle}>
                            الإجراءات المتاحة للعيادات المشتركة:
                          </Text>

                          <View style={styles.clinicActionsList}>
                            <TouchableOpacity
                              style={styles.clinicActionButton}
                              onPress={() => addMedicalRecord(selectedAnimal)}
                            >
                              <Plus size={16} color={COLORS.white} />
                              <Text style={styles.clinicActionText}>
                                إضافة سجل طبي
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.clinicActionButton}
                              onPress={() => {
                                Alert.alert(
                                  "إضافة تطعيم",
                                  "سيتم إضافة تطعيم جديد للحيوان"
                                );
                              }}
                            >
                              <Shield size={16} color={COLORS.white} />
                              <Text style={styles.clinicActionText}>
                                إضافة تطعيم
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.clinicActionButton}
                              onPress={() => {
                                Alert.alert(
                                  "إضافة تذكير",
                                  "سيتم إضافة تذكير جديد للحيوان"
                                );
                              }}
                            >
                              <Calendar size={16} color={COLORS.white} />
                              <Text style={styles.clinicActionText}>
                                إضافة تذكير
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  </ScrollView>
                </View>
              </View>
            )}

          {/* Treatment Card Form Modal */}
          {showTreatmentForm && selectedAnimal && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>كرت صرف العلاج</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setShowTreatmentForm(false);
                      setTreatmentData({
                        diagnosis: "",
                        treatment: "",
                        prescriptionImage: "",
                      });
                    }}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>اسم الحيوان</Text>
                    <Text style={styles.formValue}>{selectedAnimal.name}</Text>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>اسم العيادة</Text>
                    <Text style={styles.formValue}>{mockClinicData.name}</Text>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>التاريخ</Text>
                    <Text style={styles.formValue}>
                      {new Date().toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>التشخيص *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="أدخل التشخيص"
                      value={treatmentData.diagnosis}
                      onChangeText={(text) =>
                        setTreatmentData({ ...treatmentData, diagnosis: text })
                      }
                      textAlign="right"
                      multiline
                    />
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>العلاج *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="أدخل العلاج المطلوب"
                      value={treatmentData.treatment}
                      onChangeText={(text) =>
                        setTreatmentData({ ...treatmentData, treatment: text })
                      }
                      textAlign="right"
                      multiline
                    />
                  </View>

                  <TouchableOpacity style={styles.imageUploadButton}>
                    <Camera size={20} color={COLORS.primary} />
                    <Text style={styles.imageUploadButtonText}>
                      رفع صورة الوصفة (اختياري)
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.formActions}>
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={submitTreatmentCard}
                    >
                      <Text style={styles.buttonText}>إرسال كرت العلاج</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          )}

          {/* Follow-up Request Form Modal */}
          {showFollowUpForm && selectedAnimal && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>طلب متابعة حالة الحيوان</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setShowFollowUpForm(false);
                      setFollowUpReason("");
                      setSelectedAnimal(null);
                    }}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>اسم الحيوان</Text>
                    <Text style={styles.formValue}>{selectedAnimal.name}</Text>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>اسم العيادة</Text>
                    <Text style={styles.formValue}>{mockClinicData.name}</Text>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>التاريخ</Text>
                    <Text style={styles.formValue}>
                      {new Date().toLocaleDateString("ar-SA")}
                    </Text>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>سبب المتابعة *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="أدخل سبب طلب المتابعة"
                      value={followUpReason}
                      onChangeText={setFollowUpReason}
                      textAlign="right"
                      multiline
                    />
                  </View>

                  <View style={styles.formActions}>
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={submitFollowUpRequest}
                    >
                      <Text style={styles.buttonText}>إرسال طلب المتابعة</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          )}

          {/* Follow-up Confirmation Modal */}
          {showFollowUpConfirmation && (
            <View style={styles.modalOverlay}>
              <View style={styles.confirmationModalContent}>
                <View style={styles.confirmationHeader}>
                  <Text style={styles.confirmationTitle}>تم الإرسال</Text>
                </View>

                <View style={styles.confirmationBody}>
                  <Text style={styles.confirmationMessage}>
                    تم إرسال طلب المتابعة إلى صاحب الحيوان{"\n"}
                    وفي انتظار الموافقة
                  </Text>

                  <TouchableOpacity
                    style={styles.confirmationButton}
                    onPress={() => {
                      setShowFollowUpConfirmation(false);
                      setSelectedAnimal(null);
                    }}
                  >
                    <Text style={styles.confirmationButtonText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Medical Record Form Modal */}
          {showMedicalRecordForm && selectedAnimal && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>إضافة سجل طبي جديد</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setShowMedicalRecordForm(false);
                      setMedicalRecordData({
                        diagnosis: "",
                        treatment: "",
                        prescriptionImage: "",
                      });
                    }}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>اسم الحيوان</Text>
                    <Text style={styles.formValue}>{selectedAnimal.name}</Text>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>اسم العيادة</Text>
                    <Text style={styles.formValue}>{mockClinicData.name}</Text>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>التاريخ</Text>
                    <Text style={styles.formValue}>
                      {new Date().toLocaleDateString("ar-SA")}
                    </Text>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>التشخيص *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="أدخل التشخيص"
                      value={medicalRecordData.diagnosis}
                      onChangeText={(text) =>
                        setMedicalRecordData({
                          ...medicalRecordData,
                          diagnosis: text,
                        })
                      }
                      textAlign="right"
                      multiline
                    />
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>العلاج *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="أدخل العلاج المطلوب"
                      value={medicalRecordData.treatment}
                      onChangeText={(text) =>
                        setMedicalRecordData({
                          ...medicalRecordData,
                          treatment: text,
                        })
                      }
                      textAlign="right"
                      multiline
                    />
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>ملاحظات إضافية</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="أدخل ملاحظات إضافية (اختياري)"
                      textAlign="right"
                      multiline
                    />
                  </View>

                  <TouchableOpacity style={styles.prescriptionUploadSection}>
                    <Camera size={20} color={COLORS.primary} />
                    <Text style={styles.prescriptionUploadLabel}>
                      رفع صورة الوصفة (اختياري)
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.formActions}>
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={submitMedicalRecord}
                    >
                      <Text style={styles.buttonText}>إرسال السجل الطبي</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "نظام العيادات",
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black, fontWeight: "bold" },
          headerTitleAlign: "center",
        }}
      />
      <View style={styles.container}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "overview" && styles.activeTab]}
            onPress={() => setActiveTab("overview")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "overview" && styles.activeTabText,
              ]}
            >
              نظرة عامة
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "register" && styles.activeTab]}
            onPress={() => setActiveTab("register")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "register" && styles.activeTabText,
              ]}
            >
              التسجيل
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "register" && renderRegistration()}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  systemHeader: {
    alignItems: "center",
    marginBottom: 24,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  systemTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginTop: 12,
  },
  featureSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "right",
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 8,
    textAlign: "right",
  },
  featureList: {
    marginLeft: 8,
  },
  featureItem: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "right",
    lineHeight: 20,
  },
  subFeatureItem: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 2,
    marginLeft: 16,
    textAlign: "right",
    lineHeight: 18,
  },
  subscriptionPlans: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  premiumPlan: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "center",
  },
  planFeature: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 4,
  },
  actionButtons: {
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 24,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  description: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  section: {
    marginBottom: 30,
  },
  required: {
    color: COLORS.error,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
  },
  inputWithIconText: {
    flex: 1,
    padding: 15,
    paddingLeft: 10,
    fontSize: 16,
    color: COLORS.black,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  imageUpload: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  imageUploadText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "500",
  },
  note: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  pendingApproval: {
    alignItems: "center",
    padding: 40,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 40,
  },
  pendingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.warning,
    marginTop: 16,
    textAlign: "center",
  },
  pendingSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 8,
    textAlign: "center",
  },
  searchSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: "right",
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  searchResultsSection: {
    marginTop: 20,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "right",
  },
  searchResultCard: {
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  searchResultActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    justifyContent: "flex-end",
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  premiumActionButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  actionsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  disabledCard: {
    opacity: 0.6,
  },
  actionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
    textAlign: "right",
  },
  actionDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  disabledText: {
    color: COLORS.gray,
  },
  subscriptionPlansOverview: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscriptionOptions: {
    gap: 20,
  },
  planDetailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumPlanDetail: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  planDetailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
  },
  planFeatures: {
    marginVertical: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    justifyContent: "flex-end",
  },
  planFeatureText: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: "right",
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginVertical: 16,
  },
  upgradeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  clinicInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clinicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 16,
  },
  clinicDetails: {
    flex: 1,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 4,
  },
  clinicLocation: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 2,
  },
  clinicPhone: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: "right",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.black,
    marginTop: 4,
    textAlign: "center",
  },
  recentAnimalsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animalCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  animalInfo: {
    flex: 1,
  },
  animalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  animalName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  clickableAnimalName: {
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status_active: {
    backgroundColor: "#E8F5E8",
  },
  status_recovered: {
    backgroundColor: "#E3F2FD",
  },
  status_under_treatment: {
    backgroundColor: "#FFF3E0",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.black,
  },
  animalDetails: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 2,
    textAlign: "right",
  },
  animalId: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "bold",
    marginLeft: 16,
  },
  recentTreatmentsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  treatmentCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  treatmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  treatmentDate: {
    fontSize: 14,
    color: COLORS.black,
  },
  treatmentId: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  treatmentDiagnosis: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "right",
  },
  treatmentText: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  prescriptionImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "flex-end",
  },
  prescriptionImageText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.darkGray,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 20,
  },
  animalProfileCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  animalProfileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  animalProfileType: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: "right",
  },
  animalProfileDetails: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "right",
  },
  animalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    justifyContent: "center",
  },
  followUpButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  treatmentButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  formValue: {
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    textAlign: "right",
  },
  formInput: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    minHeight: 80,
    textAlignVertical: "top",
  },
  imageUploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    gap: 8,
  },
  imageUploadButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  formActions: {
    marginTop: 16,
  },
  followPetButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  clinicActionsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  clinicActionsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "center",
  },
  clinicActionsList: {
    gap: 8,
  },
  clinicActionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clinicActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  confirmationModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: "85%",
    maxWidth: 400,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmationHeader: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  confirmationBody: {
    padding: 24,
    alignItems: "center",
  },
  confirmationMessage: {
    fontSize: 16,
    color: COLORS.black,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  confirmationButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    minWidth: 80,
  },
  confirmationButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  // Admin Controls Styles
  adminControls: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#FF6B35",
  },
  adminHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
  },
  editToggleButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editToggleText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  adminActions: {
    gap: 8,
  },
  visibilityToggleButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  visibilityToggleText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  editModeIndicator: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editModeText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "bold",
  },

  prescriptionUploadSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    gap: 8,
  },
  prescriptionUploadLabel: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
    gap: 10,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
