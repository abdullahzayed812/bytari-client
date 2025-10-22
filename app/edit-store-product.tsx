import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import Button from "../components/Button";
import { ArrowRight, Upload, ImageIcon } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { useApp } from "../providers/AppProvider";
import * as ImagePicker from 'expo-image-picker';

interface StoreProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  brand: string;
  images: string[];
  petType: string[];
}

export default function EditStoreProductScreen() {
  const { t, isRTL } = useI18n();
  const { userMode } = useApp();
  const { id, storeType } = useLocalSearchParams<{ id?: string; storeType?: string }>();
  
  // Determine store type from params or userMode
  const currentStoreType = storeType || (userMode === 'veterinarian' ? 'veterinarian' : 'pet_owner');
  
  // Mock data - replace with actual API call
  const [formData, setFormData] = useState<StoreProductFormData>({
    name: 'طعام قطط بريميوم',
    description: 'طعام عالي الجودة للقطط البالغة',
    category: 'food',
    price: '45.00',
    stock: '15',
    brand: 'رويال كانين',
    images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400'],
    petType: ['cat'],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories based on store type
  const getCategories = () => {
    if (currentStoreType === 'veterinarian') {
      return [
        { id: 'medicine', name: 'أدوية' },
        { id: 'equipment', name: 'معدات طبية' },
        { id: 'surgical', name: 'أدوات جراحية' },
        { id: 'diagnostic', name: 'أدوات تشخيص' },
        { id: 'vaccines', name: 'لقاحات' },
        { id: 'supplements', name: 'مكملات غذائية' },
      ];
    }
    return [
      { id: 'food', name: 'طعام' },
      { id: 'accessories', name: 'إكسسوارات' },
      { id: 'toys', name: 'ألعاب' },
      { id: 'grooming', name: 'العناية' },
      { id: 'medicine', name: 'أدوية' },
      { id: 'equipment', name: 'معدات' },
    ];
  };
  
  const categories = getCategories();

  const petTypes = [
    { id: 'cat', name: 'قطط' },
    { id: 'dog', name: 'كلاب' },
    { id: 'bird', name: 'طيور' },
    { id: 'fish', name: 'أسماك' },
    { id: 'rabbit', name: 'أرانب' },
    { id: 'other', name: 'أخرى' },
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
    if (formData.petType.length === 0) {
      Alert.alert('خطأ', 'يجب اختيار نوع الحيوان المناسب');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement store product update API
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('نجح', 'تم تحديث المنتج بنجاح', [
        {
          text: 'موافق',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error updating store product:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث المنتج');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, simulate image selection
        const newImage = `https://images.unsplash.com/photo-${Date.now()}?w=400`;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, newImage]
        }));
      } else {
        // Request permission for camera/gallery access
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('خطأ', 'نحتاج إذن للوصول إلى الصور');
          return;
        }

        // Show options for camera or gallery
        Alert.alert(
          'اختر مصدر الصورة',
          'من أين تريد اختيار الصورة؟',
          [
            {
              text: 'الكاميرا',
              onPress: () => pickImageFromCamera()
            },
            {
              text: 'المعرض',
              onPress: () => pickImageFromGallery()
            },
            {
              text: 'إلغاء',
              style: 'cancel'
            }
          ]
        );
      }
    } catch {
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة');
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إذن للوصول إلى الكاميرا');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, result.assets[0].uri]
        }));
      }
    } catch {
      Alert.alert('خطأ', 'حدث خطأ أثناء التقاط الصورة');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, result.assets[0].uri]
        }));
      }
    } catch {
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const togglePetType = (petTypeId: string) => {
    setFormData(prev => ({
      ...prev,
      petType: prev.petType.includes(petTypeId)
        ? prev.petType.filter(type => type !== petTypeId)
        : [...prev.petType, petTypeId]
    }));
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'تعديل منتج المتجر',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.storeTypeIndicator}>
            <Text style={styles.storeTypeText}>
              {currentStoreType === 'veterinarian' ? 'متجر الطبيب البيطري' : 'متجر صاحب الحيوان'}
            </Text>
          </View>

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
              <Text style={styles.label}>نوع الحيوان المناسب *</Text>
              <View style={styles.categoryContainer}>
                {petTypes.map((petType) => (
                  <TouchableOpacity
                    key={petType.id}
                    style={[
                      styles.categoryButton,
                      formData.petType.includes(petType.id) && styles.selectedCategoryButton
                    ]}
                    onPress={() => togglePetType(petType.id)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        formData.petType.includes(petType.id) && styles.selectedCategoryText
                      ]}
                    >
                      {petType.name}
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
              <View style={styles.imagesContainer}>
                {formData.images.map((image, index) => (
                  <View key={index} style={styles.imageItem}>
                    <Image source={{ uri: image }} style={styles.productImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addImageButton} onPress={handleImageUpload}>
                  <ImageIcon size={24} color={COLORS.darkGray} />
                  <Text style={styles.addImageText}>إضافة صورة</Text>
                </TouchableOpacity>
              </View>
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
  storeTypeIndicator: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  storeTypeText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
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
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageItem: {
    position: 'relative',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.red,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
  submitButton: {
    marginBottom: 20,
  },
});