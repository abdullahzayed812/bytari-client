import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { useRouter } from 'expo-router';
import Button from "../../components/Button";
import { Pet } from "../../types";
import { ArrowLeft, Camera, Calendar } from 'lucide-react-native';
import { Stack } from 'expo-router';

const PET_TYPES = ['dog', 'cat', 'rabbit', 'bird', 'other'] as const;
const GENDERS = ['male', 'female'] as const;

export default function AddPetScreen() {
  const { t } = useI18n();
  const { addPet, user } = useApp();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'dog' as Pet['type'],
    breed: '',
    age: '',
    gender: 'male' as Pet['gender'],
    weight: '',
    color: '',
    birthDate: '',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الحيوان');
      return;
    }

    if (!user) {
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      return;
    }

    setIsLoading(true);
    
    try {
      const newPet: Pet = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed.trim() || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        color: formData.color.trim() || undefined,
        birthDate: formData.birthDate || undefined,
        image: formData.image,
        ownerId: user.id,
        medicalRecords: [],
        vaccinations: [],
        reminders: [],
        isLost: false
      };

      await addPet(newPet);
      Alert.alert('نجح', 'تم إضافة الحيوان بنجاح', [
        { text: 'موافق', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة الحيوان');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTypeSelector = () => (
    <View style={styles.typeContainer}>
      {PET_TYPES.map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.typeButton,
            formData.type === type && styles.typeButtonActive
          ]}
          onPress={() => handleInputChange('type', type)}
        >
          <Text style={[
            styles.typeButtonText,
            formData.type === type && styles.typeButtonTextActive
          ]}>
            {t(`pets.types.${type}`)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGenderSelector = () => (
    <View style={styles.genderContainer}>
      {GENDERS.map((gender) => (
        <TouchableOpacity
          key={gender}
          style={[
            styles.genderButton,
            formData.gender === gender && styles.genderButtonActive
          ]}
          onPress={() => handleInputChange('gender', gender)}
        >
          <Text style={[
            styles.genderButtonText,
            formData.gender === gender && styles.genderButtonTextActive
          ]}>
            {gender === 'male' ? t('pets.male') : t('pets.female')}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: t('pets.addPet'),
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black, fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          )
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Pet Image */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: formData.image }} style={styles.petImage} />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Pet Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('pets.name')}</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder={t('pets.enterName')}
            placeholderTextColor={COLORS.lightGray}
          />
        </View>

        {/* Pet Type */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('pets.type')}</Text>
          {renderTypeSelector()}
        </View>

        {/* Pet Breed */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('pets.breed')} (اختياري)</Text>
          <TextInput
            style={styles.input}
            value={formData.breed}
            onChangeText={(value) => handleInputChange('breed', value)}
            placeholder={t('pets.enterBreed')}
            placeholderTextColor={COLORS.lightGray}
          />
        </View>

        {/* Age and Gender Row */}
        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>{t('pets.age')}</Text>
            <TextInput
              style={styles.input}
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              placeholder="العمر بالسنوات"
              placeholderTextColor={COLORS.lightGray}
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>{t('pets.gender')}</Text>
            {renderGenderSelector()}
          </View>
        </View>

        {/* Weight and Color Row */}
        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>{t('pets.weight')} (اختياري)</Text>
            <TextInput
              style={styles.input}
              value={formData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              placeholder="الوزن بالكيلوجرام"
              placeholderTextColor={COLORS.lightGray}
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>{t('pets.color')} (اختياري)</Text>
            <TextInput
              style={styles.input}
              value={formData.color}
              onChangeText={(value) => handleInputChange('color', value)}
              placeholder="لون الحيوان"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>
        </View>

        {/* Birth Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('pets.birthDate')} (اختياري)</Text>
          <TouchableOpacity style={styles.dateInput}>
            <TextInput
              style={styles.dateInputText}
              value={formData.birthDate}
              onChangeText={(value) => handleInputChange('birthDate', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.lightGray}
            />
            <Calendar size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <Button
          title={t('pets.addPet')}
          onPress={handleSubmit}
          type="primary"
          size="large"
          loading={isLoading}
          style={styles.submitButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
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
    textAlign: 'right',
    backgroundColor: COLORS.white,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  typeContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  typeButtonTextActive: {
    color: COLORS.white,
  },
  genderContainer: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  genderButtonTextActive: {
    color: COLORS.white,
  },
  dateInput: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
  },
  dateInputText: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});