import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import {
  ArrowRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Package,
  AlertTriangle,
  Target,
  Activity,
  Zap,
} from 'lucide-react-native';
import { PoultryFinancial, ProductionCycle } from "../types";

const { width } = Dimensions.get('window');

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  feedCosts: number;
  medicationCosts: number;
  laborCosts: number;
  utilityCosts: number;
  averageFCR: number;
  mortalityRate: number;
}

export default function FinancialReportsScreen() {
  const { t } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [financialData, setFinancialData] = useState<PoultryFinancial[]>([]);
  const [cycles, setCycles] = useState<ProductionCycle[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    feedCosts: 0,
    medicationCosts: 0,
    laborCosts: 0,
    utilityCosts: 0,
    averageFCR: 0,
    mortalityRate: 0,
  });

  const periods = [
    { id: 'week', title: 'أسبوعي' },
    { id: 'month', title: 'شهري' },
    { id: 'quarter', title: 'ربع سنوي' },
    { id: 'year', title: 'سنوي' },
  ];

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = async () => {
    try {
      // Mock data - في التطبيق الحقيقي سيتم جلب البيانات من API
      const mockFinancials: PoultryFinancial[] = [
        {
          id: '1',
          farmId: '1',
          batchId: '1',
          transactionType: 'expense',
          category: 'feed',
          description: 'علف بادئ - 1000 كجم',
          amount: 15000,
          quantity: 1000,
          unitPrice: 15,
          supplier: 'شركة الأعلاف المتقدمة',
          paymentMethod: 'bank_transfer',
          transactionDate: '2024-01-15',
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          farmId: '1',
          batchId: '1',
          transactionType: 'expense',
          category: 'chicks',
          description: 'كتاكيت روس 308 - 2000 كتكوت',
          amount: 8000,
          quantity: 2000,
          unitPrice: 4,
          supplier: 'مفقس الخليج',
          paymentMethod: 'cash',
          transactionDate: '2024-01-01',
          createdAt: '2024-01-01',
        },
        {
          id: '3',
          farmId: '1',
          batchId: '1',
          transactionType: 'income',
          category: 'sales',
          description: 'بيع دجاج - 1800 طائر',
          amount: 180000,
          quantity: 1800,
          unitPrice: 100,
          transactionDate: '2024-02-15',
          createdAt: '2024-02-15',
        },
      ];

      const mockCycles: ProductionCycle[] = [
        {
          id: '1',
          farmId: '1',
          cycleName: 'دورة يناير 2024',
          startDate: '2024-01-01',
          endDate: '2024-02-15',
          totalBirds: 2000,
          totalMortality: 50,
          totalFeedConsumed: 3600,
          totalFeedCost: 54000,
          totalMedicationCost: 5000,
          totalRevenue: 180000,
          netProfit: 121000,
          profitMargin: 67.2,
          averageFCR: 1.8,
          averageWeight: 2200,
          status: 'completed',
          createdAt: '2024-01-01',
          updatedAt: '2024-02-15',
        },
      ];

      const mockSummary: FinancialSummary = {
        totalRevenue: 180000,
        totalExpenses: 59000,
        netProfit: 121000,
        profitMargin: 67.2,
        feedCosts: 54000,
        medicationCosts: 5000,
        laborCosts: 0,
        utilityCosts: 0,
        averageFCR: 1.8,
        mortalityRate: 2.5,
      };

      setFinancialData(mockFinancials);
      setCycles(mockCycles);
      setSummary(mockSummary);
    } catch (error) {
      console.error('Error loading financial data:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل البيانات المالية');
    }
  };

  const renderPeriodButton = (period: typeof periods[0]) => (
    <TouchableOpacity
      key={period.id}
      style={[
        styles.periodButton,
        selectedPeriod === period.id && styles.selectedPeriodButton,
      ]}
      onPress={() => setSelectedPeriod(period.id as 'week' | 'month' | 'quarter' | 'year')}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.periodButtonText,
          selectedPeriod === period.id && styles.selectedPeriodButtonText,
        ]}
      >
        {period.title}
      </Text>
    </TouchableOpacity>
  );

  const renderSummaryCard = (title: string, value: string, icon: React.ReactNode, color: string, trend?: 'up' | 'down') => (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <View style={styles.summaryHeader}>
        <View style={[styles.summaryIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryValue}>{value}</Text>
          <Text style={styles.summaryTitle}>{title}</Text>
        </View>
        {trend && (
          <View style={styles.trendIndicator}>
            {trend === 'up' ? (
              <TrendingUp size={16} color={COLORS.success} />
            ) : (
              <TrendingDown size={16} color={COLORS.error} />
            )}
          </View>
        )}
      </View>
    </View>
  );

  const renderExpenseBreakdown = () => {
    const expenses = [
      { category: 'العلف', amount: summary.feedCosts, color: COLORS.primary, percentage: 91.5 },
      { category: 'الأدوية', amount: summary.medicationCosts, color: COLORS.warning, percentage: 8.5 },
      { category: 'العمالة', amount: summary.laborCosts, color: COLORS.info, percentage: 0 },
      { category: 'المرافق', amount: summary.utilityCosts, color: COLORS.purple, percentage: 0 },
    ];

    return (
      <View style={styles.expenseBreakdown}>
        <Text style={styles.breakdownTitle}>تفصيل المصروفات</Text>
        {expenses.map((expense, index) => (
          <View key={index} style={styles.expenseItem}>
            <View style={styles.expenseInfo}>
              <View style={[styles.expenseColor, { backgroundColor: expense.color }]} />
              <Text style={styles.expenseCategory}>{expense.category}</Text>
            </View>
            <View style={styles.expenseAmounts}>
              <Text style={styles.expenseAmount}>{expense.amount.toLocaleString()} ر.س</Text>
              <Text style={styles.expensePercentage}>{expense.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderCycleCard = (cycle: ProductionCycle) => (
    <View key={cycle.id} style={styles.cycleCard}>
      <View style={styles.cycleHeader}>
        <Text style={styles.cycleName}>{cycle.cycleName}</Text>
        <View style={[styles.cycleStatus, { backgroundColor: cycle.status === 'completed' ? COLORS.success + '20' : COLORS.warning + '20' }]}>
          <Text style={[styles.cycleStatusText, { color: cycle.status === 'completed' ? COLORS.success : COLORS.warning }]}>
            {cycle.status === 'completed' ? 'مكتملة' : 'نشطة'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cycleStats}>
        <View style={styles.cycleStat}>
          <Text style={styles.cycleStatLabel}>إجمالي الطيور</Text>
          <Text style={styles.cycleStatValue}>{cycle.totalBirds.toLocaleString()}</Text>
        </View>
        <View style={styles.cycleStat}>
          <Text style={styles.cycleStatLabel}>صافي الربح</Text>
          <Text style={[styles.cycleStatValue, { color: cycle.netProfit > 0 ? COLORS.success : COLORS.error }]}>
            {cycle.netProfit.toLocaleString()} ر.س
          </Text>
        </View>
        <View style={styles.cycleStat}>
          <Text style={styles.cycleStatLabel}>هامش الربح</Text>
          <Text style={styles.cycleStatValue}>{cycle.profitMargin.toFixed(1)}%</Text>
        </View>
        <View style={styles.cycleStat}>
          <Text style={styles.cycleStatLabel}>معدل التحويل</Text>
          <Text style={styles.cycleStatValue}>{cycle.averageFCR.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowRight size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>التقارير المالية</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الفترة الزمنية</Text>
          <View style={styles.periodsContainer}>
            {periods.map(renderPeriodButton)}
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الملخص المالي</Text>
          <View style={styles.summaryGrid}>
            {renderSummaryCard('إجمالي الإيرادات', `${summary.totalRevenue.toLocaleString()} ر.س`, <DollarSign size={20} color={COLORS.success} />, COLORS.success, 'up')}
            {renderSummaryCard('إجمالي المصروفات', `${summary.totalExpenses.toLocaleString()} ر.س`, <TrendingDown size={20} color={COLORS.error} />, COLORS.error)}
            {renderSummaryCard('صافي الربح', `${summary.netProfit.toLocaleString()} ر.س`, <Target size={20} color={COLORS.primary} />, COLORS.primary, 'up')}
            {renderSummaryCard('هامش الربح', `${summary.profitMargin.toFixed(1)}%`, <BarChart3 size={20} color={COLORS.info} />, COLORS.info)}
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مؤشرات الأداء</Text>
          <View style={styles.summaryGrid}>
            {renderSummaryCard('معدل التحويل', summary.averageFCR.toFixed(2), <Activity size={20} color={COLORS.purple} />, COLORS.purple)}
            {renderSummaryCard('معدل النفوق', `${summary.mortalityRate}%`, <AlertTriangle size={20} color={COLORS.warning} />, COLORS.warning)}
            {renderSummaryCard('تكلفة العلف', `${summary.feedCosts.toLocaleString()} ر.س`, <Package size={20} color={COLORS.orange} />, COLORS.orange)}
            {renderSummaryCard('تكلفة الأدوية', `${summary.medicationCosts.toLocaleString()} ر.س`, <Zap size={20} color={COLORS.yellow} />, COLORS.yellow)}
          </View>
        </View>

        {/* Expense Breakdown */}
        <View style={styles.section}>
          {renderExpenseBreakdown()}
        </View>

        {/* Production Cycles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دورات الإنتاج</Text>
          <View style={styles.cyclesContainer}>
            {cycles.map(renderCycleCard)}
          </View>
        </View>

        {/* Key Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>رؤى مهمة</Text>
          <View style={styles.insightsContainer}>
            <View style={styles.insightCard}>
              <View style={styles.insightIcon}>
                <TrendingUp size={24} color={COLORS.success} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>أداء ممتاز</Text>
                <Text style={styles.insightDescription}>
                  معدل التحويل الغذائي أقل من المتوسط بـ 15%، مما يعني كفاءة عالية في استخدام العلف
                </Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={styles.insightIcon}>
                <Target size={24} color={COLORS.primary} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>هامش ربح مرتفع</Text>
                <Text style={styles.insightDescription}>
                  هامش الربح 67% أعلى من متوسط الصناعة، مما يدل على إدارة مالية ممتازة
                </Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={styles.insightIcon}>
                <AlertTriangle size={24} color={COLORS.warning} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>توصية</Text>
                <Text style={styles.insightDescription}>
                  يمكن تقليل تكلفة العلف بـ 8% عبر التفاوض مع موردين جدد أو شراء كميات أكبر
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
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
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  periodsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  selectedPeriodButtonText: {
    color: COLORS.white,
  },
  summaryGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: (width - 60) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContent: {
    flex: 1,
    marginRight: 12,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  summaryTitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginTop: 2,
  },
  trendIndicator: {
    marginLeft: 4,
  },
  expenseBreakdown: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  expenseItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  expenseInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  expenseColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  expenseCategory: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '600',
  },
  expenseAmounts: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  expensePercentage: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  cyclesContainer: {
    gap: 16,
  },
  cycleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cycleHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cycleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  cycleStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cycleStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cycleStats: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cycleStat: {
    width: '48%',
    marginBottom: 8,
  },
  cycleStatLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  cycleStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginTop: 2,
  },
  insightsContainer: {
    gap: 16,
  },
  insightCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row-reverse',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    lineHeight: 18,
  },
});