import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useMemo, useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter } from "expo-router";
import Button from "../components/Button";
import { UserPlus, Users, Building2, ArrowRight } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";

// Mock data for available vets and farms
const mockVets = [
  {
    id: 1,
    name: "د. محمد أحمد",
    specialization: "طب الدواجن",
    licenseNumber: "VET-001",
    phone: "+966 50 123 4567",
  },
  {
    id: 2,
    name: "د. سارة علي",
    specialization: "أمراض الطيور",
    licenseNumber: "VET-002",
    phone: "+966 55 987 6543",
  },
];

const mockFarms = [
  {
    id: 1,
    name: "حقل الدواجن الذهبي",
    ownerName: "أحمد محمد",
    address: "الرياض - الخرج",
    farmType: "broiler",
    hasAssignedVet: false,
  },
  {
    id: 2,
    name: "مزرعة الفجر للدواجن",
    ownerName: "سعد العتيبي",
    address: "القصيم - بريدة",
    farmType: "layer",
    hasAssignedVet: true,
  },
];

export default function AssignVetToFarmScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const [selectedVet, setSelectedVet] = useState<number | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<number | null>(null);
  const [assignmentType, setAssignmentType] = useState<"doctor" | "supervisor">("doctor");

  const { data: vets, isLoading: loadingVets } = useQuery(trpc.fieldAssignments.getAvailableVets.queryOptions());
  const { data: farms, isLoading: loadingFarms } = useQuery(trpc.fieldAssignments.getAvailableFarms.queryOptions());

  const availableVets = useMemo(() => (vets as any)?.vets, [vets]);
  const availableFarms = useMemo(() => (farms as any)?.farms, [farms]);

  const assignMutation = useMutation(
    trpc.fieldAssignments.assignVetProcedure.mutationOptions({
      onSuccess: () => {
        Alert.alert("نجاح", "تم تعيين الطبيب بنجاح");
        router.back();
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message || "حدث خطأ أثناء التعيين");
      },
    })
  );

  const handleAssignVet = () => {
    if (!selectedVet || !selectedFarm) {
      Alert.alert("خطأ", "يرجى اختيار الطبيب والحقل");
      return;
    }

    Alert.alert("تأكيد التعيين", `هل تريد تعيين الطبيب كـ ${assignmentType === "doctor" ? "طبيب مختص" : "مشرف حقل"}؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تأكيد",
        onPress: () => {
          assignMutation.mutate({
            vetId: selectedVet,
            fieldId: selectedFarm,
            role: assignmentType,
          });
        },
      },
    ]);
  };

  const renderVetCard = (vet: (typeof mockVets)[0]) => {
    const isSelected = selectedVet === vet.id;

    return (
      <TouchableOpacity
        key={vet.id}
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={() => setSelectedVet(vet.id)}
      >
        <View style={[styles.cardHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { textAlign: isRTL ? "right" : "left" }]}>{vet.name}</Text>
            <Text style={[styles.cardSubtitle, { textAlign: isRTL ? "right" : "left" }]}>{vet.specialization}</Text>
            <Text style={[styles.cardDetail, { textAlign: isRTL ? "right" : "left" }]}>
              رقم الترخيص: {vet.licenseNumber}
            </Text>
          </View>

          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>مختار</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFarmCard = (farm: (typeof mockFarms)[0]) => {
    const isSelected = selectedFarm === farm.id;

    return (
      <TouchableOpacity
        key={farm.id}
        style={[styles.card, isSelected && styles.selectedCard, farm.hasAssignedVet && styles.disabledCard]}
        onPress={() => !farm.hasAssignedVet && setSelectedFarm(farm.id)}
        disabled={farm.hasAssignedVet}
      >
        <View style={[styles.cardHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { textAlign: isRTL ? "right" : "left" }]}>{farm.name}</Text>
            <Text style={[styles.cardSubtitle, { textAlign: isRTL ? "right" : "left" }]}>المالك: {farm.ownerName}</Text>
            <Text style={[styles.cardDetail, { textAlign: isRTL ? "right" : "left" }]}>{farm.address}</Text>
          </View>

          {farm.hasAssignedVet ? (
            <View style={[styles.statusBadge, { backgroundColor: COLORS.warning }]}>
              <Text style={styles.statusBadgeText}>معين مسبقاً</Text>
            </View>
          ) : isSelected ? (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>مختار</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Assignment Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع التعيين</Text>
          <View style={[styles.typeSelector, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <TouchableOpacity
              style={[styles.typeButton, assignmentType === "doctor" && styles.selectedTypeButton]}
              onPress={() => setAssignmentType("doctor")}
            >
              <Text style={[styles.typeButtonText, assignmentType === "doctor" && styles.selectedTypeButtonText]}>
                طبيب مختص
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, assignmentType === "supervisor" && styles.selectedTypeButton]}
              onPress={() => setAssignmentType("supervisor")}
            >
              <Text style={[styles.typeButtonText, assignmentType === "supervisor" && styles.selectedTypeButtonText]}>
                مشرف حقل
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vet Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اختيار الطبيب</Text>
          {loadingVets ? (
            <Text>جاري تحميل الأطباء...</Text>
          ) : availableVets?.length ? (
            availableVets.map(renderVetCard)
          ) : (
            <Text>لا يوجد أطباء متاحون</Text>
          )}
        </View>

        {/* Farm Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اختيار الحقل</Text>
          {loadingFarms ? (
            <Text>جاري تحميل الحقول...</Text>
          ) : availableFarms?.length ? (
            availableFarms.map(renderFarmCard)
          ) : (
            <Text>لا توجد حقول متاحة</Text>
          )}
        </View>

        {/* Assign Button */}
        <Button
          title={`تعيين كـ ${assignmentType === "doctor" ? "طبيب مختص" : "مشرف حقل"}`}
          onPress={handleAssignVet}
          type="primary"
          size="large"
          style={styles.assignButton}
          disabled={!selectedVet || !selectedFarm}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "right",
  },
  typeSelector: {
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  selectedTypeButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  selectedTypeButtonText: {
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: COLORS.primary,
  },
  disabledCard: {
    opacity: 0.6,
  },
  cardHeader: {
    alignItems: "flex-start",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  cardDetail: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  selectedBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  assignButton: {
    marginTop: 16,
  },
});
