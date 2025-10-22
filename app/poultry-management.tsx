import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import Button from "../components/Button";
import {
  Plus,
  Egg,
  AlertTriangle,
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  Bell,
  Settings,
  MapPin,
  Users,
  Package,
  Heart,
  Zap,
} from 'lucide-react-native';
import { PoultryFarm, PoultryBatch, PoultryAlert } from "../types";

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalFarms: number;
  totalBirds: number;
  activeBatches: number;
  monthlyProfit: number;
  mortalityRate: number;
  feedEfficiency: number;
  pendingAlerts: number;
  todayEggs: number;
}

export default function PoultryManagementScreen() {
  const { t } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [farms, setFarms] = useState<PoultryFarm[]>([]);
  const [recentBatches, setRecentBatches] = useState<PoultryBatch[]>([]);
  const [alerts, setAlerts] = useState<PoultryAlert[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalFarms: 0,
    totalBirds: 0,
    activeBatches: 0,
    monthlyProfit: 0,
    mortalityRate: 0,
    feedEfficiency: 0,
    pendingAlerts: 0,
    todayEggs: 0,
  });

  const loadData = useCallback(async () => {
    try {
      // Mock data - في التطبيق الحقيقي سيتم جلب البيانات من API
      const mockFarms: PoultryFarm[] = [
        {
          id: '1',
          ownerId: user?.id || '1',
          name: 'مزرعة الأمل للدواجن',
          location: 'الرياض، المملكة العربية السعودية',
          farmType: 'broiler',
          capacity: 10000,
          currentCount: 8500,
          establishedDate: '2023-01-15',
          description: 'مزرعة متخصصة في تربية دجاج اللحم',
          images: ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?ixlib=rb-4.0.3'],
          isActive: true,
          createdAt: '2023-01-15',
          updatedAt: '2024-01-15',
        },
        {
          id: '2',
          ownerId: user?.id || '1',
          name: 'مزرعة النجاح للبيض',
          location: 'جدة، المملكة العربية السعودية',
          farmType: 'layer',
          capacity: 5000,
          currentCount: 4800,
          establishedDate: '2022-06-10',
          description: 'مزرعة متخصصة في إنتاج البيض',
          images: ['https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3'],
          isActive: true,
          createdAt: '2022-06-10',
          updatedAt: '2024-01-15',
        },
      ];

      const mockBatches: PoultryBatch[] = [
        {
          id: '1',
          farmId: '1',
          batchNumber: 'B-2024-001',
          birdType: 'chicken',
          breed: 'روس 308',
          initialCount: 2000,
          currentCount: 1950,
          ageInDays: 25,
          averageWeight: 1200,
          startDate: '2024-01-01',
          expectedHarvestDate: '2024-02-15',
          status: 'active',
          mortality: 50,
          notes: 'نمو جيد، صحة ممتازة',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-25',
        },
        {
          id: '2',
          farmId: '2',
          batchNumber: 'L-2024-001',
          birdType: 'chicken',
          breed: 'هايلاين براون',
          initialCount: 1000,
          currentCount: 980,
          ageInDays: 120,
          averageWeight: 1800,
          startDate: '2023-09-01',
          status: 'active',
          mortality: 20,
          notes: 'إنتاج بيض ممتاز',
          createdAt: '2023-09-01',
          updatedAt: '2024-01-25',
        },
      ];

      const mockAlerts: PoultryAlert[] = [
        {
          id: '1',
          farmId: '1',
          batchId: '1',
          alertType: 'vaccination',
          title: 'موعد التطعيم',
          description: 'حان موعد تطعيم الدفعة B-2024-001 ضد النيوكاسل',
          priority: 'high',
          scheduledDate: '2024-01-26',
          isCompleted: false,
          isRead: false,
          createdAt: '2024-01-25',
        },
        {
          id: '2',
          farmId: '1',
          alertType: 'feed_low',
          title: 'نقص في العلف',
          description: 'مستوى العلف منخفض في المزرعة، يحتاج إعادة تموين',
          priority: 'medium',
          isCompleted: false,
          isRead: false,
          createdAt: '2024-01-25',
        },
      ];

      const mockStats: DashboardStats = {
        totalFarms: mockFarms.length,
        totalBirds: mockFarms.reduce((sum, farm) => sum + farm.currentCount, 0),
        activeBatches: mockBatches.filter(b => b.status === 'active').length,
        monthlyProfit: 125000,
        mortalityRate: 2.5,
        feedEfficiency: 1.8,
        pendingAlerts: mockAlerts.filter(a => !a.isCompleted).length,
        todayEggs: 3200,
      };

      setFarms(mockFarms);
      setRecentBatches(mockBatches);
      setAlerts(mockAlerts);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading poultry data:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل البيانات');
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateFarm = () => {
    router.push('/create-poultry-farm');
  };

  const handleFarmPress = (farm: PoultryFarm) => {
    Alert.alert('تفاصيل المزرعة', `مزرعة: ${farm.name}`);
  };

  const handleBatchPress = (batch: PoultryBatch) => {
    Alert.alert('تفاصيل الدفعة', `دفعة: ${batch.batchNumber}`);
  };

  const handleQuickAction = (action: string) => {
    const routes: { [key: string]: string } = {
      daily_monitoring: '/daily-monitoring',
      feed_management: '/feed-management',
      health_records: '/health-records',
      financial_reports: '/financial-reports',
      alerts: '/alerts',
      analytics: '/analytics',
    };
    
    if (routes[action]) {
      router.push(routes[action]);
    } else {
      const actionNames: { [key: string]: string } = {
        daily_monitoring: 'المراقبة اليومية',
        feed_management: 'إدارة العلف',
        health_records: 'السجلات الصحية',
        financial_reports: 'التقارير المالية',
        alerts: 'التنبيهات',
        analytics: 'التحليلات',
      };
      Alert.alert('قريباً', `${actionNames[action]} ستكون متاحة قريباً`);
    }
  };

  const renderStatsCard = (title: string, value: string, icon: React.ReactNode, color: string) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsCardHeader}>
        <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <Text style={styles.statsValue}>{value}</Text>
      </View>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );

  const renderQuickAction = (title: string, icon: React.ReactNode, action: string, color: string) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={() => handleQuickAction(action)}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const renderFarmCard = (farm: PoultryFarm) => (
    <TouchableOpacity
      key={farm.id}
      style={styles.farmCard}
      onPress={() => handleFarmPress(farm)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: farm.images?.[0] }} style={styles.farmImage} />
      <View style={styles.farmInfo}>
        <View style={styles.farmHeader}>
          <Text style={styles.farmName}>{farm.name}</Text>
          <View style={[styles.farmTypeBadge, { backgroundColor: getFarmTypeColor(farm.farmType) }]}>
            <Text style={styles.farmTypeBadgeText}>{getFarmTypeLabel(farm.farmType)}</Text>
          </View>
        </View>
        <View style={styles.farmLocation}>
          <MapPin size={14} color={COLORS.darkGray} />
          <Text style={styles.farmLocationText}>{farm.location}</Text>
        </View>
        <View style={styles.farmStats}>
          <View style={styles.farmStat}>
            <Users size={16} color={COLORS.primary} />
            <Text style={styles.farmStatText}>{farm.currentCount.toLocaleString()}</Text>
          </View>
          <View style={styles.farmStat}>
            <Package size={16} color={COLORS.success} />
            <Text style={styles.farmStatText}>{Math.round((farm.currentCount / farm.capacity) * 100)}%</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBatchCard = (batch: PoultryBatch) => (
    <TouchableOpacity
      key={batch.id}
      style={styles.batchCard}
      onPress={() => handleBatchPress(batch)}
      activeOpacity={0.8}
    >
      <View style={styles.batchHeader}>
        <Text style={styles.batchNumber}>{batch.batchNumber}</Text>
        <View style={[styles.batchStatus, { backgroundColor: getBatchStatusColor(batch.status) }]}>
          <Text style={styles.batchStatusText}>{getBatchStatusLabel(batch.status)}</Text>
        </View>
      </View>
      <Text style={styles.batchBreed}>{batch.breed} - {batch.birdType}</Text>
      <View style={styles.batchStats}>
        <View style={styles.batchStat}>
          <Text style={styles.batchStatLabel}>العدد الحالي</Text>
          <Text style={styles.batchStatValue}>{batch.currentCount.toLocaleString()}</Text>
        </View>
        <View style={styles.batchStat}>
          <Text style={styles.batchStatLabel}>العمر (يوم)</Text>
          <Text style={styles.batchStatValue}>{batch.ageInDays}</Text>
        </View>
        <View style={styles.batchStat}>
          <Text style={styles.batchStatLabel}>الوزن (جم)</Text>
          <Text style={styles.batchStatValue}>{batch.averageWeight || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAlertCard = (alert: PoultryAlert) => (
    <View key={alert.id} style={[styles.alertCard, { borderLeftColor: getAlertPriorityColor(alert.priority) }]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertIcon}>
          {getAlertIcon(alert.alertType)}
        </View>
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>{alert.title}</Text>
          <Text style={styles.alertDescription}>{alert.description}</Text>
        </View>
        <View style={[styles.alertPriority, { backgroundColor: getAlertPriorityColor(alert.priority) }]}>
          <Text style={styles.alertPriorityText}>{getAlertPriorityLabel(alert.priority)}</Text>
        </View>
      </View>
      {alert.scheduledDate && (
        <View style={styles.alertDate}>
          <Calendar size={14} color={COLORS.darkGray} />
          <Text style={styles.alertDateText}>{new Date(alert.scheduledDate).toLocaleDateString('ar-SA')}</Text>
        </View>
      )}
    </View>
  );

  const getFarmTypeColor = (type: string) => {
    switch (type) {
      case 'broiler': return COLORS.primary;
      case 'layer': return COLORS.warning;
      case 'mixed': return COLORS.success;
      default: return COLORS.darkGray;
    }
  };

  const getFarmTypeLabel = (type: string) => {
    switch (type) {
      case 'broiler': return 'لحم';
      case 'layer': return 'بيض';
      case 'mixed': return 'مختلط';
      default: return type;
    }
  };

  const getBatchStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.success + '20';
      case 'harvested': return COLORS.warning + '20';
      case 'sold': return COLORS.primary + '20';
      case 'lost': return COLORS.error + '20';
      default: return COLORS.darkGray + '20';
    }
  };

  const getBatchStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'harvested': return 'محصود';
      case 'sold': return 'مباع';
      case 'lost': return 'مفقود';
      default: return status;
    }
  };

  const getAlertPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return COLORS.error;
      case 'high': return COLORS.warning;
      case 'medium': return COLORS.primary;
      case 'low': return COLORS.success;
      default: return COLORS.darkGray;
    }
  };

  const getAlertPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'حرج';
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return priority;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'vaccination': return <Heart size={20} color={COLORS.primary} />;
      case 'medication': return <Zap size={20} color={COLORS.warning} />;
      case 'harvest': return <Package size={20} color={COLORS.success} />;
      case 'monitoring': return <Activity size={20} color={COLORS.info} />;
      case 'feed_low': return <AlertTriangle size={20} color={COLORS.error} />;
      case 'high_mortality': return <AlertTriangle size={20} color={COLORS.error} />;
      default: return <Bell size={20} color={COLORS.darkGray} />;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>مرحباً، {user?.name}</Text>
          <Text style={styles.headerTitle}>إدارة الدواجن</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => Alert.alert('قريباً', 'الإعدادات ستكون متاحة قريباً')}>
          <Settings size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>نظرة عامة</Text>
        <View style={styles.statsGrid}>
          {renderStatsCard('إجمالي المزارع', stats.totalFarms.toString(), <MapPin size={20} color={COLORS.primary} />, COLORS.primary)}
          {renderStatsCard('إجمالي الطيور', stats.totalBirds.toLocaleString(), <Users size={20} color={COLORS.success} />, COLORS.success)}
          {renderStatsCard('الدفعات النشطة', stats.activeBatches.toString(), <Package size={20} color={COLORS.warning} />, COLORS.warning)}
          {renderStatsCard('الربح الشهري', `${stats.monthlyProfit.toLocaleString()} ر.س`, <DollarSign size={20} color={COLORS.info} />, COLORS.info)}
        </View>
        <View style={styles.statsGrid}>
          {renderStatsCard('معدل النفوق', `${stats.mortalityRate}%`, <AlertTriangle size={20} color={COLORS.error} />, COLORS.error)}
          {renderStatsCard('كفاءة العلف', stats.feedEfficiency.toString(), <BarChart3 size={20} color={COLORS.purple} />, COLORS.purple)}
          {renderStatsCard('التنبيهات المعلقة', stats.pendingAlerts.toString(), <Bell size={20} color={COLORS.orange} />, COLORS.orange)}
          {renderStatsCard('بيض اليوم', stats.todayEggs.toLocaleString(), <Egg size={20} color={COLORS.yellow} />, COLORS.yellow)}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
        <View style={styles.quickActionsGrid}>
          {renderQuickAction('المراقبة اليومية', <Activity size={24} color={COLORS.primary} />, 'daily_monitoring', COLORS.primary)}
          {renderQuickAction('إدارة العلف', <Package size={24} color={COLORS.success} />, 'feed_management', COLORS.success)}
          {renderQuickAction('السجلات الصحية', <Heart size={24} color={COLORS.error} />, 'health_records', COLORS.error)}
          {renderQuickAction('التقارير المالية', <DollarSign size={24} color={COLORS.info} />, 'financial_reports', COLORS.info)}
          {renderQuickAction('التنبيهات', <Bell size={24} color={COLORS.warning} />, 'alerts', COLORS.warning)}
          {renderQuickAction('التحليلات', <BarChart3 size={24} color={COLORS.purple} />, 'analytics', COLORS.purple)}
        </View>
      </View>

      {/* My Farms */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>مزارعي</Text>
          <Button
            title="إضافة مزرعة"
            onPress={handleCreateFarm}
            type="primary"
            size="small"
            icon={<Plus size={16} color={COLORS.white} />}
          />
        </View>
        {farms.length > 0 ? (
          <View style={styles.farmsContainer}>
            {farms.map(renderFarmCard)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Egg size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyStateText}>لا توجد مزارع مسجلة</Text>
            <Text style={styles.emptyStateSubtext}>ابدأ بإضافة مزرعتك الأولى</Text>
          </View>
        )}
      </View>

      {/* Recent Batches */}
      {recentBatches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الدفعات الحديثة</Text>
            <TouchableOpacity onPress={() => Alert.alert('قريباً', 'عرض جميع الدفعات سيكون متاحاً قريباً')}>
              <Text style={styles.viewAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.batchesContainer}>
            {recentBatches.slice(0, 3).map(renderBatchCard)}
          </View>
        </View>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>التنبيهات المهمة</Text>
            <TouchableOpacity onPress={() => handleQuickAction('alerts')}>
              <Text style={styles.viewAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.alertsContainer}>
            {alerts.slice(0, 3).map(renderAlertCard)}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '10',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsCardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  statsTitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  quickActionsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 3,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    color: COLORS.black,
    textAlign: 'center',
    fontWeight: '600',
  },
  farmsContainer: {
    gap: 16,
  },
  farmCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  farmImage: {
    width: '100%',
    height: 120,
  },
  farmInfo: {
    padding: 16,
  },
  farmHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  farmName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  farmTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  farmTypeBadgeText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  farmLocation: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  farmLocationText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 4,
    textAlign: 'right',
  },
  farmStats: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  farmStat: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  farmStatText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '600',
    marginRight: 4,
  },
  batchesContainer: {
    gap: 12,
  },
  batchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  batchHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  batchNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  batchStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  batchStatusText: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: '600',
  },
  batchBreed: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
    textAlign: 'right',
  },
  batchStats: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  batchStat: {
    alignItems: 'center',
  },
  batchStatLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  batchStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginTop: 2,
  },
  alertsContainer: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertIcon: {
    marginLeft: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  alertPriority: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  alertPriorityText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  alertDate: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 8,
  },
  alertDateText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
    marginTop: 4,
  },
});