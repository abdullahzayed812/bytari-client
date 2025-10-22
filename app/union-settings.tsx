import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ArrowRight,
  Settings,
  Bell,
  Users,
  BarChart3,
} from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { COLORS } from "../constants/colors";
import { SafeAreaView } from 'react-native-safe-area-context';
export default function UnionSettingsScreen() {
  const router = useRouter();

  const handleSettingPress = (settingId: string) => {
    switch (settingId) {
      case 'general':
        router.push('/union-general-settings');
        break;
      case 'notifications':
        router.push('/union-notifications-settings');
        break;
      case 'users':
        router.push('/union-users-management');
        break;
      case 'analytics':
        router.push('/union-analytics');
        break;
      default:
        Alert.alert('قريباً', 'سيتم تطوير هذا القسم قريباً');
    }
  };

  const settingsOptions = [
    {
      id: 'general',
      title: 'الإعدادات العامة',
      description: 'إعدادات النظام الأساسية',
      icon: Settings,
      color: '#0EA5E9'
    },
    {
      id: 'notifications',
      title: 'إعدادات الإشعارات',
      description: 'إدارة الإشعارات والتنبيهات',
      icon: Bell,
      color: '#10B981'
    },
    {
      id: 'users',
      title: 'إدارة المستخدمين',
      description: 'صلاحيات المستخدمين والمشرفين',
      icon: Users,
      color: '#F59E0B'
    },
    {
      id: 'analytics',
      title: 'إعدادات التحليلات',
      description: 'تكوين التقارير والإحصائيات',
      icon: BarChart3,
      color: '#8B5CF6'
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إعدادات النقابة</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>إعدادات النظام</Text>
        
        {settingsOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <TouchableOpacity 
              key={option.id} 
              style={styles.settingCard}
              onPress={() => handleSettingPress(option.id)}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                <IconComponent size={24} color={COLORS.white} />
              </View>
              
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingDescription}>{option.description}</Text>
              </View>
              
              <ArrowRight size={20} color={COLORS.darkGray} />
            </TouchableOpacity>
          );
        })}
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
    backgroundColor: COLORS.primary,
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 20,
    textAlign: 'right',
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
});