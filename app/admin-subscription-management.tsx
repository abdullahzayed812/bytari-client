import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, ArrowRight, Crown, Eye, EyeOff } from 'lucide-react-native';
import Button from "../components/Button";
import { trpc } from "../lib/trpc";

export default function AdminSubscriptionManagementScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get subscription settings
  const subscriptionSettingsQuery = trpc.admin.subscriptions.getSettings.useQuery({
    adminId: 1
  });

  // Update subscription settings mutation
  const updateSubscriptionMutation = trpc.admin.subscriptions.updateSettings.useMutation({
    onSuccess: () => {
      Alert.alert(
        'تم التحديث',
        'تم تحديث إعدادات الاشتراك المميز بنجاح',
        [{ text: 'موافق' }]
      );
      subscriptionSettingsQuery.refetch();
    },
    onError: (error) => {
      console.error('Error updating subscription settings:', error);
      Alert.alert(
        'خطأ',
        'حدث خطأ أثناء تحديث إعدادات الاشتراك المميز',
        [{ text: 'موافق' }]
      );
    },
  });

  const handleToggleSubscription = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      await updateSubscriptionMutation.mutateAsync({
        adminId: 1,
        isEnabled: enabled
      });
    } catch (error) {
      console.error('Error toggling subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isEnabled = subscriptionSettingsQuery.data?.isEnabled ?? false;
  const lastUpdated = subscriptionSettingsQuery.data?.lastUpdated;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إدارة الاشتراك المميز',
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
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Crown size={48} color={COLORS.primary} />
          <Text style={styles.headerTitle}>إدارة الاشتراك المميز</Text>
          <Text style={styles.headerDescription}>
            تحكم في إظهار وإخفاء ميزة الاشتراك المميز في التطبيق
          </Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.statusIcon}>
              {isEnabled ? (
                <Eye size={24} color={COLORS.success} />
              ) : (
                <EyeOff size={24} color={COLORS.error} />
              )}
            </View>
            <View style={[styles.statusInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={styles.statusTitle}>
                {isEnabled ? 'الاشتراك المميز مفعل' : 'الاشتراك المميز معطل'}
              </Text>
              <Text style={styles.statusDescription}>
                {isEnabled 
                  ? 'المستخدمون يمكنهم رؤية والاشتراك في العضوية المميزة'
                  : 'ميزة الاشتراك المميز مخفية عن المستخدمين'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Control Card */}
        <View style={styles.controlCard}>
          <Text style={styles.sectionTitle}>التحكم في الاشتراك المميز</Text>
          
          <View style={[styles.controlItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.controlInfo, { flex: 1 }]}>
              <Text style={[styles.controlLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                تفعيل الاشتراك المميز
              </Text>
              <Text style={[styles.controlDescription, { textAlign: isRTL ? 'right' : 'left' }]}>
                عند التفعيل، سيتمكن المستخدمون من رؤية صفحة الاشتراك المميز والتقدم للحصول على العضوية
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggleSubscription}
              disabled={isLoading || updateSubscriptionMutation.isPending}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={isEnabled ? COLORS.white : COLORS.gray}
            />
          </View>

          {lastUpdated && (
            <View style={styles.lastUpdatedContainer}>
              <Text style={styles.lastUpdatedText}>
                آخر تحديث: {new Date(lastUpdated).toLocaleDateString('ar-SA')} في {new Date(lastUpdated).toLocaleTimeString('ar-SA')}
              </Text>
            </View>
          )}
        </View>

        {/* Features Card */}
        <View style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>مزايا الاشتراك المميز</Text>
          <Text style={styles.featuresDescription}>
            عند تفعيل الاشتراك المميز، سيحصل المستخدمون على المزايا التالية:
          </Text>
          
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• خصومات حصرية في المتجر تصل إلى 25%</Text>
            <Text style={styles.featureItem}>• خصومات على الاستشارات البيطرية</Text>
            <Text style={styles.featureItem}>• أولوية في الرد على الاستشارات</Text>
            <Text style={styles.featureItem}>• إشعارات مخصصة للتذكير بالمواعيد</Text>
            <Text style={styles.featureItem}>• تقارير صحية مفصلة للحيوانات الأليفة</Text>
            <Text style={styles.featureItem}>• دعم فني مميز على مدار الساعة</Text>
          </View>
        </View>

        {/* Instructions Card */}
        <View style={styles.instructionsCard}>
          <Text style={styles.sectionTitle}>تعليمات الاستخدام</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>
              1. استخدم المفتاح أعلاه لتفعيل أو إلغاء تفعيل ميزة الاشتراك المميز
            </Text>
            <Text style={styles.instructionItem}>
              2. عند التفعيل، ستظهر العضوية المميزة في قائمة الملف الشخصي للمستخدمين
            </Text>
            <Text style={styles.instructionItem}>
              3. عند الإلغاء، ستختفي الميزة تماماً من التطبيق
            </Text>
            <Text style={styles.instructionItem}>
              4. يمكن للمستخدمين تقديم طلبات الاشتراك التي ستظهر في قسم الموافقات
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="عرض طلبات الاشتراك"
            onPress={() => router.push('/admin-approvals')}
            type="secondary"
            size="large"
            style={styles.actionButton}
          />
          
          <Button
            title="إعدادات النظام"
            onPress={() => router.push('/admin-dashboard')}
            type="primary"
            size="large"
            style={styles.actionButton}
          />
        </View>
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
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  statusCard: {
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
  statusHeader: {
    alignItems: 'center',
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginLeft: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  controlCard: {
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
  controlItem: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  controlInfo: {
    marginRight: 16,
    marginLeft: 16,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  controlDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  lastUpdatedContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  lastUpdatedText: {
    fontSize: 12,
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
  featuresDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
    textAlign: 'right',
    lineHeight: 20,
  },
  featuresList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
    lineHeight: 20,
  },
  instructionsCard: {
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
  instructionsList: {
    marginTop: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
    lineHeight: 22,
  },
  actionButtons: {
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
});