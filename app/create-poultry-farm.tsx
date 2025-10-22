import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import Button from "../components/Button";
import {
  ArrowRight,
  MapPin,
  Calendar,
  Users,
  FileText,
  Camera,
  Building,
  Egg,
  Beef,
  Layers,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface FarmFormData {
  name: string;
  location: string;
  farmType: 'broiler' | 'layer' | 'mixed' | '';
  capacity: string;
  establishedDate: string;
  description: string;
  images: string[];
}

export default function CreatePoultryFarmScreen() {
  const { t } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FarmFormData>({
    name: '',
    location: '',
    farmType: '',
    capacity: '',
    establishedDate: '',
    description: '',
    images: [],
  });

  const farmTypes = [
    {
      id: 'broiler',
      title: 'دجاج اللحم',
      description: 'تربية الدجاج لإنتاج اللحم',
      icon: <Beef size={24} color={COLORS.primary} />,
      color: COLORS.primary,
    },
    {
      id: 'layer',
      title: 'دجاج البيض',
      description: 'تربية الدجاج لإنتاج البيض',
      icon: <Egg size={24} color={COLORS.warning} />,
      color: COLORS.warning,
    },
    {
      id: 'mixed',
      title: 'مختلط',
      description: 'تربية مختلطة للحم والبيض',
      icon: <Layers size={24} color={COLORS.success} />,
      color: COLORS.success,
    },
  ];

  const handleInputChange = (field: keyof FarmFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFarmTypeSelect = (type: 'broiler' | 'layer' | 'mixed') => {
    setFormData(prev => ({
      ...prev,
      farmType: type,
    }));
  };

  const handleAddImage = () => {
    Alert.alert('إضافة صورة', 'ميزة إضافة الصور ستكون متاحة قريباً');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المزرعة');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال موقع المزرعة');
      return false;
    }
    if (!formData.farmType) {
      Alert.alert('خطأ', 'يرجى اختيار نوع المزرعة');
      return false;
    }
    if (!formData.capacity.trim() || isNaN(Number(formData.capacity))) {
      Alert.alert('خطأ', 'يرجى إدخال سعة المزرعة بشكل صحيح');
      return false;
    }
    if (!formData.establishedDate.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال تاريخ التأسيس');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // في التطبيق الحقيقي، سيتم إرسال البيانات إلى API
      console.log('Creating farm:', formData);
      
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'تم بنجاح',
        'تم إنشاء المزرعة بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating farm:', error);
      Alert.alert('خطأ', 'حدث خطأ في إنشاء المزرعة');
    } finally {
      setLoading(false);
    }
  };

  const renderFarmTypeCard = (farmType: typeof farmTypes[0]) => (
    <TouchableOpacity
      key={farmType.id}
      style={[
        styles.farmTypeCard,
        formData.farmType === farmType.id && {
          borderColor: farmType.color,
          backgroundColor: farmType.color + '10',
        },
      ]}
      onPress={() => handleFarmTypeSelect(farmType.id as 'broiler' | 'layer' | 'mixed')}
      activeOpacity={0.7}
    >
      <View style={[styles.farmTypeIcon, { backgroundColor: farmType.color + '20' }]}>
        {farmType.icon}
      </View>
      <Text style={styles.farmTypeTitle}>{farmType.title}</Text>
      <Text style={styles.farmTypeDescription}>{farmType.description}</Text>
      {formData.farmType === farmType.id && (
        <View style={[styles.selectedIndicator, { backgroundColor: farmType.color }]} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowRight size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إنشاء مزرعة دواجن</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Farm Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اسم المزرعة</Text>
          <View style={styles.inputContainer}>
            <Building size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.textInput}
              placeholder="أدخل اسم المزرعة"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              textAlign="right"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الموقع</Text>
          <View style={styles.inputContainer}>
            <MapPin size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.textInput}
              placeholder="أدخل موقع المزرعة"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              textAlign="right"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>
        </View>

        {/* Farm Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع المزرعة</Text>
          <View style={styles.farmTypesGrid}>
            {farmTypes.map(renderFarmTypeCard)}
          </View>
        </View>

        {/* Capacity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>السعة القصوى</Text>
          <View style={styles.inputContainer}>
            <Users size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.textInput}
              placeholder="عدد الطيور القصوى"
              value={formData.capacity}
              onChangeText={(value) => handleInputChange('capacity', value)}
              keyboardType="numeric"
              textAlign="right"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>
        </View>

        {/* Established Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تاريخ التأسيس</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => Alert.alert('قريباً', 'منتقي التاريخ سيكون متاحاً قريباً')}
          >
            <Calendar size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.textInput}
              placeholder="اختر تاريخ التأسيس"
              value={formData.establishedDate}
              onChangeText={(value) => handleInputChange('establishedDate', value)}
              textAlign="right"
              placeholderTextColor={COLORS.lightGray}
              editable={false}
            />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الوصف (اختياري)</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <FileText size={20} color={COLORS.darkGray} style={styles.textAreaIcon} />
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="أدخل وصف المزرعة"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              textAlign="right"
              textAlignVertical="top"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>صور المزرعة (اختياري)</Text>
          <TouchableOpacity style={styles.imageUploadCard} onPress={handleAddImage}>
            <Camera size={32} color={COLORS.primary} />
            <Text style={styles.imageUploadText}>إضافة صور</Text>
            <Text style={styles.imageUploadSubtext}>اختر صور توضح المزرعة والمرافق</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            title="إنشاء المزرعة"
            onPress={handleSubmit}
            type="primary"
            size="large"
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
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
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    marginRight: 12,
    textAlign: 'right',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  textAreaIcon: {
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  farmTypesGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  farmTypeCard: {
    width: (width - 60) / 3,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    position: 'relative',
  },
  farmTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  farmTypeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  farmTypeDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  imageUploadCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderStyle: 'dashed',
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  imageUploadSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
  submitSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  submitButton: {
    width: '100%',
  },
});