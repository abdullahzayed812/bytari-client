import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingBag,
  Eye,
  Edit,
  Filter,
  Search,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
} from "lucide-react-native";
import Button from "../components/Button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "cash" | "card";
  paymentStatus: "pending" | "paid" | "failed";
  deliveryAddress: {
    name: string;
    phone: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  storeId: string;
  storeName: string;
}

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

export default function AdminOrdersManagement() {
  const router = useRouter();
  // const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Order["status"]>("pending");

  // Use TRPC query to fetch orders from backend, passing filter & search
  const { data, isLoading, isError, refetch } = useQuery(
    trpc.orders.list.queryOptions({
      status: filterStatus === "all" ? undefined : (filterStatus as any),
      search: searchQuery.trim() || undefined,
      limit: 50,
      offset: 0,
    })
  );
  const orders: Order[] = useMemo(() => (data as any)?.orders, [data]);

  const updateOrderStatusMutation = useMutation(
    trpc.orders.update.mutationOptions({
      onSuccess: () => {
        Alert.alert("تم التحديث", "تم تحديث حالة الطلب بنجاح");
        setShowStatusModal(false);
        setSelectedOrder(null);
        refetch(); // refetch orders list after successful update
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message || "فشل تحديث حالة الطلب");
      },
    })
  );

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order?.userName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      order?.userEmail?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      order?.id?.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const handleUpdateOrderStatus = (orderId: string, status: Order["status"]) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleEditOrderStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      totalRevenue: orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0),
    };
    return stats;
  };

  const stats = getOrderStats();

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>طلب #{item.id}</Text>
          <Text style={styles.customerName}>{item.userName}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.orderSummary}>
        <Text style={styles.itemsCount}>المنتجات: {item.items.length}</Text>
        <Text style={styles.totalAmount}>{item.total.toFixed(2)} ريال</Text>
        <Text style={styles.paymentMethod}>
          {item.paymentMethod === "cash" ? "الدفع عند الاستلام" : "دفع إلكتروني"}
        </Text>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity style={[styles.actionButton, styles.viewButton]} onPress={() => handleViewOrderDetails(item)}>
          <Eye size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>عرض</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditOrderStatus(item)}>
          <Edit size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>تحديث الحالة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة الطلبات",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      {/* Statistics Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: COLORS.primary + "20" }]}>
          <ShoppingBag size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>إجمالي الطلبات</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: COLORS.warning + "20" }]}>
          <Clock size={24} color={COLORS.warning} />
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>في الانتظار</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: COLORS.success + "20" }]}>
          <CheckCircle size={24} color={COLORS.success} />
          <Text style={styles.statNumber}>{stats.delivered}</Text>
          <Text style={styles.statLabel}>تم التوصيل</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: COLORS.info + "20" }]}>
          <DollarSign size={24} color={COLORS.info} />
          <Text style={styles.statNumber}>{stats.totalRevenue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>إجمالي المبيعات</Text>
        </View>
      </ScrollView>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث بالاسم، الإيميل، أو رقم الطلب..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {[
          { key: "all", label: "الكل" },
          { key: "pending", label: "في الانتظار" },
          { key: "confirmed", label: "تم التأكيد" },
          { key: "preparing", label: "قيد التحضير" },
          { key: "shipped", label: "في الطريق" },
          { key: "delivered", label: "تم التوصيل" },
          { key: "cancelled", label: "ملغي" },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterChip, filterStatus === filter.key && styles.activeFilterChip]}
            onPress={() => setFilterStatus(filter.key)}
          >
            <Text style={[styles.filterChipText, filterStatus === filter.key && styles.activeFilterChipText]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ShoppingBag size={80} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
            <Text style={styles.emptySubtitle}>لم يتم العثور على طلبات تطابق البحث</Text>
          </View>
        }
      />

      {/* Order Details Modal */}
      <Modal visible={showOrderDetails} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>تفاصيل الطلب #{selectedOrder?.id}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowOrderDetails(false)}>
              <XCircle size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          {selectedOrder && (
            <ScrollView style={styles.modalContent}>
              {/* Customer Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>معلومات العميل</Text>
                <View style={styles.infoRow}>
                  <User size={16} color={COLORS.gray} />
                  <Text style={styles.infoText}>{selectedOrder.userName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Mail size={16} color={COLORS.gray} />
                  <Text style={styles.infoText}>{selectedOrder.userEmail}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Phone size={16} color={COLORS.gray} />
                  <Text style={styles.infoText}>{selectedOrder.userPhone}</Text>
                </View>
              </View>

              {/* Delivery Address */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>عنوان التوصيل</Text>
                <View style={styles.infoRow}>
                  <MapPin size={16} color={COLORS.gray} />
                  <Text style={styles.infoText}>{selectedOrder.deliveryAddress.address}</Text>
                </View>
              </View>

              {/* Order Items */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>المنتجات المطلوبة</Text>
                {selectedOrder.items.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Image source={{ uri: item.productImage }} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.productName}</Text>
                      <Text style={styles.itemStore}>من: {item.storeName}</Text>
                      <Text style={styles.itemQuantity}>الكمية: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)} ريال</Text>
                  </View>
                ))}
              </View>

              {/* Order Summary */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ملخص الطلب</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>المجموع الفرعي:</Text>
                  <Text style={styles.summaryValue}>{selectedOrder.total.toFixed(2)} ريال</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>رسوم التوصيل:</Text>
                  <Text style={styles.summaryValue}>مجاني</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>المجموع الكلي:</Text>
                  <Text style={styles.totalValue}>{selectedOrder.total.toFixed(2)} ريال</Text>
                </View>
              </View>

              {/* Payment Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>معلومات الدفع</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>طريقة الدفع:</Text>
                  <Text style={styles.infoText}>
                    {selectedOrder.paymentMethod === "cash" ? "الدفع عند الاستلام" : "دفع إلكتروني"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>حالة الدفع:</Text>
                  <Text
                    style={[
                      styles.infoText,
                      {
                        color: selectedOrder.paymentStatus === "paid" ? COLORS.success : COLORS.warning,
                      },
                    ]}
                  >
                    {selectedOrder.paymentStatus === "paid" ? "مدفوع" : "في الانتظار"}
                  </Text>
                </View>
              </View>

              {/* Notes */}
              {selectedOrder.notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>ملاحظات</Text>
                  <Text style={styles.notesText}>{selectedOrder.notes}</Text>
                </View>
              )}

              {/* Order Timeline */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>تاريخ الطلب</Text>
                <View style={styles.infoRow}>
                  <Calendar size={16} color={COLORS.gray} />
                  <Text style={styles.infoText}>تم الإنشاء: {formatDate(selectedOrder.createdAt)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Calendar size={16} color={COLORS.gray} />
                  <Text style={styles.infoText}>آخر تحديث: {formatDate(selectedOrder.updatedAt)}</Text>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Status Update Modal */}
      <Modal visible={showStatusModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.statusModal}>
            <Text style={styles.statusModalTitle}>تحديث حالة الطلب</Text>

            {[
              { key: "pending", label: "في الانتظار" },
              { key: "confirmed", label: "تم التأكيد" },
              { key: "preparing", label: "قيد التحضير" },
              { key: "shipped", label: "في الطريق" },
              { key: "delivered", label: "تم التوصيل" },
              { key: "cancelled", label: "ملغي" },
            ].map((status) => (
              <TouchableOpacity
                key={status.key}
                style={[styles.statusOption, newStatus === status.key && styles.selectedStatusOption]}
                onPress={() => setNewStatus(status.key as Order["status"])}
              >
                {getStatusIcon(status.key as Order["status"])}
                <Text style={[styles.statusOptionText, newStatus === status.key && styles.selectedStatusOptionText]}>
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.statusModalActions}>
              <Button
                title="إلغاء"
                onPress={() => setShowStatusModal(false)}
                type="outline"
                style={styles.modalButton}
              />
              <Button
                title="تحديث"
                onPress={() => selectedOrder && handleUpdateOrderStatus(selectedOrder.id, newStatus)}
                type="primary"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 120,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.black,
  },
  filterButton: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  activeFilterChipText: {
    color: COLORS.white,
    fontWeight: "600",
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
    alignItems: "flex-start",
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
  customerName: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 14,
    color: COLORS.gray,
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
  orderSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  itemsCount: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  paymentMethod: {
    fontSize: 12,
    color: COLORS.gray,
  },
  orderActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  viewButton: {
    backgroundColor: COLORS.info,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    minWidth: 100,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.darkGray,
    flex: 1,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 2,
  },
  itemStore: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: COLORS.gray,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  summaryValue: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  notesText: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 24,
    backgroundColor: COLORS.gray,
    padding: 12,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusModal: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  statusModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "center",
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedStatusOption: {
    backgroundColor: COLORS.primary + "20",
    borderColor: COLORS.primary,
  },
  statusOptionText: {
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 12,
  },
  selectedStatusOptionText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  statusModalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
  },
});
