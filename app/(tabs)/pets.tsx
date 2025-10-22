import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ScrollView, TextInput } from "react-native";
import React, { useRef, useState, useMemo } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { useRouter, useFocusEffect } from "expo-router";
import Button from "../../components/Button";
import { Pet, PoultryFarm, PoultryBatch } from "../../types";
import {
  Calendar,
  Plus,
  MapPin,
  Phone,
  Store,
  Feather,
  Users,
  Square,
  Activity,
  DollarSign,
  Stethoscope,
  UserCheck,
  UserPlus,
  CheckCircle,
  Package,
} from "lucide-react-native";
import { mockPets } from "../../mocks/data";
import { trpc } from "../../lib/trpc";
import { useQuery } from "@tanstack/react-query";

export default function PetsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { userMode, user, hasAdminAccess, isSuperAdmin, isModerator } = useApp();
  const { data } = useQuery(trpc.pets.getUserPets.queryOptions({ userId: user?.id }));
  const pets = useMemo(() => (data as any)?.pets, [data]);

  // if (userMode === "veterinarian" || isSuperAdmin) {
  //   router.navigate("(tabs)/clinics");
  //   return;
  // }

  // Fetch user's own pets
  const userPetsQuery = useQuery(
    trpc.pets.getUserPets.queryOptions(
      { userId: Number(user?.id) || 0 },
      { enabled: !!user?.id && userMode !== "veterinarian" }
    )
  );

  // Fetch user's own farms
  const userFarmsQuery = useQuery(
    trpc.admin.fieldAssignments.getUserFarms.queryOptions(undefined, {
      enabled: !!user?.id && userMode !== "veterinarian",
    })
  );

  // Fetch all fields for admin (for assignment purposes)
  const allFieldsQuery = useQuery(
    trpc.admin.fieldAssignments.getAllFieldsForAdmin.queryOptions(
      { adminId: Number(user?.id) || 0 },
      { enabled: !!user?.id && (hasAdminAccess || isSuperAdmin || isModerator) }
    )
  );
  const flatListRef = useRef<FlatList>(null);
  const [showAssignVetModal, setShowAssignVetModal] = useState(false);
  const [showAssignSupervisorModal, setShowAssignSupervisorModal] = useState(false);
  const [vetName, setVetName] = useState("");
  const [vetEmail, setVetEmail] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedSupervisorField, setSelectedSupervisorField] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Pet[]>([]);
  const [assignedVets, setAssignedVets] = useState<{
    [key: string]: { name: string; email: string; fieldId: string; fieldName: string };
  }>({});
  const [assignedSupervisors, setAssignedSupervisors] = useState<{
    [key: string]: { name: string; email: string; fieldId: string; fieldName: string };
  }>({});
  const [currentUserSupervisorAssignment, setCurrentUserSupervisorAssignment] = useState<{
    fieldId: string;
    fieldName: string;
  } | null>(null);

  // Mock data: Simulate that current user is assigned as vet and supervisor
  const mockAssignedVetData = {
    "vet@example.com": {
      name: "د. أحمد محمد",
      email: "vet@example.com",
      fieldId: "field1",
      fieldName: "حقل الدواجن النموذجي - بغداد",
    },
  };

  const mockAssignedSupervisorData = {
    "supervisor@example.com": {
      name: "علي حسن",
      email: "supervisor@example.com",
      fieldId: "field3",
      fieldName: "مزرعة الدواجن الحديثة - أربيل",
    },
  };

  const mockCurrentUserSupervisorAssignment = {
    fieldId: "field3",
    fieldName: "مزرعة الدواجن الحديثة - أربيل",
  };

  // Mock assigned field data - in real app this would come from user profile or API
  const assignedField = {
    id: "field1",
    name: "حقل الدواجن النموذجي - بغداد",
    type: "poultry",
    location: "بغداد - الدورة",
    assignedAt: "2024-01-15",
    isActive: true,
  };

  // Get available fields from API or use mock data
  const availableFields = allFieldsQuery.data?.map((field: any) => ({
    id: field.id.toString(),
    name: field.name,
    type: "poultry" as const,
    owner: field.ownerName || "غير محدد",
  })) || [
    { id: "field1", name: "حقل الدواجن النموذجي - بغداد", type: "poultry", owner: "أحمد محمد" },
    { id: "field2", name: "حقل الماشية المتقدم - البصرة", type: "livestock", owner: "علي حسن" },
    { id: "field3", name: "مزرعة الدواجن الحديثة - أربيل", type: "poultry", owner: "فاطمة أحمد" },
    { id: "field4", name: "حقل الأغنام والماعز - الموصل", type: "livestock", owner: "محمد علي" },
    { id: "field5", name: "مزرعة الدواجن العضوية - النجف", type: "poultry", owner: "سارة أحمد" },
    { id: "field6", name: "حقل الأبقار الحلوب - كربلاء", type: "livestock", owner: "حسين علي" },
    { id: "field7", name: "مزرعة الدجاج البلدي - ديالى", type: "poultry", owner: "زينب محمد" },
    { id: "field8", name: "حقل الجاموس - ميسان", type: "livestock", owner: "عبدالله حسن" },
    { id: "field9", name: "مزرعة الدواجن المكثفة - واسط", type: "poultry", owner: "نور الهدى" },
    { id: "field10", name: "حقل الماعز الشامي - الأنبار", type: "livestock", owner: "خالد عبدالله" },
    { id: "field11", name: "مزرعة الرومي والبط - بابل", type: "poultry", owner: "مريم حسين" },
    { id: "field12", name: "حقل الأغنام العواسي - صلاح الدين", type: "livestock", owner: "يوسف محمد" },
  ];

  // Mock: Simulate that current user is assigned to poultry field
  const mockAssignedVet = userMode === "veterinarian";
  const mockAssignedFieldData = mockAssignedVet
    ? {
        id: "field1",
        name: "حقل الدواجن النموذجي - بغداد",
        type: "poultry",
        owner: "أحمد محمد",
      }
    : null;

  // Merge real assignments with mock data for demo purposes
  const allAssignedVets = { ...assignedVets, ...mockAssignedVetData };
  const allAssignedSupervisors = { ...assignedSupervisors, ...mockAssignedSupervisorData };

  // Check if current user is assigned as supervisor (using mock data for demo)
  const currentUserSupervisorAssignment_real =
    Object.values(allAssignedSupervisors).find((supervisor) => supervisor.email === user?.email) ||
    (userMode === "veterinarian" ? mockCurrentUserSupervisorAssignment : currentUserSupervisorAssignment);
  const isAssignedSupervisor = currentUserSupervisorAssignment_real !== null;

  // Check if current user is a veterinarian assigned to a field (using mock data for demo)
  const currentUserAssignment =
    Object.values(allAssignedVets).find((vet) => vet.email === user?.email) ||
    (userMode === "veterinarian" ? mockAssignedVetData["vet@example.com"] : null);
  const isAssignedVet = userMode === "veterinarian" && currentUserAssignment;
  const assignedFieldData =
    isAssignedVet && currentUserAssignment
      ? availableFields.find((f: any) => f.id === currentUserAssignment.fieldId)
      : null;

  // Scroll to top when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [])
  );

  // Get recent animals (user's own pets or mock data)
  const recentAnimals = useMemo(() => {
    if (userPetsQuery.data?.pets) {
      return userPetsQuery.data.pets.slice(0, 5).map((pet) => ({
        id: pet.id.toString(),
        name: pet.name,
        type: pet.type,
        breed: pet.breed || "",
        image: pet.image || "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
        age: pet.age || 0,
        weight: pet.weight || 0,
        color: pet.color || "",
        gender: pet.gender || "male",
        medicalHistory: pet.medicalHistory || "",
        vaccinations: pet.vaccinations || "",
        isLost: false,
        reminders: [],
        ownerId: pet.ownerId.toString(),
        medicalRecords: [],
      }));
    }
    return mockPets.slice(0, 5);
  }, [userPetsQuery.data]);

  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    // Search by ID or name in user's own pets only (or mock pets for demo)
    const userOwnedPets =
      userPetsQuery.data?.pets?.map((pet) => ({
        id: pet.id.toString(),
        name: pet.name,
        type: pet.type,
        breed: pet.breed || "",
        image: pet.image || "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
        age: pet.age || 0,
        weight: pet.weight || 0,
        color: pet.color || "",
        gender: pet.gender || "male",
        medicalHistory: pet.medicalHistory || "",
        vaccinations: pet.vaccinations || "",
        isLost: false,
        reminders: [],
        ownerId: pet.ownerId.toString(),
        medicalRecords: [],
      })) || [];

    const allPets = [...pets, ...userOwnedPets, ...mockPets];
    const results = allPets.filter(
      (pet) =>
        pet.id.toLowerCase().includes(query.toLowerCase()) || pet.name.toLowerCase().includes(query.toLowerCase())
    );

    // Remove duplicates based on ID
    const uniqueResults = results.filter((pet, index, self) => index === self.findIndex((p) => p.id === pet.id));

    setSearchResults(uniqueResults);
  };

  const handleAnimalPress = (pet: Pet) => {
    router.push({
      pathname: "/pet-details",
      params: { id: pet.id },
    });
  };

  // Fetch user's approved clinics
  const userClinicsQuery = useQuery(
    trpc.clinics.getUserApprovedClinics.queryOptions(undefined, {
      enabled: !!user?.id && userMode === "veterinarian",
    })
  );

  // Fetch user's approved warehouses
  const userWarehousesQuery = useQuery(
    trpc.warehouses.getUserApprovedWarehouses.queryOptions(undefined, {
      enabled: !!user?.id && userMode === "veterinarian",
    })
  );

  // Get approved clinics and warehouses
  const approvedClinics = userClinicsQuery.data?.clinics || [];
  const approvedWarehouses = userWarehousesQuery.data?.warehouses || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return COLORS.success;
      case "completed":
        return COLORS.primary;
      case "inactive":
        return COLORS.warning;
      default:
        return COLORS.darkGray;
    }
  };

  const getWarehouseStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return COLORS.success;
      case "pending":
        return COLORS.warning;
      case "inactive":
        return COLORS.error;
      default:
        return COLORS.darkGray;
    }
  };

  // If user is veterinarian, show clinic interface
  if (userMode === "veterinarian") {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.listContent}>
          <View style={styles.header}>
            <Text style={styles.title}>عيادتي</Text>
          </View>

          {/* Approved Clinics Section */}
          {approvedClinics.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>عياداتي المفعلة</Text>
              {approvedClinics.map((clinic: any) => (
                <TouchableOpacity
                  key={clinic.id}
                  style={styles.clinicCard}
                  onPress={() =>
                    router.push({
                      pathname: "/clinic-dashboard",
                      params: { clinicId: clinic.id },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: clinic.image || "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400" }}
                    style={styles.clinicImage}
                  />
                  <View style={styles.clinicInfo}>
                    <View style={styles.clinicHeader}>
                      <Text style={styles.clinicName}>{clinic.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
                        <Text style={styles.statusText}>مفعل</Text>
                      </View>
                    </View>
                    <View style={styles.clinicInfoRow}>
                      <MapPin size={14} color={COLORS.darkGray} />
                      <Text style={styles.clinicInfoText}>{clinic.address}</Text>
                    </View>
                    <View style={styles.clinicInfoRow}>
                      <Phone size={14} color={COLORS.darkGray} />
                      <Text style={styles.clinicInfoText}>{clinic.phone}</Text>
                    </View>
                    <View style={styles.clinicInfoRow}>
                      <Calendar size={14} color={COLORS.primary} />
                      <Text style={styles.clinicInfoText}>
                        صالح حتى:{" "}
                        {clinic.activationEndDate
                          ? new Date(clinic.activationEndDate).toLocaleDateString("ar-SA")
                          : "غير محدد"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.clinicStats}>
                    <View style={styles.clinicStat}>
                      <Users size={16} color={COLORS.primary} />
                      <Text style={styles.clinicStatValue}>85</Text>
                      <Text style={styles.clinicStatLabel}>مريض</Text>
                    </View>
                    <View style={styles.clinicStat}>
                      <Activity size={16} color={COLORS.success} />
                      <Text style={styles.clinicStatValue}>18</Text>
                      <Text style={styles.clinicStatLabel}>نشط</Text>
                    </View>
                    <View style={styles.clinicStat}>
                      <CheckCircle size={16} color={COLORS.primary} />
                      <Text style={styles.clinicStatValue}>256</Text>
                      <Text style={styles.clinicStatLabel}>مكتمل</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Approved Warehouses Section */}
          {approvedWarehouses.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>مخازني المفعلة</Text>
              {approvedWarehouses.map((warehouse: any) => (
                <TouchableOpacity
                  key={warehouse.id}
                  style={styles.warehouseCard}
                  onPress={() =>
                    router.push({
                      pathname: "/warehouse-management",
                      params: { warehouseId: warehouse.id },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Image
                    source={{
                      uri: warehouse.image || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
                    }}
                    style={styles.warehouseImage}
                  />
                  <View style={styles.warehouseInfo}>
                    <View style={styles.warehouseHeader}>
                      <Text style={styles.warehouseName}>{warehouse.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getWarehouseStatusColor("active") }]}>
                        <Text style={styles.statusText}>مفعل</Text>
                      </View>
                    </View>
                    <View style={styles.warehouseInfoRow}>
                      <MapPin size={14} color={COLORS.darkGray} />
                      <Text style={styles.warehouseInfoText}>{warehouse.address}</Text>
                    </View>
                    <View style={styles.warehouseInfoRow}>
                      <Phone size={14} color={COLORS.darkGray} />
                      <Text style={styles.warehouseInfoText}>{warehouse.phone}</Text>
                    </View>
                    <View style={styles.warehouseInfoRow}>
                      <Calendar size={14} color={COLORS.primary} />
                      <Text style={styles.warehouseInfoText}>
                        صالح حتى:{" "}
                        {warehouse.activationEndDate
                          ? new Date(warehouse.activationEndDate).toLocaleDateString("ar-SA")
                          : "غير محدد"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.warehouseStats}>
                    <View style={styles.warehouseStat}>
                      <Package size={16} color={COLORS.primary} />
                      <Text style={styles.warehouseStatValue}>{warehouse.totalProducts || 45}</Text>
                      <Text style={styles.warehouseStatLabel}>منتج</Text>
                    </View>
                    <View style={styles.warehouseStat}>
                      <DollarSign size={16} color={COLORS.success} />
                      <Text style={styles.warehouseStatValue}>{warehouse.totalSales || 1247}</Text>
                      <Text style={styles.warehouseStatLabel}>مبيعات</Text>
                    </View>
                    <View style={styles.warehouseStat}>
                      <Users size={16} color={COLORS.warning} />
                      <Text style={styles.warehouseStatValue}>{warehouse.followers || 892}</Text>
                      <Text style={styles.warehouseStatLabel}>متابع</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Empty State for No Approved Clinics/Warehouses */}
          {approvedClinics.length === 0 && approvedWarehouses.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Stethoscope size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>لا توجد عيادات أو مخازن مفعلة</Text>
              <Text style={styles.emptyStateSubtext}>بعد الموافقة على طلباتك ستظهر لوحات التحكم هنا</Text>
            </View>
          )}

          <View style={styles.clinicActions}>
            <Button
              title="إضافة عيادة جديدة"
              onPress={() => router.push("/clinic-system")}
              type="secondary"
              size="medium"
              icon={<Plus size={16} color={COLORS.primary} />}
              style={styles.actionButton}
            />

            <Button
              title="إضافة مذخر بيطري"
              onPress={() => router.push("/add-store")}
              type="primary"
              size="medium"
              icon={<Store size={16} color={COLORS.white} />}
              style={[styles.actionButton, styles.storeButton]}
            />

            {/* Admin/Supervisor only buttons */}
            {hasAdminAccess && (
              <>
                <Button
                  title="تعيين طبيب بيطري"
                  onPress={() => setShowAssignVetModal(true)}
                  type="primary"
                  size="medium"
                  icon={<UserPlus size={16} color={COLORS.white} />}
                  style={[styles.actionButton, styles.assignVetButton]}
                />

                <Button
                  title="تعيين مشرف على حقول الدواجن"
                  onPress={() => setShowAssignSupervisorModal(true)}
                  type="primary"
                  size="medium"
                  icon={<UserCheck size={16} color={COLORS.white} />}
                  style={[styles.actionButton, styles.assignSupervisorButton]}
                />
              </>
            )}
          </View>
        </ScrollView>

        {/* Assign Vet Modal - Only for veterinarians */}
        {showAssignVetModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>تعيين طبيب بيطري</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>اسم المستخدم</Text>
                <TextInput
                  style={styles.textInput}
                  value={vetName}
                  onChangeText={setVetName}
                  placeholder="أدخل اسم الطبيب البيطري"
                  placeholderTextColor={COLORS.darkGray}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>الإيميل</Text>
                <TextInput
                  style={styles.textInput}
                  value={vetEmail}
                  onChangeText={setVetEmail}
                  placeholder="أدخل إيميل الطبيب البيطري"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>اختيار الحقل</Text>
                <ScrollView style={styles.fieldsListContainer} showsVerticalScrollIndicator={true}>
                  {availableFields.map((field: any) => (
                    <TouchableOpacity
                      key={field.id}
                      style={[styles.fieldListOption, selectedField === field.id && styles.fieldListOptionSelected]}
                      onPress={() => setSelectedField(field.id)}
                    >
                      <View style={styles.fieldOptionContent}>
                        <Text
                          style={[
                            styles.fieldListOptionText,
                            selectedField === field.id && styles.fieldListOptionTextSelected,
                          ]}
                        >
                          {field.name}
                        </Text>
                        <Text
                          style={[styles.fieldOwnerText, selectedField === field.id && styles.fieldOwnerTextSelected]}
                        >
                          المالك: {field.owner}
                        </Text>
                        <View
                          style={[
                            styles.fieldTypeBadge,
                            { backgroundColor: field.type === "poultry" ? "#10B981" : "#3B82F6" },
                          ]}
                        >
                          <Text style={styles.fieldTypeBadgeText}>{field.type === "poultry" ? "دواجن" : "ماشية"}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalButtons}>
                <Button
                  title="إلغاء"
                  onPress={() => {
                    setShowAssignVetModal(false);
                    setVetName("");
                    setVetEmail("");
                    setSelectedField("");
                  }}
                  type="secondary"
                  size="medium"
                  style={styles.modalButton}
                />
                <Button
                  title="تعيين"
                  onPress={() => {
                    if (vetName && vetEmail && selectedField) {
                      const field = availableFields.find((f: any) => f.id === selectedField);
                      if (field) {
                        setAssignedVets((prev) => ({
                          ...prev,
                          [vetEmail]: {
                            name: vetName,
                            email: vetEmail,
                            fieldId: selectedField,
                            fieldName: field.name,
                          },
                        }));
                        console.log("تم تعيين الطبيب:", { vetName, vetEmail, fieldName: field.name });
                      }
                    }
                    setShowAssignVetModal(false);
                    setVetName("");
                    setVetEmail("");
                    setSelectedField("");
                  }}
                  type="primary"
                  size="medium"
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        )}

        {/* Assign Supervisor Modal - Only for veterinarians */}
        {showAssignSupervisorModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>تعيين مشرف على حقول الدواجن</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>اسم المشرف</Text>
                <TextInput
                  style={styles.textInput}
                  value={supervisorName}
                  onChangeText={setSupervisorName}
                  placeholder="أدخل اسم المشرف"
                  placeholderTextColor={COLORS.darkGray}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>الإيميل</Text>
                <TextInput
                  style={styles.textInput}
                  value={supervisorEmail}
                  onChangeText={setSupervisorEmail}
                  placeholder="أدخل إيميل المشرف"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>اختيار حقل الدواجن</Text>
                <ScrollView style={styles.fieldsListContainer} showsVerticalScrollIndicator={true}>
                  {availableFields
                    .filter((field: any) => field.type === "poultry")
                    .map((field: any) => (
                      <TouchableOpacity
                        key={field.id}
                        style={[
                          styles.fieldListOption,
                          selectedSupervisorField === field.id && styles.fieldListOptionSelected,
                        ]}
                        onPress={() => setSelectedSupervisorField(field.id)}
                      >
                        <View style={styles.fieldOptionContent}>
                          <Text
                            style={[
                              styles.fieldListOptionText,
                              selectedSupervisorField === field.id && styles.fieldListOptionTextSelected,
                            ]}
                          >
                            {field.name}
                          </Text>
                          <Text
                            style={[
                              styles.fieldOwnerText,
                              selectedSupervisorField === field.id && styles.fieldOwnerTextSelected,
                            ]}
                          >
                            المالك: {field.owner}
                          </Text>
                          <View style={[styles.fieldTypeBadge, { backgroundColor: "#10B981" }]}>
                            <Text style={styles.fieldTypeBadgeText}>دواجن</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>

              <View style={styles.modalButtons}>
                <Button
                  title="إلغاء"
                  onPress={() => {
                    setShowAssignSupervisorModal(false);
                    setSupervisorName("");
                    setSupervisorEmail("");
                    setSelectedSupervisorField("");
                  }}
                  type="secondary"
                  size="medium"
                  style={styles.modalButton}
                />
                <Button
                  title="تعيين"
                  onPress={() => {
                    if (supervisorName && supervisorEmail && selectedSupervisorField) {
                      const field = availableFields.find((f: any) => f.id === selectedSupervisorField);
                      if (field) {
                        setAssignedSupervisors((prev) => ({
                          ...prev,
                          [supervisorEmail]: {
                            name: supervisorName,
                            email: supervisorEmail,
                            fieldId: selectedSupervisorField,
                            fieldName: field.name,
                          },
                        }));
                        // If current user is being assigned, update their assignment
                        if (supervisorEmail === user?.email) {
                          setCurrentUserSupervisorAssignment({
                            fieldId: selectedSupervisorField,
                            fieldName: field.name,
                          });
                        }
                        console.log("تم تعيين المشرف:", { supervisorName, supervisorEmail, fieldName: field.name });
                      }
                    }
                    setShowAssignSupervisorModal(false);
                    setSupervisorName("");
                    setSupervisorEmail("");
                    setSelectedSupervisorField("");
                  }}
                  type="primary"
                  size="medium"
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  const handleAddPet = () => {
    router.push("/add-pet");
  };

  const handlePetPress = (pet: Pet) => {
    router.push({
      pathname: "/pet-details",
      params: { id: pet.id },
    });
  };

  const renderPetItem = ({ item }: { item: Pet }) => {
    const upcomingReminders = item.reminders.filter(
      (reminder) => !reminder.isCompleted && new Date(reminder.date) > new Date()
    );

    return (
      <TouchableOpacity style={styles.petCard} onPress={() => handlePetPress(item)} activeOpacity={0.8}>
        <Image source={{ uri: item.image }} style={styles.petImage} />
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petType}>
            {t(`pets.types.${item.type}`)} {item.breed ? `- ${item.breed}` : ""}
          </Text>

          {upcomingReminders.length > 0 && (
            <View style={styles.reminderContainer}>
              <Calendar size={16} color={COLORS.primary} />
              <Text style={styles.reminderText}>
                {upcomingReminders.length} {t("pets.reminders")}
              </Text>
            </View>
          )}

          {item.isLost && (
            <View style={styles.lostBadge}>
              <Text style={styles.lostBadgeText}>مفقود</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={
          userPetsQuery.data?.pets?.map((pet) => ({
            id: pet.id.toString(),
            name: pet.name,
            type: pet.type,
            breed: pet.breed || "",
            image: pet.image || "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
            age: pet.age || 0,
            weight: pet.weight || 0,
            color: pet.color || "",
            gender: pet.gender || "male",
            medicalHistory: pet.medicalHistory || "",
            vaccinations: pet.vaccinations || "",
            isLost: false,
            reminders: [],
            ownerId: pet.ownerId.toString(),
            medicalRecords: [],
          })) || pets
        }
        renderItem={renderPetItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerButtons}>
                <Button
                  title={t("pets.addPet")}
                  onPress={handleAddPet}
                  type="primary"
                  size="small"
                  icon={<Plus size={16} color={COLORS.white} />}
                  style={styles.headerButton}
                />
                <Button
                  title={t("pets.addPoultryFarm")}
                  onPress={() => router.push("/add-poultry-farm")}
                  type="secondary"
                  size="small"
                  icon={<Feather size={16} color={COLORS.primary} />}
                  style={styles.headerButton}
                />
              </View>
            </View>

            {/* Poultry Farm Section - Only show user's own farms */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>حقول الدواجن</Text>
            </View>
            {userFarmsQuery.data && userFarmsQuery.data.length > 0 ? (
              userFarmsQuery.data.map((farm: any) => (
                <TouchableOpacity
                  key={farm.id}
                  style={styles.poultryFarmCard}
                  onPress={() => router.push("/poultry-farm-details")}
                  activeOpacity={0.8}
                >
                  <View style={styles.farmHeader}>
                    <View style={styles.farmIconContainer}>
                      <Feather size={32} color={COLORS.white} />
                    </View>
                    <View style={styles.farmInfo}>
                      <Text style={styles.farmName}>{farm.name}</Text>
                      <Text style={styles.farmLocation}>
                        <MapPin size={14} color={COLORS.darkGray} /> {farm.location}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(farm.status) }]}>
                        <Text style={styles.statusText}>نشط</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.farmDetails}>
                    <View style={styles.detailItem}>
                      <Square size={16} color={COLORS.primary} />
                      <Text style={styles.detailLabel}>المساحة:</Text>
                      <Text style={styles.detailValue}>{farm.totalArea} م²</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Users size={16} color={COLORS.primary} />
                      <Text style={styles.detailLabel}>السعة:</Text>
                      <Text style={styles.detailValue}>{farm.capacity} طائر</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyPoultryContainer}>
                <Text style={styles.emptyPoultryText}>لا يوجد حقول دواجن مسجلة</Text>
              </View>
            )}

            {/* Pets Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الحيوانات الأليفة</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا يوجد حيوانات مسجلة</Text>
            <Button
              title={t("pets.addPet")}
              onPress={handleAddPet}
              type="primary"
              size="medium"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.emptyButton}
            />
            <Button
              title={t("pets.addPoultryFarm")}
              onPress={() => router.push("/add-poultry-farm")}
              type="secondary"
              size="medium"
              icon={<Feather size={16} color={COLORS.primary} />}
              style={[styles.emptyButton, styles.poultryButton]}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  listContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  petCard: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  petInfo: {
    flex: 1,
    marginRight: 16,
    justifyContent: "center",
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  petType: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  reminderContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  reminderText: {
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 4,
  },
  lostBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lostBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  clinicCard: {
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
  clinicImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  premiumBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  premiumBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  clinicInfoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  clinicInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  ratingContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyButton: {
    width: "100%",
  },
  storeButton: {
    marginTop: 12,
    backgroundColor: "#8B5CF6",
  },
  headerButtons: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  headerButton: {
    flex: 1,
  },
  poultryButton: {
    marginTop: 12,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
  },
  poultryFarmCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  farmHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },
  farmIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  farmInfo: {
    flex: 1,
    marginRight: 16,
  },
  farmName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  farmLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  farmDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
  },
  detailItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.black,
  },
  batchInfo: {
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  batchTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 12,
  },
  batchStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  batchStat: {
    alignItems: "center",
    flex: 1,
  },
  batchStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 4,
  },
  batchStatLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: "center",
  },
  supervisionInfo: {
    gap: 8,
  },
  assignedPerson: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  assignedPersonText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.black,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  paymentText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  weeklyDataSection: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  weeklyDataTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  weeklyDataSubtitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 8,
  },
  weeklyDataButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    padding: 8,
    gap: 6,
  },
  weeklyDataButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  assignVetButton: {
    backgroundColor: "#10B981",
  },
  assignSupervisorButton: {
    backgroundColor: "#8B5CF6",
  },
  vetCommunicationSection: {
    marginTop: 12,
    backgroundColor: "#E8F5E8",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  vetSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10B981",
    textAlign: "center",
    marginBottom: 4,
  },
  vetSectionSubtitle: {
    fontSize: 12,
    color: "#10B981",
    textAlign: "center",
    marginBottom: 8,
    opacity: 0.8,
  },
  vetButtons: {
    flexDirection: "row",
    gap: 8,
  },
  vetButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  vetButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  communicationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  communicationButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  supervisorCommunicationSection: {
    marginTop: 12,
    backgroundColor: "#F3E8FF",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
  },
  supervisorSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8B5CF6",
    textAlign: "center",
    marginBottom: 4,
  },
  supervisorSectionSubtitle: {
    fontSize: 12,
    color: "#8B5CF6",
    textAlign: "center",
    marginBottom: 8,
    opacity: 0.8,
  },
  supervisorButtons: {
    flexDirection: "row",
    gap: 8,
  },
  supervisorButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  supervisorButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  cancelSupervisionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  cancelSupervisionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
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
    padding: 20,
    margin: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "right",
    backgroundColor: COLORS.white,
  },
  fieldsListContainer: {
    maxHeight: 200,
  },
  fieldListOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 8,
  },
  fieldListOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  fieldOptionContent: {
    alignItems: "flex-end",
  },
  fieldListOptionText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "right",
  },
  fieldListOptionTextSelected: {
    color: COLORS.white,
  },
  fieldOwnerText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 6,
    textAlign: "right",
  },
  fieldOwnerTextSelected: {
    color: COLORS.white,
    opacity: 0.8,
  },
  fieldTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-end",
  },
  fieldTypeBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
  clinicActions: {
    gap: 12,
    marginTop: 16,
    marginBottom: 120,
  },
  actionButton: {
    width: "100%",
  },
  searchSection: {
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "right",
  },
  searchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "right",
    paddingVertical: 4,
  },
  searchResults: {
    marginTop: 16,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: "right",
  },
  searchResultItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  searchResultInfo: {
    flex: 1,
    marginRight: 12,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 2,
  },
  searchResultType: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  searchResultId: {
    fontSize: 12,
    color: COLORS.primary,
  },
  noResults: {
    marginTop: 16,
    padding: 20,
    alignItems: "center",
    backgroundColor: COLORS.gray,
    borderRadius: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  recentSection: {
    marginBottom: 20,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "right",
  },
  recentScrollView: {
    paddingVertical: 4,
  },
  recentAnimalCard: {
    width: 120,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  recentAnimalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  recentAnimalInfo: {
    alignItems: "center",
    width: "100%",
  },
  recentAnimalName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "center",
  },
  recentAnimalType: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  warehouseCard: {
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
  warehouseImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  warehouseInfo: {
    flex: 1,
  },
  warehouseHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  warehouseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  warehouseInfoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  warehouseInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  warehouseStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  warehouseStat: {
    alignItems: "center",
    flex: 1,
  },
  warehouseStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 4,
  },
  warehouseStatLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: "center",
  },
  clinicStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  clinicStat: {
    alignItems: "center",
    flex: 1,
  },
  clinicStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 4,
  },
  clinicStatLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: "center",
  },
  emptyPoultryContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyPoultryText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  sectionContainer: {
    marginBottom: 20,
  },
});
