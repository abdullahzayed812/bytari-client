import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Syringe, Calendar, Clock, Shield, User, CheckCircle, AlertCircle } from 'lucide-react-native';

export default function ClinicVaccinations() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock vaccinations data
  const vaccinations = [
    {
      id: 'vacc1',
      petName: 'فلافي',
      petType: 'قط',
      ownerName: 'أحمد محمد',
      vaccineName: 'تطعيم ثلاثي القطط',
      vaccineType: 'FVRCP',
      scheduledDate: '2024-12-25',
      scheduledTime: '10:00',
      status: 'scheduled',
      doseNumber: 1,
      totalDoses: 3,
      nextDueDate: '2025-01-25',
      notes: 'تطعيم أولي ضد الأمراض الفيروسية',
      veterinarian: 'د. محمد أحمد'
    },
    {
      id: 'vacc2',
      petName: 'ماكس',
      petType: 'كلب',
      ownerName: 'سارة أحمد',
      vaccineName: 'تطعيم الكلاب الشامل',
      vaccineType: 'DHPP',
      scheduledDate: '2024-12-23',
      scheduledTime: '14:30',
      status: 'completed',
      doseNumber: 2,
      totalDoses: 3,
      nextDueDate: '2025-01-23',
      notes: 'تطعيم ضد الديستمبر والهيباتيتيس',
      veterinarian: 'د. فاطمة علي'
    },
    {
      id: 'vacc3',
      petName: 'لولو',
      petType: 'أرنب',
      ownerName: 'محمد علي',
      vaccineName: 'تطعيم الأرانب',
      vaccineType: 'RHD',
      scheduledDate: '2024-12-22',
      scheduledTime: '09:00',
      status: 'overdue',
      doseNumber: 1,
      totalDoses: 2,
      nextDueDate: '2025-06-22',
      notes: 'تطعيم ضد مرض النزف الفيروسي',
      veterinarian: 'د. أحمد حسن'
    },
    {
      id: 'vacc4',
      petName: 'تويتي',
      petType: 'طائر',
      ownerName: 'فاطمة حسن',
      vaccineName: 'تطعيم الطيور',
      vaccineType: 'Avian Pox',
      scheduledDate: '2024-12-26',
      scheduledTime: '11:00',
      status: 'scheduled',
      doseNumber: 1,
      totalDoses: 1,
      nextDueDate: '2025-12-26',
      notes: 'تطعيم ضد جدري الطيور',
      veterinarian: 'د. سارة محمد'
    },
    {
      id: 'vacc5',
      petName: 'سيمبا',
      petType: 'قط',
      ownerName: 'عمر خالد',
      vaccineName: 'تطعيم داء الكلب',
      vaccineType: 'Rabies',
      scheduledDate: '2024-12-27',
      scheduledTime: '16:00',
      status: 'scheduled',
      doseNumber: 1,
      totalDoses: 1,
      nextDueDate: '2025-12-27',
      notes: 'تطعيم سنوي ضد داء الكلب',
      veterinarian: 'د. محمد أحمد'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'overdue': return COLORS.error;
      case 'cancelled': return COLORS.darkGray;
      default: return COLORS.darkGray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'مجدول';
      case 'completed': return 'مكتمل';
      case 'overdue': return 'متأخر';
      case 'cancelled': return 'ملغي';
      default: return 'غير محدد';
    }
  };

  const getVaccineIcon = (type: string) => {
    switch (type) {
      case 'FVRCP': return '🐱';
      case 'DHPP': return '🐕';
      case 'RHD': return '🐰';
      case 'Avian Pox': return '🐦';
      case 'Rabies': return '💉';
      default: return '🩹';
    }
  };

  const filteredVaccinations = vaccinations.filter(vaccination => {
    if (selectedFilter === 'all') return true;
    return vaccination.status === selectedFilter;
  });

  const handleVaccinationPress = (vaccination: any) => {
    Alert.alert(
      'تفاصيل التطعيم',
      `التطعيم: ${vaccination.vaccineName}\nالحيوان: ${vaccination.petName}\nالمالك: ${vaccination.ownerName}\nالموعد: ${vaccination.scheduledDate} في ${vaccination.scheduledTime}\nالجرعة: ${vaccination.doseNumber} من ${vaccination.totalDoses}\nالطبيب: ${vaccination.veterinarian}\nملاحظات: ${vaccination.notes}`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تأجيل', onPress: () => rescheduleVaccination(vaccination.id) },
        { text: 'إكمال', onPress: () => completeVaccination(vaccination.id) }
      ]
    );
  };

  const completeVaccination = (vaccinationId: string) => {
    Alert.alert('تم الإكمال', 'تم إعطاء التطعيم بنجاح');
  };

  const rescheduleVaccination = (vaccinationId: string) => {
    Alert.alert('تم التأجيل', 'تم تأجيل موعد التطعيم');
  };



  const renderVaccinationItem = ({ item }: { item: any }) => {
    const isOverdue = item.status === 'overdue';
    const isToday = item.scheduledDate === new Date().toISOString().split('T')[0];
    const progressPercentage = (item.doseNumber / item.totalDoses) * 100;
    
    return (
      <TouchableOpacity 
        style={[
          styles.vaccinationCard,
          isOverdue && styles.overdueCard,
          isToday && styles.todayCard
        ]} 
        activeOpacity={0.8}
        onPress={() => handleVaccinationPress(item)}
      >
        <View style={styles.vaccinationHeader}>
          <View style={styles.vaccinationInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.vaccineIcon}>{getVaccineIcon(item.vaccineType)}</Text>
              <View style={styles.titleContainer}>
                <Text style={styles.vaccineName}>{item.vaccineName}</Text>
                <Text style={styles.vaccineType}>({item.vaccineType})</Text>
              </View>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.petInfo}>
          <View style={styles.petRow}>
            <Text style={styles.petName}>{item.petName} ({item.petType})</Text>
          </View>
          <View style={styles.ownerRow}>
            <User size={14} color={COLORS.darkGray} />
            <Text style={styles.ownerName}>{item.ownerName}</Text>
          </View>
        </View>
        
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateRow}>
            <Calendar size={14} color={isOverdue ? COLORS.error : COLORS.primary} />
            <Text style={[styles.dateText, isOverdue && styles.overdueText]}>
              {item.scheduledDate}
            </Text>
          </View>
          <View style={styles.timeRow}>
            <Clock size={14} color={isOverdue ? COLORS.error : COLORS.primary} />
            <Text style={[styles.timeText, isOverdue && styles.overdueText]}>
              {item.scheduledTime}
            </Text>
          </View>
        </View>
        
        {/* Dose Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>تقدم الجرعات</Text>
            <Text style={styles.progressText}>{item.doseNumber}/{item.totalDoses}</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: item.status === 'completed' ? COLORS.success : COLORS.primary
                }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.veterinarian}>الطبيب: {item.veterinarian}</Text>
          <Text style={styles.nextDue}>الجرعة التالية: {item.nextDueDate}</Text>
        </View>
        
        <Text style={styles.notes}>{item.notes}</Text>
        
        {isOverdue && (
          <View style={styles.overdueWarning}>
            <AlertCircle size={16} color={COLORS.error} />
            <Text style={styles.overdueWarningText}>هذا التطعيم متأخر!</Text>
          </View>
        )}
        
        {isToday && (
          <View style={styles.todayIndicator}>
            <Syringe size={16} color={COLORS.warning} />
            <Text style={styles.todayIndicatorText}>موعد اليوم</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filterButtons = [
    { key: 'all', label: 'الكل', count: vaccinations.length },
    { key: 'scheduled', label: 'مجدول', count: vaccinations.filter(v => v.status === 'scheduled').length },
    { key: 'completed', label: 'مكتمل', count: vaccinations.filter(v => v.status === 'completed').length },
    { key: 'overdue', label: 'متأخر', count: vaccinations.filter(v => v.status === 'overdue').length }
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
          <Text style={styles.headerTitle}>التطعيمات</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: COLORS.primary + '20' }]}>
              <Syringe size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{vaccinations.filter(v => v.status === 'scheduled').length}</Text>
              <Text style={styles.statLabel}>تطعيمات مجدولة</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.success + '20' }]}>
              <CheckCircle size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>{vaccinations.filter(v => v.status === 'completed').length}</Text>
              <Text style={styles.statLabel}>تطعيمات مكتملة</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.error + '20' }]}>
              <AlertCircle size={24} color={COLORS.error} />
              <Text style={styles.statNumber}>{vaccinations.filter(v => v.status === 'overdue').length}</Text>
              <Text style={styles.statLabel}>تطعيمات متأخرة</Text>
            </View>
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

          {/* Vaccinations List */}
          <View style={styles.vaccinationsSection}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'all' ? 'جميع التطعيمات' : `تطعيمات ${filterButtons.find(f => f.key === selectedFilter)?.label}`}
            </Text>
            
            <FlatList
              data={filteredVaccinations}
              renderItem={renderVaccinationItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Shield size={48} color={COLORS.darkGray} />
                  <Text style={styles.emptyText}>لا توجد تطعيمات</Text>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
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
  vaccinationsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  vaccinationCard: {
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
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  vaccinationHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vaccinationInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  vaccineIcon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  vaccineType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'flex-end',
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
  petInfo: {
    marginBottom: 8,
  },
  petRow: {
    marginBottom: 4,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  ownerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  ownerName: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  dateTimeContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
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
  overdueText: {
    color: COLORS.error,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  detailsContainer: {
    marginBottom: 8,
  },
  veterinarian: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  nextDue: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  notes: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginBottom: 8,
  },
  overdueWarning: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.error + '20',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  overdueWarningText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  todayIndicator: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  todayIndicatorText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: 'bold',
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