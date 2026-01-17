import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { ArrowLeft, ArrowRight, Check, Crown, Edit3, Eye, EyeOff } from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { useApp } from "../providers/AppProvider";

import { useMutation } from "@tanstack/react-query";

export default function ClinicSubscriptionScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const { isSuperAdmin } = useApp();
  const [selectedPlan] = useState<string>("monthly");
  const [isSubscriptionVisible, setIsSubscriptionVisible] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const updateActivationMutation = useMutation(trpc.clinics.updateActivation.mutationOptions());
  const renewActivationMutation = useMutation(trpc.clinics.renewActivation.mutationOptions());

  const subscriptionPlans = [
    {
      id: "monthly",
      title: "شهري",
      price: 6,
      period: "شهر",
      savings: null,
    },
  ];

  const premiumFeatures = [
    "بحث عبر ID لأي حيوان",
    "ظهور في قسم العيادات",
    "استقبال رسائل إدارية",
    "كروت صرف العلاج",
    "إضافة السجلات الطبية",
  ];

  const handleSubscribe = () => {
    const plan = subscriptionPlans.find((p) => p.id === selectedPlan);
    const clinicId = 1; // Mock clinic ID

    if (isSubscribed) {
      renewActivationMutation.mutate(
        { clinicId, months: 1 },
        {
          onSuccess: () => {
            Alert.alert("نجاح", "تم تجديد الاشتراك بنجاح");
          },
          onError: (error) => {
            Alert.alert("خطأ", error.message);
          },
        }
      );
    } else {
      updateActivationMutation.mutate(
        { clinicId, isActive: true },
        {
          onSuccess: () => {
            setIsSubscribed(true);
            Alert.alert("نجاح", "تم الاشتراك بنجاح");
          },
          onError: (error) => {
            Alert.alert("خطأ", error.message);
          },
        }
      );
    }
  };

  const toggleSubscriptionVisibility = () => {
    setIsSubscriptionVisible(!isSubscriptionVisible);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "خطة الاشتراك للعيادات",
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              {isRTL ? <ArrowRight size={24} color={COLORS.black} /> : <ArrowLeft size={24} color={COLORS.black} />}
            </TouchableOpacity>
          ),
          headerRight: () =>
            isSuperAdmin ? (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={toggleSubscriptionVisibility}
                  style={[
                    styles.headerButton,
                    isSubscriptionVisible ? styles.visibilityButtonVisible : styles.visibilityButtonHidden,
                  ]}
                >
                  {isSubscriptionVisible ? (
                    <Eye size={20} color={COLORS.white} />
                  ) : (
                    <EyeOff size={20} color={COLORS.white} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    // TODO: Navigate to edit subscription plan
                    console.log("Edit subscription plan");
                  }}
                  style={[styles.headerButton, styles.editButton]}
                >
                  <Edit3 size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : null,
        }}
      />

      {/* Admin Notice */}
      {isSuperAdmin && (
        <View style={styles.adminNotice}>
          <Text style={styles.adminNoticeText}>الخطة {isSubscriptionVisible ? "مرئية" : "مخفية"} للمستخدمين</Text>
        </View>
      )}

      {/* Show content only if visible or if admin */}
      {isSubscriptionVisible || isSuperAdmin ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <Crown size={48} color={COLORS.primary} />
            <Text style={styles.headerTitle}>خطة الاشتراك للعيادات</Text>
            <Text style={styles.headerDescription}>احصل على مزايا حصرية لعيادتك البيطرية</Text>
          </View>

          <View style={styles.featuresCard}>
            <Text style={styles.sectionTitle}>المزايا المتاحة</Text>
            {premiumFeatures.map((feature, index) => (
              <View key={index} style={[styles.featureItem, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <Check size={20} color={COLORS.success} />
                <Text style={[styles.featureText, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.plansCard}>
            <Text style={styles.sectionTitle}>💡 خطة الاشتراك للعيادات:</Text>

            <View style={[styles.planDetailCard, styles.premiumPlanDetail]}>
              <View style={styles.premiumHeader}>
                <Crown size={24} color={COLORS.primary} />
                <Text style={styles.planDetailTitle}>عيادة Premium</Text>
              </View>

              <View style={styles.planFeatures}>
                {premiumFeatures.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Check size={16} color={COLORS.success} />
                    <Text style={styles.planFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.planPrice}>6 دولار/شهر</Text>

              {!isSuperAdmin && (
                <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
                  <Text style={styles.subscribeButtonText}>اشترك الآن</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {!isSuperAdmin && (
            <Text style={styles.termsText}>
              بالضغط على &quot;اشترك الآن&quot; فإنك توافق على شروط الخدمة وسياسة الخصوصية
            </Text>
          )}
        </ScrollView>
      ) : (
        <View style={styles.hiddenContent}>
          <Text style={styles.hiddenContentText}>خطة الاشتراك غير متاحة حالياً</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  visibilityButtonVisible: {
    backgroundColor: COLORS.success,
  },
  visibilityButtonHidden: {
    backgroundColor: COLORS.warning,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  adminNotice: {
    backgroundColor: COLORS.primary,
    padding: 12,
    alignItems: "center",
  },
  adminNoticeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  headerDescription: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  featuresCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    textAlign: "left",
  },
  featureItem: {
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.darkGray,
    flex: 1,
  },
  plansCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planDetailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumPlanDetail: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  premiumHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  planDetailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
  },
  planFeatures: {
    marginVertical: 16,
  },
  featureRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    justifyContent: "flex-end",
  },
  planFeatureText: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: "left",
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginVertical: 16,
  },
  subscribeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  subscribeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  hiddenContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  hiddenContentText: {
    fontSize: 18,
    color: COLORS.darkGray,
    textAlign: "center",
  },
});
