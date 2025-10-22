import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter } from 'expo-router';
import { 
  ArrowRight, 
  Building2,
  MapPin,
  Plus,
  Edit,
  Settings,
  Users,
  FileText,
  BarChart3,
  Bell,
  Calendar,
  Eye,
  Trash2
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UnionBranchItem {
  id: string;
  name: string;
  type: 'main' | 'province';
  location: string;
  status: 'active' | 'inactive';
  announcementsCount: number;
  membersCount: number;
}

export default function UnionManagementDashboardScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'branches' | 'announcements'>('overview');

  // Mock data for union branches
  const branches: UnionBranchItem[] = [
    {
      id: 'main',
      name: 'نقابة الأطباء البيطريين المركزية - بغداد',
      type: 'main',
      location: 'بغداد - الكرادة',
      status: 'active',
      announcementsCount: 25,
      membersCount: 2850
    },
    {
      id: 'basra',
      name: 'فرع نقابة الأطباء البيطريين - البصرة',
      type: 'province',
      location: 'البصرة - المركز',
      status: 'active',
      announcementsCount: 12,
      membersCount: 420
    },
    {
      id: 'mosul',
      name: 'فرع نقابة الأطباء البيطريين - الموصل',
      type: 'province',
      location: 'نينوى - الموصل',
      status: 'active',
      announcementsCount: 8,
      membersCount: 380
    },
    {
      id: 'erbil',
      name: 'فرع نقابة الأطباء البيطريين - أربيل',
      type: 'province',
      location: 'أربيل - المركز',
      status: 'active',
      announcementsCount: 15,
      membersCount: 520
    },
    {
      id: 'najaf',
      name: 'فرع نقابة الأطباء البيطريين - النجف',
      type: 'province',
      location: 'النجف - المركز',
      status: 'active',
      announcementsCount: 6,
      membersCount: 290
    }
  ];

  const handleEditBranch = (branchId: string) => {
    router.push(`/edit-union-branch?id=${branchId}`);
  };

  const handleAddBranch = () => {
    router.push('/add-union-branch' as any);
  };

  const handleManageAnnouncements = (branchId: string) => {
    router.push(`/manage-union-announcements?branchId=${branchId}` as any);
  };

  const handleViewBranch = (branchId: string) => {
    router.push(`/union-branch-details?id=${branchId}` as any);
  };

  const handleDeleteBranch = (branchId: string, branchName: string) => {
    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف ${branchName}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            Alert.alert('تم', 'تم حذف الفرع بنجاح');
          }
        }
      ]
    );
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
          <Building2 size={24} color={COLORS.white} />
          <Text style={styles.statNumber}>{branches.length}</Text>
          <Text style={styles.statLabel}>إجمالي الفروع</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#059669' }]}>
          <FileText size={24} color={COLORS.white} />
          <Text style={styles.statNumber}>
            {branches.reduce((sum, b) => sum + b.announcementsCount, 0)}
          </Text>
          <Text style={styles.statLabel}>إجمالي الإعلانات</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#047857' }]}>
          <Users size={24} color={COLORS.white} />
          <Text style={styles.statNumber}>
            {branches.reduce((sum, b) => sum + b.membersCount, 0)}
          </Text>
          <Text style={styles.statLabel}>إجمالي الأعضاء</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#065F46' }]}>
          <BarChart3 size={24} color={COLORS.white} />
          <Text style={styles.statNumber}>96%</Text>
          <Text style={styles.statLabel}>معدل النشاط</Text>
        </View>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={[styles.quickActionCard, { backgroundColor: '#10B981' }]}
            onPress={handleAddBranch}
          >
            <Plus size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>إضافة فرع</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionCard, { backgroundColor: '#059669' }]}
            onPress={() => handleManageAnnouncements('all')}
          >
            <FileText size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>إدارة الإعلانات</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionCard, { backgroundColor: '#047857' }]}
            onPress={() => router.push('/union-settings' as any)}
          >
            <Settings size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>إعدادات النظام</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionCard, { backgroundColor: '#065F46' }]}
            onPress={() => router.push('/union-analytics' as any)}
          >
            <BarChart3 size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>التحليلات</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderBranchesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>قائمة الفروع</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddBranch}>
          <Plus size={16} color={COLORS.white} />
          <Text style={styles.addButtonText}>إضافة</Text>
        </TouchableOpacity>
      </View>
      
      {branches.map((branch) => (
        <View key={branch.id} style={styles.branchCard}>
          <View style={styles.branchHeader}>
            <View style={styles.branchInfo}>
              <Text style={styles.branchName}>{branch.name}</Text>
              <View style={styles.branchMeta}>
                <MapPin size={14} color={COLORS.darkGray} />
                <Text style={styles.branchLocation}>{branch.location}</Text>
                {branch.type === 'main' && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>مركزي</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={[styles.statusBadge, 
              { backgroundColor: branch.status === 'active' ? '#10B981' : '#EF4444' }
            ]}>
              <Text style={styles.statusText}>
                {branch.status === 'active' ? 'نشط' : 'غير نشط'}
              </Text>
            </View>
          </View>
          
          <View style={styles.branchStats}>
            <View style={styles.statItem}>
              <FileText size={16} color="#10B981" />
              <Text style={styles.statItemText}>{branch.announcementsCount} إعلان</Text>
            </View>
            
            <View style={styles.statItem}>
              <Users size={16} color="#059669" />
              <Text style={styles.statItemText}>{branch.membersCount} عضو</Text>
            </View>
          </View>
          
          <View style={styles.branchActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={() => handleViewBranch(branch.id)}
            >
              <Eye size={16} color={COLORS.white} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
              onPress={() => handleEditBranch(branch.id)}
            >
              <Edit size={16} color={COLORS.white} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#059669' }]}
              onPress={() => handleManageAnnouncements(branch.id)}
            >
              <FileText size={16} color={COLORS.white} />
            </TouchableOpacity>
            
            {branch.type !== 'main' && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                onPress={() => handleDeleteBranch(branch.id, branch.name)}
              >
                <Trash2 size={16} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderAnnouncementsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>إدارة الإعلانات</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => router.push('/add-union-announcement' as any)}
        >
          <Plus size={16} color={COLORS.white} />
          <Text style={styles.addButtonText}>إعلان جديد</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.announcementsList}>
        <View style={styles.announcementCard}>
          <View style={styles.announcementHeader}>
            <View style={[styles.typeBadge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.typeBadgeText}>إعلان</Text>
            </View>
            <Text style={styles.announcementDate}>2024-03-01</Text>
          </View>
          
          <Text style={styles.announcementTitle}>اجتماع الجمعية العمومية السنوي</Text>
          <Text style={styles.announcementBranch}>نقابة الأطباء البيطريين المركزية</Text>
          
          <View style={styles.announcementActions}>
            <TouchableOpacity style={styles.announcementActionButton}>
              <Eye size={14} color="#10B981" />
              <Text style={styles.announcementActionText}>عرض</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.announcementActionButton}>
              <Edit size={14} color="#F59E0B" />
              <Text style={styles.announcementActionText}>تعديل</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.announcementCard}>
          <View style={styles.announcementHeader}>
            <View style={[styles.typeBadge, { backgroundColor: '#059669' }]}>
              <Text style={styles.typeBadgeText}>خبر</Text>
            </View>
            <Text style={styles.announcementDate}>2024-02-28</Text>
          </View>
          
          <Text style={styles.announcementTitle}>دورة تدريبية في الطب البيطري الحديث</Text>
          <Text style={styles.announcementBranch}>فرع نقابة الأطباء البيطريين - البصرة</Text>
          
          <View style={styles.announcementActions}>
            <TouchableOpacity style={styles.announcementActionButton}>
              <Eye size={14} color="#10B981" />
              <Text style={styles.announcementActionText}>عرض</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.announcementActionButton}>
              <Edit size={14} color="#F59E0B" />
              <Text style={styles.announcementActionText}>تعديل</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة نقابة الأطباء البيطريين</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
        >
          <BarChart3 size={18} color={selectedTab === 'overview' ? COLORS.white : '#10B981'} />
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
            نظرة عامة
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'branches' && styles.activeTab]}
          onPress={() => setSelectedTab('branches')}
        >
          <Building2 size={18} color={selectedTab === 'branches' ? COLORS.white : '#10B981'} />
          <Text style={[styles.tabText, selectedTab === 'branches' && styles.activeTabText]}>
            الفروع
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'announcements' && styles.activeTab]}
          onPress={() => setSelectedTab('announcements')}
        >
          <FileText size={18} color={selectedTab === 'announcements' ? COLORS.white : '#10B981'} />
          <Text style={[styles.tabText, selectedTab === 'announcements' && styles.activeTabText]}>
            الإعلانات
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'branches' && renderBranchesTab()}
        {selectedTab === 'announcements' && renderAnnouncementsTab()}
      </ScrollView>
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
    backgroundColor: '#10B981',
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
  notificationButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  activeTabText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 4,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  branchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  branchHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
  branchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  branchLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  mainBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  mainBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  branchStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statItemText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  branchActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementsList: {
    gap: 12,
  },
  announcementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 4,
    textAlign: 'right',
  },
  announcementBranch: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
    textAlign: 'right',
  },
  announcementActions: {
    flexDirection: 'row',
    gap: 12,
  },
  announcementActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  announcementActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});