import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Gift, ShoppingBag, Stethoscope } from 'lucide-react-native';
import { Stack } from 'expo-router';
import Button from "../components/Button";

export default function PointsExchangeScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const exchangeOptions = [
    {
      id: 'store',
      title: 'منتجات المتجر',
      description: 'استبدل نقاطك بخصومات على منتجات المتجر',
      icon: ShoppingBag,
      color: '#10B981',
      offers: [
        { points: 50, discount: '10%', description: 'خصم 10% على أي منتج' },
        { points: 100, discount: '20%', description: 'خصم 20% على أي منتج' },
        { points: 200, discount: '35%', description: 'خصم 35% على أي منتج' },
      ]
    },
    {
      id: 'clinics',
      title: 'خصومات العيادات',
      description: 'احصل على خصومات في العيادات البيطرية',
      icon: Stethoscope,
      color: '#3B82F6',
      offers: [
        { points: 75, discount: '15%', description: 'خصم 15% على الاستشارة' },
        { points: 150, discount: '25%', description: 'خصم 25% على الاستشارة' },
        { points: 300, discount: '40%', description: 'خصم 40% على الاستشارة' },
      ]
    }
  ];

  const handleExchange = (optionId: string, points: number) => {
    console.log(`Exchange ${points} points for ${optionId}`);
    // TODO: Implement points exchange logic
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'استبدال النقاط',
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
        <View style={styles.pointsCard}>
          <Gift size={32} color={COLORS.primary} />
          <Text style={styles.pointsTitle}>نقاطك الحالية</Text>
          <Text style={styles.pointsValue}>125</Text>
        </View>

        <Text style={styles.sectionTitle}>اختر طريقة الاستبدال</Text>

        {exchangeOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedOption === option.id;
          
          return (
            <View key={option.id} style={styles.optionContainer}>
              <TouchableOpacity
                style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
                onPress={() => setSelectedOption(isSelected ? null : option.id)}
              >
                <View style={[styles.optionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                    <IconComponent size={24} color={COLORS.white} />
                  </View>
                  <View style={[styles.optionInfo, { marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0 }]}>
                    <Text style={[styles.optionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.optionDescription, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {option.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {isSelected && (
                <View style={styles.offersContainer}>
                  {option.offers.map((offer, index) => (
                    <View key={index} style={styles.offerCard}>
                      <View style={[styles.offerContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <View style={[styles.offerInfo, { flex: 1 }]}>
                          <Text style={[styles.offerDiscount, { textAlign: isRTL ? 'right' : 'left' }]}>
                            {offer.discount}
                          </Text>
                          <Text style={[styles.offerDescription, { textAlign: isRTL ? 'right' : 'left' }]}>
                            {offer.description}
                          </Text>
                          <Text style={[styles.offerPoints, { textAlign: isRTL ? 'right' : 'left' }]}>
                            {offer.points} نقطة
                          </Text>
                        </View>
                        <Button
                          title="استبدال"
                          onPress={() => handleExchange(option.id, offer.points)}
                          type="primary"
                          size="small"
                          style={styles.exchangeButton}
                          disabled={offer.points > 125} // Current points
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>معلومات مهمة</Text>
          <Text style={styles.infoText}>
            • النقاط المستبدلة لا يمكن استردادها{'\n'}
            • الخصومات صالحة لمدة 30 يوماً من تاريخ الاستبدال{'\n'}
            • يمكن استخدام خصم واحد فقط في كل عملية شراء{'\n'}
            • النقاط تنتهي صلاحيتها بعد سنة من تاريخ الحصول عليها
          </Text>
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
  pointsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsTitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 12,
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  optionContainer: {
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedOptionCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  optionHeader: {
    alignItems: 'center',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  offersContainer: {
    marginTop: 12,
    gap: 8,
  },
  offerCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  offerContent: {
    alignItems: 'center',
  },
  offerInfo: {
    justifyContent: 'center',
  },
  offerDiscount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  offerDescription: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 4,
  },
  offerPoints: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  exchangeButton: {
    minWidth: 80,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
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
    marginBottom: 12,
    textAlign: 'right',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    textAlign: 'right',
  },
});