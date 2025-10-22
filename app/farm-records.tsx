import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Calendar, TrendingUp, DollarSign, Package } from 'lucide-react-native';

// Mock completed batches with profit data
const mockCompletedBatches = [
  {
    id: 1,
    batchNumber: 'B-2023-015',
    startDate: '2023-12-01',
    endDate: '2024-01-15',
    initialCount: 5000,
    finalCount: 4750,
    netProfit: 45000,
    totalWeeks: 7,
    status: 'completed'
  },
  {
    id: 2,
    batchNumber: 'B-2023-014',
    startDate: '2023-11-15',
    endDate: '2023-12-30',
    initialCount: 4500,
    finalCount: 4320,
    netProfit: 38500,
    totalWeeks: 6,
    status: 'completed'
  },
  {
    id: 3,
    batchNumber: 'B-2023-013',
    startDate: '2023-10-20',
    endDate: '2023-12-05',
    initialCount: 6000,
    finalCount: 5850,
    netProfit: 52000,
    totalWeeks: 7,
    status: 'completed'
  },
  {
    id: 4,
    batchNumber: 'B-2023-012',
    startDate: '2023-09-25',
    endDate: '2023-11-10',
    initialCount: 4000,
    finalCount: 3900,
    netProfit: 35000,
    totalWeeks: 6,
    status: 'completed'
  },
  {
    id: 5,
    batchNumber: 'B-2023-011',
    startDate: '2023-08-30',
    endDate: '2023-10-15',
    initialCount: 5500,
    finalCount: 5280,
    netProfit: 48000,
    totalWeeks: 7,
    status: 'completed'
  }
];

export default function FarmRecordsScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const farmId = params.farmId as string;
  
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'year' | 'quarter'>('all');

  const handleViewBatchDetails = (batchId: number) => {
    router.push({
      pathname: '/batch-details',
      params: { batchId, farmId }
    });
  };

  const calculateTotalStats = () => {
    const totalBatches = mockCompletedBatches.length;
    const totalProfit = mockCompletedBatches.reduce((sum, batch) => sum + batch.netProfit, 0);
    const totalBirds = mockCompletedBatches.reduce((sum, batch) => sum + batch.finalCount, 0);
    const avgProfit = totalProfit / totalBatches;
    
    return { totalBatches, totalProfit, totalBirds, avgProfit };
  };

  const stats = calculateTotalStats();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'سجلات الحقل'
        }} 
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Package size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalBatches}</Text>
            <Text style={styles.statLabel}>إجمالي الدفعات</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <DollarSign size={24} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>{stats.totalProfit.toLocaleString()}</Text>
            <Text style={styles.statLabel}>إجمالي الربح</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.statValue}>{Math.round(stats.avgProfit).toLocaleString()}</Text>
            <Text style={styles.statLabel}>متوسط الربح</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Calendar size={24} color={COLORS.darkGray} />
            </View>
            <Text style={styles.statValue}>{stats.totalBirds.toLocaleString()}</Text>
            <Text style={styles.statLabel}>إجمالي الطيور</Text>
          </View>
        </View>

        {/* Period Filter */}
        <View style={[styles.filterContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === 'all' && styles.activeFilter]}
            onPress={() => setSelectedPeriod('all')}
          >
            <Text style={[styles.filterText, selectedPeriod === 'all' && styles.activeFilterText]}>
              جميع الفترات
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === 'year' && styles.activeFilter]}
            onPress={() => setSelectedPeriod('year')}
          >
            <Text style={[styles.filterText, selectedPeriod === 'year' && styles.activeFilterText]}>
              هذا العام
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedPeriod === 'quarter' && styles.activeFilter]}
            onPress={() => setSelectedPeriod('quarter')}
          >
            <Text style={[styles.filterText, selectedPeriod === 'quarter' && styles.activeFilterText]}>
              آخر 3 أشهر
            </Text>
          </TouchableOpacity>
        </View>

        {/* Completed Batches List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الدفعات المكتملة</Text>
          
          {mockCompletedBatches.map((batch) => (
            <TouchableOpacity
              key={batch.id}
              style={styles.batchCard}
              onPress={() => handleViewBatchDetails(batch.id)}
            >
              <View style={[styles.batchHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.batchInfo}>
                  <Text style={[styles.batchNumber, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {batch.batchNumber}
                  </Text>
                  <Text style={[styles.batchDetail, { textAlign: isRTL ? 'right' : 'left' }]}>
                    الفترة: {batch.startDate} - {batch.endDate}
                  </Text>
                  <Text style={[styles.batchDetail, { textAlign: isRTL ? 'right' : 'left' }]}>
                    المدة: {batch.totalWeeks} أسابيع
                  </Text>
                </View>
                
                <View style={styles.batchStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemLabel}>العدد الصافي</Text>
                    <Text style={styles.statItemValue}>{batch.finalCount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemLabel}>الربح الصافي</Text>
                    <Text style={[styles.statItemValue, { color: COLORS.success }]}>
                      {batch.netProfit.toLocaleString()} ريال
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  scrollContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  activeFilterText: {
    color: COLORS.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  batchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  batchHeader: {
    alignItems: 'flex-start',
  },
  batchInfo: {
    flex: 1,
  },
  batchNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  batchDetail: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  batchStats: {
    alignItems: 'flex-end',
  },
  statItem: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  statItemLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  statItemValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
});