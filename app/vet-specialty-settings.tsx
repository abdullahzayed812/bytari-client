import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";

import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Save, Settings, Bell, Eye, Percent, DollarSign, Package, BarChart3, Globe } from 'lucide-react-native';
import Button from "../components/Button";

type VetSpecialty = 'small_animals' | 'large_animals' | 'birds' | 'fish' | 'poultry' | 'equipment';

const getSpecialtyInfo = (specialty: VetSpecialty) => {
  const specialties = {
    small_animals: { name: 'قطط وكلاب', color: '#FF6B6B', icon: '🐱' },
    large_animals: { name: 'الحيوانات الصغيرة والكبيرة', color: '#4ECDC4', icon: '🐄' },
    birds: { name: 'الطيور', color: '#45B7D1', icon: '🐦' },
    fish: { name: 'الأسماك', color: '#96CEB4', icon: '🐟' },
    poultry: { name: 'الدواجن', color: '#FFA726', icon: '🐔' },
    equipment: { name: 'أجهزة ومعدات بيطرية', color: '#9C27B0', icon: '🔬' },
  };
  return specialties[specialty] || { name: 'غير محدد', color: COLORS.gray, icon: '❓' };
};

export default function VetSpecialtySettingsScreen() {
  const { isRTL } = useI18n();
  const { specialty } = useLocalSearchParams<{ specialty: VetSpecialty }>();
  
  const specialtyInfo = getSpecialtyInfo(specialty!);
  
  // Settings state
  const [isVisible, setIsVisible] = useState(true);
  const [allowOrders, setAllowOrders] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [discountPercentage, setDiscountPercentage] = useState('0');
  const [minimumOrder, setMinimumOrder] = useState('100');
  const [maxDailyOrders, setMaxDailyOrders] = useState('50');
  const [description, setDescription] = useState(`قسم متخصص في منتجات ${specialtyInfo.name}`);
  const [keywords, setKeywords] = useState('');
  const [displayName, setDisplayName] = useState(specialtyInfo.name);
  const [promotionalText, setPromotionalText] = useState('أفضل المنتجات لحيوانك الأليف');
  const [selectedColor, setSelectedColor] = useState(specialtyInfo.color);
  
  const handleSaveSettings = () => {
    Alert.alert(
      'حفظ الإعدادات',
      `تم حفظ إعدادات قسم ${specialtyInfo.name} بنجاح`,
      [{ text: 'موافق' }]
    );
  };
  
  const handleResetSettings = () => {
    Alert.alert(
      'إعادة تعيين الإعدادات',
      'هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'إعادة تعيين', 
          style: 'destructive',
          onPress: () => {
            setIsVisible(true);
            setAllowOrders(true);
            setRequireApproval(false);
            setEnableNotifications(true);
            setDiscountPercentage('0');
            setMinimumOrder('100');
            setMaxDailyOrders('50');
            setDescription(`قسم متخصص في منتجات ${specialtyInfo.name}`);
            setKeywords('');
            setDisplayName(specialtyInfo.name);
            setPromotionalText('أفضل المنتجات لحيوانك الأليف');
            setSelectedColor(specialtyInfo.color);
          }
        }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: `إعدادات ${specialtyInfo.name}`,
          headerStyle: { backgroundColor: specialtyInfo.color },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={[styles.headerCard, { backgroundColor: selectedColor }]}>
          <Text style={styles.headerIcon}>{specialtyInfo.icon}</Text>
          <Text style={styles.headerTitle}>{displayName}</Text>
          <Text style={styles.headerSubtitle}>{description}</Text>
        </View>
        
        {/* Basic Information Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>معلومات القسم الأساسية</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>اسم القسم</Text>
            <TextInput
              style={styles.textInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="اسم القسم"
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>وصف القسم</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="وصف القسم"
              multiline
              numberOfLines={3}
              textAlign={isRTL ? 'right' : 'left'}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>النص الترويجي</Text>
            <TextInput
              style={styles.textInput}
              value={promotionalText}
              onChangeText={setPromotionalText}
              placeholder="النص الترويجي"
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>لون القسم</Text>
            <View style={styles.colorPicker}>
              {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFA726', '#9C27B0', '#FF5722', '#607D8B', '#795548', '#E91E63'].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>
        </View>
        
        {/* Visibility Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>إعدادات الظهور</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>إظهار القسم للعملاء</Text>
              <Text style={styles.settingDescription}>تحكم في ظهور هذا القسم في المتجر</Text>
            </View>
            <Switch
              value={isVisible}
              onValueChange={setIsVisible}
              trackColor={{ false: COLORS.lightGray, true: specialtyInfo.color }}
              thumbColor={isVisible ? COLORS.white : COLORS.gray}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>السماح بالطلبات</Text>
              <Text style={styles.settingDescription}>تمكين أو تعطيل الطلبات لهذا القسم</Text>
            </View>
            <Switch
              value={allowOrders}
              onValueChange={setAllowOrders}
              trackColor={{ false: COLORS.lightGray, true: specialtyInfo.color }}
              thumbColor={allowOrders ? COLORS.white : COLORS.gray}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>يتطلب موافقة الطبيب</Text>
              <Text style={styles.settingDescription}>الطلبات تحتاج موافقة قبل التنفيذ</Text>
            </View>
            <Switch
              value={requireApproval}
              onValueChange={setRequireApproval}
              trackColor={{ false: COLORS.lightGray, true: specialtyInfo.color }}
              thumbColor={requireApproval ? COLORS.white : COLORS.gray}
            />
          </View>
        </View>
        
        {/* Notification Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>إعدادات الإشعارات</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>تفعيل الإشعارات</Text>
              <Text style={styles.settingDescription}>استقبال إشعارات الطلبات والتحديثات</Text>
            </View>
            <Switch
              value={enableNotifications}
              onValueChange={setEnableNotifications}
              trackColor={{ false: COLORS.lightGray, true: specialtyInfo.color }}
              thumbColor={enableNotifications ? COLORS.white : COLORS.gray}
            />
          </View>
        </View>
        
        {/* Pricing Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>إعدادات التسعير</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>نسبة الخصم (%)</Text>
            <View style={styles.inputContainer}>
              <Percent size={20} color={COLORS.gray} />
              <TextInput
                style={styles.textInput}
                value={discountPercentage}
                onChangeText={setDiscountPercentage}
                placeholder="0"
                keyboardType="numeric"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>الحد الأدنى للطلب (ريال)</Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color={COLORS.gray} />
              <TextInput
                style={styles.textInput}
                value={minimumOrder}
                onChangeText={setMinimumOrder}
                placeholder="100"
                keyboardType="numeric"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>الحد الأقصى للطلبات اليومية</Text>
            <View style={styles.inputContainer}>
              <Package size={20} color={COLORS.gray} />
              <TextInput
                style={styles.textInput}
                value={maxDailyOrders}
                onChangeText={setMaxDailyOrders}
                placeholder="50"
                keyboardType="numeric"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>
        </View>
        
        {/* SEO Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>إعدادات تحسين محركات البحث</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>الكلمات المفتاحية</Text>
            <TextInput
              style={styles.textInput}
              value={keywords}
              onChangeText={setKeywords}
              placeholder="أدخل الكلمات المفتاحية مفصولة بفواصل"
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="حفظ الإعدادات"
            onPress={handleSaveSettings}
            type="primary"
            icon={<Save size={20} color={COLORS.white} />}
            style={[styles.actionButton, { backgroundColor: specialtyInfo.color }]}
          />
          
          <Button
            title="إعادة تعيين"
            onPress={handleResetSettings}
            type="secondary"
            style={styles.actionButton}
          />
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push(`/vet-specialty-products?specialty=${specialty}`)}
          >
            <Package size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>إدارة المنتجات</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push(`/vet-specialty-analytics?specialty=${specialty}`)}
          >
            <BarChart3 size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>التقارير والإحصائيات</Text>
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
  content: {
    flex: 1,
  },
  headerCard: {
    padding: 24,
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: COLORS.white,
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: COLORS.black,
  },
  textArea: {
    minHeight: 100,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingTop: 0,
  },
  quickActionButton: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  headerIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: COLORS.black,
    borderWidth: 3,
  },
});