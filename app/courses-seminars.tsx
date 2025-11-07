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
  userRegistrationStatus?: string;
}

export default function CoursesSeminarsScreen() {
  const { user, isSuperAdmin } = useApp();
  const router = useRouter();
  const { data, isLoading, error } = useQuery(trpc.courses.getList.queryOptions({ userId: user?.id }));

  const courses = useMemo(() => (data as any)?.courses, [data]);

  console.log(courses?.map((c: any) => c?.userRegistrationStatus));

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

    // Determine button text based on registration status
    const getButtonText = () => {
      switch (item?.userRegistrationStatus) {
        case "pending":
          return "جاري القبول";
        case "approved":
          return "تم القبول";
        case "rejected":
          return "تم الرفض";
        default:
          return "سجل الآن";
      }
    };

    // Determine if button should be disabled
    const isButtonDisabled = item?.userRegistrationStatus && item.userRegistrationStatus !== "rejected";

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
                {item?.userRegistrationStatus ? (
                  <Text style={styles.registrationStatusText}>
                    {item.userRegistrationStatus === "pending" && "جاري مراجعة طلبك"}
                    {item.userRegistrationStatus === "approved" && "تم قبول طلبك"}
                    {item.userRegistrationStatus === "rejected" && "تم رفض طلبك"}
                  </Text>
                ) : null}
                <TouchableOpacity
                  style={[styles.registerButton, isButtonDisabled && styles.disabledButton]}
                  onPress={() => handleRegistration(item)}
                  disabled={isButtonDisabled || false}
                >
                  <Text style={[styles.registerButtonText, isButtonDisabled && styles.disabledButtonText]}>
                    {getButtonText()}
                  </Text>
                  {item.registrationType === "link" && !isButtonDisabled && (
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
  registrationStatusText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 4,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  disabledButtonText: {
    color: COLORS.darkGray,
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
