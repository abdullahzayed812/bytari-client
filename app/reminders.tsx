import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { Stack } from "expo-router";
import { Bell, Calendar, MessageSquare, CreditCard, Pill, Stethoscope, Clock } from "lucide-react-native";

type ReminderType = "appointment" | "message" | "vaccination" | "subscription" | "medication" | "checkup";

interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  description: string;
  date: string;
  time: string;
  isRead: boolean;
  priority: "high" | "medium" | "low";
}

const mockReminders: Reminder[] = [
  {
    id: "1",
    type: "appointment",
    title: "موعد مراجعة العيادة",
    description: "موعد مراجعة دورية للقط فلافي في عيادة الرحمة البيطرية",
    date: "2024-01-15",
    time: "10:00",
    isRead: false,
    priority: "high",
  },
  {
    id: "2",
    type: "message",
    title: "رسالة جديدة من الطبيب",
    description: "رد الطبيب على استشارتك حول صحة الكلب ماكس",
    date: "2024-01-14",
    time: "14:30",
    isRead: false,
    priority: "medium",
  },
  {
    id: "3",
    type: "vaccination",
    title: "موعد تطعيم",
    description: "حان وقت التطعيم السنوي للقط لولو",
    date: "2024-01-20",
    time: "09:00",
    isRead: true,
    priority: "high",
  },
  {
    id: "4",
    type: "subscription",
    title: "انتهاء الاشتراك",
    description: "ستنتهي عضويتك المميزة خلال 3 أيام",
    date: "2024-01-18",
    time: "12:00",
    isRead: false,
    priority: "medium",
  },
  {
    id: "5",
    type: "medication",
    title: "تذكير بالدواء",
    description: "حان وقت إعطاء الدواء للكلب ماكس",
    date: "2024-01-13",
    time: "08:00",
    isRead: true,
    priority: "high",
  },
  {
    id: "6",
    type: "checkup",
    title: "فحص دوري",
    description: "موعد الفحص الدوري للطائر كوكو",
    date: "2024-01-25",
    time: "11:00",
    isRead: false,
    priority: "low",
  },
];

const getReminderIcon = (type: ReminderType) => {
  switch (type) {
    case "appointment":
      return Calendar;
    case "message":
      return MessageSquare;
    case "vaccination":
      return Pill;
    case "subscription":
      return CreditCard;
    case "medication":
      return Pill;
    case "checkup":
      return Stethoscope;
    default:
      return Bell;
  }
};

const getReminderColor = (type: ReminderType) => {
  switch (type) {
    case "appointment":
      return "#2196F3";
    case "message":
      return "#4CAF50";
    case "vaccination":
      return "#FF9800";
    case "subscription":
      return "#9C27B0";
    case "medication":
      return "#F44336";
    case "checkup":
      return "#00BCD4";
    default:
      return "#757575";
  }
};

const getPriorityColor = (priority: "high" | "medium" | "low") => {
  switch (priority) {
    case "high":
      return "#F44336";
    case "medium":
      return "#FF9800";
    case "low":
      return "#4CAF50";
    default:
      return "#757575";
  }
};

export default function RemindersScreen() {
  const { isRTL } = useI18n();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unread" | "high">("all");

  const filteredReminders = mockReminders.filter((reminder) => {
    if (selectedFilter === "unread") return !reminder.isRead;
    if (selectedFilter === "high") return reminder.priority === "high";
    return true;
  });

  const renderReminderCard = (reminder: Reminder) => {
    const IconComponent = getReminderIcon(reminder.type);
    const iconColor = getReminderColor(reminder.type);
    const priorityColor = getPriorityColor(reminder.priority);

    return (
      <TouchableOpacity
        key={reminder.id}
        style={[styles.reminderCard, !reminder.isRead && styles.unreadCard]}
        onPress={() => {
          console.log(`Reminder ${reminder.id} pressed`);
          // TODO: Handle reminder press
        }}
      >
        <View style={[styles.reminderHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}>
            <IconComponent size={24} color={iconColor} />
          </View>
          <View style={[styles.reminderInfo, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
            <View style={[styles.titleRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={[styles.reminderTitle, { textAlign: isRTL ? "right" : "left" }]}>{reminder.title}</Text>
              <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
            </View>
            <Text style={[styles.reminderDescription, { textAlign: isRTL ? "right" : "left" }]}>
              {reminder.description}
            </Text>
          </View>
        </View>

        <View style={[styles.reminderFooter, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={[styles.dateTimeContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Clock size={16} color={COLORS.darkGray} />
            <Text style={[styles.dateTimeText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
              {new Date(reminder.date).toLocaleDateString("ar-SA")} - {reminder.time}
            </Text>
          </View>
          {!reminder.isRead && <View style={styles.unreadIndicator} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "التذكيرات",
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
            style={[styles.filterButton, selectedFilter === "unread" && styles.activeFilterButton]}
            onPress={() => setSelectedFilter("unread")}
          >
            <Text style={[styles.filterButtonText, selectedFilter === "unread" && styles.activeFilterButtonText]}>
              غير مقروءة
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === "high" && styles.activeFilterButton]}
            onPress={() => setSelectedFilter("high")}
          >
            <Text style={[styles.filterButtonText, selectedFilter === "high" ? styles.activeFilterButtonText : {}]}>
              عالية الأولوية
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredReminders.length > 0 ? (
          filteredReminders.map(renderReminderCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Bell size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>لا توجد تذكيرات</Text>
            <Text style={styles.emptyDescription}>
              {selectedFilter === "unread"
                ? "لا توجد تذكيرات غير مقروءة"
                : selectedFilter === "high"
                ? "لا توجد تذكيرات عالية الأولوية"
                : "لا توجد تذكيرات حالياً"}
            </Text>
          </View>
        )}
      </ScrollView>
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
  reminderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  reminderHeader: {
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderInfo: {
    flex: 1,
  },
  titleRow: {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  reminderFooter: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateTimeContainer: {
    alignItems: "center",
  },
  dateTimeText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
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
