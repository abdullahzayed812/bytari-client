import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Plus, Minus } from 'lucide-react-native';
import { Stack } from 'expo-router';

const mockPointsHistory = [
  
  {
    id: '2',
    type: 'spent',
    amount: -25,
    description: 'خصم على منتج من المتجر',
    date: '2024-07-18T00:00:00.000Z',
  },
  {
    id: '3',
    type: 'earned',
    amount: 10,
    description: 'إضافة حيوان أليف جديد',
    date: '2024-07-15T00:00:00.000Z',
  },
  {
    id: '4',
    type: 'earned',
    amount: 20,
    description: 'تقييم العيادة',
    date: '2024-07-10T00:00:00.000Z',
  },

];

export default function PointsHistoryScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'سجل النقاط',
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
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>إجمالي النقاط</Text>
          <Text style={styles.summaryValue}>125</Text>
          <Text style={styles.summaryDescription}>
            يمكنك استخدام النقاط للحصول على خصومات في المتجر والعيادات
          </Text>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>تاريخ النقاط</Text>
          {mockPointsHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={[styles.historyItemContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.iconContainer, item.type === 'earned' ? styles.earnedIcon : styles.spentIcon]}>
                  {item.type === 'earned' ? (
                    <Plus size={16} color={COLORS.white} />
                  ) : (
                    <Minus size={16} color={COLORS.white} />
                  )}
                </View>
                
                <View style={[styles.historyDetails, { flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                  <Text style={[styles.historyDescription, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {item.description}
                  </Text>
                  <Text style={[styles.historyDate, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {new Date(item.date).toLocaleDateString('ar-SA')}
                  </Text>
                </View>
                
                <Text style={[styles.historyAmount, item.type === 'earned' ? styles.earnedAmount : styles.spentAmount]}>
                  {item.amount > 0 ? '+' : ''}{item.amount}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>كيفية كسب النقاط</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• إضافة حيوان أليف جديد: 15 نقطة</Text>
            <Text style={styles.infoItem}>• تقييم العيادة: 10 نقطة</Text>
            <Text style={styles.infoItem}>• مشاركة التطبيق: 30 نقطة</Text>
            <Text style={styles.infoItem}>• إكمال الملف الشخصي: 15 نقطة</Text>
          </View>
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
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  summaryDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  historySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  historyItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyItemContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnedIcon: {
    backgroundColor: COLORS.success,
  },
  spentIcon: {
    backgroundColor: COLORS.error,
  },
  historyDetails: {
    justifyContent: 'center',
  },
  historyDescription: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  historyAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  earnedAmount: {
    color: COLORS.success,
  },
  spentAmount: {
    color: COLORS.error,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    lineHeight: 20,
  },
});