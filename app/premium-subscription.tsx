import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { ArrowLeft, ArrowRight, Award, Check } from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import Button from "../components/Button";

export default function PremiumSubscriptionScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');


  const subscriptionPlans = [
    {
      id: 'monthly',
      title: 'شهري',
      price: 5,
      period: 'شهر',
      savings: null,
    },
  ];

  const premiumFeatures = [
    'خصومات حصرية في المتجر تصل إلى 25%',
    'خصومات على الاستشارات البيطرية',
    'أولوية في الرد على الاستشارات',
    'إشعارات مخصصة للتذكير بالمواعيد',
    'تقارير صحية مفصلة للحيوانات الأليفة',
    'دعم فني مميز على مدار الساعة',
  ];



  const handleSubscribe = () => {
    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    console.log(`Subscribe to ${plan?.title} plan`);
    // TODO: Implement subscription logic
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'العضوية المميزة',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              {isRTL ? (
                <ArrowRight size={24} color={COLORS.black} />
              ) : (
                <ArrowLeft size={24} color={COLORS.black} />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Award size={48} color={COLORS.primary} />
          <Text style={styles.headerTitle}>العضوية المميزة</Text>
          <Text style={styles.headerDescription}>
            احصل على مزايا حصرية وخصومات مميزة
          </Text>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>المزايا المتاحة</Text>
          {premiumFeatures.map((feature, index) => (
            <View key={index} style={[styles.featureItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Check size={20} color={COLORS.success} />
              <Text style={[styles.featureText, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.plansCard}>
          <Text style={styles.sectionTitle}>اختر خطة الاشتراك</Text>
          {subscriptionPlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planItem, selectedPlan === plan.id && styles.selectedPlan]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <View style={[styles.planContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.planInfo, { flex: 1 }]}>
                  <View style={[styles.planHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.planTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {plan.title}
                    </Text>
                    {plan.savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>وفر {plan.savings}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.planPrice, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {plan.price} دولار / {plan.period}
                  </Text>
                </View>
                <View style={[styles.radioButton, selectedPlan === plan.id && styles.selectedRadio]}>
                  {selectedPlan === plan.id && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>



        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ملخص الاشتراك</Text>
          <View style={[styles.summaryRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.summaryLabel}>الخطة:</Text>
            <Text style={styles.summaryValue}>
              {subscriptionPlans.find(p => p.id === selectedPlan)?.title}
            </Text>
          </View>
          <View style={[styles.summaryRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.summaryLabel}>المبلغ:</Text>
            <Text style={styles.summaryValue}>
              {subscriptionPlans.find(p => p.id === selectedPlan)?.price} دولار
            </Text>
          </View>
        </View>

        <Button
          title="اشترك الآن"
          onPress={handleSubscribe}
          type="primary"
          size="large"
          style={styles.subscribeButton}
        />

        <Text style={styles.termsText}>
          بالضغط على &quot;اشترك الآن&quot; فإنك توافق على شروط الخدمة وسياسة الخصوصية
        </Text>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
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
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  featureItem: {
    alignItems: 'center',
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
  planItem: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedPlan: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F9FF',
  },
  planContent: {
    alignItems: 'center',
  },
  planInfo: {
    justifyContent: 'center',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  savingsBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  savingsText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 14,
    color: COLORS.darkGray,
  },

  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadio: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  summaryRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  subscribeButton: {
    marginBottom: 16,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
});