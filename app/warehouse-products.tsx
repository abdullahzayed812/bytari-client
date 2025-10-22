import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import React, { useState, useMemo } from 'react';
import { COLORS } from "../constants/colors";
import { Search, X, Phone, Star, Package, AlertCircle } from 'lucide-react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { VetStoreProduct } from "../mocks/data";
import { formatPrice } from "../constants/currency";
import { useQuery } from '@tanstack/react-query';

export default function WarehouseProductsScreen() {
  const { storeId } = useLocalSearchParams();
  const { data, isLoading, error } = useQuery(trpc.warehouses.products.list.queryOptions({ warehouseId: Number(storeId) }));

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<VetStoreProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState<boolean>(false);

  const allProducts = data?.products ?? [];
  
  const categories = ['all', ...Array.from(new Set(allProducts.map(product => product.category)))];
  
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchQuery, selectedCategory]);

  const handleProductPress = (product: VetStoreProduct) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'نفد المخزون', color: COLORS.red };
    if (quantity < 10) return { label: 'مخزون منخفض', color: '#FF8C00' };
    return { label: 'متوفر', color: COLORS.green };
  };

  const renderProductCard = (product: VetStoreProduct, index: number) => {
    const stockStatus = getStockStatus(product.quantity);
    
    return (
      <TouchableOpacity 
        key={product.id} 
        style={styles.productCard}
        onPress={() => handleProductPress(product)}
      >
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
          {product.description && (
            <Text style={styles.productDescription} numberOfLines={2}>
              {product.description}
            </Text>
          )}
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
            <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
              <Text style={styles.stockText}>{stockStatus.label}</Text>
            </View>
          </View>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityText}>الكمية المتوفرة: {product.quantity}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProductModal = () => {
    if (!selectedProduct) return null;

    const stockStatus = getStockStatus(selectedProduct.quantity);

    return (
      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProductModal(false)}
            >
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تفاصيل المنتج الطبي</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: selectedProduct.image }} style={styles.modalProductImage} />
            
            <View style={styles.productDetailsContainer}>
              <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
              <Text style={styles.modalProductCategory}>{selectedProduct.category}</Text>
              
              <View style={styles.detailsGrid}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>السعر:</Text>
                  <Text style={styles.detailValue}>{formatPrice(selectedProduct.price)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الكمية المتوفرة:</Text>
                  <Text style={[styles.detailValue, { color: stockStatus.color }]}>
                    {selectedProduct.quantity} ({stockStatus.label})
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>تاريخ الإضافة:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedProduct.createdAt).toLocaleDateString('ar-SA')}
                  </Text>
                </View>
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>الوصف والاستخدام:</Text>
                <Text style={styles.modalProductDescription}>
                  {selectedProduct.description || 'لا يوجد وصف متاح لهذا المنتج الطبي.'}
                </Text>
              </View>

              <View style={styles.warningContainer}>
                <AlertCircle size={20} color={COLORS.warning} />
                <Text style={styles.warningText}>
                  هذا المنتج مخصص للاستخدام البيطري المهني فقط
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.contactOwnerButton}>
              <Phone size={20} color={COLORS.white} />
              <Text style={styles.contactOwnerText}>اتصال بصاحب المذخر</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: `منتجات ${data?.warehouse.name}`,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      
      <View style={styles.storeHeader}>
        <Image source={{ uri: data?.warehouse.image }} style={styles.storeHeaderImage} />
        <View style={styles.storeHeaderInfo}>
          <Text style={styles.storeHeaderName}>{data?.warehouse.name}</Text>
          <Text style={styles.storeHeaderDescription} numberOfLines={2}>
            {data?.warehouse.description}
          </Text>
          <View style={styles.storeHeaderDetails}>
            <Star size={16} color={COLORS.primary} />
            <Text style={styles.storeHeaderRating}>
              {data?.warehouse.rating} ({data?.warehouse.reviewCount} تقييم)
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في المنتجات الطبية..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedCategoryChip,
              { marginLeft: index < categories.length - 1 ? 8 : 0 }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}>
              {category === 'all' ? 'الكل' : category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.productsScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.productsContainer}>
          {filteredProducts.length > 0 ? (
            <View style={styles.productsGrid}>
              {filteredProducts.map((product, index) => renderProductCard(product, index))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Package size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>لا توجد منتجات طبية متاحة</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'جرب البحث بكلمات أخرى' : 'لم يتم إضافة منتجات طبية بعد'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {renderProductModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  storeHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  storeHeaderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    resizeMode: 'cover',
  },
  storeHeaderInfo: {
    flex: 1,
    marginLeft: 16,
  },
  storeHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  storeHeaderDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginBottom: 8,
    lineHeight: 18,
  },
  storeHeaderDetails: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  storeHeaderRating: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 6,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    marginRight: 12,
  },
  categoriesScroll: {
    backgroundColor: COLORS.white,
    maxHeight: 60,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignSelf: 'flex-start',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  productsScrollView: {
    flex: 1,
  },
  productsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '48%',
    marginBottom: 16,
    minHeight: 220,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: 'right',
    marginBottom: 4,
    fontWeight: '600',
  },
  productDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    lineHeight: 16,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  quantityContainer: {
    marginTop: 'auto',
  },
  quantityText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  modalProductImage: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.lightGray,
    resizeMode: 'cover',
  },
  productDetailsContainer: {
    padding: 16,
  },
  modalProductName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 8,
  },
  modalProductCategory: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'right',
    marginBottom: 16,
    fontWeight: '600',
  },
  detailsGrid: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 8,
  },
  modalProductDescription: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'right',
    lineHeight: 24,
  },
  warningContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'right',
    marginRight: 8,
    flex: 1,
    fontWeight: '500',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  contactOwnerButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  contactOwnerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginRight: 8,
  },
});