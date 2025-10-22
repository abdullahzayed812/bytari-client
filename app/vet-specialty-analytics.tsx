import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, Users, Eye, Calendar, Download, Filter, RefreshCw } from 'lucide-react-native';
import Button from "../components/Button";

type VetSpecialty = 'small_animals' | 'large_animals' | 'birds' | 'fish' | 'poultry' | 'equipment';

const getSpecialtyInfo = (specialty: VetSpecialty) => {
  const specialties = {
    small_animals: { name: 'قطط وكلاب', color: '#FF6B6B' },
    large_animals: { name: 'الحيوانات الصغيرة والكبيرة', color: '#4ECDC4' },
    birds: { name: 'الطيور', color: '#45B7D1' },
    fish: { name: 'الأسماك', color: '#96CEB4' },
    poultry: { name: 'الدواجن', color: '#FFA726' },
    equipment: { name: 'أجهزة ومعدات بيطرية', color: '#9C27B0' },
  };
  return specialties[specialty] || { name: 'غير محدد', color: COLORS.gray };
};

const { width } = Dimensions.get('window');

export default function VetSpecialtyAnalyticsScreen() {
  const { t, isRTL } = useI18n();
  const { userMode, isSuperAdmin, isModerator } = useApp();
  const { specialty } = useLocalSearchParams<{ specialty: VetSpecialty }>();
  
  const specialtyInfo = getSpecialtyInfo(specialty!);
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  // Mock analytics data
  const analyticsData = {
    totalRevenue: 45680,
    totalOrders: 234,
    totalProducts: 45,
    totalViews: 12450,
    revenueGrowth: 12.5,
    ordersGrowth: -3.2,
    productsGrowth: 8.7,
    viewsGrowth: 15.3,
    topProducts: [
      { name: 'دواء مضاد حيوي للقطط', sales: 89, revenue: 4450 },
      { name: 'فيتامينات للكلاب', sales: 67, revenue: 3350 },
      { name: 'مكمل غذائي للطيور', sales: 45, revenue: 2250 },
    ],
    salesByDay: [
      { day: 'الأحد', sales: 1200 },
      { day: 'الاثنين', sales: 1800 },
      { day: 'الثلاثاء', sales: 1500 },
      { day: 'الأربعاء', sales: 2200 },
      { day: 'الخميس', sales: 1900 },
      { day: 'الجمعة', sales: 2500 },
      { day: 'السبت', sales: 2100 },
    ]
  };
  
  const handleExportReport = () => {
    // Handle export functionality
    console.log('Exporting report for', specialty);
  };
  
  const handleRefreshData = () => {
    // Handle refresh functionality
    console.log('Refreshing data for', specialty);
  };
  
  const renderStatCard = (title: string, value: string, growth: number, icon: React.ReactNode) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: `${specialtyInfo.color}20` }]}>
          {icon}
        </View>
        <View style={[styles.growthIndicator, { backgroundColor: growth >= 0 ? '#10B981' : '#EF4444' }]}>
          {growth >= 0 ? <TrendingUp size={12} color={COLORS.white} /> : <TrendingDown size={12} color={COLORS.white} />}
          <Text style={styles.growthText}>{Math.abs(growth)}%</Text>
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
  
  const renderTopProduct = (product: any, index: number) => (
    <View key={index} style={styles.topProductItem}>
      <View style={styles.productRank}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productStats}>{product.sales} مبيعة • {product.revenue} ريال</Text>
      </View>
    </View>
  );
  
  const renderSalesChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>المبيعات اليومية</Text>
      <View style={styles.chart}>
        {analyticsData.salesByDay.map((item, index) => {
          const maxSales = Math.max(...analyticsData.salesByDay.map(d => d.sales));
          const height = (item.sales / maxSales) * 120;
          
          return (
            <View key={index} style={styles.chartBar}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height, 
                    backgroundColor: specialtyInfo.color,
                    opacity: 0.8 
                  }
                ]} 
              />
              <Text style={styles.barLabel}>{item.day.slice(0, 3)}</Text>
              <Text style={styles.barValue}>{item.sales}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: `تقارير ${specialtyInfo.name}`,
          headerStyle: { backgroundColor: specialtyInfo.color },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: specialtyInfo.color }]}>
          <BarChart3 size={32} color={COLORS.white} />
          <Text style={styles.headerTitle}>تقارير وإحصائيات {specialtyInfo.name}</Text>
          <Text style={styles.headerSubtitle}>تحليل شامل لأداء القسم والمبيعات</Text>
        </View>
        
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {[
            { key: 'week', label: 'أسبوع' },
            { key: 'month', label: 'شهر' },
            { key: 'quarter', label: '3 أشهر' },
            { key: 'year', label: 'سنة' }
          ].map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && [styles.selectedPeriodButton, { backgroundColor: specialtyInfo.color }]
              ]}
              onPress={() => setSelectedPeriod(period.key as any)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.selectedPeriodButtonText
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {renderStatCard(
            'إجمالي الإيرادات',
            `${analyticsData.totalRevenue.toLocaleString()} ريال`,
            analyticsData.revenueGrowth,
            <DollarSign size={20} color={specialtyInfo.color} />
          )}
          
          {renderStatCard(
            'إجمالي الطلبات',
            analyticsData.totalOrders.toString(),
            analyticsData.ordersGrowth,
            <Package size={20} color={specialtyInfo.color} />
          )}
          
          {renderStatCard(
            'عدد المنتجات',
            analyticsData.totalProducts.toString(),
            analyticsData.productsGrowth,
            <Package size={20} color={specialtyInfo.color} />
          )}
          
          {renderStatCard(
            'إجمالي المشاهدات',
            analyticsData.totalViews.toLocaleString(),
            analyticsData.viewsGrowth,
            <Eye size={20} color={specialtyInfo.color} />
          )}
        </View>
        
        {/* Sales Chart */}
        {renderSalesChart()}
        
        {/* Top Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>أفضل المنتجات مبيعاً</Text>
            <TouchableOpacity onPress={() => router.push(`/vet-specialty-products?specialty=${specialty}`)}>
              <Text style={[styles.seeAllText, { color: specialtyInfo.color }]}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.topProductsList}>
            {analyticsData.topProducts.map((product, index) => renderTopProduct(product, index))}
          </View>
        </View>
        
        {/* Performance Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>رؤى الأداء</Text>
          
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={[styles.insightIcon, { backgroundColor: '#10B981' }]}>
                <TrendingUp size={16} color={COLORS.white} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>نمو في المبيعات</Text>
                <Text style={styles.insightDescription}>زيادة 12.5% في الإيرادات مقارنة بالشهر الماضي</Text>
              </View>
            </View>
            
            <View style={styles.insightItem}>
              <View style={[styles.insightIcon, { backgroundColor: '#F59E0B' }]}>
                <Eye size={16} color={COLORS.white} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>زيادة في المشاهدات</Text>
                <Text style={styles.insightDescription}>نمو 15.3% في عدد مشاهدات المنتجات</Text>
              </View>
            </View>
            
            <View style={styles.insightItem}>
              <View style={[styles.insightIcon, { backgroundColor: '#EF4444' }]}>
                <TrendingDown size={16} color={COLORS.white} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>انخفاض في الطلبات</Text>
                <Text style={styles.insightDescription}>انخفاض 3.2% في عدد الطلبات الجديدة</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="تصدير التقرير"
            onPress={handleExportReport}
            type="primary"
            icon={<Download size={20} color={COLORS.white} />}
            style={[styles.actionButton, { backgroundColor: specialtyInfo.color }]}
          />
          
          <Button
            title="تحديث البيانات"
            onPress={handleRefreshData}
            type="secondary"
            icon={<RefreshCw size={20} color={COLORS.primary} />}
            style={styles.actionButton}
          />
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push(`/vet-specialty-settings?specialty=${specialty}`)}
          >
            <Filter size={20} color={COLORS.primary} />
            <Text style={styles.quickActionText}>إعدادات القسم</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push(`/vet-specialty-products?specialty=${specialty}`)}
          >
            <Package size={20} color={COLORS.primary} />
            <Text style={styles.quickActionText}>إدارة المنتجات</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPeriodButton: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  selectedPeriodButtonText: {
    color: COLORS.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  growthText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  chartContainer: {
    backgroundColor: COLORS.white,
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  section: {
    backgroundColor: COLORS.white,
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  topProductsList: {
    gap: 12,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  productRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
  },
  productStats: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingTop: 0,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
});