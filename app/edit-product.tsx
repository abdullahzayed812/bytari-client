import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import Button from "../components/Button";
import { ArrowRight, Upload } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  brand: string;
  images: string[];
}

export default function EditProductScreen() {
  const { t, isRTL } = useI18n();
  const { id } = useLocalSearchParams();
  
  // Mock data - replace with actual API call
  const [formData, setFormData] = useState<ProductFormData>({
    name: 'أمبيسيلين 250 مجم',
    description: 'مضاد حيوي واسع الطيف',
    category: 'medicine',
    price: '15.50',
    stock: '25',
    brand: 'فايزر',
    images: ['https://via.placeholder.com/300x200'],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'medicine', name: 'أدوية' },
    { id: 'equipment', name: 'معدات' },
    { id: 'supplements', name: 'مكملات' },
    { id: 'tools', name: 'أدوات' },
  ];

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('خطأ', 'اسم المنتج مطلوب');
      return;
    }
    if (!formData.price.trim()) {
      Alert.alert('خطأ', 'السعر مطلوب');
      return;
    }
    if (!formData.stock.trim()) {
      Alert.alert('خطأ', 'الكمية مطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement product update API
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('نجح', 'تم تحديث المنتج بنجاح', [
        {
          text: 'موافق',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث المنتج');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = () => {
    Alert.alert('تحديد صورة', 'سيتم إضافة وظيفة اختيار الصورة قريباً');
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, 'https://via.placeholder.com/300x200']
    }));
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'تعديل المنتج',
        }}
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات المنتج</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>اسم المنتج *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="أدخل اسم المنتج"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الوصف</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="وصف المنتج"
                multiline
                numberOfLines={3}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الفئة *</Text>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      formData.category === category.id && styles.selectedCategoryButton
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        formData.category === category.id && styles.selectedCategoryText
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>السعر *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                placeholder="السعر بالدولار"
                keyboardType="numeric"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الكمية المتوفرة *</Text>
              <TextInput
                style={styles.input}
                value={formData.stock}
                onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
                placeholder="عدد القطع المتوفرة"
                keyboardType="numeric"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>العلامة التجارية</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData(prev => ({ ...prev, brand: text }))}
                placeholder="اسم العلامة التجارية"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>صور المنتج</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
                <Upload size={24} color={COLORS.primary} />
                <Text style={styles.uploadText}>
                  إضافة صورة
                </Text>
              </TouchableOpacity>
              {formData.images.length > 0 && (
                <View style={styles.imagesContainer}>
                  {formData.images.map((image, index) => (
                    <Image key={index} source={{ uri: image }} style={styles.previewImage} />
                  ))}
                </View>
              )}
            </View>
          </View>

          <Button
            title={isSubmitting ? 'جاري التحديث...' : 'تحديث المنتج'}
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
  categoryContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: COLORS.white,
    fontWeight: '600',
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
  imagesContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  submitButton: {
    marginBottom: 20,
  },
});