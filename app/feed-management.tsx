import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import Button from "../components/Button";
import {
  ArrowRight,
  Package,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Truck,
  Scale,
  Clock,
  Target,
} from 'lucide-react-native';
import { FeedConsumption, PoultryBatch } from "../types";

const { width } = Dimensions.get('window');

interface FeedStock {
  id: string;
  feedType: 'starter' | 'grower' | 'finisher' | 'layer';
  brand: string;
  currentStock: number;
  minStock: number;
  lastRestockDate: string;
  costPerKg: number;
}

interface FeedFormData {
  batchId: string;
  feedType: 'starter' | 'grower' | 'finisher' | 'layer';
  brand: string;
  quantity: string;
  cost: string;
  notes: string;
}

export default function FeedManagementScreen() {
  const { t } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [batches, setBatches] = useState<PoultryBatch[]>([]);
  const [feedStock, setFeedStock] = useState<FeedStock[]>([]);
  const [recentConsumption, setRecentConsumption] = useState<FeedConsumption[]>([]);
  const [formData, setFormData] = useState<FeedFormData>({
    batchId: '',
    feedType: 'starter',
    brand: '',
    quantity: '',
    cost: '',
    notes: '',
  });

  const feedTypes = [
    { id: 'starter', title: 'بادئ', description: '0-10 أيام', color: COLORS.success },
    { id: 'grower', title: 'نامي', description: '11-24 يوم', color: COLORS.primary },
    { id: 'finisher', title: 'ناهي', description: '25+ يوم', color: COLORS.warning },
    { id: 'layer', title: 'بياض', description: 'دجاج البيض', color: COLORS.purple },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock data
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
          createdAt: '2024-01-01',
          updatedAt: '2024-01-25',
        },
      ];

      const mockFeedStock: FeedStock[] = [
        {
          id: '1',
          feedType: 'starter',
          brand: 'الأعلاف المتقدمة',
          currentStock: 500,
          minStock: 200,
          lastRestockDate: '2024-01-20',
          costPerKg: 15,
        },
        {
          id: '2',
          feedType: 'grower',
          brand: 'الأعلاف المتقدمة',
          currentStock: 150,
          minStock: 300,
          lastRestockDate: '2024-01-15',
          costPerKg: 14,
        },
        {
          id: '3',
          feedType: 'finisher',
          brand: 'الأعلاف المتقدمة',
          currentStock: 800,
          minStock: 400,
          lastRestockDate: '2024-01-22',
          costPerKg: 13,
        },
      ];

      const mockConsumption: FeedConsumption[] = [
        {
          id: '1',
          batchId: '1',
          feedType: 'starter',
          brand: 'الأعلاف المتقدمة',
          quantity: 50,
          cost: 750,
          feedDate: '2024-01-25',
          createdAt: '2024-01-25',
        },
        {
          id: '2',
          batchId: '1',
          feedType: 'grower',
          brand: 'الأعلاف المتقدمة',
          quantity: 75,
          cost: 1050,
          feedDate: '2024-01-24',
          createdAt: '2024-01-24',
        },
      ];

      setBatches(mockBatches);
      setFeedStock(mockFeedStock);
      setRecentConsumption(mockConsumption);
    } catch (error) {
      console.error('Error loading feed data:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل بيانات العلف');
    }
  };

  const handleInputChange = (field: keyof FeedFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddFeed = async () => {
    if (!formData.batchId || !formData.quantity || !formData.cost) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      console.log('Adding feed consumption:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('تم بنجاح', 'تم إضافة سجل العلف');
      setShowAddForm(false);
      setFormData({
        batchId: '',
        feedType: 'starter',
        brand: '',
        quantity: '',
        cost: '',
        notes: '',
      });
      loadData();
    } catch (error) {
      console.error('Error adding feed:', error);
      Alert.alert('خطأ', 'حدث خطأ في إضافة سجل العلف');
    } finally {
      setLoading(false);
    }
  };

  const getFeedTypeInfo = (type: string) => {
    return feedTypes.find(f => f.id === type) || feedTypes[0];
  };

  const getStockStatus = (stock: FeedStock) => {
    if (stock.currentStock <= stock.minStock) {
      return { status: 'low', color: COLORS.error, text: 'منخفض' };
    } else if (stock.currentStock <= stock.minStock * 1.5) {
      return { status: 'medium', color: COLORS.warning, text: 'متوسط' };
    } else {
      return { status: 'good', color: COLORS.success, text: 'جيد' };
    }
  };

  const renderStockCard = (stock: FeedStock) => {
    const feedInfo = getFeedTypeInfo(stock.feedType);
    const stockStatus = getStockStatus(stock);

    return (
      <View key={stock.id} style={[styles.stockCard, { borderLeftColor: feedInfo.color }]}>
        <View style={styles.stockHeader}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockFeedType}>{feedInfo.title}</Text>
            <Text style={styles.stockBrand}>{stock.brand}</Text>
          </View>
          <View style={[styles.stockStatus, { backgroundColor: stockStatus.color + '20' }]}>
            <Text style={[styles.stockStatusText, { color: stockStatus.color }]}>
              {stockStatus.text}
            </Text>
          </View>
        </View>
        
        <View style={styles.stockDetails}>
          <View style={styles.stockDetail}>
            <Scale size={16} color={COLORS.primary} />
            <Text style={styles.stockDetailText}>{stock.currentStock} كجم</Text>
          </View>
          <View style={styles.stockDetail}>
            <DollarSign size={16} color={COLORS.success} />
            <Text style={styles.stockDetailText}>{stock.costPerKg} ر.س/كجم</Text>
          </View>
          <View style={styles.stockDetail}>
            <Calendar size={16} color={COLORS.darkGray} />
            <Text style={styles.stockDetailText}>{new Date(stock.lastRestockDate).toLocaleDateString('ar-SA')}</Text>
          </View>
        </View>

        {stock.currentStock <= stock.minStock && (
          <View style={styles.lowStockAlert}>
            <AlertTriangle size={16} color={COLORS.error} />
            <Text style={styles.lowStockText}>يحتاج إعادة تموين</Text>
          </View>
        )}
      </View>
    );
  };

  const renderConsumptionCard = (consumption: FeedConsumption) => {
    const feedInfo = getFeedTypeInfo(consumption.feedType);
    
    return (
      <View key={consumption.id} style={styles.consumptionCard}>
        <View style={styles.consumptionHeader}>
          <View style={styles.consumptionInfo}>
            <Text style={styles.consumptionDate}>{new Date(consumption.feedDate).toLocaleDateString('ar-SA')}</Text>
            <Text style={styles.consumptionType}>{feedInfo.title} - {consumption.brand}</Text>
          </View>
          <View style={styles.consumptionAmounts}>
            <Text style={styles.consumptionQuantity}>{consumption.quantity} كجم</Text>
            <Text style={styles.consumptionCost}>{consumption.cost.toLocaleString()} ر.س</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowRight size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة العلف</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Feed Stock Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مخزون العلف</Text>
          <View style={styles.stockContainer}>
            {feedStock.map(renderStockCard)}
          </View>
        </View>

        {/* Add Feed Form */}
        {showAddForm && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>إضافة سجل علف</Text>
            <View style={styles.formContainer}>
              {/* Batch Selection */}
              <Text style={styles.fieldLabel}>الدفعة</Text>
              <View style={styles.batchSelector}>
                {batches.map(batch => (
                  <TouchableOpacity
                    key={batch.id}
                    style={[
                      styles.batchOption,
                      formData.batchId === batch.id && styles.selectedBatchOption,
                    ]}
                    onPress={() => handleInputChange('batchId', batch.id)}
                  >
                    <Text style={[
                      styles.batchOptionText,
                      formData.batchId === batch.id && styles.selectedBatchOptionText,
                    ]}>
                      {batch.batchNumber}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Feed Type */}
              <Text style={styles.fieldLabel}>نوع العلف</Text>
              <View style={styles.feedTypeSelector}>
                {feedTypes.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.feedTypeOption,
                      formData.feedType === type.id && { borderColor: type.color, backgroundColor: type.color + '10' },
                    ]}
                    onPress={() => handleInputChange('feedType', type.id)}
                  >
                    <Text style={[
                      styles.feedTypeTitle,
                      formData.feedType === type.id && { color: type.color },
                    ]}>
                      {type.title}
                    </Text>
                    <Text style={styles.feedTypeDescription}>{type.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Brand */}
              <Text style={styles.fieldLabel}>العلامة التجارية</Text>
              <View style={styles.inputContainer}>
                <Package size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.textInput}
                  placeholder="اسم العلامة التجارية"
                  value={formData.brand}
                  onChangeText={(value) => handleInputChange('brand', value)}
                  textAlign="right"
                  placeholderTextColor={COLORS.lightGray}
                />
              </View>

              {/* Quantity and Cost */}
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Scale size={20} color={COLORS.primary} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="الكمية (كجم)"
                    value={formData.quantity}
                    onChangeText={(value) => handleInputChange('quantity', value)}
                    keyboardType="numeric"
                    textAlign="right"
                    placeholderTextColor={COLORS.lightGray}
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <DollarSign size={20} color={COLORS.success} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="التكلفة (ر.س)"
                    value={formData.cost}
                    onChangeText={(value) => handleInputChange('cost', value)}
                    keyboardType="numeric"
                    textAlign="right"
                    placeholderTextColor={COLORS.lightGray}
                  />
                </View>
              </View>

              {/* Notes */}
              <Text style={styles.fieldLabel}>ملاحظات (اختياري)</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="أي ملاحظات إضافية"
                  value={formData.notes}
                  onChangeText={(value) => handleInputChange('notes', value)}
                  multiline
                  numberOfLines={3}
                  textAlign="right"
                  textAlignVertical="top"
                  placeholderTextColor={COLORS.lightGray}
                />
              </View>

              <Button
                title="إضافة سجل العلف"
                onPress={handleAddFeed}
                type="primary"
                size="large"
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
              />
            </View>
          </View>
        )}

        {/* Recent Consumption */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الاستهلاك الأخير</Text>
          <View style={styles.consumptionContainer}>
            {recentConsumption.length > 0 ? (
              recentConsumption.map(renderConsumptionCard)
            ) : (
              <View style={styles.emptyState}>
                <Package size={48} color={COLORS.lightGray} />
                <Text style={styles.emptyStateText}>لا توجد سجلات استهلاك</Text>
                <Text style={styles.emptyStateSubtext}>ابدأ بإضافة سجل العلف الأول</Text>
              </View>
            )}
          </View>
        </View>

        {/* Feed Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تحليلات العلف</Text>
          <View style={styles.analyticsContainer}>
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <BarChart3 size={24} color={COLORS.primary} />
                <Text style={styles.analyticsTitle}>معدل الاستهلاك اليومي</Text>
              </View>
              <Text style={styles.analyticsValue}>125 كجم/يوم</Text>
              <Text style={styles.analyticsSubtext}>متوسط آخر 7 أيام</Text>
            </View>

            <View style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <Target size={24} color={COLORS.success} />
                <Text style={styles.analyticsTitle}>معدل التحويل الغذائي</Text>
              </View>
              <Text style={styles.analyticsValue}>1.8</Text>
              <Text style={styles.analyticsSubtext}>كجم علف/كجم وزن</Text>
            </View>

            <View style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <DollarSign size={24} color={COLORS.warning} />
                <Text style={styles.analyticsTitle}>تكلفة العلف الشهرية</Text>
              </View>
              <Text style={styles.analyticsValue}>54,000 ر.س</Text>
              <Text style={styles.analyticsSubtext}>91% من إجمالي التكاليف</Text>
            </View>

            <View style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <Clock size={24} color={COLORS.info} />
                <Text style={styles.analyticsTitle}>المخزون المتبقي</Text>
              </View>
              <Text style={styles.analyticsValue}>12 يوم</Text>
              <Text style={styles.analyticsSubtext}>بمعدل الاستهلاك الحالي</Text>
            </View>
          </View>
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
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
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
  stockContainer: {
    gap: 12,
  },
  stockCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stockHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockInfo: {
    flex: 1,
  },
  stockFeedType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  stockBrand: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginTop: 2,
  },
  stockStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockDetails: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  stockDetail: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  stockDetailText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginRight: 4,
  },
  lowStockAlert: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: COLORS.error + '10',
    borderRadius: 8,
  },
  lowStockText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
    marginRight: 4,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  batchSelector: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  batchOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedBatchOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  batchOptionText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  selectedBatchOptionText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  feedTypeSelector: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  feedTypeOption: {
    width: (width - 80) / 2,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  feedTypeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  feedTypeDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    marginRight: 8,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: (width - 80) / 2,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 16,
  },
  consumptionContainer: {
    gap: 12,
  },
  consumptionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consumptionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consumptionInfo: {
    flex: 1,
  },
  consumptionDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  consumptionType: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginTop: 2,
  },
  consumptionAmounts: {
    alignItems: 'flex-end',
  },
  consumptionQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  consumptionCost: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 2,
  },
  consumptionNotes: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginTop: 8,
    fontStyle: 'italic',
  },
  analyticsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: (width - 60) / 2,
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
  analyticsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  analyticsTitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginRight: 8,
    flex: 1,
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  analyticsSubtext: {
    fontSize: 10,
    color: COLORS.lightGray,
    textAlign: 'right',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
    marginTop: 4,
  },
});