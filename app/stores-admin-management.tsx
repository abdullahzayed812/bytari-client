import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Image, Alert, TextInput, Modal } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import Button from "../components/Button";
import { Plus, Edit, Trash2, Search, Filter, MapPin, Star, Phone, Clock, X, Save, Camera, Upload } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { mockVetStores, VetStore } from "../mocks/data";
import * as ImagePicker from 'expo-image-picker';

interface EditStoreData {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  rating: number;
  workingHours: {
    open: string;
    close: string;
    days: string;
  };
  image: string;
}

export default function StoresAdminManagementScreen() {
  const { isRTL } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState<VetStore[]>(mockVetStores);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingStore, setEditingStore] = useState<EditStoreData | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (selectedFilter) {
      case 'active':
        return store.rating >= 4.0; // Mock active criteria
      case 'inactive':
        return store.rating < 4.0; // Mock inactive criteria
      default:
        return true;
    }
  });

  const handleEditStore = (store: VetStore) => {
    setEditingStore({
      id: store.id,
      name: store.name,
      description: store.description,
      address: store.address,
      phone: store.phone,
      rating: store.rating,
      workingHours: {
        open: store.workingHours.open,
        close: store.workingHours.close,
        days: store.workingHours.days,
      },
      image: store.image,
    });
    setSelectedImage(store.image);
    setEditModalVisible(true);
  };

  const handleSaveStore = () => {
    if (!editingStore) return;
    
    setStores(prevStores => 
      prevStores.map(store => 
        store.id === editingStore.id 
          ? { ...store, ...editingStore }
          : store
      )
    );
    
    setEditModalVisible(false);
    setEditingStore(null);
    setSelectedImage(null);
    
    Alert.alert('تم الحفظ', 'تم تحديث بيانات المذخر بنجاح');
  };

  const handleDeleteStore = (storeId: string, storeName: string) => {
    Alert.alert(
      'حذف المذخر',
      `هل أنت متأكد من حذف مذخر "${storeName}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive', 
          onPress: () => {
            setStores(prevStores => prevStores.filter(store => store.id !== storeId));
            Alert.alert('تم الحذف', 'تم حذف المذخر بنجاح');
          }
        }
      ]
    );
  };

  const handleDeleteAllStores = () => {
    Alert.alert(
      'حذف جميع المذاخر',
      'هل أنت متأكد من حذف جميع المذاخر؟\n\nهذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف الكل', 
          style: 'destructive', 
          onPress: () => {
            setStores([]);
            Alert.alert('تم الحذف', 'تم حذف جميع المذاخر بنجاح');
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
                setEditingStore(prev => prev ? {...prev, image: result.assets[0].uri} : null);
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
                setEditingStore(prev => prev ? {...prev, image: result.assets[0].uri} : null);
              }
            }
          },
          { text: 'إلغاء', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setEditingStore(prev => prev ? {...prev, image: ''} : null);
  };

  const renderStoreCard = ({ item }: { item: VetStore }) => (
    <View style={styles.storeCard}>
      <Image source={{ uri: item.image }} style={styles.storeImage} />
      
      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
        </View>
        
        <Text style={styles.storeDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.storeDetails}>
          <View style={styles.detailItem}>
            <MapPin size={14} color={COLORS.darkGray} />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Phone size={14} color={COLORS.darkGray} />
            <Text style={styles.detailText}>
              {item.phone}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Clock size={14} color={COLORS.darkGray} />
            <Text style={styles.detailText}>
              {item.workingHours.open} - {item.workingHours.close}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.storeActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
          onPress={() => handleEditStore(item)}
        >
          <Edit size={18} color={COLORS.white} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.error }]}
          onPress={() => handleDeleteStore(item.id, item.name)}
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
          <Text style={styles.modalTitle}>تعديل المذخر</Text>
          <TouchableOpacity
            onPress={handleSaveStore}
            style={styles.saveButton}
          >
            <Save size={20} color={COLORS.primary} />
            <Text style={styles.saveButtonText}>حفظ</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>اسم المذخر</Text>
            <TextInput
              style={styles.textInput}
              value={editingStore?.name || ''}
              onChangeText={(text) => setEditingStore(prev => prev ? {...prev, name: text} : null)}
              placeholder="أدخل اسم المذخر"
              textAlign="right"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>الوصف</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={editingStore?.description || ''}
              onChangeText={(text) => setEditingStore(prev => prev ? {...prev, description: text} : null)}
              placeholder="أدخل وصف المذخر"
              textAlign="right"
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>العنوان</Text>
            <TextInput
              style={styles.textInput}
              value={editingStore?.address || ''}
              onChangeText={(text) => setEditingStore(prev => prev ? {...prev, address: text} : null)}
              placeholder="أدخل عنوان المذخر"
              textAlign="right"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>رقم الهاتف</Text>
            <TextInput
              style={styles.textInput}
              value={editingStore?.phone || ''}
              onChangeText={(text) => setEditingStore(prev => prev ? {...prev, phone: text} : null)}
              placeholder="أدخل رقم الهاتف"
              textAlign="right"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>ساعة الفتح</Text>
              <TextInput
                style={styles.textInput}
                value={editingStore?.workingHours.open || ''}
                onChangeText={(text) => setEditingStore(prev => prev ? {
                  ...prev, 
                  workingHours: {...prev.workingHours, open: text}
                } : null)}
                placeholder="08:00"
                textAlign="center"
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>ساعة الإغلاق</Text>
              <TextInput
                style={styles.textInput}
                value={editingStore?.workingHours.close || ''}
                onChangeText={(text) => setEditingStore(prev => prev ? {
                  ...prev, 
                  workingHours: {...prev.workingHours, close: text}
                } : null)}
                placeholder="18:00"
                textAlign="center"
              />
            </View>
          </View>
          
          {/* Image Upload Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>صورة المذخر</Text>
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
          title: 'إدارة المذاخر البيطرية',
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={() => router.push('/add-store')} 
                style={[styles.headerButton, styles.addButton]}
              >
                <Plus size={20} color={COLORS.white} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleDeleteAllStores} 
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
              placeholder="البحث في المذاخر..."
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
            ]}>الكل ({stores.length})</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'active' && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter('active')}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === 'active' && styles.filterChipTextActive
            ]}>نشط ({stores.filter(s => s.rating >= 4.0).length})</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'inactive' && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter('inactive')}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === 'inactive' && styles.filterChipTextActive
            ]}>غير نشط ({stores.filter(s => s.rating < 4.0).length})</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredStores}
          renderItem={renderStoreCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.storesList}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {stores.length === 0 ? 'لا توجد مذاخر' : 'لا توجد نتائج للبحث'}
              </Text>
              {stores.length === 0 && (
                <Button
                  title="إضافة مذخر جديد"
                  onPress={() => router.push('/add-store')}
                  type="primary"
                  size="small"
                  style={styles.addFirstStoreButton}
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
  storesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  storeCard: {
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
  storeImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.lightGray,
  },
  storeInfo: {
    padding: 16,
  },
  storeHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  ratingContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 4,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginRight: 4,
  },
  storeDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
    textAlign: 'right',
    lineHeight: 20,
  },
  storeDetails: {
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
  storeActions: {
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
  addFirstStoreButton: {
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
  inputRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
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