import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, TextInput, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Settings, Package, Users, BarChart3, Bell, Shield, Palette, Save, ArrowLeft, Cat, Dog, Bird, Fish, Egg, Heart, Star, ShoppingCart, Tag, Percent, Clock, MapPin, Phone, Mail, Camera, Edit3, Plus, Trash2, Eye, EyeOff } from 'lucide-react-native';
import Button from "../components/Button";

type AnimalType = 'cat' | 'dog' | 'bird' | 'fish' | 'poultry';

interface ProductSettings {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  featured: boolean;
  visible: boolean;
  stock: number;
  minStock: number;
}

interface CategorySpecificSettings {
  displayName: string;
  description: string;
  color: string;
  bannerImage?: string;
  promotionalText?: string;
  specialOffers: {
    enabled: boolean;
    discountPercentage: number;
    validUntil?: string;
  };
  featuredProducts: ProductSettings[];
  customCategories: {
    id: string;
    name: string;
    enabled: boolean;
  }[];
  deliveryOptions: {
    freeDeliveryThreshold: number;
    expressDelivery: boolean;
    scheduledDelivery: boolean;
  };
  notifications: {
    newProducts: boolean;
    stockAlerts: boolean;
    promotions: boolean;
  };
}

const categoryIcons = {
  cat: <Cat size={32} color={COLORS.white} />,
  dog: <Dog size={32} color={COLORS.white} />,
  bird: <Bird size={32} color={COLORS.white} />,
  fish: <Fish size={32} color={COLORS.white} />,
  poultry: <Egg size={32} color={COLORS.white} />,
};

const categoryLabels = {
  cat: 'قطط',
  dog: 'كلاب',
  bird: 'طيور',
  fish: 'أسماك',
  poultry: 'دواجن',
};

const categoryColors = {
  cat: '#FF6B6B',
  dog: '#4ECDC4',
  bird: '#45B7D1',
  fish: '#96CEB4',
  poultry: '#FFA726',
};

const predefinedColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFA726',
  '#9C27B0', '#FF5722', '#607D8B', '#795548', '#E91E63'
];

const mockProducts: ProductSettings[] = [
  {
    id: '1',
    name: 'طعام قطط ممتاز',
    description: 'طعام عالي الجودة للقطط البالغة',
    price: 85,
    discountPrice: 75,
    image: 'https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?w=300&h=300&fit=crop',
    featured: true,
    visible: true,
    stock: 50,
    minStock: 10,
  },
  {
    id: '2',
    name: 'لعبة تفاعلية للقطط',
    description: 'لعبة ذكية تحفز نشاط القطط',
    price: 45,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop',
    featured: false,
    visible: true,
    stock: 25,
    minStock: 5,
  },
];

export default function PetCategorySettingsScreen() {
  const { t, isRTL } = useI18n();
  const { userMode, isSuperAdmin, isModerator, moderatorPermissions } = useApp();
  const { category } = useLocalSearchParams<{ category: AnimalType }>();
  
  const [settings, setSettings] = useState<CategorySpecificSettings>({
    displayName: categoryLabels[category as AnimalType] || 'قسم الحيوانات',
    description: `قسم متخصص في منتجات ${categoryLabels[category as AnimalType]}`,
    color: categoryColors[category as AnimalType] || '#FF6B6B',
    bannerImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=300&fit=crop',
    promotionalText: 'أفضل المنتجات لحيوانك الأليف',
    specialOffers: {
      enabled: true,
      discountPercentage: 15,
      validUntil: '2024-12-31',
    },
    featuredProducts: mockProducts,
    customCategories: [
      { id: '1', name: 'طعام جاف', enabled: true },
      { id: '2', name: 'طعام رطب', enabled: true },
      { id: '3', name: 'ألعاب', enabled: true },
      { id: '4', name: 'إكسسوارات', enabled: false },
    ],
    deliveryOptions: {
      freeDeliveryThreshold: 150,
      expressDelivery: true,
      scheduledDelivery: false,
    },
    notifications: {
      newProducts: true,
      stockAlerts: true,
      promotions: false,
    },
  });

  const [activeTab, setActiveTab] = useState<'general' | 'products' | 'categories' | 'delivery' | 'notifications'>('general');

  // Check permissions
  const hasPermission = () => {
    if (isSuperAdmin) return true;
    if (!isModerator || !moderatorPermissions) return false;
    return moderatorPermissions.storeManagement?.petOwnerStores;
  };

  if (!hasPermission()) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: `إعدادات ${categoryLabels[category as AnimalType]}`, headerShown: true }} />
        <View style={styles.noPermissionContainer}>
          <Shield size={64} color={COLORS.gray} />
          <Text style={styles.noPermissionText}>ليس لديك صلاحية للوصول إلى إعدادات هذا القسم</Text>
        </View>
      </View>
    );
  }

  const updateSettings = (updates: Partial<CategorySpecificSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
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
            Alert.alert('تم الحفظ', `تم حفظ إعدادات قسم ${categoryLabels[category as AnimalType]} بنجاح`);
          }
        }
      ]
    );
  };

  const toggleProductVisibility = (productId: string) => {
    setSettings(prev => ({
      ...prev,
      featuredProducts: prev.featuredProducts.map(product =>
        product.id === productId ? { ...product, visible: !product.visible } : product
      )
    }));
  };

  const toggleProductFeatured = (productId: string) => {
    setSettings(prev => ({
      ...prev,
      featuredProducts: prev.featuredProducts.map(product =>
        product.id === productId ? { ...product, featured: !product.featured } : product
      )
    }));
  };

  const toggleCustomCategory = (categoryId: string) => {
    setSettings(prev => ({
      ...prev,
      customCategories: prev.customCategories.map(cat =>
        cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
      )
    }));
  };

  const renderGeneralSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>معلومات القسم الأساسية</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>اسم القسم</Text>
          <TextInput
            style={styles.textInput}
            value={settings.displayName}
            onChangeText={(text) => updateSettings({ displayName: text })}
            placeholder="اسم القسم"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>وصف القسم</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={settings.description}
            onChangeText={(text) => updateSettings({ description: text })}
            placeholder="وصف القسم"
            multiline
            numberOfLines={3}
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
                  settings.color === color && styles.selectedColor
                ]}
                onPress={() => updateSettings({ color })}
              />
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>النص الترويجي</Text>
          <TextInput
            style={styles.textInput}
            value={settings.promotionalText}
            onChangeText={(text) => updateSettings({ promotionalText: text })}
            placeholder="النص الترويجي"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>العروض الخاصة</Text>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>تفعيل العروض الخاصة</Text>
          <Switch
            value={settings.specialOffers.enabled}
            onValueChange={(value) => updateSettings({ 
              specialOffers: { ...settings.specialOffers, enabled: value }
            })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        {settings.specialOffers.enabled && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>نسبة الخصم (%)</Text>
              <TextInput
                style={styles.textInput}
                value={settings.specialOffers.discountPercentage.toString()}
                onChangeText={(text) => updateSettings({ 
                  specialOffers: { ...settings.specialOffers, discountPercentage: parseFloat(text) || 0 }
                })}
                placeholder="نسبة الخصم"
                keyboardType="numeric"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>صالح حتى تاريخ</Text>
              <TextInput
                style={styles.textInput}
                value={settings.specialOffers.validUntil}
                onChangeText={(text) => updateSettings({ 
                  specialOffers: { ...settings.specialOffers, validUntil: text }
                })}
                placeholder="YYYY-MM-DD"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );

  const renderProductsSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>المنتجات المميزة</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push(`/add-store-product?category=${category}`)}
          >
            <Plus size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        {settings.featuredProducts.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDescription}>{product.description}</Text>
              <View style={styles.productPriceRow}>
                <Text style={styles.productPrice}>{product.price} ريال</Text>
                {product.discountPrice && (
                  <Text style={styles.productDiscountPrice}>{product.discountPrice} ريال</Text>
                )}
              </View>
              <View style={styles.productStock}>
                <Text style={styles.stockText}>المخزون: {product.stock}</Text>
                {product.stock <= product.minStock && (
                  <Text style={styles.lowStockWarning}>مخزون منخفض!</Text>
                )}
              </View>
            </View>
            <View style={styles.productActions}>
              <TouchableOpacity
                style={[styles.actionButton, product.featured && styles.featuredButton]}
                onPress={() => toggleProductFeatured(product.id)}
              >
                <Star size={16} color={product.featured ? COLORS.yellow : COLORS.gray} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, !product.visible && styles.hiddenButton]}
                onPress={() => toggleProductVisibility(product.id)}
              >
                {product.visible ? (
                  <Eye size={16} color={COLORS.primary} />
                ) : (
                  <EyeOff size={16} color={COLORS.gray} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/edit-store-product?id=${product.id}`)}
              >
                <Edit3 size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCategoriesSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الفئات المخصصة</Text>
        <Text style={styles.sectionSubtitle}>قم بتفعيل أو إلغاء تفعيل الفئات الفرعية لهذا القسم</Text>
        
        {settings.customCategories.map((cat) => (
          <View key={cat.id} style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <Text style={styles.categoryStatus}>
                {cat.enabled ? 'مفعل' : 'معطل'}
              </Text>
            </View>
            <Switch
              value={cat.enabled}
              onValueChange={() => toggleCustomCategory(cat.id)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        ))}
        
        <TouchableOpacity style={styles.addCategoryButton}>
          <Plus size={20} color={COLORS.primary} />
          <Text style={styles.addCategoryText}>إضافة فئة جديدة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDeliverySettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>خيارات التوصيل</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>الحد الأدنى للتوصيل المجاني (ريال)</Text>
          <TextInput
            style={styles.textInput}
            value={settings.deliveryOptions.freeDeliveryThreshold.toString()}
            onChangeText={(text) => updateSettings({ 
              deliveryOptions: { ...settings.deliveryOptions, freeDeliveryThreshold: parseFloat(text) || 0 }
            })}
            placeholder="الحد الأدنى للتوصيل المجاني"
            keyboardType="numeric"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>التوصيل السريع</Text>
          <Switch
            value={settings.deliveryOptions.expressDelivery}
            onValueChange={(value) => updateSettings({ 
              deliveryOptions: { ...settings.deliveryOptions, expressDelivery: value }
            })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>التوصيل المجدول</Text>
          <Switch
            value={settings.deliveryOptions.scheduledDelivery}
            onValueChange={(value) => updateSettings({ 
              deliveryOptions: { ...settings.deliveryOptions, scheduledDelivery: value }
            })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>
    </View>
  );

  const renderNotificationsSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>إعدادات الإشعارات</Text>
        
        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>المنتجات الجديدة</Text>
            <Text style={styles.switchDescription}>إشعار عند إضافة منتجات جديدة لهذا القسم</Text>
          </View>
          <Switch
            value={settings.notifications.newProducts}
            onValueChange={(value) => updateSettings({ 
              notifications: { ...settings.notifications, newProducts: value }
            })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>تنبيهات المخزون</Text>
            <Text style={styles.switchDescription}>إشعار عند انخفاض مخزون المنتجات</Text>
          </View>
          <Switch
            value={settings.notifications.stockAlerts}
            onValueChange={(value) => updateSettings({ 
              notifications: { ...settings.notifications, stockAlerts: value }
            })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>العروض الترويجية</Text>
            <Text style={styles.switchDescription}>إشعار عند انتهاء العروض الخاصة</Text>
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: `إعدادات ${categoryLabels[category as AnimalType]}`,
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity onPress={handleSaveSettings}>
            <Save size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )
      }} />
      
      <View style={[styles.categoryBanner, { backgroundColor: settings.color }]}>
        {categoryIcons[category as AnimalType]}
        <Text style={styles.categoryBannerTitle}>{settings.displayName}</Text>
        <Text style={styles.categoryBannerSubtitle}>{settings.description}</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'general' && styles.activeTab]}
          onPress={() => setActiveTab('general')}
        >
          <Settings size={16} color={activeTab === 'general' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.tabText, activeTab === 'general' && styles.activeTabText]}>عام</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Package size={16} color={activeTab === 'products' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>المنتجات</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
          onPress={() => setActiveTab('categories')}
        >
          <Tag size={16} color={activeTab === 'categories' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>الفئات</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'delivery' && styles.activeTab]}
          onPress={() => setActiveTab('delivery')}
        >
          <ShoppingCart size={16} color={activeTab === 'delivery' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.tabText, activeTab === 'delivery' && styles.activeTabText]}>التوصيل</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Bell size={16} color={activeTab === 'notifications' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>الإشعارات</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'products' && renderProductsSettings()}
        {activeTab === 'categories' && renderCategoriesSettings()}
        {activeTab === 'delivery' && renderDeliverySettings()}
        {activeTab === 'notifications' && renderNotificationsSettings()}
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
  categoryBanner: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 12,
    marginBottom: 4,
  },
  categoryBannerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
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
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginHorizontal: 1,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 10,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 8,
  },
  productDiscountPrice: {
    fontSize: 12,
    color: COLORS.red,
    textDecorationLine: 'line-through',
  },
  productStock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginRight: 8,
  },
  lowStockWarning: {
    fontSize: 10,
    color: COLORS.red,
    fontWeight: 'bold',
  },
  productActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featuredButton: {
    backgroundColor: '#FFF3CD',
  },
  hiddenButton: {
    backgroundColor: '#F8D7DA',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
  },
  categoryStatus: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginTop: 16,
  },
  addCategoryText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
});