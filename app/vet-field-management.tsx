import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter } from 'expo-router';
import Button from "../components/Button";
import { ArrowLeft, MapPin, Calendar, Users, Activity, MessageCircle, Phone, Video, Camera, FileText, TrendingUp, AlertTriangle } from 'lucide-react-native';
import { trpc } from "../lib/trpc";

interface FieldData {
  id: string;
  name: string;
  location: string;
  ownerName: string;
  ownerPhone: string;
  type: 'poultry' | 'livestock';
  currentBatch: {
    batchNumber: number;
    startDate: string;
    currentCount: number;
    chicksAge: number;
    averageWeight: number;
    mortality: number;
    healthStatus: 'excellent' | 'good' | 'warning' | 'critical';
  };
  dailyReports: {
    id: string;
    date: string;
    feedConsumption: number;
    waterConsumption: number;
    temperature: number;
    humidity: number;
    mortality: number;
    notes: string;
    images: string[];
  }[];
  unreadMessages: number;
}

export default function VetFieldManagementScreen() {
  const router = useRouter();
  const [assignedFields, setAssignedFields] = useState<FieldData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mock current vet ID - in real app this would come from auth context
  const currentVetId = 'vet1';
  
  // Fetch assigned fields for the current vet
  const assignedFieldsQuery = trpc.admin.fieldAssignments.getAssignedFieldsForVet.useQuery({
    vetId: currentVetId
  });
  
  useEffect(() => {
    if (assignedFieldsQuery.data) {
      // Convert backend data to FieldData format
      const fieldsData: FieldData[] = assignedFieldsQuery.data.map(assignment => ({
        id: assignment.farmId,
        name: assignment.farmName,
        location: 'بغداد - الدورة', // Mock location
        ownerName: assignment.ownerName,
        ownerPhone: assignment.assignedVetPhone || '+964 770 123 4567',
        type: 'poultry' as const,
        currentBatch: {
          batchNumber: 3,
          startDate: '2024-01-15',
          currentCount: 485,
          chicksAge: 21,
          averageWeight: 400,
          mortality: 15,
          healthStatus: 'good' as const
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
            notes: 'الطيور في حالة جيدة، لوحظ نشاط طبيعي',
            images: ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400']
          }
        ],
        unreadMessages: 3
      }));
      
      setAssignedFields(fieldsData);
      setLoading(false);
    }
  }, [assignedFieldsQuery.data]);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#10B981';
      case 'good': return '#3B82F6';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return COLORS.darkGray;
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'ممتاز';
      case 'good': return 'جيد';
      case 'warning': return 'تحذير';
      case 'critical': return 'حرج';
      default: return 'غير محدد';
    }
  };

  const renderFieldCard = (field: FieldData) => {
    const latestReport = field.dailyReports[0];
    
    return (
      <View key={field.id} style={styles.fieldCard}>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldInfo}>
            <Text style={styles.fieldName}>{field.name}</Text>
            <View style={styles.locationContainer}>
              <MapPin size={14} color={COLORS.darkGray} />
              <Text style={styles.fieldLocation}>{field.location}</Text>
            </View>
            <Text style={styles.ownerName}>المالك: {field.ownerName}</Text>
          </View>
          <View style={[styles.healthBadge, { backgroundColor: getHealthStatusColor(field.currentBatch.healthStatus) }]}>
            <Text style={styles.healthBadgeText}>{getHealthStatusText(field.currentBatch.healthStatus)}</Text>
          </View>
        </View>

        <View style={styles.batchInfo}>
          <Text style={styles.batchTitle}>الدفعة الحالية - رقم {field.currentBatch.batchNumber}</Text>
          <View style={styles.batchStats}>
            <View style={styles.batchStat}>
              <Users size={16} color={COLORS.success} />
              <Text style={styles.batchStatValue}>{field.currentBatch.currentCount}</Text>
              <Text style={styles.batchStatLabel}>العدد</Text>
            </View>
            <View style={styles.batchStat}>
              <Calendar size={16} color={COLORS.warning} />
              <Text style={styles.batchStatValue}>{field.currentBatch.chicksAge}</Text>
              <Text style={styles.batchStatLabel}>العمر</Text>
            </View>
            <View style={styles.batchStat}>
              <Activity size={16} color={COLORS.primary} />
              <Text style={styles.batchStatValue}>{field.currentBatch.averageWeight}g</Text>
              <Text style={styles.batchStatLabel}>الوزن</Text>
            </View>
            <View style={styles.batchStat}>
              <AlertTriangle size={16} color={COLORS.error} />
              <Text style={styles.batchStatValue}>{field.currentBatch.mortality}</Text>
              <Text style={styles.batchStatLabel}>النفوق</Text>
            </View>
          </View>
        </View>

        {latestReport && (
          <View style={styles.latestReport}>
            <Text style={styles.reportTitle}>آخر تقرير يومي - {latestReport.date}</Text>
            <Text style={styles.reportNotes}>{latestReport.notes}</Text>
            <View style={styles.reportStats}>
              <Text style={styles.reportStat}>العلف: {latestReport.feedConsumption} كغ</Text>
              <Text style={styles.reportStat}>الماء: {latestReport.waterConsumption} لتر</Text>
              <Text style={styles.reportStat}>الحرارة: {latestReport.temperature}°C</Text>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/field-details?id=${field.id}`)}
          >
            <FileText size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>التفاصيل</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.chatButton]}
            onPress={() => router.push(`/field-chat?fieldId=${field.id}&ownerId=${field.ownerName}`)}
          >
            <MessageCircle size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>محادثة</Text>
            {field.unreadMessages > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{field.unreadMessages}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.callButton]}
            onPress={() => console.log('Calling:', field.ownerPhone)}
          >
            <Phone size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>اتصال</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>إدارة الحقول المعينة</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل الحقول المعينة...</Text>
          </View>
        ) : (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>ملخص الحقول المعينة</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>{assignedFields.length}</Text>
                <Text style={styles.summaryStatLabel}>إجمالي الحقول</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>
                  {assignedFields.reduce((sum, field) => sum + field.unreadMessages, 0)}
                </Text>
                <Text style={styles.summaryStatLabel}>رسائل غير مقروءة</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>
                  {assignedFields.reduce((sum, field) => sum + field.currentBatch.currentCount, 0)}
                </Text>
                <Text style={styles.summaryStatLabel}>إجمالي الطيور</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.fieldsSection}>
          <Text style={styles.sectionTitle}>الحقول المعينة</Text>
          {assignedFields.length > 0 ? (
            assignedFields.map(renderFieldCard)
          ) : (
            !loading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>لا توجد حقول معينة لك حالياً</Text>
                <Text style={styles.emptyStateSubtext}>سيتم عرض الحقول هنا عند تعيينك من قبل الإدارة</Text>
              </View>
            )
          )}
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginRight: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  fieldsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  fieldCard: {
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
  fieldHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 4,
  },
  ownerName: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  healthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  healthBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  batchInfo: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  batchTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 8,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 2,
  },
  batchStatLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  latestReport: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  reportNotes: {
    fontSize: 12,
    color: COLORS.black,
    marginBottom: 8,
    lineHeight: 18,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportStat: {
    fontSize: 11,
    color: COLORS.darkGray,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 10,
    gap: 4,
    position: 'relative',
  },
  chatButton: {
    backgroundColor: '#10B981',
  },
  callButton: {
    backgroundColor: '#F59E0B',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 40,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});