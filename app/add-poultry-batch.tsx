import { StyleSheet, Text, View, ScrollView, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";

import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from "../components/Button";
import { Package, Weight, Hash, DollarSign, Calendar } from 'lucide-react-native';

export default function AddPoultryBatchScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const { farmId } = useLocalSearchParams();
  
  const [batchData, setBatchData] = useState({
    individualWeight: '',
    quantity: '',
    price: '',
    batchDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setBatchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!batchData.individualWeight.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال وزن الفرد');
      return false;
    }
    if (!batchData.quantity.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال العدد');
      return false;
    }
    if (!batchData.price.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال السعر');
      return false;
    }
    
    const weight = parseFloat(batchData.individualWeight);
    const quantity = parseInt(batchData.quantity);
    const price = parseFloat(batchData.price);
    
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال وزن صحيح');
      return false;
    }
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال عدد صحيح');
      return false;
    }
    if (isNaN(price) || price <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال سعر صحيح');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Calculate totals
      const weight = parseFloat(batchData.individualWeight);
      const quantity = parseInt(batchData.quantity);
      const price = parseFloat(batchData.price);
      const totalWeight = weight * quantity;
      const totalValue = price * quantity;
      
      // In a real app, this would be sent to the backend
      console.log('Adding new poultry batch:', {
        farmId,
        ...batchData,
        individualWeight: weight,
        quantity,
        price,
        totalWeight,
        totalValue,
        createdAt: new Date().toISOString()
      });
      
      Alert.alert(
        'نجح',
        `تم إضافة الدفعة الجديدة بنجاح\n\nالتفاصيل:\n• العدد: ${quantity} طائر\n• الوزن الفردي: ${weight} كجم\n• الوزن الإجمالي: ${totalWeight} كجم\n• السعر الإجمالي: ${totalValue} ريال`,
        [
          {
            text: 'موافق',
            onPress: () => router.back()
          }
        ]
      );
      
    } catch (error) {
      console.error('Error adding batch:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة الدفعة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotals = () => {
    const weight = parseFloat(batchData.individualWeight) || 0;
    const quantity = parseInt(batchData.quantity) || 0;
    const price = parseFloat(batchData.price) || 0;
    
    return {
      totalWeight: weight * quantity,
      totalValue: price * quantity
    };
  };

  const { totalWeight, totalValue } = calculateTotals();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
            إضافة دفعة جديدة
          </Text>
          <Text style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            أدخل معلومات الدفعة الجديدة للمزرعة
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Individual Weight */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
              وزن الفرد (كجم) *
            </Text>
            <View style={[styles.inputContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Weight size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                placeholder="مثال: 2.5"
                value={batchData.individualWeight}
                onChangeText={(value) => handleInputChange('individualWeight', value)}
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
              العدد *
            </Text>
            <View style={[styles.inputContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Hash size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                placeholder="مثال: 1000"
                value={batchData.quantity}
                onChangeText={(value) => handleInputChange('quantity', value)}
                keyboardType="number-pad"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
          </View>

          {/* Price per unit */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
              السعر للفرد الواحد (ريال) *
            </Text>
            <View style={[styles.inputContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <DollarSign size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                placeholder="مثال: 25.50"
                value={batchData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
          </View>

          {/* Batch Date */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
              تاريخ الدفعة
            </Text>
            <View style={[styles.inputContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Calendar size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                placeholder="YYYY-MM-DD"
                value={batchData.batchDate}
                onChangeText={(value) => handleInputChange('batchDate', value)}
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
              ملاحظات
            </Text>
            <TextInput
              style={[styles.textArea, { textAlign: isRTL ? 'right' : 'left' }]}
              placeholder="أدخل أي ملاحظات إضافية..."
              value={batchData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              multiline
              numberOfLines={4}
              placeholderTextColor={COLORS.darkGray}
            />
          </View>
        </View>

        {/* Summary */}
        {(batchData.individualWeight && batchData.quantity && batchData.price) && (
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              ملخص الدفعة
            </Text>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                الوزن الإجمالي:
              </Text>
              <Text style={[styles.summaryValue, { color: COLORS.primary }]}>
                {totalWeight.toFixed(2)} كجم
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                القيمة الإجمالية:
              </Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                {totalValue.toFixed(2)} ريال
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <Button
          title="إضافة الدفعة"
          onPress={handleSubmit}
          type="primary"
          size="large"
          loading={isSubmitting}
          icon={<Package size={16} color={COLORS.white} />}
          style={styles.submitButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    minHeight: 100,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    width: '100%',
    marginBottom: 32,
  },
});