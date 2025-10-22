import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Image, ActivityIndicator } from 'react-native';
import React, { useState, useMemo } from 'react';
import { COLORS } from "../constants/colors";
import { Stack, router } from 'expo-router';
import { Plus, Search, Edit, Trash2, Package, AlertCircle, Eye, EyeOff, Settings, Users } from 'lucide-react-native';
import { VetStoreProduct } from "../mocks/data";
import { formatPrice } from "../constants/currency";
import Button from "../components/Button";
import { useQuery } from "@tanstack/react-query";


type FilterType = 'all' | 'medicine' | 'equipment' | 'supplements' | 'tools';

export default function WarehouseManagementScreen() {
  const { user } = useApp();
  const { data: warehouses, isLoading, error } = useQuery(trpc.warehouses.getUserWarehouses.queryOptions({ userId: user.id }));

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedProduct, setSelectedProduct] = useState<VetStoreProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any | null>(null);
  const [showWarehouseModal, setShowWarehouseModal] = useState<boolean>(false);

  const products = useMemo(() => {
    if (!warehouses) return [];
    return warehouses.flatMap(w => w.products);
  }, [warehouses]);

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

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'جميع المنتجات', count: products.length },
    { id: 'medicine', label: 'أدوية', count: products.filter(p => p.category === 'أدوية').length },
    { id: 'equipment', label: 'معدات طبية', count: products.filter(p => p.category === 'معدات طبية').length },
    { id: 'supplements', label: 'مكملات غذائية', count: products.filter(p => p.category === 'مكملات غذائية').length },
    { id: 'tools', label: 'أدوات', count: products.filter(p => p.category === 'أدوات').length },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || 
                           (selectedFilter === 'medicine' && product.category === 'أدوية') ||
                           (selectedFilter === 'equipment' && product.category === 'معدات طبية') ||
                           (selectedFilter === 'supplements' && product.category === 'مكملات غذائية') ||
                           (selectedFilter === 'tools' && product.category === 'أدوات');
      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, selectedFilter]);

  const handleAddProduct = () => {
    router.push('/add-product');
  };

  const handleWarehouseSettings = () => {
    router.push('/warehouse-settings');
  };

  const handleEditProduct = (product: VetStoreProduct) => {
    router.push(`/edit-product?id=${product.id}`);
  };

  const handleDeleteProduct = (product: VetStoreProduct) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
      Alert.alert('تم الحذف', 'تم حذف المنتج بنجاح');
    }
  };

  const handleToggleVisibility = (product: VetStoreProduct) => {
    setProducts(prev => prev.map(p => 
      p.id === product.id ? { ...p, inStock: !p.inStock } : p
    ));
  };

  const handleViewProduct = (product: VetStoreProduct) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'نفد المخزون', color: COLORS.red };
    if (quantity < 10) return { label: 'مخزون منخفض', color: '#FF8C00' };
    return { label: 'متوفر', color: COLORS.green };
  };

  const renderFilterChip = (filter: { id: FilterType; label: string; count: number }) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterChip,
        selectedFilter === filter.id && styles.selectedFilterChip,
      ]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Text style={[
        styles.filterText,
        selectedFilter === filter.id && styles.selectedFilterText
      ]}>
        {filter.label} ({filter.count})
      </Text>
    </TouchableOpacity>
  );

  const renderProductCard = (product: VetStoreProduct) => {
    const stockStatus = getStockStatus(product.quantity);
    
    return (
      <View key={product.id} style={styles.productCard}>
        <View style={styles.productHeader}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
              <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
                <Text style={styles.stockText}>{stockStatus.label}</Text>
              </View>
            </View>
            <Text style={styles.quantityText}>الكمية: {product.quantity}</Text>
          </View>
        </View>
        
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleViewProduct(product)}
          >
            <Eye size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>عرض</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditProduct(product)}
          >
            <Edit size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>تعديل</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, product.inStock ? styles.hideButton : styles.showButton]}
            onPress={() => handleToggleVisibility(product)}
          >
            {product.inStock ? <EyeOff size={16} color={COLORS.white} /> : <Eye size={16} color={COLORS.white} />}
            <Text style={styles.actionButtonText}>{product.inStock ? 'إخفاء' : 'إظهار'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProduct(product)}
          >
            <Trash2 size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>حذف</Text>
          </TouchableOpacity>
        </View>
      </View>
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
              <Text style={styles.closeButtonText}>إغلاق</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تفاصيل المنتج</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: selectedProduct.image }} style={styles.modalProductImage} />
            
            <View style={styles.productDetailsContainer}>
              <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
              <Text style={styles.modalProductCategory}>{selectedProduct.category}</Text>
              
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
                <Text style={styles.detailLabel}>الحالة:</Text>
                <Text style={[styles.detailValue, { color: selectedProduct.inStock ? COLORS.green : COLORS.red }]}>
                  {selectedProduct.inStock ? 'مفعل' : 'مخفي'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>تاريخ الإضافة:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedProduct.createdAt).toLocaleDateString('ar-SA')}
                </Text>
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>الوصف:</Text>
                <Text style={styles.modalProductDescription}>
                  {selectedProduct.description || 'لا يوجد وصف متاح لهذا المنتج.'}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const handleWarehousePress = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setShowWarehouseModal(true);
  };

  const renderWarehouseModal = () => {
    if (!selectedWarehouse) return null;

    return (
      <Modal
        visible={showWarehouseModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWarehouseModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowWarehouseModal(false)}
            >
              <Text style={styles.closeButtonText}>إغلاق</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تفاصيل المذخر</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: selectedWarehouse.image }} style={styles.modalProductImage} />
            
            <View style={styles.productDetailsContainer}>
              <Text style={styles.modalProductName}>{selectedWarehouse.name}</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>العنوان:</Text>
                <Text style={styles.detailValue}>{selectedWarehouse.address}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>الهاتف:</Text>
                <Text style={styles.detailValue}>{selectedWarehouse.phone}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>البريد الإلكتروني:</Text>
                <Text style={styles.detailValue}>{selectedWarehouse.email}</Text>
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>الوصف:</Text>
                <Text style={styles.modalProductDescription}>
                  {selectedWarehouse.description || 'لا يوجد وصف متاح لهذا المذخر.'}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إدارة المذخر',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            <TouchableOpacity onPress={() => handleWarehousePress(warehouses[0])}>
              <Text style={{color: 'white', marginRight: 10}}>تفاصيل المذخر</Text>
            </TouchableOpacity>
          )
        }}
      />
      
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Package size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>إجمالي المنتجات</Text>
        </View>
        
        <View style={styles.statCard}>
          <AlertCircle size={24} color={COLORS.warning} />
          <Text style={styles.statNumber}>
            {products.filter(p => p.quantity < 10).length}
          </Text>
          <Text style={styles.statLabel}>مخزون منخفض</Text>
        </View>
        
        <View style={styles.statCard}>
          <Users size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>1,247</Text>
          <Text style={styles.statLabel}>المتابعين</Text>
        </View>
      </View>

      {/* Search, Settings and Add Button */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في المنتجات..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
        
        <TouchableOpacity style={styles.settingsButton} onPress={handleWarehouseSettings}>
          <Settings size={20} color={COLORS.white} />
          <Text style={styles.settingsButtonText}>إعدادات المذخر</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Plus size={20} color={COLORS.white} />
          <Text style={styles.addButtonText}>إضافة منتج</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map(renderFilterChip)}
      </ScrollView>

      {/* Products List */}
      <ScrollView style={styles.productsScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.productsContainer}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(renderProductCard)
          ) : (
            <View style={styles.emptyState}>
              <Package size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>لا توجد منتجات</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'جرب البحث بكلمات أخرى' : 'ابدأ بإضافة منتجات جديدة'}
              </Text>
              {!searchQuery && (
                <Button
                  title="إضافة منتج جديد"
                  onPress={handleAddProduct}
                  type="primary"
                  style={styles.emptyStateButton}
                  icon={<Plus size={20} color={COLORS.white} />}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {renderProductModal()}
      {renderDeleteModal()}
      {renderWarehouseModal()}
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
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
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
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  searchBar: {
    flex: 2,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.white,
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
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  settingsButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  filtersScroll: {
    backgroundColor: COLORS.white,
    maxHeight: 60,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  selectedFilterText: {
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
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row-reverse',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  productActions: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  hideButton: {
    backgroundColor: '#FF9800',
  },
  showButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: COLORS.red,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
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
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
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
  closeButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  placeholder: {
    width: 60,
  },
  modalContent: {
    flex: 1,
  },
  modalProductImage: {
    width: '100%',
    height: 200,
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
    color: COLORS.darkGray,
    textAlign: 'right',
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
    marginTop: 20,
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
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  deleteIcon: {
    marginBottom: 16,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteWarning: {
    fontSize: 14,
    color: COLORS.red,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  confirmDeleteButton: {
    backgroundColor: COLORS.red,
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});