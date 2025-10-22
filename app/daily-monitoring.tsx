import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import Button from "../components/Button";
import {
  ArrowRight,
  Thermometer,
  Droplets,
  AlertTriangle,
  Package,
  Activity,
  Camera,
  Save,
  Calendar,
  Egg,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react-native';
import { DailyMonitoring, PoultryBatch } from "../types";

const { width } = Dimensions.get('window');

interface MonitoringFormData {
  batchId: string;
  temperature: string;
  humidity: string;
  mortality: string;
  feedConsumption: string;
  waterConsumption: string;
  eggProduction: string;
  averageWeight: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  behaviorNotes: string;
  environmentNotes: string;
}

export default function DailyMonitoringScreen() {
  const { t } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [batches, setBatches] = useState<PoultryBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<PoultryBatch | null>(null);
  const [formData, setFormData] = useState<MonitoringFormData>({
    batchId: '',
    temperature: '',
    humidity: '',
    mortality: '0',
    feedConsumption: '',
    waterConsumption: '',
    eggProduction: '0',
    averageWeight: '',
    healthStatus: 'good',
    behaviorNotes: '',
    environmentNotes: '',
  });

  const healthStatuses = [
    { id: 'excellent', title: 'ممتاز', color: COLORS.success, icon: <TrendingUp size={20} color={COLORS.success} /> },
    { id: 'good', title: 'جيد', color: COLORS.primary, icon: <Activity size={20} color={COLORS.primary} /> },
    { id: 'fair', title: 'مقبول', color: COLORS.warning, icon: <Minus size={20} color={COLORS.warning} /> },
    { id: 'poor', title: 'ضعيف', color: COLORS.error, icon: <TrendingDown size={20} color={COLORS.error} /> },
  ];

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      // Mock data - في التطبيق الحقيقي سيتم جلب البيانات من API
      const mockBatches: PoultryBatch[] = [
        {
          id: '1',
          farmId: '1',
          batchNumber: 'B-2024-001',
          birdType: 'chicken',
          breed: 'روس 308',
          initialCount: 2000,
          currentCount: 1950,
          ageInDays: 25,
          averageWeight: 1200,
          startDate: '2024-01-01',
          expectedHarvestDate: '2024-02-15',
          status: 'active',
          mortality: 50,
          notes: 'نمو جيد، صحة ممتازة',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-25',
        },
        {
          id: '2',
          farmId: '2',
          batchNumber: 'L-2024-001',
          birdType: 'chicken',
          breed: 'هايلاين براون',
          initialCount: 1000,
          currentCount: 980,
          ageInDays: 120,
          averageWeight: 1800,
          startDate: '2023-09-01',
          status: 'active',
          mortality: 20,
          notes: 'إنتاج بيض ممتاز',
          createdAt: '2023-09-01',
          updatedAt: '2024-01-25',
        },
      ];

      setBatches(mockBatches);
      if (mockBatches.length > 0) {
        setSelectedBatch(mockBatches[0]);
        setFormData(prev => ({ ...prev, batchId: mockBatches[0].id }));
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل الدفعات');
    }
  };

  const handleInputChange = (field: keyof MonitoringFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBatchSelect = (batch: PoultryBatch) => {
    setSelectedBatch(batch);
    setFormData(prev => ({
      ...prev,
      batchId: batch.id,
      averageWeight: batch.averageWeight?.toString() || '',
    }));
  };

  const handleHealthStatusSelect = (status: 'excellent' | 'good' | 'fair' | 'poor') => {
    setFormData(prev => ({
      ...prev,
      healthStatus: status,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.batchId) {
      Alert.alert('خطأ', 'يرجى اختيار الدفعة');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // في التطبيق الحقيقي، سيتم إرسال البيانات إلى API
      console.log('Saving daily monitoring:', formData);
      
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'تم بنجاح',
        'تم حفظ بيانات المراقبة اليومية',
        [
          {
            text: 'موافق',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving monitoring data:', error);
      Alert.alert('خطأ', 'حدث خطأ في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const renderBatchCard = (batch: PoultryBatch) => (
    <TouchableOpacity
      key={batch.id}
      style={[
        styles.batchCard,
        selectedBatch?.id === batch.id && styles.selectedBatchCard,
      ]}
      onPress={() => handleBatchSelect(batch)}
      activeOpacity={0.7}
    >
      <View style={styles.batchHeader}>
        <Text style={styles.batchNumber}>{batch.batchNumber}</Text>
        <View style={styles.batchInfo}>
          <Text style={styles.batchAge}>{batch.ageInDays} يوم</Text>
          <Text style={styles.batchCount}>{batch.currentCount.toLocaleString()} طائر</Text>
        </View>
      </View>
      <Text style={styles.batchBreed}>{batch.breed}</Text>
    </TouchableOpacity>
  );

  const renderHealthStatusCard = (status: typeof healthStatuses[0]) => (
    <TouchableOpacity
      key={status.id}
      style={[
        styles.healthStatusCard,
        formData.healthStatus === status.id && {
          borderColor: status.color,
          backgroundColor: status.color + '10',
        },
      ]}
      onPress={() => handleHealthStatusSelect(status.id as 'excellent' | 'good' | 'fair' | 'poor')}
      activeOpacity={0.7}
    >
      {status.icon}
      <Text style={[styles.healthStatusText, formData.healthStatus === status.id && { color: status.color }]}>
        {status.title}
      </Text>
    </TouchableOpacity>
  );

  const renderMetricCard = (title: string, value: string, unit: string, icon: React.ReactNode, color: string) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <View style={styles.metricContent}>
          <Text style={styles.metricValue}>{value} {unit}</Text>
          <Text style={styles.metricTitle}>{title}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowRight size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المراقبة اليومية</Text>
        <TouchableOpacity style={styles.cameraButton} onPress={() => Alert.alert('قريباً', 'إضافة الصور ستكون متاحة قريباً')}>
          <Camera size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Calendar size={20} color={COLORS.primary} />
          <Text style={styles.dateText}>{new Date().toLocaleDateString('ar-SA')}</Text>
        </View>

        {/* Batch Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اختر الدفعة</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.batchesScroll}>
            {batches.map(renderBatchCard)}
          </ScrollView>
        </View>

        {selectedBatch && (
          <>
            {/* Current Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>المؤشرات الحالية</Text>
              <View style={styles.metricsGrid}>
                {renderMetricCard('العدد الحالي', selectedBatch.currentCount.toLocaleString(), 'طائر', <Activity size={16} color={COLORS.primary} />, COLORS.primary)}
                {renderMetricCard('العمر', selectedBatch.ageInDays.toString(), 'يوم', <Calendar size={16} color={COLORS.info} />, COLORS.info)}
                {renderMetricCard('الوزن المتوسط', (selectedBatch.averageWeight || 0).toString(), 'جم', <TrendingUp size={16} color={COLORS.success} />, COLORS.success)}
                {renderMetricCard('النفوق الإجمالي', selectedBatch.mortality.toString(), 'طائر', <AlertTriangle size={16} color={COLORS.error} />, COLORS.error)}
              </View>
            </View>

            {/* Environmental Conditions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الظروف البيئية</Text>
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Thermometer size={20} color={COLORS.error} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="درجة الحرارة (°م)"
                    value={formData.temperature}
                    onChangeText={(value) => handleInputChange('temperature', value)}
                    keyboardType="numeric"
                    textAlign="right"
                    placeholderTextColor={COLORS.lightGray}
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Droplets size={20} color={COLORS.info} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="الرطوبة (%)"
                    value={formData.humidity}
                    onChangeText={(value) => handleInputChange('humidity', value)}
                    keyboardType="numeric"
                    textAlign="right"
                    placeholderTextColor={COLORS.lightGray}
                  />
                </View>
              </View>
            </View>

            {/* Daily Records */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>السجلات اليومية</Text>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <AlertTriangle size={20} color={COLORS.error} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="النفوق اليومي"
                    value={formData.mortality}
                    onChangeText={(value) => handleInputChange('mortality', value)}
                    keyboardType="numeric"
                    textAlign="right"
                    placeholderTextColor={COLORS.lightGray}
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Package size={20} color={COLORS.success} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="استهلاك العلف (كجم)"
                    value={formData.feedConsumption}
                    onChangeText={(value) => handleInputChange('feedConsumption', value)}
                    keyboardType="numeric"
                    textAlign="right"
                    placeholderTextColor={COLORS.lightGray}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Droplets size={20} color={COLORS.info} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="استهلاك الماء (لتر)"
                    value={formData.waterConsumption}
                    onChangeText={(value) => handleInputChange('waterConsumption', value)}
                    keyboardType="numeric"
                    textAlign="right"
                    placeholderTextColor={COLORS.lightGray}
                  />
                </View>
                {selectedBatch.birdType === 'chicken' && selectedBatch.ageInDays > 120 && (
                  <View style={[styles.inputContainer, styles.halfInput]}>
                    <Egg size={20} color={COLORS.yellow} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="إنتاج البيض"
                      value={formData.eggProduction}
                      onChangeText={(value) => handleInputChange('eggProduction', value)}
                      keyboardType="numeric"
                      textAlign="right"
                      placeholderTextColor={COLORS.lightGray}
                    />
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <TrendingUp size={20} color={COLORS.primary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="الوزن المتوسط (جم)"
                  value={formData.averageWeight}
                  onChangeText={(value) => handleInputChange('averageWeight', value)}
                  keyboardType="numeric"
                  textAlign="right"
                  placeholderTextColor={COLORS.lightGray}
                />
              </View>
            </View>

            {/* Health Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الحالة الصحية العامة</Text>
              <View style={styles.healthStatusGrid}>
                {healthStatuses.map(renderHealthStatusCard)}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ملاحظات</Text>
              
              <View style={styles.notesContainer}>
                <Text style={styles.noteLabel}>ملاحظات السلوك</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="سجل أي ملاحظات حول سلوك الطيور"
                    value={formData.behaviorNotes}
                    onChangeText={(value) => handleInputChange('behaviorNotes', value)}
                    multiline
                    numberOfLines={3}
                    textAlign="right"
                    textAlignVertical="top"
                    placeholderTextColor={COLORS.lightGray}
                  />
                </View>
              </View>

              <View style={styles.notesContainer}>
                <Text style={styles.noteLabel}>ملاحظات البيئة</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="سجل أي ملاحظات حول البيئة والمرافق"
                    value={formData.environmentNotes}
                    onChangeText={(value) => handleInputChange('environmentNotes', value)}
                    multiline
                    numberOfLines={3}
                    textAlign="right"
                    textAlignVertical="top"
                    placeholderTextColor={COLORS.lightGray}
                  />
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <View style={styles.submitSection}>
              <Button
                title="حفظ السجل اليومي"
                onPress={handleSubmit}
                type="primary"
                size="large"
                loading={loading}
                disabled={loading}
                icon={<Save size={20} color={COLORS.white} />}
                style={styles.submitButton}
              />
            </View>
          </>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  cameraButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '10',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  dateHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginRight: 8,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  batchesScroll: {
    marginBottom: 8,
  },
  batchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 160,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  selectedBatchCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  batchHeader: {
    marginBottom: 8,
  },
  batchNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  batchInfo: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  batchAge: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  batchCount: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  batchBreed: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: 'right',
  },
  metricsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 60) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  metricHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  metricTitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    marginRight: 12,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: (width - 60) / 2,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  healthStatusGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  healthStatusCard: {
    width: (width - 60) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  healthStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: 8,
    textAlign: 'center',
  },
  notesContainer: {
    marginBottom: 16,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  submitSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  submitButton: {
    width: '100%',
  },
});