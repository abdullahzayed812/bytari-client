import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Linking } from "react-native";
import React, { useMemo, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, UserCheck, Calendar, MapPin, Users, Clock, Plus, Edit3, ExternalLink } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { trpc } from "../lib/trpc";
import { useQuery } from "@tanstack/react-query";

interface CourseSeminar {
  id: string;
  title: string;
  organizer: string;
  date: string;
  location: string;
  type: "course" | "seminar";
  duration: string;
  capacity: number;
  registered: number;
  price: string;
  description: string;
  courseUrl?: string;
  registrationType: "link" | "internal";
}

const mockCoursesSeminars: CourseSeminar[] = [
  {
    id: "1",
    title: "دورة الطب البيطري الحديث",
    organizer: "الجمعية السعودية للأطباء البيطريين",
    date: "15 أغسطس 2024",
    location: "الرياض - مركز المؤتمرات",
    type: "course",
    duration: "3 أيام",
    capacity: 50,
    registered: 35,
    price: "1500 ريال",
    description: "دورة شاملة تغطي أحدث التطورات في مجال الطب البيطري والتقنيات الحديثة",
    courseUrl: "https://vetcourse.com/modern-veterinary",
    registrationType: "link",
  },
  {
    id: "2",
    title: "ندوة: مستقبل الطب البيطري في المملكة",
    organizer: "وزارة البيئة والمياه والزراعة",
    date: "22 أغسطس 2024",
    location: "جدة - فندق الريتز كارلتون",
    type: "seminar",
    duration: "يوم واحد",
    capacity: 100,
    registered: 78,
    price: "مجاني",
    description: "ندوة تناقش التحديات والفرص في مجال الطب البيطري ودوره في التنمية المستدامة",
    registrationType: "internal",
  },
  {
    id: "3",
    title: "دورة الجراحة البيطرية المتقدمة",
    organizer: "مستشفى الحيوانات التخصصي",
    date: "5 سبتمبر 2024",
    location: "الدمام - المركز الطبي",
    type: "course",
    duration: "5 أيام",
    capacity: 25,
    registered: 20,
    price: "2500 ريال",
    description: "دورة متخصصة في تقنيات الجراحة البيطرية المتقدمة مع التدريب العملي",
    courseUrl: "https://vetcourse.com/advanced-surgery",
    registrationType: "link",
  },
  {
    id: "4",
    title: "ندوة: الأمن الغذائي والصحة الحيوانية",
    organizer: "جامعة الملك سعود",
    date: "12 سبتمبر 2024",
    location: "الرياض - الجامعة",
    type: "seminar",
    duration: "نصف يوم",
    capacity: 80,
    registered: 45,
    price: "مجاني",
    description: "ندوة علمية حول العلاقة بين الصحة الحيوانية والأمن الغذائي",
    registrationType: "internal",
  },
];

export default function CoursesSeminarsScreen() {
  const { t, isRTL } = useI18n();
  const { isSuperAdmin } = useApp();
  const router = useRouter();
  const { data, isLoading, error } = useQuery(trpc.courses.getList.queryOptions());

  const courses = useMemo(() => (data as any)?.courses, [data]);

  const handleRegistration = async (course: CourseSeminar) => {
    if (course.registrationType === "link") {
      if (!course.courseUrl) {
        Alert.alert("تنبيه", "رابط التسجيل غير متوفر");
        return;
      }

      try {
        const supported = await Linking.canOpenURL(course.courseUrl);
        if (supported) {
          await Linking.openURL(course.courseUrl);
        } else {
          Alert.alert("خطأ", "لا يمكن فتح الرابط");
        }
      } catch (error) {
        console.error("Error opening course link:", error);
        Alert.alert("خطأ", "حدث خطأ أثناء فتح الرابط");
      }
    } else {
      // Navigate to internal registration screen
      router.push({
        pathname: "/course-registration",
        params: {
          courseId: course.id,
          courseName: course.title,
          courseDate: course.date,
          courseLocation: course.location,
          courseDuration: course.duration,
          coursePrice: course.price,
          courseOrganizer: course.organizer,
        },
      });
    }
  };

  const renderEventCard = (item: CourseSeminar) => {
    const availableSpots = item.capacity - item.registered;
    const isAlmostFull = availableSpots <= 5;

    return (
      <TouchableOpacity key={item.id} style={styles.eventCard} activeOpacity={0.8}>
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleContainer}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.organizerName}>{item.organizer}</Text>
          </View>
          <View style={[styles.typeTag, { backgroundColor: item.type === "course" ? "#E3F2FD" : "#F3E5F5" }]}>
            <Text style={[styles.typeTagText, { color: item.type === "course" ? "#1976D2" : "#7B1FA2" }]}>
              {item.type === "course" ? "دورة" : "ندوة"}
            </Text>
          </View>
        </View>

        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Calendar size={16} color={COLORS.darkGray} />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={16} color={COLORS.darkGray} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={16} color={COLORS.darkGray} />
            <Text style={styles.detailText}>{item.duration}</Text>
          </View>
          <View style={styles.detailRow}>
            <Users size={16} color={COLORS.darkGray} />
            <Text style={styles.detailText}>
              {item.registered}/{item.capacity} مسجل
            </Text>
          </View>
        </View>

        <Text style={styles.eventDescription}>{item.description}</Text>

        <View style={styles.eventFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>السعر:</Text>
            <Text style={[styles.priceText, { color: item.price === "مجاني" ? "#10B981" : COLORS.primary }]}>
              {item.price}
            </Text>
          </View>

          <View style={styles.registrationContainer}>
            {availableSpots > 0 ? (
              <>
                {isAlmostFull && <Text style={styles.almostFullText}>{availableSpots} مقاعد متبقية</Text>}
                <TouchableOpacity style={styles.registerButton} onPress={() => handleRegistration(item)}>
                  <Text style={styles.registerButtonText}>سجل الآن</Text>
                  {item.registrationType === "link" && (
                    <ExternalLink size={14} color={COLORS.white} style={styles.externalLinkIcon} />
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.fullButton}>
                <Text style={styles.fullButtonText}>مكتمل</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "دورات وندوات",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
          headerRight: () =>
            isSuperAdmin ? (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/admin-content-manager?type=courses");
                  }}
                  style={[styles.headerButton, styles.addButton]}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/admin-content-manager?type=courses");
                  }}
                  style={[styles.headerButton, styles.editButton]}
                >
                  <Edit3 size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : null,
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <UserCheck size={48} color={COLORS.primary} />
          <Text style={styles.headerTitle}>دورات وندوات تدريبية</Text>
          <Text style={styles.headerSubtitle}>انضم إلى الفعاليات التعليمية والتدريبية</Text>
        </View>

        {isLoading ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>جاري التحميل...</Text>
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center", marginTop: 20 }}>حدث خطأ أثناء تحميل الدورات</Text>
        ) : courses.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>لا توجد دورات أو ندوات حالياً</Text>
        ) : (
          <View style={styles.eventsList}>{courses.map(renderEventCard)}</View>
        )}
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
    marginBottom: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  eventsList: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  organizerName: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  eventDetails: {
    marginBottom: 12,
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
  eventDescription: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
    marginBottom: 16,
  },
  eventFooter: {
    gap: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  registrationContainer: {
    alignItems: "flex-end",
  },
  almostFullText: {
    fontSize: 12,
    color: "#F59E0B",
    marginBottom: 8,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  externalLinkIcon: {
    marginLeft: 4,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  fullButton: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  fullButtonText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: COLORS.success || "#28a745",
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
});
