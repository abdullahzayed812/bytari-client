import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Stack, router } from "expo-router";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { Order } from "../types";
import Button from "../components/Button";
import { Package, Clock, CheckCircle, Truck, XCircle, ShoppingBag } from "lucide-react-native";
import { useOrders } from "@/providers/OrdersProvider";

const getStatusIcon = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return <Clock size={20} color={COLORS.warning} />;
    case "confirmed":
      return <CheckCircle size={20} color={COLORS.info} />;
    case "preparing":
      return <Package size={20} color={COLORS.info} />;
    case "shipped":
      return <Truck size={20} color={COLORS.primary} />;
    case "delivered":
      return <CheckCircle size={20} color={COLORS.success} />;
    case "cancelled":
      return <XCircle size={20} color={COLORS.red} />;
    default:
      return <Clock size={20} color={COLORS.gray} />;
  }
};

const getStatusText = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "في الانتظار";
    case "confirmed":
      return "تم التأكيد";
    case "preparing":
      return "قيد التحضير";
    case "shipped":
      return "في الطريق";
    case "delivered":
      return "تم التوصيل";
    case "cancelled":
      return "ملغي";
    default:
      return "غير معروف";
  }
};

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return COLORS.warning;
    case "confirmed":
    case "preparing":
      return COLORS.info;
    case "shipped":
      return COLORS.primary;
    case "delivered":
      return COLORS.success;
    case "cancelled":
      return COLORS.red;
    default:
      return COLORS.gray;
  }
};

export default function OrdersScreen() {
  const { t } = useI18n();
  const { orders } = useOrders();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => router.push(`/order-details?orderId=${item.id}`)}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>طلب #{item.id.slice(-6)}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        <Text style={styles.itemsTitle}>المنتجات ({item.items.length}):</Text>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <View key={index} style={styles.orderItemRow}>
            <Image source={{ uri: orderItem.product.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{orderItem.product.name}</Text>
              <Text style={styles.itemQuantity}>الكمية: {orderItem.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>{orderItem.product.price} ريال</Text>
          </View>
        ))}
        {item.items.length > 2 && <Text style={styles.moreItems}>و {item.items.length - 2} منتجات أخرى...</Text>}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>المجموع:</Text>
          <Text style={styles.totalAmount}>{item.total.toFixed(2)} ريال</Text>
        </View>
        <View style={styles.paymentMethod}>
          <Text style={styles.paymentLabel}>
            {item.paymentMethod === "cash" ? "الدفع عند الاستلام" : "دفع إلكتروني"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "طلباتي", headerShown: true }} />
        <View style={styles.emptyContainer}>
          <ShoppingBag size={80} color={COLORS.gray} />
          <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
          <Text style={styles.emptySubtitle}>لم تقم بأي طلبات حتى الآن</Text>
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
      <Stack.Screen options={{ title: "طلباتي", headerShown: true }} />

      <FlatList
        data={orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
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
  ordersList: {
    padding: 16,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  orderItems: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  orderItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.black,
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  moreItems: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 12,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  paymentMethod: {
    alignItems: "flex-end",
  },
  paymentLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
});
