import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useMemo, useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import Button from "../components/Button";
import { ArrowRight, MapPin, Phone, Clock, Star, Mail, Bell, BellOff, MessageSquare } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { VetStoreProduct } from "../mocks/data"; // Assuming this is still valid for products
import RatingComponent from "../components/RatingComponent";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

// Define TypeScript interface for store data based on schema
interface Store {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  bannerImage: string | null;
  rating: number;
  isActive: boolean;
  // Add workingHours and reviewCount if added to schema later
}

export default function StoreDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);

  // Fetch store data
  const { data, isLoading, error } = useQuery(trpc.stores.getById.queryOptions({ storeId: Number(id) }));
  const storeData = useMemo(() => (data as any)?.store as Store | undefined, [data]);

  // Fetch store products
  const { data: rawStoreProducts, isLoading: isStoreProductsLoading } = useQuery(
    trpc.stores.products.list.queryOptions({ storeId: Number(id) })
  );
  console.log({ rawStoreProducts });
  const storeProducts = useMemo(
    () => (rawStoreProducts as any)?.products as VetStoreProduct[] | undefined,
    [rawStoreProducts]
  );
  const featuredProducts = storeProducts?.slice(0, 3);

  // Handlers
  const handleCall = () => {
    if (storeData?.phone) {
      Linking.openURL(`tel:${storeData.phone}`);
    } else {
      Alert.alert("خطأ", "رقم الهاتف غير متوفر");
    }
  };

  const handleEmail = () => {
    if (storeData?.email) {
      Linking.openURL(`mailto:${storeData.email}`);
    } else {
      Alert.alert("خطأ", "البريد الإلكتروني غير متوفر");
    }
  };

  const handleGetDirections = () => {
    if (storeData?.address) {
      router.push({
        pathname: "/map-location",
        params: {
          mode: "directions",
          name: storeData.name,
          address: storeData.address,
          latitude: "24.7136", // Mock coordinates
          longitude: "46.6753",
        },
      });
    } else {
      Alert.alert("خطأ", "العنوان غير متوفر");
    }
  };

  const handleFollowStore = () => {
    if (!storeData) return;
    if (isFollowing) {
      Alert.alert("إلغاء المتابعة", "هل تريد إلغاء متابعة هذا المتجر؟ لن تصلك إشعارات عند إضافة منتجات جديدة.", [
        { text: "إلغاء", style: "cancel" },
        {
          text: "نعم",
          style: "destructive",
          onPress: () => {
            setIsFollowing(false);
            console.log("Unfollowed store:", storeData.name);
          },
        },
      ]);
    } else {
      setIsFollowing(true);
      console.log("Following store:", storeData.name);
      Alert.alert("تم المتابعة بنجاح", `سيتم إرسال إشعارات لك عند إضافة منتجات جديدة في ${storeData.name}`);
    }
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    const message = !notificationsEnabled
      ? "تم تفعيل الإشعارات للمنتجات الجديدة"
      : "تم إيقاف الإشعارات للمنتجات الجديدة";
    Alert.alert("إعدادات الإشعارات", message);
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (storeData) {
      console.log("Rating submitted:", { rating, comment, storeId: storeData.id });
      // TODO: Implement API call to submit rating
    }
  };

  // Handle loading and error states
  if (isLoading || isStoreProductsLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} />;
  }

  if (error || !storeData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>خطأ في جلب بيانات المتجر. حاول مرة أخرى.</Text>
      </View>
    );
  }

  const renderProductCard = (product: VetStoreProduct) => (
    <View key={product.id} style={styles.productCard}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        <Text style={styles.productPrice}>{product.price} ر.س</Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: storeData.name,
        }}
      />

      <ScrollView style={styles.container}>
        <Image
          source={{ uri: storeData.bannerImage || "https://via.placeholder.com/200" }} // Fallback image
          style={styles.storeImage}
        />

        <View style={styles.content}>
          <View style={styles.storeHeader}>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{storeData.name}</Text>
              <View style={styles.ratingContainer}>
                <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.rating}>{storeData.rating.toFixed(1)}</Text>
                {/* Removed reviewCount as it's not in schema */}
                {/* <Text style={styles.reviewCount}>({storeData.reviewCount} تقييم)</Text> */}
              </View>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: storeData.isActive ? COLORS.success : COLORS.error }]}>
              <Text style={styles.statusText}>{storeData.isActive ? "نشط" : "غير نشط"}</Text>
            </View>
          </View>

          {storeData.description && <Text style={styles.description}>{storeData.description}</Text>}

          <View style={styles.detailsSection}>
            {storeData.address && (
              <View style={styles.detailItem}>
                <MapPin size={20} color={COLORS.darkGray} />
                <Text style={styles.detailText}>{storeData.address}</Text>
              </View>
            )}

            {storeData.phone && (
              <TouchableOpacity style={styles.detailItem} onPress={handleCall}>
                <Phone size={20} color={COLORS.primary} />
                <Text style={[styles.detailText, { color: COLORS.primary }]}>{storeData.phone}</Text>
              </TouchableOpacity>
            )}

            {storeData.email && (
              <TouchableOpacity style={styles.detailItem} onPress={handleEmail}>
                <Mail size={20} color={COLORS.primary} />
                <Text style={[styles.detailText, { color: COLORS.primary }]}>{storeData.email}</Text>
              </TouchableOpacity>
            )}

            {/* Commented out working hours as it's not in schema */}
            {/* <View style={styles.detailItem}>
              <Clock size={20} color={COLORS.darkGray} />
              <Text style={styles.detailText}>
                {storeData.workingHours.days}: {storeData.workingHours.open} - {storeData.workingHours.close}
              </Text>
            </View> */}
          </View>

          <View style={styles.actionsSection}>
            <Button title="الاتصال" onPress={handleCall} type="primary" style={styles.actionButton} />
            <Button title="الاتجاهات" onPress={handleGetDirections} type="outline" style={styles.actionButton} />
          </View>

          <View style={styles.followSection}>
            <Button
              title={isFollowing ? "إلغاء المتابعة" : "متابعة المتجر"}
              onPress={handleFollowStore}
              type={isFollowing ? "outline" : "primary"}
              style={[styles.followButton, isFollowing && styles.unfollowButton]}
              icon={
                isFollowing ? (
                  <BellOff size={20} color={isFollowing ? COLORS.error : COLORS.white} />
                ) : (
                  <Bell size={20} color={COLORS.white} />
                )
              }
            />

            {isFollowing && (
              <TouchableOpacity style={styles.notificationToggle} onPress={handleToggleNotifications}>
                <View style={styles.notificationRow}>
                  {notificationsEnabled ? (
                    <Bell size={20} color={COLORS.primary} />
                  ) : (
                    <BellOff size={20} color={COLORS.darkGray} />
                  )}
                  <Text style={[styles.notificationText, !notificationsEnabled && styles.disabledText]}>
                    {notificationsEnabled ? "الإشعارات مفعلة" : "الإشعارات معطلة"}
                  </Text>
                </View>
                <Text style={styles.notificationSubtext}>
                  {notificationsEnabled ? "ستصلك إشعارات عند إضافة منتجات جديدة" : "اضغط لتفعيل الإشعارات"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {featuredProducts && featuredProducts.length > 0 && (
            <View style={styles.productsSection}>
              <Text style={styles.sectionTitle}>المنتجات المميزة</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.productsScroll}
                contentContainerStyle={styles.productsContainer}
              >
                {featuredProducts.map(renderProductCard)}
              </ScrollView>

              <Button
                title="عرض جميع المنتجات"
                onPress={() => router.push(`/store-products?storeId=${storeData.id}`)}
                type="outline"
                style={styles.viewAllButton}
              />
            </View>
          )}

          <TouchableOpacity style={styles.ratingButton} onPress={() => setShowRatingModal(true)}>
            <MessageSquare size={20} color={COLORS.primary} />
            <Text style={styles.ratingButtonText}>قيم المتجر</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <RatingComponent
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        title="تقييم المتجر"
        entityName={storeData.name}
      />
    </>
  );
}

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
    marginTop: 20,
  },
  storeImage: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    padding: 16,
  },
  storeHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  storeInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  storeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  ratingContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 24,
    textAlign: "right",
    marginBottom: 20,
  },
  detailsSection: {
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
  detailItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.black,
    marginRight: 12,
    flex: 1,
    textAlign: "right",
  },
  actionsSection: {
    flexDirection: "row-reverse",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  productsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
  },
  productsScroll: {
    marginBottom: 16,
  },
  productsContainer: {
    paddingRight: 16,
  },
  productCard: {
    width: 120,
    marginLeft: 12,
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    marginBottom: 8,
  },
  productInfo: {
    alignItems: "center",
  },
  productName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  viewAllButton: {
    alignSelf: "center",
  },
  followSection: {
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
  followButton: {
    marginBottom: 12,
  },
  unfollowButton: {
    borderColor: COLORS.error,
  },
  notificationToggle: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  notificationRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginRight: 8,
    textAlign: "right",
  },
  disabledText: {
    color: COLORS.darkGray,
  },
  notificationSubtext: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
    lineHeight: 16,
  },
  ratingButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
