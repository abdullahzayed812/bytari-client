import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { router, Stack } from 'expo-router';
import { Settings, Store, Package, Users, BarChart3, Bell, Shield, Palette, Globe, Save, ArrowLeft, Cat, Dog, Bird, Fish, Egg, Heart, Star, ShoppingCart, Tag, Percent, Clock, MapPin, Phone, Mail, Camera, Edit3 } from 'lucide-react-native';
import Button from "../components/Button";

type StoreCategory = 'cat' | 'dog' | 'bird' | 'fish' | 'poultry';

interface CategorySettings {
  enabled: boolean;
  displayName: string;
  description: string;
  color: string;
  discountPercentage: number;
  featuredProducts: boolean;
  showInHomepage: boolean;
  minimumOrderAmount: number;
}

interface StoreSettings {
  storeName: string;
  storeDescription: string;
  contactPhone: string;
  contactEmail: string;
  storeAddress: string;
  deliveryEnabled: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  operatingHours: {
    open: string;
    close: string;
  };
  categories: Record<StoreCategory, CategorySettings>;
  notifications: {
    newOrders: boolean;
    lowStock: boolean;
    customerReviews: boolean;
    promotions: boolean;
  };
  appearance: {
    primaryColor: string;
    showRatings: boolean;
    showPrices: boolean;
    gridLayout: boolean;
  };
}

const defaultCategorySettings: CategorySettings = {
  enabled: true,
  displayName: '',
  description: '',
  color: '#FF6B6B',
  discountPercentage: 0,
  featuredProducts: false,
  showInHomepage: true,
  minimumOrderAmount: 0,
};

const categoryIcons = {
  cat: <Cat size={24} color={COLORS.white} />,
  dog: <Dog size={24} color={COLORS.white} />,
  bird: <Bird size={24} color={COLORS.white} />,
  fish: <Fish size={24} color={COLORS.white} />,
  poultry: <Egg size={24} color={COLORS.white} />,
};

const categoryLabels = {
  cat: 'قطط',
  dog: 'كلاب',
  bird: 'طيور',
  fish: 'أسماك',
  poultry: 'دواجن',
};

const predefinedColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFA726',
  '#9C27B0', '#FF5722', '#607D8B', '#795548', '#E91E63'
];

export default function PetStoreSettingsScreen() {
  const { t, isRTL } = useI18n();
  const { userMode, isSuperAdmin, isModerator, moderatorPermissions } = useApp();
  
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'متجر الحيوانات الأليفة',
    storeDescription: 'متجر شامل لجميع احتياجات الحيوانات الأليفة من طعام وألعاب وإكسسوارات',
    contactPhone: '+966501234567',
    contactEmail: 'info@petstore.com',
    storeAddress: 'الرياض، المملكة العربية السعودية',
    deliveryEnabled: true,
    deliveryFee: 25,
    freeDeliveryThreshold: 200,
    operatingHours: {
      open: '08:00',
      close: '22:00',
    },
    categories: {
      cat: { ...defaultCategorySettings, displayName: 'قطط', color: '#FF6B6B' },
      dog: { ...defaultCategorySettings, displayName: 'كلاب', color: '#4ECDC4' },
      bird: { ...defaultCategorySettings, displayName: 'طيور', color: '#45B7D1' },
      fish: { ...defaultCategorySettings, displayName: 'أسماك', color: '#96CEB4' },
      poultry: { ...defaultCategorySettings, displayName: 'دواجن', color: '#FFA726' },
    },
    notifications: {
      newOrders: true,
      lowStock: true,
      customerReviews: true,
      promotions: false,
    },
    appearance: {
      primaryColor: COLORS.primary,
      showRatings: true,
      showPrices: true,
      gridLayout: true,
    },
  });

  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'notifications' | 'appearance'>('general');
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | null>(null);

  // Check permissions
  const hasPermission = () => {
    if (isSuperAdmin) return true;
    if (!isModerator || !moderatorPermissions) return false;
    return moderatorPermissions.storeManagement?.petOwnerStores;
  };

  if (!hasPermission()) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'إعدادات المتجر', headerShown: true }} />
        <View style={styles.noPermissionContainer}>
          <Shield size={64} color={COLORS.gray} />
          <Text style={styles.noPermissionText}>ليس لديك صلاحية للوصول إلى إعدادات المتجر</Text>
        </View>
      </View>
    );
  }

  const updateSettings = (updates: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateCategorySettings = (category: StoreCategory, updates: Partial<CategorySettings>) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: { ...prev.categories[category], ...updates }
      }
    }));
  };

  const handleSaveSettings = () => {
    Alert.alert(
      'حفظ الإعدادات',
      'هل تريد حفظ جميع التغييرات؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حفظ',
          onPress: () => {
            // Here you would save to backend
            Alert.alert('تم الحفظ', 'تم حفظ إعدادات المتجر بنجاح');
          }
        }
      ]
    );
  };

  const renderGeneralSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>معلومات المتجر الأساسية</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>اسم المتجر</Text>
          <TextInput
            style={styles.textInput}
            value={settings.storeName}
            onChangeText={(text) => updateSettings({ storeName: text })}
            placeholder="اسم المتجر"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>وصف المتجر</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={settings.storeDescription}
            onChangeText={(text) => updateSettings({ storeDescription: text })}
            placeholder="وصف المتجر"
            multiline
            numberOfLines={3}
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>رقم الهاتف</Text>
          <TextInput
            style={styles.textInput}
            value={settings.contactPhone}
            onChangeText={(text) => updateSettings({ contactPhone: text })}
            placeholder="رقم الهاتف"
            keyboardType="phone-pad"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
          <TextInput
            style={styles.textInput}
            value={settings.contactEmail}
            onChangeText={(text) => updateSettings({ contactEmail: text })}
            placeholder="البريد الإلكتروني"
            keyboardType="email-address"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>عنوان المتجر</Text>
          <TextInput
            style={styles.textInput}
            value={settings.storeAddress}
            onChangeText={(text) => updateSettings({ storeAddress: text })}
            placeholder="عنوان المتجر"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>إعدادات التوصيل</Text>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>تفعيل خدمة التوصيل</Text>
          <Switch
            value={settings.deliveryEnabled}
            onValueChange={(value) => updateSettings({ deliveryEnabled: value })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        {settings.deliveryEnabled && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رسوم التوصيل (ريال)</Text>
              <TextInput
                style={styles.textInput}
                value={settings.deliveryFee.toString()}
                onChangeText={(text) => updateSettings({ deliveryFee: parseFloat(text) || 0 })}
                placeholder="رسوم التوصيل"
                keyboardType="numeric"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الحد الأدنى للتوصيل المجاني (ريال)</Text>
              <TextInput
                style={styles.textInput}
                value={settings.freeDeliveryThreshold.toString()}
                onChangeText={(text) => updateSettings({ freeDeliveryThreshold: parseFloat(text) || 0 })}
                placeholder="الحد الأدنى للتوصيل المجاني"
                keyboardType="numeric"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ساعات العمل</Text>
        
        <View style={styles.timeRow}>
          <View style={styles.timeInput}>
            <Text style={styles.inputLabel}>وقت الفتح</Text>
            <TextInput
              style={styles.textInput}
              value={settings.operatingHours.open}
              onChangeText={(text) => updateSettings({ 
                operatingHours: { ...settings.operatingHours, open: text }
              })}
              placeholder="08:00"
              textAlign="center"
            />
          </View>
          
          <View style={styles.timeInput}>
            <Text style={styles.inputLabel}>وقت الإغلاق</Text>
            <TextInput
              style={styles.textInput}
              value={settings.operatingHours.close}
              onChangeText={(text) => updateSettings({ 
                operatingHours: { ...settings.operatingHours, close: text }
              })}
              placeholder="22:00"
              textAlign="center"
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderCategoriesSettings = () => {
    if (selectedCategory) {
      const categorySettings = settings.categories[selectedCategory];
      
      return (
        <View style={styles.tabContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedCategory(null)}
          >
            <ArrowLeft size={20} color={COLORS.primary} />
            <Text style={styles.backButtonText}>العودة للأقسام</Text>
          </TouchableOpacity>

          <View style={[styles.categoryHeader, { backgroundColor: categorySettings.color }]}>
            {categoryIcons[selectedCategory]}
            <Text style={styles.categoryHeaderTitle}>{categoryLabels[selectedCategory]}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>إعدادات القسم</Text>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>تفعيل القسم</Text>
              <Switch
                value={categorySettings.enabled}
                onValueChange={(value) => updateCategorySettings(selectedCategory, { enabled: value })}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>اسم القسم</Text>
              <TextInput
                style={styles.textInput}
                value={categorySettings.displayName}
                onChangeText={(text) => updateCategorySettings(selectedCategory, { displayName: text })}
                placeholder="اسم القسم"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>وصف القسم</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={categorySettings.description}
                onChangeText={(text) => updateCategorySettings(selectedCategory, { description: text })}
                placeholder="وصف القسم"
                multiline
                numberOfLines={2}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>لون القسم</Text>
              <View style={styles.colorPicker}>
                {predefinedColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      categorySettings.color === color && styles.selectedColor
                    ]}
                    onPress={() => updateCategorySettings(selectedCategory, { color })}
                  />
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>نسبة الخصم (%)</Text>
              <TextInput
                style={styles.textInput}
                value={categorySettings.discountPercentage.toString()}
                onChangeText={(text) => updateCategorySettings(selectedCategory, { discountPercentage: parseFloat(text) || 0 })}
                placeholder="0"
                keyboardType="numeric"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الحد الأدنى للطلب (ريال)</Text>
              <TextInput
                style={styles.textInput}
                value={categorySettings.minimumOrderAmount.toString()}
                onChangeText={(text) => updateCategorySettings(selectedCategory, { minimumOrderAmount: parseFloat(text) || 0 })}
                placeholder="0"
                keyboardType="numeric"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>عرض المنتجات المميزة</Text>
              <Switch
                value={categorySettings.featuredProducts}
                onValueChange={(value) => updateCategorySettings(selectedCategory, { featuredProducts: value })}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>عرض في الصفحة الرئيسية</Text>
              <Switch
                value={categorySettings.showInHomepage}
                onValueChange={(value) => updateCategorySettings(selectedCategory, { showInHomepage: value })}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>إدارة أقسام المتجر</Text>
        <Text style={styles.sectionSubtitle}>اضغط على أي قسم لتخصيص إعداداته</Text>
        
        {(Object.keys(settings.categories) as StoreCategory[]).map((category) => {
          const categorySettings = settings.categories[category];
          
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryCard,
                { backgroundColor: categorySettings.color },
                !categorySettings.enabled && styles.disabledCategory
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <View style={styles.categoryCardContent}>
                <View style={styles.categoryCardLeft}>
                  {categoryIcons[category]}
                  <View style={styles.categoryCardInfo}>
                    <Text style={styles.categoryCardTitle}>{categorySettings.displayName}</Text>
                    <Text style={styles.categoryCardStatus}>
                      {categorySettings.enabled ? 'مفعل' : 'معطل'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.categoryCardRight}>
                  {categorySettings.discountPercentage > 0 && (
                    <View style={styles.discountBadge}>
                      <Percent size={12} color={COLORS.white} />
                      <Text style={styles.discountText}>{categorySettings.discountPercentage}%</Text>
                    </View>
                  )}
                  <Edit3 size={20} color={COLORS.white} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderNotificationsSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>إعدادات الإشعارات</Text>
        
        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>الطلبات الجديدة</Text>
            <Text style={styles.switchDescription}>إشعار عند وصول طلب جديد</Text>
          </View>
          <Switch
            value={settings.notifications.newOrders}
            onValueChange={(value) => updateSettings({ 
              notifications: { ...settings.notifications, newOrders: value }
            })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>نفاد المخزون</Text>
            <Text style={styles.switchDescription}>إشعار عند انخفاض كمية المنتج</Text>
          </View>
          <Switch
            value={settings.notifications.lowStock}
            onValueChange={(value) => updateSettings({ 
              notifications: { ...settings.notifications, lowStock: value }
            })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>تقييمات العملاء</Text>
            <Text style={styles.switchDescription}>إشعار عند إضافة تقييم جديد</Text>
          </View>
          <Switch
            value={settings.notifications.customerReviews}
            onValueChange={(value) => updateSettings({ 
              notifications: { ...settings.notifications, customerReviews: value }
            })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>العروض والخصومات</Text>
            <Text style={styles.switchDescription}>إشعار عند انتهاء العروض</Text>
          </View>
          <Switch
            value={settings.notifications.promotions}
            onValueChange={(value) => updateSettings({ 
              notifications: { ...settings.notifications, promotions: value }
            })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>
    </View>
  );

  const renderAppearanceSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>مظهر المتجر</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>اللون الأساسي</Text>
          <View style={styles.colorPicker}>
            {predefinedColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  settings.appearance.primaryColor === color && styles.selectedColor
                ]}
                onPress={() => updateSettings({ 
                  appearance: { ...settings.appearance, primaryColor: color }
                })}
              />
            ))}
          </View>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>عرض التقييمات</Text>
          <Switch
            value={settings.appearance.showRatings}
            onValueChange={(value) => updateSettings({ 
              appearance: { ...settings.appearance, showRatings: value }
            })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>عرض الأسعار</Text>
          <Switch
            value={settings.appearance.showPrices}
            onValueChange={(value) => updateSettings({ 
              appearance: { ...settings.appearance, showPrices: value }
            })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>عرض شبكي للمنتجات</Text>
          <Switch
            value={settings.appearance.gridLayout}
            onValueChange={(value) => updateSettings({ 
              appearance: { ...settings.appearance, gridLayout: value }
            })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'إعدادات متجر الحيوانات',
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity onPress={handleSaveSettings}>
            <Save size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )
      }} />
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'general' && styles.activeTab]}
          onPress={() => setActiveTab('general')}
        >
          <Settings size={20} color={activeTab === 'general' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.tabText, activeTab === 'general' && styles.activeTabText]}>عام</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
          onPress={() => setActiveTab('categories')}
        >
          <Package size={20} color={activeTab === 'categories' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>الأقسام</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Bell size={20} color={activeTab === 'notifications' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>الإشعارات</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'appearance' && styles.activeTab]}
          onPress={() => setActiveTab('appearance')}
        >
          <Palette size={20} color={activeTab === 'appearance' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.tabText, activeTab === 'appearance' && styles.activeTabText]}>المظهر</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'categories' && renderCategoriesSettings()}
        {activeTab === 'notifications' && renderNotificationsSettings()}
        {activeTab === 'appearance' && renderAppearanceSettings()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPermissionText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500',
  },
  switchLabelContainer: {
    flex: 1,
  },
  switchDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 0.45,
  },
  categoryCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  disabledCategory: {
    opacity: 0.6,
  },
  categoryCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryCardInfo: {
    marginLeft: 12,
  },
  categoryCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  categoryCardStatus: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
  },
  categoryCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  discountText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 12,
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