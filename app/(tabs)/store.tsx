import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput } from "react-native";
import React, { useState, useRef } from "react";
import { COLORS } from "../../constants/colors";
import { formatPrice } from "../../constants/currency";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { Product } from "../../types";
import {
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  Cat,
  Dog,
  Bird,
  Fish,
  Heart,
  Search,
  Plus,
  Settings,
  ClipboardList,
  Egg,
  Cog,
  Package,
  BarChart3,
  Zap,
  Rabbit,
  Pill,
  Stethoscope,
  Microscope,
  Beef,
} from "lucide-react-native";
import { router } from "expo-router";
import { useCart } from "@/providers/CartProvider";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useFavorites } from "@/providers/FavoritesProvider";

type Category = string;
type AnimalType = string;
type VetCategory = string;
type VetSpecialty = string;

// Pet Owner Store - Fixed categories for pet owners only
const getPetOwnerCategories = (backendCategories: any[] | undefined) => {
  if (!backendCategories) return [];
  const petOwnerBaseCategories = backendCategories;
  return petOwnerBaseCategories.map((cat) => {
    let icon;
    let color;
    switch (cat.id) {
      case "cats":
        icon = <Cat size={40} color={COLORS.white} />;
        color = "#FF6B6B";
        break;
      case "dogs":
        icon = <Dog size={40} color={COLORS.white} />;
        color = "#4ECDC4";
        break;
      case "birds":
        icon = <Bird size={40} color={COLORS.white} />;
        color = "#45B7D1";
        break;
      case "fish":
        icon = <Fish size={40} color={COLORS.white} />;
        color = "#96CEB4";
        break;
      case "poultry":
        icon = <Egg size={40} color={COLORS.white} />;
        color = "#FFA726";
        break;
      case "small_animals":
        icon = <Rabbit size={40} color={COLORS.white} />;
        color = "#BA68C8";
        break;
      default:
        icon = <Cat size={40} color={COLORS.white} />;
        color = COLORS.primary;
    }
    return { ...cat, label: cat.name, icon, color };
  });
};

// Veterinarian Store - Specialized categories for veterinarians
const getVetSpecialties = (backendCategories: any[] | undefined) => {
  if (!backendCategories) return [];
  const vetBaseCategories = backendCategories;
  return vetBaseCategories.map((cat) => {
    let icon;
    let color;
    switch (cat.id) {
      case "pharmaceuticals":
        icon = <Pill size={40} color={COLORS.white} />;
        color = "#20c997";
        break;
      case "medical_equipment":
        icon = <Stethoscope size={40} color={COLORS.white} />;
        color = "#9C27B0";
        break;
      case "lab_supplies":
        icon = <Microscope size={40} color={COLORS.white} />;
        color = "#17a2b8";
        break;
      case "nutrition_supplements":
        icon = <Beef size={40} color={COLORS.white} />;
        color = "#fd7e14";
        break;
      default:
        icon = <Zap size={40} color={COLORS.white} />;
        color = COLORS.primary;
    }
    return { ...cat, label: cat.name, icon, color };
  });
};

export default function StoreScreen() {
  const { user } = useApp();
  const { t, isRTL } = useI18n();
  const { userMode, isSuperAdmin, isModerator, moderatorPermissions } = useApp();
  const { favorites, removeFromFavorites, addToFavorites } = useFavorites();
  const { addToCart, getCartItemCount, isLoadingCart } = useCart();

  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<VetSpecialty | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedVetCategory, setSelectedVetCategory] = useState<VetCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const animalFlatListRef = useRef<FlatList>(null);
  const specialtyFlatListRef = useRef<FlatList>(null);
  const productFlatListRef = useRef<FlatList>(null);
  const storeType = userMode === "veterinarian" ? "veterinarian" : "pet_owner";

  const { data: pendingOrdersCount, isLoading: isOrdersLoading } = useQuery(
    trpc.unifiedStore.getPendingOrdersCount.queryOptions({
      storeType,
    })
  );

  const isCartAndOrdersLoading = isLoadingCart || isOrdersLoading;

  const { data: backendCategories, isLoading: isCategoriesLoading } = useQuery(
    trpc.unifiedStore.getCategories.queryOptions({ storeType: storeType })
  );
  // const allBackendCategories = backendCategoriesData?.json;

  const animalCategories = getPetOwnerCategories(backendCategories);
  const vetSpecialties = getVetSpecialties(backendCategories);

  const currentMainCategories = userMode === "veterinarian" ? vetSpecialties : animalCategories;

  const selectedMainCategory = currentMainCategories.find((cat) =>
    userMode === "veterinarian" ? cat.id === selectedSpecialty : cat.id === selectedAnimal
  );

  const currentSubcategories = selectedMainCategory?.subcategories || [];

  const { data: productsData, isLoading } = useQuery(
    trpc.unifiedStore.listProducts.queryOptions({
      storeType,
      category: userMode === "veterinarian" ? selectedSpecialty || undefined : selectedAnimal || undefined,
      subcategory:
        userMode === "veterinarian"
          ? selectedVetCategory === "all"
            ? undefined
            : selectedVetCategory
          : selectedCategory === "all"
          ? undefined
          : selectedCategory,
      search: searchQuery,
    })
  );

  const filteredProducts = productsData?.items || [];

  const handleAddToCart = (product: any) => {
    if (!user?.id) return;
    addToCart(user?.id, product.id, 1);
  };

  const handleToggleFavorite = (product: any) => {
    const isFavorite = favorites.some((f) => f.id === product.id.toString());

    if (isFavorite) {
      removeFromFavorites(product.id.toString());
    } else {
      addToFavorites({
        id: product.id.toString(),
        name: product.name,
        image: product.image || undefined,
        price: product.price,
        type: "product",
      });
    }
  };

  const handleAnimalSelect = (animalType: AnimalType) => {
    setSelectedAnimal(animalType);
    setSelectedCategory("all");
  };

  const handleSpecialtySelect = (specialty: VetSpecialty) => {
    setSelectedSpecialty(specialty);
    setSelectedVetCategory("all");
  };

  const handleBackToAnimals = () => {
    setSelectedAnimal(null);
    setSelectedCategory("all");
  };

  const handleBackToSpecialties = () => {
    setSelectedSpecialty(null);
    setSelectedVetCategory("all");
  };

  // Check if user has store management permissions
  const hasStorePermission = () => {
    if (isSuperAdmin) return true;
    if (!isModerator || !moderatorPermissions) return false;

    // Check if moderatorPermissions is an array of strings (new system)
    if (Array.isArray(moderatorPermissions)) {
      return moderatorPermissions.includes("manage_store_products");
    }

    // Fallback for legacy structure if any
    const storePerms = moderatorPermissions.storeManagement;
    if (storePerms) {
      return userMode === "veterinarian" ? storePerms.vetStores : storePerms.petOwnerStores;
    }

    return false;
  };

  const handleAddProduct = () => {
    const storeType = userMode === "veterinarian" ? "veterinarian" : "pet_owner";
    router.push(`/add-store-product?storeType=${storeType}`);
  };

  const handleManageStore = () => {
    const storeType = userMode === "veterinarian" ? "veterinarian" : "pet_owner";
    router.push(`/store-products-management?storeType=${storeType}`);
  };

  const handleSpecialtySettings = (specialty: VetSpecialty) => {
    router.push(`/vet-specialty-settings?specialty=${specialty}`);
  };

  const handleSpecialtyProducts = (specialty: VetSpecialty) => {
    router.push(`/vet-specialty-products?specialty=${specialty}`);
  };

  const handleSpecialtyAnalytics = (specialty: VetSpecialty) => {
    router.push(`/vet-specialty-analytics?specialty=${specialty}`);
  };

  const handlePetStoreSettings = () => {
    router.push("/pet-store-settings");
  };

  const handlePetCategorySettings = (category: AnimalType) => {
    router.push(`/pet-category-settings?category=${category}`);
  };

  const handlePetCategoryProducts = (category: AnimalType) => {
    router.push(`/pet-category-products?category=${category}`);
  };

  const handlePetCategoryAnalytics = (category: AnimalType) => {
    router.push(`/pet-category-analytics?category=${category}`);
  };

  const renderStoreHeader = (title: string, subtitle: string, showBack = false) => {
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTextSection}>
            {showBack && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={userMode === "veterinarian" ? handleBackToSpecialties : handleBackToAnimals}
              >
                <ArrowRight size={22} color={COLORS.primary} style={isRTL ? {} : { transform: [{ rotate: "180deg" }] }} />
              </TouchableOpacity>
            )}
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.cartButton} onPress={() => router.push("/cart")}>
            <ShoppingBag size={24} color={COLORS.primary} />
            {getCartItemCount() > 0 && !isCartAndOrdersLoading && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {hasStorePermission() && (
          <View style={styles.adminToolbar}>
            <TouchableOpacity style={styles.adminChip} onPress={handleAddProduct}>
              <Plus size={16} color={COLORS.white} />
              <Text style={styles.adminChipText}>إضافة منتج</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adminChip} onPress={handleManageStore}>
              <Settings size={16} color={COLORS.white} />
              <Text style={styles.adminChipText}>الإدارة</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.adminChip}
              onPress={() => {
                const storeType = userMode === "veterinarian" ? "veterinarian" : "pet_owner";
                router.push(`/store-orders?storeType=${storeType}`);
              }}
            >
              <ClipboardList size={16} color={COLORS.white} />
              <Text style={styles.adminChipText}>الطلبات</Text>
              {pendingOrdersCount && pendingOrdersCount > 0 && !isCartAndOrdersLoading && (
                <View style={styles.adminBadgeSmall}>
                  <Text style={styles.adminBadgeTextSmall}>{pendingOrdersCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderAnimalCategory = ({ item }: { item: (typeof animalCategories)[0] }) => (
    <View style={[styles.animalCard, { backgroundColor: item.color }]}>
      <TouchableOpacity style={styles.animalMainArea} onPress={() => handleAnimalSelect(item.id)}>
        <View style={styles.animalIconContainer}>{item.icon}</View>
        <Text style={styles.animalLabel}>{item.label}</Text>
        <View style={styles.animalArrow}>
          <ArrowRight size={20} color={COLORS.white} />
        </View>
      </TouchableOpacity>

      {hasStorePermission() && (
        <View style={styles.animalActionsContainer}>
          <TouchableOpacity style={styles.animalActionButton} onPress={() => handlePetCategorySettings(item.id)}>
            <Cog size={16} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.animalActionButton} onPress={() => handlePetCategoryProducts(item.id)}>
            <Package size={16} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.animalActionButton} onPress={() => handlePetCategoryAnalytics(item.id)}>
            <BarChart3 size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderSpecialtyCategory = ({ item }: { item: (typeof vetSpecialties)[0] }) => (
    <View style={[styles.animalCard, { backgroundColor: item.color }]}>
      <TouchableOpacity style={styles.specialtyMainArea} onPress={() => handleSpecialtySelect(item.id)}>
        <View style={styles.animalIconContainer}>{item.icon}</View>
        <Text style={styles.animalLabel}>{item.label}</Text>
        <View style={styles.animalArrow}>
          <ArrowRight size={20} color={COLORS.white} />
        </View>
      </TouchableOpacity>

      {hasStorePermission() && (
        <View style={styles.specialtyActionsContainer}>
          <TouchableOpacity style={styles.specialtyActionButton} onPress={() => handleSpecialtySettings(item.id)}>
            <Cog size={16} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.specialtyActionButton} onPress={() => handleSpecialtyProducts(item.id)}>
            <Package size={16} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.specialtyActionButton} onPress={() => handleSpecialtyAnalytics(item.id)}>
            <BarChart3 size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderCategoryItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[styles.categoryItem, selectedCategory === item.id && styles.selectedCategoryItem]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[styles.categoryText, selectedCategory === item.id && styles.selectedCategoryText]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderVetCategoryItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[styles.categoryItem, selectedVetCategory === item.id && styles.selectedCategoryItem]}
      onPress={() => setSelectedVetCategory(item.id)}
    >
      <Text style={[styles.categoryText, selectedVetCategory === item.id && styles.selectedCategoryText]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const handleProductPress = (product: Product) => {
    router.push(`/product-details?productId=${product.id}`);
  };

  const renderProductItem = ({ item }: { item: any }) => {
    const isFavorite = favorites.some((f) => f.id === item.id.toString());

    return (
      <TouchableOpacity style={styles.productCard} onPress={() => handleProductPress(item)}>
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
              fill={isFavorite ? COLORS.red : COLORS.darkGray}
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
            <Text style={styles.addButtonText}>اضف الي السلة</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Veterinarian Store - Show specialties first
  if (userMode === "veterinarian" && !selectedSpecialty) {
    return (
      <View style={styles.container}>
        {renderStoreHeader("المتجر البيطري", "منتجات طبية متخصصة للأطباء البيطريين")}

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
          contentContainerStyle={[styles.animalsList, { paddingBottom: 100 }]}
          columnWrapperStyle={styles.animalsRow}
        />
      </View>
    );
  }

  // Pet Owner Store - Show animal categories first
  if (userMode !== "veterinarian" && !selectedAnimal) {
    return (
      <View style={styles.container}>
        {renderStoreHeader(t("store.title"), "متجر الحيوانات الأليفة - منتجات عامة")}

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>متجر الحيوانات الأليفة</Text>
          <Text style={styles.welcomeSubtitle}>
            اختر نوع حيوانك الأليف لعرض المنتجات المناسبة من طعام وألعاب وإكسسوارات
          </Text>
        </View>

        <FlatList
          ref={animalFlatListRef}
          data={animalCategories}
          renderItem={renderAnimalCategory}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[styles.animalsList, { paddingBottom: 100 }]}
          columnWrapperStyle={styles.animalsRow}
        />
      </View>
    );
  }

  // Products view for both modes
  return (
    <View style={styles.container}>
      {renderStoreHeader(
        selectedMainCategory?.label || "",
        userMode === "veterinarian"
          ? "منتجات طبية متخصصة للأطباء البيطريين"
          : "متجر الحيوانات الأليفة - منتجات عامة",
        true
      )}

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              userMode === "veterinarian" ? "ابحث عن منتجات طبية بيطرية..." : "ابحث عن منتجات الحيوانات الأليفة..."
            }
            placeholderTextColor={COLORS.darkGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign={isRTL ? "right" : "left"}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        {userMode === "veterinarian" ? (
          <FlatList
            data={[{ id: "all", name: "الكل" }, ...currentSubcategories]}
            renderItem={renderVetCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        ) : (
          <FlatList
            data={[{ id: "all", name: "الكل" }, ...currentSubcategories]}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        )}
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
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    // textAlign: "right",
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
    // textAlign: "right",
  },
  adminToolbar: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
    paddingBottom: 4,
  },
  adminChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  adminChipText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  adminBadgeSmall: {
    backgroundColor: COLORS.red,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -4,
    marginTop: -8,
  },
  adminBadgeTextSmall: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.red,
    borderRadius: 11,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "600",
  },
  productsList: {
    padding: 8,
  },
  productsRow: {
    justifyContent: "space-between",
  },
  productCard: {
    width: "32%",
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 100,
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: COLORS.black,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 4,
  },
  ratingStars: {
    fontSize: 14,
    color: "#FFD700",
  },
  addButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  welcomeContainer: {
    padding: 12,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  animalsList: {
    padding: 16,
  },
  animalsRow: {
    justifyContent: "space-between",
  },
  animalCard: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    minHeight: 140,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  animalMainArea: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  animalActionsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  animalActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  specialtyMainArea: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  specialtyActionsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  specialtyActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  animalIconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 8,
  },
  animalArrow: {
    alignSelf: "flex-end",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
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
});
