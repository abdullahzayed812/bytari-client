import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import Button from "../components/Button";
import { trpc } from "../lib/trpc";
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
} from "lucide-react-native";
import { PoultryFarm, PoultryBatch, PoultryWeek, PoultryDay } from "../types";
import { useQuery } from "@tanstack/react-query";

export default function PoultryFarmDetailsScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();

  // Mock farm ID - in real app this would come from route params
  const farmId = "farm1";

  // Fetch field assignment data
  const fieldAssignmentQuery = useQuery(
    trpc.admin.fieldAssignments.getAssignment.queryOptions({
      farmId: farmId,
    })
  );

  // Mock data - في التطبيق الحقيقي ستأتي من API
  const [farm, setFarm] = useState<PoultryFarm>({
    id: "1",
    ownerId: "user1",
    name: "حقل الدواجن الأول",
    location: "بغداد",
    address: "منطقة الدورة - شارع الصناعة",
    description: "حقل دواجن حديث مجهز بأحدث التقنيات",
    totalArea: 500,
    capacity: 1000,
    batches: [],
    createdAt: new Date().toISOString(),
    status: "active",
  });

  // Update farm data when assignment data is loaded
  useEffect(() => {
    if (fieldAssignmentQuery.data) {
      const assignment = fieldAssignmentQuery.data;
      setFarm((prev) => ({
        ...prev,
        assignedVet: assignment.assignedVetId
          ? {
              id: assignment.assignedVetId,
              name: assignment.assignedVetName!,
              phone: assignment.assignedVetPhone!,
              specialization: "طب الدواجن",
              assignedAt: assignment.updatedAt,
            }
          : undefined,
        assignedSupervisor: assignment.assignedSupervisorId
          ? {
              id: assignment.assignedSupervisorId,
              name: assignment.assignedSupervisorName!,
              phone: assignment.assignedSupervisorPhone!,
              experience: "5 سنوات",
              assignedAt: assignment.updatedAt,
            }
          : undefined,
      }));
    }
  }, [fieldAssignmentQuery.data]);

  const [currentBatch, setCurrentBatch] = useState<PoultryBatch | null>(null);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<PoultryWeek | null>(null);
  const [showAddDailyDataModal, setShowAddDailyDataModal] = useState(false);
  const [showWeeklyReportModal, setShowWeeklyReportModal] = useState(false);
  const [showSellBatchModal, setShowSellBatchModal] = useState(false);
  const [showBatchDetailsModal, setShowBatchDetailsModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<PoultryBatch | null>(null);
  const [dailyDataForm, setDailyDataForm] = useState({
    mortality: "",
    mortalityReasons: "",
    feedConsumption: "",
    averageWeight: "",
    treatments: "",
    notes: "",
  });
  const [sellBatchForm, setSellBatchForm] = useState({
    netCount: "",
    netProfit: "",
  });
  const [currentDays, setCurrentDays] = useState<PoultryDay[]>([]);

  const [batchForm, setBatchForm] = useState({
    initialCount: "",
    pricePerChick: "",
    averageWeight: "",
  });

  const loadFarmData = useCallback(() => {
    // لا نحمل دفعات مكتملة وهمية - فقط نبدأ بدفعة فارغة
    // الدفعات المكتملة ستظهر فقط عندما يقوم المستخدم ببيع دفعة فعلية

    setFarm((prev) => ({
      ...prev,
      batches: [], // نبدأ بقائمة فارغة من الدفعات المكتملة
    }));
  }, []);

  useEffect(() => {
    // محاكاة تحميل البيانات
    loadFarmData();
  }, [loadFarmData]);

  const handleAddBatch = () => {
    if (!batchForm.initialCount || !batchForm.pricePerChick || !batchForm.averageWeight) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    // حساب رقم الدفعة الجديد بناءً على الدفعات المكتملة والدفعة الحالية
    const completedBatchesCount = farm.batches.filter((b) => b.status === "sold" || b.status === "completed").length;
    const currentBatchExists = currentBatch ? 1 : 0;
    const newBatchNumber = completedBatchesCount + currentBatchExists + 1;

    const newBatch: PoultryBatch = {
      id: `batch${Date.now()}`,
      farmId: farm.id,
      batchNumber: newBatchNumber,
      startDate: new Date().toISOString(),
      initialCount: parseInt(batchForm.initialCount),
      currentCount: parseInt(batchForm.initialCount),
      chicksAge: 0,
      pricePerChick: parseFloat(batchForm.pricePerChick),
      totalInvestment: parseInt(batchForm.initialCount) * parseFloat(batchForm.pricePerChick),
      weeks: [],
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setCurrentBatch(newBatch);
    setFarm((prev) => ({
      ...prev,
      currentBatch: newBatch,
    }));

    setShowAddBatchModal(false);
    setBatchForm({ initialCount: "", pricePerChick: "", averageWeight: "" });

    Alert.alert("نجح", "تم إضافة دفعة جديدة بنجاح");
  };

  const handleSellBatch = () => {
    if (!currentBatch) return;
    setShowSellBatchModal(true);
  };

  const handleConfirmSellBatch = () => {
    if (!currentBatch) return;

    const netCount = sellBatchForm.netCount ? parseInt(sellBatchForm.netCount) : undefined;
    const netProfit = sellBatchForm.netProfit ? parseFloat(sellBatchForm.netProfit) : undefined;

    // Validate net count if provided
    if (netCount !== undefined && (isNaN(netCount) || netCount < 0)) {
      Alert.alert("خطأ", "يرجى إدخال عدد صحيح للعدد الصافي");
      return;
    }

    if (netCount !== undefined && netCount > currentBatch.currentCount) {
      Alert.alert(
        "خطأ",
        `العدد الصافي (${netCount}) لا يمكن أن يكون أكبر من العدد الحالي (${currentBatch.currentCount})`
      );
      return;
    }

    // Validate net profit if provided
    if (netProfit !== undefined && isNaN(netProfit)) {
      Alert.alert("خطأ", "يرجى إدخال رقم صحيح للربح الصافي");
      return;
    }

    const updatedBatch = {
      ...currentBatch,
      status: "sold" as const,
      endDate: new Date().toISOString(),
      finalCount: netCount || currentBatch.currentCount,
      totalProfit: netProfit || currentDays.reduce((sum, day) => sum + day.estimatedProfit, 0),
      days: currentDays, // حفظ جميع البيانات اليومية مع الدفعة المباعة
    };

    // إضافة الدفعة إلى قائمة الدفعات المكتملة
    setFarm((prev) => ({
      ...prev,
      batches: [...prev.batches, updatedBatch],
      currentBatch: undefined,
    }));

    setCurrentBatch(null);
    setCurrentDays([]);
    setShowSellBatchModal(false);
    setSellBatchForm({ netCount: "", netProfit: "" });

    Alert.alert(
      "تم بيع الدفعة بنجاح! ✅",
      `تم بيع الدفعة رقم ${updatedBatch.batchNumber}\n\n📊 ملخص البيع:\n• العدد النهائي: ${
        updatedBatch.finalCount
      }\n• الربح الصافي: ${updatedBatch.totalProfit?.toFixed(2)} دينار\n\nتم حفظ جميع البيانات في السجلات.`,
      [{ text: "موافق", style: "default" }]
    );
  };

  const handleViewBatchDetails = (batch: PoultryBatch) => {
    setSelectedBatch(batch);
    setShowBatchDetailsModal(true);
  };

  const handleRequestVet = () => {
    Alert.alert("طلب تعيين طبيب بيطري", "سيتم إرسال طلبك إلى الإدارة لتعيين طبيب بيطري لمتابعة حقل الدواجن", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إرسال الطلب",
        onPress: () => {
          Alert.alert("تم الإرسال", "تم إرسال طلب تعيين الطبيب البيطري بنجاح");
        },
      },
    ]);
  };

  const handleContactVet = () => {
    if (!farm.assignedVet) return;
    Alert.alert("تواصل مع الطبيب البيطري", `هل تريد التواصل مع ${farm.assignedVet.name}؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "اتصال",
        onPress: () => {
          Alert.alert("جاري الاتصال...", `يتم الاتصال بـ ${farm.assignedVet?.name}`);
        },
      },
      {
        text: "رسالة",
        onPress: () => {
          Alert.alert("فتح المحادثة", `يتم فتح محادثة مع ${farm.assignedVet?.name}`);
        },
      },
    ]);
  };

  const handleRemoveVet = () => {
    if (!farm.assignedVet) return;
    Alert.alert(
      "طلب إلغاء تعيين الطبيب",
      `هل أنت متأكد من إرسال طلب إلغاء تعيين ${farm.assignedVet.name}؟\n\nسيتم إرسال الطلب إلى الإدارة للمراجعة والموافقة.`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إرسال طلب الإلغاء",
          style: "destructive",
          onPress: () => {
            // إرسال طلب إلغاء إلى الإدارة
            Alert.alert(
              "تم إرسال الطلب ✅",
              `تم إرسال طلب إلغاء تعيين الطبيب ${farm.assignedVet?.name} إلى الإدارة بنجاح.\n\nسيتم مراجعة الطلب والرد عليك في أقرب وقت ممكن.`,
              [{ text: "موافق", style: "default" }]
            );
          },
        },
      ]
    );
  };

  const handleRequestSupervisor = () => {
    Alert.alert("طلب إشراف", "سيتم إرسال طلبك إلى الإدارة لتعيين مشرف لمتابعة حقل الدواجن", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إرسال الطلب",
        onPress: () => {
          Alert.alert("تم الإرسال", "تم إرسال طلب الإشراف بنجاح");
        },
      },
    ]);
  };

  const handleContactSupervisor = () => {
    if (!farm.assignedSupervisor) return;
    Alert.alert("تواصل مع المشرف", `هل تريد التواصل مع ${farm.assignedSupervisor.name}؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "اتصال",
        onPress: () => {
          Alert.alert("جاري الاتصال...", `يتم الاتصال بـ ${farm.assignedSupervisor?.name}`);
        },
      },
      {
        text: "رسالة",
        onPress: () => {
          Alert.alert("فتح المحادثة", `يتم فتح محادثة مع ${farm.assignedSupervisor?.name}`);
        },
      },
    ]);
  };

  const handleRemoveSupervisor = () => {
    if (!farm.assignedSupervisor) return;
    Alert.alert(
      "طلب إلغاء تعيين المشرف",
      `هل أنت متأكد من إرسال طلب إلغاء تعيين ${farm.assignedSupervisor.name}؟\n\nسيتم إرسال الطلب إلى الإدارة للمراجعة والموافقة.`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إرسال طلب الإلغاء",
          style: "destructive",
          onPress: () => {
            // إرسال طلب إلغاء إلى الإدارة
            Alert.alert(
              "تم إرسال الطلب ✅",
              `تم إرسال طلب إلغاء تعيين المشرف ${farm.assignedSupervisor?.name} إلى الإدارة بنجاح.\n\nسيتم مراجعة الطلب والرد عليك في أقرب وقت ممكن.`,
              [{ text: "موافق", style: "default" }]
            );
          },
        },
      ]
    );
  };

  const handleAddDailyData = () => {
    if (!currentBatch) return;

    // التحقق من الحقول المطلوبة
    if (
      !dailyDataForm.mortality.trim() ||
      !dailyDataForm.feedConsumption.trim() ||
      !dailyDataForm.averageWeight.trim()
    ) {
      Alert.alert("خطأ", "يرجى ملء الحقول المطلوبة:\n• عدد النفوق\n• استهلاك العلف\n• متوسط الوزن");
      return;
    }

    // التحقق من صحة البيانات
    const mortality = parseInt(dailyDataForm.mortality);
    const feedConsumption = parseFloat(dailyDataForm.feedConsumption);
    const averageWeight = parseFloat(dailyDataForm.averageWeight);

    if (isNaN(mortality) || mortality < 0) {
      Alert.alert("خطأ", "يرجى إدخال رقم صحيح لعدد النفوق");
      return;
    }

    if (isNaN(feedConsumption) || feedConsumption < 0) {
      Alert.alert("خطأ", "يرجى إدخال رقم صحيح لاستهلاك العلف");
      return;
    }

    if (isNaN(averageWeight) || averageWeight < 0) {
      Alert.alert("خطأ", "يرجى إدخال رقم صحيح لمتوسط الوزن");
      return;
    }

    if (mortality > currentBatch.currentCount) {
      Alert.alert(
        "خطأ",
        `عدد النفوق (${mortality}) لا يمكن أن يكون أكبر من العدد الحالي (${currentBatch.currentCount})`
      );
      return;
    }

    const today = new Date();
    const dayNumber = currentDays.length + 1;

    const newDay: PoultryDay = {
      id: `day${dayNumber}_${Date.now()}`,
      batchId: currentBatch.id,
      dayNumber: dayNumber,
      date: today.toISOString(),
      feedConsumption: feedConsumption,
      feedCost: feedConsumption * 0.5, // تكلفة تقديرية للكيلو الواحد
      averageWeight: averageWeight,
      mortality: mortality,
      mortalityReasons: dailyDataForm.mortalityReasons
        ? dailyDataForm.mortalityReasons
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : [],
      treatments: dailyDataForm.treatments
        ? dailyDataForm.treatments
            .split(",")
            .map((t, index) => ({
              id: `treatment${dayNumber}_${index}_${Date.now()}`,
              dayId: `day${dayNumber}_${Date.now()}`,
              batchId: currentBatch.id,
              treatmentType: "medication" as const,
              name: t.trim(),
              dosage: "",
              frequency: "",
              duration: 0,
              administeredBy: "owner" as const,
              date: today.toISOString(),
              cost: 0,
              reason: "preventive",
              notes: "",
              createdAt: today.toISOString(),
            }))
            .filter((t) => t.name.length > 0)
        : [],
      vaccinations: [],
      estimatedProfit: calculateDailyProfit(currentBatch, feedConsumption, mortality),
      notes: dailyDataForm.notes || "",
      createdAt: today.toISOString(),
    };

    const updatedDays = [...currentDays, newDay];
    setCurrentDays(updatedDays);

    // تحديث الدفعة الحالية
    const updatedBatch = {
      ...currentBatch,
      currentCount: Math.max(0, currentBatch.currentCount - mortality),
      chicksAge: currentBatch.chicksAge + 1,
      days: updatedDays,
    };

    setCurrentBatch(updatedBatch);
    setShowAddDailyDataModal(false);

    // إعادة تعيين النموذج
    setDailyDataForm({
      mortality: "",
      mortalityReasons: "",
      feedConsumption: "",
      averageWeight: "",
      treatments: "",
      notes: "",
    });

    Alert.alert(
      "تم بنجاح! ✅",
      `تم إضافة بيانات اليوم ${dayNumber} بنجاح\n\n📊 ملخص اليوم:\n• النفوق: ${mortality}\n• العلف: ${feedConsumption}kg\n• الوزن: ${averageWeight}g\n• العدد المتبقي: ${updatedBatch.currentCount}`,
      [{ text: "موافق", style: "default" }]
    );
  };

  const calculateDailyProfit = (batch: PoultryBatch, feedConsumption: number, mortality: number) => {
    const feedCost = feedConsumption * 0.5;
    const mortalityLoss = mortality * batch.pricePerChick;
    const estimatedRevenue = batch.currentCount * 0.02; // ربح يومي تقديري
    return Math.max(0, estimatedRevenue - feedCost - mortalityLoss);
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
        <Text style={styles.infoValue}>{farm.name}</Text>
      </View>

      <View style={styles.infoRow}>
        <MapPin size={20} color={COLORS.primary} />
        <Text style={styles.infoLabel}>الموقع:</Text>
        <Text style={styles.infoValue}>{farm.location}</Text>
      </View>

      <View style={styles.infoRow}>
        <Square size={20} color={COLORS.primary} />
        <Text style={styles.infoLabel}>المساحة:</Text>
        <Text style={styles.infoValue}>{farm.totalArea} متر مربع</Text>
      </View>

      <View style={styles.infoRow}>
        <Users size={20} color={COLORS.primary} />
        <Text style={styles.infoLabel}>السعة القصوى:</Text>
        <Text style={styles.infoValue}>{farm.capacity} طائر</Text>
      </View>
    </View>
  );

  const renderCurrentBatch = () => {
    if (!currentBatch) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>الدفعة الحالية</Text>
          <Text style={styles.emptyText}>لا توجد دفعة نشطة حالياً</Text>
          <Button
            title="إدخال دفعة جديدة"
            onPress={() => setShowAddBatchModal(true)}
            type="primary"
            size="medium"
            icon={<Plus size={16} color={COLORS.white} />}
            style={styles.addButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>الدفعة رقم {currentBatch.batchNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentBatch.status) }]}>
            <Text style={styles.statusText}>
              {currentBatch.status === "active"
                ? "نشط"
                : currentBatch.status === "completed"
                ? "مكتمل"
                : currentBatch.status === "sold"
                ? "مباع"
                : "غير محدد"}
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
              {currentDays.length > 0 ? currentDays[currentDays.length - 1].averageWeight : 0}g
            </Text>
            <Text style={styles.statLabel}>متوسط الوزن</Text>
          </View>

          <View style={styles.statItem}>
            <DollarSign size={24} color={COLORS.success} />
            <Text style={styles.statValue}>
              {currentDays.reduce((sum, day) => sum + day.estimatedProfit, 0).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>الربح المقدر</Text>
          </View>
        </View>

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
      </View>
    );
  };

  const renderDailyData = () => {
    if (!currentDays.length) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>البيانات اليومية</Text>
          <Text style={styles.emptyText}>لا توجد بيانات يومية مسجلة</Text>
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
        <Text style={styles.cardTitle}>البيانات اليومية ({currentDays.length} يوم)</Text>

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
                        <Text style={styles.dayTitle}>اليوم {dayIndex + 1}</Text>
                        <Text style={styles.dayNumber}>({dayNumber})</Text>

                        {dayData ? (
                          <View style={styles.dayStats}>
                            <View style={styles.dayStat}>
                              <Text style={styles.dayStatValue}>{dayData.feedConsumption}kg</Text>
                              <Text style={styles.dayStatLabel}>العلف</Text>
                            </View>

                            <View style={styles.dayStat}>
                              <Text style={styles.dayStatValue}>{dayData.averageWeight}g</Text>
                              <Text style={styles.dayStatLabel}>الوزن</Text>
                            </View>

                            <View style={styles.dayStat}>
                              <Text style={[styles.dayStatValue, { color: COLORS.error }]}>{dayData.mortality}</Text>
                              <Text style={styles.dayStatLabel}>النفوق</Text>
                            </View>

                            {dayData.estimatedProfit > 0 && (
                              <View style={styles.dayStat}>
                                <Text style={[styles.dayStatValue, { color: COLORS.success }]}>
                                  {dayData.estimatedProfit.toFixed(0)}
                                </Text>
                                <Text style={styles.dayStatLabel}>الربح</Text>
                              </View>
                            )}

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
                        {weekDays.reduce((sum, day) => sum + day.feedConsumption, 0).toFixed(1)}kg
                      </Text>
                      <Text style={styles.weekSummaryLabel}>إجمالي العلف</Text>
                    </View>

                    <View style={styles.weekSummaryStat}>
                      <Text style={[styles.weekSummaryValue, { color: COLORS.error }]}>
                        {weekDays.reduce((sum, day) => sum + day.mortality, 0)}
                      </Text>
                      <Text style={styles.weekSummaryLabel}>إجمالي النفوق</Text>
                    </View>

                    <View style={styles.weekSummaryStat}>
                      <Text style={styles.weekSummaryValue}>
                        {Math.round(weekDays.reduce((sum, day) => sum + day.averageWeight, 0) / weekDays.length)}g
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
    if (!farm.batches.length) {
      return null;
    }

    const completedBatches = farm.batches.filter((batch) => batch.status === "sold" || batch.status === "completed");

    if (!completedBatches.length) {
      return null;
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>الدفعات المكتملة ({completedBatches.length})</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {completedBatches.map((batch) => (
            <TouchableOpacity
              key={batch.id}
              style={styles.completedBatchItem}
              onPress={() => handleViewBatchDetails(batch)}
            >
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
                  <Text style={[styles.batchItemStatValue, { color: COLORS.success }]}>
                    {batch.totalProfit?.toFixed(2) || "0.00"} د.ع
                  </Text>
                </View>

                <View style={styles.batchItemStat}>
                  <Text style={styles.batchItemStatLabel}>المدة:</Text>
                  <Text style={styles.batchItemStatValue}>
                    {Math.ceil(
                      (new Date(batch.endDate || batch.createdAt).getTime() - new Date(batch.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    يوم
                  </Text>
                </View>
              </View>

              <Text style={styles.batchItemDate}>
                {new Date(batch.startDate).toLocaleDateString("ar")} -{" "}
                {new Date(batch.endDate || batch.createdAt).toLocaleDateString("ar")}
              </Text>

              <Text style={styles.viewDetailsText}>اضغط لعرض التفاصيل الكاملة</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSupervision = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>الإشراف والمتابعة</Text>

      {fieldAssignmentQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري تحميل بيانات التعيين...</Text>
        </View>
      ) : (
        <>
          {farm.assignedVet ? (
            <View style={styles.assignedPersonContainer}>
              <View style={styles.assignedPerson}>
                <Stethoscope size={20} color={COLORS.success} />
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{farm.assignedVet.name}</Text>
                  <Text style={styles.personRole}>طبيب بيطري - {farm.assignedVet.specialization}</Text>
                  <Text style={styles.personPhone}>{farm.assignedVet.phone}</Text>
                  <Text style={styles.assignmentDate}>
                    تم التعيين: {new Date(farm.assignedVet.assignedAt!).toLocaleDateString("ar")}
                  </Text>
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

          {farm.assignedSupervisor ? (
            <View style={styles.assignedPersonContainer}>
              <View style={styles.assignedPerson}>
                <UserCheck size={20} color={COLORS.primary} />
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{farm.assignedSupervisor.name}</Text>
                  <Text style={styles.personRole}>مشرف - خبرة {farm.assignedSupervisor.experience}</Text>
                  <Text style={styles.personPhone}>{farm.assignedSupervisor.phone}</Text>
                  <Text style={styles.assignmentDate}>
                    تم التعيين: {new Date(farm.assignedSupervisor.assignedAt!).toLocaleDateString("ar")}
                  </Text>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.white} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
        </TouchableOpacity>
        <Text style={styles.title}>حقل الدواجن</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderFarmInfo()}
        {renderCurrentBatch()}
        {renderDailyData()}
        {renderCompletedBatches()}
        {renderSupervision()}
      </ScrollView>

      {/* Add Batch Modal */}
      <Modal
        visible={showAddBatchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddBatchModal(false)}
      >
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
                <Text style={styles.inputLabel}>السعر (دينار عراقي) *</Text>
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
              <Button
                title="إلغاء"
                onPress={() => setShowAddBatchModal(false)}
                type="secondary"
                size="medium"
                style={styles.modalButton}
              />
              <Button title="إضافة" onPress={handleAddBatch} type="primary" size="medium" style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Weekly Report Modal */}
      <Modal
        visible={showWeeklyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWeeklyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedWeek ? `الأسبوع ${selectedWeek.weekNumber}` : "التقرير الأسبوعي"}
            </Text>

            {selectedWeek && (
              <ScrollView style={styles.weekDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>استهلاك العلف:</Text>
                  <Text style={styles.detailValue}>{selectedWeek.feedConsumption} كيلو</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>تكلفة العلف:</Text>
                  <Text style={styles.detailValue}>{selectedWeek.feedCost} دينار</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>متوسط الوزن:</Text>
                  <Text style={styles.detailValue}>{selectedWeek.averageWeight} جرام</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>النفوق:</Text>
                  <Text style={[styles.detailValue, { color: COLORS.error }]}>{selectedWeek.mortality} طائر</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الربح المقدر:</Text>
                  <Text style={[styles.detailValue, { color: COLORS.success }]}>
                    {selectedWeek.estimatedProfit} دينار
                  </Text>
                </View>

                {selectedWeek.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesTitle}>ملاحظات:</Text>
                    <Text style={styles.notesText}>{selectedWeek.notes}</Text>
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <Button
                title="إغلاق"
                onPress={() => {
                  setShowWeeklyModal(false);
                  setSelectedWeek(null);
                }}
                type="secondary"
                size="medium"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Daily Data Modal */}
      <Modal
        visible={showAddDailyDataModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddDailyDataModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <Text style={styles.modalTitle}>إضافة بيانات يومية</Text>
            <Text style={styles.modalSubtitle}>
              اليوم {currentDays.length + 1} - {new Date().toLocaleDateString("ar")}
            </Text>

            <ScrollView style={styles.dailyForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>عدد النفوق اليوم * 🐔💀</Text>
                <TextInput
                  style={styles.input}
                  value={dailyDataForm.mortality}
                  onChangeText={(value) => setDailyDataForm((prev) => ({ ...prev, mortality: value }))}
                  placeholder="أدخل عدد الطيور النافقة اليوم"
                  keyboardType="numeric"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>أسباب النفوق 📝</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={dailyDataForm.mortalityReasons}
                  onChangeText={(value) => setDailyDataForm((prev) => ({ ...prev, mortalityReasons: value }))}
                  placeholder="أدخل أسباب النفوق (مفصولة بفاصلة)\nمثال: ضعف عام، مشاكل تنفسية، حوادث"
                  multiline
                  numberOfLines={3}
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>استهلاك العلف اليوم (كيلو) * 🌾</Text>
                <TextInput
                  style={styles.input}
                  value={dailyDataForm.feedConsumption}
                  onChangeText={(value) => setDailyDataForm((prev) => ({ ...prev, feedConsumption: value }))}
                  placeholder="أدخل كمية العلف المستهلكة اليوم بالكيلو"
                  keyboardType="numeric"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>متوسط الوزن (جرام) * ⚖️</Text>
                <TextInput
                  style={styles.input}
                  value={dailyDataForm.averageWeight}
                  onChangeText={(value) => setDailyDataForm((prev) => ({ ...prev, averageWeight: value }))}
                  placeholder="أدخل متوسط وزن الطيور بالجرام"
                  keyboardType="numeric"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>العلاجات المستخدمة اليوم 💊</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={dailyDataForm.treatments}
                  onChangeText={(value) => setDailyDataForm((prev) => ({ ...prev, treatments: value }))}
                  placeholder="أدخل العلاجات المستخدمة اليوم (مفصولة بفاصلة)\nمثال: مضاد حيوي، فيتامينات، مطهر"
                  multiline
                  numberOfLines={3}
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ملاحظات اليوم 📋</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={dailyDataForm.notes}
                  onChangeText={(value) => setDailyDataForm((prev) => ({ ...prev, notes: value }))}
                  placeholder="أدخل أي ملاحظات عن اليوم\nمثال: تغيير في السلوك، حالة الطقس، مشاكل في التهوية"
                  multiline
                  numberOfLines={4}
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>💡 نصائح يومية:</Text>
                <Text style={styles.infoText}>• سجل البيانات في نفس الوقت يومياً</Text>
                <Text style={styles.infoText}>• راقب سلوك الطيور وشهيتها للطعام</Text>
                <Text style={styles.infoText}>• تأكد من نظافة المياه والمعالف</Text>
                <Text style={styles.infoText}>• لاحظ أي تغييرات في البيئة المحيطة</Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="إلغاء"
                onPress={() => {
                  setShowAddDailyDataModal(false);
                  setDailyDataForm({
                    mortality: "",
                    mortalityReasons: "",
                    feedConsumption: "",
                    averageWeight: "",
                    treatments: "",
                    notes: "",
                  });
                }}
                type="secondary"
                size="medium"
                style={styles.modalButton}
              />
              <Button
                title="حفظ البيانات"
                onPress={handleAddDailyData}
                type="primary"
                size="medium"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Weekly Report Modal */}
      <Modal
        visible={showWeeklyReportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWeeklyReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <Text style={styles.modalTitle}>التقرير الأسبوعي</Text>

            <ScrollView style={styles.weeklyReport} showsVerticalScrollIndicator={false}>
              {generateWeeklyReport()?.map((week) => (
                <View key={week.weekNumber} style={styles.weekReportCard}>
                  <View style={styles.weekReportHeader}>
                    <Text style={styles.weekReportTitle}>الأسبوع {week.weekNumber}</Text>
                    <Text style={styles.weekReportDate}>
                      {new Date(week.startDate).toLocaleDateString("ar")} -{" "}
                      {new Date(week.endDate).toLocaleDateString("ar")}
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
              <Button
                title="إغلاق"
                onPress={() => setShowWeeklyReportModal(false)}
                type="secondary"
                size="medium"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Sell Batch Modal */}
      <Modal
        visible={showSellBatchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSellBatchModal(false)}
      >
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
                  placeholder={`الربح المقدر: ${currentDays
                    .reduce((sum, day) => sum + day.estimatedProfit, 0)
                    .toFixed(2)} د.ع`}
                  keyboardType="numeric"
                  textAlign={isRTL ? "right" : "left"}
                />
                <Text style={styles.inputHint}>الربح الفعلي من بيع الدفعة بالدينار العراقي</Text>
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
              <Button
                title="تأكيد البيع"
                onPress={handleConfirmSellBatch}
                type="primary"
                size="medium"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Batch Details Modal */}
      <Modal
        visible={showBatchDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBatchDetailsModal(false)}
      >
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
                    <Text style={styles.summaryValue}>
                      {new Date(selectedBatch.startDate).toLocaleDateString("ar")}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>تاريخ النهاية:</Text>
                    <Text style={styles.summaryValue}>
                      {selectedBatch.endDate ? new Date(selectedBatch.endDate).toLocaleDateString("ar") : "غير محدد"}
                    </Text>
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
                    <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                      {selectedBatch.totalProfit?.toFixed(2) || "0.00"} د.ع
                    </Text>
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

                        const totalFeedConsumption = weekDays.reduce((sum, day) => sum + day.feedConsumption, 0);
                        const totalMortality = weekDays.reduce((sum, day) => sum + day.mortality, 0);
                        const avgWeight = weekDays.reduce((sum, day) => sum + day.averageWeight, 0) / weekDays.length;
                        const totalProfit = weekDays.reduce((sum, day) => sum + day.estimatedProfit, 0);

                        return (
                          <View key={weekNumber} style={styles.weekDetailCard}>
                            <Text style={styles.weekDetailTitle}>الأسبوع {weekNumber}</Text>

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
                                <Text style={[styles.weekDetailStatValue, { color: COLORS.error }]}>
                                  {totalMortality}
                                </Text>
                                <Text style={styles.weekDetailStatLabel}>إجمالي النفوق</Text>
                              </View>

                              <View style={styles.weekDetailStat}>
                                <Text style={[styles.weekDetailStatValue, { color: COLORS.success }]}>
                                  {totalProfit.toFixed(0)}
                                </Text>
                                <Text style={styles.weekDetailStatLabel}>الربح المقدر</Text>
                              </View>
                            </View>

                            <Text style={styles.weekDetailDays}>عدد الأيام المسجلة: {weekDays.length}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    flexDirection: "row",
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
    textAlign: "right",
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
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
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
    flexDirection: "row",
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
    gap: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
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
    flexDirection: "row",
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
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
    textAlign: "right",
  },
  notesText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "right",
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
    maxHeight: 400,
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
    minWidth: 120,
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
    textAlign: "right",
    marginBottom: 8,
  },
  weekSummaryStats: {
    flexDirection: "row",
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
    flexDirection: "row",
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
    textAlign: "right",
  },
  weekReportDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
    marginTop: 4,
  },
  weekReportStats: {
    flexDirection: "row",
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
    textAlign: "right",
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
    textAlign: "right",
  },
  infoText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
    lineHeight: 18,
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
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
    flexDirection: "row",
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
    textAlign: "right",
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
    textAlign: "right",
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
    textAlign: "right",
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
    textAlign: "right",
    marginBottom: 8,
  },
  weekDetailStats: {
    flexDirection: "row",
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
    textAlign: "right",
    fontWeight: "600",
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
});
