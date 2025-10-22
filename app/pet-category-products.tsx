import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { formatPrice } from "../constants/currency";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { Product } from "../types";
import { mockProducts } from "../mocks/data";
import Button from "../components/Button";
import { ArrowRight, Search, Plus, Edit, Trash2, Package, Cat, Dog, Bird, Fish, Egg } from 'lucide-react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';

type AnimalType = 'cat' | 'dog' | 'bird' | 'fish' | 'poultry';

const getAnimalInfo = (category: AnimalType) => {
  const animalMap = {
    cat: { label: 'قطط', icon: <Cat size={24} color={COLORS.primary} />, color: '#FF6B6B' },
    dog: { label: 'كلاب', icon: <Dog size={24} color={COLORS.primary} />, color: '#4ECDC4' },
    bird: { label: 'طيور', icon: <Bird size={24} color={COLORS.primary} />, color: '#45B7D1' },
    fish: { label: 'أسماك', icon: <Fish size={24} color={COLORS.primary} />, color: '#96CEB4' },
    poultry: { label: 'دواجن', icon: <Egg size={24} color={COLORS.primary} />, color: '#FFA726' },
  };
  return animalMap[category];
};

export default function PetCategoryProductsScreen() {
  const { t, isRTL } = useI18n();
  const { isSuperAdmin, isModerator, moderatorPermissions } = useApp();
  const { category } = useLocalSearchParams<{ category: AnimalType }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  if (!category) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>فئة غير صحيحة</Text>
      </View>
    );
  }

  const animalInfo = getAnimalInfo(category);
  
  // Filter products for this animal category
  const categoryProducts = mockProducts.filter(product => {
    const matchesAnimal = product.petType.includes(category);
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAnimal && matchesSearch;
  });

  // Check if user has store management permissions
  const hasStorePermission = () => {
    if (isSuperAdmin) return true;
    if (!isModerator || !moderatorPermissions) return false;
    
    const storePerms = moderatorPermissions.storeManagement;
    if (!storePerms) return false;
    
    return storePerms.petOwnerStores;
  };

  const handleAddProduct = () => {
    router.push(`/add-store-product?storeType=pet_owner&category=${category}`);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/edit-store-product?id=${productId}&category=${category}`);
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'حذف المنتج',
      'هل أنت متأكد من حذف هذا المنتج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => {
            console.log('Delete product:', productId);
          }
        }
      ]
    );
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    
    Alert.alert(
      'حذف المنتجات المحددة',
      `هل أنت متأكد من حذف ${selectedProducts.length} منتج؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => {
            console.log('Delete products:', selectedProducts);
            setSelectedProducts([]);
          }
        }
      ]
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const isSelected = selectedProducts.includes(item.id);
    
    return (
      <View style={[styles.productCard, isSelected && styles.selectedProductCard]}>
        <TouchableOpacity 
          style={styles.productSelectArea}
          onPress={() => handleSelectProduct(item.id)}
        >
          <View style={styles.productImageContainer}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            {isSelected && (
              <View style={styles.selectedOverlay}>
                <Text style={styles.selectedText}>✓</Text>
              </View>
            )}
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
            <Text style={styles.productCategory}>{item.category}</Text>
          </View>
        </TouchableOpacity>
        
        {hasStorePermission() && (
          <View style={styles.productActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditProduct(item.id)}
            >
              <Edit size={16} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteProduct(item.id)}
            >
              <Trash2 size={16} color={COLORS.red} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: `منتجات ${animalInfo.label}`,
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.primary,
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          {animalInfo.icon}
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>منتجات {animalInfo.label}</Text>
            <Text style={styles.headerSubtitle}>إدارة منتجات فئة {animalInfo.label}</Text>
          </View>
        </View>
        
        {hasStorePermission() && (
          <View style={styles.headerActions}>
            {selectedProducts.length > 0 && (
              <TouchableOpacity
                style={[styles.headerButton, styles.deleteAllButton]}
                onPress={handleBulkDelete}
              >
                <Trash2 size={20} color={COLORS.white} />
                <Text style={styles.headerButtonText}>{selectedProducts.length}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleAddProduct}
            >
              <Plus size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder={`ابحث في منتجات ${animalInfo.label}...`}
            placeholderTextColor={COLORS.darkGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Package size={20} color={COLORS.primary} />
          <Text style={styles.statNumber}>{categoryProducts.length}</Text>
          <Text style={styles.statLabel}>منتج</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{selectedProducts.length}</Text>
          <Text style={styles.statLabel}>محدد</Text>
        </View>
      </View>

      <FlatList
        data={categoryProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.productsList, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteAllButton: {
    backgroundColor: COLORS.red,
    flexDirection: 'row',
    paddingHorizontal: 12,
    width: 'auto',
  },
  headerButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  searchSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: COLORS.black,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  productsList: {
    padding: 16,
  },
  productCard: {
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
  productSelectArea: {
    flexDirection: 'row',
    padding: 12,
  },
  productImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
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
    fontSize: 14,
    color: COLORS.darkGray,
    textTransform: 'capitalize',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    fontSize: 18,
    color: COLORS.red,
    textAlign: 'center',
    marginTop: 50,
  },
});