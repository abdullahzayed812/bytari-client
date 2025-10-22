import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter } from 'expo-router';
import { ArrowRight, Save, MapPin, Phone, Clock, Building2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddHospitalScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    workingHours: '',
    description: '',
    specialties: '',
    province: ''
  });

  const handleSave = () => {
    if (!formData.name || !formData.location || !formData.phone) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    Alert.alert(
      'تأكيد الحفظ',
      'هل أنت متأكد من إضافة هذا المستشفى؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حفظ',
          onPress: () => {
            Alert.alert('تم', 'تم إضافة المستشفى بنجاح');
            router.back();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إضافة مستشفى جديد</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Save size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم المستشفى *</Text>
            <View style={styles.inputContainer}>
              <Building2 size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="أدخل اسم المستشفى"
                placeholderTextColor={COLORS.lightGray}
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الموقع *</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                placeholder="أدخل موقع المستشفى"
                placeholderTextColor={COLORS.lightGray}
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>المحافظة</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.input}
                value={formData.province}
                onChangeText={(text) => setFormData(prev => ({ ...prev, province: text }))}
                placeholder="أدخل اسم المحافظة"
                placeholderTextColor={COLORS.lightGray}
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الهاتف *</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="أدخل رقم الهاتف"
                placeholderTextColor={COLORS.lightGray}
                textAlign="right"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ساعات العمل</Text>
            <View style={styles.inputContainer}>
              <Clock size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.input}
                value={formData.workingHours}
                onChangeText={(text) => setFormData(prev => ({ ...prev, workingHours: text }))}
                placeholder="مثال: 8:00 ص - 8:00 م"
                placeholderTextColor={COLORS.lightGray}
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>التخصصات</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.specialties}
              onChangeText={(text) => setFormData(prev => ({ ...prev, specialties: text }))}
              placeholder="أدخل التخصصات مفصولة بفاصلة (مثال: جراحة، طب داخلي، أشعة)"
              placeholderTextColor={COLORS.lightGray}
              textAlign="right"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="أدخل وصف المستشفى"
              placeholderTextColor={COLORS.lightGray}
              textAlign="right"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'right',
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});