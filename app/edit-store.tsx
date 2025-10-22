import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import Button from "../components/Button";
import { ArrowLeft, Upload, MapPin, Phone, Mail, Clock } from 'lucide-react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';

import * as ImagePicker from 'expo-image-picker';
import { mockVetStores } from "../mocks/data";

interface StoreFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  licenseImage: string;
  workingHours: string;
}

export default function EditStoreScreen() {
  const { isRTL } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    licenseImage: '',
    workingHours: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load store data
  useEffect(() => {
    if (id) {
      const store = mockVetStores.find(s => s.id === id);
      if (store) {
        setFormData({
          name: store.name,
          description: store.description || '',
          address: store.address,
          phone: store.phone,
          email: store.email || '',
          licenseImage: store.image,
          workingHours: `${store.workingHours.days}: ${store.workingHours.open} - ${store.workingHours.close}`,
        });
      }
      setIsLoading(false);
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('خطأ', 'اسم المتجر مطلوب');
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert('خطأ', 'العنوان مطلوب');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('نجح', 'تم تحديث المتجر بنجاح', [
        {
          text: 'موافق',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error updating store:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث المتجر');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى الصور');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData(prev => ({
          ...prev,
          licenseImage: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'تعديل المتجر',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات المتجر</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>اسم المتجر *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="أدخل اسم المتجر"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الوصف</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="وصف المتجر والخدمات المقدمة"
                multiline
                numberOfLines={3}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>العنوان *</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={formData.address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                  placeholder="العنوان الكامل للمتجر"
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات التواصل</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>رقم الهاتف</Text>
              <View style={styles.inputWithIcon}>
                <Phone size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  placeholder="رقم الهاتف"
                  keyboardType="phone-pad"
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <View style={styles.inputWithIcon}>
                <Mail size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder="البريد الإلكتروني"
                  keyboardType="email-address"
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ساعات العمل</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={formData.workingHours}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, workingHours: text }))}
                  placeholder="مثال: السبت - الخميس: 8:00 ص - 10:00 م"
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>صورة المتجر</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>صورة المتجر</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
                <Upload size={24} color={COLORS.primary} />
                <Text style={styles.uploadText}>
                  {formData.licenseImage ? 'تغيير الصورة' : 'رفع صورة المتجر'}
                </Text>
              </TouchableOpacity>
              {formData.licenseImage && (
                <Image source={{ uri: formData.licenseImage }} style={styles.previewImage} />
              )}
            </View>
          </View>

          <Button
            title={isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  backButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
  },
  inputWithIconText: {
    flex: 1,
    borderWidth: 0,
    marginRight: 8,
  },
  uploadButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    backgroundColor: COLORS.gray,
  },
  uploadText: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 8,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  submitButton: {
    marginBottom: 20,
  },
});