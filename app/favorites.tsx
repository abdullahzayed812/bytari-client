import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useCallback } from "react";
import { Stack, router } from "expo-router";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { FavoriteItem } from "../types";
import Button from "../components/Button";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react-native";
import { useCart } from "@/providers/CartProvider";
import { useFavorites } from "@/providers/FavoritesProvider";

export default function FavoritesScreen() {
  const { t } = useI18n();
  const { addToCart } = useCart();
  const { favorites, removeFromFavorites } = useFavorites();

  const handleAddToCart = (item: FavoriteItem) => {
    addToCart({
      productId: item.productId,
      quantity: 1,
      product: item.product,
    });
  };

  const handleRemoveFromFavorites = (productId: string) => {
    removeFromFavorites(productId);
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => (
    <View style={styles.favoriteItem}>
      <Image source={{ uri: item.product.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.product.name}</Text>
        <Text style={styles.productPrice}>{item.product.price} ريال</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{item.product.rating}</Text>
          <Text style={styles.ratingStars}>★★★★★</Text>
        </View>
        <View style={styles.actionButtons}>
          <Button
            title="إضافة للسلة"
            onPress={() => handleAddToCart(item)}
            type="primary"
            size="small"
            icon={<ShoppingCart size={16} color={COLORS.white} />}
            style={styles.addToCartButton}
          />
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveFromFavorites(item.productId)}>
            <Heart size={20} color={COLORS.red} fill={COLORS.red} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "المفضلة", headerShown: true }} />
        <View style={styles.emptyContainer}>
          <Heart size={80} color={COLORS.gray} />
          <Text style={styles.emptyTitle}>لا توجد منتجات مفضلة</Text>
          <Text style={styles.emptySubtitle}>أضف بعض المنتجات إلى المفضلة لتظهر هنا</Text>
          <Button
            title="تصفح المنتجات"
            onPress={() => router.push("/(tabs)/store")}
            type="primary"
            style={styles.shopButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "المفضلة", headerShown: true }} />

      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.favoritesList}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 30,
  },
  shopButton: {
    width: 200,
  },
  favoritesList: {
    padding: 16,
  },
  favoriteItem: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "bold",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addToCartButton: {
    flex: 1,
    marginRight: 12,
  },
  removeButton: {
    padding: 8,
  },
});
