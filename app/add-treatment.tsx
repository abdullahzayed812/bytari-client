import { StyleSheet, Text, View, ScrollView, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from "../components/Button";
import { Stack } from 'expo-router';
import { ArrowRight, FileText } from 'lucide-react-native';

export default function AddTreatmentScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const { farmId } = useLocalSearchParams();
  
  const [treatmentData, setTreatmentData] = useState({
    name: '',
    type: 'medication',
    dosage: '',
    duration: '',
    reason: '',
    cost: '',
    notes: ''
  });

  const handleSave = () => {
    if (!treatmentData.name || !treatmentData.dosage || !treatmentData.reason) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    Alert.alert('تم الحفظ', 'تم إضافة العلاج بنجاح', [
      { text: 'موافق', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'إضافة علاج',
          headerRight: () => (
            <Button
              title="حفظ"
              onPress={handleSave}
              type="primary"
              size="small"
            />
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>اسم العلاج *</Text>
          <TextInput
            style={styles.input}
            value={treatmentData.name}
            onChangeText={(text) => setTreatmentData(prev => ({ ...prev, name: text }))}
            placeholder="أدخل اسم العلاج"
            textAlign={isRTL ? 'right' : 'left'}
          />
          
          <Text style={styles.label}>الجرعة *</Text>
          <TextInput
            style={styles.input}
            value={treatmentData.dosage}
            onChangeText={(text) => setTreatmentData(prev => ({ ...prev, dosage: text }))}
            placeholder="أدخل الجرعة"
            textAlign={isRTL ? 'right' : 'left'}
          />
          
          <Text style={styles.label}>المدة (بالأيام)</Text>
          <TextInput
            style={styles.input}
            value={treatmentData.duration}
            onChangeText={(text) => setTreatmentData(prev => ({ ...prev, duration: text }))}
            placeholder="أدخل المدة"
            keyboardType="numeric"
            textAlign={isRTL ? 'right' : 'left'}
          />
          
          <Text style={styles.label}>السبب *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={treatmentData.reason}
            onChangeText={(text) => setTreatmentData(prev => ({ ...prev, reason: text }))}
            placeholder="أدخل سبب العلاج"
            multiline
            numberOfLines={3}
            textAlign={isRTL ? 'right' : 'left'}
          />
          
          <Text style={styles.label}>التكلفة</Text>
          <TextInput
            style={styles.input}
            value={treatmentData.cost}
            onChangeText={(text) => setTreatmentData(prev => ({ ...prev, cost: text }))}
            placeholder="أدخل التكلفة"
            keyboardType="numeric"
            textAlign={isRTL ? 'right' : 'left'}
          />
          
          <Text style={styles.label}>ملاحظات</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={treatmentData.notes}
            onChangeText={(text) => setTreatmentData(prev => ({ ...prev, notes: text }))}
            placeholder="أدخل ملاحظات إضافية"
            multiline
            numberOfLines={3}
            textAlign={isRTL ? 'right' : 'left'}
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
    padding: 16,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});