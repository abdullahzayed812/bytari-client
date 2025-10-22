import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { MapPin, Phone, Clock, Star, Search, MessageSquare, Eye, Edit3, Plus } from "lucide-react-native";
import Button from "../components/Button";
import { useQuery } from "@tanstack/react-query";

const mockCases = [
  {
    id: "1",
    petName: "لولو",
    petType: "قطة",
    ownerName: "سارة أحمد",
    caseType: "نزلة برد",
    status: "جديد",
    priority: "متوسط",
    date: "2025-10-01",
    description: "القطة تعاني من سعال وعطس متكرر منذ يومين.",
  },
  {
    id: "2",
    petName: "ريكس",
    petType: "كلب",
    ownerName: "علي حسن",
    caseType: "جراحة",
    status: "قيد المعالجة",
    priority: "عاجل",
    date: "2025-10-02",
    description: "إصابة في الساق اليمنى تتطلب جراحة فورية.",
  },
  {
    id: "3",
    petName: "كوكي",
    petType: "أرنب",
    ownerName: "منى خالد",
    caseType: "فحص عام",
    status: "مكتمل",
    priority: "منخفض",
    date: "2025-09-25",
    description: "فحص روتيني لصحة الأرنب كوكي.",
  },
  {
    id: "4",
    petName: "سنوبي",
    petType: "كلب",
    ownerName: "طارق يوسف",
    caseType: "تطعيم",
    status: "جديد",
    priority: "عالي",
    date: "2025-10-05",
    description: "التطعيم السنوي ضد داء الكلب.",
  },
  {
    id: "5",
    petName: "ميشو",
    petType: "قطة",
    ownerName: "هند ناصر",
    caseType: "عناية أسنان",
    status: "عاجل",
    priority: "عاجل",
    date: "2025-10-06",
    description: "التهاب شديد في لثة القطة ميشو يحتاج إلى علاج فوري.",
  },
];

export default function ClinicDetailsScreen() {
  const { isRTL } = useI18n();
  const { id } = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("الكل");
  const [activeTab, setActiveTab] = useState("الحالات");
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState({ date: "", time: "", reason: "" });

  const { data: clinic, isLoading, error } = useQuery(trpc.clinics.getDetails.queryOptions({ clinicId: Number(id) }));

  const createAppointmentMutation = useMutation(trpc.appointments.create.mutationOptions());

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  if (!clinic) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No clinic found.</Text>
      </View>
    );
  }

  const filterOptions = ["الكل", "جديد", "قيد المعالجة", "مكتمل", "عاجل"];
  const tabs = ["تفاصيل العيادة", "الحالات", "البحث"];

  // Filter cases based on search and filter
  const filteredCases = mockCases.filter((caseItem) => {
    const matchesSearch =
      caseItem.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.caseType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === "الكل" || caseItem.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مكتمل":
        return COLORS.success;
      case "قيد المعالجة":
        return COLORS.warning;
      case "جديد":
        return COLORS.info;
      case "عاجل":
        return COLORS.error;
      default:
        return COLORS.darkGray;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "عاجل":
        return COLORS.error;
      case "عالي":
        return "#FF6B35";
      case "متوسط":
        return COLORS.warning;
      case "منخفض":
        return COLORS.success;
      default:
        return COLORS.darkGray;
    }
  };

  const handleCasePress = (caseItem: any) => {
    Alert.alert(
      "تفاصيل الحالة",
      `الحيوان: ${caseItem.petName}\nالمالك: ${caseItem.ownerName}\nنوع الحالة: ${caseItem.caseType}\nالحالة: ${caseItem.status}\nالوصف: ${caseItem.description}`,
      [
        { text: "إلغاء", style: "cancel" },
        { text: "تعديل", onPress: () => console.log("Edit case:", caseItem.id) },
        { text: "عرض التفاصيل", onPress: () => console.log("View details:", caseItem.id) },
      ]
    );
  };

  const renderCaseItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.caseItem} onPress={() => handleCasePress(item)}>
      <View style={[styles.caseHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={styles.caseMainInfo}>
          <Text style={styles.petName}>
            {item.petName} ({item.petType})
          </Text>
          <Text style={styles.ownerName}>المالك: {item.ownerName}</Text>
        </View>
        <View style={styles.caseStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
        </View>
      </View>

      <View style={styles.caseDetails}>
        <Text style={styles.caseType}>نوع الحالة: {item.caseType}</Text>
        <Text style={styles.caseDate}>التاريخ: {item.date}</Text>
        <Text style={styles.caseDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <View style={[styles.caseActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity style={styles.actionButton}>
          <Eye size={16} color={COLORS.primary} />
          <Text style={styles.actionText}>عرض</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Edit3 size={16} color={COLORS.warning} />
          <Text style={styles.actionText}>تعديل</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MessageSquare size={16} color={COLORS.success} />
          <Text style={styles.actionText}>رسالة</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: string) => (
    <TouchableOpacity
      key={filter}
      style={[styles.filterButton, selectedFilter === filter && styles.activeFilterButton]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[styles.filterButtonText, selectedFilter === filter && styles.activeFilterButtonText]}>
        {filter}
      </Text>
    </TouchableOpacity>
  );

  const renderTabButton = (tab: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>{tab}</Text>
    </TouchableOpacity>
  );

  const renderClinicDetails = () => (
    <View style={styles.clinicDetailsContainer}>
      {/* Clinic Image */}
      <Image source={{ uri: clinic.image }} style={styles.clinicImage} />

      {/* Clinic Info */}
      <View style={styles.clinicInfo}>
        <Text style={styles.clinicName}>{clinic.name}</Text>

        {/* Rating */}
        <View style={[styles.ratingContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Text style={[styles.ratingText, { marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }]}>
            {clinic.rating}
          </Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                color={star <= Math.floor(clinic.rating) ? "#FFD700" : "#E0E0E0"}
                fill={star <= Math.floor(clinic.rating) ? "#FFD700" : "#E0E0E0"}
              />
            ))}
          </View>
          <Text style={[styles.reviewsCount, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
            ({clinic.reviewsCount} تقييم)
          </Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.descriptionSection}>
        <Text style={styles.descriptionText}>{clinic.description}</Text>
      </View>

      {/* Contact Info */}
      <View style={styles.contactSection}>
        <TouchableOpacity style={[styles.contactItem, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <MapPin size={20} color={COLORS.primary} />
          <Text style={[styles.contactText, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
            {clinic.address}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.contactItem, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Phone size={20} color={COLORS.primary} />
          <Text style={[styles.contactText, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
            {clinic.phone}
          </Text>
        </TouchableOpacity>

        <View style={[styles.contactItem, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Clock size={20} color={COLORS.primary} />
          <Text style={[styles.contactText, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
            {clinic.workingHours}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="حجز موعد"
          onPress={() => setBookingModalVisible(true)}
          type="primary"
          size="large"
          style={styles.clinicActionButton}
        />

        <Button
          title="اتصال"
          onPress={() => console.log("Call clinic")}
          type="secondary"
          size="large"
          style={styles.clinicActionButton}
        />
      </View>

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>حجز موعد جديد</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="تاريخ الموعد (YYYY-MM-DD)"
              value={appointmentDetails.date}
              onChangeText={(text) => setAppointmentDetails((prev) => ({ ...prev, date: text }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="وقت الموعد (HH:MM)"
              value={appointmentDetails.time}
              onChangeText={(text) => setAppointmentDetails((prev) => ({ ...prev, time: text }))}
            />
            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              placeholder="سبب الزيارة"
              value={appointmentDetails.reason}
              onChangeText={(text) => setAppointmentDetails((prev) => ({ ...prev, reason: text }))}
              multiline
            />
            <Button
              title={createAppointmentMutation.isPending ? "جاري الحجز..." : "تأكيد الحجز"}
              onPress={() => {
                createAppointmentMutation.mutate(
                  {
                    clinicId: clinic.id,
                    // userId should be inferred from context on the backend
                    appointmentTime: `${appointmentDetails.date}T${appointmentDetails.time}:00.000Z`, // Combine date and time
                    reason: appointmentDetails.reason,
                    petId: "1", // TODO: Allow selecting a pet
                  },
                  {
                    onSuccess: () => {
                      Alert.alert("نجح", "تم حجز موعدك بنجاح.");
                      setBookingModalVisible(false);
                    },
                    onError: (error) => {
                      Alert.alert("خطأ", error.message);
                    },
                  }
                );
              }}
              disabled={createAppointmentMutation.isPending}
              type="primary"
            />
            <Button
              title="إلغاء"
              onPress={() => setBookingModalVisible(false)}
              type="secondary"
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderSearchTab = () => (
    <View style={styles.searchContainer}>
      {/* Search Input */}
      <View style={[styles.searchInputContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Search size={20} color={COLORS.darkGray} />
        <TextInput
          style={[styles.searchInput, { textAlign: isRTL ? "right" : "left" }]}
          placeholder="البحث في الحالات..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.darkGray}
        />
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filterOptions.map(renderFilterButton)}
      </ScrollView>

      {/* Search Results */}
      <View style={styles.searchResults}>
        <Text style={styles.resultsCount}>{filteredCases.length} نتيجة بحث</Text>

        <FlatList
          data={filteredCases}
          renderItem={renderCaseItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.casesList}
        />
      </View>
    </View>
  );

  const renderCasesTab = () => (
    <View style={styles.casesContainer}>
      {/* Cases Header */}
      <View style={[styles.casesHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Text style={styles.casesTitle}>الحالات الطبية</Text>
        <TouchableOpacity style={styles.addCaseButton} onPress={() => console.log("Add new case")}>
          <Plus size={20} color={COLORS.white} />
          <Text style={styles.addCaseText}>إضافة حالة</Text>
        </TouchableOpacity>
      </View>

      {/* Cases Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{mockCases.length}</Text>
          <Text style={styles.statLabel}>إجمالي الحالات</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.success }]}>
            {mockCases.filter((c) => c.status === "مكتمل").length}
          </Text>
          <Text style={styles.statLabel}>مكتملة</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.warning }]}>
            {mockCases.filter((c) => c.status === "قيد المعالجة").length}
          </Text>
          <Text style={styles.statLabel}>قيد المعالجة</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.error }]}>
            {mockCases.filter((c) => c.status === "عاجل").length}
          </Text>
          <Text style={styles.statLabel}>عاجلة</Text>
        </View>
      </View>

      {/* Cases List */}
      <FlatList
        data={mockCases}
        renderItem={renderCaseItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.casesList}
      />
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "تفاصيل العيادة",
        }}
      />
      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
            {tabs.map(renderTabButton)}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === "تفاصيل العيادة" && renderClinicDetails()}
          {activeTab === "الحالات" && renderCasesTab()}
          {activeTab === "البحث" && renderSearchTab()}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  container: { flex: 1, backgroundColor: COLORS.gray },
  tabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  activeTabButtonText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },

  // Clinic Details Styles
  clinicDetailsContainer: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clinicImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  clinicInfo: {
    alignItems: "center",
    padding: 20,
  },
  clinicName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "center",
  },
  ratingContainer: {
    alignItems: "center",
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  reviewsCount: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: "center",
  },
  contactSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  contactItem: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
  },
  clinicActionButton: {
    flex: 1,
  },

  // Cases Styles
  casesContainer: {
    padding: 16,
  },
  casesHeader: {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  casesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  addCaseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addCaseText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
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
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  casesList: {
    paddingBottom: 20,
  },
  caseItem: {
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
  caseHeader: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  caseMainInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  caseStatus: {
    alignItems: "flex-end",
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  caseDetails: {
    marginBottom: 12,
  },
  caseType: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
    fontWeight: "600",
  },
  caseDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  caseDescription: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  caseActions: {
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "600",
  },

  // Search Styles
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 12,
    marginRight: 12,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
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
    fontWeight: "600",
  },
  activeFilterButtonText: {
    color: COLORS.white,
  },
  searchResults: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    textAlign: "right",
  },
});
