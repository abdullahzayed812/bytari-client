import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { formatPrice } from "../constants/currency";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { Product } from "../types";
import { mockVetProducts, mockVetStores, mockVetStoreProducts } from "../mocks/data";
import Button from "../components/Button";
import { ShoppingBag, ShoppingCart, ArrowLeft, Heart, Search, Star, MapPin, Phone, Clock, Settings } from 'lucide-react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';

type VetCategory = 'all' | 'medicine' | 'equipment' | 'supplements' | 'tools';

const getVetProductCategories = (): { id: VetCategory; label: string }[] => [
  { id: 'all', label: 'جميع المنتجات' },
  { id: 'medicine', label: 'أدوية' },
  { id: 'equipment', label: 'معدات طبية' },
  { id: 'supplements', label: 'مكملات غذائية' },
  { id: 'tools', label: 'أدوات' },
];

export default function VetStoreDetailsScreen() {
  const { storeId } = useLocalSearchParams();
  const { t, isRTL } = useI18n();
  const { addToCart, addToFavorites, removeFromFavorites, favorites, cart, hasAdminAccess, isSuperAdmin } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<VetCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const store = mockVetStores.find(s => s.id === storeId);
  const storeProducts = mockVetStoreProducts.filter(p => p.storeId === storeId);

  const filteredProducts = storeProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category.includes(selectedCategory);
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: any) => {
    const productForCart: Product = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      petType: ['cat', 'dog', 'bird', 'rabbit'],
      image: product.image,
      rating: 4.5,
      inStock: product.inStock,
    };
    
    addToCart({
      productId: product.id,
      quantity: 1,
      product: productForCart,
    });
  };

  const handleToggleFavorite = (product: any) => {
    const productForFavorite: Product = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      petType: ['cat', 'dog', 'bird', 'rabbit'],
      image: product.image,
      rating: 4.5,
      inStock: product.inStock,
    };
    
    const isFavorite = favorites.some(f => f.productId === product.id);
    if (isFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites({
        productId: product.id,
        product: productForFavorite,
        addedAt: new Date().toISOString(),
      });
    }
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

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

  const renderProductItem = ({ item }: { item: any }) => {
    const isFavorite = favorites.some(f => f.productId === item.id);
    
    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => router.push(`/product-details?productId=${item.id}`)}
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
          <View style={styles.stockContainer}>
            <Text style={styles.stockText}>المتوفر: {item.quantity}</Text>
          </View>
          <Button
            title={t('store.addToCart')}
            onPress={() => handleAddToCart(item)}
            type="primary"
            size="small"
            icon={<ShoppingCart size={16} color={COLORS.white} />}
            style={styles.addButton}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (!store) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'تفاصيل المذخر' }} />
        <Text style={styles.errorText}>المذخر غير موجود</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: store.name,
        headerRight: () => (
          <View style={styles.headerActions}>
            {(hasAdminAccess || isSuperAdmin) && (
              <TouchableOpacity 
                style={styles.adminButton}
                onPress={() => router.push('/stores-admin-management')}
              >
                <Settings size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={() => router.push('/cart')}
            >
              <ShoppingBag size={20} color={COLORS.primary} />
              {getCartItemCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )
      }} />

      <ScrollView style={styles.scrollView}>
        {/* Store Header */}
        <View style={styles.storeHeader}>
          <Image source={{ uri: store.image }} style={styles.storeHeaderImage} />
          <View style={styles.storeHeaderOverlay}>
            <Text style={styles.storeHeaderTitle}>{store.name}</Text>
            <View style={styles.storeRatingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.storeRating}>{store.rating}</Text>
              <Text style={styles.storeReviewCount}>({store.reviewCount} تقييم)</Text>
            </View>
          </View>
        </View>

        {/* Store Info */}
        <View style={styles.storeInfoSection}>
          <Text style={styles.storeDescription}>{store.description}</Text>
          
          <View style={styles.storeDetailsContainer}>
            <View style={styles.storeDetailItem}>
              <MapPin size={16} color={COLORS.primary} />
              <Text style={styles.storeDetailText}>{store.address}</Text>
            </View>
            
            <View style={styles.storeDetailItem}>
              <Phone size={16} color={COLORS.primary} />
              <Text style={styles.storeDetailText}>{store.phone}</Text>
            </View>
            
            <View style={styles.storeDetailItem}>
              <Clock size={16} color={COLORS.primary} />
              <Text style={styles.storeDetailText}>{store.workingHours.days}: {store.workingHours.open} - {store.workingHours.close}</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث في منتجات المذخر..."
              placeholderTextColor={COLORS.darkGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={getVetProductCategories()}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>منتجات المذخر ({filteredProducts.length})</Text>
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.productsList}
            columnWrapperStyle={styles.productsRow}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  storeHeader: {
    position: 'relative',
    height: 200,
  },
  storeHeaderImage: {
    width: '100%',
    height: '100%',
  },
  storeHeaderOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
  },
  storeHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  storeRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeRating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 4,
    marginRight: 8,
  },
  storeReviewCount: {
    fontSize: 14,
    color: COLORS.white,
  },
  storeInfoSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
  },
  storeDescription: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 24,
    marginBottom: 16,
  },
  storeDetailsContainer: {
    gap: 12,
  },
  storeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeDetailText: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
  },
  searchSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
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
  categoriesContainer: {
    backgroundColor: COLORS.white,
    paddingBottom: 8,
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.lightGray,
  },
  selectedCategoryItem: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  selectedCategoryText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  productsSection: {
    backgroundColor: COLORS.white,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  productsList: {
    paddingBottom: 16,
  },
  productsRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: COLORS.black,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  stockContainer: {
    marginBottom: 8,
  },
  stockText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  addButton: {
    width: '100%',
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 50,
  },
});