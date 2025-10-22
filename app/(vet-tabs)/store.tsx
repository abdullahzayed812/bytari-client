import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import React, { useState, useRef } from 'react';
import { COLORS } from "../../constants/colors";
import { formatPrice } from "../../constants/currency";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { Product } from "../../types";
import { mockProducts } from "../../mocks/data";
import Button from "../../components/Button";
import { ShoppingBag, ShoppingCart, ArrowRight, Plus, Settings, Search, Heart, Stethoscope, Syringe, Pill, Microscope, Egg, Activity, Wrench, Cat, Dog, Bird, Fish, Zap, Monitor, Scissors, TestTube } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
type VetCategory = 'all' | 'medicine' | 'equipment' | 'surgery' | 'diagnostics' | 'supplements' | 'medical_devices';
type VetSpecialty = 'small_animals' | 'large_animals' | 'birds' | 'fish' | 'poultry' | 'medical_devices';

// Veterinarian Store - Specialized categories for veterinarians
const getVetSpecialties = () => {
  return [
    { id: 'small_animals' as VetSpecialty, label: 'قطط وكلاب', icon: <Stethoscope size={40} color={COLORS.white} />, color: '#FF6B6B' },
    { id: 'large_animals' as VetSpecialty, label: 'الحيوانات الصغيرة والكبيرة', icon: <Syringe size={40} color={COLORS.white} />, color: '#4ECDC4' },
    { id: 'birds' as VetSpecialty, label: 'الطيور', icon: <Bird size={40} color={COLORS.white} />, color: '#45B7D1' },
    { id: 'fish' as VetSpecialty, label: 'الأسماك', icon: <Fish size={40} color={COLORS.white} />, color: '#96CEB4' },
    { id: 'poultry' as VetSpecialty, label: 'الدواجن', icon: <Egg size={40} color={COLORS.white} />, color: '#FFA726' },
    { id: 'medical_devices' as VetSpecialty, label: 'أجهزة ومعدات طبية', icon: <Monitor size={40} color={COLORS.white} />, color: '#9C27B0' },
  ];
};

const vetCategories: { id: VetCategory; label: string }[] = [
  { id: 'all', label: 'جميع المنتجات' },
  { id: 'medicine', label: 'أدوية' },
  { id: 'equipment', label: 'معدات طبية' },
  { id: 'surgery', label: 'أدوات جراحية' },
  { id: 'supplements', label: 'مكملات غذائية' },
  { id: 'medical_devices', label: 'أجهزة ومعدات طبية' },
];  


export default function VeterinarianStoreScreen() {
  const { t, isRTL } = useI18n();
  const { addToCart, addToFavorites, removeFromFavorites, favorites, cart, isSuperAdmin, isModerator, moderatorPermissions } = useApp();
  const [selectedSpecialty, setSelectedSpecialty] = useState<VetSpecialty | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<VetCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const specialtyFlatListRef = useRef<FlatList>(null);
  const productFlatListRef = useRef<FlatList>(null);
  
  // Scroll to top when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      if (selectedSpecialty) {
        productFlatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      } else {
        specialtyFlatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      }
    }, [selectedSpecialty])
  );
  
  const vetSpecialties = getVetSpecialties();

  // Filter products for veterinarians only (medical/professional products)
  const filteredProducts = selectedSpecialty
    ? mockProducts.filter(product => {
        const matchesSpecialty = product.petType.includes(selectedSpecialty === 'small_animals' ? 'cat' : 
                                                        selectedSpecialty === 'large_animals' ? 'dog' :
                                                        selectedSpecialty === 'birds' ? 'bird' :
                                                        selectedSpecialty === 'fish' ? 'fish' :
                                                        selectedSpecialty === 'poultry' ? 'poultry' : 'medical');
        const matchesCategory = selectedCategory === 'all' || product.category === 'medicine' || product.category === 'accessories';
        const matchesSearch = searchQuery === '' || 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSpecialty && matchesCategory && matchesSearch;
      })
    : [];

  // Check if user has veterinarian store management permissions
  const hasVetStorePermission = () => {
    if (isSuperAdmin) return true;
    if (!isModerator || !moderatorPermissions) return false;
    
    const storePerms = moderatorPermissions.storeManagement;
    if (!storePerms) return false;
    
    return storePerms.vetStores;
  };

  const handleAddProduct = () => {
    router.push(`/add-store-product?storeType=veterinarian`);
  };

  const handleManageStore = () => {
    router.push(`/store-products-management?storeType=veterinarian`);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      quantity: 1,
      product,
    });
  };

  const handleToggleFavorite = (product: Product) => {
    const isFavorite = favorites.some(f => f.productId === product.id);
    if (isFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites({
        productId: product.id,
        product,
        addedAt: new Date().toISOString(),
      });
    }
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSpecialtySelect = (specialty: VetSpecialty) => {
    setSelectedSpecialty(specialty);
    setSelectedCategory('all');
  };

  const handleBackToSpecialties = () => {
    setSelectedSpecialty(null);
    setSelectedCategory('all');
  };

  const renderSpecialtyCategory = ({ item }: { item: typeof vetSpecialties[0] }) => (
    <TouchableOpacity
      style={[styles.specialtyCard, { backgroundColor: item.color }]}
      onPress={() => handleSpecialtySelect(item.id)}
    >
      <View style={styles.specialtyIconContainer}>
        {item.icon}
      </View>
      <Text style={styles.specialtyLabel}>{item.label}</Text>
      <View style={styles.specialtyArrow}>
        <ArrowRight size={20} color={COLORS.white} />
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: { id: VetCategory; label: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const handleProductPress = (product: Product) => {
    router.push(`/product-details?productId=${product.id}`);
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const isFavorite = favorites.some(f => f.productId === item.id);
    
    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
      >
        <View style={styles.productImageContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleToggleFavorite(item);
            }}
          >
            <Heart 
              size={20} 
              color={isFavorite ? COLORS.red : COLORS.gray} 
              fill={isFavorite ? COLORS.red : 'transparent'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.ratingStars}>★★★★★</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              handleAddToCart(item);
            }}
          >
            <ShoppingCart size={16} color={COLORS.white} />
            <Text style={styles.addButtonText}>{t('store.addToCart')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (!selectedSpecialty) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>المتجر البيطري</Text>
            <Text style={styles.storeTypeLabel}>
              منتجات طبية متخصصة للأطباء البيطريين
            </Text>
          </View>
          <View style={styles.headerRight}>
            {hasVetStorePermission() && (
              <View style={styles.adminButtons}>
                <TouchableOpacity 
                  style={styles.adminButton}
                  onPress={handleAddProduct}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.adminButton}
                  onPress={handleManageStore}
                >
                  <Settings size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={() => router.push('/cart')}
            >
              <ShoppingBag size={24} color={COLORS.primary} />
              {getCartItemCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>المتجر البيطري المتخصص</Text>
          <Text style={styles.welcomeSubtitle}>اختر التخصص لعرض المنتجات الطبية والأدوات المناسبة</Text>
        </View>

        <FlatList
          ref={specialtyFlatListRef}
          data={vetSpecialties}
          renderItem={renderSpecialtyCategory}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[styles.specialtiesList, { paddingBottom: 100 }]}
          columnWrapperStyle={styles.specialtiesRow}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToSpecialties}
        >
          <ArrowRight size={20} color={COLORS.primary} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>
            {vetSpecialties.find(spec => spec.id === selectedSpecialty)?.label} - المتجر البيطري
          </Text>
          <Text style={styles.storeTypeLabel}>
            منتجات طبية متخصصة للأطباء البيطريين
          </Text>
        </View>
        <View style={styles.headerRight}>
          {hasVetStorePermission() && (
            <View style={styles.adminButtons}>
              <TouchableOpacity 
                style={styles.adminButton}
                onPress={handleAddProduct}
              >
                <Plus size={20} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.adminButton}
                onPress={handleManageStore}
              >
                <Settings size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => router.push('/cart')}
          >
            <ShoppingBag size={24} color={COLORS.primary} />
            {getCartItemCount() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن منتجات طبية بيطرية..."
            placeholderTextColor={COLORS.darkGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={vetCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        ref={productFlatListRef}
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={[styles.productsList, { paddingBottom: 100 }]}
        columnWrapperStyle={styles.productsRow}
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
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  adminButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginTop: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  storesScrollView: {
    flex: 1,
  },
  storesContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  storeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    resizeMode: 'cover',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  storeDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginBottom: 8,
    lineHeight: 18,
  },
  storeDetails: {
    marginBottom: 8,
  },
  storeDetailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeDetailText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginRight: 6,
    flex: 1,
    textAlign: 'right',
  },
  storeFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  workingHours: {
    alignItems: 'flex-end',
  },
  workingHoursText: {
    fontSize: 11,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  workingHoursTime: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
  storeArrow: {
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  specialtyCard: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  specialtyIconContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialtyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  specialtyArrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedCategoryItem: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  productCard: {
    width: '31%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    margin: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'right',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  ratingStars: {
    fontSize: 12,
    color: '#FFD700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
    marginTop: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  storeTypeLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 2,
  },
  welcomeContainer: {
    padding: 12,
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 16,
  },
  specialtiesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  specialtiesRow: {
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    marginRight: 8,
    textAlign: 'right',
  },
  categoriesContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  productsList: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  productsRow: {
    justifyContent: 'space-between',
  },

});