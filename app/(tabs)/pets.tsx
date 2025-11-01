import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import React, { useRef, useMemo, useState } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { useRouter, useFocusEffect } from "expo-router";
import Button from "../../components/Button 2";
import {
  Calendar,
  Plus,
  MapPin,
  Phone,
  Store,
  Feather,
  Users,
  Activity,
  DollarSign,
  Stethoscope,
  CheckCircle,
  Package,
  AlertCircle,
  UserPlus,
  UserCheck,
} from "lucide-react-native";
import { trpc } from "../../lib/trpc";
import { useQuery } from "@tanstack/react-query";

export default function PetsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { userMode, user, hasAdminAccess, isSuperAdmin, isModerator } =
    useApp();
  const flatListRef = useRef<FlatList>(null);

  const [showAssignVetModal, setShowAssignVetModal] = useState(false);
  const [showAssignSupervisorModal, setShowAssignSupervisorModal] =
    useState(false);

  // Fetch user's own pets
  const userPetsQuery = useQuery({
    ...trpc.pets.getUserPets.queryOptions(
      { userId: Number(user?.id) || 0 }
      // { enabled: !!user?.id && userMode !== "veterinarian" }
    ),
    enabled: !!user?.id && userMode !== "veterinarian",
  });

  // Fetch user's own farms
  const userFarmsQuery = useQuery(
    trpc.poultryFarms.list.queryOptions(
      { ownerId: Number(user?.id) || 0 },
      {
        enabled: !!user?.id && userMode !== "veterinarian",
      }
    )
  );

  // Fetch all pets for admin
  // const allPetsQuery = useQuery(
  //   trpc.pets.getAllForAdmin.queryOptions(
  //     { adminId: Number(user?.id) || 0 },
  //     { enabled: !!user?.id && (hasAdminAccess || isSuperAdmin || isModerator) }
  //   )
  // );

  // // Fetch all farms for admin
  // const allFarmsQuery = useQuery(
  //   trpc.pets.getAllFarmsForAdmin.queryOptions(
  //     { adminId: Number(user?.id) || 0 },
  //     { enabled: !!user?.id && (hasAdminAccess || isSuperAdmin || isModerator) }
  //   )
  // );

  // Fetch user's approved clinics (for veterinarians)
  const userClinicsQuery = useQuery(
    {
      ...trpc.clinics.getUserApprovedClinics.queryOptions({userId: Number(user?.id)}),       
    enabled: !!user?.id && userMode === "veterinarian", }
  );

  // Fetch user's approved warehouses (for veterinarians)
  const userWarehousesQuery = useQuery(
    trpc.warehouses.getUserApprovedWarehouses.queryOptions({ userId: Number(user?.id)}, {
      enabled: !!user?.id && userMode === "veterinarian",
    })
  );

  // Get approved clinics and warehouses
  const approvedClinics = userClinicsQuery.data?.clinics || [];
  const approvedWarehouses = userWarehousesQuery.data?.warehouses || [];

  // Scroll to top when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [])
  );

  // Get user pets or admin view
  const displayPets = useMemo(() => {
    // if (hasAdminAccess || isSuperAdmin || isModerator) {
    //   return allPetsQuery.data?.pets || [];
    // }
    return userPetsQuery.data?.pets || [];
  }, [
    hasAdminAccess,
    isSuperAdmin,
    isModerator,
    // allPetsQuery.data,
    userPetsQuery.data,
  ]);

  // Get user farms or admin view
  const displayFarms = useMemo(() => {
    // if (hasAdminAccess || isSuperAdmin || isModerator) {
    //   return allFarmsQuery.data?.farms || [];
    // }
    return userFarmsQuery.data?.farms || [];
  }, [
    hasAdminAccess,
    isSuperAdmin,
    isModerator,
    // allFarmsQuery.data,
    userFarmsQuery.data,
  ]);

  const handlePetPress = (pet: any) => {
    router.push({
      pathname: "/pet-details",
      params: { id: pet.id },
    });
  };

  const handleFarmPress = (farm: any) => {
    router.push({
      pathname: "/poultry-farm-details",
      params: { id: farm.id },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "healthy":
        return COLORS.success;
      case "completed":
        return COLORS.primary;
      case "inactive":
      case "quarantine":
        return COLORS.warning;
      case "sick":
        return COLORS.error;
      default:
        return COLORS.darkGray;
    }
  };

  const getFarmTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      broiler: "تسمين",
      layer: "بياض",
      breeder: "أمهات",
      mixed: "مختلط",
    };
    return types[type] || type;
  };

  const getHealthStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      healthy: "سليم",
      quarantine: "حجر صحي",
      sick: "مريض",
    };
    return statuses[status] || status;
  };

  const handleAddPet = () => {
    router.push('/add-pet');
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
                    source={{
                      uri:
                        clinic.image ||
                        "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400",
                    }}
                    style={styles.clinicImage}
                  />
                  <View style={styles.clinicInfo}>
                    <View style={styles.clinicHeader}>
                      <Text style={styles.clinicName}>{clinic.name}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: COLORS.success },
                        ]}
                      >
                        <Text style={styles.statusText}>مفعل</Text>
                      </View>
                    </View>
                    <View style={styles.clinicInfoRow}>
                      <MapPin size={14} color={COLORS.darkGray} />
                      <Text style={styles.clinicInfoText}>
                        {clinic.address}
                      </Text>
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
                          ? new Date(
                              clinic.activationEndDate
                            ).toLocaleDateString("ar-SA")
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
                      uri:
                        warehouse.image ||
                        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
                    }}
                    style={styles.warehouseImage}
                  />
                  <View style={styles.warehouseInfo}>
                    <View style={styles.warehouseHeader}>
                      <Text style={styles.warehouseName}>{warehouse.name}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: COLORS.success },
                        ]}
                      >
                        <Text style={styles.statusText}>مفعل</Text>
                      </View>
                    </View>
                    <View style={styles.warehouseInfoRow}>
                      <MapPin size={14} color={COLORS.darkGray} />
                      <Text style={styles.warehouseInfoText}>
                        {warehouse.address}
                      </Text>
                    </View>
                    <View style={styles.warehouseInfoRow}>
                      <Phone size={14} color={COLORS.darkGray} />
                      <Text style={styles.warehouseInfoText}>
                        {warehouse.phone}
                      </Text>
                    </View>
                    <View style={styles.warehouseInfoRow}>
                      <Calendar size={14} color={COLORS.primary} />
                      <Text style={styles.warehouseInfoText}>
                        صالح حتى:{" "}
                        {warehouse.activationEndDate
                          ? new Date(
                              warehouse.activationEndDate
                            ).toLocaleDateString("ar-SA")
                          : "غير محدد"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.warehouseStats}>
                    <View style={styles.warehouseStat}>
                      <Package size={16} color={COLORS.primary} />
                      <Text style={styles.warehouseStatValue}>
                        {warehouse.totalProducts || 45}
                      </Text>
                      <Text style={styles.warehouseStatLabel}>منتج</Text>
                    </View>
                    <View style={styles.warehouseStat}>
                      <DollarSign size={16} color={COLORS.success} />
                      <Text style={styles.warehouseStatValue}>
                        {warehouse.totalSales || 1247}
                      </Text>
                      <Text style={styles.warehouseStatLabel}>مبيعات</Text>
                    </View>
                    <View style={styles.warehouseStat}>
                      <Users size={16} color={COLORS.warning} />
                      <Text style={styles.warehouseStatValue}>
                        {warehouse.followers || 892}
                      </Text>
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
              <Text style={styles.emptyStateText}>
                لا توجد عيادات أو مخازن مفعلة
              </Text>
              <Text style={styles.emptyStateSubtext}>
                بعد الموافقة على طلباتك ستظهر لوحات التحكم هنا
              </Text>
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
      </View>
    );
  }

  const renderPetItem = ({ item }: { item: any }) => {
    const isAdmin = hasAdminAccess || isSuperAdmin || isModerator;

    return (
      <TouchableOpacity
        style={styles.petCard}
        onPress={() => handlePetPress(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{
            uri:
              item.image ||
              "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
          }}
          style={styles.petImage}
        />
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petType}>
            {t(`pets.types.${item.type}`)} {item.breed ? `- ${item.breed}` : ""}
          </Text>

          {/* Show owner info for admins */}
          {isAdmin && item.ownerName && (
            <View style={styles.ownerInfo}>
              <Users size={14} color={COLORS.primary} />
              <Text style={styles.ownerText}>المالك: {item.ownerName}</Text>
            </View>
          )}

          {item.isLost && (
            <View style={styles.lostBadge}>
              <AlertCircle size={12} color={COLORS.white} />
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
        data={displayPets}
        renderItem={renderPetItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>
                {hasAdminAccess || isSuperAdmin || isModerator
                  ? "إدارة الحيوانات والمزارع"
                  : "حيواناتي"}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.headerButtons}>
              <Button
                title={t("اضافة حيوان")}
                onPress={() => router.push("/add-pet")}
                type="primary"
                size="small"
                icon={<Plus size={16} color={COLORS.white} />}
                style={styles.headerButton}
              />
              <Button
                title={t("اضافة حقل دواجن")}
                onPress={() => router.push("/add-poultry-farm")}
                type="secondary"
                size="small"
                icon={<Feather size={16} color={COLORS.primary} />}
                style={styles.headerButton}
              />
            </View>

            {/* Poultry Farms Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                حقول الدواجن ({displayFarms.length})
              </Text>
            </View>

            {displayFarms.length > 0 ? (
              displayFarms.map((farm: any) => (
                <TouchableOpacity
                  key={farm.id}
                  style={styles.poultryFarmCard}
                  onPress={() => handleFarmPress(farm)}
                  activeOpacity={0.8}
                >
                  <View style={styles.farmHeader}>
                    <View style={styles.farmIconContainer}>
                      <Feather size={32} color={COLORS.white} />
                    </View>
                    <View style={styles.farmInfo}>
                      <Text style={styles.farmName}>{farm.name}</Text>
                      <View style={styles.farmLocationRow}>
                        <MapPin size={14} color={COLORS.darkGray} />
                        <Text style={styles.farmLocation}>{farm.location}</Text>
                      </View>

                      {/* Show owner info for admins */}
                      {(hasAdminAccess || isSuperAdmin || isModerator) &&
                        farm.ownerName && (
                          <View style={styles.ownerInfo}>
                            <Users size={14} color={COLORS.primary} />
                            <Text style={styles.ownerText}>
                              المالك: {farm.ownerName}
                            </Text>
                          </View>
                        )}

                      <View style={styles.farmBadges}>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: getStatusColor(
                                farm.healthStatus || "healthy"
                              ),
                            },
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {getHealthStatusLabel(
                              farm.healthStatus || "healthy"
                            )}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.typeBadge,
                            { backgroundColor: COLORS.primary },
                          ]}
                        >
                          <Text style={styles.typeBadgeText}>
                            {getFarmTypeLabel(farm.farmType)}
                          </Text>
                        </View>
                        {farm.isVerified && (
                          <View
                            style={[
                              styles.verifiedBadge,
                              { backgroundColor: COLORS.success },
                            ]}
                          >
                            <CheckCircle size={12} color={COLORS.white} />
                            <Text style={styles.verifiedBadgeText}>موثق</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.farmDetails}>
                    <View style={styles.detailItem}>
                      <Users size={16} color={COLORS.primary} />
                      <Text style={styles.detailLabel}>السعة:</Text>
                      <Text style={styles.detailValue}>
                        {farm.capacity || 0} طائر
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Activity size={16} color={COLORS.success} />
                      <Text style={styles.detailLabel}>الحالي:</Text>
                      <Text style={styles.detailValue}>
                        {farm.currentPopulation || 0} طائر
                      </Text>
                    </View>
                  </View>

                  {farm.licenseNumber && (
                    <View style={styles.licenseInfo}>
                      <Text style={styles.licenseText}>
                        رقم الترخيص: {farm.licenseNumber}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyPoultryContainer}>
                <Feather size={48} color={COLORS.lightGray} />
                <Text style={styles.emptyPoultryText}>
                  لا يوجد حقول دواجن مسجلة
                </Text>
              </View>
            )}

            {/* Pets Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                الحيوانات الأليفة ({displayPets.length})
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا يوجد حيوانات مسجلة</Text>
            <Button
              title={t('إضافة حيوان')}
              onPress={handleAddPet}
              type="primary"
              size="medium"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.emptyButton}
            />
            <Button
              title={t('إضافة حقل')}
              onPress={() => router.push('/add-poultry-farm')}
              type="secondary"
              size="medium"
              icon={<Feather size={16} color={COLORS.primary} />}
              style={[styles.emptyButton, styles.poultryButton]}
            />
          </View>
        }
      />
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
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
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
    fontSize: 16,
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
    fontSize: 14,
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
    textAlign: "right",
  },
  searchResultType: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 2,
    textAlign: "right",
  },
  searchResultId: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: "right",
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
  headerButtons: {
    flexDirection: "row-reverse",
    gap: 8,
    marginBottom: 20,
  },
  headerButton: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  poultryButton: {
    marginTop: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
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
    alignItems: "flex-start",
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
    marginBottom: 6,
    textAlign: "right",
  },
  farmLocationRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  farmLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  farmBadges: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  verifiedBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  farmDetails: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.darkGray,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.black,
  },
  licenseInfo: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  licenseText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  emptyPoultryContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyPoultryText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 12,
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
    textAlign: "right",
  },
  petType: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: "right",
  },
  ownerInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  ownerText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  lostBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    gap: 4,
  },
  lostBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyButton: {
    width: "100%",
  },
  // Veterinarian specific styles
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
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  clinicActions: {
    gap: 12,
    marginTop: 16,
    marginBottom: 120,
  },
  actionButton: {
    width: "100%",
  },
  storeButton: {
    backgroundColor: "#8B5CF6",
  },
  sectionContainer: {
    marginBottom: 20,
  },

  assignVetButton: {
    backgroundColor: "#10B981",
  },
  assignSupervisorButton: {
    backgroundColor: "#8B5CF6",
  },
});
