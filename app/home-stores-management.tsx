import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from "../constants/colors";
import { ArrowLeft, Plus, Edit3, Eye, EyeOff, Trash2, Star, Download } from 'lucide-react-native';
import Button from "../components/Button";
import { mockVetStores } from "../mocks/data";

type Store = {
  id: string;
  name: string;
  address: string;
  phone: string;
  image: string;
  rating: number;
  isActive: boolean;
  isSelectedForHome: boolean;
};

export default function HomeStoresManagementScreen() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>(
    mockVetStores.map(store => ({
      ...store,
      isSelectedForHome: store.isActive // Initially, active stores are shown on home
    }))
  );

  const handleToggleHomeVisibility = (storeId: string) => {
    setStores(prevStores => 
      prevStores.map(store => 
        store.id === storeId 
          ? { ...store, isSelectedForHome: !store.isSelectedForHome }
          : store
      )
    );
  };

  const handleDeleteStore = (storeId: string) => {
    Alert.alert(
      'حذف المتجر',
      'هل أنت متأكد من حذف هذا المتجر من الصفحة الرئيسية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setStores(prevStores => prevStores.filter(store => store.id !== storeId));
          }
        }
      ]
    );
  };

  const handleEditStore = (storeId: string) => {
    router.push(`/edit-store?id=${storeId}`);
  };

  const handleAddStore = () => {
    router.push('/add-store' as any);
  };

  const handleImportStores = () => {
    // Get all available stores from main sections that are not already selected for home
    const availableStores = mockVetStores.filter(store => 
      !stores.some(homeStore => homeStore.id === store.id)
    );

    if (availableStores.length === 0) {
      Alert.alert('لا توجد متاجر', 'جميع المتاجر المتاحة موجودة بالفعل في الصفحة الرئيسية');
      return;
    }

    Alert.alert(
      'استيراد المتاجر',
      `تم العثور على ${availableStores.length} متجر متاح للاستيراد. هل تريد استيرادها جميعاً؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'استيراد الكل',
          onPress: () => {
            const importedStores = availableStores.map(store => ({
              id: store.id,
              name: store.name,
              address: store.address,
              phone: store.phone,
              image: store.image,
              rating: store.rating,
              isActive: store.isActive,
              isSelectedForHome: true
            }));
            setStores(prevStores => [...prevStores, ...importedStores]);
            Alert.alert('تم الاستيراد', `تم استيراد ${importedStores.length} متجر بنجاح`);
          }
        },
        {
          text: 'اختيار يدوي',
          onPress: () => {
            // Show selection modal (for now, import first 3)
            const selectedStores = availableStores.slice(0, 3).map(store => ({
              id: store.id,
              name: store.name,
              address: store.address,
              phone: store.phone,
              image: store.image,
              rating: store.rating,
              isActive: store.isActive,
              isSelectedForHome: true
            }));
            setStores(prevStores => [...prevStores, ...selectedStores]);
            Alert.alert('تم الاستيراد', `تم استيراد ${selectedStores.length} متجر بنجاح`);
          }
        }
      ]
    );
  };

  const visibleStores = stores.filter(store => store.isSelectedForHome);
  const hiddenStores = stores.filter(store => !store.isSelectedForHome);

  const renderStoreCard = (store: Store, isVisible: boolean) => (
    <View key={store.id} style={styles.storeCard}>
      <View style={styles.storeCardContent}>
        <Image source={{ uri: store.image }} style={styles.storeImage} />
        
        <View style={styles.storeDetails}>
          <View style={styles.storeHeader}>
            <Text style={styles.storeName}>{store.name}</Text>
            {store.isActive && (
              <View style={styles.activeBadge}>
                <Star size={12} color={COLORS.white} fill={COLORS.white} />
                <Text style={styles.activeBadgeText}>نشط</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.storeAddress}>{store.address}</Text>
          <Text style={styles.storePhone}>{store.phone}</Text>
          
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{store.rating}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.storeActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.visibilityButton]}
          onPress={() => handleToggleHomeVisibility(store.id)}
        >
          {isVisible ? (
            <EyeOff size={16} color={COLORS.white} />
          ) : (
            <Eye size={16} color={COLORS.white} />
          )}
          <Text style={styles.actionButtonText}>
            {isVisible ? 'إخفاء' : 'إظهار'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditStore(store.id)}
        >
          <Edit3 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>تعديل</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteStore(store.id)}
        >
          <Trash2 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>حذف</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إدارة المتاجر - الصفحة الرئيسية',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>إدارة المتاجر البيطرية</Text>
          <Text style={styles.headerSubtitle}>
            تحكم في المتاجر التي تظهر في الصفحة الرئيسية
          </Text>
        </View>
        
        {/* Add Store Button */}
        <View style={styles.addSection}>
          <View style={styles.buttonRow}>
            <Button
              title="إضافة متجر جديد"
              onPress={handleAddStore}
              type="primary"
              size="medium"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.halfButton}
            />
            <Button
              title="استيراد من الأقسام"
              onPress={handleImportStores}
              type="secondary"
              size="medium"
              icon={<Download size={16} color={COLORS.primary} />}
              style={styles.halfButton}
            />
          </View>
        </View>
        
        {/* Visible Stores Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            المتاجر المعروضة في الصفحة الرئيسية ({visibleStores.length})
          </Text>
          {visibleStores.length > 0 ? (
            visibleStores.map(store => renderStoreCard(store, true))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد متاجر معروضة في الصفحة الرئيسية</Text>
            </View>
          )}
        </View>
        
        {/* Hidden Stores Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            المتاجر المخفية ({hiddenStores.length})
          </Text>
          {hiddenStores.length > 0 ? (
            hiddenStores.map(store => renderStoreCard(store, false))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد متاجر مخفية</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  addSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  addButton: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  halfButton: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 15,
  },
  storeCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeCardContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  storeDetails: {
    flex: 1,
    marginRight: 16,
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
  },
  activeBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  storeAddress: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginBottom: 4,
  },
  storePhone: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  storeActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  visibilityButton: {
    backgroundColor: COLORS.info,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});