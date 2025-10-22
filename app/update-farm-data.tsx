import { StyleSheet, Text, View, ScrollView, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from "../components/Button";
import { Stack } from 'expo-router';
import { ArrowRight, TrendingUp } from 'lucide-react-native';

export default function UpdateFarmDataScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const { farmId } = useLocalSearchParams();
  
  const [farmData, setFarmData] = useState({
    currentWeight: '',
    feedConsumption: '',
    mortality: '',
    mortalityReason: '',
    notes: ''
  });

  const handleSave = () => {
    if (!farmData.currentWeight || !farmData.feedConsumption) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    Alert.alert('تم الحفظ', 'تم تحديث بيانات المزرعة بنجاح', [
      { text: 'موافق', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'تحديث بيانات المزرعة',
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
          <Text style={styles.sectionTitle}>بيانات الأسبوع الحالي</Text>
          
          <Text style={styles.label}>الوزن الحالي (جرام) *</Text>
          <TextInput
            style={styles.input}
            value={farmData.currentWeight}
            onChangeText={(text) => setFarmData(prev => ({ ...prev, currentWeight: text }))}
            placeholder="أدخل الوزن الحالي"
            keyboardType="numeric"
            textAlign={isRTL ? 'right' : 'left'}
          />
          
          <Text style={styles.label}>استهلاك العلف (كيلو) *</Text>
          <TextInput
            style={styles.input}
            value={farmData.feedConsumption}
            onChangeText={(text) => setFarmData(prev => ({ ...prev, feedConsumption: text }))}
            placeholder="أدخل كمية العلف المستهلك"
            keyboardType="numeric"
            textAlign={isRTL ? 'right' : 'left'}
          />
          
          <Text style={styles.label}>عدد النفوق</Text>
          <TextInput
            style={styles.input}
            value={farmData.mortality}
            onChangeText={(text) => setFarmData(prev => ({ ...prev, mortality: text }))}
            placeholder="أدخل عدد الطيور النافقة"
            keyboardType="numeric"
            textAlign={isRTL ? 'right' : 'left'}
          />
          
          <Text style={styles.label}>سبب النفوق</Text>
          <TextInput
            style={styles.input}
            value={farmData.mortalityReason}
            onChangeText={(text) => setFarmData(prev => ({ ...prev, mortalityReason: text }))}
            placeholder="أدخل سبب النفوق (إن وجد)"
            textAlign={isRTL ? 'right' : 'left'}
          />
          
          <Text style={styles.label}>ملاحظات</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={farmData.notes}
            onChangeText={(text) => setFarmData(prev => ({ ...prev, notes: text }))}
            placeholder="أدخل ملاحظات إضافية"
            multiline
            numberOfLines={4}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
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
    height: 100,
    textAlignVertical: 'top',
  },
});