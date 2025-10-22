import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, AlertCircle, CheckCircle, Calendar, User, Stethoscope } from 'lucide-react-native';

export default function ClinicTodayCases() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock today's cases data
  const todayCases = [
    {
      id: 'case1',
      petName: 'فلافي',
      petType: 'قط',
      ownerName: 'أحمد محمد',
      appointmentTime: '09:00',
      status: 'waiting',
      priority: 'normal',
      reason: 'فحص دوري',
      notes: 'فحص شامل للقط'
    },
    {
      id: 'case2',
      petName: 'ماكس',
      petType: 'كلب',
      ownerName: 'سارة أحمد',
      appointmentTime: '10:30',
      status: 'in-progress',
      priority: 'urgent',
      reason: 'إصابة في الساق',
      notes: 'كسر محتمل في الساق الأمامية'
    },
    {
      id: 'case3',
      petName: 'لولو',
      petType: 'أرنب',
      ownerName: 'محمد علي',
      appointmentTime: '11:15',
      status: 'completed',
      priority: 'normal',
      reason: 'تطعيم',
      notes: 'تطعيم سنوي'
    },
    {
      id: 'case4',
      petName: 'تويتي',
      petType: 'طائر',
      ownerName: 'فاطمة حسن',
      appointmentTime: '14:00',
      status: 'waiting',
      priority: 'high',
      reason: 'مشاكل في التنفس',
      notes: 'صعوبة في التنفس منذ يومين'
    },
    {
      id: 'case5',
      petName: 'سيمبا',
      petType: 'قط',
      ownerName: 'عمر خالد',
      appointmentTime: '15:30',
      status: 'waiting',
      priority: 'normal',
      reason: 'فحص أسنان',
      notes: 'تنظيف وفحص الأسنان'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return COLORS.warning;
      case 'in-progress': return COLORS.primary;
      case 'completed': return COLORS.success;
      default: return COLORS.darkGray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'في الانتظار';
      case 'in-progress': return 'قيد الفحص';
      case 'completed': return 'مكتمل';
      default: return 'غير محدد';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return COLORS.error;
      case 'high': return COLORS.warning;
      case 'normal': return COLORS.success;
      default: return COLORS.darkGray;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'عاجل';
      case 'high': return 'مهم';
      case 'normal': return 'عادي';
      default: return 'غير محدد';
    }
  };

  const filteredCases = todayCases.filter(caseItem => {
    if (selectedFilter === 'all') return true;
    return caseItem.status === selectedFilter;
  });

  const handleCasePress = (caseItem: any) => {
    Alert.alert(
      'تفاصيل الحالة',
      `الحيوان: ${caseItem.petName}\nالمالك: ${caseItem.ownerName}\nالموعد: ${caseItem.appointmentTime}\nالسبب: ${caseItem.reason}\nملاحظات: ${caseItem.notes}`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'فتح ملف الحيوان', onPress: () => openPetProfile(caseItem.id) },
        { text: 'بدء الفحص', onPress: () => updateCaseStatus(caseItem.id, 'in-progress') },
        { text: 'إكمال', onPress: () => updateCaseStatus(caseItem.id, 'completed') }
      ]
    );
  };

  const openPetProfile = (caseId: string) => {
    // Map case IDs to pet IDs
    const petIdMap: { [key: string]: string } = {
      'case1': 'pet1', // فلافي
      'case2': 'pet2', // ماكس
      'case3': 'pet3', // لولو
      'case4': 'pet4', // تويتي
      'case5': 'pet1'  // سيمبا (using pet1 as fallback)
    };
    
    const petId = petIdMap[caseId] || 'pet1';
    
    router.push({
      pathname: '/pet-details',
      params: {
        petId: petId,
        fromClinic: 'true',
        openSection: 'medical'
      }
    });
  };

  const updateCaseStatus = (caseId: string, newStatus: string) => {
    Alert.alert('تم التحديث', `تم تحديث حالة الحالة إلى: ${getStatusText(newStatus)}`);
  };

  const renderCaseItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.caseCard} 
      activeOpacity={0.8}
      onPress={() => handleCasePress(item)}
    >
      <View style={styles.caseHeader}>
        <View style={styles.caseInfo}>
          <Text style={styles.petName}>{item.petName} ({item.petType})</Text>
          <View style={styles.ownerRow}>
            <User size={14} color={COLORS.darkGray} />
            <Text style={styles.ownerName}>{item.ownerName}</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{getPriorityText(item.priority)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.caseDetails}>
        <View style={styles.timeRow}>
          <Clock size={14} color={COLORS.primary} />
          <Text style={styles.timeText}>{item.appointmentTime}</Text>
        </View>
        <View style={styles.reasonRow}>
          <Stethoscope size={14} color={COLORS.darkGray} />
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>
      </View>
      
      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>ملاحظات:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const filterButtons = [
    { key: 'all', label: 'الكل', count: todayCases.length },
    { key: 'waiting', label: 'في الانتظار', count: todayCases.filter(c => c.status === 'waiting').length },
    { key: 'in-progress', label: 'قيد الفحص', count: todayCases.filter(c => c.status === 'in-progress').length },
    { key: 'completed', label: 'مكتمل', count: todayCases.filter(c => c.status === 'completed').length }
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>حالات اليوم</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Date Header */}
          <View style={styles.dateHeader}>
            <Calendar size={20} color={COLORS.primary} />
            <Text style={styles.dateText}>اليوم - {new Date().toLocaleDateString('ar-EG')}</Text>
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterButtons}>
                {filterButtons.map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterButton,
                      selectedFilter === filter.key && styles.activeFilterButton
                    ]}
                    onPress={() => setSelectedFilter(filter.key)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedFilter === filter.key && styles.activeFilterButtonText
                    ]}>
                      {filter.label} ({filter.count})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Cases List */}
          <View style={styles.casesSection}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'all' ? 'جميع الحالات' : `حالات ${filterButtons.find(f => f.key === selectedFilter)?.label}`}
            </Text>
            
            <FlatList
              data={filteredCases}
              renderItem={renderCaseItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <AlertCircle size={48} color={COLORS.darkGray} />
                  <Text style={styles.emptyText}>لا توجد حالات لهذا اليوم</Text>
                </View>
              }
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  filterButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: COLORS.white,
  },
  casesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  caseCard: {
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
  caseHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  caseInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  ownerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  ownerName: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  caseDetails: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  reasonRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  reasonText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  notesContainer: {
    backgroundColor: COLORS.gray,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.black,
    textAlign: 'right',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 12,
  },
});