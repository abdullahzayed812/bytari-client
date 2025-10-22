import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Image, Alert, TextInput, Modal } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import Button from "../components/Button";
import { Plus, Edit, Trash2, Search, Filter, X, Save, Camera, Upload, Package, ShoppingBag } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { mockProducts } from "../mocks/data";
import { Product } from "../types";
import { formatPrice } from "../constants/currency";
import * as ImagePicker from 'expo-image-picker';

interface EditProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  petType: string[];
  image: string;
  inStock: boolean;
}

export default function PetStoreManagementScreen() {
  const { isRTL } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditProductData | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (selectedFilter) {
      case 'inStock':
        return product.inStock !== false; // Mock in stock criteria
      case 'outOfStock':
        return product.inStock === false; // Mock out of stock criteria
      default:
        return true;
    }
  });

  const handleEditProduct = (product: Product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      petType: product.petType,
      image: product.image,
      inStock: product.inStock !== false,
    });
    setSelectedImage(product.image);
    setEditModalVisible(true);
  };

  const handleSaveProduct = () => {
    if (!editingProduct) return;
    
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === editingProduct.id 
          ? { ...product, ...editingProduct }
          : product
      )
    );
    
    setEditModalVisible(false);
    setEditingProduct(null);
    setSelectedImage(null);
    
    Alert.alert('تم الحفظ', 'تم تحديث بيانات المنتج بنجاح');
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'حذف المنتج',
      `هل أنت متأكد من حذف منتج "${productName}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive', 
          onPress: () => {
            setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
            Alert.alert('تم الحذف', 'تم حذف المنتج بنجاح');
          }
        }
      ]
    );
  };

  const handleDeleteAllProducts = () => {
    Alert.alert(
      'حذف جميع المنتجات',
      'هل أنت متأكد من حذف جميع المنتجات؟\n\nهذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف الكل', 
          style: 'destructive', 
          onPress: () => {
            setProducts([]);
            Alert.alert('تم الحذف', 'تم حذف جميع المنتجات بنجاح');
          }
        }
      ]
    );
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('خطأ', 'يجب السماح بالوصول إلى المعرض لاختيار الصور');
        return;
      }

      Alert.alert(
        'اختيار الصورة',
        'كيف تريد إضافة الصورة؟',
        [
          {
            text: 'من المعرض',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
                setEditingProduct(prev => prev ? {...prev, image: result.assets[0].uri} : null);
              }
            }
          },
          {
            text: 'التقاط صورة',
            onPress: async () => {
              const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
              
              if (cameraPermission.granted === false) {
                Alert.alert('خطأ', 'يجب السماح بالوصول إلى الكاميرا');
                return;
              }

              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
                setEditingProduct(prev => prev ? {...prev, image: result.assets[0].uri} : null);
              }
            }
          },
          { text: 'إلغاء', style: 'cancel' }
        ]
      );
    } catch {
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setEditingProduct(prev => prev ? {...prev, image: ''} : null);
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          </View>
        </View>
        
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.productDetails}>
          <View style={styles.detailItem}>
            <Package size={14} color={COLORS.darkGray} />
            <Text style={styles.detailText}>
              {item.category}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <ShoppingBag size={14} color={COLORS.darkGray} />
            <Text style={styles.detailText}>
              {item.petType.join(', ')}
            </Text>
          </View>
          
          <View style={styles.stockStatus}>
            <View style={[styles.statusBadge, { backgroundColor: item.inStock !== false ? COLORS.green : COLORS.red }]}>
              <Text style={styles.statusText}>
                {item.inStock !== false ? 'متوفر' : 'نفد المخزون'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
          onPress={() => handleEditProduct(item)}
        >
          <Edit size={18} color={COLORS.white} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.error }]}
          onPress={() => handleDeleteProduct(item.id, item.name)}
        >
          <Trash2 size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setEditModalVisible(false)}
            style={styles.closeButton}
          >
            <X size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>تعديل المنتج</Text>
          <TouchableOpacity
            onPress={handleSaveProduct}
            style={styles.saveButton}
          >
            <Save size={20} color={COLORS.primary} />
            <Text style={styles.saveButtonText}>حفظ</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>اسم المنتج</Text>
            <TextInput
              style={styles.textInput}
              value={editingProduct?.name || ''}
              onChangeText={(text) => setEditingProduct(prev => prev ? {...prev, name: text} : null)}
              placeholder="أدخل اسم المنتج"
              textAlign="right"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>الوصف</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={editingProduct?.description || ''}
              onChangeText={(text) => setEditingProduct(prev => prev ? {...prev, description: text} : null)}
              placeholder="أدخل وصف المنتج"
              textAlign="right"
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>السعر</Text>
            <TextInput
              style={styles.textInput}
              value={editingProduct?.price.toString() || ''}
              onChangeText={(text) => setEditingProduct(prev => prev ? {...prev, price: parseFloat(text) || 0} : null)}
              placeholder="أدخل سعر المنتج"
              textAlign="right"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>الفئة</Text>
            <TextInput
              style={styles.textInput}
              value={editingProduct?.category || ''}
              onChangeText={(text) => setEditingProduct(prev => prev ? {...prev, category: text} : null)}
              placeholder="أدخل فئة المنتج"
              textAlign="right"
            />
          </View>
          
          {/* Image Upload Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>صورة المنتج</Text>
            {selectedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <View style={styles.imageActions}>
                  <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                    <Camera size={16} color={COLORS.white} />
                    <Text style={styles.imageActionText}>تغيير</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                    <X size={16} color={COLORS.white} />
                    <Text style={styles.imageActionText}>حذف</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Upload size={24} color={COLORS.primary} />
                <Text style={styles.uploadButtonText}>اختيار صورة</Text>
                <Text style={styles.uploadButtonSubtext}>من المعرض أو التقاط صورة جديدة</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'إدارة منتجات المتجر',
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={() => router.push('/add-product')} 
                style={[styles.headerButton, styles.addButton]}
              >
                <Plus size={20} color={COLORS.white} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleDeleteAllProducts} 
                style={[styles.headerButton, styles.deleteAllButton]}
              >
                <Trash2 size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في المنتجات..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
          
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'all' && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === 'all' && styles.filterChipTextActive
            ]}>الكل ({products.length})</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'inStock' && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter('inStock')}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === 'inStock' && styles.filterChipTextActive
            ]}>متوفر ({products.filter(p => p.inStock !== false).length})</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'outOfStock' && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter('outOfStock')}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === 'outOfStock' && styles.filterChipTextActive
            ]}>نفد المخزون ({products.filter(p => p.inStock === false).length})</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {products.length === 0 ? 'لا توجد منتجات' : 'لا توجد نتائج للبحث'}
              </Text>
              {products.length === 0 && (
                <Button
                  title="إضافة منتج جديد"
                  onPress={() => router.push('/add-product')}
                  type="primary"
                  size="small"
                  style={styles.addFirstProductButton}
                />
              )}
            </View>
          )}
        />
        
        {renderEditModal()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    marginRight: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonsContainer: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
    textAlign: 'center',
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  productsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.lightGray,
  },
  productInfo: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  priceContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
    textAlign: 'right',
    lineHeight: 20,
  },
  productDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginRight: 8,
    flex: 1,
    textAlign: 'right',
  },
  stockStatus: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  productActions: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 16,
  },
  addFirstProductButton: {
    marginTop: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: COLORS.success || '#28a745',
  },
  deleteAllButton: {
    backgroundColor: COLORS.error,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
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
  saveButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  imagePreviewContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  changeImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  removeImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  imageActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});