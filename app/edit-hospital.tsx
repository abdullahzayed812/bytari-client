import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Save, Camera, X, MapPin, Phone, Clock, Star } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function EditHospitalScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [hospitalData, setHospitalData] = useState({
    name: id === 'main' ? 'المستشفى البيطري المركزي - بغداد' : 'مستشفى البصرة البيطري',
    location: id === 'main' ? 'بغداد - الكرادة' : 'البصرة - المركز',
    phone: '+964 770 123 4567',
    workingHours: id === 'main' ? '24 ساعة' : '8:00 ص - 8:00 م',
    description: 'وصف المستشفى البيطري وخدماته المتاحة',
    specialties: ['جراحة', 'طب داخلي', 'أشعة'],
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400'
  });
  
  const [newSpecialty, setNewSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى الصور');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setHospitalData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !hospitalData.specialties.includes(newSpecialty.trim())) {
      setHospitalData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setHospitalData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!hospitalData.name.trim() || !hospitalData.location.trim() || !hospitalData.phone.trim()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('نجح', 'تم حفظ التعديلات بنجاح', [
        {
          text: 'موافق',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تعديل المستشفى</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Save size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hospital Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>صورة المستشفى</Text>
          <TouchableOpacity style={styles.imageContainer} onPress={handleImagePicker}>
            <Image source={{ uri: hospitalData.image }} style={styles.hospitalImage} />
            <View style={styles.imageOverlay}>
              <Camera size={24} color={COLORS.white} />
              <Text style={styles.imageOverlayText}>تغيير الصورة</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>اسم المستشفى *</Text>
            <TextInput
              style={styles.textInput}
              value={hospitalData.name}
              onChangeText={(text) => setHospitalData(prev => ({ ...prev, name: text }))}
              placeholder="أدخل اسم المستشفى"
              placeholderTextColor={COLORS.darkGray}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>الموقع *</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color="#0EA5E9" />
              <TextInput
                style={[styles.textInput, styles.textInputWithIcon]}
                value={hospitalData.location}
                onChangeText={(text) => setHospitalData(prev => ({ ...prev, location: text }))}
                placeholder="أدخل موقع المستشفى"
                placeholderTextColor={COLORS.darkGray}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>رقم الهاتف *</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={20} color="#0EA5E9" />
              <TextInput
                style={[styles.textInput, styles.textInputWithIcon]}
                value={hospitalData.phone}
                onChangeText={(text) => setHospitalData(prev => ({ ...prev, phone: text }))}
                placeholder="أدخل رقم الهاتف"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="phone-pad"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ساعات العمل</Text>
            <View style={styles.inputWithIcon}>
              <Clock size={20} color="#0EA5E9" />
              <TextInput
                style={[styles.textInput, styles.textInputWithIcon]}
                value={hospitalData.workingHours}
                onChangeText={(text) => setHospitalData(prev => ({ ...prev, workingHours: text }))}
                placeholder="أدخل ساعات العمل"
                placeholderTextColor={COLORS.darkGray}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>وصف المستشفى</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={hospitalData.description}
              onChangeText={(text) => setHospitalData(prev => ({ ...prev, description: text }))}
              placeholder="أدخل وصف المستشفى وخدماته"
              placeholderTextColor={COLORS.darkGray}
              multiline
              numberOfLines={4}
              textAlign={isRTL ? 'right' : 'left'}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Specialties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التخصصات</Text>
          
          <View style={styles.specialtiesContainer}>
            {hospitalData.specialties.map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
                <TouchableOpacity onPress={() => removeSpecialty(index)}>
                  <X size={16} color="#0EA5E9" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.addSpecialtyContainer}>
            <TextInput
              style={[styles.textInput, styles.addSpecialtyInput]}
              value={newSpecialty}
              onChangeText={setNewSpecialty}
              placeholder="أضف تخصص جديد"
              placeholderTextColor={COLORS.darkGray}
              textAlign={isRTL ? 'right' : 'left'}
              onSubmitEditing={addSpecialty}
            />
            <TouchableOpacity style={styles.addSpecialtyButton} onPress={addSpecialty}>
              <Text style={styles.addSpecialtyButtonText}>إضافة</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButtonLarge, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Save size={20} color={COLORS.white} />
          <Text style={styles.saveButtonText}>
            {isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </Text>
        </TouchableOpacity>
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
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
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  hospitalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imageOverlayText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
  },
  textInputWithIcon: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 8,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  specialtyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  specialtyText: {
    color: '#0EA5E9',
    fontSize: 14,
    fontWeight: '600',
  },
  addSpecialtyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addSpecialtyInput: {
    flex: 1,
  },
  addSpecialtyButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addSpecialtyButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 32,
    gap: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});