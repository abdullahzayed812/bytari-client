import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  Bot, 
  BarChart3, 
  Settings, 
  TestTube, 
  Zap, 
  Clock, 
  MessageSquare, 
  HelpCircle,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react-native';
import { trpc } from "../lib/trpc";
import AiStatusIndicator from "../components/AiStatusIndicator";

export default function AiDashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  // Fetch AI status for both types
  const { data: consultationStatus, refetch: refetchConsultations } = trpc.ai.checkStatus.useQuery(
    { type: 'consultations' },
    { refetchInterval: 30000 }
  );
  
  const { data: inquiryStatus, refetch: refetchInquiries } = trpc.ai.checkStatus.useQuery(
    { type: 'inquiries' },
    { refetchInterval: 30000 }
  );

  // Fetch AI statistics
  const { data: aiStats, refetch: refetchStats } = trpc.ai.getStats.useQuery(
    { timeRange: 'today' }
  );

  // Test AI mutation
  const testAi = trpc.ai.test.useMutation({
    onSuccess: (result) => {
      Alert.alert(
        'نتيجة الاختبار',
        `${result.message}\n\nوقت المعالجة: ${result.processingTime}ms\nالرد: ${result.testResponse?.substring(0, 100)}...`,
        [{ text: 'موافق' }]
      );
    },
    onError: (error) => {
      Alert.alert('خطأ في الاختبار', error.message);
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchConsultations(),
        refetchInquiries(),
        refetchStats(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTestAi = (type: 'consultations' | 'inquiries') => {
    setTesting(type);
    testAi.mutate(
      { type },
      {
        onSettled: () => setTesting(null),
      }
    );
  };

  const renderStatusCard = (
    title: string,
    type: 'consultations' | 'inquiries',
    status: any,
    IconComponent: React.ComponentType<any>
  ) => {
    const isHealthy = status?.success && status?.isEnabled && status?.apiHealthy;
    
    return (
      <View style={[styles.statusCard, !isHealthy && styles.statusCardWarning]}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIconContainer}>
            <IconComponent size={20} color={type === 'consultations' ? '#10B981' : '#3B82F6'} />
          </View>
          <View style={styles.statusTitleContainer}>
            <Text style={styles.statusTitle}>{title}</Text>
            <View style={styles.statusIndicator}>
              {isHealthy ? (
                <CheckCircle size={16} color="#10B981" />
              ) : (
                <AlertCircle size={16} color="#EF4444" />
              )}
              <Text style={[styles.statusText, isHealthy ? styles.statusActive : styles.statusInactive]}>
                {isHealthy ? 'نشط' : 'معطل'}
              </Text>
            </View>
          </View>
        </View>

        {status?.success && (
          <View style={styles.statusDetails}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.statusItemText}>
                  {status.responseDelay}ث تأخير
                </Text>
              </View>
              
              <View style={styles.statusItem}>
                <Activity size={14} color="#6B7280" />
                <Text style={styles.statusItemText}>
                  {status.maxResponseLength} حرف
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.testButton, testing === type && styles.testButtonDisabled]}
              onPress={() => handleTestAi(type)}
              disabled={testing === type || !status.isEnabled}
            >
              {testing === type ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <TestTube size={16} color="#3B82F6" />
              )}
              <Text style={styles.testButtonText}>
                {testing === type ? 'جاري الاختبار...' : 'اختبار سريع'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderStatsCard = () => {
    if (!aiStats?.success) {
      return (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>إحصائيات الذكاء الاصطناعي</Text>
          <Text style={styles.noDataText}>لا توجد إحصائيات متاحة</Text>
        </View>
      );
    }

    // Handle different stats structure types
    const stats = aiStats.stats;
    let totalResponses = 0;
    let avgSuccessRate = 0;
    let consultationResponses = 0;
    let inquiryResponses = 0;
    let avgResponseTime = 0;
    
    if (stats && 'total' in stats) {
      // Combined stats structure
      totalResponses = stats.total;
      consultationResponses = stats.consultations?.totalResponses || 0;
      inquiryResponses = stats.inquiries?.totalResponses || 0;
      avgSuccessRate = ((stats.consultations?.successRate || 0) + (stats.inquiries?.successRate || 0)) / 2;
      avgResponseTime = stats.consultations?.averageResponseTime || 0;
    } else if (stats) {
      // Single type stats structure
      totalResponses = stats.totalResponses || 0;
      avgSuccessRate = stats.successRate || 0;
      avgResponseTime = stats.averageResponseTime || 0;
    }

    return (
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <BarChart3 size={20} color="#8B5CF6" />
          <Text style={styles.statsTitle}>إحصائيات اليوم</Text>
          <TrendingUp size={16} color="#10B981" />
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalResponses}</Text>
            <Text style={styles.statLabel}>إجمالي الردود</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{avgSuccessRate.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>معدل النجاح</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {consultationResponses}
            </Text>
            <Text style={styles.statLabel}>ردود الاستشارات</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {inquiryResponses}
            </Text>
            <Text style={styles.statLabel}>ردود الاستفسارات</Text>
          </View>
        </View>

        <View style={styles.statsFooter}>
          <Text style={styles.statsFooterText}>
            متوسط وقت الرد: {avgResponseTime}ث
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'لوحة تحكم الذكاء الاصطناعي',
          headerStyle: { backgroundColor: '#8B5CF6' },
          headerTintColor: '#FFFFFF',
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Bot size={40} color="#8B5CF6" />
          <Text style={styles.headerTitle}>مركز التحكم بالذكاء الاصطناعي</Text>
          <Text style={styles.headerSubtitle}>
            مراقبة وإدارة نظام الردود التلقائية
          </Text>
        </View>

        {/* AI Status Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حالة النظام</Text>
          
          <AiStatusIndicator 
            isEnabled={consultationStatus?.isEnabled || false}
            type="consultations"
            showDetails={true}
          />
          
          <AiStatusIndicator 
            isEnabled={inquiryStatus?.isEnabled || false}
            type="inquiries"
            showDetails={true}
          />
        </View>

        {/* Detailed Status Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل الحالة</Text>
          
          {renderStatusCard(
            'الاستشارات البيطرية',
            'consultations',
            consultationStatus,
            MessageSquare
          )}
          
          {renderStatusCard(
            'استفسارات الأطباء',
            'inquiries',
            inquiryStatus,
            HelpCircle
          )}
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإحصائيات</Text>
          {renderStatsCard()}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin-ai-settings')}
            >
              <Settings size={24} color="#6B7280" />
              <Text style={styles.actionTitle}>إعدادات الذكاء الاصطناعي</Text>
              <Text style={styles.actionSubtitle}>تخصيص النصوص والإعدادات</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => {
                Alert.alert(
                  'اختبار شامل',
                  'هل تريد تشغيل اختبار شامل للذكاء الاصطناعي؟',
                  [
                    { text: 'إلغاء', style: 'cancel' },
                    { 
                      text: 'تشغيل', 
                      onPress: () => {
                        handleTestAi('consultations');
                        setTimeout(() => handleTestAi('inquiries'), 2000);
                      }
                    }
                  ]
                );
              }}
            >
              <TestTube size={24} color="#6B7280" />
              <Text style={styles.actionTitle}>اختبار شامل</Text>
              <Text style={styles.actionSubtitle}>فحص جميع الأنظمة</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System Info */}
        <View style={styles.infoCard}>
          <Zap size={20} color="#6B7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>معلومات النظام</Text>
            <Text style={styles.infoText}>
              نظام الذكاء الاصطناعي يعمل على مدار الساعة لتقديم ردود فورية ومفيدة.
              يتم مراقبة الأداء والجودة باستمرار لضمان أفضل تجربة للمستخدمين.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIconContainer: {
    marginRight: 12,
  },
  statusTitleContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusActive: {
    color: '#10B981',
  },
  statusInactive: {
    color: '#EF4444',
  },
  statusDetails: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusItemText: {
    fontSize: 12,
    color: '#6B7280',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  statsFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statsFooterText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsGrid: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});