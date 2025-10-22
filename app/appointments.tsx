import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import React, { useMemo, useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { Stack } from "expo-router";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Stethoscope,
  Pill,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  GraduationCap,
  BookOpen,
  Users,
} from "lucide-react-native";

type AppointmentType =
  | "clinic"
  | "vaccination"
  | "checkup"
  | "consultation"
  | "office"
  | "seminar"
  | "course"
  | "lecture";
type AppointmentStatus = "upcoming" | "completed" | "cancelled" | "pending";

interface Appointment {
  id: string;
  type: AppointmentType;
  title: string;
  description: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  location?: string;
  doctor?: {
    name: string;
    avatar: string;
    specialty: string;
  };
  clinic?: {
    name: string;
    address: string;
    phone: string;
  };
  pet?: {
    name: string;
    type: string;
    image: string;
  };
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    type: "clinic",
    title: "موعد في العيادة",
    description: "موعد مع مريض في العيادة البيطرية",
    date: "2024-01-15",
    time: "10:00",
    status: "upcoming",
    clinic: {
      name: "عيادة الرحمة البيطرية",
      address: "الرياض، حي النخيل",
      phone: "+966501234567",
    },
    pet: {
      name: "فلافي",
      type: "قط",
      image:
        "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80",
    },
  },
  {
    id: "2",
    type: "office",
    title: "اجتماع في المكتب",
    description: "اجتماع مع فريق العمل في المكتب البيطري",
    date: "2024-01-16",
    time: "14:00",
    status: "upcoming",
    location: "مكتب الطب البيطري - الطابق الثاني",
  },
  {
    id: "3",
    type: "seminar",
    title: "ندوة الأمراض المعدية",
    description: "ندوة حول الأمراض المعدية في الحيوانات الأليفة",
    date: "2024-01-18",
    time: "09:00",
    status: "upcoming",
    location: "قاعة المؤتمرات - مركز الطب البيطري",
  },
  {
    id: "4",
    type: "course",
    title: "دورة الجراحة المتقدمة",
    description: "دورة تدريبية في تقنيات الجراحة البيطرية المتقدمة",
    date: "2024-01-20",
    time: "08:00",
    status: "upcoming",
    location: "مركز التدريب البيطري",
  },
  {
    id: "5",
    type: "lecture",
    title: "محاضرة التغذية السليمة",
    description: "محاضرة حول التغذية السليمة للحيوانات الأليفة",
    date: "2024-01-22",
    time: "16:00",
    status: "upcoming",
    location: "جامعة الملك سعود - كلية الطب البيطري",
  },
  {
    id: "6",
    type: "clinic",
    title: "فحص دوري",
    description: "فحص دوري للكلب ماكس",
    date: "2024-01-12",
    time: "11:30",
    status: "completed",
    clinic: {
      name: "عيادة الرحمة البيطرية",
      address: "الرياض، حي النخيل",
      phone: "+966501234567",
    },
    pet: {
      name: "ماكس",
      type: "كلب",
      image:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2062&q=80",
    },
  },
  {
    id: "7",
    type: "seminar",
    title: "ندوة الطب الوقائي",
    description: "ندوة حول أهمية الطب الوقائي للحيوانات",
    date: "2024-01-10",
    time: "10:00",
    status: "completed",
    location: "مركز المؤتمرات الطبية",
  },
  {
    id: "8",
    type: "office",
    title: "مراجعة الملفات",
    description: "مراجعة ملفات المرضى والتقارير الطبية",
    date: "2024-01-25",
    time: "13:00",
    status: "pending",
    location: "مكتب الطب البيطري",
  },
  {
    id: "9",
    type: "course",
    title: "دورة التصوير الطبي",
    description: "دورة في استخدام أجهزة التصوير الطبي البيطري",
    date: "2024-01-28",
    time: "09:30",
    status: "pending",
    location: "مركز التدريب المتقدم",
  },
];

import { trpc } from "../lib/trpc";
import { useQuery } from "@tanstack/react-query";

const getAppointmentIcon = (type: AppointmentType) => {
  switch (type) {
    case "clinic":
      return Stethoscope;
    case "vaccination":
      return Pill;
    case "checkup":
      return User;
    case "consultation":
      return Phone;
    case "office":
      return Building;
    case "seminar":
      return Users;
    case "course":
      return GraduationCap;
    case "lecture":
      return BookOpen;
    default:
      return Calendar;
  }
};

const getAppointmentColor = (type: AppointmentType) => {
  switch (type) {
    case "clinic":
      return "#2196F3";
    case "vaccination":
      return "#FF9800";
    case "checkup":
      return "#4CAF50";
    case "consultation":
      return "#9C27B0";
    case "office":
      return "#795548";
    case "seminar":
      return "#E91E63";
    case "course":
      return "#3F51B5";
    case "lecture":
      return "#009688";
    default:
      return "#757575";
  }
};

const getStatusIcon = (status: AppointmentStatus) => {
  switch (status) {
    case "upcoming":
      return Clock;
    case "completed":
      return CheckCircle;
    case "cancelled":
      return XCircle;
    case "pending":
      return AlertCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "upcoming":
      return "#2196F3";
    case "completed":
      return "#4CAF50";
    case "cancelled":
      return "#F44336";
    case "pending":
      return "#FF9800";
    default:
      return "#757575";
  }
};

const getStatusText = (status: AppointmentStatus) => {
  switch (status) {
    case "upcoming":
      return "قادم";
    case "completed":
      return "مكتمل";
    case "cancelled":
      return "ملغي";
    case "pending":
      return "في الانتظار";
    default:
      return "غير محدد";
  }
};

export default function AppointmentsScreen() {
  const { isRTL } = useI18n();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "upcoming" | "completed" | "pending">("all");

  // NOTE: Assumes a `list` procedure exists on the `appointments` router.
  // This needs to be created on the backend.
  const { data, isLoading, error } = useQuery(trpc.appointments.list.queryOptions({}));

  const appointments = useMemo(() => (data as any)?.appointments, [data]);

  const filteredAppointments =
    appointments?.filter((appointment) => {
      if (selectedFilter === "all") return true;
      return appointment.status === selectedFilter;
    }) || [];

  const renderAppointmentCard = (appointment: Appointment) => {
    const IconComponent = getAppointmentIcon(appointment.type);
    const StatusIconComponent = getStatusIcon(appointment.status);
    const iconColor = getAppointmentColor(appointment.type);
    const statusColor = getStatusColor(appointment.status);

    return (
      <TouchableOpacity
        key={appointment.id}
        style={styles.appointmentCard}
        onPress={() => {
          console.log(`Appointment ${appointment.id} pressed`);
          // TODO: Handle appointment press
        }}
      >
        <View style={[styles.appointmentHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}>
            <IconComponent size={24} color={iconColor} />
          </View>
          <View style={[styles.appointmentInfo, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
            <View style={[styles.titleRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={[styles.appointmentTitle, { textAlign: isRTL ? "right" : "left" }]}>
                {appointment.title}
              </Text>
              <View style={[styles.statusContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <StatusIconComponent size={16} color={statusColor} />
                <Text
                  style={[
                    styles.statusText,
                    { color: statusColor, marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 },
                  ]}
                >
                  {getStatusText(appointment.status)}
                </Text>
              </View>
            </View>
            <Text style={[styles.appointmentDescription, { textAlign: isRTL ? "right" : "left" }]}>
              {appointment.description}
            </Text>
          </View>
        </View>

        {/* Pet Info */}
        {appointment.pet && (
          <View style={[styles.petContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Image source={{ uri: appointment.pet.image }} style={styles.petImage} />
            <View style={[styles.petInfo, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
              <Text style={[styles.petName, { textAlign: isRTL ? "right" : "left" }]}>{appointment.pet.name}</Text>
              <Text style={[styles.petType, { textAlign: isRTL ? "right" : "left" }]}>{appointment.pet.type}</Text>
            </View>
          </View>
        )}

        {/* Location Info for office, seminar, course, lecture */}
        {appointment.location && (
          <View style={styles.locationContainer}>
            <View style={[styles.locationInfoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <MapPin size={16} color={COLORS.darkGray} />
              <Text style={[styles.locationText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                {appointment.location}
              </Text>
            </View>
          </View>
        )}

        {/* Clinic Info */}
        {appointment.clinic && (
          <View style={styles.clinicContainer}>
            <View style={[styles.clinicInfoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <MapPin size={16} color={COLORS.darkGray} />
              <Text style={[styles.clinicText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                {appointment.clinic.name} - {appointment.clinic.address}
              </Text>
            </View>
            <View style={[styles.clinicInfoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Phone size={16} color={COLORS.darkGray} />
              <Text style={[styles.clinicText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                {appointment.clinic.phone}
              </Text>
            </View>
          </View>
        )}

        {/* Date and Time */}
        <View style={[styles.appointmentFooter, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={[styles.dateTimeContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Calendar size={16} color={COLORS.primary} />
            <Text style={[styles.dateTimeText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
              {new Date(appointment.date).toLocaleDateString("ar-SA")}
            </Text>
          </View>
          <View style={[styles.dateTimeContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Clock size={16} color={COLORS.primary} />
            <Text style={[styles.dateTimeText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
              {appointment.time}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "المواعيد",
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black },
          headerTintColor: COLORS.black,
        }}
      />

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filterScrollContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}
        >
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === "all" && styles.activeFilterButton]}
            onPress={() => setSelectedFilter("all")}
          >
            <Text style={[styles.filterButtonText, selectedFilter === "all" && styles.activeFilterButtonText]}>
              الكل
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === "upcoming" && styles.activeFilterButton]}
            onPress={() => setSelectedFilter("upcoming")}
          >
            <Text style={[styles.filterButtonText, selectedFilter === "upcoming" && styles.activeFilterButtonText]}>
              القادمة
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === "completed" && styles.activeFilterButton]}
            onPress={() => setSelectedFilter("completed")}
          >
            <Text style={[styles.filterButtonText, selectedFilter === "completed" && styles.activeFilterButtonText]}>
              المكتملة
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === "pending" && styles.activeFilterButton]}
            onPress={() => setSelectedFilter("pending")}
          >
            <Text style={[styles.filterButtonText, selectedFilter === "pending" && styles.activeFilterButtonText]}>
              في الانتظار
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyTitle}>جاري تحميل المواعيد...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <AlertCircle size={64} color={COLORS.error} />
          <Text style={styles.emptyTitle}>حدث خطأ</Text>
          <Text style={styles.emptyDescription}>{error.message}</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(renderAppointmentCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Calendar size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyTitle}>لا توجد مواعيد</Text>
              <Text style={styles.emptyDescription}>
                {selectedFilter === "upcoming"
                  ? "لا توجد مواعيد قادمة"
                  : selectedFilter === "completed"
                  ? "لا توجد مواعيد مكتملة"
                  : selectedFilter === "pending"
                  ? "لا توجد مواعيد في الانتظار"
                  : "لا توجد مواعيد حالياً"}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  activeFilterButtonText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  appointmentCard: {
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
  appointmentHeader: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  appointmentInfo: {
    flex: 1,
  },
  titleRow: {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
  },
  statusContainer: {
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  appointmentDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  petContainer: {
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
  },
  petImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
  },
  petType: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  locationContainer: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
  },
  locationInfoRow: {
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.darkGray,
    flex: 1,
  },
  clinicContainer: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  clinicInfoRow: {
    alignItems: "center",
    marginBottom: 4,
  },
  clinicText: {
    fontSize: 12,
    color: COLORS.darkGray,
    flex: 1,
  },
  appointmentFooter: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  dateTimeContainer: {
    alignItems: "center",
  },
  dateTimeText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: COLORS.lightGray,
    textAlign: "center",
    lineHeight: 24,
  },
});
