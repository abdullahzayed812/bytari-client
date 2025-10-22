import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Image, Alert, TextInput } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import Button from "../components/Button";
import { ArrowRight, Plus, Package, BarChart3, Settings, Eye, Edit, Trash2, Search, Filter } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { useApp } from "../providers/AppProvider";
import { formatPrice } from "../constants/currency";

interface StoreProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  isActive: boolean;
  petType: string[];
  rating: number;
  description?: string;
}

export default function StoreProductsManagementScreen() {
  const { t, isRTL } = useI18n();
  const { userMode } = useApp();
  const { storeType } = useLocalSearchParams<{ storeType?: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Determine store type from params or userMode
  const currentStoreType = storeType || (userMode === 'veterinarian' ? 'veterinarian' : 'pet_owner');

  // Mock store data - replace with actual data from API
  const storeData = {
    id: 1,
    name: currentStoreType === 'veterinarian' ? 'متجر الطبيب البيطري' : 'متجر صاحب الحيوان',
    type: currentStoreType === 'veterinarian' ? 'vet_store' : 'pet_owner_store',
    totalProducts: 32,
    totalOrders: 89,

    rating: 4.3,
  };

  const categories = [
    { id: 'all', name: 'جميع المنتجات' },
    { id: 'food', name: 'طعام' },
    { id: 'accessories', name: 'إكسسوارات' },
    { id: 'toys', name: 'ألعاب' },
    { id: 'medicine', name: 'أدوية' },
    { id: 'grooming', name: 'العناية' },
  ];

  const mockProducts: StoreProduct[] = [
    {
      id: 1,
      name: 'طعام قطط بريميوم',
      category: 'food',
      price: 45.00,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
      isActive: true,
      petType: ['cat'],
      rating: 4.5,
      description: 'طعام عالي الجودة للقطط البالغة'
    },
    {
      id: 2,
      name: 'لعبة كرة للكلاب',
      category: 'toys',
      price: 25.00,
      stock: 8,
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
      isActive: true,
      petType: ['dog'],
      rating: 4.2,
      description: 'لعبة تفاعلية للكلاب'
    },
    {
      id: 3,
      name: 'طوق أنيق للقطط',
      category: 'accessories',
      price: 35.00,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
      isActive: false,
      petType: ['cat'],
      rating: 4.0,
      description: 'طوق جلدي أنيق ومريح'
    },
  ];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    router.push(`/add-store-product?storeType=${currentStoreType}`);
  };

  const handleEditProduct = (productId: number) => {
    router.push(`/edit-store-product?id=${productId}&storeType=${currentStoreType}`);
  };

  const handleDeleteProduct = (productId: number) => {
    Alert.alert(
      'حذف المنتج',
      'هل أنت متأكد من حذف هذا المنتج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: () => {
          // Handle delete logic here
          console.log('Delete product:', productId);
        }}
      ]
    );
  };

  const toggleProductStatus = (productId: number) => {
    // Handle toggle product active status
    console.log('Toggle product status:', productId);
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Package size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{storeData.totalProducts}</Text>
          <Text style={styles.statLabel}>إجمالي المنتجات</Text>
        </View>
        <View style={styles.statCard}>
          <BarChart3 size={24} color={COLORS.green} />
          <Text style={styles.statNumber}>{storeData.totalOrders}</Text>
          <Text style={styles.statLabel}>إجمالي الطلبات</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddProduct}>
          <Plus size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>إضافة منتج جديد</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderProductsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.productsHeader}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في المنتجات..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategoryChip
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productCategory}>{categories.find(c => c.id === item.category)?.name}</Text>
              <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
              <Text style={styles.productStock}>المخزون: {item.stock}</Text>
              <View style={styles.productStatus}>
                <Text style={[styles.statusText, { color: item.isActive ? COLORS.green : COLORS.red }]}>
                  {item.isActive ? 'نشط' : 'غير نشط'}
                </Text>
              </View>
            </View>
            <View style={styles.productActions}>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                onPress={() => handleEditProduct(item.id)}
              >
                <Edit size={16} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: item.isActive ? COLORS.warning : COLORS.green }]}
                onPress={() => toggleProductStatus(item.id)}
              >
                <Eye size={16} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: COLORS.red }]}
                onPress={() => handleDeleteProduct(item.id)}
              >
                <Trash2 size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'products':
        return renderProductsTab();
      case 'orders':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoon}>قريباً - إدارة الطلبات</Text>
          </View>
        );
      case 'settings':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoon}>قريباً - إعدادات المتجر</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إدارة المتجر',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      
      <View style={styles.storeHeader}>
        <Text style={styles.storeName}>{storeData.name}</Text>
        <Text style={styles.storeType}>
          {currentStoreType === 'veterinarian' ? 'متجر الطبيب البيطري' : 'متجر صاحب الحيوان'}
        </Text>
      </View>

      <View style={styles.tabsContainer}>
        {[
          { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
          { id: 'products', label: 'المنتجات', icon: Package },
          { id: 'orders', label: 'الطلبات', icon: ArrowRight },
          { id: 'settings', label: 'الإعدادات', icon: Settings },
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <IconComponent 
                size={20} 
                color={activeTab === tab.id ? COLORS.primary : COLORS.darkGray} 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {renderTabContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  storeHeader: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  storeType: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  productsHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: COLORS.black,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesScroll: {
    backgroundColor: COLORS.white,
    maxHeight: 60,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  productCard: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  productCategory: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'right',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.green,
    textAlign: 'right',
  },
  productStock: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  productStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  comingSoon: {
    fontSize: 18,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 50,
  },
});