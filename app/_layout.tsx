import "../lib/rtl-init"; // Initialize RTL immediately
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { I18nProvider } from "../providers/I18nProvider";
import { AppProvider } from "../providers/AppProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { QueryClientProvider } from "@tanstack/react-query";
import { configureRTL } from "../lib/rtl-config";
import { handleBackNavigation } from "../lib/navigation-utils";
import { queryClient } from "@/lib/trpc";
import { CartProvider } from "@/providers/CartProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { FavoritesProvider } from "@/providers/FavoritesProvider";
import { OrdersProvider } from "@/providers/OrdersProvider";
import { ToastProvider } from "@/providers/ToastProvider";

function BackButton() {
  return (
    <TouchableOpacity onPress={() => handleBackNavigation()} style={styles.backButton}>
      <ArrowLeft size={24} color={COLORS.black} />
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  // Ensure RTL is configured
  useEffect(() => {
    configureRTL();
  }, []);

  const defaultScreenOptions = {
    headerShown: true,
    headerStyle: {
      backgroundColor: COLORS.white,
    },
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: "bold" as const,
      color: COLORS.black,
    },
    headerTitleAlign: "center" as const,
    headerLeft: () => <BackButton />,
    headerRight: () => null,
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <NotificationProvider>
            <FavoritesProvider>
              <OrdersProvider>
                <CartProvider>
                  <I18nProvider>
                    <ToastProvider>
                      <Stack screenOptions={defaultScreenOptions}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="(vet-tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
                        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                        <Stack.Screen name="auth" options={{ headerShown: false }} />
                        <Stack.Screen name="splash" options={{ headerShown: false }} />
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="pet-details" options={{ title: "تفاصيل الحيوان" }} />
                        <Stack.Screen name="lost-pet" options={{ title: "حيوان مفقود" }} />
                        <Stack.Screen name="report-lost-pet" options={{ title: "الإبلاغ عن حيوان مفقود" }} />
                        <Stack.Screen name="add-pet" options={{ title: "إضافة حيوان" }} />
                        <Stack.Screen name="notifications" options={{ title: "الإشعارات" }} />
                        <Stack.Screen name="messages" options={{ title: "الرسائل" }} />
                        <Stack.Screen name="search" options={{ title: "البحث" }} />
                        <Stack.Screen name="clinic-profile" options={{ title: "ملف العيادة" }} />
                        <Stack.Screen name="cart" options={{ title: "السلة" }} />
                        <Stack.Screen name="checkout" options={{ title: "الدفع" }} />
                        <Stack.Screen name="favorites" options={{ title: "المفضلة" }} />
                        <Stack.Screen name="map-location" options={{ title: "الموقع" }} />
                        <Stack.Screen name="orders" options={{ title: "الطلبات" }} />
                        <Stack.Screen name="tips-list" options={{ title: "النصائح" }} />
                        <Stack.Screen name="clinics-list" options={{ title: "العيادات" }} />
                        <Stack.Screen name="lost-pets-list" options={{ title: "الحيوانات المفقودة" }} />
                        <Stack.Screen name="points-history" options={{ title: "تاريخ النقاط" }} />
                        <Stack.Screen name="points-exchange" options={{ title: "استبدال النقاط" }} />
                        <Stack.Screen name="premium-subscription" options={{ title: "الاشتراك المميز" }} />
                        <Stack.Screen name="reminders" options={{ title: "التذكيرات" }} />
                        <Stack.Screen name="appointments" options={{ title: "المواعيد" }} />
                        <Stack.Screen name="contact-us" options={{ title: "اتصل بنا" }} />
                        <Stack.Screen name="consultation" options={{ title: "الاستشارة" }} />
                        <Stack.Screen name="sections" options={{ title: "الأقسام" }} />
                        <Stack.Screen name="clinic-system" options={{ title: "نظام العيادة" }} />
                        <Stack.Screen name="consultation-list" options={{ title: "قائمة الاستشارات" }} />
                        <Stack.Screen name="settings" options={{ title: "الإعدادات" }} />
                        <Stack.Screen name="vet-inquiries" options={{ title: "استفسارات الطبيب" }} />
                        <Stack.Screen name="vet-magazine" options={{ title: "مجلة الطبيب" }} />
                        <Stack.Screen name="vet-books" options={{ title: "كتب الطب البيطري" }} />
                        <Stack.Screen name="vet-union" options={{ title: "نقابة الأطباء البيطريين" }} />
                        <Stack.Screen name="vet-offices" options={{ title: "مكاتب الطب البيطري" }} />
                        <Stack.Screen name="privacy" options={{ title: "سياسة الخصوصية" }} />
                        <Stack.Screen name="language" options={{ title: "اللغة" }} />
                        <Stack.Screen name="account-settings" options={{ title: "إعدادات الحساب" }} />
                        <Stack.Screen name="help" options={{ title: "المساعدة" }} />
                        <Stack.Screen name="about" options={{ title: "حول التطبيق" }} />
                        <Stack.Screen name="job-vacancies" options={{ title: "الوظائف الشاغرة" }} />
                        <Stack.Screen name="lessons-lectures" options={{ title: "الدروس والمحاضرات" }} />
                        <Stack.Screen name="courses-seminars" options={{ title: "الدورات والندوات" }} />
                        <Stack.Screen name="new-inquiry" options={{ title: "استفسار جديد" }} />
                        <Stack.Screen name="admin-login" options={{ title: "دخول الإدارة" }} />
                        <Stack.Screen name="admin-dashboard" options={{ title: "لوحة تحكم الإدارة" }} />
                        <Stack.Screen name="database-example" options={{ title: "مثال قاعدة البيانات" }} />
                        <Stack.Screen name="database-admin" options={{ title: "إدارة قاعدة البيانات" }} />
                        <Stack.Screen name="admin-content-manager" options={{ title: "إدارة المحتوى" }} />
                        <Stack.Screen name="ad-details" options={{ title: "تفاصيل الإعلان" }} />
                        <Stack.Screen name="hospitals-settings" options={{ headerShown: false }} />
                        <Stack.Screen name="hospitals-analytics" options={{ headerShown: false }} />
                        <Stack.Screen name="hospitals-general-settings" options={{ headerShown: false }} />
                        <Stack.Screen name="hospitals-notifications-settings" options={{ headerShown: false }} />
                        <Stack.Screen name="hospitals-users-management" options={{ headerShown: false }} />
                        <Stack.Screen name="edit-hospital" options={{ headerShown: false }} />
                        <Stack.Screen name="hospitals-management-dashboard" options={{ headerShown: false }} />
                        <Stack.Screen name="clinic-dashboard" options={{ headerShown: false }} />
                        <Stack.Screen name="vet-field-management" options={{ headerShown: false }} />
                      </Stack>
                    </ToastProvider>
                  </I18nProvider>
                </CartProvider>
              </OrdersProvider>
            </FavoritesProvider>
          </NotificationProvider>
        </AppProvider>
      </QueryClientProvider>
      {/* </trpc.Provider> */}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
});
