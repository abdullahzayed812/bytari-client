import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Settings, Bell, Shield, Clock, Users, MapPin, Phone, Mail, Globe, Palette, Moon, Sun, Calendar, RefreshCw } from 'lucide-react-native';

export default function ClinicSettings() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [autoReminders, setAutoReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(true);

  const handleSettingPress = (settingName: string, settingType: string) => {
    switch (settingType) {
      case 'clinic-info':
        handleClinicInfo();
        break;
      case 'contact-info':
        handleContactInfo();
        break;
      case 'working-hours':
        handleWorkingHours();
        break;
      case 'staff-management':
        handleStaffManagement();
        break;
      case 'permissions':
        handlePermissions();
        break;
      case 'language':
        handleLanguage();
        break;
      case 'colors':
        handleColors();
        break;
      case 'security':
        handleSecurity();
        break;
      case 'privacy':
        handlePrivacy();
        break;
      default:
        Alert.alert(
          'إعدادات العيادة',
          `سيتم فتح إعدادات ${settingName}`,
          [{ text: 'موافق' }]
        );
    }
  };

  const handleClinicInfo = () => {
    Alert.alert(
      'معلومات العيادة',
      'اسم العيادة: عيادة الرحمة البيطرية\nالعنوان: بغداد - الكرادة\nالوصف: عيادة بيطرية متخصصة في علاج جميع أنواع الحيوانات الأليفة',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تعديل', onPress: () => Alert.alert('تعديل', 'سيتم فتح نموذج تعديل معلومات العيادة') }
      ]
    );
  };

  const handleContactInfo = () => {
    Alert.alert(
      'معلومات الاتصال',
      'الهاتف: +964 770 123 4567\nالبريد الإلكتروني: info@rahma-vet.com\nالموقع: www.rahma-vet.com\nفيسبوك: @RahmaVetClinic',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تعديل', onPress: () => Alert.alert('تعديل', 'سيتم فتح نموذج تعديل معلومات الاتصال') }
      ]
    );
  };

  const handleWorkingHours = () => {
    Alert.alert(
      'ساعات العمل',
      'السبت - الخميس: 8:00 ص - 8:00 م\nالجمعة: 9:00 ص - 6:00 م\nالعطل الأسبوعية: لا يوجد\nالطوارئ: 24/7',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تعديل', onPress: () => Alert.alert('تعديل', 'سيتم فتح نموذج تعديل ساعات العمل') }
      ]
    );
  };

  const handleStaffManagement = () => {
    Alert.alert(
      'إدارة الموظفين',
      'الموظفون الحاليون:\nد. محمد أحمد - طبيب بيطري رئيسي\nد. فاطمة علي - طبيبة بيطرية\nأحمد حسن - مساعد طبي\nسارة محمد - موظفة استقبال',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'إضافة موظف', onPress: () => Alert.alert('إضافة', 'سيتم فتح نموذج إضافة موظف جديد') },
        { text: 'إدارة', onPress: () => Alert.alert('إدارة', 'سيتم فتح صفحة إدارة الموظفين') }
      ]
    );
  };

  const handlePermissions = () => {
    Alert.alert(
      'الصلاحيات',
      'صلاحيات الموظفين:\nالطبيب الرئيسي: جميع الصلاحيات\nالأطباء: عرض وتعديل ملفات الحيوانات\nالمساعدين: عرض ملفات الحيوانات\nموظفي الاستقبال: حجز المواعيد',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تعديل', onPress: () => Alert.alert('تعديل', 'سيتم فتح نموذج تعديل الصلاحيات') }
      ]
    );
  };

  const handleLanguage = () => {
    Alert.alert(
      'اختيار اللغة',
      'اختر لغة التطبيق:',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'العربية ✓', onPress: () => Alert.alert('تم', 'تم اختيار اللغة العربية') },
        { text: 'English', onPress: () => Alert.alert('تم', 'تم اختيار اللغة الإنجليزية') },
        { text: 'Kurdî', onPress: () => Alert.alert('تم', 'تم اختيار اللغة الكردية') }
      ]
    );
  };

  const handleColors = () => {
    Alert.alert(
      'ألوان العيادة',
      'اختر نظام الألوان:',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'الأزرق ✓', onPress: () => Alert.alert('تم', 'تم اختيار اللون الأزرق') },
        { text: 'الأخضر', onPress: () => Alert.alert('تم', 'تم اختيار اللون الأخضر') },
        { text: 'البنفسجي', onPress: () => Alert.alert('تم', 'تم اختيار اللون البنفسجي') },
        { text: 'البرتقالي', onPress: () => Alert.alert('تم', 'تم اختيار اللون البرتقالي') }
      ]
    );
  };

  const handleSecurity = () => {
    Alert.alert(
      'إعدادات الأمان',
      'اختر إعداد الأمان:',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تغيير كلمة المرور', onPress: () => Alert.alert('تغيير', 'سيتم فتح نموذج تغيير كلمة المرور') },
        { text: 'المصادقة الثنائية', onPress: () => Alert.alert('مصادقة', 'سيتم تفعيل المصادقة الثنائية') },
        { text: 'سجل الدخول', onPress: () => Alert.alert('سجل', 'عرض سجل دخول الموظفين') }
      ]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'إعدادات الخصوصية',
      'اختر إعداد الخصوصية:',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'سياسة الخصوصية', onPress: () => Alert.alert('سياسة', 'عرض سياسة الخصوصية') },
        { text: 'مشاركة البيانات', onPress: () => Alert.alert('مشاركة', 'إعدادات مشاركة البيانات') },
        { text: 'حذف البيانات', onPress: () => Alert.alert('حذف', 'طلب حذف جميع البيانات') }
      ]
    );
  };

  const handleSave = () => {
    Alert.alert(
      'تم الحفظ',
      'تم حفظ إعدادات العيادة بنجاح',
      [{ text: 'موافق' }]
    );
  };

  const settingsGroups = [
    {
      title: 'معلومات العيادة',
      items: [
        {
          id: 'clinic-info',
          title: 'معلومات أساسية',
          subtitle: 'اسم العيادة، العنوان، الوصف',
          icon: MapPin,
          onPress: () => handleSettingPress('المعلومات الأساسية', 'clinic-info')
        },
        {
          id: 'contact-info',
          title: 'معلومات الاتصال',
          subtitle: 'الهاتف، البريد الإلكتروني، الموقع',
          icon: Phone,
          onPress: () => handleSettingPress('معلومات الاتصال', 'contact-info')
        },
        {
          id: 'working-hours',
          title: 'ساعات العمل',
          subtitle: 'أوقات فتح وإغلاق العيادة',
          icon: Clock,
          onPress: () => handleSettingPress('ساعات العمل', 'working-hours')
        }
      ]
    },
    {
      title: 'إدارة الموظفين',
      items: [
        {
          id: 'staff-management',
          title: 'إدارة الموظفين',
          subtitle: 'إضافة وإدارة الأطباء والموظفين',
          icon: Users,
          onPress: () => handleSettingPress('الموظفين', 'staff-management')
        },
        {
          id: 'permissions',
          title: 'الصلاحيات',
          subtitle: 'تحديد صلاحيات الوصول للموظفين',
          icon: Shield,
          onPress: () => handleSettingPress('الصلاحيات', 'permissions')
        }
      ]
    },
    {
      title: 'الإشعارات',
      items: [
        {
          id: 'push-notifications',
          title: 'الإشعارات الفورية',
          subtitle: 'إشعارات التطبيق',
          icon: Bell,
          toggle: true,
          value: notifications,
          onToggle: setNotifications
        },
        {
          id: 'email-notifications',
          title: 'إشعارات البريد الإلكتروني',
          subtitle: 'إرسال إشعارات عبر البريد',
          icon: Mail,
          toggle: true,
          value: emailNotifications,
          onToggle: setEmailNotifications
        },
        {
          id: 'sms-notifications',
          title: 'إشعارات الرسائل النصية',
          subtitle: 'إرسال إشعارات عبر SMS',
          icon: Phone,
          toggle: true,
          value: smsNotifications,
          onToggle: setSmsNotifications
        },
        {
          id: 'auto-reminders',
          title: 'التذكيرات التلقائية',
          subtitle: 'إرسال تذكيرات المواعيد تلقائياً',
          icon: Clock,
          toggle: true,
          value: autoReminders,
          onToggle: setAutoReminders
        }
      ]
    },
    {
      title: 'المظهر والعرض',
      items: [
        {
          id: 'theme',
          title: 'الوضع الليلي',
          subtitle: 'تفعيل الوضع المظلم',
          icon: darkMode ? Moon : Sun,
          toggle: true,
          value: darkMode,
          onToggle: setDarkMode
        },
        {
          id: 'language',
          title: 'اللغة',
          subtitle: 'العربية',
          icon: Globe,
          onPress: () => handleSettingPress('اللغة', 'language')
        },
        {
          id: 'colors',
          title: 'ألوان العيادة',
          subtitle: 'تخصيص ألوان واجهة العيادة',
          icon: Palette,
          onPress: () => handleSettingPress('الألوان', 'colors')
        }
      ]
    },
    {
      title: 'الأمان والخصوصية',
      items: [
        {
          id: 'security',
          title: 'إعدادات الأمان',
          subtitle: 'كلمات المرور والمصادقة',
          icon: Shield,
          onPress: () => handleSettingPress('الأمان', 'security')
        },
        {
          id: 'privacy',
          title: 'الخصوصية',
          subtitle: 'إعدادات حماية البيانات',
          icon: Shield,
          onPress: () => handleSettingPress('الخصوصية', 'privacy')
        }
      ]
    }
  ];

  const renderSettingItem = (item: any) => {
    if (item.toggle) {
      return (
        <View key={item.id} style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View style={styles.settingIcon}>
              <item.icon size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '40' }}
            thumbColor={item.value ? COLORS.primary : COLORS.darkGray}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.settingItem}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingContent}>
          <View style={styles.settingIcon}>
            <item.icon size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <ArrowLeft size={16} color={COLORS.darkGray} style={{ transform: [{ rotate: '180deg' }] }} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إعدادات العيادة</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>حفظ</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Clinic Info Card */}
          <View style={styles.clinicCard}>
            <View style={styles.clinicHeader}>
              <View style={styles.clinicIconContainer}>
                <Settings size={24} color={COLORS.white} />
              </View>
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>عيادة الرحمة البيطرية</Text>
                <Text style={styles.clinicStatus}>نشط - Premium</Text>
              </View>
            </View>
          </View>

          {/* Subscription Settings */}
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <Calendar size={20} color={COLORS.primary} />
              <Text style={styles.subscriptionTitle}>إعدادات الاشتراك</Text>
            </View>
            
            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionBadge}>
                <Text style={styles.subscriptionBadgeText}>نشط</Text>
              </View>
              <Text style={styles.subscriptionPlan}>اشتراك العيادة المميز</Text>
              
              <View style={styles.subscriptionDates}>
                <View style={styles.dateItem}>
                  <Calendar size={16} color={COLORS.darkGray} />
                  <Text style={styles.dateLabel}>تاريخ البداية:</Text>
                  <Text style={styles.dateValue}>2024-01-15</Text>
                </View>
                
                <View style={styles.dateItem}>
                  <Calendar size={16} color={COLORS.darkGray} />
                  <Text style={styles.dateLabel}>تاريخ الانتهاء:</Text>
                  <Text style={styles.dateValue}>2024-12-15</Text>
                </View>
              </View>
              
              <View style={styles.subscriptionActions}>
                <TouchableOpacity 
                  style={styles.renewButton}
                  onPress={() => Alert.alert('تجديد الاشتراك', 'سيتم فتح صفحة تجديد الاشتراك')}
                >
                  <RefreshCw size={16} color={COLORS.white} />
                  <Text style={styles.renewButtonText}>تجديد الاشتراك</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.followUpButton}
                  onPress={() => Alert.alert('متابعة الاشتراك', 'عرض تفاصيل الاشتراك والفواتير')}
                >
                  <Text style={styles.followUpButtonText}>متابعة الاشتراك</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Settings Groups */}
          {settingsGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.settingsGroup}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.groupContainer}>
                {group.items.map((item, itemIndex) => (
                  <View key={item.id}>
                    {renderSettingItem(item)}
                    {itemIndex < group.items.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.groupTitle}>إجراءات سريعة</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert('نسخ احتياطي', 'سيتم إنشاء نسخة احتياطية من بيانات العيادة')}
              >
                <Shield size={20} color={COLORS.primary} />
                <Text style={styles.actionText}>نسخ احتياطي</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert('استيراد البيانات', 'سيتم استيراد البيانات من ملف')}
              >
                <Globe size={20} color={COLORS.success} />
                <Text style={styles.actionText}>استيراد البيانات</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert('تصدير البيانات', 'سيتم تصدير بيانات العيادة')}
              >
                <Mail size={20} color={COLORS.warning} />
                <Text style={styles.actionText}>تصدير البيانات</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert('إعادة تعيين', 'هل تريد إعادة تعيين جميع الإعدادات؟')}
              >
                <Settings size={20} color={COLORS.error} />
                <Text style={styles.actionText}>إعادة تعيين</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  clinicCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  clinicHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  clinicIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clinicInfo: {
    flex: 1,
    marginRight: 16,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  clinicStatus: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '600',
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  groupContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
    textAlign: 'right',
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
  },
  quickActions: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: 8,
    textAlign: 'center',
  },
  subscriptionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  subscriptionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  subscriptionContent: {
    gap: 12,
  },
  subscriptionBadge: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  subscriptionPlan: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'right',
  },
  subscriptionDates: {
    gap: 8,
  },
  dateItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: 'right',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  subscriptionActions: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginTop: 8,
  },
  renewButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  renewButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  followUpButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followUpButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});