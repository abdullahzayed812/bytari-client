import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { formatPrice } from "../constants/currency";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { Product } from "../types";
import { mockProducts } from "../mocks/data";
import Button from "../components/Button 2";
import { ShoppingCart, Heart, Star, ArrowLeft, Phone, Share, Truck, Shield, RotateCcw } from "lucide-react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useCart } from "@/providers/CartProvider";
import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export default function ProductDetailsScreen() {
  const { productId, storeType } = useLocalSearchParams();
  const { t, isRTL } = useI18n();
  const { addToCart } = useCart();
  const { userMode } = useApp();
  const [quantity, setQuantity] = useState(1);

  // Determine store type if not passed in params
  const effectiveStoreType =
    (storeType as "veterinarian" | "pet_owner") || (userMode === "veterinarian" ? "veterinarian" : "pet_owner");

  const {
    data: product,
    isLoading,
    error,
  } = useQuery(
    trpc.unifiedStore.getProduct.queryOptions({
      id: Number(productId),
      storeType: effectiveStoreType,
    })
  );

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      productId: product.id.toString(),
      quantity,
      product: {
        ...product,
        id: product.id.toString(),
        image: product.image || "", // Handle null image
        rating: 0, // Default rating as it's not in marketplace_products yet
      },
    });
    Alert.alert("تم الإضافة", "تم إضافة المنتج إلى السلة بنجاح");
  };

  const handleToggleFavorite = () => {
    // Implement favorite logic
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleContactSeller = () => {
    Alert.alert("اتصال بالبائع", "سيتم الاتصال بالبائع قريباً");
  };

  const handleShare = () => {
    Alert.alert("مشاركة المنتج", "سيتم مشاركة المنتج قريباً");
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>المنتج غير موجود</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: product.name,
          headerShown: true,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
            <Heart size={24} color={COLORS.gray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>

          {/* Rating - Placeholder for now */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={16} color={COLORS.lightGray} fill={"transparent"} />
              ))}
            </View>
            <Text style={styles.ratingText}>(0)</Text>
            <Text style={styles.reviewsText}>• 0 تقييم</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{formatPrice(product.price)}</Text>
            {/* <Text style={styles.originalPrice}>{formatPrice(product.price * 1.2)}</Text> */}
            {/* <View style={styles.discountBadge}>
              <Text style={styles.discountText}>خصم 20%</Text>
            </View> */}
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>الوصف</Text>
            <Text style={styles.description}>{product.description || "لا يوجد وصف متاح"}</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>المميزات</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Shield size={16} color={COLORS.primary} />
                <Text style={styles.featureText}>جودة مضمونة</Text>
              </View>
              {/* <View style={styles.featureItem}>
                <Truck size={16} color={COLORS.primary} />
                <Text style={styles.featureText}>توصيل مجاني</Text>
              </View> */}
              {/* <View style={styles.featureItem}>
                <RotateCcw size={16} color={COLORS.primary} />
                <Text style={styles.featureText}>إمكانية الإرجاع</Text>
              </View> */}
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.sectionTitle}>الكمية</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(-1)}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(1)}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactSeller}>
          <Phone size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Button
          title={`إضافة للسلة • ${formatPrice(product.price * quantity)}`}
          onPress={handleAddToCart}
          type="primary"
          icon={<ShoppingCart size={20} color={COLORS.white} />}
          style={styles.addToCartButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    height: 300,
    backgroundColor: COLORS.lightGray,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
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
  shareButton: {
    position: "absolute",
    top: 16,
    left: 16,
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
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "left",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: "row-reverse",
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  priceContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 24,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginLeft: 12,
  },
  originalPrice: {
    fontSize: 18,
    color: COLORS.darkGray,
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "bold",
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "left",
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  quantityContainer: {
    marginBottom: 24,
  },
  quantitySelector: {
    flexDirection: "row-reverse",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginHorizontal: 20,
  },
  bottomActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: 12,
  },
  contactButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addToCartButton: {
    flex: 1,
  },
});
