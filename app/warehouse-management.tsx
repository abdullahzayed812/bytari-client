import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState, useMemo } from "react";
import { COLORS } from "../constants/colors";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Plus, Search, Edit, Trash2, Package, AlertCircle, Eye, EyeOff, Settings, Users, Send } from "lucide-react-native";
import { formatPrice } from "../constants/currency";
import Button from "../components/Button 2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/AppProvider";
import { trpc } from "@/lib/trpc";
import { useToastContext } from "@/providers/ToastProvider";
import { ImageUploader } from "@/components/ImageUploader";

type FilterType = "all" | "medicine" | "equipment" | "supplements" | "tools";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category: string;
  image: string;
  inStock: boolean;
  warehouseId: number;
  createdAt: string;
  updatedAt?: string;
}

export default function WarehouseManagementScreen() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();
  const { canEdit, isOwner } = useLocalSearchParams();

  const { data, isLoading, error } = useQuery(trpc.stores.getUserStores.queryOptions({ userId: user?.id }));
  const warehouses = useMemo(() => (data as any)?.stores, [data]);

  const deleteProductMutation = useMutation(trpc.stores.products.delete.mutationOptions());
  const toggleVisibilityMutation = useMutation(trpc.stores.products.toggle.mutationOptions());

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any | null>(null);
  const [showWarehouseModal, setShowWarehouseModal] = useState<boolean>(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageImage, setMessageImage] = useState("");

  const sendMessageMutation = useMutation(trpc.stores.sendMessageToFollowers.mutationOptions());

  const handleSendMessage = async () => {
    if (!messageTitle.trim() || !messageBody.trim()) {
      showToast({ type: "error", message: "يرجى إدخال العنوان والرسالة" });
      return;
    }
    try {
      const result = await sendMessageMutation.mutateAsync({
        storeId: warehouses?.[0]?.id,
        title: messageTitle.trim(),
        message: messageBody.trim(),
        ...(messageImage ? { imageUrl: messageImage } : {}),
      });
      showToast({ type: "success", message: `تم إرسال الرسالة إلى ${result.count} متابع` });
      setShowMessageModal(false);
      setMessageTitle("");
      setMessageBody("");
      setMessageImage("");
    } catch {
      showToast({ type: "error", message: "حدث خطأ أثناء إرسال الرسالة" });
    }
  };

  const products = useMemo(() => {
    if (!warehouses) return [];
    return warehouses?.flatMap((w) => w.products || []);
  }, [warehouses]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "medicine" && product.category === "أدوية") ||
        (selectedFilter === "equipment" && product.category === "معدات طبية") ||
        (selectedFilter === "supplements" && product.category === "مكملات غذائية") ||
        (selectedFilter === "tools" && product.category === "أدوات");
      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, selectedFilter]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "إدارة المذخر",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري تحميل المذخر...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "إدارة المذخر",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color={COLORS.red} />
          <Text style={styles.errorText}>حدث خطأ أثناء تحميل البيانات</Text>
          <Text style={styles.errorSubtext}>{error.message}</Text>
          <Button
            title="إعادة المحاولة"
            onPress={() => queryClient.invalidateQueries({ queryKey: ["warehouses.getUserWarehouses"] })}
            type="primary"
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  if (!warehouses || warehouses.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "إدارة المذخر",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <View style={styles.emptyWarehouseContainer}>
          <Package size={64} color={COLORS.lightGray} />
          <Text style={styles.emptyStateText}>لا يوجد مذخر مرتبط بحسابك</Text>
          <Text style={styles.emptyStateSubtext}>يرجى التواصل مع الإدارة لتفعيل مذخرك</Text>
        </View>
      </View>
    );
  }

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: "all", label: "جميع المنتجات", count: products.length },
    { id: "medicine", label: "أدوية", count: products.filter((p) => p.category === "أدوية").length },
    { id: "equipment", label: "معدات طبية", count: products.filter((p) => p.category === "معدات طبية").length },
    { id: "supplements", label: "مكملات غذائية", count: products.filter((p) => p.category === "مكملات غذائية").length },
    { id: "tools", label: "أدوات", count: products.filter((p) => p.category === "أدوات").length },
  ];

  const handleAddProduct = () => {
    if (warehouses && warehouses.length > 0) {
      router.push(`/add-product?warehouseId=${warehouses[0].id}`);
    }
  };

  const handleWarehouseSettings = () => {
    if (warehouses && warehouses.length > 0) {
      router.push(`/warehouse-settings?warehouseId=${warehouses[0].id}`);
    }
  };

  const handleEditProduct = (product: Product) => {
    router.push(`/edit-product?id=${product.id}&warehouseId=${product.warehouseId}`);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate({ productId: productToDelete.id } as any, {
        onSuccess: () => {
          queryClient.invalidateQueries(trpc.stores.getUserStores.queryKey);
          Alert.alert("تم الحذف", "تم حذف المنتج بنجاح");
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "حدث خطأ أثناء حذف المنتج");
        },
      });
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleToggleVisibility = (product: Product) => {
    const newInStock = !product.inStock;

    toggleVisibilityMutation.mutate(
      {
        productId: product.id,
        inStock: newInStock,
      } as any,
      {
        onSuccess: (data: any) => {
          queryClient.invalidateQueries(trpc.stores.getUserStores.queryKey);

          // تحديد الرسالة حسب الحالة الجديدة
          const message = newInStock
            ? `تم عرض المنتج ${data?.product?.name} للبيع`
            : `تم إخفاء المنتج ${data?.product?.name} من العرض`;

          showToast({ type: "success", message });
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "حدث خطأ أثناء تحديث حالة المنتج");
        },
      }
    );
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const getStockStatus = (stockQuantity: number) => {
    if (stockQuantity === 0) return { label: "نفد المخزون", color: COLORS.red };
    if (stockQuantity < 10) return { label: "مخزون منخفض", color: "#FF8C00" };
    return { label: "متوفر", color: COLORS.green };
  };

  const renderFilterChip = (filter: { id: FilterType; label: string; count: number }) => (
    <TouchableOpacity
      key={filter.id}
      style={[styles.filterChip, selectedFilter === filter.id && styles.selectedFilterChip]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Text style={[styles.filterText, selectedFilter === filter.id && styles.selectedFilterText]}>
        {filter.label} ({filter.count})
      </Text>
    </TouchableOpacity>
  );

  const renderProductCard = (product: Product) => {
    const stockStatus = getStockStatus(product.stockQuantity);

    return (
      <View key={product.id} style={styles.productCard}>
        <View style={styles.productHeader}>
          <Image source={{ uri: product.images[0] }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>{formatPrice(+product?.price)}</Text>
              <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
                <Text style={styles.stockText}>{stockStatus.label}</Text>
              </View>
            </View>
            <Text style={styles.quantityText}>الكمية: {product.stockQuantity}</Text>
          </View>
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity style={[styles.actionButton, styles.viewButton]} onPress={() => handleViewProduct(product)}>
            <Eye size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>عرض</Text>
          </TouchableOpacity>

          {isOwner === "true" || canEdit === "true" ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditProduct(product)}
              >
                <Edit size={16} color={COLORS.white} />
                <Text style={styles.actionButtonText}>تعديل</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, product.inStock ? styles.hideButton : styles.showButton]}
                onPress={() => handleToggleVisibility(product)}
              >
                {product.inStock ? <EyeOff size={16} color={COLORS.white} /> : <Eye size={16} color={COLORS.white} />}
                <Text style={styles.actionButtonText}>{product.inStock ? "إخفاء" : "إظهار"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteProduct(product)}
              >
                <Trash2 size={16} color={COLORS.white} />
                <Text style={styles.actionButtonText}>حذف</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>
    );
  };

  const renderProductModal = () => {
    if (!selectedProduct) return null;

    const stockStatus = getStockStatus(selectedProduct.stockQuantity);

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
              <Text style={styles.closeButtonText}>إغلاق</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تفاصيل المنتج</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: selectedProduct.image }} style={styles.modalProductImage} />

            <View style={styles.productDetailsContainer}>
              <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
              <Text style={styles.modalProductCategory}>{selectedProduct.category}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>السعر:</Text>
                <Text style={styles.detailValue}>{formatPrice(selectedProduct?.price)}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>الكمية المتوفرة:</Text>
                <Text style={[styles.detailValue, { color: stockStatus.color }]}>
                  {selectedProduct.stockQuantity} ({stockStatus.label})
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>الحالة:</Text>
                <Text style={[styles.detailValue, { color: selectedProduct.inStock ? COLORS.green : COLORS.red }]}>
                  {selectedProduct.inStock ? "مفعل" : "مخفي"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>تاريخ الإضافة:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedProduct.createdAt).toLocaleDateString("ar-SA")}
                </Text>
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>الوصف:</Text>
                <Text style={styles.modalProductDescription}>
                  {selectedProduct.description || "لا يوجد وصف متاح لهذا المنتج."}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const handleWarehousePress = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setShowWarehouseModal(true);
  };

  const renderWarehouseModal = () => {
    if (!selectedWarehouse) return null;

    return (
      <Modal
        visible={showWarehouseModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWarehouseModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowWarehouseModal(false)}>
              <Text style={styles.closeButtonText}>إغلاق</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تفاصيل المذخر</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedWarehouse.images && selectedWarehouse.images.length > 0 && (
              <Image source={{ uri: selectedWarehouse.images[0] }} style={styles.modalProductImage} />
            )}

            <View style={styles.productDetailsContainer}>
              <Text style={styles.modalProductName}>{selectedWarehouse.name}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>العنوان:</Text>
                <Text style={styles.detailValue}>{selectedWarehouse.address || "غير محدد"}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>الهاتف:</Text>
                <Text style={styles.detailValue}>{selectedWarehouse.phone || "غير محدد"}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>البريد الإلكتروني:</Text>
                <Text style={styles.detailValue}>{selectedWarehouse.email || "غير محدد"}</Text>
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>الوصف:</Text>
                <Text style={styles.modalProductDescription}>
                  {selectedWarehouse.description || "لا يوجد وصف متاح لهذا المذخر."}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderDeleteModal = () => {
    return (
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <AlertCircle size={48} color={COLORS.red} style={styles.deleteIcon} />
            <Text style={styles.deleteTitle}>تأكيد الحذف</Text>
            <Text style={styles.deleteMessage}>هل أنت متأكد من حذف هذا المنتج؟</Text>
            <Text style={styles.deleteWarning}>لا يمكن التراجع عن هذا الإجراء</Text>

            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={[styles.deleteActionButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteActionButton, styles.confirmDeleteButton]}
                onPress={confirmDelete}
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>حذف</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة المذخر",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: () => (
            <TouchableOpacity onPress={() => warehouses && warehouses[0] && handleWarehousePress(warehouses[0])}>
              <Text style={{ color: "white", marginRight: 10 }}>تفاصيل المذخر</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Package size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>إجمالي المنتجات</Text>
        </View>

        <View style={styles.statCard}>
          <AlertCircle size={24} color={COLORS.warning} />
          <Text style={styles.statNumber}>{products.filter((p) => p.stockQuantity < 10).length}</Text>
          <Text style={styles.statLabel}>مخزون منخفض</Text>
        </View>

        <View style={styles.statCard}>
          <Eye size={24} color={COLORS.green} />
          <Text style={styles.statNumber}>{products.filter((p) => p.inStock).length}</Text>
          <Text style={styles.statLabel}>منتجات مفعلة</Text>
        </View>
      </View>

      {/* Search bar */}
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

      {/* Action buttons row */}
      {(isOwner === "true" || canEdit === "true") && (
        <View style={styles.actionsRow}>
          {isOwner === "true" && (
            <TouchableOpacity style={styles.actionRowButton} onPress={handleWarehouseSettings}>
              <Settings size={18} color={COLORS.white} />
              <Text style={styles.actionRowButtonText}>إعدادات</Text>
            </TouchableOpacity>
          )}
          {isOwner === "true" && (
            <TouchableOpacity style={[styles.actionRowButton, styles.messageRowButton]} onPress={() => setShowMessageModal(true)}>
              <Send size={18} color={COLORS.white} />
              <Text style={styles.actionRowButtonText}>رسالة للمتابعين</Text>
            </TouchableOpacity>
          )}
          {canEdit === "true" && (
            <TouchableOpacity style={[styles.actionRowButton, styles.addRowButton]} onPress={handleAddProduct}>
              <Plus size={18} color={COLORS.white} />
              <Text style={styles.actionRowButtonText}>إضافة منتج</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map(renderFilterChip)}
      </ScrollView>

      {/* Products List */}
      <ScrollView style={styles.productsScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.productsContainer}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(renderProductCard)
          ) : (
            <View style={styles.emptyState}>
              <Package size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>لا توجد منتجات</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? "جرب البحث بكلمات أخرى" : "ابدأ بإضافة منتجات جديدة"}
              </Text>
              {!searchQuery && canEdit === "true" && (
                <Button
                  title="إضافة منتج جديد"
                  onPress={handleAddProduct}
                  type="primary"
                  style={styles.emptyStateButton}
                  icon={<Plus size={20} color={COLORS.white} />}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {renderProductModal()}
      {renderDeleteModal()}
      {renderWarehouseModal()}

      <Modal visible={showMessageModal} transparent animationType="slide">
        <View style={styles.messageModalOverlay}>
          <View style={styles.messageModalContent}>
            <Text style={styles.messageModalTitle}>إرسال رسالة للمتابعين</Text>
            <TextInput
              style={styles.messageModalInput}
              placeholder="عنوان الرسالة"
              value={messageTitle}
              onChangeText={setMessageTitle}
              textAlign="right"
            />
            <TextInput
              style={[styles.messageModalInput, { height: 100, textAlignVertical: "top" }]}
              placeholder="نص الرسالة"
              value={messageBody}
              onChangeText={setMessageBody}
              multiline
              textAlign="right"
            />
            <ImageUploader
              imageUri={messageImage}
              onUploadComplete={setMessageImage}
              label="صورة (اختياري)"
              aspect={[16, 9]}
            />
            <View style={styles.messageModalButtons}>
              <TouchableOpacity
                style={[styles.messageModalButton, { backgroundColor: COLORS.primary }]}
                onPress={handleSendMessage}
                disabled={sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.messageModalButtonText}>إرسال</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.messageModalButton, { backgroundColor: COLORS.darkGray }]}
                onPress={() => setShowMessageModal(false)}
              >
                <Text style={styles.messageModalButtonText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
  },
  errorSubtext: {
    color: COLORS.darkGray,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
  },
  emptyWarehouseContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  statsContainer: {
    flexDirection: "row-reverse",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    textAlign: "center",
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.white,
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
  actionsRow: {
    flexDirection: "row-reverse",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  actionRowButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9800",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 6,
  },
  messageRowButton: {
    backgroundColor: "#7C3AED",
  },
  addRowButton: {
    backgroundColor: COLORS.primary,
  },
  actionRowButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
  filtersScroll: {
    backgroundColor: COLORS.white,
    maxHeight: 60,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  filterChip: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  selectedFilterText: {
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
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: "row-reverse",
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    resizeMode: "cover",
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "left",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "600",
  },
  quantityText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "left",
  },
  productActions: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
  },
  editButton: {
    backgroundColor: "#4CAF50",
  },
  hideButton: {
    backgroundColor: "#FF9800",
  },
  showButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: COLORS.red,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
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
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: "row-reverse",
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
  closeButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
  },
  placeholder: {
    width: 60,
  },
  modalContent: {
    flex: 1,
  },
  modalProductImage: {
    width: "100%",
    height: 200,
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
    textAlign: "left",
    marginBottom: 8,
  },
  modalProductCategory: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "left",
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  descriptionContainer: {
    marginTop: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
    marginBottom: 8,
  },
  modalProductDescription: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "left",
    lineHeight: 24,
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  deleteModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  deleteIcon: {
    marginBottom: 16,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "center",
  },
  deleteMessage: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 8,
  },
  deleteWarning: {
    fontSize: 14,
    color: COLORS.red,
    textAlign: "center",
    marginBottom: 24,
  },
  deleteActions: {
    flexDirection: "row-reverse",
    gap: 12,
    width: "100%",
  },
  deleteActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  confirmDeleteButton: {
    backgroundColor: COLORS.red,
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  messageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  messageModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  messageModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 16,
  },
  messageModalInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    textAlign: "right",
  },
  messageModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  messageModalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  messageModalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
