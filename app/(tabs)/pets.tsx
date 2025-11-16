import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ScrollView } from "react-native";
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
  Crown,
  Briefcase,
} from "lucide-react-native";
import { trpc } from "../../lib/trpc";
import { useQuery } from "@tanstack/react-query";

export default function PetsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { userMode, user, hasAdminAccess, isSuperAdmin, isModerator } = useApp();
  const flatListRef = useRef<FlatList>(null);

  // Fetch user's own pets
  const userPetsQuery = useQuery(trpc.pets.getUserPets.queryOptions({ userId: Number(user?.id) }));

  // Fetch user's own farms
  const userFarmsQuery = useQuery(trpc.poultryFarms.list.queryOptions({ ownerId: Number(user?.id) }));

  // Fetch ALL user's clinics (owned + assigned) using the new procedure
  const allUserClinicsQuery = useQuery({
    ...trpc.clinics.getUserApprovedClinics.queryOptions({ userId: Number(user?.id) }),
    enabled: !!user?.id && userMode === "veterinarian",
  });

  // Separate clinics into owned and assigned
  const { ownedClinics, assignedClinics } = useMemo(() => {
    const allClinics = allUserClinicsQuery.data?.clinics || [];

    return {
      ownedClinics: allClinics.filter((clinic: any) => clinic.isOwned),
      assignedClinics: allClinics.filter((clinic: any) => !clinic.isOwned),
    };
  }, [allUserClinicsQuery.data]);

  // Fetch user's approved stores (owned + assigned)
  const allUserStoresQuery = useQuery({
    ...trpc.stores.getUserApprovedStores.queryOptions({ userId: Number(user?.id) }),
    enabled: !!user?.id && userMode === "veterinarian",
  });

  // Separate stores into owned and assigned
  const { ownedStores, assignedStores } = useMemo(() => {
    const allStores = allUserStoresQuery.data?.stores || [];

    return {
      ownedStores: allStores.filter((store: any) => store.isOwned),
      assignedStores: allStores.filter((store: any) => !store.isOwned),
    };
  }, [allUserStoresQuery.data]);

  // Scroll to top when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [])
  );

  console.log({ ownedClinics });

  // Get user pets or admin view
  const displayPets = useMemo(() => {
    return userPetsQuery.data?.pets || [];
  }, [userPetsQuery.data]);

  // Get user farms or admin view
  const displayFarms = useMemo(() => {
    return userFarmsQuery.data?.farms || [];
  }, [userFarmsQuery.data]);

  const handlePetPress = (pet: any) => {
    console.log(pet);
    router.push({
      pathname: "/pet-details",
      params: { petId: pet?.id },
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

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      all: "كامل الصلاحيات",
      view_edit_pets: "عرض وتعديل الحيوانات",
      view_only: "عرض فقط",
      appointments_only: "المواعيد فقط",
    };
    return roles[role] || role;
  };

  const getStoreRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      all: "كامل الصلاحيات",
      view_edit_inventory: "عرض وتعديل المخزون",
      view_only: "عرض فقط",
      orders_only: "إدارة الطلبات فقط",
    };
    return roles[role] || role;
  };

  const handleAddPet = () => {
    router.push("/add-pet");
  };

  // Render clinic card component
  const renderClinicCard = (clinic: any, isOwned: boolean) => (
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
      {/* Ownership Badge */}
      <View style={[styles.ownershipBadge, isOwned ? styles.ownerBadge : styles.staffBadge]}>
        {isOwned ? (
          <>
            <Crown size={12} color={COLORS.white} />
            <Text style={styles.ownershipBadgeText}>مالك</Text>
          </>
        ) : (
          <>
            <Briefcase size={12} color={COLORS.white} />
            <Text style={styles.ownershipBadgeText}>طبيب</Text>
          </>
        )}
      </View>

      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400",
        }}
        style={styles.clinicImage}
      />
      <View style={styles.clinicInfo}>
        <View style={styles.clinicHeader}>
          <Text style={styles.clinicName}>{clinic.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.statusText}>مفعل</Text>
          </View>
        </View>

        {/* Show role for assigned clinics */}
        {!isOwned && clinic.role && (
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>الصلاحية:</Text>
            <Text style={styles.roleValue}>{getRoleLabel(clinic.role)}</Text>
          </View>
        )}

        <View style={styles.clinicInfoRow}>
          <MapPin size={14} color={COLORS.darkGray} />
          <Text style={styles.clinicInfoText}>{clinic.address}</Text>
        </View>
        <View style={styles.clinicInfoRow}>
          <Phone size={14} color={COLORS.darkGray} />
          <Text style={styles.clinicInfoText}>{clinic.phone}</Text>
        </View>

        {!isOwned && clinic.assignedAt && (
          <View style={styles.clinicInfoRow}>
            <Calendar size={14} color={COLORS.primary} />
            <Text style={styles.clinicInfoText}>
              تم التعيين: {new Date(clinic.assignedAt).toLocaleDateString("ar-SA")}
            </Text>
          </View>
        )}
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
  );

  // Render store card component
  const renderStoreCard = (store: any, isOwned: boolean) => (
    <TouchableOpacity
      key={store.id}
      style={styles.warehouseCard}
      onPress={() =>
        router.push({
          pathname: "/warehouse-management",
          params: {
            isOwner: store.isOwned,
            canEdit:
              store?.role === "view_edit_inventory" || store?.role === "all" || store?.isOwned ? "true" : "false",
          },
        })
      }
      activeOpacity={0.8}
    >
      {/* Ownership Badge */}
      <View style={[styles.ownershipBadge, isOwned ? styles.ownerBadge : styles.staffBadge]}>
        {isOwned ? (
          <>
            <Crown size={12} color={COLORS.white} />
            <Text style={styles.ownershipBadgeText}>مالك</Text>
          </>
        ) : (
          <>
            <Briefcase size={12} color={COLORS.white} />
            <Text style={styles.ownershipBadgeText}>موظف</Text>
          </>
        )}
      </View>

      <Image
        source={{
          uri: store.logo || store.bannerImage || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
        }}
        style={styles.warehouseImage}
      />
      <View style={styles.warehouseInfo}>
        <View style={styles.warehouseHeader}>
          <Text style={styles.warehouseName}>{store.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.statusText}>مفعل</Text>
          </View>
        </View>

        {/* Show role for assigned stores */}
        {!isOwned && store.role && (
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>الصلاحية:</Text>
            <Text style={styles.roleValue}>{getStoreRoleLabel(store.role)}</Text>
          </View>
        )}

        <View style={styles.warehouseInfoRow}>
          <MapPin size={14} color={COLORS.darkGray} />
          <Text style={styles.warehouseInfoText}>{store.address}</Text>
        </View>
        <View style={styles.warehouseInfoRow}>
          <Phone size={14} color={COLORS.darkGray} />
          <Text style={styles.warehouseInfoText}>{store.phone}</Text>
        </View>

        {!isOwned && store.assignedAt && (
          <View style={styles.warehouseInfoRow}>
            <Calendar size={14} color={COLORS.primary} />
            <Text style={styles.warehouseInfoText}>
              تم التعيين: {new Date(store.assignedAt).toLocaleDateString("ar-SA")}
            </Text>
          </View>
        )}

        {isOwned && store.activationEndDate && (
          <View style={styles.warehouseInfoRow}>
            <Calendar size={14} color={COLORS.primary} />
            <Text style={styles.warehouseInfoText}>
              صالح حتى: {new Date(store.activationEndDate).toLocaleDateString("ar-SA")}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.warehouseStats}>
        <View style={styles.warehouseStat}>
          <Package size={16} color={COLORS.primary} />
          <Text style={styles.warehouseStatValue}>{store.totalProducts || 45}</Text>
          <Text style={styles.warehouseStatLabel}>منتج</Text>
        </View>
        <View style={styles.warehouseStat}>
          <DollarSign size={16} color={COLORS.success} />
          <Text style={styles.warehouseStatValue}>{store.totalSales || 1247}</Text>
          <Text style={styles.warehouseStatLabel}>مبيعات</Text>
        </View>
        <View style={styles.warehouseStat}>
          <Users size={16} color={COLORS.warning} />
          <Text style={styles.warehouseStatValue}>{store.followers || 892}</Text>
          <Text style={styles.warehouseStatLabel}>متابع</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // If user is veterinarian, show clinic interface
  if (userMode === "veterinarian") {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.listContent}>
          <View style={styles.header}>
            <Text style={styles.title}>عيادتي ومخازني</Text>
            <Text style={styles.subtitle}>
              {ownedClinics.length + assignedClinics.length} عيادة • {ownedStores.length + assignedStores.length} مذخر
            </Text>
          </View>

          {/* Owned Clinics Section */}
          {ownedClinics.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Crown size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>عياداتي ({ownedClinics.length})</Text>
              </View>
              <Text style={styles.sectionDescription}>العيادات التي تملكها</Text>
              {ownedClinics.map((clinic: any) => renderClinicCard(clinic, true))}
            </View>
          )}

          {/* Assigned Clinics Section */}
          {assignedClinics.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Briefcase size={20} color={COLORS.success} />
                <Text style={styles.sectionTitle}>أعمل فيها ({assignedClinics.length})</Text>
              </View>
              <Text style={styles.sectionDescription}>العيادات المعين فيها كطبيب</Text>
              {assignedClinics.map((clinic: any) => renderClinicCard(clinic, false))}
            </View>
          )}

          {/* Owned Stores Section */}
          {ownedStores.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Crown size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>مخازني ({ownedStores.length})</Text>
              </View>
              <Text style={styles.sectionDescription}>المخازن التي تملكها</Text>
              {ownedStores.map((store: any) => renderStoreCard(store, true))}
            </View>
          )}

          {/* Assigned Stores Section */}
          {assignedStores.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Briefcase size={20} color={COLORS.success} />
                <Text style={styles.sectionTitle}>أعمل فيها ({assignedStores.length})</Text>
              </View>
              <Text style={styles.sectionDescription}>المخازن المعين فيها كموظف</Text>
              {assignedStores.map((store: any) => renderStoreCard(store, false))}
            </View>
          )}

          {/* Empty State for No Clinics/Warehouses */}
          {ownedClinics.length === 0 &&
            assignedClinics.length === 0 &&
            ownedStores.length === 0 &&
            assignedStores.length === 0 && (
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
          </View>
        </ScrollView>
      </View>
    );
  }

  const renderPetItem = ({ item }: { item: any }) => {
    const isAdmin = hasAdminAccess || isSuperAdmin || isModerator;

    return (
      <TouchableOpacity style={styles.petCard} onPress={() => handlePetPress(item)} activeOpacity={0.8}>
        <Image
          source={{
            uri: item.image || "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
          }}
          style={styles.petImage}
        />
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petType}>
            {t(`${item.type}`)} {item.breed ? `- ${item.breed}` : ""}
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
                {hasAdminAccess || isSuperAdmin || isModerator ? "إدارة الحيوانات والمزارع" : "حيواناتي"}
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
              <Text style={styles.sectionTitle}>حقول الدواجن ({displayFarms.length})</Text>
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
                      {(hasAdminAccess || isSuperAdmin || isModerator) && farm.ownerName && (
                        <View style={styles.ownerInfo}>
                          <Users size={14} color={COLORS.primary} />
                          <Text style={styles.ownerText}>المالك: {farm.ownerName}</Text>
                        </View>
                      )}

                      <View style={styles.farmBadges}>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: getStatusColor(farm.healthStatus || "healthy"),
                            },
                          ]}
                        >
                          <Text style={styles.statusText}>{getHealthStatusLabel(farm.healthStatus || "healthy")}</Text>
                        </View>
                        <View style={[styles.typeBadge, { backgroundColor: COLORS.primary }]}>
                          <Text style={styles.typeBadgeText}>{getFarmTypeLabel(farm.farmType)}</Text>
                        </View>
                        {farm.isVerified && (
                          <View style={[styles.verifiedBadge, { backgroundColor: COLORS.success }]}>
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
                      <Text style={styles.detailValue}>{farm.capacity || 0} طائر</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Activity size={16} color={COLORS.success} />
                      <Text style={styles.detailLabel}>الحالي:</Text>
                      <Text style={styles.detailValue}>{farm.currentPopulation || 0} طائر</Text>
                    </View>
                  </View>

                  {farm.licenseNumber && (
                    <View style={styles.licenseInfo}>
                      <Text style={styles.licenseText}>رقم الترخيص: {farm.licenseNumber}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyPoultryContainer}>
                <Feather size={48} color={COLORS.lightGray} />
                <Text style={styles.emptyPoultryText}>لا يوجد حقول دواجن مسجلة</Text>
              </View>
            )}

            {/* Pets Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الحيوانات الأليفة ({displayPets.length})</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا يوجد حيوانات مسجلة</Text>
            <Button
              title={t("إضافة حيوان")}
              onPress={handleAddPet}
              type="primary"
              size="medium"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.emptyButton}
            />
            <Button
              title={t("إضافة حقل")}
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
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "right",
    marginTop: 4,
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
  sectionHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "right",
    marginBottom: 12,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  poultryButton: {
    marginTop: 12,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
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
    position: "relative",
  },
  ownershipBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    zIndex: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  ownerBadge: {
    backgroundColor: COLORS.primary,
  },
  staffBadge: {
    backgroundColor: COLORS.success,
  },
  ownershipBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "bold",
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
    flex: 1,
  },
  roleContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.gray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  roleLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginLeft: 6,
  },
  roleValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primary,
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
    flex: 1,
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
});
