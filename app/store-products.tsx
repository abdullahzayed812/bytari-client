import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, TextInput, Modal } from "react-native";
import React, { useState, useMemo } from "react";
import { COLORS } from "../constants/colors";
import { Search, X, Phone, Star } from "lucide-react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { mockVetStores, mockVetStoreProducts, VetStoreProduct } from "../mocks/data";
import { trpc } from "../lib/trpc";

export default function StoreProductsScreen() {
  const { storeId } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<VetStoreProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState<boolean>(false);

  const storeData = mockVetStores.find((store) => store.id === storeId) || mockVetStores[0];
  const { data, isPending, error } = trpc.stores.products.list.useQuery({ storeId: Number(storeId) });

  const allProducts = data?.products ?? [];

  React.useEffect(() => {
    if (storeData && storeData.name.includes("مذخر")) {
      router.replace(`/warehouse-products?storeId=${storeId}`);
    }
  }, [storeData, storeId]);

  const categories = ["all", ...Array.from(new Set(allProducts.map((product) => product.category)))];

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchQuery, selectedCategory]);

  const handleProductPress = (product: VetStoreProduct) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  if (isPending) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 40 }}>جاري تحميل المنتجات...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 40 }}>حدث خطأ أثناء تحميل المنتجات</Text>
      </View>
    );
  }

  const renderProductCard = (product: VetStoreProduct, index: number) => {
    return (
      <TouchableOpacity key={product.id} style={styles.productCard} onPress={() => handleProductPress(product)}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.productCategory}>{product.category}</Text>
          {product.description && (
            <Text style={styles.productDescription} numberOfLines={2}>
              {product.description}
            </Text>
          )}
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>{product.price} ر.س</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProductModal = () => {
    if (!selectedProduct) return null;

    return (
      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowProductModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تفاصيل المنتج</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: selectedProduct.image }} style={styles.modalProductImage} />

            <View style={styles.productDetailsContainer}>
              <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
              <Text style={styles.modalProductCategory}>{selectedProduct.category}</Text>

              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      color={star <= 4 ? COLORS.primary : COLORS.lightGray}
                      fill={star <= 4 ? COLORS.primary : "transparent"}
                    />
                  ))}
                </View>
                <Text style={styles.ratingText}>(4.0)</Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.modalProductPrice}>{selectedProduct.price} ر.س</Text>
                <Text style={styles.originalPrice}>{(selectedProduct.price * 1.2).toFixed(0)} ر.س</Text>
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>الوصف</Text>
                <Text style={styles.modalProductDescription}>
                  {selectedProduct.description || "لا يوجد وصف متاح لهذا المنتج."}
                </Text>
              </View>

              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>المميزات</Text>
                <View style={styles.featuresList}>
                  <Text style={styles.featureItem}>• جودة عالية ومضمونة</Text>
                  <Text style={styles.featureItem}>• توصيل سريع</Text>
                  <Text style={styles.featureItem}>• ضمان الجودة</Text>
                  <Text style={styles.featureItem}>• خدمة عملاء متميزة</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.contactOwnerButton}>
              <Phone size={20} color={COLORS.white} />
              <Text style={styles.contactOwnerText}>اتصال بصاحب المتجر</Text>
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
          title: `منتجات ${storeData.name}`,
        }}
      />

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
              { marginLeft: index < categories.length - 1 ? 8 : 0 },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
              {category === "all" ? "الكل" : category}
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
              <Text style={styles.emptyStateText}>لا توجد منتجات متاحة</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? "جرب البحث بكلمات أخرى" : "لم يتم إضافة منتجات بعد"}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
  },
  categoryChip: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignSelf: "flex-start",
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
    textAlign: "center",
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
    width: "31%",
    marginBottom: 16,
    minHeight: 180,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  productImage: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    resizeMode: "cover",
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 11,
    color: COLORS.darkGray,
    textAlign: "right",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
    lineHeight: 16,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: "auto",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  modalProductImage: {
    width: "100%",
    height: 250,
    backgroundColor: COLORS.lightGray,
    resizeMode: "cover",
  },
  productDetailsContainer: {
    padding: 16,
  },
  modalProductName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 8,
  },
  modalProductCategory: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "right",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: "row",
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  priceContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 20,
  },
  modalProductPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginLeft: 12,
  },
  originalPrice: {
    fontSize: 18,
    color: COLORS.darkGray,
    textDecorationLine: "line-through",
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 8,
  },
  modalProductDescription: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "right",
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 12,
  },
  featuresList: {
    paddingRight: 16,
  },
  featureItem: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "right",
    marginBottom: 8,
    lineHeight: 22,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  contactOwnerButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  contactOwnerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginRight: 8,
  },
});
