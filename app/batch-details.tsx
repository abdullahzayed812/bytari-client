import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import Button from "../components/Button";
import { Calendar, TrendingUp, AlertCircle, Edit3, Trash2 } from 'lucide-react-native';

// Mock batch details data
const mockBatchData = {
  id: 1,
  batchNumber: 'B-2024-001',
  birdType: 'chicken',
  initialCount: 5000,
  currentCount: 4850,
  finalCount: 4800, // Net count when sold
  startDate: '2024-01-15',
  endDate: '2024-03-01', // End date when sold
  status: 'completed', // Changed to completed to show selling data
  weekNumber: 7,
  mortality: 200,
  feedConsumption: 15000,
  weight: 2.2,
  netProfit: 42000, // Net profit when sold
  notes: 'تم بيع الدفعة بنجاح بعد 7 أسابيع'
};

// Mock weekly records
const mockWeeklyRecords = [
  { week: 1, count: 5000, mortality: 20, feedKg: 1500, avgWeight: 0.2 },
  { week: 2, count: 4980, mortality: 15, feedKg: 2000, avgWeight: 0.4 },
  { week: 3, count: 4965, mortality: 18, feedKg: 2500, avgWeight: 0.7 },
  { week: 4, count: 4947, mortality: 22, feedKg: 3000, avgWeight: 1.1 },
  { week: 5, count: 4925, mortality: 25, feedKg: 3500, avgWeight: 1.5 },
  { week: 6, count: 4900, mortality: 30, feedKg: 4000, avgWeight: 1.8 },
];

export default function BatchDetailsScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'weekly' | 'records'>('overview');

  const batchId = params.batchId as string;
  const farmId = params.farmId as string;

  const handleEditBatch = () => {
    if (mockBatchData.status === 'completed') {
      Alert.alert('تعديل غير متاح', 'لا يمكن تعديل دفعة مكتملة');
    } else {
      Alert.alert('تعديل الدفعة', 'سيتم إضافة هذه الميزة قريباً');
    }
  };

  const handleDeleteBatch = () => {
    if (mockBatchData.status === 'completed') {
      Alert.alert('حذف غير متاح', 'لا يمكن حذف دفعة مكتملة');
    } else {
      Alert.alert(
        'حذف الدفعة',
        'هل أنت متأكد من حذف هذه الدفعة؟ لا يمكن التراجع عن هذا الإجراء.',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'حذف', style: 'destructive', onPress: () => {
            // Handle delete logic here
            router.back();
          }}
        ]
      );
    }
  };

  const renderOverview = () => (
    <View>
      {/* Batch Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Calendar size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{mockBatchData.weekNumber}</Text>
          <Text style={styles.statLabel}>الأسبوع الحالي</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={24} color={COLORS.success} />
          </View>
          <Text style={styles.statValue}>
            {mockBatchData.status === 'completed' 
              ? mockBatchData.finalCount?.toLocaleString() 
              : mockBatchData.currentCount.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>
            {mockBatchData.status === 'completed' ? 'العدد الصافي' : 'العدد الحالي'}
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <AlertCircle size={24} color={COLORS.error} />
          </View>
          <Text style={styles.statValue}>{mockBatchData.mortality}</Text>
          <Text style={styles.statLabel}>النفوق</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={24} color={mockBatchData.status === 'completed' ? COLORS.success : COLORS.warning} />
          </View>
          <Text style={styles.statValue}>
            {mockBatchData.status === 'completed' && mockBatchData.netProfit 
              ? mockBatchData.netProfit.toLocaleString() + ' ريال'
              : mockBatchData.weight + ' كغ'}
          </Text>
          <Text style={styles.statLabel}>
            {mockBatchData.status === 'completed' ? 'الربح الصافي' : 'متوسط الوزن'}
          </Text>
        </View>
      </View>

      {/* Batch Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>معلومات الدفعة</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>رقم الدفعة:</Text>
          <Text style={styles.infoValue}>{mockBatchData.batchNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>تاريخ البداية:</Text>
          <Text style={styles.infoValue}>{mockBatchData.startDate}</Text>
        </View>
        {mockBatchData.status === 'completed' && mockBatchData.endDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>تاريخ البيع:</Text>
            <Text style={styles.infoValue}>{mockBatchData.endDate}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>العدد الأولي:</Text>
          <Text style={styles.infoValue}>{mockBatchData.initialCount.toLocaleString()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>استهلاك العلف:</Text>
          <Text style={styles.infoValue}>{mockBatchData.feedConsumption.toLocaleString()} كغ</Text>
        </View>
        {mockBatchData.status === 'completed' && mockBatchData.finalCount && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>العدد الصافي عند البيع:</Text>
            <Text style={styles.infoValue}>{mockBatchData.finalCount.toLocaleString()}</Text>
          </View>
        )}
        {mockBatchData.status === 'completed' && mockBatchData.netProfit && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الربح الصافي:</Text>
            <Text style={[styles.infoValue, { color: COLORS.success, fontWeight: 'bold' }]}>
              {mockBatchData.netProfit.toLocaleString()} ريال
            </Text>
          </View>
        )}
        {mockBatchData.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.infoLabel}>ملاحظات:</Text>
            <Text style={styles.notesText}>{mockBatchData.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderWeeklyRecords = () => (
    <View>
      {mockWeeklyRecords.map((record) => (
        <View key={record.week} style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <Text style={styles.weekTitle}>الأسبوع {record.week}</Text>
          </View>
          <View style={styles.weekStats}>
            <View style={styles.weekStat}>
              <Text style={styles.weekStatLabel}>العدد</Text>
              <Text style={styles.weekStatValue}>{record.count.toLocaleString()}</Text>
            </View>
            <View style={styles.weekStat}>
              <Text style={styles.weekStatLabel}>النفوق</Text>
              <Text style={styles.weekStatValue}>{record.mortality}</Text>
            </View>
            <View style={styles.weekStat}>
              <Text style={styles.weekStatLabel}>العلف (كغ)</Text>
              <Text style={styles.weekStatValue}>{record.feedKg.toLocaleString()}</Text>
            </View>
            <View style={styles.weekStat}>
              <Text style={styles.weekStatLabel}>الوزن (كغ)</Text>
              <Text style={styles.weekStatValue}>{record.avgWeight}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderRecords = () => (
    <View style={styles.recordsContainer}>
      <Text style={styles.recordsText}>سجلات مفصلة للدفعة</Text>
      <Button
        title="عرض جميع السجلات"
        onPress={() => Alert.alert('السجلات', 'سيتم إضافة هذه الميزة قريباً')}
        type="primary"
        size="medium"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: mockBatchData.batchNumber,
          headerRight: () => (
            <View style={[styles.headerActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {mockBatchData.status !== 'completed' && (
                <>
                  <TouchableOpacity onPress={handleEditBatch} style={styles.headerButton}>
                    <Edit3 size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeleteBatch} style={styles.headerButton}>
                    <Trash2 size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          )
        }} 
      />

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
            نظرة عامة
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'weekly' && styles.activeTab]}
          onPress={() => setSelectedTab('weekly')}
        >
          <Text style={[styles.tabText, selectedTab === 'weekly' && styles.activeTabText]}>
            السجلات الأسبوعية
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'records' && styles.activeTab]}
          onPress={() => setSelectedTab('records')}
        >
          <Text style={[styles.tabText, selectedTab === 'records' && styles.activeTabText]}>
            السجلات المفصلة
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'weekly' && renderWeeklyRecords()}
        {selectedTab === 'records' && renderRecords()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  headerActions: {
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  tabContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  activeTabText: {
    color: COLORS.primary,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  infoCard: {
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
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.black,
  },
  notesContainer: {
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.black,
    marginTop: 4,
    textAlign: 'right',
    lineHeight: 20,
  },
  weekCard: {
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
  weekHeader: {
    marginBottom: 12,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  weekStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekStat: {
    alignItems: 'center',
  },
  weekStatLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  weekStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  recordsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  recordsText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 16,
    textAlign: 'center',
  },
});