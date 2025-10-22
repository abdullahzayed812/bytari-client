import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Image, Alert } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import Button from "../components/Button";
import { ArrowRight, Plus, Package, BarChart3, Settings, Eye, Edit, Trash2 } from "lucide-react-native";
import { router } from "expo-router";
import { Stack } from "expo-router";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
}

export default function StoreManagementScreen() {
  const { t, isRTL } = useI18n();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "settings">("overview");

  // Mock store data - replace with actual data from API
  const storeData = {
    id: 1,
    name: "مذخر الرحمة البيطري",
    subscriptionStatus: "active",
    subscriptionEndDate: new Date("2024-12-31"),
    totalProducts: 45,
    totalOrders: 128,
    totalFollowers: 342,
    rating: 4.5,
  };

  const mockProducts: Product[] = [
    {
      id: 1,
      name: "أمبيسيلين 250 مجم",
      category: "medicine",
      price: 15.5,
      stock: 25,
      images: ["https://via.placeholder.com/100"],
      isActive: true,
    },
    {
      id: 2,
      name: "سرنجة 5 مل",
      category: "equipment",
      price: 2.0,
      stock: 100,
      images: ["https://via.placeholder.com/100"],
      isActive: true,
    },
  ];

  const handleAddProduct = () => {
    router.push({ pathname: "/add-product" } as any);
  };

  const handleEditProduct = (productId: number) => {
    router.push({ pathname: "/edit-product", params: { id: productId.toString() } } as any);
  };

  const handleDeleteProduct = (productId: number) => {
    Alert.alert("حذف المنتج", "هل أنت متأكد من حذف هذا المنتج؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: () => console.log("Delete product", productId) },
    ]);
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Package size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{storeData.totalProducts}</Text>
          <Text style={styles.statLabel}>المنتجات</Text>
        </View>

        <View style={styles.statCard}>
          <BarChart3 size={24} color={COLORS.success} />
          <Text style={styles.statNumber}>{storeData.totalFollowers}</Text>
          <Text style={styles.statLabel}>المتابعين</Text>
        </View>
      </View>

      <View style={styles.subscriptionCard}>
        <Text style={styles.subscriptionTitle}>حالة الاشتراك</Text>
        <View style={styles.subscriptionStatus}>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.statusText}>نشط</Text>
          </View>
          <Text style={styles.subscriptionDate}>
            ينتهي في: {storeData.subscriptionEndDate.toLocaleDateString("ar")}
          </Text>
        </View>
        <Button
          title="تجديد الاشتراك"
          onPress={() => console.log("Renew subscription")}
          type="outline"
          size="small"
          style={styles.renewButton}
        />
      </View>
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{getCategoryName(item.category)}</Text>
        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>${item.price}</Text>
          <Text style={styles.productStock}>المخزون: {item.stock}</Text>
        </View>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
          onPress={() => handleEditProduct(item.id)}
        >
          <Edit size={16} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.error }]}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Trash2 size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProducts = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>المنتجات</Text>
        <Button
          title="إضافة منتج"
          onPress={handleAddProduct}
          type="primary"
          size="small"
          icon={<Plus size={16} color={COLORS.white} />}
        />
      </View>

      <FlatList
        data={mockProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
      />
    </View>
  );

  const renderOrders = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>الطلبات</Text>
      <View style={styles.emptyState}>
        <Package size={48} color={COLORS.darkGray} />
        <Text style={styles.emptyStateText}>لا توجد طلبات حالياً</Text>
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>الإعدادات</Text>

      <View style={styles.settingsSection}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            console.log("تعديل معلومات المذخر");
            // Add navigation to store info edit page
          }}
        >
          <Text style={styles.settingText}>تعديل معلومات المذخر</Text>
          <ArrowRight size={20} color={COLORS.darkGray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            console.log("إعدادات الدفع");
            // Add navigation to payment settings page
          }}
        >
          <Text style={styles.settingText}>إعدادات الدفع</Text>
          <ArrowRight size={20} color={COLORS.darkGray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            console.log("إعدادات التوصيل");
            // Add navigation to delivery settings page
          }}
        >
          <Text style={styles.settingText}>إعدادات التوصيل</Text>
          <ArrowRight size={20} color={COLORS.darkGray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            console.log("إعدادات الإشعارات");
            // Add navigation to notifications settings page
          }}
        >
          <Text style={styles.settingText}>إعدادات الإشعارات</Text>
          <ArrowRight size={20} color={COLORS.darkGray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            console.log("سياسة الخصوصية");
            // Add navigation to privacy policy page
          }}
        >
          <Text style={styles.settingText}>سياسة الخصوصية</Text>
          <ArrowRight size={20} color={COLORS.darkGray} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      medicine: "أدوية",
      equipment: "معدات",
      supplements: "مكملات",
      tools: "أدوات",
    };
    return categories[category] || category;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "products":
        return renderProducts();
      case "orders":
        return renderOrders();
      case "settings":
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: storeData.name,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowRight size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "overview" && styles.activeTab]}
            onPress={() => setActiveTab("overview")}
          >
            <BarChart3 size={20} color={activeTab === "overview" ? COLORS.primary : COLORS.darkGray} />
            <Text style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}>نظرة عامة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "products" && styles.activeTab]}
            onPress={() => setActiveTab("products")}
          >
            <Package size={20} color={activeTab === "products" ? COLORS.primary : COLORS.darkGray} />
            <Text style={[styles.tabText, activeTab === "products" && styles.activeTabText]}>المنتجات</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "orders" && styles.activeTab]}
            onPress={() => setActiveTab("orders")}
          >
            <Eye size={20} color={activeTab === "orders" ? COLORS.primary : COLORS.darkGray} />
            <Text style={[styles.tabText, activeTab === "orders" && styles.activeTabText]}>الطلبات</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "settings" && styles.activeTab]}
            onPress={() => setActiveTab("settings")}
          >
            <Settings size={20} color={activeTab === "settings" ? COLORS.primary : COLORS.darkGray} />
            <Text style={[styles.tabText, activeTab === "settings" && styles.activeTabText]}>الإعدادات</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderTabContent()}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  tabBar: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
    fontWeight: "500",
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
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
    marginTop: 4,
    textAlign: "center",
  },
  currencySymbol: {
    fontSize: 24,
    color: COLORS.success,
    fontWeight: "bold",
  },
  subscriptionCard: {
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
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "right",
  },
  subscriptionStatus: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  subscriptionDate: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  renewButton: {
    alignSelf: "flex-end",
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  productsList: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
    alignItems: "flex-end",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "right",
  },
  productCategory: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginLeft: 16,
  },
  productStock: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  productActions: {
    flexDirection: "row-reverse",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 16,
  },
  settingsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingText: {
    fontSize: 16,
    color: COLORS.black,
  },
});
