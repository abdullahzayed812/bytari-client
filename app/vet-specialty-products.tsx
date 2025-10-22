import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Package, Plus, Edit, Trash2, Eye, Search, Filter, BarChart3, Settings } from 'lucide-react-native';
import Button from "../components/Button";
import { Product } from "../types";
import { mockProducts } from "../mocks/data";
import { formatPrice } from "../constants/currency";

type VetSpecialty = 'small_animals' | 'large_animals' | 'birds' | 'fish' | 'poultry' | 'equipment';

const getSpecialtyInfo = (specialty: VetSpecialty) => {
  const specialties = {
    small_animals: { name: 'قطط وكلاب', color: '#FF6B6B' },
    large_animals: { name: 'الحيوانات الصغيرة والكبيرة', color: '#4ECDC4' },
    birds: { name: 'الطيور', color: '#45B7D1' },
    fish: { name: 'الأسماك', color: '#96CEB4' },
    poultry: { name: 'الدواجن', color: '#FFA726' },
    equipment: { name: 'أجهزة ومعدات بيطرية', color: '#9C27B0' },
  };
  return specialties[specialty] || { name: 'غير محدد', color: COLORS.gray };
};

export default function VetSpecialtyProductsScreen() {
  const { t, isRTL } = useI18n();
  const { userMode, isSuperAdmin, isModerator } = useApp();
  const { specialty } = useLocalSearchParams<{ specialty: VetSpecialty }>();
  
  const specialtyInfo = getSpecialtyInfo(specialty!);
  
  // Filter products based on specialty
  const getSpecialtyProducts = () => {
    return mockProducts.filter(product => {
      if (specialty === 'equipment') {
        return product.category === 'accessories' || 
               product.name.toLowerCase().includes('جهاز') || 
               product.name.toLowerCase().includes('معدات');
      }
      
      const animalType = specialty === 'small_animals' ? 'cat' : 
                        specialty === 'large_animals' ? 'dog' :
                        specialty === 'birds' ? 'bird' :
                        specialty === 'fish' ? 'fish' : 'poultry';
      
      return product.petType.includes(animalType);
    });
  };
  
  const [products] = useState<Product[]>(getSpecialtyProducts());
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };
  
  const handleDeleteSelected = () => {
    Alert.alert(
      'حذف المنتجات',
      `هل أنت متأكد من حذف ${selectedProducts.length} منتج؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('تم الحذف', 'تم حذف المنتجات المحددة بنجاح');
            setSelectedProducts([]);
          }
        }
      ]
    );
  };
  
  const handleAddProduct = () => {
    router.push(`/add-store-product?storeType=veterinarian&specialty=${specialty}`);
  };
  
  const handleEditProduct = (productId: string) => {
    router.push(`/edit-store-product?productId=${productId}&specialty=${specialty}`);
  };
  
  const renderProductItem = ({ item }: { item: Product }) => {
    const isSelected = selectedProducts.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.productCard, isSelected && styles.selectedProductCard]}
        onPress={() => handleSelectProduct(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.productHeader}>
          <View style={[styles.selectionIndicator, isSelected && styles.selectedIndicator]} />
          <Image source={{ uri: item.image }} style={styles.productImage} />
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          
          <View style={styles.productStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>المبيعات</Text>
              <Text style={styles.statValue}>45</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>المخزون</Text>
              <Text style={styles.statValue}>120</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>التقييم</Text>
              <Text style={styles.statValue}>{item.rating}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditProduct(item.id)}
          >
            <Edit size={16} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              // TODO: Navigate to product details page
              Alert.alert('عرض المنتج', `عرض تفاصيل المنتج: ${item.name}`);
            }}
          >
            <Eye size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: `منتجات ${specialtyInfo.name}`,
          headerStyle: { backgroundColor: specialtyInfo.color },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      
      {/* Header Stats */}
      <View style={[styles.headerStats, { backgroundColor: specialtyInfo.color }]}>
        <View style={styles.statCard}>
          <Package size={24} color={COLORS.white} />
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>إجمالي المنتجات</Text>
        </View>
        
        <View style={styles.statCard}>
          <BarChart3 size={24} color={COLORS.white} />
          <Text style={styles.statNumber}>1,234</Text>
          <Text style={styles.statLabel}>إجمالي المبيعات</Text>
        </View>
        
        <View style={styles.statCard}>
          <Eye size={24} color={COLORS.white} />
          <Text style={styles.statNumber}>5,678</Text>
          <Text style={styles.statLabel}>المشاهدات</Text>
        </View>
      </View>
      
      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.actionBarLeft}>
          <TouchableOpacity 
            style={styles.selectAllButton}
            onPress={handleSelectAll}
          >
            <Text style={styles.selectAllText}>
              {selectedProducts.length === products.length ? 'إلغاء التحديد' : 'تحديد الكل'}
            </Text>
          </TouchableOpacity>
          
          {selectedProducts.length > 0 && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeleteSelected}
            >
              <Trash2 size={16} color={COLORS.white} />
              <Text style={styles.deleteButtonText}>حذف ({selectedProducts.length})</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.actionBarRight}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => {/* Handle filter */}}
          >
            <Filter size={20} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => {/* Handle search */}}
          >
            <Search size={20} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: specialtyInfo.color }]}
            onPress={handleAddProduct}
          >
            <Plus size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        columnWrapperStyle={styles.productsRow}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => router.push(`/vet-specialty-settings?specialty=${specialty}`)}
        >
          <Settings size={20} color={COLORS.primary} />
          <Text style={styles.quickActionText}>إعدادات القسم</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => router.push(`/vet-specialty-analytics?specialty=${specialty}`)}
        >
          <BarChart3 size={20} color={COLORS.primary} />
          <Text style={styles.quickActionText}>التقارير</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginBottom: 8,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.red,
  },
  deleteButtonText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productsList: {
    padding: 8,
    paddingBottom: 100,
  },
  productsRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  selectedProductCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  productHeader: {
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.gray,
    zIndex: 1,
  },
  selectedIndicator: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
});