import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Plus, FileText, Eye, Edit, Trash2, Shield, AlertTriangle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePermissions, validateHospitalOperation } from "../lib/permissions";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'news' | 'announcement' | 'event';
  hospitalId: string;
}

export default function ManageHospitalAnnouncementsScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const { hospitalId } = useLocalSearchParams();
  const permissions = usePermissions();
  const [selectedType, setSelectedType] = useState<'all' | 'news' | 'announcement' | 'event'>('all');
  const [canManage, setCanManage] = useState(false);
  const [accessDeniedReason, setAccessDeniedReason] = useState('');
  
  const currentHospitalId = hospitalId as string || '1';

  // التحقق من صلاحيات إدارة الإعلانات
  useEffect(() => {
    const checkPermissions = () => {
      // التحقق من إمكانية الوصول للمستشفى
      if (!permissions.canAccessHospital(currentHospitalId)) {
        setCanManage(false);
        setAccessDeniedReason('ليس لديك صلاحية للوصول إلى هذا المستشفى');
        return;
      }

      // التحقق من صلاحية إدارة الإعلانات
      const validation = validateHospitalOperation('hospital_manage_announcements', currentHospitalId);
      if (!validation.allowed) {
        setCanManage(false);
        setAccessDeniedReason(validation.reason || 'ليس لديك صلاحية لإدارة إعلانات هذا المستشفى');
        return;
      }

      setCanManage(true);
    };

    checkPermissions();
  }, [permissions, currentHospitalId]);

  // Mock announcements data
  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'حملة تطعيم مجانية للحيوانات الأليفة',
      content: 'تعلن المستشفيات البيطرية العراقية عن إطلاق حملة تطعيم مجانية لجميع الحيوانات الأليفة خلال شهر مارس',
      date: '2024-03-01',
      type: 'announcement',
      hospitalId: currentHospitalId
    },
    {
      id: '2',
      title: 'افتتاح قسم الجراحة المتقدمة',
      content: 'تم افتتاح قسم جديد للجراحة المتقدمة مجهز بأحدث التقنيات الطبية',
      date: '2024-02-28',
      type: 'news',
      hospitalId: currentHospitalId
    },
    {
      id: '3',
      title: 'ورشة عمل حول الرعاية البيطرية',
      content: 'ورشة عمل تدريبية للأطباء البيطريين حول أحدث طرق الرعاية والعلاج',
      date: '2024-02-25',
      type: 'event',
      hospitalId: currentHospitalId
    }
  ];

  const getHospitalName = () => {
    // في التطبيق الحقيقي، ستأتي هذه المعلومات من قاعدة البيانات
    const hospitalNames: { [key: string]: string } = {
      '1': 'المستشفى البيطري الرئيسي - بغداد',
      '2': 'مستشفى البصرة البيطري',
      '3': 'مستشفى الموصل البيطري'
    };
    return hospitalNames[currentHospitalId] || 'المستشفى';
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    // فقط عرض إعلانات المستشفى الحالي
    if (announcement.hospitalId !== currentHospitalId) {
      return false;
    }
    if (selectedType !== 'all' && announcement.type !== selectedType) {
      return false;
    }
    return true;
  });

  const handleAddAnnouncement = () => {
    const validation = validateHospitalOperation('hospital_manage_announcements', currentHospitalId);
    if (!validation.allowed) {
      Alert.alert('غير مسموح', validation.reason || 'ليس لديك صلاحية لإضافة إعلانات لهذا المستشفى');
      return;
    }
    router.push(`/add-hospital-announcement?hospitalId=${currentHospitalId}` as any);
  };

  const handleEditAnnouncement = (announcementId: string) => {
    const validation = validateHospitalOperation('hospital_manage_announcements', currentHospitalId);
    if (!validation.allowed) {
      Alert.alert('غير مسموح', validation.reason || 'ليس لديك صلاحية لتعديل إعلانات هذا المستشفى');
      return;
    }
    router.push(`/edit-hospital-announcement?id=${announcementId}&hospitalId=${currentHospitalId}` as any);
  };

  const handleDeleteAnnouncement = (announcementId: string, title: string) => {
    const validation = validateHospitalOperation('hospital_manage_announcements', currentHospitalId);
    if (!validation.allowed) {
      Alert.alert('غير مسموح', validation.reason || 'ليس لديك صلاحية لحذف إعلانات هذا المستشفى');
      return;
    }

    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف "${title}"؟\n\n⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            Alert.alert('تم الحذف', `تم حذف الإعلان "${title}" من ${getHospitalName()} بنجاح`);
          }
        }
      ]
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news': return '#0EA5E9';
      case 'announcement': return '#10B981';
      case 'event': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'news': return 'خبر';
      case 'announcement': return 'إعلان';
      case 'event': return 'فعالية';
      default: return 'عام';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة الإعلانات</Text>
        <TouchableOpacity 
          onPress={handleAddAnnouncement} 
          style={[styles.addButton, !canManage && styles.disabledButton]}
          disabled={!canManage}
        >
          <Plus size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {!canManage && (
          <View style={styles.accessDeniedContainer}>
            <AlertTriangle size={24} color="#EF4444" />
            <View style={styles.accessDeniedContent}>
              <Text style={styles.accessDeniedTitle}>وصول محدود</Text>
              <Text style={styles.accessDeniedText}>{accessDeniedReason}</Text>
              <Text style={styles.accessDeniedNote}>
                يمكنك عرض الإعلانات فقط ولكن لا يمكنك إدارتها.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.hospitalInfo}>
          <Shield size={20} color="#2563EB" />
          <Text style={styles.hospitalInfoText}>
            إدارة إعلانات: {getHospitalName()}
          </Text>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {[
              { key: 'all', label: 'الكل' },
              { key: 'announcement', label: 'إعلانات' },
              { key: 'news', label: 'أخبار' },
              { key: 'event', label: 'فعاليات' }
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedType === filter.key && styles.activeFilterButton
                ]}
                onPress={() => setSelectedType(filter.key as any)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedType === filter.key && styles.activeFilterButtonText
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.announcementsList} showsVerticalScrollIndicator={false}>
          {filteredAnnouncements.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>لا توجد إعلانات</Text>
              {canManage && (
                <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddAnnouncement}>
                  <Plus size={20} color={COLORS.white} />
                  <Text style={styles.emptyStateButtonText}>إضافة إعلان جديد</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <View key={announcement.id} style={styles.announcementCard}>
                <View style={styles.announcementHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: getTypeColor(announcement.type) }]}>
                    <Text style={styles.typeBadgeText}>{getTypeText(announcement.type)}</Text>
                  </View>
                  <Text style={styles.announcementDate}>{announcement.date}</Text>
                </View>
                
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementContent} numberOfLines={2}>
                  {announcement.content}
                </Text>
                
                <View style={styles.announcementActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Eye size={16} color="#0EA5E9" />
                    <Text style={[styles.actionButtonText, { color: '#0EA5E9' }]}>عرض</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, !canManage && styles.disabledActionButton]}
                    onPress={() => handleEditAnnouncement(announcement.id)}
                    disabled={!canManage}
                  >
                    <Edit size={16} color={canManage ? "#F59E0B" : "#9CA3AF"} />
                    <Text style={[styles.actionButtonText, { color: canManage ? '#F59E0B' : '#9CA3AF' }]}>تعديل</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, !canManage && styles.disabledActionButton]}
                    onPress={() => handleDeleteAnnouncement(announcement.id, announcement.title)}
                    disabled={!canManage}
                  >
                    <Trash2 size={16} color={canManage ? "#EF4444" : "#9CA3AF"} />
                    <Text style={[styles.actionButtonText, { color: canManage ? '#EF4444' : '#9CA3AF' }]}>حذف</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {canManage && (
          <View style={styles.permissionInfo}>
            <Shield size={16} color="#10B981" />
            <Text style={styles.permissionInfoText}>
              لديك صلاحية كاملة لإدارة إعلانات هذا المستشفى
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  accessDeniedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  accessDeniedContent: {
    flex: 1,
    marginLeft: 12,
  },
  accessDeniedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'right',
    marginBottom: 4,
  },
  accessDeniedText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'right',
    marginBottom: 8,
  },
  accessDeniedNote: {
    fontSize: 12,
    color: '#7F1D1D',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  hospitalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  hospitalInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#2563EB',
    textAlign: 'right',
    marginLeft: 8,
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#0EA5E9',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  activeFilterButtonText: {
    color: COLORS.white,
  },
  announcementsList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyStateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  announcementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  announcementDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  announcementContent: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'right',
  },
  announcementActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  disabledActionButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  permissionInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#059669',
    textAlign: 'right',
    marginLeft: 8,
    fontWeight: '500',
  },
});