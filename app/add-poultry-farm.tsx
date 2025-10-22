import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import Button from "../components/Button";
import { ArrowLeft, MapPin, Home, FileText, Users, Square } from 'lucide-react-native';

export default function AddPoultryFarmScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    description: '',
    totalArea: '',
    capacity: '',
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.location || !formData.address || !formData.totalArea || !formData.capacity) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      // Here you would typically save to your backend
      console.log('Creating poultry farm:', formData);
      
      Alert.alert(
        'نجح',
        'تم إنشاء حقل الدواجن بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => router.push('/poultry-farm-details')
          }
        ]
      );
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء حقل الدواجن');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.black} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('screens.addPoultryFarm')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Home size={20} color={COLORS.primary} />
              <Text style={styles.inputLabel}>{t('poultry.farmName')} *</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="أدخل اسم حقل الدواجن"
              placeholderTextColor={COLORS.darkGray}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <MapPin size={20} color={COLORS.primary} />
              <Text style={styles.inputLabel}>{t('poultry.location')} *</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              placeholder="أدخل موقع الحقل (المدينة/المنطقة)"
              placeholderTextColor={COLORS.darkGray}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <MapPin size={20} color={COLORS.primary} />
              <Text style={styles.inputLabel}>{t('poultry.address')} *</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="أدخل العنوان التفصيلي للحقل"
              placeholderTextColor={COLORS.darkGray}
              textAlign={isRTL ? 'right' : 'left'}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Square size={20} color={COLORS.primary} />
              <Text style={styles.inputLabel}>{t('poultry.totalArea')} (متر مربع) *</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.totalArea}
              onChangeText={(value) => handleInputChange('totalArea', value)}
              placeholder="أدخل المساحة الإجمالية"
              placeholderTextColor={COLORS.darkGray}
              textAlign={isRTL ? 'right' : 'left'}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Users size={20} color={COLORS.primary} />
              <Text style={styles.inputLabel}>{t('poultry.capacity')} (عدد الطيور) *</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.capacity}
              onChangeText={(value) => handleInputChange('capacity', value)}
              placeholder="أدخل السعة القصوى للحقل"
              placeholderTextColor={COLORS.darkGray}
              textAlign={isRTL ? 'right' : 'left'}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <FileText size={20} color={COLORS.primary} />
              <Text style={styles.inputLabel}>{t('poultry.description')}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="أدخل وصف إضافي للحقل (اختياري)"
              placeholderTextColor={COLORS.darkGray}
              textAlign={isRTL ? 'right' : 'left'}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="إنشاء حقل الدواجن"
          onPress={handleSubmit}
          type="primary"
          size="large"
          loading={loading}
          style={styles.submitButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  submitButton: {
    width: '100%',
  },
});