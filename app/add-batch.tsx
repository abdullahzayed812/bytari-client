import { StyleSheet, Text, View, ScrollView, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import Button from "../components/Button";
import { Calendar, Users, Package } from 'lucide-react-native';

export default function AddBatchScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const farmId = params.farmId as string;
  
  const [formData, setFormData] = useState({
    batchNumber: '',
    birdType: 'chicken',
    initialCount: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.batchNumber || !formData.initialCount) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'نجح الإضافة',
        'تم إضافة الدفعة الجديدة بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إضافة الدفعة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إضافة دفعة جديدة'
        }} 
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الدفعة *</Text>
            <View style={styles.inputContainer}>
              <Package size={20} color={COLORS.darkGray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                value={formData.batchNumber}
                onChangeText={(text) => setFormData(prev => ({ ...prev, batchNumber: text }))}
                placeholder="مثال: B-2024-003"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>العدد الأولي *</Text>
            <View style={styles.inputContainer}>
              <Users size={20} color={COLORS.darkGray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                value={formData.initialCount}
                onChangeText={(text) => setFormData(prev => ({ ...prev, initialCount: text }))}
                placeholder="عدد الطيور"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>تاريخ البداية</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color={COLORS.darkGray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                value={formData.startDate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, startDate: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ملاحظات</Text>
            <TextInput
              style={[styles.textArea, { textAlign: isRTL ? 'right' : 'left' }]}
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              placeholder="ملاحظات إضافية حول الدفعة"
              placeholderTextColor={COLORS.darkGray}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'جاري الإضافة...' : 'إضافة الدفعة'}
            onPress={handleSubmit}
            type="primary"
            size="large"
            disabled={loading}
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: COLORS.black,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 16,
  },
});