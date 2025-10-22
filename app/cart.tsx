import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Alert } from "react-native";
import React from "react";
import { Stack, router } from "expo-router";
import { COLORS } from "../constants/colors";
import { formatPrice } from "../constants/currency";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { CartItem } from "../types";
import Button from "../components/Button";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart } from "lucide-react-native";
import { useCart } from "@/providers/CartProvider";

export default function CartScreen() {
  const { t } = useI18n();
  const { cart, removeFromCart, clearCart } = useCart();

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      Alert.alert("حذف المنتج", "هل تريد حذف هذا المنتج من السلة؟", [
        { text: "إلغاء", style: "cancel" },
        { text: "حذف", style: "destructive", onPress: () => removeFromCart(productId) },
      ]);
    } else {
      // updateCartQuantity(productId, newQuantity);
    }
  };

  const handleClearCart = () => {
    Alert.alert("إفراغ السلة", "هل تريد إفراغ السلة بالكامل؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "إفراغ", style: "destructive", onPress: clearCart },
    ]);
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.product.name}</Text>
        <Text style={styles.productPrice}>{formatPrice(item.product.price)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.productId, item.quantity - 1)}
          >
            <Minus size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.productId, item.quantity + 1)}
          >
            <Plus size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemActions}>
        <Text style={styles.itemTotal}>{formatPrice(item.product.price * item.quantity)}</Text>
        <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.productId)}>
          <Trash2 size={20} color={COLORS.red} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "السلة", headerShown: true }} />
        <View style={styles.emptyContainer}>
          <ShoppingCart size={80} color={COLORS.gray} />
          <Text style={styles.emptyTitle}>السلة فارغة</Text>
          <Text style={styles.emptySubtitle}>أضف بعض المنتجات لتبدأ التسوق</Text>
          <Button title="تصفح المنتجات" onPress={() => router.back()} type="primary" style={styles.shopButton} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "السلة",
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleClearCart}>
              <Text style={styles.clearText}>إفراغ السلة</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>المجموع الكلي:</Text>
          <Text style={styles.totalPrice}>{formatPrice(getTotalPrice())}</Text>
        </View>
        <Button title="إتمام الشراء" onPress={handleCheckout} type="primary" style={styles.checkoutButton} />
      </View>
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
  clearText: {
    color: COLORS.red,
    fontSize: 16,
    fontWeight: "600",
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
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
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: "center",
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  checkoutButton: {
    width: "100%",
  },
});
