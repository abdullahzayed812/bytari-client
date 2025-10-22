import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Alert, TextInput, Modal } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Calendar, Clock, User, X, CheckCircle, AlertCircle } from 'lucide-react-native';

export default function ClinicFollowups() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFollowup, setNewFollowup] = useState({
    petName: '',
    ownerName: '',
    followupType: 'checkup',
    notes: '',
    scheduledDate: '',
    scheduledTime: ''
  });

  // Mock followups data
  const [followups, setFollowups] = useState([
    {
      id: 'follow1',
      petName: 'فلافي',
      petType: 'قط',
      ownerName: 'أحمد محمد',
      ownerPhone: '+964 770 123 4567',
      followupType: 'post-surgery',
      title: 'متابعة بعد العملية الجراحية',
      description: 'فحص الجرح والتأكد من الشفاء',
      scheduledDate: '2024-12-25',
      scheduledTime: '10:00',
      status: 'active',
      priority: 'high',
      createdDate: '2024-12-20',
      lastUpdate: '2024-12-22',
      veterinarian: 'د. محمد أحمد',
      notes: 'الحيوان يتعافى بشكل جيد، يحتاج متابعة دورية'
    },
    {
      id: 'follow2',
      petName: 'ماكس',
      petType: 'كلب',
      ownerName: 'سارة أحمد',
      ownerPhone: '+964 771 234 5678',
      followupType: 'medication',
      title: 'متابعة العلاج الدوائي',
      description: 'متابعة استجابة الحيوان للعلاج',
      scheduledDate: '2024-12-24',
      scheduledTime: '14:30',
      status: 'completed',
      priority: 'normal',
      createdDate: '2024-12-15',
      lastUpdate: '2024-12-24',
      veterinarian: 'د. فاطمة علي',
      notes: 'تم إكمال العلاج بنجاح، الحيوان بحالة ممتازة'
    },
    {
      id: 'follow3',
      petName: 'لولو',
      petType: 'أرنب',
      ownerName: 'محمد علي',
      ownerPhone: '+964 772 345 6789',
      followupType: 'chronic-condition',
      title: 'متابعة حالة مزمنة',
      description: 'متابعة حالة التهاب المفاصل',
      scheduledDate: '2024-12-26',
      scheduledTime: '11:00',
      status: 'active',
      priority: 'high',
      createdDate: '2024-12-18',
      lastUpdate: '2024-12-21',
      veterinarian: 'د. أحمد حسن',
      notes: 'حالة مستقرة، يحتاج متابعة شهرية'
    },
    {
      id: 'follow4',
      petName: 'تويتي',
      petType: 'طائر',
      ownerName: 'فاطمة حسن',
      ownerPhone: '+964 773 456 7890',
      followupType: 'recovery',
      title: 'متابعة التعافي',
      description: 'متابعة تحسن حالة التنفس',
      scheduledDate: '2024-12-23',
      scheduledTime: '09:00',
      status: 'cancelled',
      priority: 'normal',
      createdDate: '2024-12-19',
      lastUpdate: '2024-12-23',
      veterinarian: 'د. سارة محمد',
      notes: 'تم إلغاء المتابعة بناءً على طلب المالك'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'cancelled': return COLORS.error;
      case 'paused': return COLORS.warning;
      default: return COLORS.darkGray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      case 'paused': return 'متوقف';
      default: return 'غير محدد';
    }
  };

  const getFollowupTypeText = (type: string) => {
    switch (type) {
      case 'post-surgery': return 'بعد العملية';
      case 'medication': return 'علاج دوائي';
      case 'chronic-condition': return 'حالة مزمنة';
      case 'recovery': return 'تعافي';
      case 'checkup': return 'فحص دوري';
      default: return 'متابعة';
    }
  };

  const getFollowupTypeIcon = (type: string) => {
    switch (type) {
      case 'post-surgery': return '🏥';
      case 'medication': return '💊';
      case 'chronic-condition': return '🩺';
      case 'recovery': return '💚';
      case 'checkup': return '📋';
      default: return '❤️';
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

  const filteredFollowups = followups.filter(followup => {
    if (selectedFilter === 'all') return true;
    return followup.status === selectedFilter;
  });

  const handleFollowupPress = (followup: any) => {
    Alert.alert(
      'تفاصيل المتابعة',
      `العنوان: ${followup.title}\nالحيوان: ${followup.petName}\nالمالك: ${followup.ownerName}\nالموعد: ${followup.scheduledDate} في ${followup.scheduledTime}\nالطبيب: ${followup.veterinarian}\nالوصف: ${followup.description}\nملاحظات: ${followup.notes}`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'إلغاء المتابعة', onPress: () => cancelFollowup(followup.id) },
        { text: 'إكمال', onPress: () => completeFollowup(followup.id) }
      ]
    );
  };



  const cancelFollowup = (followupId: string) => {
    Alert.alert(
      'إلغاء المتابعة',
      'هل أنت متأكد من إلغاء هذه المتابعة؟ سيتم إرسال إشعار للمالك.',
      [
        { text: 'لا', style: 'cancel' },
        { 
          text: 'نعم', 
          onPress: () => {
            setFollowups(prev => prev.map(f => 
              f.id === followupId ? { ...f, status: 'cancelled' } : f
            ));
            Alert.alert('تم الإلغاء', 'تم إلغاء المتابعة وإرسال إشعار للمالك');
          }
        }
      ]
    );
  };

  const completeFollowup = (followupId: string) => {
    setFollowups(prev => prev.map(f => 
      f.id === followupId ? { ...f, status: 'completed' } : f
    ));
    Alert.alert('تم الإكمال', 'تم تحديد المتابعة كمكتملة');
  };



  const addNewFollowup = () => {
    if (!newFollowup.petName || !newFollowup.ownerName || !newFollowup.scheduledDate) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const newId = `follow${followups.length + 1}`;
    const followupToAdd = {
      id: newId,
      ...newFollowup,
      petType: 'قط', // Default
      ownerPhone: '+964 770 000 0000', // Default
      title: `متابعة ${getFollowupTypeText(newFollowup.followupType)}`,
      description: newFollowup.notes,
      status: 'active',
      priority: 'normal',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
      veterinarian: 'د. محمد أحمد' // Default
    };

    setFollowups(prev => [...prev, followupToAdd]);
    setShowAddModal(false);
    setNewFollowup({
      petName: '',
      ownerName: '',
      followupType: 'checkup',
      notes: '',
      scheduledDate: '',
      scheduledTime: ''
    });
    Alert.alert('تم الإضافة', 'تم إضافة المتابعة الجديدة بنجاح');
  };

  const renderFollowupItem = ({ item }: { item: any }) => {
    const isToday = item.scheduledDate === new Date().toISOString().split('T')[0];
    
    return (
      <TouchableOpacity 
        style={[
          styles.followupCard,
          item.status === 'cancelled' && styles.cancelledCard,
          isToday && styles.todayCard
        ]} 
        activeOpacity={0.8}
        onPress={() => handleFollowupPress(item)}
      >
        <View style={styles.followupHeader}>
          <View style={styles.followupInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.followupIcon}>{getFollowupTypeIcon(item.followupType)}</Text>
              <Text style={styles.followupTitle}>{item.title}</Text>
            </View>
            <Text style={styles.followupType}>{getFollowupTypeText(item.followupType)}</Text>
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
            <Calendar size={14} color={COLORS.primary} />
            <Text style={styles.dateText}>{item.scheduledDate}</Text>
          </View>
          <View style={styles.timeRow}>
            <Clock size={14} color={COLORS.primary} />
            <Text style={styles.timeText}>{item.scheduledTime}</Text>
          </View>
        </View>
        
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.veterinarian}>الطبيب: {item.veterinarian}</Text>
        
        {/* Action Buttons */}
        {item.status === 'active' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: COLORS.error + '20' }]}
              onPress={() => cancelFollowup(item.id)}
            >
              <X size={16} color={COLORS.error} />
              <Text style={[styles.actionButtonText, { color: COLORS.error }]}>إلغاء المتابعة</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {isToday && (
          <View style={styles.todayIndicator}>
            <Heart size={16} color={COLORS.warning} />
            <Text style={styles.todayIndicatorText}>متابعة اليوم</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filterButtons = [
    { key: 'all', label: 'الكل', count: followups.length },
    { key: 'active', label: 'نشط', count: followups.filter(f => f.status === 'active').length },
    { key: 'completed', label: 'مكتمل', count: followups.filter(f => f.status === 'completed').length },
    { key: 'cancelled', label: 'ملغي', count: followups.filter(f => f.status === 'cancelled').length }
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
          <Text style={styles.headerTitle}>المتابعات</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: COLORS.primary + '20' }]}>
              <Heart size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{followups.filter(f => f.status === 'active').length}</Text>
              <Text style={styles.statLabel}>متابعات نشطة</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.success + '20' }]}>
              <CheckCircle size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>{followups.filter(f => f.status === 'completed').length}</Text>
              <Text style={styles.statLabel}>متابعات مكتملة</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.error + '20' }]}>
              <AlertCircle size={24} color={COLORS.error} />
              <Text style={styles.statNumber}>{followups.filter(f => f.status === 'cancelled').length}</Text>
              <Text style={styles.statLabel}>متابعات ملغية</Text>
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

          {/* Followups List */}
          <View style={styles.followupsSection}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'all' ? 'جميع المتابعات' : `متابعات ${filterButtons.find(f => f.key === selectedFilter)?.label}`}
            </Text>
            
            <FlatList
              data={filteredFollowups}
              renderItem={renderFollowupItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Heart size={48} color={COLORS.darkGray} />
                  <Text style={styles.emptyText}>لا توجد متابعات</Text>
                </View>
              }
            />
          </View>
        </ScrollView>

        {/* Add Followup Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>إضافة متابعة جديدة</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <X size={24} color={COLORS.black} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>اسم الحيوان *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newFollowup.petName}
                    onChangeText={(text) => setNewFollowup(prev => ({ ...prev, petName: text }))}
                    placeholder="أدخل اسم الحيوان"
                    placeholderTextColor={COLORS.darkGray}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>اسم المالك *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newFollowup.ownerName}
                    onChangeText={(text) => setNewFollowup(prev => ({ ...prev, ownerName: text }))}
                    placeholder="أدخل اسم المالك"
                    placeholderTextColor={COLORS.darkGray}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>نوع المتابعة</Text>
                  <View style={styles.typeButtons}>
                    {[
                      { key: 'checkup', label: 'فحص دوري' },
                      { key: 'post-surgery', label: 'بعد العملية' },
                      { key: 'medication', label: 'علاج دوائي' },
                      { key: 'chronic-condition', label: 'حالة مزمنة' },
                      { key: 'recovery', label: 'تعافي' }
                    ].map((type) => (
                      <TouchableOpacity
                        key={type.key}
                        style={[
                          styles.typeButton,
                          newFollowup.followupType === type.key && styles.activeTypeButton
                        ]}
                        onPress={() => setNewFollowup(prev => ({ ...prev, followupType: type.key }))}
                      >
                        <Text style={[
                          styles.typeButtonText,
                          newFollowup.followupType === type.key && styles.activeTypeButtonText
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>تاريخ المتابعة *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newFollowup.scheduledDate}
                    onChangeText={(text) => setNewFollowup(prev => ({ ...prev, scheduledDate: text }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.darkGray}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>وقت المتابعة</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newFollowup.scheduledTime}
                    onChangeText={(text) => setNewFollowup(prev => ({ ...prev, scheduledTime: text }))}
                    placeholder="HH:MM"
                    placeholderTextColor={COLORS.darkGray}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ملاحظات</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={newFollowup.notes}
                    onChangeText={(text) => setNewFollowup(prev => ({ ...prev, notes: text }))}
                    placeholder="أدخل ملاحظات المتابعة"
                    placeholderTextColor={COLORS.darkGray}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={addNewFollowup}
                >
                  <Text style={styles.saveButtonText}>إضافة</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  followupsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  followupCard: {
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
  cancelledCard: {
    opacity: 0.6,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  followupHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  followupInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  followupIcon: {
    fontSize: 20,
  },
  followupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  followupType: {
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
  description: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginBottom: 4,
  },
  veterinarian: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  modalBody: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'right',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  activeTypeButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  activeTypeButtonText: {
    color: COLORS.white,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.darkGray,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});