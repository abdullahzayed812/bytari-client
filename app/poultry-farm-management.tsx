import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from "../constants/colors";
import Button from "../components/Button";
import {
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Plus,
  Users,
  Stethoscope,
  ShoppingCart,
  Edit3,
} from 'lucide-react-native';

interface WeeklyData {
  week: number;
  date: string;
  count: number;
  weight: number;
  feedConsumption: number;
  mortality: number;
  mortalityReason: string;
  treatments: string[];
  estimatedProfit: number;
}



export default function PoultryFarmManagementScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);

  const [showWeekModal, setShowWeekModal] = useState<boolean>(false);
  const [showSellModal, setShowSellModal] = useState<boolean>(false);
  const [showVetModal, setShowVetModal] = useState<boolean>(false);
  const [showSupervisorModal, setShowSupervisorModal] = useState<boolean>(false);
  const [assignedVet] = useState<string>('');
  const [assignedSupervisor] = useState<string>('');
  
  const [newWeekData, setNewWeekData] = useState<Partial<WeeklyData>>({
    count: 0,
    weight: 0,
    feedConsumption: 0,
    mortality: 0,
    mortalityReason: '',
    treatments: [],
    estimatedProfit: 0,
  });

  const farmInfo = {
    name: params.farmName as string || 'مزرعة الدواجن',
    location: params.location as string || 'الموصل',
    area: params.area as string || '500',
    establishmentDate: params.establishmentDate as string || '2025/1/1',
    initialChickCount: parseInt(params.initialChickCount as string) || 1000,
    pricePerChick: parseInt(params.pricePerChick as string) || 750,
  };

  useEffect(() => {
    // Initialize first week data
    if (weeklyData.length === 0) {
      const firstWeek: WeeklyData = {
        week: 1,
        date: '2025/8/15',
        count: farmInfo.initialChickCount,
        weight: 150,
        feedConsumption: 150,
        mortality: 0,
        mortalityReason: '',
        treatments: [],
        estimatedProfit: 0,
      };
      setWeeklyData([firstWeek]);
    }
  }, [weeklyData.length, farmInfo.initialChickCount]);

  const handleAddWeek = () => {
    if (currentWeek >= 8) {
      Alert.alert('تنبيه', 'لا يمكن إضافة أكثر من 8 أسابيع للدورة الواحدة');
      return;
    }

    const newWeek: WeeklyData = {
      week: currentWeek + 1,
      date: new Date().toLocaleDateString('ar-EG'),
      count: (newWeekData.count || 0),
      weight: (newWeekData.weight || 0),
      feedConsumption: (newWeekData.feedConsumption || 0),
      mortality: (newWeekData.mortality || 0),
      mortalityReason: newWeekData.mortalityReason || '',
      treatments: newWeekData.treatments || [],
      estimatedProfit: (newWeekData.estimatedProfit || 0),
    };

    setWeeklyData([...weeklyData, newWeek]);
    setCurrentWeek(currentWeek + 1);
    setShowWeekModal(false);
    setNewWeekData({});
  };

  const handleSell = () => {
    Alert.alert(
      'تأكيد البيع',
      'هل تريد بدء دورة جديدة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم',
          onPress: () => {
            setWeeklyData([]);
            setCurrentWeek(1);
            setShowSellModal(false);
            Alert.alert('تم', 'تم بيع الدورة وبدء دورة جديدة');
          }
        }
      ]
    );
  };

  const handleRequestVet = () => {
    Alert.alert('تم الإرسال', 'تم إرسال طلب تعيين طبيب للإدارة');
    setShowVetModal(false);
  };

  const handleRequestSupervisor = () => {
    Alert.alert('تم الإرسال', 'تم إرسال طلب إشراف للإدارة');
    setShowSupervisorModal(false);
  };

  const getCurrentWeekData = () => {
    return weeklyData.find(week => week.week === currentWeek) || weeklyData[weeklyData.length - 1];
  };

  const getTotalProfit = () => {
    return weeklyData.reduce((total, week) => total + week.estimatedProfit, 0);
  };

  const getTotalMortality = () => {
    return weeklyData.reduce((total, week) => total + week.mortality, 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{farmInfo.name}</Text>
        <TouchableOpacity style={styles.editButton}>
          <Edit3 size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Farm Info Card */}
        <View style={styles.farmInfoCard}>
          <View style={styles.farmInfoHeader}>
            <Text style={styles.farmName}>{farmInfo.name}</Text>
          </View>
          <View style={styles.farmInfoGrid}>
            <View style={styles.farmInfoItem}>
              <Text style={styles.farmInfoLabel}>المساحة</Text>
              <Text style={styles.farmInfoValue}>{farmInfo.area} متر</Text>
            </View>
            <View style={styles.farmInfoItem}>
              <Text style={styles.farmInfoLabel}>الموقع</Text>
              <Text style={styles.farmInfoValue}>{farmInfo.location}</Text>
            </View>
            <View style={styles.farmInfoItem}>
              <Text style={styles.farmInfoLabel}>تاريخ إنشاء المزرعة</Text>
              <Text style={styles.farmInfoValue}>{farmInfo.establishmentDate}</Text>
            </View>
          </View>
        </View>

        {/* Current Week Card */}
        {getCurrentWeekData() && (
          <View style={styles.weekCard}>
            <Text style={styles.weekTitle}>الأسبوع {getCurrentWeekData()?.week}</Text>
            <Text style={styles.weekDate}>{getCurrentWeekData()?.date}</Text>
            
            <View style={styles.weekDataGrid}>
              <View style={styles.weekDataItem}>
                <Text style={styles.weekDataLabel}>العدد</Text>
                <Text style={styles.weekDataValue}>{getCurrentWeekData()?.count}</Text>
              </View>
              <View style={styles.weekDataItem}>
                <Text style={styles.weekDataLabel}>وزن الفرد</Text>
                <Text style={styles.weekDataValue}>{getCurrentWeekData()?.weight} غرام</Text>
              </View>
              <View style={styles.weekDataItem}>
                <Text style={styles.weekDataLabel}>الاستهلاك اليومي للعلف</Text>
                <Text style={styles.weekDataValue}>{getCurrentWeekData()?.feedConsumption} كغم</Text>
              </View>
              <View style={styles.weekDataItem}>
                <Text style={styles.weekDataLabel}>سعر الفرد</Text>
                <Text style={styles.weekDataValue}>{farmInfo.pricePerChick} دينار عراقي</Text>
              </View>
            </View>

            {getCurrentWeekData()?.treatments && getCurrentWeekData()?.treatments.length > 0 && (
              <View style={styles.treatmentsSection}>
                <Text style={styles.treatmentsTitle}>اللقاحات</Text>
                {getCurrentWeekData()?.treatments.map((treatment, index) => (
                  <View key={index} style={styles.treatmentItem}>
                    <Text style={styles.treatmentName}>{treatment}</Text>
                    <Text style={styles.treatmentType}>هولندي</Text>
                    <Text style={styles.treatmentDate}>{getCurrentWeekData()?.date}</Text>
                  </View>
                ))}
              </View>
            )}

            {getCurrentWeekData()?.mortality > 0 && (
              <View style={styles.mortalitySection}>
                <Text style={styles.mortalityTitle}>النفوق</Text>
                <View style={styles.mortalityItem}>
                  <Text style={styles.mortalityCount}>اليومي: {getCurrentWeekData()?.mortality}</Text>
                  <Text style={styles.mortalityReason}>السبب: {getCurrentWeekData()?.mortalityReason}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Statistics Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#10B981" />
            <Text style={styles.statValue}>{getTotalProfit().toLocaleString()}</Text>
            <Text style={styles.statLabel}>الربح الإجمالي</Text>
          </View>
          <View style={styles.statCard}>
            <AlertTriangle size={24} color="#EF4444" />
            <Text style={styles.statValue}>{getTotalMortality()}</Text>
            <Text style={styles.statLabel}>إجمالي النفوق</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="إضافة أسبوع جديد"
            onPress={() => setShowWeekModal(true)}
            type="primary"
            size="large"
            icon={<Plus size={20} color={COLORS.white} />}
            style={styles.addWeekButton}
            disabled={currentWeek >= 8}
          />

          <Button
            title="بيع الدورة"
            onPress={() => setShowSellModal(true)}
            type="secondary"
            size="large"
            icon={<ShoppingCart size={20} color={COLORS.primary} />}
            style={styles.sellButton}
          />
        </View>

        {/* Supervision Section */}
        <View style={styles.supervisionCard}>
          <Text style={styles.supervisionTitle}>المتابعة والإشراف</Text>
          
          {assignedVet && (
            <View style={styles.assignedItem}>
              <Stethoscope size={20} color="#10B981" />
              <Text style={styles.assignedText}>الطبيب المتابع: {assignedVet}</Text>
            </View>
          )}
          
          {assignedSupervisor && (
            <View style={styles.assignedItem}>
              <Users size={20} color="#3B82F6" />
              <Text style={styles.assignedText}>المشرف: {assignedSupervisor}</Text>
            </View>
          )}

          <View style={styles.supervisionButtons}>
            <Button
              title="تعيين طبيب لمتابعة الدواجن عن بعد"
              onPress={() => setShowVetModal(true)}
              type="primary"
              size="medium"
              icon={<Stethoscope size={16} color={COLORS.white} />}
              style={styles.vetButton}
            />
            
            <Button
              title="طلب إشراف"
              onPress={() => setShowSupervisorModal(true)}
              type="secondary"
              size="medium"
              icon={<Users size={16} color={COLORS.primary} />}
              style={styles.supervisorButton}
            />
          </View>
        </View>
      </ScrollView>

      {/* Add Week Modal */}
      <Modal visible={showWeekModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إضافة الأسبوع {currentWeek + 1}</Text>
            
            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>العدد</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newWeekData.count?.toString() || ''}
                  onChangeText={(value) => setNewWeekData({...newWeekData, count: parseInt(value) || 0})}
                  keyboardType="numeric"
                  placeholder="أدخل العدد"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>وزن الفرد (غرام)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newWeekData.weight?.toString() || ''}
                  onChangeText={(value) => setNewWeekData({...newWeekData, weight: parseInt(value) || 0})}
                  keyboardType="numeric"
                  placeholder="أدخل الوزن"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>استهلاك العلف (كغم)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newWeekData.feedConsumption?.toString() || ''}
                  onChangeText={(value) => setNewWeekData({...newWeekData, feedConsumption: parseInt(value) || 0})}
                  keyboardType="numeric"
                  placeholder="أدخل كمية العلف"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>النفوق</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newWeekData.mortality?.toString() || ''}
                  onChangeText={(value) => setNewWeekData({...newWeekData, mortality: parseInt(value) || 0})}
                  keyboardType="numeric"
                  placeholder="أدخل عدد النفوق"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>سبب النفوق</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newWeekData.mortalityReason || ''}
                  onChangeText={(value) => setNewWeekData({...newWeekData, mortalityReason: value})}
                  placeholder="أدخل سبب النفوق"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الربح المقدر</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newWeekData.estimatedProfit?.toString() || ''}
                  onChangeText={(value) => setNewWeekData({...newWeekData, estimatedProfit: parseInt(value) || 0})}
                  keyboardType="numeric"
                  placeholder="أدخل الربح المقدر"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                title="إلغاء"
                onPress={() => setShowWeekModal(false)}
                type="secondary"
                size="medium"
                style={styles.modalCancelButton}
              />
              <Button
                title="إضافة"
                onPress={handleAddWeek}
                type="primary"
                size="medium"
                style={styles.modalAddButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Sell Modal */}
      <Modal visible={showSellModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.alertModal}>
            <Text style={styles.alertTitle}>بيع الدورة</Text>
            <Text style={styles.alertMessage}>
              هل تريد بيع الدورة الحالية وبدء دورة جديدة؟
            </Text>
            <View style={styles.alertButtons}>
              <Button
                title="إلغاء"
                onPress={() => setShowSellModal(false)}
                type="secondary"
                size="medium"
              />
              <Button
                title="بيع"
                onPress={handleSell}
                type="primary"
                size="medium"
                style={styles.sellConfirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Vet Request Modal */}
      <Modal visible={showVetModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.alertModal}>
            <Stethoscope size={48} color="#10B981" style={styles.alertIcon} />
            <Text style={styles.alertTitle}>تعيين طبيب</Text>
            <Text style={styles.alertMessage}>
              سيتم إرسال طلب تعيين طبيب لمتابعة الحقل عن بعد. سيتم تحصيل رسوم عن كل وجبة إدخال.
            </Text>
            <View style={styles.alertButtons}>
              <Button
                title="إلغاء"
                onPress={() => setShowVetModal(false)}
                type="secondary"
                size="medium"
              />
              <Button
                title="إرسال الطلب"
                onPress={handleRequestVet}
                type="primary"
                size="medium"
                style={styles.vetConfirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Supervisor Request Modal */}
      <Modal visible={showSupervisorModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.alertModal}>
            <Users size={48} color="#3B82F6" style={styles.alertIcon} />
            <Text style={styles.alertTitle}>طلب إشراف</Text>
            <Text style={styles.alertMessage}>
              سيتم إرسال طلب إشراف مجاني عبر عقد خارجي لمتابعة الحقل.
            </Text>
            <View style={styles.alertButtons}>
              <Button
                title="إلغاء"
                onPress={() => setShowSupervisorModal(false)}
                type="secondary"
                size="medium"
              />
              <Button
                title="إرسال الطلب"
                onPress={handleRequestSupervisor}
                type="primary"
                size="medium"
                style={styles.supervisorConfirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#10B981',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  farmInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  farmInfoHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  farmName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
  },
  farmInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  farmInfoItem: {
    width: '48%',
    marginBottom: 12,
  },
  farmInfoLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: 'right',
  },
  farmInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'right',
  },
  weekCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 4,
  },
  weekDate: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 16,
  },
  weekDataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  weekDataItem: {
    width: '48%',
    marginBottom: 12,
  },
  weekDataLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: 'right',
  },
  weekDataValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  treatmentsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  treatmentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 12,
    textAlign: 'right',
  },
  treatmentItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    marginBottom: 8,
  },
  treatmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  treatmentType: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  treatmentDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  mortalitySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  mortalityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'right',
  },
  mortalityItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  mortalityCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
  mortalityReason: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  actionButtons: {
    marginBottom: 16,
  },
  addWeekButton: {
    backgroundColor: '#10B981',
    marginBottom: 12,
  },
  sellButton: {
    borderColor: '#EF4444',
  },
  supervisionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supervisionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  assignedItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    marginBottom: 12,
  },
  assignedText: {
    fontSize: 14,
    color: COLORS.black,
    marginRight: 8,
  },
  supervisionButtons: {
    gap: 12,
  },
  vetButton: {
    backgroundColor: '#10B981',
  },
  supervisorButton: {
    borderColor: '#3B82F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalForm: {
    maxHeight: 400,
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
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  alertModal: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  alertIcon: {
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  sellConfirmButton: {
    backgroundColor: '#EF4444',
  },
  vetConfirmButton: {
    backgroundColor: '#10B981',
  },
  supervisorConfirmButton: {
    backgroundColor: '#3B82F6',
  },
});