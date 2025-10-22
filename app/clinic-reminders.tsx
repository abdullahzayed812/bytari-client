import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Calendar, Clock, AlertTriangle, CheckCircle, User } from 'lucide-react-native';

export default function ClinicReminders() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock reminders data
  const reminders = [
    {
      id: 'rem1',
      petName: 'فلافي',
      petType: 'قط',
      ownerName: 'أحمد محمد',
      reminderType: 'vaccination',
      title: 'موعد التطعيم السنوي',
      description: 'تطعيم ضد الأمراض الفيروسية',
      dueDate: '2024-12-25',
      dueTime: '10:00',
      status: 'pending',
      priority: 'high',
      createdDate: '2024-12-20'
    },
    {
      id: 'rem2',
      petName: 'ماكس',
      petType: 'كلب',
      ownerName: 'سارة أحمد',
      reminderType: 'checkup',
      title: 'فحص دوري',
      description: 'فحص شامل بعد العملية الجراحية',
      dueDate: '2024-12-24',
      dueTime: '14:30',
      status: 'overdue',
      priority: 'urgent',
      createdDate: '2024-12-15'
    },
    {
      id: 'rem3',
      petName: 'لولو',
      petType: 'أرنب',
      ownerName: 'محمد علي',
      reminderType: 'medication',
      title: 'جرعة الدواء',
      description: 'إعطاء المضاد الحيوي',
      dueDate: '2024-12-23',
      dueTime: '09:00',
      status: 'completed',
      priority: 'normal',
      createdDate: '2024-12-18'
    },
    {
      id: 'rem4',
      petName: 'تويتي',
      petType: 'طائر',
      ownerName: 'فاطمة حسن',
      reminderType: 'followup',
      title: 'متابعة حالة التنفس',
      description: 'فحص تحسن حالة التنفس',
      dueDate: '2024-12-26',
      dueTime: '11:00',
      status: 'pending',
      priority: 'high',
      createdDate: '2024-12-21'
    },
    {
      id: 'rem5',
      petName: 'سيمبا',
      petType: 'قط',
      ownerName: 'عمر خالد',
      reminderType: 'grooming',
      title: 'موعد التنظيف',
      description: 'تنظيف الأسنان والأذنين',
      dueDate: '2024-12-27',
      dueTime: '16:00',
      status: 'pending',
      priority: 'normal',
      createdDate: '2024-12-22'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'overdue': return COLORS.error;
      case 'completed': return COLORS.success;
      default: return COLORS.darkGray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'overdue': return 'متأخر';
      case 'completed': return 'مكتمل';
      default: return 'غير محدد';
    }
  };

  const getReminderTypeText = (type: string) => {
    switch (type) {
      case 'vaccination': return 'تطعيم';
      case 'checkup': return 'فحص';
      case 'medication': return 'دواء';
      case 'followup': return 'متابعة';
      case 'grooming': return 'تنظيف';
      default: return 'تذكير';
    }
  };

  const getReminderTypeIcon = (type: string) => {
    switch (type) {
      case 'vaccination': return '💉';
      case 'checkup': return '🩺';
      case 'medication': return '💊';
      case 'followup': return '📋';
      case 'grooming': return '✂️';
      default: return '📅';
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

  const filteredReminders = reminders.filter(reminder => {
    if (selectedFilter === 'all') return true;
    return reminder.status === selectedFilter;
  });

  const handleReminderPress = (reminder: any) => {
    Alert.alert(
      'تفاصيل التذكير',
      `العنوان: ${reminder.title}\nالحيوان: ${reminder.petName}\nالمالك: ${reminder.ownerName}\nالموعد: ${reminder.dueDate} في ${reminder.dueTime}\nالوصف: ${reminder.description}`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تأجيل', onPress: () => postponeReminder(reminder.id) },
        { text: 'إكمال', onPress: () => completeReminder(reminder.id) }
      ]
    );
  };

  const completeReminder = (reminderId: string) => {
    Alert.alert('تم الإكمال', 'تم تحديد التذكير كمكتمل');
  };

  const postponeReminder = (reminderId: string) => {
    Alert.alert('تم التأجيل', 'تم تأجيل التذكير لموعد لاحق');
  };



  const renderReminderItem = ({ item }: { item: any }) => {
    const isOverdue = item.status === 'overdue';
    const isToday = item.dueDate === new Date().toISOString().split('T')[0];
    
    return (
      <TouchableOpacity 
        style={[
          styles.reminderCard,
          isOverdue && styles.overdueCard,
          isToday && styles.todayCard
        ]} 
        activeOpacity={0.8}
        onPress={() => handleReminderPress(item)}
      >
        <View style={styles.reminderHeader}>
          <View style={styles.reminderInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.reminderIcon}>{getReminderTypeIcon(item.reminderType)}</Text>
              <Text style={styles.reminderTitle}>{item.title}</Text>
            </View>
            <Text style={styles.reminderType}>{getReminderTypeText(item.reminderType)}</Text>
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
              {item.dueDate}
            </Text>
          </View>
          <View style={styles.timeRow}>
            <Clock size={14} color={isOverdue ? COLORS.error : COLORS.primary} />
            <Text style={[styles.timeText, isOverdue && styles.overdueText]}>
              {item.dueTime}
            </Text>
          </View>
        </View>
        
        <Text style={styles.description}>{item.description}</Text>
        
        {isOverdue && (
          <View style={styles.overdueWarning}>
            <AlertTriangle size={16} color={COLORS.error} />
            <Text style={styles.overdueWarningText}>هذا التذكير متأخر!</Text>
          </View>
        )}
        
        {isToday && (
          <View style={styles.todayIndicator}>
            <Bell size={16} color={COLORS.warning} />
            <Text style={styles.todayIndicatorText}>موعد اليوم</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filterButtons = [
    { key: 'all', label: 'الكل', count: reminders.length },
    { key: 'pending', label: 'معلق', count: reminders.filter(r => r.status === 'pending').length },
    { key: 'overdue', label: 'متأخر', count: reminders.filter(r => r.status === 'overdue').length },
    { key: 'completed', label: 'مكتمل', count: reminders.filter(r => r.status === 'completed').length }
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
          <Text style={styles.headerTitle}>تذكيرات الحيوانات</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: COLORS.warning + '20' }]}>
              <Bell size={24} color={COLORS.warning} />
              <Text style={styles.statNumber}>{reminders.filter(r => r.status === 'pending').length}</Text>
              <Text style={styles.statLabel}>تذكيرات معلقة</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.error + '20' }]}>
              <AlertTriangle size={24} color={COLORS.error} />
              <Text style={styles.statNumber}>{reminders.filter(r => r.status === 'overdue').length}</Text>
              <Text style={styles.statLabel}>تذكيرات متأخرة</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.success + '20' }]}>
              <CheckCircle size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>{reminders.filter(r => r.status === 'completed').length}</Text>
              <Text style={styles.statLabel}>تذكيرات مكتملة</Text>
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

          {/* Reminders List */}
          <View style={styles.remindersSection}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'all' ? 'جميع التذكيرات' : `تذكيرات ${filterButtons.find(f => f.key === selectedFilter)?.label}`}
            </Text>
            
            <FlatList
              data={filteredReminders}
              renderItem={renderReminderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Bell size={48} color={COLORS.darkGray} />
                  <Text style={styles.emptyText}>لا توجد تذكيرات</Text>
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
  remindersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  reminderCard: {
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
  reminderHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reminderIcon: {
    fontSize: 20,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  reminderType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
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
    marginBottom: 8,
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
  description: {
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