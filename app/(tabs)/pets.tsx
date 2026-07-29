import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ScrollView, ActivityIndicator } from "react-native";
import React, { useRef, useMemo, useState } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { useRouter, useFocusEffect } from "expo-router";
import { useToastContext } from "../../providers/ToastProvider";
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
  RefreshCw,
  Clock,
  ArrowRightLeft,
} from "lucide-react-native";
import { trpc } from "../../lib/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PoultryFarmChatButton } from "../../components/poultry/PoultryFarmChatButton";
import { PET_TYPE_LABELS } from "../add-adoption-pet";

export default function PetsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { userMode, user, hasAdminAccess, isSuperAdmin, isModerator } = useApp();
  const { showToast } = useToastContext();
  const flatListRef = useRef<FlatList>(null);

  // Fetch user's own pets
  const userPetsQuery = useQuery(trpc.pets.getUserPets.queryOptions({ userId: Number(user?.id) }));

  // Fetch user's own farms
  const userFarmsQuery = useQuery(trpc.poultryFarms.list.queryOptions({ ownerId: Number(user?.id) }));

  // Check if user has a trader account
  const traderQuery = useQuery({
    ...trpc.poultry.traders.getMyProfile.queryOptions(),
    enabled: !!user?.id,
  });

  // Fetch farms where user is a worker
  const workerFarmsQuery = useQuery({
    ...trpc.poultryFarms.getWorkerFarms.queryOptions({ userId: Number(user?.id) }),
    enabled: !!user?.id,
  });

  // Fetch farms linked to vet via farm-doctor link (vet mode only)
  const linkedFarmsQuery = useQuery({
    ...trpc.poultry.farmDoctor.getMyFarms.queryOptions(),
    enabled: !!user?.id && userMode === "veterinarian",
  });

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

  // Get items that need renewal
  const itemsNeedingRenewal = useMemo(() => {
    const items: Array<{ type: "clinic" | "store"; data: any }> = [];

    ownedClinics.forEach((clinic: any) => {
      if (clinic.needsRenewal && clinic.daysRemaining !== null && clinic.daysRemaining < 30) {
        items.push({ type: "clinic", data: clinic });
      }
    });

    ownedStores.forEach((store: any) => {
      if (store.needsRenewal && store.daysRemaining !== null && store.daysRemaining < 30) {
        items.push({ type: "store", data: store });
      }
    });

    return items;
  }, [ownedClinics, ownedStores]);

  // Renewal mutations
  const requestClinicRenewalMutation = useMutation(trpc.clinics.settings.requestRenewal.mutationOptions());
  const requestStoreRenewalMutation = useMutation(trpc.stores.settings.requestRenewal.mutationOptions());
  const requestFarmRenewalMutation = useMutation(trpc.poultryFarms.requestRenewal.mutationOptions());
  const requestTraderRenewalMutation = useMutation(trpc.poultry.traders.requestRenewal.mutationOptions());

  // Scroll to top when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, []),
  );

  // Get user pets or admin view
  const displayPets = useMemo(() => {
    return userPetsQuery.data?.pets || [];
  }, [userPetsQuery.data]);

  // Get user farms or admin view
  const displayFarms = useMemo(() => {
    return userFarmsQuery.data?.farms || [];
  }, [userFarmsQuery.data]);

  const workerFarms = useMemo(() => {
    return workerFarmsQuery.data?.farms || [];
  }, [workerFarmsQuery.data]);

  const linkedFarms = useMemo(() => {
    return linkedFarmsQuery.data?.farms || [];
  }, [linkedFarmsQuery.data]);

  const handlePetPress = (pet: any) => {
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

  const handlePoultrySection = () => {
    const trader = traderQuery.data?.trader;
    const endDate = trader?.activationEndDate ? new Date(trader.activationEndDate as any) : null;
    const isTraderExpired = endDate ? endDate.getTime() < Date.now() : true;
    const hasTrader = trader?.status === "active" && !isTraderExpired && !trader?.needsRenewal;
    const hasFarm = displayFarms.some((farm: any) => farm.status === "active");

    if (hasFarm || hasTrader) {
      router.push("/poultry-dashboard");
    } else {
      router.push("/poultry-section");
    }
  };

  const handleRenewTraderSubscription = (traderId: number, hasRenewal: boolean) => {
    if (hasRenewal) {
      showToast({ type: "warning", message: "يوجد طلب تجديد قيد المراجعة بالفعل. سيتم إشعارك عند الموافقة عليه." });
      return;
    }
    requestTraderRenewalMutation.mutate(
      { traderId },
      {
        onSuccess: () => {
          traderQuery.refetch();
          showToast({ type: "success", message: "تم إرسال طلب التجديد بنجاح. سيتم مراجعته من قبل الإدارة." });
        },
        onError: (error: any) => {
          showToast({ type: "error", message: error.message || "حدث خطأ أثناء إرسال طلب التجديد" });
        },
      },
    );
  };

  const handleRenewFarmSubscription = (farmId: number, ownerId: number, hasRenewal: boolean) => {
    if (hasRenewal) {
      showToast({ type: "warning", message: "يوجد طلب تجديد قيد المراجعة بالفعل. سيتم إشعارك عند الموافقة عليه." });
      return;
    }
    requestFarmRenewalMutation.mutate(
      { farmId, ownerId },
      {
        onSuccess: () => {
          userFarmsQuery.refetch();
          showToast({ type: "success", message: "تم إرسال طلب التجديد بنجاح. سيتم مراجعته من قبل الإدارة." });
        },
        onError: (error) => {
          showToast({ type: "error", message: error.message || "حدث خطأ أثناء إرسال طلب التجديد" });
        },
      },
    );
  };

  const handleRenewSubscription = (type: "clinic" | "store", id: number, hasRenewal: boolean) => {
    // Validate required data
    if (!id || !type) {
      showToast({
        type: "error",
        message: "بيانات غير صحيحة. يرجى المحاولة مرة أخرى.",
      });
      return;
    }

    if (hasRenewal) {
      showToast({
        type: "warning",
        message: "يوجد طلب تجديد قيد المراجعة بالفعل. سيتم إشعارك عند الموافقة عليه.",
      });
      return;
    }

    const resourceType = type === "clinic" ? "العيادة" : "المذخر";

    // Since we can't use Alert.alert with callbacks, we'll directly submit
    // In a production app, you might want to add a confirmation modal component
    try {
      if (type === "clinic") {
        requestClinicRenewalMutation.mutate({ clinicId: Number(id) } as any, {
          onSuccess: () => {
            queryClient.invalidateQueries(trpc.clinics.getUserApprovedClinics.queryKey);
            allUserClinicsQuery.refetch();
            showToast({
              type: "success",
              message: "تم إرسال طلب التجديد بنجاح. سيتم مراجعته من قبل الإدارة وسيتم إشعارك عند الموافقة.",
            });
          },
          onError: (error) => {
            showToast({
              type: "error",
              message: error.message || "حدث خطأ أثناء إرسال طلب التجديد",
            });
          },
        });
      } else {
        requestStoreRenewalMutation.mutate({ storeId: Number(id) } as any, {
          onSuccess: () => {
            queryClient.invalidateQueries(trpc.stores.getUserApprovedStores.queryKey);
            allUserStoresQuery.refetch();
            showToast({
              type: "success",
              message: "تم إرسال طلب التجديد بنجاح. سيتم مراجعته من قبل الإدارة وسيتم إشعارك عند الموافقة.",
            });
          },
          onError: (error) => {
            showToast({
              type: "error",
              message: error.message || "حدث خطأ أثناء إرسال طلب التجديد",
            });
          },
        });
      }
    } catch (error: any) {
      showToast({
        type: "error",
        message: error.message || "حدث خطأ أثناء إرسال الطلب",
      });
    }
  };

  // Render subscription renewal card
  const renderSubscriptionCard = (item: { type: "clinic" | "store" | "farm" | "trader"; data: any; readOnly?: boolean }) => {
    const { type, data, readOnly } = item;
    const isClinic = type === "clinic";
    const isFarm = type === "farm";
    const isTrader = type === "trader";
    const resourceName = data.name;
    const startDate = data.activationStartDate ? new Date(data.activationStartDate) : null;
    const endDate = data.activationEndDate ? new Date(data.activationEndDate) : null;
    // farms and traders don't have pre-computed daysRemaining — compute client-side
    const daysRemaining = isFarm || isTrader ? (endDate ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0) : data.daysRemaining || 0;
    const needsRenewal = data.needsRenewal || false;
    const reviewingRenewalRequest = data.reviewingRenewalRequest || false;
    const isExpired = daysRemaining < 1;

    const getStatusInfo = () => {
      if (reviewingRenewalRequest) {
        return { text: "قيد المراجعة", color: COLORS.warning };
      }
      if (isExpired) {
        return { text: "منتهي", color: COLORS.error };
      }
      if (daysRemaining < 7) {
        return { text: "عاجل", color: COLORS.error };
      }
      if (daysRemaining < 30) {
        return { text: "قريب الانتهاء", color: COLORS.warning };
      }
      return { text: "نشط", color: COLORS.success };
    };

    const statusInfo = getStatusInfo();
    const isLoading = isFarm
      ? requestFarmRenewalMutation.isPending
      : isTrader
        ? requestTraderRenewalMutation.isPending
        : type === "clinic"
          ? requestClinicRenewalMutation.isPending
          : requestStoreRenewalMutation.isPending;

    return (
      <View key={`${type}-${data.id}`} style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <View style={styles.subscriptionIconContainer}>
            {isClinic ? (
              <Stethoscope size={20} color={COLORS.primary} />
            ) : isFarm ? (
              <Feather size={20} color="#F59E0B" />
            ) : isTrader ? (
              <Briefcase size={20} color="#D97706" />
            ) : (
              <Package size={20} color={COLORS.primary} />
            )}
          </View>
          <View style={styles.subscriptionHeaderText}>
            <Text style={styles.subscriptionTitle}>
              {isClinic ? "اشتراك العيادة" : isFarm ? "اشتراك حقل الدواجن" : isTrader ? "اشتراك حساب التاجر" : "اشتراك المذخر"}
            </Text>
            <Text style={styles.subscriptionResourceName} numberOfLines={1}>
              {resourceName}
            </Text>
          </View>
        </View>

        <View style={styles.subscriptionContent}>
          <View style={[styles.subscriptionBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.subscriptionBadgeText}>{statusInfo.text}</Text>
          </View>

          <View style={styles.subscriptionDates}>
            {startDate && (
              <View style={styles.dateItem}>
                <Calendar size={16} color={COLORS.darkGray} />
                <Text style={styles.dateLabel}>تاريخ الانتهاء:</Text>
                <Text style={styles.dateValue}>{startDate.toLocaleDateString("ar-EG")}</Text>
              </View>
            )}
            {endDate && (
              <View style={styles.dateItem}>
                <Calendar size={16} color={COLORS.darkGray} />
                <Text style={styles.dateLabel}>تاريخ الانتهاء:</Text>
                <Text style={styles.dateValue}>{endDate.toLocaleDateString("ar-EG")}</Text>
              </View>
            )}

            <View style={styles.dateItem}>
              <Clock size={16} color={COLORS.darkGray} />
              <Text style={styles.dateLabel}>الأيام المتبقية:</Text>
              <Text
                style={[
                  styles.dateValue,
                  {
                    color: daysRemaining < 7 ? COLORS.error : daysRemaining < 30 ? COLORS.warning : COLORS.success,
                  },
                ]}
              >
                {daysRemaining} يوم
              </Text>
            </View>
          </View>

          {!readOnly && (
            <View style={styles.subscriptionActions}>
              <TouchableOpacity
                style={[styles.renewButton, (isLoading || reviewingRenewalRequest) && { opacity: 0.6 }]}
                onPress={() =>
                  isFarm
                    ? handleRenewFarmSubscription(data.id, Number(user?.id), reviewingRenewalRequest)
                    : isTrader
                      ? handleRenewTraderSubscription(data.id, reviewingRenewalRequest)
                      : handleRenewSubscription(type as "clinic" | "store", data.id, reviewingRenewalRequest)
                }
                disabled={isLoading || reviewingRenewalRequest}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <RefreshCw size={16} color={COLORS.white} />
                    <Text style={styles.renewButtonText}>{reviewingRenewalRequest ? "قيد المراجعة" : "تجديد الاشتراك"}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {reviewingRenewalRequest && (
            <View style={styles.pendingRenewalBanner}>
              <View style={styles.pendingRenewalIcon}>
                <Clock size={16} color={COLORS.warning} />
              </View>
              <Text style={styles.pendingRenewalText}>يوجد طلب تجديد قيد المراجعة</Text>
            </View>
          )}

          {isExpired && !needsRenewal && (
            <View style={styles.expiredBanner}>
              <View style={styles.expiredIcon}>
                <AlertCircle size={16} color={COLORS.error} />
              </View>
              <Text style={styles.expiredText}>
                {readOnly
                  ? `اشتراك ${isClinic ? "العيادة" : isFarm ? "حقل الدواجن" : isTrader ? "حساب التاجر" : "المذخر"} منتهي`
                  : `الاشتراك منتهي. يرجى التجديد للوصول إلى ${isClinic ? "العيادة" : isFarm ? "حقل الدواجن" : isTrader ? "حساب التاجر" : "المذخر"}`}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render clinic card component
  const renderClinicCard = (clinic: any, isOwned: boolean) => {
    // If clinic needs renewal, show subscription card instead
    if (isOwned && clinic.needsRenewal) {
      return renderSubscriptionCard({ type: "clinic", data: clinic });
    }

    return (
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

        {clinic.images?.[0] ? (
          <Image
            source={{
              uri: clinic.images?.[0] || "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400",
            }}
            style={styles.clinicImage}
          />
        ) : null}
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
              <Text style={styles.clinicInfoText}>تم التعيين: {new Date(clinic.assignedAt).toLocaleDateString("ar-SA")}</Text>
            </View>
          )}
        </View>
        <View style={styles.clinicStats}>
          <View style={styles.clinicStat}>
            <Users size={16} color={COLORS.primary} />
            <Text style={styles.clinicStatValue}>{clinic.totalAnimals}</Text>
            <Text style={styles.clinicStatLabel}>مريض</Text>
          </View>
          <View style={styles.clinicStat}>
            <Activity size={16} color={COLORS.success} />
            <Text style={styles.clinicStatValue}>{clinic.activePatients}</Text>
            <Text style={styles.clinicStatLabel}>نشط</Text>
          </View>
          <View style={styles.clinicStat}>
            <CheckCircle size={16} color={COLORS.primary} />
            <Text style={styles.clinicStatValue}>{clinic.completedTreatments}</Text>
            <Text style={styles.clinicStatLabel}>مكتمل</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render store card component
  const renderStoreCard = (store: any, isOwned: boolean) => {
    // If store needs renewal, show subscription card instead
    if (isOwned && store.needsRenewal) {
      return renderSubscriptionCard({ type: "store", data: store });
    }

    return (
      <TouchableOpacity
        key={store.id}
        style={styles.warehouseCard}
        onPress={() =>
          router.push({
            pathname: "/warehouse-management",
            params: {
              isOwner: store.isOwned,
              canEdit: store?.role === "view_edit_inventory" || store?.role === "all" || store?.isOwned ? "true" : "false",
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

        {store?.images?.length > 0 ? (
          <Image
            source={{
              uri: store.images[0],
            }}
            style={styles.warehouseImage}
          />
        ) : null}
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
              <Text style={styles.warehouseInfoText}>تم التعيين: {new Date(store.assignedAt).toLocaleDateString("ar-SA")}</Text>
            </View>
          )}

          {isOwned && store.activationEndDate && (
            <View style={styles.warehouseInfoRow}>
              <Calendar size={14} color={COLORS.primary} />
              <Text style={styles.warehouseInfoText}>صالح حتى: {new Date(store.activationEndDate).toLocaleDateString("ar-SA")}</Text>
            </View>
          )}
        </View>
        <View style={styles.warehouseStats}>
          <View style={styles.warehouseStat}>
            <Package size={16} color={COLORS.primary} />
            <Text style={styles.warehouseStatValue}>{store.totalProducts}</Text>
            <Text style={styles.warehouseStatLabel}>منتج</Text>
          </View>
          <View style={styles.warehouseStat}>
            <DollarSign size={16} color={COLORS.success} />
            <Text style={styles.warehouseStatValue}>{store.totalSales}</Text>
            <Text style={styles.warehouseStatLabel}>مبيعات</Text>
          </View>
          <View style={styles.warehouseStat}>
            <Users size={16} color={COLORS.warning} />
            <Text style={styles.warehouseStatValue}>{store.followers}</Text>
            <Text style={styles.warehouseStatLabel}>متابع</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // If user is veterinarian, show clinic interface
  if (userMode === "veterinarian") {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.listContent}>
          <View style={styles.header}>
            <Text style={styles.title}>عيادتي ومخازني وحقولي</Text>
            <Text style={styles.subtitle}>
              {ownedClinics.length + assignedClinics.length} عيادة • {ownedStores.length + assignedStores.length} مذخر • {linkedFarms.length} حقل دواجن
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

          {/* Linked Farms Section (vet linked via farm-doctor code) */}
          {linkedFarms.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Feather size={20} color="#F59E0B" />
                <Text style={styles.sectionTitle}>حقول الدواجن المرتبطة ({linkedFarms.length})</Text>
              </View>
              <Text style={styles.sectionDescription}>حقول الدواجن المرتبطة بك كطبيب بيطري</Text>
              {linkedFarms.map((link: any) => {
                if (link.needsRenewal) {
                  return renderSubscriptionCard({
                    type: "farm",
                    readOnly: true,
                    data: {
                      id: link.farmId,
                      name: link.farmName,
                      activationStartDate: link.activationStartDate,
                      activationEndDate: link.activationEndDate,
                      needsRenewal: link.needsRenewal,
                      reviewingRenewalRequest: link.reviewingRenewalRequest,
                    },
                  });
                }
                return (
                  <TouchableOpacity
                    key={link.linkId}
                    style={[styles.poultryFarmCard, { borderLeftWidth: 4, borderLeftColor: "#F59E0B" }]}
                    onPress={() =>
                      router.push({
                        pathname: "/poultry-farm-details",
                        params: { id: link.farmId, workerMode: "1", workerPermissions: "add_daily_data", counterpartRole: "doctor" },
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <View style={styles.farmHeader}>
                      <View style={styles.farmIconContainer}>
                        <Feather size={32} color={COLORS.white} />
                      </View>
                      <View style={styles.farmInfo}>
                        <Text style={styles.farmName}>{link.farmName}</Text>
                        {link.farmGovernorate && (
                          <View style={styles.farmLocationRow}>
                            <MapPin size={14} color={COLORS.darkGray} />
                            <Text style={styles.farmLocation}>{link.farmGovernorate}</Text>
                          </View>
                        )}
                        <View style={styles.farmBadges}>
                          <View style={[styles.statusBadge, { backgroundColor: link.farmStatus === "active" ? COLORS.success : COLORS.warning }]}>
                            <Text style={styles.statusText}>{link.farmStatus === "active" ? "نشط" : "غير نشط"}</Text>
                          </View>
                          {link.farmType && (
                            <View style={[styles.typeBadge, { backgroundColor: COLORS.primary }]}>
                              <Text style={styles.typeBadgeText}>{getFarmTypeLabel(link.farmType)}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    {user?.id && (
                      <PoultryFarmChatButton
                        farmId={link.farmId}
                        counterpartId={Number(user.id)}
                        counterpartRole="doctor"
                        title={link.ownerName ?? link.farmName}
                      />
                    )}

                    <View style={styles.farmDetails}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>الطبقة:</Text>
                        <Text style={styles.detailValue}>{(link.capacity ?? 0).toLocaleString()}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>الحالي:</Text>
                        <Text style={styles.detailValue}>{(link.currentPopulation ?? 0).toLocaleString()}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>الصحة:</Text>
                        <Text style={styles.detailValue}>{getHealthStatusLabel(link.healthStatus)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Empty State for No Clinics/Warehouses */}
          {ownedClinics.length === 0 && assignedClinics.length === 0 && ownedStores.length === 0 && assignedStores.length === 0 && linkedFarms.length === 0 && (
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
              title="إضافة مكتب بيطري"
              onPress={() => router.push("/add-store")}
              type="primary"
              size="medium"
              icon={<Store size={16} color={COLORS.white} />}
              style={[styles.actionButton, styles.storeButton]}
            />
          </View>

          <TouchableOpacity style={styles.linkFarmButton} onPress={() => router.push("/link-farm-to-doctor")} activeOpacity={0.8}>
            <Feather size={18} color="#064E3B" />
            <Text style={styles.linkFarmButtonText}>ربط حقل دواجن — للأطباء البيطريين</Text>
          </TouchableOpacity>
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
            {PET_TYPE_LABELS[item.type as keyof typeof PET_TYPE_LABELS] ?? item.type} {item.breed ? `- ${item.breed}` : ""}
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
              <Text style={styles.title}>{hasAdminAccess || isSuperAdmin || isModerator ? "إدارة الحيوانات والمزارع" : "حيواناتي"}</Text>
            </View>

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

            <TouchableOpacity style={styles.transferRequestsButton} onPress={() => router.push("/pet-transfer-requests")} activeOpacity={0.8}>
              <ArrowRightLeft size={16} color={COLORS.primary} />
              <Text style={styles.transferRequestsText}>طلبات نقل ملكية حيوان أليف</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.poultrySectionButton} onPress={handlePoultrySection} activeOpacity={0.8}>
              <Text style={styles.poultrySectionIcon}>🐔</Text>
              <Text style={styles.poultrySectionText}>قسم الدواجن — السوق والبورصة والإحصائيات</Text>
            </TouchableOpacity>

            {/* Trader subscription renewal card */}
            {(() => {
              const trader = traderQuery.data?.trader;
              if (!trader) return null;
              const endDate = trader.activationEndDate ? new Date(trader.activationEndDate as any) : null;
              const days = endDate ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
              const show = trader.needsRenewal || (trader.status === "active" && days < 30);
              if (!show) return null;
              return renderSubscriptionCard({
                type: "trader",
                data: { ...trader, name: trader.businessName },
              });
            })()}

            {/* Pets Section Title */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الحيوانات الأليفة ({displayPets.length})</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>حقول الدواجن ({displayFarms.length})</Text>
            </View>

            {displayFarms.length > 0 ? (
              displayFarms.map((farm: any) => {
                if (farm.needsRenewal) {
                  return renderSubscriptionCard({ type: "farm", data: farm });
                }
                if (!farm.isActive) {
                  return (
                    <View key={farm.id} style={[styles.poultryFarmCard, styles.farmPendingCard]}>
                      <View style={styles.farmPendingBanner}>
                        <Clock size={14} color="#F59E0B" />
                        <Text style={styles.farmPendingText}>في انتظار موافقة الإدارة</Text>
                      </View>
                    </View>
                  );
                }
                return (
                  <TouchableOpacity key={farm.id} style={styles.poultryFarmCard} onPress={() => handleFarmPress(farm)} activeOpacity={0.8}>
                    <View style={styles.farmHeader}>
                      {farm.images?.[0] ? (
                        <Image source={{ uri: farm.images[0] }} style={styles.farmImage} />
                      ) : (
                        <View style={styles.farmIconContainer}>
                          <Feather size={32} color={COLORS.white} />
                        </View>
                      )}
                      <View style={styles.farmInfo}>
                        <Text style={styles.farmName}>{farm.name}</Text>
                        {farm.governorate && (
                          <View style={styles.farmLocationRow}>
                            <MapPin size={14} color={COLORS.darkGray} />
                            <Text style={styles.farmLocation}>{farm.governorate}</Text>
                          </View>
                        )}
                        <View style={styles.farmBadges}>
                          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(farm.status) }]}>
                            <Text style={styles.statusText}>{farm.status === "active" ? "نشط" : farm.status === "inactive" ? "غير نشط" : farm.status}</Text>
                          </View>
                          <View style={[styles.typeBadge, { backgroundColor: COLORS.primary }]}>
                            <Text style={styles.typeBadgeText}>{getFarmTypeLabel(farm.farmType)}</Text>
                          </View>
                          {farm.isVerified && (
                            <View style={[styles.verifiedBadge, { backgroundColor: COLORS.success }]}>
                              <CheckCircle size={10} color={COLORS.white} />
                              <Text style={styles.verifiedBadgeText}>موثق</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={styles.farmDetails}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>الطبقة:</Text>
                        <Text style={styles.detailValue}>{(farm.capacity ?? 0).toLocaleString()}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>الحالي:</Text>
                        <Text style={styles.detailValue}>{(farm.currentPopulation ?? 0).toLocaleString()}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>الصحة:</Text>
                        <Text style={styles.detailValue}>{getHealthStatusLabel(farm.healthStatus)}</Text>
                      </View>
                    </View>

                    {farm.licenseNumber && (
                      <View style={styles.licenseInfo}>
                        <Text style={styles.licenseText}>رقم الترخيص: {farm.licenseNumber}</Text>
                      </View>
                    )}

                    {(farm.activationStartDate || farm.activationEndDate) && (
                      <View style={styles.activationInfo}>
                        {farm.activationStartDate && (
                          <View style={styles.activationRow}>
                            <Calendar size={13} color={COLORS.primary} />
                            <Text style={styles.activationLabel}>بداية الاشتراك:</Text>
                            <Text style={styles.activationValue}>{new Date(farm.activationStartDate).toLocaleDateString("ar-SA")}</Text>
                          </View>
                        )}
                        {farm.activationEndDate && (
                          <View style={styles.activationRow}>
                            <Calendar size={13} color={COLORS.warning} />
                            <Text style={styles.activationLabel}>نهاية الاشتراك:</Text>
                            <Text style={styles.activationValue}>{new Date(farm.activationEndDate).toLocaleDateString("ar-SA")}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyPoultryContainer}>
                <Feather size={48} color={COLORS.lightGray} />
                <Text style={styles.emptyPoultryText}>لا يوجد حقول دواجن مسجلة</Text>
              </View>
            )}

            {workerFarms.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>أعمل فيها ({workerFarms.length})</Text>
                </View>
                {workerFarms.map((farm: any) => {
                  const permLabel = farm.permissions === "add_daily_data" ? "إضافة بيانات يومية" : "عرض فقط";
                  return (
                    <TouchableOpacity
                      key={farm.id}
                      style={[styles.poultryFarmCard, { borderLeftWidth: 4, borderLeftColor: "#F59E0B" }]}
                      onPress={() =>
                        router.push({
                          pathname: "/poultry-farm-details",
                          params: { id: farm.id, workerMode: "1", workerPermissions: farm.permissions, counterpartRole: "employee" },
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <View style={styles.farmHeader}>
                        {farm.images?.[0] ? (
                          <Image source={{ uri: farm.images[0] }} style={styles.farmImage} />
                        ) : (
                          <View style={styles.farmIconContainer}>
                            <Feather size={32} color={COLORS.white} />
                          </View>
                        )}
                        <View style={styles.farmInfo}>
                          <Text style={styles.farmName}>{farm.name}</Text>
                          {farm.governorate && (
                            <View style={styles.farmLocationRow}>
                              <MapPin size={14} color={COLORS.darkGray} />
                              <Text style={styles.farmLocation}>{farm.governorate}</Text>
                            </View>
                          )}
                          <View style={styles.farmBadges}>
                            <View style={[styles.statusBadge, { backgroundColor: "#F59E0B" }]}>
                              <Text style={styles.statusText}>موظف</Text>
                            </View>
                            <View style={[styles.typeBadge, { backgroundColor: COLORS.primary }]}>
                              <Text style={styles.typeBadgeText}>{getFarmTypeLabel(farm.farmType)}</Text>
                            </View>
                          </View>
                          <View style={[styles.roleContainer, { marginTop: 6, alignSelf: "flex-start" }]}>
                            <Text style={styles.roleLabel}>الصلاحية:</Text>
                            <Text style={styles.roleValue}>{permLabel}</Text>
                          </View>
                          {farm.owner?.name && (
                            <View style={[styles.roleContainer, { marginTop: 6, alignSelf: "flex-start" }]}>
                              <Text style={styles.roleLabel}>صاحب الحقل:</Text>
                              <Text style={styles.roleValue}>{farm.owner.name}</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {user?.id && (
                        <PoultryFarmChatButton
                          farmId={farm.id}
                          counterpartId={Number(user.id)}
                          counterpartRole="employee"
                          title={farm.owner?.name ?? farm.name}
                        />
                      )}

                      <View style={styles.farmDetails}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>الطبقة:</Text>
                          <Text style={styles.detailValue}>{(farm.capacity ?? 0).toLocaleString()}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>الحالي:</Text>
                          <Text style={styles.detailValue}>{(farm.currentPopulation ?? 0).toLocaleString()}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>الصحة:</Text>
                          <Text style={styles.detailValue}>{getHealthStatusLabel(farm.healthStatus)}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
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
    textAlign: "left",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "left",
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  headerButton: {
    flex: 1,
  },
  transferRequestsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + "40",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  transferRequestsText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "left",
  },
  poultrySectionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#064E3B40",
  },
  poultrySectionIcon: { fontSize: 20 },
  poultrySectionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#064E3B",
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "left",
    marginBottom: 12,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  renewalSection: {
    marginBottom: 24,
  },
  renewalSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  renewalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.error,
  },
  renewalSectionDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "left",
    marginTop: 4,
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
    justifyContent: "space-between",
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
  farmImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    textAlign: "left",
  },
  farmLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  farmLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  farmBadges: {
    flexDirection: "row",
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
    flexDirection: "row",
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
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
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
  activationInfo: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    gap: 4,
  },
  activationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activationLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    flex: 1,
  },
  activationValue: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.black,
  },
  farmPendingCard: {
    opacity: 0.75,
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    borderStyle: "dashed",
  },
  farmPendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF9C3",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  farmPendingText: {
    color: "#92400E",
    fontSize: 13,
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
    textAlign: "left",
  },
  petType: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: "left",
  },
  ownerInfo: {
    flexDirection: "row",
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
    flexDirection: "row",
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
    flexDirection: "row",
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
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
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
  },
  actionButton: {
    width: "100%",
  },
  storeButton: {
    backgroundColor: "#8B5CF6",
  },
  linkFarmButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 120,
    borderWidth: 1,
    borderColor: "#064E3B40",
  },
  linkFarmButtonText: {
    // flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#064E3B",
  },

  // Subscription Card Styles
  subscriptionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  subscriptionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  subscriptionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  subscriptionHeaderText: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkGray,
    marginBottom: 2,
    textAlign: "left",
  },
  subscriptionResourceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
  },
  subscriptionContent: {
    gap: 10,
  },
  subscriptionBadge: {
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  subscriptionDates: {
    gap: 8,
    backgroundColor: COLORS.gray,
    padding: 12,
    borderRadius: 8,
  },
  dateItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  dateLabel: {
    fontSize: 13,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: "left",
  },
  dateValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.black,
  },
  subscriptionActions: {
    flexDirection: "row-reverse",
    gap: 10,
    marginTop: 4,
  },
  renewButton: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    padding: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  renewButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
  pendingRenewalBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFF4E5",
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  pendingRenewalIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.warning + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  pendingRenewalText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: "600",
    flex: 1,
    textAlign: "left",
  },
  expiredBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  expiredIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  expiredText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: "600",
    flex: 1,
    textAlign: "left",
  },
});
