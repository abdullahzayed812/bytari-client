import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, Store } from 'lucide-react-native';
import { COLORS } from "../constants/colors";

export default function EditUserStoreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [formData, setFormData] = useState({
    name: 'متجر أصدقاء الحيوانات',
    ownerName: 'علي محمد الجبوري',
    ownerEmail: 'ali.aljabouri@petfriends.com',
    phone: '+964 770 111 2222',
    address: 'شارع الأميرات، حي الكرادة',
    city: 'بغداد',
    description: 'متجر متخصص في جميع مستلزمات الحيوانات الأليفة',
  });

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    Alert.alert(
      'حفظ التغييرات',
      'هل تريد حفظ التغييرات على المتجر؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حفظ', 
          onPress: () => {
            console.log('Store updated:', formData);
            router.back();
          }
        }
      ]
    );
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'تعديل متجر المستخدم',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' as const }
        }} 
      />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تعديل متجر المستخدم</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Save size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Store size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>معلومات المتجر</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>اسم المتجر</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder="أدخل اسم المتجر"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>اسم المالك</Text>
              <TextInput
                style={styles.input}
                value={formData.ownerName}
                onChangeText={(value) => updateField('ownerName', value)}
                placeholder="أدخل اسم المالك"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <TextInput
                style={styles.input}
                value={formData.ownerEmail}
                onChangeText={(value) => updateField('ownerEmail', value)}
                placeholder="أدخل البريد الإلكتروني"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>رقم الهاتف</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                placeholder="أدخل رقم الهاتف"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>العنوان</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(value) => updateField('address', value)}
                placeholder="أدخل العنوان"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>المدينة</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(value) => updateField('city', value)}
                placeholder="أدخل المدينة"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>وصف المتجر</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                placeholder="أدخل وصف المتجر"
                placeholderTextColor={COLORS.darkGray}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.saveButtonLarge} onPress={handleSave}>
            <Save size={20} color={COLORS.white} />
            <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    flex: 1,
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    textAlign: 'right',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  bottomActions: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  saveButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});