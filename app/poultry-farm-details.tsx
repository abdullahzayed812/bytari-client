import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useToastContext } from "../providers/ToastProvider";
import Button from "../components/Button 2";
import { trpc } from "../lib/trpc";
import { Stack } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Home,
  Users,
  Square,
  Calendar,
  Plus,
  Activity,
  DollarSign,
  Weight,
  Stethoscope,
  UserCheck,
  ShoppingCart,
  MessageCircle,
  X,
  Settings,
} from "lucide-react-native";
import { PoultryFarm, PoultryBatch, PoultryWeek, PoultryDay } from "../types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApp } from "@/providers/AppProvider";
import { PoultryFarmChatButton } from "@/components/poultry/PoultryFarmChatButton";

export default function PoultryFarmDetailsScreen() {
  const { isSuperAdmin, user } = useApp();
  const { isRTL } = useI18n();
  const router = useRouter();
  const { showToast } = useToastContext();

  const { id, workerMode, workerPermissions } = useLocalSearchParams<{ id: string; workerMode?: string; workerPermissions?: string }>();
  const isWorkerMode = workerMode === "1";
  const canAddDailyData = !isWorkerMode || workerPermissions === "add_daily_data";

  const [farm, setFarm] = useState<PoultryFarm | null>(null);
  const [currentBatch, setCurrentBatch] = useState<PoultryBatch | null>(null);
  const [completedBatches, setCompletedBatches] = useState<PoultryBatch[]>([]);
  const [currentDays, setCurrentDays] = useState<PoultryDay[]>([]);

  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<PoultryWeek | null>(null);
  const [showAddDailyDataModal, setShowAddDailyDataModal] = useState(false);
  const [showWeeklyReportModal, setShowWeeklyReportModal] = useState(false);
  const [showSellBatchModal, setShowSellBatchModal] = useState(false);
  const [showBatchDetailsModal, setShowBatchDetailsModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<PoultryBatch | null>(null);
  const [showConfirmVetRemoval, setShowConfirmVetRemoval] = useState(false);
  const [showConfirmSupervisorRemoval, setShowConfirmSupervisorRemoval] = useState(false);
  const [showEditDayModal, setShowEditDayModal] = useState(false);
  const [editingDay, setEditingDay] = useState<PoultryDay | null>(null);
  const [editDayForm, setEditDayForm] = useState({
    temperature: "",
    humidity: "",
    feedConsumption: "",
    waterConsumption: "",
    averageWeight: "",
    activityLevel: "",
    mortality: "",
    mortalityReasons: "",
    treatments: "",
    notes: "",
  });
  const [expandedCompletedWeek, setExpandedCompletedWeek] = useState<{ batchId: string; weekNumber: number } | null>(null);
  const [showContactVetModal, setShowContactVetModal] = useState(false);
  const [showContactSupervisorModal, setShowContactSupervisorModal] = useState(false);
  const [showRequestVetModal, setShowRequestVetModal] = useState(false);
  const [showRequestSupervisorModal, setShowRequestSupervisorModal] = useState(false);
  const [dailyDataForm, setDailyDataForm] = useState({
    temperature: "",
    humidity: "",
    feedConsumption: "",
    waterConsumption: "",
    averageWeight: "",
    activityLevel: "",
    mortality: "",
    mortalityReasons: "",
    treatments: "",
    notes: "",
  });
  const [sellBatchForm, setSellBatchForm] = useState({
    netCount: "",
    netProfit: "",
  });

  const [batchForm, setBatchForm] = useState({
    initialCount: "",
    pricePerChick: "",
    averageWeight: "",
  });

  // Fetch field assignment data
  const farmQuery = useQuery(
    trpc.poultryFarms.getDetails.queryOptions({
      farmId: Number(id),
    }),
  );

  // Linked doctors/employees (owner view only)
  const farmWorkersQuery = useQuery({
    ...trpc.poultryFarms.getWorkers.queryOptions({ farmId: Number(id) }),
    enabled: !isWorkerMode,
  });
  const farmDoctorsQuery = useQuery({
    ...trpc.poultry.farmDoctor.getFarmDoctors.queryOptions({ farmId: Number(id) }),
    enabled: !isWorkerMode,
  });

  const addBatchMutation = useMutation(trpc.poultryBatches.add.mutationOptions());
  const addDailyDataMutation = useMutation(trpc.poultryBatches.addDailyData.mutationOptions());
  const updateDailyDataMutation = useMutation(trpc.poultryBatches.updateDailyData.mutationOptions());
  const sellBatchMutation = useMutation(trpc.poultryBatches.sell.mutationOptions());

  const requestVetMutation = useMutation(trpc.assignmentRequests.requestVet.mutationOptions());
  const requestSupervisorMutation = useMutation(trpc.assignmentRequests.requestSupervisor.mutationOptions());
  const requestRemovalMutation = useMutation(trpc.assignmentRequests.requestRemoval.mutationOptions());

  useEffect(() => {
    if (farmQuery.data) {
      const { farm: farmData, currentBatch: batchData, completedBatches: completedData } = farmQuery.data;

      // Set farm data
      setFarm({
        id: farmData.id.toString(),
        ownerId: farmData.ownerId.toString(),
        name: farmData.name,
        location: farmData.location,
        address: farmData.address || "",
        description: farmData.description || "",
        totalArea: parseFloat(farmData.totalArea || "0"),
        capacity: farmData.capacity,
        batches: [], // Will be set separately
        createdAt: farmData.createdAt.toISOString(),
        status: farmData.status,
        assignedVet: farmData.assignedVetId
          ? {
              id: farmData.assignedVetId.toString(),
              name: farmData.assignedVetName || "",
              phone: farmData.assignedVetPhone || "",
              specialization: "طب الدواجن",
              assignedAt: farmData.updatedAt.toISOString(),
            }
          : undefined,
        assignedSupervisor: farmData.assignedSupervisorId
          ? {
              id: farmData.assignedSupervisorId.toString(),
              name: farmData.assignedSupervisorName || "",
              phone: farmData.assignedSupervisorPhone || "",
              experience: "5 سنوات",
              assignedAt: farmData.updatedAt.toISOString(),
            }
          : undefined,
      });

      // Set current batch if exists
      if (batchData) {
        setCurrentBatch({
          id: batchData.id.toString(),
          farmId: farmData.id.toString(),
          batchNumber: batchData.batchNumber,
          startDate: batchData.startDate.toISOString(),
          initialCount: batchData.initialCount,
          currentCount: batchData.currentCount,
          chicksAge: batchData.chicksAge,
          pricePerChick: parseFloat(batchData.pricePerChick),
          totalInvestment: parseFloat(batchData.totalInvestment),
          weeks: [],
          status: batchData.status,
          createdAt: batchData.createdAt.toISOString(),
        });

        // Set daily data
        const days = batchData.days.map((day: any) => ({
          id: day.id.toString(),
          batchId: day.batchId.toString(),
          dayNumber: day.dayNumber,
          date: day.date.toISOString(),
          temperature: day.temperature != null ? parseFloat(day.temperature) : undefined,
          humidity: day.humidity != null ? parseFloat(day.humidity) : undefined,
          feedConsumption: day.feedConsumption != null ? parseFloat(day.feedConsumption) : 0,
          feedCost: parseFloat(day.feedCost || "0"),
          waterConsumption: day.waterConsumption != null ? parseFloat(day.waterConsumption) : undefined,
          averageWeight: day.averageWeight != null ? parseFloat(day.averageWeight) : 0,
          activityLevel: day.activityLevel || undefined,
          mortality: day.mortality,
          mortalityReasons: day.mortalityReasons || [],
          treatments: day.treatments || [],
          vaccinations: day.vaccinations || [],
          estimatedProfit: parseFloat(day.estimatedProfit || "0"),
          notes: day.notes || "",
          createdAt: day.createdAt.toISOString(),
        }));
        setCurrentDays(days);
      }

      // Set completed batches
      const completed = completedData.map((batch: any) => ({
        id: batch.id.toString(),
        farmId: farmData.id.toString(),
        batchNumber: batch.batchNumber,
        startDate: batch.startDate.toISOString(),
        endDate: batch.endDate?.toISOString(),
        initialCount: batch.initialCount,
        currentCount: batch.currentCount,
        finalCount: batch.finalCount,
        chicksAge: batch.chicksAge,
        pricePerChick: parseFloat(batch.pricePerChick),
        totalInvestment: parseFloat(batch.totalInvestment),
        totalProfit: batch.totalProfit ? parseFloat(batch.totalProfit) : undefined,
        weeks: [],
        days: batch.days?.map((day: any) => ({
          id: day.id.toString(),
          batchId: day.batchId.toString(),
          dayNumber: day.dayNumber,
          date: day.date.toISOString(),
          feedConsumption: parseFloat(day.feedConsumption),
          feedCost: parseFloat(day.feedCost || "0"),
          averageWeight: parseFloat(day.averageWeight),
          mortality: day.mortality,
          mortalityReasons: day.mortalityReasons || [],
          treatments: day.treatments || [],
          vaccinations: day.vaccinations || [],
          estimatedProfit: parseFloat(day.estimatedProfit || "0"),
          notes: day.notes || "",
          createdAt: day.createdAt.toISOString(),
        })),
        status: batch.status,
        createdAt: batch.createdAt.toISOString(),
      }));
      setCompletedBatches(completed);
    }
  }, [farmQuery.data]);

  if (farmQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.white} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
          </TouchableOpacity>
          <Text style={styles.title}>حقل الدواجن</Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const handleAddDailyData = () => {
    if (!currentBatch) {
      showToast({ type: "error", message: "أضف دفعة اولا!" });
      return;
    }

    const temperature = dailyDataForm.temperature.trim() ? parseFloat(dailyDataForm.temperature) : undefined;
    const humidity = dailyDataForm.humidity.trim() ? parseFloat(dailyDataForm.humidity) : undefined;
    const feedConsumption = dailyDataForm.feedConsumption.trim() ? parseFloat(dailyDataForm.feedConsumption) : undefined;
    const waterConsumption = dailyDataForm.waterConsumption.trim() ? parseFloat(dailyDataForm.waterConsumption) : undefined;
    const averageWeight = dailyDataForm.averageWeight.trim() ? parseFloat(dailyDataForm.averageWeight) : undefined;
    const mortality = dailyDataForm.mortality.trim() ? parseInt(dailyDataForm.mortality) : 0;

    addDailyDataMutation.mutate(
      {
        batchId: Number(currentBatch.id),
        temperature,
        humidity,
        feedConsumption,
        waterConsumption,
        averageWeight,
        activityLevel: dailyDataForm.activityLevel.trim() || undefined,
        mortality,
        mortalityReasons: dailyDataForm.mortalityReasons
          ? dailyDataForm.mortalityReasons
              .split(",")
              .map((r) => r.trim())
              .filter((r) => r.length > 0)
          : [],
        treatments: dailyDataForm.treatments.trim() || undefined,
        notes: dailyDataForm.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          farmQuery.refetch();
          setShowAddDailyDataModal(false);
          setDailyDataForm({
            temperature: "",
            humidity: "",
            feedConsumption: "",
            waterConsumption: "",
            averageWeight: "",
            activityLevel: "",
            mortality: "",
            mortalityReasons: "",
            treatments: "",
            notes: "",
          });
          showToast({ type: "success", message: "تم إضافة بيانات اليوم بنجاح ✅" });
        },
        onError: (error) => {
          showToast({ type: "error", message: error.message });
        },
      },
    );
  };

  const handleAddBatch = () => {
    if (!batchForm.initialCount || !batchForm.pricePerChick || !batchForm.averageWeight) {
      showToast({ type: "error", message: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }

    addBatchMutation.mutate(
      {
        farmId: Number(id),
        initialCount: parseInt(batchForm.initialCount),
        pricePerChick: parseFloat(batchForm.pricePerChick),
        initialWeight: parseFloat(batchForm.averageWeight),
      },
      {
        onSuccess: () => {
          farmQuery.refetch();
          setShowAddBatchModal(false);
          setBatchForm({ initialCount: "", pricePerChick: "", averageWeight: "" });
          showToast({ type: "success", message: "تم إضافة دفعة جديدة بنجاح" });
        },
        onError: (error) => {
          showToast({ type: "error", message: error.message });
        },
      },
    );
  };

  const handleSellBatch = () => {
    if (!currentBatch) return;
    setShowSellBatchModal(true);
  };

  const handleConfirmSellBatch = () => {
    if (!currentBatch) return;

    const netCount = sellBatchForm.netCount ? parseInt(sellBatchForm.netCount) : undefined;
    const netProfit = sellBatchForm.netProfit ? parseFloat(sellBatchForm.netProfit) : undefined;

    if (netCount !== undefined && (isNaN(netCount) || netCount < 0)) {
      showToast({ type: "error", message: "يرجى إدخال عدد صحيح للعدد الصافي" });
      return;
    }

    if (netCount !== undefined && netCount > currentBatch.currentCount) {
      showToast({
        type: "error",
        message: `العدد الصافي (${netCount}) لا يمكن أن يكون أكبر من العدد الحالي (${currentBatch.currentCount})`,
      });
      return;
    }

    if (netProfit !== undefined && isNaN(netProfit)) {
      showToast({ type: "error", message: "يرجى إدخال رقم صحيح للربح الصافي" });
      return;
    }

    sellBatchMutation.mutate(
      {
        batchId: Number(currentBatch.id),
        finalCount: netCount,
        totalProfit: netProfit,
      },
      {
        onSuccess: () => {
          farmQuery.refetch();
          setShowSellBatchModal(false);
          setSellBatchForm({ netCount: "", netProfit: "" });
          showToast({
            type: "success",
            message: "تم بيع الدفعة بنجاح! تم حفظ جميع البيانات في السجلات ✅",
          });
        },
        onError: (error) => {
          showToast({ type: "error", message: error.message });
        },
      },
    );
  };

  const handleViewBatchDetails = (batch: PoultryBatch) => {
    setSelectedBatch(batch);
    setShowBatchDetailsModal(true);
  };

  const handleRequestVet = () => {
    setShowRequestVetModal(true);
  };

  const handleConfirmRequestVet = () => {
    requestVetMutation.mutate(
      {
        farmId: Number(id),
        requestedBy: user?.id,
      },
      {
        onSuccess: () => {
          setShowRequestVetModal(false);
          showToast({ type: "success", message: "تم إرسال طلب تعيين الطبيب البيطري بنجاح" });
        },
        onError: (error) => {
          showToast({ type: "error", message: error.message });
        },
      },
    );
  };

  const handleContactVet = () => {
    if (!farm?.assignedVet) return;
    setShowContactVetModal(true);
  };

  const handleRemoveVet = () => {
    if (!farm?.assignedVet) return;
    setShowConfirmVetRemoval(true);
  };

  const handleConfirmRemoveVet = () => {
    if (!farm?.assignedVet) return;

    requestRemovalMutation.mutate(
      {
        farmId: Number(id),
        requestedBy: user?.id,
        requestType: "removeVet",
        targetUserId: Number(farm.assignedVet!.id),
      },
      {
        onSuccess: () => {
          setShowConfirmVetRemoval(false);
          showToast({
            type: "success",
            message: "تم إرسال طلب إلغاء التعيين ✅ سيتم مراجعة الطلب والرد عليك في أقرب وقت ممكن",
          });
        },
        onError: (error) => {
          showToast({ type: "error", message: error.message });
        },
      },
    );
  };

  const handleRequestSupervisor = () => {
    setShowRequestSupervisorModal(true);
  };

  const handleConfirmRequestSupervisor = () => {
    requestSupervisorMutation.mutate(
      {
        farmId: Number(id),
        requestedBy: user?.id,
      },
      {
        onSuccess: () => {
          setShowRequestSupervisorModal(false);
          showToast({ type: "success", message: "تم إرسال طلب الإشراف بنجاح" });
        },
        onError: (error) => {
          showToast({ type: "error", message: error.message });
        },
      },
    );
  };

  const handleContactSupervisor = () => {
    if (!farm?.assignedSupervisor) return;
    setShowContactSupervisorModal(true);
  };

  const handleRemoveSupervisor = () => {
    if (!farm?.assignedSupervisor) return;
    setShowConfirmSupervisorRemoval(true);
  };

  const handleConfirmRemoveSupervisor = () => {
    if (!farm?.assignedSupervisor) return;

    requestRemovalMutation.mutate(
      {
        farmId: Number(id),
        requestedBy: user?.id,
        requestType: "removeSupervisor",
        targetUserId: Number(farm.assignedSupervisor!.id),
      },
      {
        onSuccess: () => {
          setShowConfirmSupervisorRemoval(false);
          showToast({
            type: "success",
            message: "تم إرسال طلب إلغاء التعيين ✅ سيتم مراجعة الطلب والرد عليك في أقرب وقت ممكن",
          });
        },
        onError: (error) => {
          showToast({ type: "error", message: error.message });
        },
      },
    );
  };

  const handleEditDay = (day: PoultryDay) => {
    setEditingDay(day);
    setEditDayForm({
      temperature: day.temperature != null ? String(day.temperature) : "",
      humidity: day.humidity != null ? String(day.humidity) : "",
      feedConsumption: day.feedConsumption > 0 ? String(day.feedConsumption) : "",
      waterConsumption: day.waterConsumption != null ? String(day.waterConsumption) : "",
      averageWeight: day.averageWeight > 0 ? String(day.averageWeight) : "",
      activityLevel: day.activityLevel || "",
      mortality: String(day.mortality),
      mortalityReasons: Array.isArray(day.mortalityReasons) ? day.mortalityReasons.join(", ") : "",
      treatments:
        Array.isArray(day.treatments) && day.treatments.length > 0
          ? typeof day.treatments[0] === "object"
            ? (day.treatments as any[]).map((t) => t.name).join(", ")
            : String(day.treatments)
          : "",
      notes: day.notes || "",
    });
    setShowEditDayModal(true);
  };

  const handleSaveEditDay = () => {
    if (!editingDay) return;
    updateDailyDataMutation.mutate(
      {
        dayId: Number(editingDay.id),
        temperature: editDayForm.temperature.trim() ? parseFloat(editDayForm.temperature) : undefined,
        humidity: editDayForm.humidity.trim() ? parseFloat(editDayForm.humidity) : undefined,
        feedConsumption: editDayForm.feedConsumption.trim() ? parseFloat(editDayForm.feedConsumption) : undefined,
        waterConsumption: editDayForm.waterConsumption.trim() ? parseFloat(editDayForm.waterConsumption) : undefined,
        averageWeight: editDayForm.averageWeight.trim() ? parseFloat(editDayForm.averageWeight) : undefined,
        activityLevel: editDayForm.activityLevel.trim() || undefined,
        mortality: editDayForm.mortality.trim() ? parseInt(editDayForm.mortality) : undefined,
        mortalityReasons: editDayForm.mortalityReasons
          ? editDayForm.mortalityReasons
              .split(",")
              .map((r) => r.trim())
              .filter(Boolean)
          : undefined,
        treatments: editDayForm.treatments.trim() || undefined,
        notes: editDayForm.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          farmQuery.refetch();
          setShowEditDayModal(false);
          setEditingDay(null);
          showToast({ type: "success", message: "تم تحديث بيانات اليوم بنجاح ✅" });
        },
        onError: (error) => showToast({ type: "error", message: error.message }),
      },
    );
  };

  const generateWeeklyReport = () => {
    if (!currentDays.length) return null;

    const weeks: { [key: number]: PoultryDay[] } = {};

    currentDays.forEach((day) => {
      const weekNumber = Math.ceil(day.dayNumber / 7);
      if (!weeks[weekNumber]) {
        weeks[weekNumber] = [];
      }
      weeks[weekNumber].push(day);
    });

    return Object.keys(weeks).map((weekNum) => {
      const weekNumber = parseInt(weekNum);
      const weekDays = weeks[weekNumber];

      const totalFeedConsumption = weekDays.reduce((sum, day) => sum + day.feedConsumption, 0);
      const totalMortality = weekDays.reduce((sum, day) => sum + day.mortality, 0);
      const avgWeight = weekDays.reduce((sum, day) => sum + day.averageWeight, 0) / weekDays.length;
      const totalProfit = weekDays.reduce((sum, day) => sum + day.estimatedProfit, 0);

      return {
        weekNumber,
        days: weekDays,
        totalFeedConsumption,
        totalMortality,
        averageWeight: Math.round(avgWeight),
        totalProfit: Math.round(totalProfit),
        startDate: weekDays[0]?.date,
        endDate: weekDays[weekDays.length - 1]?.date,
      };
    });
  };

  const renderFarmInfo = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>معلومات الحقل</Text>

      <View style={styles.infoRow}>
        <Home size={20} color={COLORS.primary} />
        <Text style={styles.infoLabel}>اسم الحقل:</Text>
        <Text style={styles.infoValue}>{farm?.name}</Text>
      </View>

      <View style={styles.infoRow}>
        <MapPin size={20} color={COLORS.primary} />
        <Text style={styles.infoLabel}>الموقع:</Text>
        <Text style={styles.infoValue}>{farm?.location}</Text>
      </View>

      <View style={styles.infoRow}>
        <Square size={20} color={COLORS.primary} />
        <Text style={styles.infoLabel}>المساحة:</Text>
        <Text style={styles.infoValue}>{farm?.totalArea} متر مربع</Text>
      </View>

      <View style={styles.infoRow}>
        <Users size={20} color={COLORS.primary} />
        <Text style={styles.infoLabel}>السعة القصوى:</Text>
        <Text style={styles.infoValue}>{farm?.capacity} طائر</Text>
      </View>
    </View>
  );

  const renderFarmContacts = () => {
    const workers = farmWorkersQuery.data?.workers || [];
    const doctors = farmDoctorsQuery.data?.doctors || [];

    if (!workers.length && !doctors.length) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>الأطباء والموظفون</Text>

        {doctors.map((doc: any) => (
          <View key={`doc-${doc.linkId}`} style={styles.contactRow}>
            <View style={styles.contactInfo}>
              <Stethoscope size={18} color={COLORS.success} />
              <View>
                <Text style={styles.contactName}>{doc.doctorName || "طبيب بيطري"}</Text>
                <Text style={styles.contactRole}>طبيب بيطري</Text>
              </View>
            </View>
            <PoultryFarmChatButton farmId={Number(id)} counterpartId={doc.doctorId} counterpartRole="doctor" title={doc.doctorName || "طبيب بيطري"} />
          </View>
        ))}

        {workers.map((w: any) => (
          <View key={`worker-${w.id}`} style={styles.contactRow}>
            <View style={styles.contactInfo}>
              <Users size={18} color={COLORS.primary} />
              <View>
                <Text style={styles.contactName}>{w.name}</Text>
                <Text style={styles.contactRole}>{w.userType === "vet" ? "طبيب بيطري" : "موظف"}</Text>
              </View>
            </View>
            <PoultryFarmChatButton farmId={Number(id)} counterpartId={w.userId} counterpartRole="employee" title={w.name || "موظف"} />
          </View>
        ))}
      </View>
    );
  };

  const renderCurrentBatch = () => {
    if (!currentBatch) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>الدفعة الحالية</Text>
          <Text style={styles.emptyText}>لا توجد دفعة نشطة حالياً</Text>
          {!isWorkerMode && (
            <Button
              title="إدخال دفعة جديدة"
              onPress={() => setShowAddBatchModal(true)}
              type="primary"
              size="medium"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.addButton}
            />
          )}
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>الدفعة رقم {currentBatch.batchNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentBatch.status) }]}>
            <Text style={styles.statusText}>
              {currentBatch.status === "active" ? "نشط" : currentBatch.status === "completed" ? "مكتمل" : currentBatch.status === "sold" ? "مباع" : "غير محدد"}
            </Text>
          </View>
        </View>

        <View style={styles.batchStats}>
          <View style={styles.statItem}>
            <Users size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{currentBatch.currentCount}</Text>
            <Text style={styles.statLabel}>العدد الحالي</Text>
          </View>

          <View style={styles.statItem}>
            <Calendar size={24} color={COLORS.success} />
            <Text style={styles.statValue}>{currentBatch.chicksAge}</Text>
            <Text style={styles.statLabel}>العمر (يوم)</Text>
          </View>

          <View style={styles.statItem}>
            <Weight size={24} color={COLORS.warning} />
            <Text style={styles.statValue}>
              {(() => {
                const withWeight = currentDays.filter((d) => d.averageWeight > 0);
                if (!withWeight.length) return "0";
                return Math.round(withWeight.reduce((s, d) => s + d.averageWeight, 0) / withWeight.length);
              })()}
              g
            </Text>
            <Text style={styles.statLabel}>متوسط الوزن</Text>
          </View>

          {!isWorkerMode ? (
            <View style={styles.statItem}>
              <DollarSign size={24} color={COLORS.success} />
              <Text style={styles.statValue}>{currentDays.reduce((sum, day) => sum + day.estimatedProfit, 0).toFixed(0)}</Text>
              <Text style={styles.statLabel}>الربح المقدر</Text>
            </View>
          ) : null}
        </View>

        {!isWorkerMode ? (
          <View style={styles.batchActions}>
            <Button
              title="إدخال دفعة جديدة"
              onPress={() => setShowAddBatchModal(true)}
              type="primary"
              size="small"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.actionButton}
            />

            <Button
              title="إضافة بيانات يومية"
              onPress={() => setShowAddDailyDataModal(true)}
              type="secondary"
              size="small"
              icon={<Plus size={16} color={COLORS.primary} />}
              style={styles.actionButton}
            />

            <Button
              title="التقرير الأسبوعي"
              onPress={() => setShowWeeklyReportModal(true)}
              type="secondary"
              size="small"
              icon={<Activity size={16} color={COLORS.primary} />}
              style={styles.actionButton}
            />

            <Button
              title="بيع الدفعة"
              onPress={handleSellBatch}
              type="primary"
              size="small"
              icon={<ShoppingCart size={16} color={COLORS.white} />}
              style={styles.actionButton}
            />
          </View>
        ) : null}
      </View>
    );
  };

  const renderDailyData = () => {
    if (!currentDays.length) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>البيانات اليومية</Text>
          <Text style={styles.emptyText}>لا توجد بيانات يومية مسجلة</Text>
          {canAddDailyData && (
            <Button
              title="إضافة بيانات يومية"
              onPress={() => setShowAddDailyDataModal(true)}
              type="primary"
              size="medium"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.addButton}
            />
          )}
        </View>
      );
    }

    // تجميع البيانات حسب الأسابيع
    const weeklyData: { [key: number]: PoultryDay[] } = {};

    currentDays.forEach((day) => {
      const weekNumber = Math.ceil(day.dayNumber / 7);
      if (!weeklyData[weekNumber]) {
        weeklyData[weekNumber] = [];
      }
      weeklyData[weekNumber].push(day);
    });

    return (
      <View style={[styles.card, { marginTop: 24 }]}>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <Text style={styles.cardTitle}>البيانات اليومية ({currentDays.length} يوم)</Text>
          {canAddDailyData && (
            <TouchableOpacity
              onPress={() => setShowAddDailyDataModal(true)}
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: "row-reverse",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Plus size={14} color={COLORS.white} />
              <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: "600" }}>إضافة</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.keys(weeklyData).map((weekNum) => {
            const weekNumber = parseInt(weekNum);
            const weekDays = weeklyData[weekNumber];

            return (
              <View key={weekNumber} style={styles.weekContainer}>
                <View style={styles.weekHeader}>
                  <Text style={styles.weekTitle}>الأسبوع {weekNumber}</Text>
                  <Text style={styles.weekSubtitle}>({weekDays.length} من 7 أيام)</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekDaysScroll}>
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const dayNumber = (weekNumber - 1) * 7 + dayIndex + 1;
                    const dayData = weekDays.find((d) => d.dayNumber === dayNumber);

                    return (
                      <View key={dayIndex} style={[styles.dayCard, !dayData && styles.emptyDayCard]}>
                        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                          <Text style={styles.dayTitle}>اليوم {dayIndex + 1}</Text>
                          {dayData && canAddDailyData && (
                            <TouchableOpacity onPress={() => handleEditDay(dayData)} style={{ padding: 2, backgroundColor: "#E3F2FD", borderRadius: 4 }}>
                              <Text style={{ fontSize: 10, color: COLORS.primary, fontWeight: "600" }}>تعديل</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text style={styles.dayNumber}>({dayNumber})</Text>

                        {dayData ? (
                          <View style={styles.dayStats}>
                            {dayData.temperature != null && (
                              <View style={styles.dayStat}>
                                <Text style={styles.dayStatValue}>{dayData.temperature}°</Text>
                                <Text style={styles.dayStatLabel}>الحرارة</Text>
                              </View>
                            )}
                            {dayData.humidity != null && (
                              <View style={styles.dayStat}>
                                <Text style={styles.dayStatValue}>{dayData.humidity}%</Text>
                                <Text style={styles.dayStatLabel}>الرطوبة</Text>
                              </View>
                            )}
                            {dayData.feedConsumption > 0 && (
                              <View style={styles.dayStat}>
                                <Text style={styles.dayStatValue}>{dayData.feedConsumption}k</Text>
                                <Text style={styles.dayStatLabel}>العلف</Text>
                              </View>
                            )}
                            {dayData.averageWeight > 0 && (
                              <View style={styles.dayStat}>
                                <Text style={[styles.dayStatValue, { color: COLORS.warning }]}>{dayData.averageWeight}g</Text>
                                <Text style={styles.dayStatLabel}>الوزن</Text>
                              </View>
                            )}
                            {dayData.waterConsumption != null && (
                              <View style={styles.dayStat}>
                                <Text style={styles.dayStatValue}>{dayData.waterConsumption}L</Text>
                                <Text style={styles.dayStatLabel}>الماء</Text>
                              </View>
                            )}
                            {dayData.activityLevel && (
                              <View style={[styles.dayStat, { width: "100%" }]}>
                                <Text style={[styles.dayStatValue, { fontSize: 10 }]} numberOfLines={1}>
                                  {dayData.activityLevel}
                                </Text>
                                <Text style={styles.dayStatLabel}>الحركة</Text>
                              </View>
                            )}
                            <View style={styles.dayStat}>
                              <Text style={[styles.dayStatValue, { color: dayData.mortality > 0 ? COLORS.error : COLORS.darkGray }]}>{dayData.mortality}</Text>
                              <Text style={styles.dayStatLabel}>النفوق%</Text>
                            </View>
                            {dayData.mortalityReasons?.length > 0 && (
                              <View style={[styles.dayStat, { width: "100%" }]}>
                                <Text style={[styles.dayStatValue, { fontSize: 10, color: COLORS.error }]} numberOfLines={1}>
                                  {dayData.mortalityReasons.join("، ")}
                                </Text>
                                <Text style={styles.dayStatLabel}>السبب</Text>
                              </View>
                            )}
                            {dayData.treatments?.length > 0 && (
                              <View style={[styles.dayStat, { width: "100%" }]}>
                                <Text style={[styles.dayStatValue, { fontSize: 10 }]} numberOfLines={1}>
                                  {Array.isArray(dayData.treatments) && typeof dayData.treatments[0] === "object"
                                    ? (dayData.treatments as any[]).map((t) => t.name).join("، ")
                                    : String(dayData.treatments)}
                                </Text>
                                <Text style={styles.dayStatLabel}>علاجات</Text>
                              </View>
                            )}
                            {dayData.notes ? (
                              <View style={[styles.dayStat, { width: "100%" }]}>
                                <Text style={[styles.dayStatValue, { fontSize: 10 }]} numberOfLines={2}>
                                  {dayData.notes}
                                </Text>
                                <Text style={styles.dayStatLabel}>ملاحظات</Text>
                              </View>
                            ) : null}
                            <Text style={styles.dayDate}>{new Date(dayData.date).toLocaleDateString("ar")}</Text>
                          </View>
                        ) : (
                          <View style={styles.emptyDayContent}>
                            <Text style={styles.emptyDayText}>لا يوجد بيانات</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>

                {/* ملخص الأسبوع */}
                <View style={styles.weekSummary}>
                  <Text style={styles.weekSummaryTitle}>ملخص الأسبوع:</Text>
                  <View style={styles.weekSummaryStats}>
                    <View style={styles.weekSummaryStat}>
                      <Text style={styles.weekSummaryValue}>
                        {weekDays.reduce((sum, day) => sum + day.feedConsumption, 0).toFixed(1)}
                        kg
                      </Text>
                      <Text style={styles.weekSummaryLabel}>إجمالي العلف</Text>
                    </View>

                    <View style={styles.weekSummaryStat}>
                      <Text style={[styles.weekSummaryValue, { color: COLORS.error }]}>{weekDays.reduce((sum, day) => sum + day.mortality, 0)}</Text>
                      <Text style={styles.weekSummaryLabel}>إجمالي النفوق</Text>
                    </View>

                    <View style={styles.weekSummaryStat}>
                      <Text style={styles.weekSummaryValue}>
                        {(() => {
                          const w = weekDays.filter((d) => d.averageWeight > 0);
                          return w.length ? Math.round(w.reduce((s, d) => s + d.averageWeight, 0) / w.length) : 0;
                        })()}
                        g
                      </Text>
                      <Text style={styles.weekSummaryLabel}>متوسط الوزن</Text>
                    </View>

                    <View style={styles.weekSummaryStat}>
                      <Text style={[styles.weekSummaryValue, { color: COLORS.success }]}>
                        {weekDays.reduce((sum, day) => sum + day.estimatedProfit, 0).toFixed(0)}
                      </Text>
                      <Text style={styles.weekSummaryLabel}>الربح المقدر</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderCompletedBatches = () => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>الدفعات المكتملة ({completedBatches.length})</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {completedBatches.length > 0 ? (
            completedBatches?.map((batch) => (
              <TouchableOpacity key={batch.id} style={styles.completedBatchItem} onPress={() => handleViewBatchDetails(batch)}>
                <View style={styles.batchItemHeader}>
                  <Text style={styles.batchItemTitle}>الدفعة رقم {batch.batchNumber}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(batch.status) }]}>
                    <Text style={styles.statusText}>{batch.status === "sold" ? "مباع" : "مكتمل"}</Text>
                  </View>
                </View>

                <View style={styles.batchItemStats}>
                  <View style={styles.batchItemStat}>
                    <Text style={styles.batchItemStatLabel}>العدد النهائي:</Text>
                    <Text style={styles.batchItemStatValue}>{batch.finalCount || batch.currentCount}</Text>
                  </View>

                  <View style={styles.batchItemStat}>
                    <Text style={styles.batchItemStatLabel}>الربح الصافي:</Text>
                    <Text style={[styles.batchItemStatValue, { color: COLORS.success }]}>{batch.totalProfit?.toFixed(2) || "0.00"} د.ع</Text>
                  </View>

                  <View style={styles.batchItemStat}>
                    <Text style={styles.batchItemStatLabel}>المدة:</Text>
                    <Text style={styles.batchItemStatValue}>
                      {Math.ceil((new Date(batch.endDate || batch.createdAt).getTime() - new Date(batch.startDate).getTime()) / (1000 * 60 * 60 * 24))} يوم
                    </Text>
                  </View>
                </View>

                <Text style={styles.batchItemDate}>
                  {new Date(batch.startDate).toLocaleDateString("ar")} - {new Date(batch.endDate || batch.createdAt).toLocaleDateString("ar")}
                </Text>

                <Text style={styles.viewDetailsText}>اضغط لعرض التفاصيل الكاملة</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>لا توجد دفعات مكتملة</Text>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderSupervision = () => {
    if (isSuperAdmin) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>الإشراف والمتابعة</Text>

          {farmQuery.isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>جاري تحميل بيانات التعيين...</Text>
            </View>
          ) : (
            <>
              {farm?.assignedVet ? (
                <View style={styles.assignedPersonContainer}>
                  <View style={styles.assignedPerson}>
                    <Stethoscope size={20} color={COLORS.success} />
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>{farm?.assignedVet.name}</Text>
                      <Text style={styles.personRole}>طبيب بيطري - {farm?.assignedVet.specialization}</Text>
                      <Text style={styles.personPhone}>{farm?.assignedVet.phone}</Text>
                      <Text style={styles.assignmentDate}>تم التعيين: {new Date(farm?.assignedVet.assignedAt!).toLocaleDateString("ar")}</Text>
                    </View>
                  </View>
                  <View style={styles.personActions}>
                    <Button
                      title="تواصل"
                      onPress={handleContactVet}
                      type="primary"
                      size="small"
                      icon={<MessageCircle size={14} color={COLORS.white} />}
                      style={styles.contactButton}
                    />
                    <Button
                      title="إلغاء الطبيب"
                      onPress={handleRemoveVet}
                      type="secondary"
                      size="small"
                      icon={<X size={14} color={COLORS.error} />}
                      style={[styles.contactButton, { borderColor: COLORS.error }]}
                    />
                  </View>
                </View>
              ) : (
                <Button
                  title="تعيين طبيب بيطري"
                  onPress={handleRequestVet}
                  type="secondary"
                  size="medium"
                  icon={<Stethoscope size={16} color={COLORS.primary} />}
                  style={styles.supervisionButton}
                />
              )}

              {farm?.assignedSupervisor ? (
                <View style={styles.assignedPersonContainer}>
                  <View style={styles.assignedPerson}>
                    <UserCheck size={20} color={COLORS.primary} />
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>{farm?.assignedSupervisor.name}</Text>
                      <Text style={styles.personRole}>مشرف - خبرة {farm?.assignedSupervisor.experience}</Text>
                      <Text style={styles.personPhone}>{farm?.assignedSupervisor.phone}</Text>
                      <Text style={styles.assignmentDate}>تم التعيين: {new Date(farm?.assignedSupervisor.assignedAt!).toLocaleDateString("ar")}</Text>
                    </View>
                  </View>
                  <View style={styles.personActions}>
                    <Button
                      title="تواصل"
                      onPress={() => handleContactSupervisor()}
                      type="primary"
                      size="small"
                      icon={<MessageCircle size={14} color={COLORS.white} />}
                      style={styles.contactButton}
                    />
                    <Button
                      title="إلغاء المشرف"
                      onPress={handleRemoveSupervisor}
                      type="secondary"
                      size="small"
                      icon={<X size={14} color={COLORS.error} />}
                      style={[styles.contactButton, { borderColor: COLORS.error }]}
                    />
                  </View>
                </View>
              ) : (
                <Button
                  title="طلب إشراف"
                  onPress={handleRequestSupervisor}
                  type="secondary"
                  size="medium"
                  icon={<UserCheck size={16} color={COLORS.primary} />}
                  style={styles.supervisionButton}
                />
              )}
            </>
          )}
        </View>
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return COLORS.success;
      case "completed":
        return COLORS.primary;
      case "sold":
        return COLORS.warning;
      default:
        return COLORS.darkGray;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: farm?.name || "حقل الدواجن",
          headerStyle: { backgroundColor: "#F59E0B" },
          headerTintColor: "#fff",
          headerRight: !isWorkerMode
            ? () => (
                <TouchableOpacity
                  onPress={() => router.push({ pathname: "/poultry-farm-settings", params: { id, farmName: farm?.name } })}
                  style={{ marginLeft: 12 }}
                >
                  <Settings size={22} color="#fff" />
                </TouchableOpacity>
              )
            : undefined,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderFarmInfo()}
        {isWorkerMode ? (
          // Worker view: only daily data
          <>
            {renderCurrentBatch()}
            {renderDailyData()}
          </>
        ) : (
          // Owner view: full view
          <>
            {renderCurrentBatch()}
            {renderDailyData()}
            {renderFarmContacts()}
            {renderCompletedBatches()}
            {renderSupervision()}
          </>
        )}
      </ScrollView>

      {/* Add Batch Modal */}
      <Modal visible={showAddBatchModal} transparent animationType="slide" onRequestClose={() => setShowAddBatchModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إدخال دفعة جديدة</Text>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>وزن الفرد (جرام) *</Text>
                <TextInput
                  style={styles.input}
                  value={batchForm.averageWeight}
                  onChangeText={(value) => setBatchForm((prev) => ({ ...prev, averageWeight: value }))}
                  placeholder="أدخل وزن الفرد الواحد بالجرام"
                  keyboardType="numeric"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>العدد *</Text>
                <TextInput
                  style={styles.input}
                  value={batchForm.initialCount}
                  onChangeText={(value) => setBatchForm((prev) => ({ ...prev, initialCount: value }))}
                  placeholder="أدخل عدد الطيور"
                  keyboardType="numeric"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>السعر (د.ع عراقي) *</Text>
                <TextInput
                  style={styles.input}
                  value={batchForm.pricePerChick}
                  onChangeText={(value) => setBatchForm((prev) => ({ ...prev, pricePerChick: value }))}
                  placeholder="أدخل السعر الإجمالي للدفعة"
                  keyboardType="numeric"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button title="إلغاء" onPress={() => setShowAddBatchModal(false)} type="secondary" size="medium" style={styles.modalButton} />
              <Button title="إضافة" onPress={handleAddBatch} type="primary" size="medium" style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Daily Data Modal */}
      <Modal visible={showAddDailyDataModal} transparent animationType="slide" onRequestClose={() => setShowAddDailyDataModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <Text style={styles.modalTitle}>إضافة بيانات يومية</Text>
            <Text style={styles.modalSubtitle}>
              اليوم {currentDays.length + 1} - {new Date().toLocaleDateString("ar")}
            </Text>

            <ScrollView style={styles.dailyForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>الحرارة (°C)</Text>
                  <TextInput
                    style={styles.input}
                    value={dailyDataForm.temperature}
                    onChangeText={(v) => setDailyDataForm((p) => ({ ...p, temperature: v }))}
                    placeholder="مثال: 32"
                    keyboardType="numeric"
                    textAlign={isRTL ? "right" : "left"}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>الرطوبة (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={dailyDataForm.humidity}
                    onChangeText={(v) => setDailyDataForm((p) => ({ ...p, humidity: v }))}
                    placeholder="مثال: 65"
                    keyboardType="numeric"
                    textAlign={isRTL ? "right" : "left"}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>العلف (كيلو)</Text>
                  <TextInput
                    style={styles.input}
                    value={dailyDataForm.feedConsumption}
                    onChangeText={(v) => setDailyDataForm((p) => ({ ...p, feedConsumption: v }))}
                    placeholder="مثال: 150"
                    keyboardType="numeric"
                    textAlign={isRTL ? "right" : "left"}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>الماء (لتر)</Text>
                  <TextInput
                    style={styles.input}
                    value={dailyDataForm.waterConsumption}
                    onChangeText={(v) => setDailyDataForm((p) => ({ ...p, waterConsumption: v }))}
                    placeholder="مثال: 300"
                    keyboardType="numeric"
                    textAlign={isRTL ? "right" : "left"}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>متوسط وزن الفرد (جرام)</Text>
                <TextInput
                  style={styles.input}
                  value={dailyDataForm.averageWeight}
                  onChangeText={(v) => setDailyDataForm((p) => ({ ...p, averageWeight: v }))}
                  placeholder="مثال: 1200"
                  keyboardType="numeric"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الحركة</Text>
                <TextInput
                  style={styles.input}
                  value={dailyDataForm.activityLevel}
                  onChangeText={(v) => setDailyDataForm((p) => ({ ...p, activityLevel: v }))}
                  placeholder="مثال: نشطة، خاملة، طبيعية"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>النفوق (عدد)</Text>
                  <TextInput
                    style={styles.input}
                    value={dailyDataForm.mortality}
                    onChangeText={(v) => setDailyDataForm((p) => ({ ...p, mortality: v }))}
                    placeholder="0"
                    keyboardType="numeric"
                    textAlign={isRTL ? "right" : "left"}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                  <Text style={styles.inputLabel}>سبب النفوق</Text>
                  <TextInput
                    style={styles.input}
                    value={dailyDataForm.mortalityReasons}
                    onChangeText={(v) => setDailyDataForm((p) => ({ ...p, mortalityReasons: v }))}
                    placeholder="مثال: ضعف عام، مشاكل تنفسية"
                    textAlign={isRTL ? "right" : "left"}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>العلاجات أو اللقاحات</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={dailyDataForm.treatments}
                  onChangeText={(v) => setDailyDataForm((p) => ({ ...p, treatments: v }))}
                  placeholder="مثال: مضاد حيوي، فيتامينات، لقاح نيوكاسل"
                  multiline
                  numberOfLines={2}
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الملاحظات</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={dailyDataForm.notes}
                  onChangeText={(v) => setDailyDataForm((p) => ({ ...p, notes: v }))}
                  placeholder="أي ملاحظات إضافية عن اليوم..."
                  multiline
                  numberOfLines={3}
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="إلغاء"
                onPress={() => {
                  setShowAddDailyDataModal(false);
                  setDailyDataForm({
                    temperature: "",
                    humidity: "",
                    feedConsumption: "",
                    waterConsumption: "",
                    activityLevel: "",
                    mortality: "",
                    mortalityReasons: "",
                    treatments: "",
                    notes: "",
                  });
                }}
                type="secondary"
                size="medium"
                style={styles.modalButton}
              />
              <Button title="حفظ البيانات" onPress={handleAddDailyData} type="primary" size="medium" style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Weekly Report Modal */}
      <Modal visible={showWeeklyReportModal} transparent animationType="slide" onRequestClose={() => setShowWeeklyReportModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <Text style={styles.modalTitle}>التقرير الأسبوعي</Text>

            <ScrollView style={styles.weeklyReport} showsVerticalScrollIndicator={false}>
              {generateWeeklyReport()?.map((week) => (
                <View key={week.weekNumber} style={styles.weekReportCard}>
                  <View style={styles.weekReportHeader}>
                    <Text style={styles.weekReportTitle}>الأسبوع {week.weekNumber}</Text>
                    <Text style={styles.weekReportDate}>
                      {new Date(week.startDate).toLocaleDateString("ar")} - {new Date(week.endDate).toLocaleDateString("ar")}
                    </Text>
                  </View>

                  <View style={styles.weekReportStats}>
                    <View style={styles.weekReportStat}>
                      <Text style={styles.weekReportStatValue}>{week.totalFeedConsumption.toFixed(1)}kg</Text>
                      <Text style={styles.weekReportStatLabel}>إجمالي العلف</Text>
                    </View>

                    <View style={styles.weekReportStat}>
                      <Text style={styles.weekReportStatValue}>{week.averageWeight}g</Text>
                      <Text style={styles.weekReportStatLabel}>متوسط الوزن</Text>
                    </View>

                    <View style={styles.weekReportStat}>
                      <Text style={[styles.weekReportStatValue, { color: COLORS.error }]}>{week.totalMortality}</Text>
                      <Text style={styles.weekReportStatLabel}>إجمالي النفوق</Text>
                    </View>

                    <View style={styles.weekReportStat}>
                      <Text style={[styles.weekReportStatValue, { color: COLORS.success }]}>{week.totalProfit}</Text>
                      <Text style={styles.weekReportStatLabel}>الربح المقدر</Text>
                    </View>
                  </View>

                  <Text style={styles.weekReportDays}>عدد الأيام المسجلة: {week.days.length}</Text>
                </View>
              )) || (
                <View style={styles.emptyReport}>
                  <Text style={styles.emptyReportText}>لا توجد بيانات كافية لإنشاء تقرير أسبوعي</Text>
                  <Text style={styles.emptyReportSubtext}>يجب تسجيل البيانات اليومية أولاً</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button title="إغلاق" onPress={() => setShowWeeklyReportModal(false)} type="secondary" size="medium" style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Sell Batch Modal */}
      <Modal visible={showSellBatchModal} transparent animationType="slide" onRequestClose={() => setShowSellBatchModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>بيع الدفعة</Text>
            <Text style={styles.modalSubtitle}>
              الدفعة رقم {currentBatch?.batchNumber} - العدد الحالي: {currentBatch?.currentCount}
            </Text>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>العدد الصافي (اختياري) 🐔</Text>
                <TextInput
                  style={styles.input}
                  value={sellBatchForm.netCount}
                  onChangeText={(value) => setSellBatchForm((prev) => ({ ...prev, netCount: value }))}
                  placeholder={`العدد الافتراضي: ${currentBatch?.currentCount || 0}`}
                  keyboardType="numeric"
                  textAlign={isRTL ? "right" : "left"}
                />
                <Text style={styles.inputHint}>العدد الفعلي للطيور المباعة</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الربح الصافي (اختياري) 💰</Text>
                <TextInput
                  style={styles.input}
                  value={sellBatchForm.netProfit}
                  onChangeText={(value) => setSellBatchForm((prev) => ({ ...prev, netProfit: value }))}
                  placeholder={`الربح المقدر: ${currentDays.reduce((sum, day) => sum + day.estimatedProfit, 0).toFixed(2)} د.ع`}
                  keyboardType="numeric"
                  textAlign={isRTL ? "right" : "left"}
                />
                <Text style={styles.inputHint}>الربح الفعلي من بيع الدفعة بالد.ع العراقي</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>📋 ملاحظة:</Text>
                <Text style={styles.infoText}>• إذا تركت الحقول فارغة، سيتم استخدام القيم المحسوبة تلقائياً</Text>
                <Text style={styles.infoText}>• سيتم حفظ جميع البيانات الأسبوعية واليومية في السجلات</Text>
                <Text style={styles.infoText}>• يمكنك مراجعة تفاصيل الدفعة لاحقاً من قائمة الدفعات المكتملة</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="إلغاء"
                onPress={() => {
                  setShowSellBatchModal(false);
                  setSellBatchForm({ netCount: "", netProfit: "" });
                }}
                type="secondary"
                size="medium"
                style={styles.modalButton}
              />
              <Button title="تأكيد البيع" onPress={handleConfirmSellBatch} type="primary" size="medium" style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Batch Details Modal */}
      <Modal visible={showBatchDetailsModal} transparent animationType="slide" onRequestClose={() => setShowBatchDetailsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <Text style={styles.modalTitle}>تفاصيل الدفعة رقم {selectedBatch?.batchNumber}</Text>

            {selectedBatch && (
              <ScrollView style={styles.batchDetailsScroll} showsVerticalScrollIndicator={false}>
                {/* Batch Summary */}
                <View style={styles.batchSummaryCard}>
                  <Text style={styles.batchSummaryTitle}>ملخص الدفعة</Text>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>تاريخ البداية:</Text>
                    <Text style={styles.summaryValue}>{new Date(selectedBatch.startDate).toLocaleDateString("ar")}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>تاريخ النهاية:</Text>
                    <Text style={styles.summaryValue}>{selectedBatch.endDate ? new Date(selectedBatch.endDate).toLocaleDateString("ar") : "غير محدد"}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>العدد الأولي:</Text>
                    <Text style={styles.summaryValue}>{selectedBatch.initialCount}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>العدد النهائي:</Text>
                    <Text style={styles.summaryValue}>{selectedBatch.finalCount || selectedBatch.currentCount}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>الربح الصافي:</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.success }]}>{selectedBatch.totalProfit?.toFixed(2) || "0.00"} د.ع</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>إجمالي الاستثمار:</Text>
                    <Text style={styles.summaryValue}>{selectedBatch.totalInvestment.toFixed(2)} د.ع</Text>
                  </View>
                </View>

                {/* Weekly Details */}
                {selectedBatch.days && selectedBatch.days.length > 0 && (
                  <View style={styles.weeklyDetailsCard}>
                    <Text style={styles.weeklyDetailsTitle}>التفاصيل الأسبوعية</Text>

                    {(() => {
                      const weeklyData: { [key: number]: PoultryDay[] } = {};
                      selectedBatch.days!.forEach((day) => {
                        const weekNumber = Math.ceil(day.dayNumber / 7);
                        if (!weeklyData[weekNumber]) {
                          weeklyData[weekNumber] = [];
                        }
                        weeklyData[weekNumber].push(day);
                      });

                      return Object.keys(weeklyData).map((weekNum) => {
                        const weekNumber = parseInt(weekNum);
                        const weekDays = weeklyData[weekNumber];
                        const batchId = selectedBatch?.id || "";
                        const isExpanded = expandedCompletedWeek?.batchId === batchId && expandedCompletedWeek?.weekNumber === weekNumber;

                        const totalFeedConsumption = weekDays.reduce((sum, day) => sum + day.feedConsumption, 0);
                        const totalMortality = weekDays.reduce((sum, day) => sum + day.mortality, 0);
                        const avgWeight = weekDays.reduce((sum, day) => sum + day.averageWeight, 0) / weekDays.length;
                        const totalProfit = weekDays.reduce((sum, day) => sum + day.estimatedProfit, 0);

                        return (
                          <View key={weekNumber} style={styles.weekDetailCard}>
                            <TouchableOpacity
                              onPress={() => setExpandedCompletedWeek(isExpanded ? null : { batchId, weekNumber })}
                              style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}
                            >
                              <Text style={styles.weekDetailTitle}>الأسبوع {weekNumber}</Text>
                              <Text style={{ fontSize: 18, color: COLORS.primary }}>{isExpanded ? "▲" : "▼"}</Text>
                            </TouchableOpacity>

                            <View style={styles.weekDetailStats}>
                              <View style={styles.weekDetailStat}>
                                <Text style={styles.weekDetailStatValue}>{totalFeedConsumption.toFixed(1)}kg</Text>
                                <Text style={styles.weekDetailStatLabel}>إجمالي العلف</Text>
                              </View>
                              <View style={styles.weekDetailStat}>
                                <Text style={styles.weekDetailStatValue}>{Math.round(avgWeight)}g</Text>
                                <Text style={styles.weekDetailStatLabel}>متوسط الوزن</Text>
                              </View>
                              <View style={styles.weekDetailStat}>
                                <Text style={[styles.weekDetailStatValue, { color: COLORS.error }]}>{totalMortality}</Text>
                                <Text style={styles.weekDetailStatLabel}>إجمالي النفوق</Text>
                              </View>
                              <View style={styles.weekDetailStat}>
                                <Text style={[styles.weekDetailStatValue, { color: COLORS.success }]}>{totalProfit.toFixed(0)}</Text>
                                <Text style={styles.weekDetailStatLabel}>الربح المقدر</Text>
                              </View>
                            </View>

                            <Text style={styles.weekDetailDays}>عدد الأيام المسجلة: {weekDays.length}</Text>

                            {isExpanded && (
                              <View style={{ marginTop: 10, gap: 8 }}>
                                {weekDays.map((day) => (
                                  <View key={day.id} style={styles.expandedDayRow}>
                                    <Text style={styles.expandedDayTitle}>اليوم {day.dayNumber}</Text>
                                    <View style={styles.expandedDayStats}>
                                      {day.temperature != null && <Text style={styles.expandedDayStat}>🌡 {day.temperature}°C</Text>}
                                      {day.humidity != null && <Text style={styles.expandedDayStat}>💧 {day.humidity}%</Text>}
                                      {day.feedConsumption > 0 && <Text style={styles.expandedDayStat}>🌾 {day.feedConsumption}kg</Text>}
                                      {day.averageWeight > 0 && <Text style={styles.expandedDayStat}>⚖️ {day.averageWeight}g</Text>}
                                      {day.waterConsumption != null && <Text style={styles.expandedDayStat}>🪣 {day.waterConsumption}L</Text>}
                                      <Text style={[styles.expandedDayStat, { color: day.mortality > 0 ? COLORS.error : COLORS.darkGray }]}>
                                        💀 {day.mortality}
                                      </Text>
                                    </View>
                                    {day.activityLevel ? <Text style={styles.expandedDayNote}>الحركة: {day.activityLevel}</Text> : null}
                                    {Array.isArray(day.mortalityReasons) && day.mortalityReasons.length > 0 && (
                                      <Text style={[styles.expandedDayNote, { color: COLORS.error }]}>السبب: {day.mortalityReasons.join("، ")}</Text>
                                    )}
                                    {day.notes ? <Text style={styles.expandedDayNote}>ملاحظات: {day.notes}</Text> : null}
                                    <Text style={styles.expandedDayDate}>{new Date(day.date).toLocaleDateString("ar")}</Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        );
                      });
                    })()}
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <Button
                title="إغلاق"
                onPress={() => {
                  setShowBatchDetailsModal(false);
                  setSelectedBatch(null);
                }}
                type="secondary"
                size="medium"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Request Vet Confirmation Modal */}
      <Modal visible={showRequestVetModal} transparent animationType="fade" onRequestClose={() => setShowRequestVetModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>طلب تعيين طبيب بيطري</Text>
            <Text style={styles.confirmMessage}>سيتم إرسال طلبك إلى الإدارة لتعيين طبيب بيطري</Text>

            <View style={styles.confirmActions}>
              <Button title="إلغاء" onPress={() => setShowRequestVetModal(false)} type="secondary" size="medium" style={styles.confirmButton} />
              <Button title="إرسال الطلب" onPress={handleConfirmRequestVet} type="primary" size="medium" style={styles.confirmButton} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Contact Vet Modal */}
      <Modal visible={showContactVetModal} transparent animationType="fade" onRequestClose={() => setShowContactVetModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>تواصل مع الطبيب البيطري</Text>
            <Text style={styles.confirmMessage}>هل تريد التواصل مع {farm?.assignedVet?.name}؟</Text>

            <View style={styles.confirmActions}>
              <Button title="إلغاء" onPress={() => setShowContactVetModal(false)} type="secondary" size="medium" style={styles.confirmButton} />
              <Button
                title="اتصال"
                onPress={() => {
                  setShowContactVetModal(false);
                  showToast(`جاري الاتصال بـ ${farm?.assignedVet?.name}`, "info");
                }}
                type="primary"
                size="medium"
                style={styles.confirmButton}
              />
              <Button
                title="رسالة"
                onPress={() => {
                  setShowContactVetModal(false);
                  showToast(`يتم فتح محادثة مع ${farm?.assignedVet?.name}`, "info");
                }}
                type="primary"
                size="medium"
                style={styles.confirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Vet Removal Modal */}
      <Modal visible={showConfirmVetRemoval} transparent animationType="fade" onRequestClose={() => setShowConfirmVetRemoval(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>طلب إلغاء تعيين الطبيب</Text>
            <Text style={styles.confirmMessage}>هل أنت متأكد من إرسال طلب إلغاء تعيين {farm?.assignedVet?.name}؟</Text>

            <View style={styles.confirmActions}>
              <Button title="إلغاء" onPress={() => setShowConfirmVetRemoval(false)} type="secondary" size="medium" style={styles.confirmButton} />
              <Button title="إرسال طلب الإلغاء" onPress={handleConfirmRemoveVet} type="primary" size="medium" style={styles.confirmButton} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Request Supervisor Confirmation Modal */}
      <Modal visible={showRequestSupervisorModal} transparent animationType="fade" onRequestClose={() => setShowRequestSupervisorModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>طلب إشراف</Text>
            <Text style={styles.confirmMessage}>سيتم إرسال طلبك إلى الإدارة لتعيين مشرف</Text>

            <View style={styles.confirmActions}>
              <Button title="إلغاء" onPress={() => setShowRequestSupervisorModal(false)} type="secondary" size="medium" style={styles.confirmButton} />
              <Button title="إرسال الطلب" onPress={handleConfirmRequestSupervisor} type="primary" size="medium" style={styles.confirmButton} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Contact Supervisor Modal */}
      <Modal visible={showContactSupervisorModal} transparent animationType="fade" onRequestClose={() => setShowContactSupervisorModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>تواصل مع المشرف</Text>
            <Text style={styles.confirmMessage}>هل تريد التواصل مع {farm?.assignedSupervisor?.name}؟</Text>

            <View style={styles.confirmActions}>
              <Button title="إلغاء" onPress={() => setShowContactSupervisorModal(false)} type="secondary" size="medium" style={styles.confirmButton} />
              <Button
                title="اتصال"
                onPress={() => {
                  setShowContactSupervisorModal(false);
                  showToast(`جاري الاتصال بـ ${farm?.assignedSupervisor?.name}`, "info");
                }}
                type="primary"
                size="medium"
                style={styles.confirmButton}
              />
              <Button
                title="رسالة"
                onPress={() => {
                  setShowContactSupervisorModal(false);
                  showToast(`يتم فتح محادثة مع ${farm?.assignedSupervisor?.name}`, "info");
                }}
                type="primary"
                size="medium"
                style={styles.confirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Supervisor Removal Modal */}
      <Modal visible={showConfirmSupervisorRemoval} transparent animationType="fade" onRequestClose={() => setShowConfirmSupervisorRemoval(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>طلب إلغاء تعيين المشرف</Text>
            <Text style={styles.confirmMessage}>هل أنت متأكد من إرسال طلب إلغاء تعيين {farm?.assignedSupervisor?.name}؟</Text>

            <View style={styles.confirmActions}>
              <Button title="إلغاء" onPress={() => setShowConfirmSupervisorRemoval(false)} type="secondary" size="medium" style={styles.confirmButton} />
              <Button title="إرسال طلب الإلغاء" onPress={handleConfirmRemoveSupervisor} type="primary" size="medium" style={styles.confirmButton} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Day Modal */}
      <Modal visible={showEditDayModal} transparent animationType="slide" onRequestClose={() => setShowEditDayModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <Text style={styles.modalTitle}>تعديل بيانات اليوم {editingDay?.dayNumber}</Text>

            <ScrollView style={styles.dailyForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>الحرارة (°C)</Text>
                  <TextInput
                    style={styles.input}
                    value={editDayForm.temperature}
                    onChangeText={(v) => setEditDayForm((p) => ({ ...p, temperature: v }))}
                    keyboardType="numeric"
                    textAlign={isRTL ? "right" : "left"}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>الرطوبة (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={editDayForm.humidity}
                    onChangeText={(v) => setEditDayForm((p) => ({ ...p, humidity: v }))}
                    keyboardType="numeric"
                    textAlign={isRTL ? "right" : "left"}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>العلف (كيلو)</Text>
                  <TextInput
                    style={styles.input}
                    value={editDayForm.feedConsumption}
                    onChangeText={(v) => setEditDayForm((p) => ({ ...p, feedConsumption: v }))}
                    keyboardType="numeric"
                    textAlign={isRTL ? "right" : "left"}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>الماء (لتر)</Text>
                  <TextInput
                    style={styles.input}
                    value={editDayForm.waterConsumption}
                    onChangeText={(v) => setEditDayForm((p) => ({ ...p, waterConsumption: v }))}
                    keyboardType="numeric"
                    textAlign={isRTL ? "right" : "left"}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>متوسط وزن الفرد (جرام)</Text>
                <TextInput
                  style={styles.input}
                  value={editDayForm.averageWeight}
                  onChangeText={(v) => setEditDayForm((p) => ({ ...p, averageWeight: v }))}
                  keyboardType="numeric"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الحركة</Text>
                <TextInput
                  style={styles.input}
                  value={editDayForm.activityLevel}
                  onChangeText={(v) => setEditDayForm((p) => ({ ...p, activityLevel: v }))}
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>النفوق (عدد)</Text>
                  <TextInput
                    style={styles.input}
                    value={editDayForm.mortality}
                    onChangeText={(v) => setEditDayForm((p) => ({ ...p, mortality: v }))}
                    keyboardType="numeric"
                    textAlign={isRTL ? "right" : "left"}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                  <Text style={styles.inputLabel}>سبب النفوق</Text>
                  <TextInput
                    style={styles.input}
                    value={editDayForm.mortalityReasons}
                    onChangeText={(v) => setEditDayForm((p) => ({ ...p, mortalityReasons: v }))}
                    textAlign={isRTL ? "right" : "left"}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>العلاجات أو اللقاحات</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editDayForm.treatments}
                  onChangeText={(v) => setEditDayForm((p) => ({ ...p, treatments: v }))}
                  multiline
                  numberOfLines={2}
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الملاحظات</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editDayForm.notes}
                  onChangeText={(v) => setEditDayForm((p) => ({ ...p, notes: v }))}
                  multiline
                  numberOfLines={3}
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="إلغاء"
                onPress={() => {
                  setShowEditDayModal(false);
                  setEditingDay(null);
                }}
                type="secondary"
                size="medium"
                style={styles.modalButton}
              />
              <Button
                title="حفظ التعديلات"
                onPress={handleSaveEditDay}
                type="primary"
                size="medium"
                style={styles.modalButton}
                disabled={updateDailyDataMutation.isPending}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.success,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    flex: 1,
    textAlign: "center",
  },
  deleteHeaderButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "left",
  },
  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  contactRole: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    flex: 2,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.darkGray,
    fontSize: 16,
    marginBottom: 16,
  },
  addButton: {
    width: "100%",
  },
  batchStats: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: "center",
  },
  batchActions: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    overflow: "hidden",
  },
  actionButton: {
    width: "48%",
    flexShrink: 1,
  },
  weekItem: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  weekHeaderOld: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  weekDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  weekStats: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
  },
  weekStat: {
    alignItems: "center",
  },
  weekStatValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
  },
  weekStatLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  assignedPersonContainer: {
    marginBottom: 12,
  },
  assignedPerson: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  personActions: {
    flexDirection: "row-reverse",
    gap: 8,
    paddingHorizontal: 12,
  },
  contactButton: {
    flex: 1,
    minWidth: 100,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  personRole: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  personPhone: {
    fontSize: 12,
    color: COLORS.primary,
  },
  supervisionButton: {
    width: "100%",
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 20,
  },
  modalForm: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row-reverse",
    gap: 10,
    marginBottom: 0,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  input: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.black,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  weekDetails: {
    maxHeight: 300,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  notesSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  notesText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "left",
    lineHeight: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  dailyForm: {
    maxHeight: 500,
    marginBottom: 20,
  },
  dailyScroll: {
    marginBottom: 12,
  },
  dayCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minWidth: 140,
    width: 140,
  },
  emptyDayCard: {
    backgroundColor: COLORS.lightGray,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  emptyDayContent: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  emptyDayText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
    fontStyle: "italic",
  },
  weekContainer: {
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  weekHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  weekSubtitle: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  weekDaysScroll: {
    marginBottom: 12,
  },
  weekSummary: {
    backgroundColor: COLORS.lightBlue || "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  weekSummaryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
    marginBottom: 8,
  },
  weekSummaryStats: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
  },
  weekSummaryStat: {
    alignItems: "center",
    flex: 1,
  },
  weekSummaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
  },
  weekSummaryLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: "center",
  },
  dayNumber: {
    fontSize: 10,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 10,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 8,
  },
  dayStats: {
    gap: 4,
  },
  dayStat: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayStatValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.black,
  },
  dayStatLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
  },
  moreDataText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
    fontStyle: "italic",
  },
  weeklyReport: {
    maxHeight: 500,
    marginBottom: 20,
  },
  weekReportCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  weekReportHeader: {
    marginBottom: 12,
  },
  weekReportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
  },
  weekReportDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "left",
    marginTop: 4,
  },
  weekReportStats: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekReportStat: {
    alignItems: "center",
    flex: 1,
  },
  weekReportStatValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
  },
  weekReportStatLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: "center",
  },
  weekReportDays: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: "left",
    fontWeight: "600",
  },
  emptyReport: {
    alignItems: "center",
    padding: 40,
  },
  emptyReportText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyReportSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: COLORS.lightBlue || "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: "left",
  },
  infoText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "left",
    lineHeight: 18,
    marginBottom: 4,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    marginTop: 16,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.white,
    marginLeft: 8,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "left",
    marginTop: 4,
    fontStyle: "italic",
  },
  completedBatchItem: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  batchItemHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  batchItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  batchItemStats: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  batchItemStat: {
    alignItems: "center",
    flex: 1,
  },
  batchItemStatLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  batchItemStatValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.black,
  },
  batchItemDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "left",
    marginBottom: 4,
  },
  viewDetailsText: {
    fontSize: 11,
    color: COLORS.primary,
    textAlign: "center",
    fontStyle: "italic",
  },
  batchDetailsScroll: {
    maxHeight: 500,
    marginBottom: 20,
  },
  batchSummaryCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  batchSummaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  weeklyDetailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  weeklyDetailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
    marginBottom: 12,
  },
  weekDetailCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  weekDetailTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
    marginBottom: 8,
  },
  weekDetailStats: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekDetailStat: {
    alignItems: "center",
    flex: 1,
  },
  weekDetailStatValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.black,
  },
  weekDetailStatLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: "center",
  },
  weekDetailDays: {
    fontSize: 11,
    color: COLORS.primary,
    textAlign: "left",
    fontWeight: "600",
  },
  expandedDayRow: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  expandedDayTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 4,
  },
  expandedDayStats: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  expandedDayStat: {
    fontSize: 12,
    color: COLORS.darkGray,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  expandedDayNote: {
    fontSize: 11,
    color: COLORS.darkGray,
    textAlign: "right",
    marginTop: 2,
  },
  expandedDayDate: {
    fontSize: 10,
    color: "#aaa",
    textAlign: "left",
    marginTop: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  assignmentDate: {
    fontSize: 11,
    color: COLORS.success,
    marginTop: 2,
    fontStyle: "italic",
  },
  confirmModal: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: "85%",
    maxWidth: 400,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: "row-reverse",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  confirmButton: {
    minWidth: 100,
  },
});
