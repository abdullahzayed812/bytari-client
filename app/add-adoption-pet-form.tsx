import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import Button from "../components/Button";
import { Pet } from "../types";
import { Camera, MapPin, Heart } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddAdoptionPetFormScreen() {
  const { t } = useI18n();
  const { user, pets } = useApp();
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  
  const [formData, setFormData] = useState({
    // Basic pet info (pre-filled from existing pet)
    name: '',
    type: 'dog' as Pet['type'],
    breed: '',
    age: '',
    gender: 'male' as Pet['gender'],
    weight: '',
    color: '',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    
    // Additional adoption-specific info
    location: '',
    description: '',
    reasonForAdoption: '',
    healthStatus: '',
    temperament: '',
    goodWithKids: 'unknown' as 'yes' | 'no' | 'unknown',
    goodWithPets: 'unknown' as 'yes' | 'no' | 'unknown',
    housetrained: 'unknown' as 'yes' | 'no' | 'unknown',
    adoptionFee: '',
    specialNeeds: '',
    contactPreference: 'phone' as 'phone' | 'message' | 'both'
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill form with existing pet data if petId is provided
  useEffect(() => {
    if (petId) {
      const existingPet = pets.find((p: Pet) => p.id === petId);
      if (existingPet) {
        setFormData(prev => ({
          ...prev,
          name: existingPet.name || '',
          type: existingPet.type || 'dog',
          breed: existingPet.breed || '',
          age: existingPet.age?.toString() || '',
          gender: existingPet.gender || 'male',
          weight: existingPet.weight?.toString() || '',
          color: existingPet.color || '',
          image: existingPet.image || prev.image
        }));
      }
    }
  }, [petId, pets]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الحيوان');
      return;
    }

    if (!formData.location.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال الموقع');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال وصف الحيوان');
      return;
    }

    if (!formData.reasonForAdoption.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال سبب عرض الحيوان للتبني');
      return;
    }

    if (!user) {
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      return;
    }

    setIsLoading(true);
    
    try {
      const newAdoptionListing = {
        id: Date.now().toString(),
        originalPetId: petId || null,
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed.trim() || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        color: formData.color.trim() || undefined,
        image: formData.image,
        ownerId: user.id,
        location: formData.location.trim(),
        description: formData.description.trim(),
        reasonForAdoption: formData.reasonForAdoption.trim(),
        healthStatus: formData.healthStatus.trim(),
        temperament: formData.temperament.trim(),
        goodWithKids: formData.goodWithKids,
        goodWithPets: formData.goodWithPets,
        housetrained: formData.housetrained,
        adoptionFee: formData.adoptionFee.trim(),
        specialNeeds: formData.specialNeeds.trim(),
        contactPreference: formData.contactPreference,
        listingType: 'adoption' as const,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      console.log('New adoption listing created:', newAdoptionListing);
      
      Alert.alert('نجح', 'تم إضافة الحيوان للتبني بنجاح', [
        { text: 'موافق', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error adding adoption listing:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة الحيوان للتبني');
    } finally {
      setIsLoading(false);
    }
  };

  const renderGenderSelector = () => (
    <View style={styles.genderContainer}>
      <TouchableOpacity
        style={[
          styles.genderButton,
          formData.gender === 'male' && styles.genderButtonActive
        ]}
        onPress={() => handleInputChange('gender', 'male')}
      >
        <Text style={[
          styles.genderButtonText,
          formData.gender === 'male' && styles.genderButtonTextActive
        ]}>ذكر</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.genderButton,
          formData.gender === 'female' && styles.genderButtonActive
        ]}
        onPress={() => handleInputChange('gender', 'female')}
      >
        <Text style={[
          styles.genderButtonText,
          formData.gender === 'female' && styles.genderButtonTextActive
        ]}>أنثى</Text>
      </TouchableOpacity>
    </View>
  );

  const renderYesNoSelector = (field: string, value: string) => (
    <View style={styles.yesNoContainer}>
      <TouchableOpacity
        style={[
          styles.yesNoButton,
          value === 'yes' && styles.yesNoButtonActive
        ]}
        onPress={() => handleInputChange(field, 'yes')}
      >
        <Text style={[
          styles.yesNoButtonText,
          value === 'yes' && styles.yesNoButtonTextActive
        ]}>نعم</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.yesNoButton,
          value === 'no' && styles.yesNoButtonActive
        ]}
        onPress={() => handleInputChange(field, 'no')}
      >
        <Text style={[
          styles.yesNoButtonText,
          value === 'no' && styles.yesNoButtonTextActive
        ]}>لا</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.yesNoButton,
          value === 'unknown' && styles.yesNoButtonActive
        ]}
        onPress={() => handleInputChange(field, 'unknown')}
      >
        <Text style={[
          styles.yesNoButtonText,
          value === 'unknown' && styles.yesNoButtonTextActive
        ]}>غير معروف</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContactPreferenceSelector = () => (
    <View style={styles.contactContainer}>
      <TouchableOpacity
        style={[
          styles.contactButton,
          formData.contactPreference === 'phone' && styles.contactButtonActive
        ]}
        onPress={() => handleInputChange('contactPreference', 'phone')}
      >
        <Text style={[
          styles.contactButtonText,
          formData.contactPreference === 'phone' && styles.contactButtonTextActive
        ]}>هاتف</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.contactButton,
          formData.contactPreference === 'message' && styles.contactButtonActive
        ]}
        onPress={() => handleInputChange('contactPreference', 'message')}
      >
        <Text style={[
          styles.contactButtonText,
          formData.contactPreference === 'message' && styles.contactButtonTextActive
        ]}>رسائل</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.contactButton,
          formData.contactPreference === 'both' && styles.contactButtonActive
        ]}
        onPress={() => handleInputChange('contactPreference', 'both')}
      >
        <Text style={[
          styles.contactButtonText,
          formData.contactPreference === 'both' && styles.contactButtonTextActive
        ]}>كلاهما</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'عرض للتبني',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: 'bold' },
          presentation: 'modal'
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header with icon */}
        <View style={styles.headerContainer}>
          <Heart size={32} color="#10B981" />
          <Text style={styles.headerTitle}>عرض حيوان للتبني</Text>
          <Text style={styles.headerSubtitle}>أضف معلومات إضافية لعرض حيوانك للتبني</Text>
        </View>

        {/* Pet Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: formData.image }} style={styles.petImage} />
          <TouchableOpacity style={styles.cameraButton} onPress={handleImageUpload}>
            <Camera size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Basic Pet Info Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>معلومات الحيوان الأساسية</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم الحيوان *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="أدخل اسم الحيوان"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>السلالة</Text>
            <TextInput
              style={styles.input}
              value={formData.breed}
              onChangeText={(value) => handleInputChange('breed', value)}
              placeholder="أدخل السلالة (اختياري)"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>العمر (بالسنوات) *</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(value) => handleInputChange('age', value)}
                placeholder="العمر"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>الجنس *</Text>
              {renderGenderSelector()}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>الوزن (كيلو)</Text>
              <TextInput
                style={styles.input}
                value={formData.weight}
                onChangeText={(value) => handleInputChange('weight', value)}
                placeholder="الوزن"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>اللون</Text>
              <TextInput
                style={styles.input}
                value={formData.color}
                onChangeText={(value) => handleInputChange('color', value)}
                placeholder="اللون"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>
        </View>

        {/* Adoption Specific Info Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>معلومات التبني</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الموقع *</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.input, styles.inputWithIconText]}
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholder="أدخل الموقع (المدينة، المنطقة)"
                placeholderTextColor={COLORS.lightGray}
              />
              <MapPin size={20} color={COLORS.lightGray} style={styles.inputIcon} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>سبب عرض الحيوان للتبني *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.reasonForAdoption}
              onChangeText={(value) => handleInputChange('reasonForAdoption', value)}
              placeholder="اشرح سبب عرض الحيوان للتبني (انتقال، ظروف عائلية، إلخ...)"
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الحالة الصحية</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.healthStatus}
              onChangeText={(value) => handleInputChange('healthStatus', value)}
              placeholder="اذكر الحالة الصحية، التطعيمات، أي مشاكل صحية..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الطباع والسلوك</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.temperament}
              onChangeText={(value) => handleInputChange('temperament', value)}
              placeholder="اوصف شخصية الحيوان، هل هو هادئ، نشيط، ودود..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>يتعامل جيداً مع الأطفال؟</Text>
            {renderYesNoSelector('goodWithKids', formData.goodWithKids)}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>يتعامل جيداً مع الحيوانات الأخرى؟</Text>
            <Text style={styles.subLabel}>هل يمكن أن يعيش مع حيوانات أليفة أخرى؟</Text>
            {renderYesNoSelector('goodWithPets', formData.goodWithPets)}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>مدرب على النظافة؟</Text>
            <Text style={styles.subLabel}>هل يعرف أين يقضي حاجته؟</Text>
            {renderYesNoSelector('housetrained', formData.housetrained)}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رسوم التبني</Text>
            <TextInput
              style={styles.input}
              value={formData.adoptionFee}
              onChangeText={(value) => handleInputChange('adoptionFee', value)}
              placeholder="أدخل رسوم التبني أو اكتب 'مجاني' (اختياري)"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>احتياجات خاصة</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.specialNeeds}
              onChangeText={(value) => handleInputChange('specialNeeds', value)}
              placeholder="أي احتياجات خاصة، أدوية، نظام غذائي معين..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>طريقة التواصل المفضلة</Text>
            {renderContactPreferenceSelector()}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الوصف العام *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="اكتب وصفاً شاملاً عن الحيوان وأي معلومات إضافية مهمة للمتبني..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <Button
          title="إضافة للتبني"
          onPress={handleSubmit}
          type="primary"
          size="large"
          style={styles.submitButton}
          disabled={isLoading}
        />
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
    paddingBottom: 32,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightGray,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  subLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputWithIconText: {
    paddingLeft: 40,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  genderButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  genderButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  yesNoContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  yesNoButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  yesNoButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  yesNoButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  yesNoButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  contactContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  contactButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  contactButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  contactButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#10B981',
  },
});