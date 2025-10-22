import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useRouter } from 'expo-router';
import { 
  Users, MessageSquare, FileText, 
  Heart, Store, BarChart3,
  CheckCircle, Shield, Bell, Megaphone,
  ArrowLeft, Grid3X3, BookOpen, Stethoscope
} from 'lucide-react-native';

interface QuickAction {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  onPress: () => void;
  requiresSuperAdmin?: boolean;
  requiresModerator?: boolean;
  moderatorPermissions?: string[];
}

export default function AdminQuickActionsScreen() {
  const { isSuperAdmin, isModerator, moderatorPermissions } = useApp();
  const router = useRouter();

  // Check if user has specific moderator permission
  const hasModeratorPermission = (permission: string) => {
    if (isSuperAdmin) return true;
    if (!isModerator || !moderatorPermissions) return false;
    
    switch (permission) {
      case 'users':
        return moderatorPermissions.userManagement;
      case 'messages':
        return moderatorPermissions.generalMessages;
      case 'consultations':
        return moderatorPermissions.consultations;
      case 'inquiries':
        return moderatorPermissions.inquiries;
      case 'approvals':
        return moderatorPermissions.superPermissions;
      case 'notifications':
        return moderatorPermissions.generalMessages;
      case 'ads':
        return moderatorPermissions.advertisements;
      case 'content':
        return moderatorPermissions.homePageManagement;
      case 'stats':
        return moderatorPermissions.superPermissions;
      case 'stores':
        return moderatorPermissions.sections?.includes('stores') || false;
      case 'clinics':
        return moderatorPermissions.sections?.includes('clinics') || false;
      case 'pets':
        return moderatorPermissions.sections?.includes('pets') || false;
      case 'tips':
        return moderatorPermissions.sections?.includes('tips') || false;
      case 'articles':
        return moderatorPermissions.sections?.includes('articles') || false;
      case 'books':
        return moderatorPermissions.sections?.includes('books') || false;
      default:
        return false;
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'users',
      title: 'إدارة الأدوار',
      icon: Users,
      color: '#3B82F6',
      onPress: () => router.push('/admin-users-list'),
      requiresSuperAdmin: true
    },
    {
      id: 'messages',
      title: 'إرسال رسالة عامة',
      icon: MessageSquare,
      color: '#10B981',
      onPress: () => router.push('/admin-messages'),
      moderatorPermissions: ['messages']
    },
    {
      id: 'ads',
      title: 'إدارة الإعلانات',
      icon: Megaphone,
      color: '#F59E0B',
      onPress: () => router.push('/admin-ads-management'),
      moderatorPermissions: ['ads']
    },
    {
      id: 'approvals',
      title: 'إدارة الموافقات',
      icon: CheckCircle,
      color: '#8B5CF6',
      onPress: () => router.push('/admin-approvals'),
      moderatorPermissions: ['approvals']
    },
    {
      id: 'stats',
      title: 'الإحصائيات',
      icon: BarChart3,
      color: '#EF4444',
      onPress: () => router.push('/admin-dashboard'),
      requiresSuperAdmin: true
    },
    {
      id: 'notifications',
      title: 'إدارة الإشعارات',
      icon: Bell,
      color: '#06B6D4',
      onPress: () => router.push('/admin-notifications'),
      moderatorPermissions: ['notifications']
    },
    {
      id: 'stores',
      title: 'إدارة المتاجر',
      icon: Store,
      color: '#84CC16',
      onPress: () => router.push('/admin-stores-management'),
      moderatorPermissions: ['stores']
    },
    {
      id: 'clinics',
      title: 'إدارة العيادات',
      icon: Stethoscope,
      color: '#F97316',
      onPress: () => router.push('/admin-clinics-management'),
      moderatorPermissions: ['clinics']
    },
    {
      id: 'pets',
      title: 'إدارة الحيوانات',
      icon: Heart,
      color: '#EC4899',
      onPress: () => router.push('/admin-pets-management'),
      moderatorPermissions: ['pets']
    },
    {
      id: 'tips',
      title: 'إدارة النصائح',
      icon: FileText,
      color: '#6366F1',
      onPress: () => router.push('/admin-content-manager?type=tips'),
      moderatorPermissions: ['tips']
    },
    {
      id: 'articles',
      title: 'إدارة المقالات',
      icon: BookOpen,
      color: '#14B8A6',
      onPress: () => router.push('/admin-content-manager?type=articles'),
      moderatorPermissions: ['articles']
    },
    {
      id: 'books',
      title: 'إدارة الكتب',
      icon: Grid3X3,
      color: '#A855F7',
      onPress: () => router.push('/admin-content-manager?type=books'),
      moderatorPermissions: ['books']
    }
  ];

  // Filter actions based on permissions
  const availableActions = quickActions.filter(action => {
    // Super admin can access everything
    if (isSuperAdmin) return true;
    
    // Check if action requires super admin
    if (action.requiresSuperAdmin) return false;
    
    // Check moderator permissions
    if (action.moderatorPermissions) {
      return action.moderatorPermissions.some(permission => 
        hasModeratorPermission(permission)
      );
    }
    
    return false;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>لوحة تحكم الإدارة</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
          <View style={styles.actionsGrid}>
            {availableActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionCard, { borderColor: action.color }]}
                  onPress={action.onPress}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                    <IconComponent size={28} color={COLORS.white} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {availableActions.length === 0 && (
          <View style={styles.noPermissionsContainer}>
            <Shield size={64} color={COLORS.darkGray} />
            <Text style={styles.noPermissionsTitle}>لا توجد صلاحيات</Text>
            <Text style={styles.noPermissionsText}>
              ليس لديك صلاحيات للوصول إلى أي من الأقسام الإدارية.
              يرجى التواصل مع الإدارة العامة لطلب الصلاحيات المناسبة.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 20,
  },
  noPermissionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noPermissionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  noPermissionsText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 24,
  },
});