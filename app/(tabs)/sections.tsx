import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image, Alert } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { useRouter, useFocusEffect } from "expo-router";
import AdvertisementCarousel from "../../components/AdvertisementCarousel";
import {
  MessageCircle,
  Calendar,
  Lightbulb,
  Heart,
  Bell,
  Award,
  FileText,
  Settings,
  Phone,
  Building2,
  BookOpen,
  Users,
  Briefcase,
  GraduationCap,
  UserCheck,
  Send,
  Camera,
  X,
  ArrowRight,
  Hospital,
  Edit,
  Plus,
  Trash2,
  Eye,
  Palette,
} from "lucide-react-native";
import { trpc } from "../../lib/trpc";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";

interface SectionItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  badgeCount?: number;
  hidden?: boolean;
}

export default function SectionsScreen() {
  const { isRTL } = useI18n();
  const { userMode, user, hasAdminAccess, isSuperAdmin } = useApp();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Management mode states
  const [isManagementMode, setIsManagementMode] = useState(false);
  const [showAddSectionForm, setShowAddSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionColor, setNewSectionColor] = useState("#10B981");
  const [newSectionRoute, setNewSectionRoute] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("MessageCircle");

  // Inquiry form states
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [newInquiry, setNewInquiry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("عام");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<string | null>(null);
  const [, setFileType] = useState<"image" | "video" | null>(null);

  const categories = ["عام", "أمراض", "تغذية", "جراحة", "طوارئ"];
  const createInquiryMutation = useMutation(trpc.inquiries.create.mutationOptions());

  // Scroll to top when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  // Mock data for notifications and messages count
  const [consultationsCount, setConsultationsCount] = useState<number>(8);
  const [appointmentsCount, setAppointmentsCount] = useState<number>(3);
  const [remindersCount, setRemindersCount] = useState<number>(2);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update counts to simulate real-time data
      if (Math.random() > 0.8) {
        setConsultationsCount((prev) => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
      }
      if (Math.random() > 0.8) {
        setAppointmentsCount((prev) => Math.max(0, prev + Math.floor(Math.random() * 2) - 1));
      }
      if (Math.random() > 0.8) {
        setRemindersCount((prev) => Math.max(0, prev + Math.floor(Math.random() * 2) - 1));
      }
    }, 20000); // Update every 20 seconds

    return () => clearInterval(interval);
  }, []);

  // Pet owner sections
  const petOwnerSections: SectionItem[] = [
    {
      id: "consultations",
      title: "الاستشارات",
      icon: <MessageCircle size={32} color={COLORS.white} />,
      color: "#10B981",
      route: "/consultation",
      badgeCount: consultationsCount,
    },
    {
      id: "appointments",
      title: "المواعيد",
      icon: <Calendar size={32} color={COLORS.white} />,
      color: "#3B82F6",
      route: "/appointments",
      badgeCount: appointmentsCount,
    },
    {
      id: "clinics",
      title: "العيادات",
      icon: <Hospital size={32} color={COLORS.white} />,
      color: "#0EA5E9",
      route: "/clinics-list",
    },
    {
      id: "tips",
      title: "أفضل النصائح",
      icon: <Lightbulb size={32} color={COLORS.white} />,
      color: "#F59E0B",
      route: "/tips-list",
    },
    {
      id: "lost-pets",
      title: "الحيوانات المفقودة",
      icon: <Heart size={32} color={COLORS.white} />,
      color: "#EF4444",
      route: "/lost-pets-list",
    },

    {
      id: "reminders",
      title: "التذكيرات",
      icon: <Bell size={32} color={COLORS.white} />,
      color: "#F59E0B",
      route: "/reminders",
      badgeCount: remindersCount,
    },
    {
      id: "premium",
      title: "العضوية المميزة",
      icon: <Award size={32} color={COLORS.white} />,
      color: "#10B981",
      route: "/premium-subscription",
      hidden: true,
    },
    {
      id: "settings",
      title: "الإعدادات",
      icon: <Settings size={32} color={COLORS.white} />,
      color: "#6B7280",
      route: "/settings",
    },
    {
      id: "contact-us",
      title: "تواصل معنا",
      icon: <Phone size={32} color={COLORS.white} />,
      color: "#10B981",
      route: "/contact-us",
    },
  ];

  // Veterinarian sections
  const veterinarianSections: SectionItem[] = [
    {
      id: "inquiries",
      title: "الاستفسارات",
      icon: <MessageCircle size={32} color={COLORS.white} />,
      color: "#10B981",
      route: "inquiries",
      badgeCount: consultationsCount,
    },
    {
      id: "appointments",
      title: "المواعيد",
      icon: <Calendar size={32} color={COLORS.white} />,
      color: "#3B82F6",
      route: "/appointments",
      badgeCount: appointmentsCount,
    },
    {
      id: "magazine",
      title: "المجلة البيطرية",
      icon: <FileText size={32} color={COLORS.white} />,
      color: "#8B5CF6",
      route: "/vet-magazine",
    },
    {
      id: "books",
      title: "الكتب البيطرية",
      icon: <BookOpen size={32} color={COLORS.white} />,
      color: "#F59E0B",
      route: "/vet-books",
    },
    {
      id: "union",
      title: "نقابة الأطباء البيطريين",
      icon: <Users size={32} color={COLORS.white} />,
      color: "#EF4444",
      route: "/vet-union",
    },
    {
      id: "hospitals",
      title: "المستشفيات البيطرية العراقية",
      icon: <Hospital size={32} color={COLORS.white} />,
      color: "#0EA5E9",
      route: "/vet-hospitals",
    },
    {
      id: "offices",
      title: "المذاخر البيطرية",
      icon: <Building2 size={32} color={COLORS.white} />,
      color: "#6B7280",
      route: "/vet-stores-list",
    },
    {
      id: "premium",
      title: "العضوية المميزة",
      icon: <Award size={32} color={COLORS.white} />,
      color: "#10B981",
      route: "/premium-subscription",
      hidden: true,
    },
    {
      id: "job-vacancies",
      title: "الوظائف الشاغرة",
      icon: <Briefcase size={32} color={COLORS.white} />,
      color: "#DC2626",
      route: "/job-vacancies",
    },
    {
      id: "lessons-lectures",
      title: "دروس ومحاضرات",
      icon: <GraduationCap size={32} color={COLORS.white} />,
      color: "#7C3AED",
      route: "/lessons-lectures",
    },
    {
      id: "courses-seminars",
      title: "دورات وندوات",
      icon: <UserCheck size={32} color={COLORS.white} />,
      color: "#059669",
      route: "/courses-seminars",
    },
    {
      id: "settings",
      title: "الإعدادات",
      icon: <Settings size={32} color={COLORS.white} />,
      color: "#6B7280",
      route: "/settings",
    },
    {
      id: "contact-us",
      title: "تواصل معنا",
      icon: <Phone size={32} color={COLORS.white} />,
      color: "#10B981",
      route: "/contact-us",
    },
  ];

  const [customSections, setCustomSections] = useState<SectionItem[]>([]);
  const [hiddenSections, setHiddenSections] = useState<string[]>(["premium"]);

  // Filter out hidden sections (but show all in management mode)
  const baseSections = userMode === "veterinarian" ? veterinarianSections : petOwnerSections;
  const visibleBaseSections = isManagementMode
    ? baseSections // Show all sections in management mode
    : baseSections.filter((section) => !hiddenSections.includes(section.id));
  const sections = [...visibleBaseSections, ...customSections];

  const availableColors = [
    "#10B981",
    "#3B82F6",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#0EA5E9",
    "#6B7280",
    "#DC2626",
    "#059669",
    "#7C3AED",
  ];

  const availableIcons = [
    { name: "MessageCircle", component: MessageCircle },
    { name: "Calendar", component: Calendar },
    { name: "Lightbulb", component: Lightbulb },
    { name: "Heart", component: Heart },
    { name: "Bell", component: Bell },
    { name: "Award", component: Award },
    { name: "FileText", component: FileText },
    { name: "Settings", component: Settings },
    { name: "Phone", component: Phone },
    { name: "Building2", component: Building2 },
    { name: "BookOpen", component: BookOpen },
    { name: "Users", component: Users },
    { name: "Briefcase", component: Briefcase },
    { name: "GraduationCap", component: GraduationCap },
    { name: "UserCheck", component: UserCheck },
    { name: "Hospital", component: Hospital },
  ];

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find((icon) => icon.name === iconName);
    if (iconData) {
      const IconComponent = iconData.component;
      return <IconComponent size={32} color={COLORS.white} />;
    }
    return <MessageCircle size={32} color={COLORS.white} />;
  };

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

  const handleSubmitInquiry = async () => {
    if (!newInquiry.trim()) {
      Alert.alert("خطأ", "يرجى كتابة نص الاستفسار");
      return;
    }

    setIsSubmitting(true);

    try {
      await createInquiryMutation.mutateAsync({
        userId: Number(user?.id) || 1,
        title: `استفسار في فئة: ${selectedCategory}`,
        content: newInquiry,
        category: selectedCategory,
        priority: "normal" as const,
      });

      Alert.alert("نجح", "تم إرسال الاستفسار بنجاح", [
        {
          text: "موافق",
          onPress: () => {
            setNewInquiry("");
            setSelectedCategory("عام");
            setPrescriptionFile(null);
            setFileType(null);
            setShowInquiryForm(false);
          },
        },
      ]);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء إرسال الاستفسار");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSectionPress = (route: string) => {
    if (isManagementMode) return;

    if (route === "inquiries") {
      setShowInquiryForm(true);
    } else {
      router.push(route as any);
    }
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim() || !newSectionRoute.trim()) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const newSection: SectionItem = {
      id: `custom_${Date.now()}`,
      title: newSectionTitle,
      icon: getIconComponent(selectedIcon),
      color: newSectionColor,
      route: newSectionRoute,
    };

    setCustomSections((prev) => [...prev, newSection]);
    setNewSectionTitle("");
    setNewSectionRoute("");
    setNewSectionColor("#10B981");
    setSelectedIcon("MessageCircle");
    setShowAddSectionForm(false);

    Alert.alert("نجح", "تم إضافة القسم بنجاح");
  };

  const handleEditSection = (section: SectionItem) => {
    setEditingSection(section);
    setNewSectionTitle(section.title);
    setNewSectionColor(section.color);
    setNewSectionRoute(section.route);
    setShowAddSectionForm(true);
  };

  const handleUpdateSection = () => {
    if (!editingSection || !newSectionTitle.trim() || !newSectionRoute.trim()) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const updatedSection: SectionItem = {
      ...editingSection,
      title: newSectionTitle,
      color: newSectionColor,
      route: newSectionRoute,
      icon: getIconComponent(selectedIcon),
    };

    setCustomSections((prev) => prev.map((section) => (section.id === editingSection.id ? updatedSection : section)));

    setEditingSection(null);
    setNewSectionTitle("");
    setNewSectionRoute("");
    setNewSectionColor("#10B981");
    setSelectedIcon("MessageCircle");
    setShowAddSectionForm(false);

    Alert.alert("نجح", "تم تحديث القسم بنجاح");
  };

  const handleDeleteSection = (sectionId: string, sectionTitle: string) => {
    Alert.alert("تأكيد الحذف", `هل أنت متأكد من حذف قسم "${sectionTitle}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          setCustomSections((prev) => prev.filter((section) => section.id !== sectionId));
          Alert.alert("تم", "تم حذف القسم بنجاح");
        },
      },
    ]);
  };

  const renderSectionItem = (item: SectionItem, index: number) => {
    // const isCustomSection = item.id.startsWith("custom_");
    // const isBuiltInSection = !isCustomSection;
    const isHidden = hiddenSections.includes(item.id);
    const isLastOddItem = index === sections.length - 1 && sections.length % 2 === 1;

    return (
      <View key={item.id} style={[styles.sectionItemWrapper, isLastOddItem && styles.lastOddItemWrapper]}>
        <TouchableOpacity
          style={[
            styles.sectionItem,
            isManagementMode && styles.managementModeItem,
            isHidden && isManagementMode && styles.hiddenSectionItem,
          ]}
          onPress={() => handleSectionPress(item.route)}
          activeOpacity={0.8}
        >
          <View style={styles.sectionContent}>
            <View style={[styles.coloredSection, { backgroundColor: item.color }]}>
              <View style={styles.iconContainer}>
                {item.icon}
                {item.badgeCount && item.badgeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badgeCount > 99 ? "99+" : item.badgeCount.toString()}</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.whiteSection}>
              <Text style={[styles.sectionTitle, { color: item.color }]}>
                {item.title}
                {isHidden && isManagementMode && " (مخفي)"}
              </Text>
            </View>
          </View>

          {isManagementMode && (
            <View style={styles.managementActions}>
              <TouchableOpacity
                style={[styles.managementActionButton, { backgroundColor: "#F59E0B" }]}
                onPress={() => handleEditSection(item)}
              >
                <Edit size={16} color={COLORS.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.managementActionButton, { backgroundColor: "#EF4444" }]}
                onPress={() => handleDeleteSection(item.id, item.title)}
              >
                <Trash2 size={16} color={COLORS.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.managementActionButton, { backgroundColor: isHidden ? "#10B981" : "#6B7280" }]}
                onPress={() => {
                  if (isHidden) {
                    setHiddenSections((prev) => prev.filter((id) => id !== item.id));
                    Alert.alert("إظهار القسم", `تم إظهار قسم "${item.title}"`);
                  } else {
                    setHiddenSections((prev) => [...prev, item.id]);
                    Alert.alert("إخفاء القسم", `تم إخفاء قسم "${item.title}"`);
                  }
                }}
              >
                <Eye size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderAddSectionForm = () => (
    <View style={styles.addSectionForm}>
      <View style={styles.formHeader}>
        <TouchableOpacity
          onPress={() => {
            setShowAddSectionForm(false);
            setEditingSection(null);
            setNewSectionTitle("");
            setNewSectionRoute("");
            setNewSectionColor("#10B981");
            setSelectedIcon("MessageCircle");
          }}
          style={styles.backButton}
        >
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.formHeaderTitle}>{editingSection ? "تعديل القسم" : "إضافة قسم جديد"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>عنوان القسم *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="أدخل عنوان القسم"
            placeholderTextColor={COLORS.darkGray}
            value={newSectionTitle}
            onChangeText={setNewSectionTitle}
            textAlign={isRTL ? "right" : "left"}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formLabel}>مسار الصفحة *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="مثال: /my-custom-page"
            placeholderTextColor={COLORS.darkGray}
            value={newSectionRoute}
            onChangeText={setNewSectionRoute}
            textAlign={isRTL ? "right" : "left"}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formLabel}>اختر الأيقونة</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconsContainer}>
            {availableIcons.map((icon) => {
              const IconComponent = icon.component;
              return (
                <TouchableOpacity
                  key={icon.name}
                  style={[styles.iconOption, selectedIcon === icon.name && styles.selectedIconOption]}
                  onPress={() => setSelectedIcon(icon.name)}
                >
                  <IconComponent size={24} color={selectedIcon === icon.name ? COLORS.white : COLORS.primary} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formLabel}>اختر اللون</Text>
          <View style={styles.colorsContainer}>
            {availableColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  newSectionColor === color && styles.selectedColorOption,
                ]}
                onPress={() => setNewSectionColor(color)}
              >
                {newSectionColor === color && (
                  <View style={styles.colorCheckmark}>
                    <Text style={styles.colorCheckmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formLabel}>معاينة القسم</Text>
          <View style={[styles.previewSection, { backgroundColor: newSectionColor }]}>
            {getIconComponent(selectedIcon)}
            <Text style={styles.previewTitle}>{newSectionTitle || "عنوان القسم"}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!newSectionTitle.trim() || !newSectionRoute.trim()) && styles.submitButtonDisabled,
          ]}
          onPress={editingSection ? handleUpdateSection : handleAddSection}
          disabled={!newSectionTitle.trim() || !newSectionRoute.trim()}
        >
          <Text style={styles.submitButtonText}>{editingSection ? "تحديث القسم" : "إضافة القسم"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  if (showInquiryForm) {
    return (
      <View style={styles.container}>
        <View style={styles.inquiryHeader}>
          <TouchableOpacity onPress={() => setShowInquiryForm(false)} style={styles.backButton}>
            <ArrowRight size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.inquiryHeaderTitle}>الاستفسارات</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* New Inquiry Form */}
          <View style={styles.newInquirySection}>
            <Text style={styles.inquirySectionTitle}>استفسار جديد</Text>

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
                style={[styles.sendButton, (isSubmitting || !newInquiry.trim()) && styles.sendButtonDisabled]}
                onPress={handleSubmitInquiry}
                disabled={isSubmitting || !newInquiry.trim()}
              >
                <Send size={20} color={COLORS.white} />
                <Text style={styles.sendButtonText}>{isSubmitting ? "جاري الإرسال..." : "إرسال"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Previous Inquiries Section */}
          <View style={styles.inquiriesSection}>
            <Text style={styles.inquirySectionTitle}>استفساراتك السابقة</Text>

            {/* Sample Previous Inquiries */}
            <View style={styles.inquiryCard}>
              <View style={styles.inquiryCardHeader}>
                <View style={styles.statusContainer}>
                  <View style={styles.statusIndicator} />
                  <Text style={styles.statusText}>تم الرد</Text>
                </View>
                <Text style={styles.dateText}>2024-01-15</Text>
              </View>

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>أمراض</Text>
              </View>

              <Text style={styles.questionText}>ما هي أعراض مرض الكلب الأولى؟</Text>

              <View style={styles.answerContainer}>
                <Text style={styles.answerLabel}>الإجابة:</Text>
                <Text style={styles.answerText}>
                  أعراض مرض الكلب تشمل الحمى، فقدان الشهية، والخمول. يجب مراجعة الطبيب البيطري فوراً
                </Text>
              </View>
            </View>

            <View style={styles.inquiryCard}>
              <View style={styles.inquiryCardHeader}>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusIndicator, styles.pendingIndicator]} />
                  <Text style={[styles.statusText, styles.pendingText]}>في الانتظار</Text>
                </View>
                <Text style={styles.dateText}>2024-01-14</Text>
              </View>

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>تطعيمات</Text>
              </View>

              <Text style={styles.questionText}>كم مرة يجب تطعيم القطط في السنة؟</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (showAddSectionForm) {
    return renderAddSectionForm();
  }

  return (
    <View style={styles.container}>
      {/* Management Header - Only visible for admin users */}
      {isSuperAdmin && (
        <View style={styles.managementHeader}>
          <TouchableOpacity
            style={[styles.managementToggle, isManagementMode && styles.managementToggleActive]}
            onPress={() => setIsManagementMode(!isManagementMode)}
          >
            <Edit size={16} color={isManagementMode ? COLORS.white : COLORS.primary} />
            <Text style={[styles.managementToggleText, isManagementMode && styles.managementToggleTextActive]}>
              {isManagementMode ? "إنهاء التعديل" : "تعديل الأقسام"}
            </Text>
          </TouchableOpacity>

          {isManagementMode && (
            <TouchableOpacity style={styles.addSectionButton} onPress={() => setShowAddSectionForm(true)}>
              <Plus size={16} color={COLORS.white} />
              <Text style={styles.addSectionButtonText}>إضافة قسم</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {userMode === "veterinarian" && (
          <AdvertisementCarousel
            position="vet_home"
            type="banner"
            height={200}
            autoScrollInterval={5000}
            showDots={true}
          />
        )}

        <View style={styles.sectionsGrid}>{sections.map((item, index) => renderSectionItem(item, index))}</View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 116,
  },
  sectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  sectionItem: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionItemWrapper: {
    width: "47%",
  },
  lastOddItemWrapper: {
    width: "47%",
  },
  whiteSection: {
    width: "100%",
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    alignItems: "center",
  },
  coloredSection: {
    width: "100%",
    aspectRatio: 1.2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  fullWidthItem: {
    width: "100%",
    aspectRatio: 2.2,
  },
  sectionContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 12,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
  },
  // Inquiry form styles
  inquiryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  inquiryHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
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
  inquirySectionTitle: {
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
  inquiryCardHeader: {
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
  // Management styles
  managementHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  managementToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 6,
  },
  managementToggleActive: {
    backgroundColor: COLORS.primary,
  },
  managementToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  managementToggleTextActive: {
    color: COLORS.white,
  },
  addSectionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addSectionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  managementModeItem: {
    position: "relative",
  },
  managementActions: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    padding: 4,
  },
  managementActionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  // Add section form styles
  addSectionForm: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  formHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  formContent: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  iconsContainer: {
    marginTop: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: COLORS.white,
  },
  selectedIconOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  colorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorOption: {
    borderColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheckmark: {
    alignItems: "center",
    justifyContent: "center",
  },
  colorCheckmarkText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  previewSection: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: 8,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.darkGray,
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  hiddenSectionItem: {
    opacity: 0.6,
    borderWidth: 2,
    borderColor: "#FCD34D",
    borderStyle: "dashed",
  },
});
