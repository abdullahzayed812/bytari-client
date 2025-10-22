import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  ArrowRight,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  Download,
  Filter,
} from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { COLORS } from "../constants/colors";
import { useQuery } from '@tanstack/react-query';
import { trpc } from "../lib/trpc";

const { width } = Dimensions.get('window');

export default function UnionAnalyticsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const { data, isLoading, error } = useQuery(trpc.admin.stats.getUnionAnalytics.queryOptions());

  const statsData = [
    {
      id: '1',
      title: 'إجمالي الأعضاء',
      value: data?.totalMembers.value || '0',
      change: data?.totalMembers.change || '+0',
      changeType: data?.totalMembers.changeType || 'positive',
      icon: Users,
      color: '#10B981',
    },
    {
      id: '2',
      title: 'الأعضاء الجدد',
      value: data?.newMembers.value || '0',
      change: data?.newMembers.change || '+0',
      changeType: data?.newMembers.changeType || 'positive',
      icon: TrendingUp,
      color: '#0EA5E9',
    },
    {
      id: '3',
      title: 'الفعاليات',
      value: data?.events.value || '0',
      change: data?.events.change || '+0',
      changeType: data?.events.changeType || 'positive',
      icon: Calendar,
      color: '#F59E0B',
    },
    {
      id: '4',
      title: 'معدل النشاط',
      value: data?.activityRate.value || '0%',
      change: data?.activityRate.change || '+0%',
      changeType: data?.activityRate.changeType || 'positive',
      icon: BarChart3,
      color: '#EF4444',
    },
  ];

  const chartData = data?.chartData || [];
  const topEvents = data?.topEvents || [];
  const regionDistribution = data?.regionDistribution || [];

  const maxMembers = Math.max(...chartData.map(d => d.members));
  const maxEvents = Math.max(...chartData.map(d => d.events));

  const handleExportData = () => {
    // Handle export functionality
    console.log('Exporting analytics data...');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>التحليلات والإحصائيات</Text>
        <TouchableOpacity onPress={handleExportData} style={styles.exportButton}>
          <Download size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* فلاتر الفترة الزمنية */}
        <View style={styles.periodSelector}>
          {[
            { key: 'week', label: 'أسبوع' },
            { key: 'month', label: 'شهر' },
            { key: 'year', label: 'سنة' },
          ].map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key as any)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.periodButtonTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* الإحصائيات الرئيسية */}
        <View style={styles.statsGrid}>
          {statsData.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <View key={stat.id} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                  <IconComponent size={24} color={COLORS.white} />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                  <View style={styles.statChange}>
                    <Text style={[
                      styles.statChangeText,
                      { color: stat.changeType === 'positive' ? '#10B981' : '#EF4444' }
                    ]}>
                      {stat.change}
                    </Text>
                    <Text style={styles.statChangePeriod}>هذا الشهر</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* الرسم البياني */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <BarChart3 size={20} color={COLORS.primary} />
            <Text style={styles.chartTitle}>نمو الأعضاء والفعاليات</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={16} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartContainer}>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>الأعضاء</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#0EA5E9' }]} />
                <Text style={styles.legendText}>الفعاليات</Text>
              </View>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chart}>
                {chartData.map((data, index) => (
                  <View key={index} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: (data.members / maxMembers) * 120,
                            backgroundColor: '#10B981',
                          }
                        ]}
                      />
                      <View
                        style={[
                          styles.bar,
                          {
                            height: (data.events / maxEvents) * 120,
                            backgroundColor: '#0EA5E9',
                            marginLeft: 4,
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{data.month}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* تفاصيل إضافية */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>تفاصيل الأداء</Text>
          
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>أكثر الفعاليات نشاطاً</Text>
            <View style={styles.detailList}>
              {[
                { name: 'ورشة الطب البيطري الحديث', participants: 145 },
                { name: 'مؤتمر الصحة الحيوانية', participants: 120 },
                { name: 'دورة الجراحة المتقدمة', participants: 98 },
              ].map((event, index) => (
                <View key={index} style={styles.detailItem}>
                  <Text style={styles.detailItemName}>{event.name}</Text>
                  <Text style={styles.detailItemValue}>{event.participants} مشارك</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>التوزيع الجغرافي للأعضاء</Text>
            <View style={styles.detailList}>
              {[
                { region: 'بغداد', count: 3250, percentage: 28 },
                { region: 'البصرة', count: 1890, percentage: 16 },
                { region: 'أربيل', count: 1560, percentage: 14 },
                { region: 'الموصل', count: 1340, percentage: 12 },
                { region: 'أخرى', count: 3430, percentage: 30 },
              ].map((region, index) => (
                <View key={index} style={styles.detailItem}>
                  <Text style={styles.detailItemName}>{region.region}</Text>
                  <View style={styles.regionStats}>
                    <Text style={styles.detailItemValue}>{region.count}</Text>
                    <Text style={styles.regionPercentage}>({region.percentage}%)</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  exportButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  periodButtonTextActive: {
    color: COLORS.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statInfo: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: 'right',
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChangeText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  statChangePeriod: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  chartSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    marginLeft: 8,
    textAlign: 'right',
  },
  filterButton: {
    padding: 4,
  },
  chartContainer: {
    marginTop: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  chartBar: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 8,
  },
  bar: {
    width: 12,
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    textAlign: 'center',
    width: 50,
  },
  detailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  detailList: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailItemName: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  detailItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  regionStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regionPercentage: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
});