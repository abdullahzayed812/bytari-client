import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Bell, FileText, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { COLORS } from "../constants/colors";
import { createAllMockData } from "../mocks/approval-system";

export default function ApprovalSystemTestScreen() {
  const [isCreatingData, setIsCreatingData] = useState(false);

  const handleCreateMockData = async () => {
    setIsCreatingData(true);
    try {
      await createAllMockData();
      Alert.alert('نجح', 'تم إنشاء البيانات التجريبية بنجاح');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إنشاء البيانات التجريبية');
      console.error('Error creating mock data:', error);
    } finally {
      setIsCreatingData(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'اختبار نظام الموافقات',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>نظام الموافقات والإشعارات</Text>
          <Text style={styles.subtitle}>
            تم تنفيذ نظام شامل للموافقات والإشعارات الإدارية
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الميزات المنفذة</Text>
          
          <View style={styles.featureCard}>
            <CheckCircle size={24} color={COLORS.success} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>طلبات الموافقة</Text>
              <Text style={styles.featureDescription}>
                نظام لإدارة طلبات الموافقة على تسجيل الأطباء وتفعيل العيادات والمذاخر
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Bell size={24} color={COLORS.info} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>الإشعارات الإدارية</Text>
              <Text style={styles.featureDescription}>
                إشعارات فورية للمشرفين عند وصول طلبات موافقة جديدة
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <FileText size={24} color={COLORS.warning} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>مراجعة المستندات</Text>
              <Text style={styles.featureDescription}>
                عرض تفصيلي للمستندات والهويات والتراخيص المرفقة
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <AlertTriangle size={24} color={COLORS.error} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>إشعارات الرفض</Text>
              <Text style={styles.featureDescription}>
                إرسال إشعارات داخل التطبيق أو بالإيميل عند رفض الطلبات
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>آلية العمل</Text>
          
          <View style={styles.workflowStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              يقدم الطبيب أو صاحب العيادة/المذخر طلب موافقة مع المستندات المطلوبة
            </Text>
          </View>

          <View style={styles.workflowStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              يصل إشعار فوري للمشرفين المختصين في لوحة التحكم
            </Text>
          </View>

          <View style={styles.workflowStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              يراجع المشرف المستندات والهويات والتراخيص المرفقة
            </Text>
          </View>

          <View style={styles.workflowStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>
              في حالة الموافقة: يتم تفعيل الحساب/العيادة/المذخر تلقائياً
            </Text>
          </View>

          <View style={styles.workflowStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <Text style={styles.stepText}>
              في حالة الرفض: يتم إرسال إشعار بسبب الرفض (إيميل للأطباء، داخل التطبيق للعيادات/المذاخر)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اختبار النظام</Text>
          
          <TouchableOpacity
            style={[styles.testButton, isCreatingData && styles.disabledButton]}
            onPress={handleCreateMockData}
            disabled={isCreatingData}
          >
            <Text style={styles.testButtonText}>
              {isCreatingData ? 'جاري إنشاء البيانات...' : 'إنشاء بيانات تجريبية'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.testNote}>
            سيتم إنشاء طلبات موافقة وإشعارات تجريبية لاختبار النظام
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الصفحات المتاحة</Text>
          
          <View style={styles.pageLink}>
            <Text style={styles.pageLinkText}>• /admin-approvals - صفحة طلبات الموافقة</Text>
          </View>
          
          <View style={styles.pageLink}>
            <Text style={styles.pageLinkText}>• /admin-notifications - صفحة الإشعارات الإدارية</Text>
          </View>
          
          <View style={styles.pageLink}>
            <Text style={styles.pageLinkText}>• /admin-dashboard - لوحة تحكم الإدارة</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  workflowStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  testNote: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pageLink: {
    marginBottom: 8,
  },
  pageLinkText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: 'monospace',
  },
});