import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { formatPrice } from "../constants/currency";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { Cat, Dog, Bird, Fish, Egg, TrendingUp, TrendingDown, Package, ShoppingCart, Users, Eye, Star, Filter, Download } from 'lucide-react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';

type AnimalType = 'cat' | 'dog' | 'bird' | 'fish' | 'poultry';
type TimePeriod = '7d' | '30d' | '90d' | '1y';



const getAnimalInfo = (category: AnimalType) => {
  const animalMap = {
    cat: { label: 'قطط', icon: <Cat size={24} color={COLORS.primary} />, color: '#FF6B6B' },
    dog: { label: 'كلاب', icon: <Dog size={24} color={COLORS.primary} />, color: '#4ECDC4' },
    bird: { label: 'طيور', icon: <Bird size={24} color={COLORS.primary} />, color: '#45B7D1' },
    fish: { label: 'أسماك', icon: <Fish size={24} color={COLORS.primary} />, color: '#96CEB4' },
    poultry: { label: 'دواجن', icon: <Egg size={24} color={COLORS.primary} />, color: '#FFA726' },
  };
  return animalMap[category];
};

// Mock analytics data
const mockAnalytics = {
  '7d': {
    totalSales: 12500,
    totalOrders: 45,
    totalViews: 1250,
    totalProducts: 28,
    averageOrderValue: 278,
    conversionRate: 3.6,
    topProducts: [
      { name: 'طعام قطط ممتاز', sales: 3200, orders: 12 },
      { name: 'لعبة تفاعلية', sales: 1800, orders: 8 },
      { name: 'رمل قطط طبيعي', sales: 1500, orders: 6 },
    ],
    salesTrend: [1200, 1800, 2100, 1900, 2300, 1700, 1400],
    ordersTrend: [5, 8, 9, 7, 10, 6, 4],
  },
  '30d': {
    totalSales: 45800,
    totalOrders: 165,
    totalViews: 4800,
    totalProducts: 28,
    averageOrderValue: 278,
    conversionRate: 3.4,
    topProducts: [
      { name: 'طعام قطط ممتاز', sales: 12800, orders: 48 },
      { name: 'لعبة تفاعلية', sales: 7200, orders: 32 },
      { name: 'رمل قطط طبيعي', sales: 6000, orders: 24 },
    ],
    salesTrend: [1200, 1800, 2100, 1900, 2300, 1700, 1400, 1600, 1900, 2200, 1800, 2100, 1500, 1700, 1900, 2000, 1800, 2200, 1600, 1900, 2100, 1700, 1800, 2000, 1900, 2100, 1600, 1800, 2000, 1900],
    ordersTrend: [5, 8, 9, 7, 10, 6, 4, 6, 8, 9, 7, 8, 5, 6, 8, 9, 7, 9, 6, 8, 9, 6, 7, 8, 8, 9, 6, 7, 8, 8],
  },
  '90d': {
    totalSales: 125600,
    totalOrders: 452,
    totalViews: 12800,
    totalProducts: 28,
    averageOrderValue: 278,
    conversionRate: 3.5,
    topProducts: [
      { name: 'طعام قطط ممتاز', sales: 35200, orders: 132 },
      { name: 'لعبة تفاعلية', sales: 19800, orders: 88 },
      { name: 'رمل قطط طبيعي', sales: 16500, orders: 66 },
    ],
    salesTrend: Array.from({ length: 90 }, (_, i) => 1200 + Math.random() * 1000),
    ordersTrend: Array.from({ length: 90 }, (_, i) => 4 + Math.random() * 6),
  },
  '1y': {
    totalSales: 485200,
    totalOrders: 1745,
    totalViews: 48500,
    totalProducts: 28,
    averageOrderValue: 278,
    conversionRate: 3.6,
    topProducts: [
      { name: 'طعام قطط ممتاز', sales: 135800, orders: 508 },
      { name: 'لعبة تفاعلية', sales: 76400, orders: 340 },
      { name: 'رمل قطط طبيعي', sales: 63600, orders: 254 },
    ],
    salesTrend: Array.from({ length: 12 }, (_, i) => 35000 + Math.random() * 15000),
    ordersTrend: Array.from({ length: 12 }, (_, i) => 120 + Math.random() * 60),
  },
};

export default function PetCategoryAnalyticsScreen() {
  const { t } = useI18n();
  const { isSuperAdmin, isModerator, moderatorPermissions } = useApp();
  const { category } = useLocalSearchParams<{ category: AnimalType }>();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d');
  
  if (!category) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>فئة غير صحيحة</Text>
      </View>
    );
  }

  const animalInfo = getAnimalInfo(category);
  const analytics = mockAnalytics[selectedPeriod];
  
  // Check if user has store management permissions
  const hasStorePermission = () => {
    if (isSuperAdmin) return true;
    if (!isModerator || !moderatorPermissions) return false;
    
    const storePerms = moderatorPermissions.storeManagement;
    if (!storePerms) return false;
    
    return storePerms.petOwnerStores;
  };

  if (!hasStorePermission()) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>ليس لديك صلاحية للوصول إلى هذه الصفحة</Text>
      </View>
    );
  }

  const getPeriodLabel = (period: TimePeriod) => {
    const labels = {
      '7d': 'آخر 7 أيام',
      '30d': 'آخر 30 يوم',
      '90d': 'آخر 3 شهور',
      '1y': 'آخر سنة',
    };
    return labels[period];
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Mock previous period data for growth calculation
  const previousPeriodSales = analytics.totalSales * 0.85;
  const previousPeriodOrders = analytics.totalOrders * 0.9;
  const previousPeriodViews = analytics.totalViews * 0.8;

  const salesGrowth = calculateGrowth(analytics.totalSales, previousPeriodSales);
  const ordersGrowth = calculateGrowth(analytics.totalOrders, previousPeriodOrders);
  const viewsGrowth = calculateGrowth(analytics.totalViews, previousPeriodViews);

  const renderMetricCard = (title: string, value: string, growth: number, icon: React.ReactNode) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={styles.metricIcon}>
          {icon}
        </View>
        <View style={styles.metricGrowth}>
          {growth > 0 ? (
            <TrendingUp size={16} color={COLORS.green} />
          ) : (
            <TrendingDown size={16} color={COLORS.red} />
          )}
          <Text style={[styles.growthText, { color: growth > 0 ? COLORS.green : COLORS.red }]}>
            {Math.abs(growth).toFixed(1)}%
          </Text>
        </View>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
  );

  const renderTopProduct = (product: any, index: number) => (
    <View key={index} style={styles.topProductItem}>
      <View style={styles.productRank}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productStats}>
          {formatPrice(product.sales)} • {product.orders} طلب
        </Text>
      </View>
      <View style={styles.productPercentage}>
        <Text style={styles.percentageText}>
          {((product.sales / analytics.totalSales) * 100).toFixed(1)}%
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: `تحليلات ${animalInfo.label}`,
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.primary,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            <TouchableOpacity style={styles.exportButton}>
              <Download size={20} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            {animalInfo.icon}
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>تحليلات فئة {animalInfo.label}</Text>
              <Text style={styles.headerSubtitle}>إحصائيات ومؤشرات الأداء</Text>
            </View>
          </View>
        </View>

        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          {(['7d', '30d', '90d', '1y'] as TimePeriod[]).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.selectedPeriodButton
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.selectedPeriodButtonText
              ]}>
                {getPeriodLabel(period)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsRow}>
            {renderMetricCard(
              'إجمالي المبيعات',
              formatPrice(analytics.totalSales),
              salesGrowth,
              <TrendingUp size={20} color={COLORS.primary} />
            )}
            {renderMetricCard(
              'عدد الطلبات',
              analytics.totalOrders.toString(),
              ordersGrowth,
              <ShoppingCart size={20} color={COLORS.primary} />
            )}
          </View>
          <View style={styles.metricsRow}>
            {renderMetricCard(
              'المشاهدات',
              analytics.totalViews.toLocaleString(),
              viewsGrowth,
              <Eye size={20} color={COLORS.primary} />
            )}
            {renderMetricCard(
              'متوسط قيمة الطلب',
              formatPrice(analytics.averageOrderValue),
              2.1,
              <Package size={20} color={COLORS.primary} />
            )}
          </View>
        </View>

        {/* Additional Metrics */}
        <View style={styles.additionalMetrics}>
          <View style={styles.additionalMetricItem}>
            <Text style={styles.additionalMetricLabel}>معدل التحويل</Text>
            <Text style={styles.additionalMetricValue}>{analytics.conversionRate}%</Text>
          </View>
          <View style={styles.additionalMetricItem}>
            <Text style={styles.additionalMetricLabel}>عدد المنتجات</Text>
            <Text style={styles.additionalMetricValue}>{analytics.totalProducts}</Text>
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أفضل المنتجات مبيعاً</Text>
          <View style={styles.topProductsList}>
            {analytics.topProducts.map((product, index) => renderTopProduct(product, index))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push(`/pet-category-products?category=${category}`)}
            >
              <Package size={20} color={COLORS.primary} />
              <Text style={styles.quickActionText}>إدارة المنتجات</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push(`/pet-category-settings?category=${category}`)}
            >
              <Filter size={20} color={COLORS.primary} />
              <Text style={styles.quickActionText}>إعدادات الفئة</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>رؤى الأداء</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={styles.insightIcon}>
                <TrendingUp size={16} color={COLORS.green} />
              </View>
              <Text style={styles.insightText}>
                نمو المبيعات بنسبة {salesGrowth.toFixed(1)}% مقارنة بالفترة السابقة
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightIcon}>
                <Star size={16} color={COLORS.yellow} />
              </View>
              <Text style={styles.insightText}>
                أفضل منتج: {analytics.topProducts[0].name} بمبيعات {formatPrice(analytics.topProducts[0].sales)}
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightIcon}>
                <Users size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.insightText}>
                معدل التحويل {analytics.conversionRate}% من إجمالي المشاهدات
              </Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  exportButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  metricsContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  growthText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  additionalMetrics: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
  },
  additionalMetricItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  additionalMetricLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  additionalMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  topProductsList: {
    marginTop: 8,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
  },
  productStats: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  productPercentage: {
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  insightsList: {
    marginTop: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  insightIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.red,
    textAlign: 'center',
    marginTop: 50,
  },
});