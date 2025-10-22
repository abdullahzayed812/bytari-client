import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { Stack, router } from 'expo-router';
import { Settings, Bell, Eye, Users, Package, Shield, Trash2, Edit, Save, Calendar, RefreshCw } from 'lucide-react-native';
import Button from "../components/Button";

export default function WarehouseSettingsScreen() {
  const [notifications, setNotifications] = useState<boolean>(true);
  const [publicVisibility, setPublicVisibility] = useState<boolean>(true);
  const [allowFollowers, setAllowFollowers] = useState<boolean>(true);
  const [autoApproveProducts, setAutoApproveProducts] = useState<boolean>(false);
  const [showInventoryCount, setShowInventoryCount] = useState<boolean>(true);

  const handleSaveSettings = () => {
    Alert.alert('تم الحفظ', 'تم حفظ إعدادات المذخر بنجاح');
  };

  const handleDeleteWarehouse = () => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف المذخر؟ سيتم حذف جميع المنتجات والبيانات المرتبطة به.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('تم الحذف', 'تم حذف المذخر بنجاح');
            router.back();
          }
        }
      ]
    );
  };

  const SettingItem = ({ title, description, value, onValueChange, children }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    children: React.ReactNode;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <View style={styles.settingHeader}>
          {children}
          <Text style={styles.settingTitle}>{title}</Text>
        </View>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
        thumbColor={value ? COLORS.white : COLORS.darkGray}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إعدادات المذخر',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Subscription Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>إعدادات الاشتراك</Text>
          </View>
          
          <View style={styles.subscriptionContent}>
            <View style={styles.subscriptionBadge}>
              <Text style={styles.subscriptionBadgeText}>نشط</Text>
            </View>
            <Text style={styles.subscriptionPlan}>اشتراك المذخر المميز</Text>
            
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

        {/* General Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>الإعدادات العامة</Text>
          </View>
          
          <SettingItem
            title="الإشعارات"
            description="تلقي إشعارات عند إضافة منتجات جديدة أو تحديث المخزون"
            value={notifications}
            onValueChange={setNotifications}
          >
            <Bell size={18} color={COLORS.darkGray} />
          </SettingItem>
          
          <SettingItem
            title="الظهور العام"
            description="السماح للمستخدمين برؤية المذخر في قائمة المذاخر العامة"
            value={publicVisibility}
            onValueChange={setPublicVisibility}
          >
            <Eye size={18} color={COLORS.darkGray} />
          </SettingItem>
          
          <SettingItem
            title="السماح بالمتابعة"
            description="السماح للمستخدمين بمتابعة المذخر وتلقي تحديثات المنتجات"
            value={allowFollowers}
            onValueChange={setAllowFollowers}
          >
            <Users size={18} color={COLORS.darkGray} />
          </SettingItem>
        </View>

        {/* Product Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>إعدادات المنتجات</Text>
          </View>
          
          <SettingItem
            title="الموافقة التلقائية"
            description="الموافقة التلقائية على المنتجات الجديدة دون مراجعة الإدارة"
            value={autoApproveProducts}
            onValueChange={setAutoApproveProducts}
          >
            <Shield size={18} color={COLORS.darkGray} />
          </SettingItem>
          
          <SettingItem
            title="عرض عدد المخزون"
            description="إظهار عدد القطع المتوفرة للمستخدمين"
            value={showInventoryCount}
            onValueChange={setShowInventoryCount}
          >
            <Package size={18} color={COLORS.darkGray} />
          </SettingItem>
        </View>

        {/* Warehouse Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Edit size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>معلومات المذخر</Text>
          </View>
          
          <TouchableOpacity style={styles.infoItem}>
            <Text style={styles.infoLabel}>اسم المذخر</Text>
            <Text style={styles.infoValue}>مذخر الأدوية البيطرية</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoItem}>
            <Text style={styles.infoLabel}>الوصف</Text>
            <Text style={styles.infoValue}>مذخر متخصص في الأدوية والمعدات البيطرية</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoItem}>
            <Text style={styles.infoLabel}>الموقع</Text>
            <Text style={styles.infoValue}>الرياض، المملكة العربية السعودية</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoItem}>
            <Text style={styles.infoLabel}>رقم الهاتف</Text>
            <Text style={styles.infoValue}>+966 50 123 4567</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>الإحصائيات</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>1,247</Text>
              <Text style={styles.statLabel}>المتابعين</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>156</Text>
              <Text style={styles.statLabel}>المنتجات</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>89</Text>
              <Text style={styles.statLabel}>الطلبات الشهرية</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>التقييم</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button
            title="حفظ الإعدادات"
            onPress={handleSaveSettings}
            type="primary"
            style={styles.saveButton}
            icon={<Save size={20} color={COLORS.white} />}
          />
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteWarehouse}
          >
            <Trash2 size={20} color={COLORS.white} />
            <Text style={styles.deleteButtonText}>حذف المذخر</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  settingItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingInfo: {
    flex: 1,
    marginLeft: 16,
  },
  settingHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    lineHeight: 20,
  },
  infoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  actionsSection: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
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