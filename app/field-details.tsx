import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Users, Activity, AlertTriangle, TrendingUp, FileText, Camera, MessageCircle, Phone } from 'lucide-react-native';

interface DailyReport {
  id: string;
  date: string;
  feedConsumption: number;
  waterConsumption: number;
  temperature: number;
  humidity: number;
  mortality: number;
  notes: string;
  images: string[];
  treatments: string[];
  vaccinations: string[];
}

interface WeeklyData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  averageWeight: number;
  totalMortality: number;
  feedEfficiency: number;
  healthScore: number;
  notes: string;
}

export default function FieldDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // Mock field detailed data
  const [fieldData] = useState({
    id: 'field1',
    name: 'حقل الدواجن النموذجي',
    location: 'بغداد - الدورة',
    ownerName: 'أحمد محمد علي',
    ownerPhone: '+964 770 123 4567',
    currentBatch: {
      batchNumber: 3,
      startDate: '2024-01-15',
      currentCount: 485,
      initialCount: 500,
      chicksAge: 21,
      averageWeight: 400,
      totalMortality: 15,
      healthStatus: 'good'
    },
    dailyReports: [
      {
        id: 'report1',
        date: '2024-02-05',
        feedConsumption: 45,
        waterConsumption: 80,
        temperature: 32,
        humidity: 65,
        mortality: 2,
        notes: 'الطيور في حالة جيدة، لوحظ نشاط طبيعي. تم فحص العينات وكانت النتائج مطمئنة.',
        images: [
          'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400',
          'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400'
        ],
        treatments: ['فيتامين C', 'مضاد حيوي وقائي'],
        vaccinations: []
      },
      {
        id: 'report2',
        date: '2024-02-04',
        feedConsumption: 43,
        waterConsumption: 78,
        temperature: 31,
        humidity: 68,
        mortality: 1,
        notes: 'تم تطبيق اللقاح الأسبوعي، لا توجد مشاكل صحية. الطيور تتفاعل بشكل جيد مع العلف الجديد.',
        images: [],
        treatments: [],
        vaccinations: ['لقاح النيوكاسل']
      },
      {
        id: 'report3',
        date: '2024-02-03',
        feedConsumption: 41,
        waterConsumption: 75,
        temperature: 30,
        humidity: 70,
        mortality: 0,
        notes: 'يوم ممتاز، لا توجد وفيات. الطيور نشطة وتأكل بشهية جيدة.',
        images: ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400'],
        treatments: [],
        vaccinations: []
      }
    ],
    weeklyData: [
      {
        weekNumber: 3,
        startDate: '2024-01-29',
        endDate: '2024-02-05',
        averageWeight: 400,
        totalMortality: 8,
        feedEfficiency: 1.8,
        healthScore: 85,
        notes: 'أسبوع جيد بشكل عام، نمو مستقر'
      },
      {
        weekNumber: 2,
        startDate: '2024-01-22',
        endDate: '2024-01-28',
        averageWeight: 280,
        totalMortality: 5,
        feedEfficiency: 1.6,
        healthScore: 88,
        notes: 'نمو ممتاز، لا توجد مشاكل صحية'
      },
      {
        weekNumber: 1,
        startDate: '2024-01-15',
        endDate: '2024-01-21',
        averageWeight: 150,
        totalMortality: 2,
        feedEfficiency: 1.4,
        healthScore: 90,
        notes: 'بداية ممتازة للدفعة'
      }
    ]
  });

  const [selectedTab, setSelectedTab] = useState<'daily' | 'weekly' | 'analysis'>('daily');

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#10B981';
      case 'good': return '#3B82F6';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return COLORS.darkGray;
    }
  };

  const renderDailyReport = ({ item }: { item: DailyReport }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportDate}>{item.date}</Text>
        <View style={styles.mortalityBadge}>
          <AlertTriangle size={14} color={COLORS.white} />
          <Text style={styles.mortalityText}>{item.mortality} نفوق</Text>
        </View>
      </View>
      
      <View style={styles.reportStats}>
        <View style={styles.reportStat}>
          <Text style={styles.reportStatLabel}>العلف</Text>
          <Text style={styles.reportStatValue}>{item.feedConsumption} كغ</Text>
        </View>
        <View style={styles.reportStat}>
          <Text style={styles.reportStatLabel}>الماء</Text>
          <Text style={styles.reportStatValue}>{item.waterConsumption} لتر</Text>
        </View>
        <View style={styles.reportStat}>
          <Text style={styles.reportStatLabel}>الحرارة</Text>
          <Text style={styles.reportStatValue}>{item.temperature}°C</Text>
        </View>
        <View style={styles.reportStat}>
          <Text style={styles.reportStatLabel}>الرطوبة</Text>
          <Text style={styles.reportStatValue}>{item.humidity}%</Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.reportNotes}>
          <Text style={styles.reportNotesTitle}>ملاحظات:</Text>
          <Text style={styles.reportNotesText}>{item.notes}</Text>
        </View>
      )}

      {(item.treatments.length > 0 || item.vaccinations.length > 0) && (
        <View style={styles.treatmentsSection}>
          {item.treatments.length > 0 && (
            <View style={styles.treatmentsList}>
              <Text style={styles.treatmentsTitle}>العلاجات:</Text>
              {item.treatments.map((treatment, index) => (
                <Text key={index} style={styles.treatmentItem}>• {treatment}</Text>
              ))}
            </View>
          )}
          {item.vaccinations.length > 0 && (
            <View style={styles.treatmentsList}>
              <Text style={styles.treatmentsTitle}>التطعيمات:</Text>
              {item.vaccinations.map((vaccination, index) => (
                <Text key={index} style={styles.treatmentItem}>• {vaccination}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {item.images.length > 0 && (
        <View style={styles.imagesSection}>
          <Text style={styles.imagesTitle}>الصور المرفقة:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {item.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.reportImage} />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderWeeklyData = ({ item }: { item: WeeklyData }) => (
    <View style={styles.weeklyCard}>
      <View style={styles.weeklyHeader}>
        <Text style={styles.weeklyTitle}>الأسبوع {item.weekNumber}</Text>
        <Text style={styles.weeklyDate}>{item.startDate} - {item.endDate}</Text>
      </View>
      
      <View style={styles.weeklyStats}>
        <View style={styles.weeklyStat}>
          <Activity size={20} color={COLORS.primary} />
          <Text style={styles.weeklyStatValue}>{item.averageWeight}g</Text>
          <Text style={styles.weeklyStatLabel}>متوسط الوزن</Text>
        </View>
        <View style={styles.weeklyStat}>
          <AlertTriangle size={20} color={COLORS.error} />
          <Text style={styles.weeklyStatValue}>{item.totalMortality}</Text>
          <Text style={styles.weeklyStatLabel}>إجمالي النفوق</Text>
        </View>
        <View style={styles.weeklyStat}>
          <TrendingUp size={20} color={COLORS.success} />
          <Text style={styles.weeklyStatValue}>{item.feedEfficiency}</Text>
          <Text style={styles.weeklyStatLabel}>كفاءة العلف</Text>
        </View>
        <View style={styles.weeklyStat}>
          <Users size={20} color={COLORS.warning} />
          <Text style={styles.weeklyStatValue}>{item.healthScore}%</Text>
          <Text style={styles.weeklyStatLabel}>النتيجة الصحية</Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.weeklyNotes}>
          <Text style={styles.weeklyNotesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );

  const renderAnalysis = () => (
    <View style={styles.analysisContainer}>
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>تحليل الأداء العام</Text>
        
        <View style={styles.performanceMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>معدل البقاء</Text>
            <Text style={styles.metricValue}>97%</Text>
            <Text style={styles.metricStatus}>ممتاز</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>كفاءة العلف</Text>
            <Text style={styles.metricValue}>1.6</Text>
            <Text style={styles.metricStatus}>جيد</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>معدل النمو</Text>
            <Text style={styles.metricValue}>19g/يوم</Text>
            <Text style={styles.metricStatus}>ممتاز</Text>
          </View>
        </View>

        <View style={styles.recommendations}>
          <Text style={styles.recommendationsTitle}>التوصيات:</Text>
          <Text style={styles.recommendationItem}>• الحفاظ على درجة الحرارة بين 30-32°C</Text>
          <Text style={styles.recommendationItem}>• زيادة التهوية خلال ساعات النهار الحارة</Text>
          <Text style={styles.recommendationItem}>• مراقبة استهلاك الماء يومياً</Text>
          <Text style={styles.recommendationItem}>• تطبيق برنامج التطعيم حسب الجدول</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>تفاصيل الحقل</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={() => router.push(`/field-chat?fieldId=${fieldData.id}&ownerId=${fieldData.ownerName}`)}
          >
            <MessageCircle size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={() => console.log('Calling:', fieldData.ownerPhone)}
          >
            <Phone size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Field Info Card */}
        <View style={styles.fieldInfoCard}>
          <Text style={styles.fieldName}>{fieldData.name}</Text>
          <Text style={styles.fieldLocation}>{fieldData.location}</Text>
          <Text style={styles.ownerName}>المالك: {fieldData.ownerName}</Text>
          
          <View style={styles.batchInfo}>
            <Text style={styles.batchTitle}>الدفعة الحالية - رقم {fieldData.currentBatch.batchNumber}</Text>
            <View style={styles.batchStats}>
              <View style={styles.batchStat}>
                <Users size={16} color={COLORS.success} />
                <Text style={styles.batchStatValue}>{fieldData.currentBatch.currentCount}</Text>
                <Text style={styles.batchStatLabel}>العدد الحالي</Text>
              </View>
              <View style={styles.batchStat}>
                <Calendar size={16} color={COLORS.warning} />
                <Text style={styles.batchStatValue}>{fieldData.currentBatch.chicksAge}</Text>
                <Text style={styles.batchStatLabel}>العمر (يوم)</Text>
              </View>
              <View style={styles.batchStat}>
                <Activity size={16} color={COLORS.primary} />
                <Text style={styles.batchStatValue}>{fieldData.currentBatch.averageWeight}g</Text>
                <Text style={styles.batchStatLabel}>متوسط الوزن</Text>
              </View>
              <View style={styles.batchStat}>
                <AlertTriangle size={16} color={COLORS.error} />
                <Text style={styles.batchStatValue}>{fieldData.currentBatch.totalMortality}</Text>
                <Text style={styles.batchStatLabel}>إجمالي النفوق</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'daily' && styles.activeTab]}
            onPress={() => setSelectedTab('daily')}
          >
            <FileText size={16} color={selectedTab === 'daily' ? COLORS.white : COLORS.primary} />
            <Text style={[styles.tabText, selectedTab === 'daily' && styles.activeTabText]}>
              التقارير اليومية
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'weekly' && styles.activeTab]}
            onPress={() => setSelectedTab('weekly')}
          >
            <Calendar size={16} color={selectedTab === 'weekly' ? COLORS.white : COLORS.primary} />
            <Text style={[styles.tabText, selectedTab === 'weekly' && styles.activeTabText]}>
              البيانات الأسبوعية
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'analysis' && styles.activeTab]}
            onPress={() => setSelectedTab('analysis')}
          >
            <TrendingUp size={16} color={selectedTab === 'analysis' ? COLORS.white : COLORS.primary} />
            <Text style={[styles.tabText, selectedTab === 'analysis' && styles.activeTabText]}>
              التحليل
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {selectedTab === 'daily' && (
          <FlatList
            data={fieldData.dailyReports}
            renderItem={renderDailyReport}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.reportsContainer}
          />
        )}

        {selectedTab === 'weekly' && (
          <FlatList
            data={fieldData.weeklyData}
            renderItem={renderWeeklyData}
            keyExtractor={(item) => item.weekNumber.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.reportsContainer}
          />
        )}

        {selectedTab === 'analysis' && renderAnalysis()}
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  fieldInfoCard: {
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
  fieldName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
  fieldLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: 'right',
  },
  ownerName: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
    textAlign: 'right',
  },
  batchInfo: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
  },
  batchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 12,
  },
  batchStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  batchStat: {
    alignItems: 'center',
    flex: 1,
  },
  batchStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 4,
  },
  batchStatLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.white,
  },
  reportsContainer: {
    paddingBottom: 20,
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  mortalityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  mortalityText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reportStat: {
    alignItems: 'center',
  },
  reportStatLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  reportStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  reportNotes: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  reportNotesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  reportNotesText: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
    textAlign: 'right',
  },
  treatmentsSection: {
    marginBottom: 12,
  },
  treatmentsList: {
    marginBottom: 8,
  },
  treatmentsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 4,
  },
  treatmentItem: {
    fontSize: 12,
    color: COLORS.black,
    marginBottom: 2,
    textAlign: 'right',
  },
  imagesSection: {
    marginTop: 8,
  },
  imagesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  reportImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  weeklyCard: {
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
  weeklyHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  weeklyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  weeklyDate: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weeklyStat: {
    alignItems: 'center',
    flex: 1,
  },
  weeklyStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 4,
  },
  weeklyStatLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: 'center',
  },
  weeklyNotes: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
  },
  weeklyNotesText: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: 'right',
  },
  analysisContainer: {
    paddingBottom: 20,
  },
  analysisCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  performanceMetrics: {
    marginBottom: 20,
  },
  metricItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  metricLabel: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginHorizontal: 16,
  },
  metricStatus: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  recommendations: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
});