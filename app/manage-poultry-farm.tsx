import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from "../components/Button";
import { 
  User, MapPin, Phone, Building2, MessageCircle, Video, 
  Camera, Mic, Calendar, Activity, AlertTriangle, CheckCircle,
  TrendingUp, FileText, Settings
} from 'lucide-react-native';

// Mock data for farm details
const mockFarmDetails = {
  id: '1',
  name: 'مزرعة الأمل للدواجن',
  owner: {
    id: '1',
    name: 'أحمد محمد السعد',
    phone: '+966 50 123 4567',
    email: 'ahmed.saad@email.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  location: 'الرياض - حي النرجس',
  capacity: '10,000 طائر',
  type: 'دجاج بياض',
  status: 'نشط',
  currentBatch: {
    count: 8500,
    age: '12 أسبوع',
    mortality: '2.5%',
    production: '85%',
    lastVisit: '2024-01-15'
  },
  healthStatus: {
    overall: 'جيد',
    vaccinations: 'محدثة',
    lastCheckup: '2024-01-10',
    nextCheckup: '2024-01-25'
  },
  alerts: [
    {
      id: '1',
      type: 'warning',
      message: 'انخفاض في معدل الإنتاج بنسبة 5%',
      date: '2024-01-14'
    },
    {
      id: '2',
      type: 'info',
      message: 'موعد التطعيم القادم خلال 3 أيام',
      date: '2024-01-13'
    }
  ]
};

export default function ManagePoultryFarmScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { user } = useApp();
  const { farmId } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'reports'>('overview');

  const handleCall = () => {
    const phoneNumber = mockFarmDetails.owner.phone;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMessage = () => {
    router.push({
      pathname: '/messages',
      params: { 
        userId: mockFarmDetails.owner.id,
        userName: mockFarmDetails.owner.name
      }
    });
  };

  const handleVideoCall = () => {
    Alert.alert(
      'مكالمة فيديو',
      `هل تريد بدء مكالمة فيديو مع ${mockFarmDetails.owner.name}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'اتصال', onPress: () => console.log('Starting video call') }
      ]
    );
  };

  const handleScheduleVisit = () => {
    router.push('/appointments');
  };

  const handleAddReport = () => {
    console.log('Add new report');
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Current Batch Info */}
      <View style={styles.infoCard}>
        <Text style={[styles.cardTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          معلومات الدفعة الحالية
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mockFarmDetails.currentBatch.count}</Text>
            <Text style={styles.statLabel}>عدد الطيور</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mockFarmDetails.currentBatch.age}</Text>
            <Text style={styles.statLabel}>العمر</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.error }]}>
              {mockFarmDetails.currentBatch.mortality}
            </Text>
            <Text style={styles.statLabel}>معدل النفوق</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {mockFarmDetails.currentBatch.production}
            </Text>
            <Text style={styles.statLabel}>معدل الإنتاج</Text>
          </View>
        </View>
      </View>

      {/* Alerts */}
      <View style={styles.infoCard}>
        <Text style={[styles.cardTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          التنبيهات
        </Text>
        
        {mockFarmDetails.alerts.map((alert) => (
          <View key={alert.id} style={styles.alertItem}>
            <View style={[styles.alertContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {alert.type === 'warning' ? (
                <AlertTriangle size={20} color={COLORS.warning} />
              ) : (
                <CheckCircle size={20} color={COLORS.primary} />
              )}
              <View style={[styles.alertText, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                <Text style={[styles.alertMessage, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {alert.message}
                </Text>
                <Text style={[styles.alertDate, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {alert.date}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderHealthTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoCard}>
        <Text style={[styles.cardTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          الحالة الصحية العامة
        </Text>
        
        <View style={styles.healthItem}>
          <Text style={[styles.healthLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
            التقييم العام:
          </Text>
          <Text style={[styles.healthValue, { color: COLORS.success }]}>
            {mockFarmDetails.healthStatus.overall}
          </Text>
        </View>
        
        <View style={styles.healthItem}>
          <Text style={[styles.healthLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
            حالة التطعيمات:
          </Text>
          <Text style={[styles.healthValue, { color: COLORS.success }]}>
            {mockFarmDetails.healthStatus.vaccinations}
          </Text>
        </View>
        
        <View style={styles.healthItem}>
          <Text style={[styles.healthLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
            آخر فحص:
          </Text>
          <Text style={styles.healthValue}>
            {mockFarmDetails.healthStatus.lastCheckup}
          </Text>
        </View>
        
        <View style={styles.healthItem}>
          <Text style={[styles.healthLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
            الفحص القادم:
          </Text>
          <Text style={styles.healthValue}>
            {mockFarmDetails.healthStatus.nextCheckup}
          </Text>
        </View>
      </View>
      
      <Button
        title="جدولة زيارة"
        onPress={handleScheduleVisit}
        type="primary"
        size="medium"
        icon={<Calendar size={16} color={COLORS.white} />}
        style={styles.actionButton}
      />
    </View>
  );

  const renderReportsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoCard}>
        <Text style={[styles.cardTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          التقارير الأخيرة
        </Text>
        
        <TouchableOpacity style={styles.reportItem}>
          <View style={[styles.reportContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <FileText size={20} color={COLORS.primary} />
            <View style={[styles.reportText, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
              <Text style={[styles.reportTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                تقرير الفحص الأسبوعي
              </Text>
              <Text style={[styles.reportDate, { textAlign: isRTL ? 'right' : 'left' }]}>
                15 يناير 2024
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.reportItem}>
          <View style={[styles.reportContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TrendingUp size={20} color={COLORS.success} />
            <View style={[styles.reportText, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
              <Text style={[styles.reportTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                تقرير الإنتاجية الشهرية
              </Text>
              <Text style={[styles.reportDate, { textAlign: isRTL ? 'right' : 'left' }]}>
                10 يناير 2024
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      
      <Button
        title="إضافة تقرير جديد"
        onPress={handleAddReport}
        type="outline"
        size="medium"
        icon={<FileText size={16} color={COLORS.primary} />}
        style={styles.actionButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Farm Header */}
        <View style={styles.farmHeader}>
          <Text style={[styles.farmName, { textAlign: isRTL ? 'right' : 'left' }]}>
            {mockFarmDetails.name}
          </Text>
          <View style={[styles.farmLocation, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <MapPin size={16} color={COLORS.primary} />
            <Text style={[styles.farmLocationText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
              {mockFarmDetails.location}
            </Text>
          </View>
        </View>

        {/* Owner Info */}
        <View style={styles.ownerCard}>
          <View style={[styles.ownerHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Image source={{ uri: mockFarmDetails.owner.avatar }} style={styles.ownerAvatar} />
            <View style={[styles.ownerInfo, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
              <Text style={[styles.ownerName, { textAlign: isRTL ? 'right' : 'left' }]}>
                {mockFarmDetails.owner.name}
              </Text>
              <Text style={[styles.ownerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                مالك المزرعة
              </Text>
            </View>
          </View>
          
          {/* Communication Buttons */}
          <View style={[styles.communicationButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity style={styles.commButton} onPress={handleCall}>
              <Phone size={20} color={COLORS.white} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.commButton} onPress={handleMessage}>
              <MessageCircle size={20} color={COLORS.white} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.commButton} onPress={handleVideoCall}>
              <Video size={20} color={COLORS.white} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.commButton} onPress={() => console.log('Send photo')}>
              <Camera size={20} color={COLORS.white} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.commButton} onPress={() => console.log('Send voice')}>
              <Mic size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={[styles.tabs, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'overview' && styles.activeTabText
              ]}>
                نظرة عامة
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'health' && styles.activeTab]}
              onPress={() => setActiveTab('health')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'health' && styles.activeTabText
              ]}>
                الصحة
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
              onPress={() => setActiveTab('reports')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'reports' && styles.activeTabText
              ]}>
                التقارير
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'health' && renderHealthTab()}
        {activeTab === 'reports' && renderReportsTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollContent: {
    padding: 16,
  },
  farmHeader: {
    marginBottom: 16,
  },
  farmName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  farmLocation: {
    alignItems: 'center',
  },
  farmLocationText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  ownerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ownerHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  ownerTitle: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  communicationButtons: {
    justifyContent: 'space-around',
    gap: 12,
  },
  commButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabs: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.white,
  },
  tabContent: {
    marginBottom: 32,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  alertItem: {
    marginBottom: 12,
  },
  alertContent: {
    alignItems: 'flex-start',
  },
  alertText: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
  },
  alertDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  healthLabel: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  healthValue: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  reportItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  reportContent: {
    alignItems: 'center',
  },
  reportText: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  actionButton: {
    width: '100%',
  },
});