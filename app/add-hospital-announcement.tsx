import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Send, Camera, X, Calendar, FileText, Megaphone } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function AddHospitalAnnouncementScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const { hospitalId } = useLocalSearchParams();
  
  const [announcementData, setAnnouncementData] = useState({
    title: '',
    content: '',
    type: 'announcement' as 'news' | 'announcement' | 'event',
    image: null as string | null,
    scheduledDate: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const announcementTypes = [
    { id: 'announcement', label: 'إعلان', color: '#10B981', icon: <Megaphone size={16} color={COLORS.white} /> },
    { id: 'news', label: 'خبر', color: '#0EA5E9', icon: <FileText size={16} color={COLORS.white} /> },
    { id: 'event', label: 'فعالية', color: '#F59E0B', icon: <Calendar size={16} color={COLORS.white} /> },
  ];

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
      setAnnouncementData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const removeImage = () => {
    setAnnouncementData(prev => ({ ...prev, image: null }));
  };

  const handlePublish = async () => {
    if (!announcementData.title.trim() || !announcementData.content.trim()) {
      Alert.alert('خطأ', 'يرجى ملء العنوان والمحتوى');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('نجح', 'تم نشر الإعلان بنجاح', [
        {
          text: 'موافق',
          onPress: () => router.back()
        }
      ]);
    } catch {
      Alert.alert('خطأ', 'حدث خطأ أثناء نشر الإعلان');
    } finally {
      setIsLoading(false);
    }
  };

  const getHospitalName = () => {
    if (hospitalId === 'main') return 'المستشفى البيطري المركزي';
    if (hospitalId === 'basra') return 'مستشفى البصرة البيطري';
    if (hospitalId === 'mosul') return 'مستشفى الموصل البيطري';
    if (hospitalId === 'erbil') return 'مستشفى أربيل البيطري';
    if (hospitalId === 'najaf') return 'مستشفى النجف البيطري';
    return 'المستشفيات البيطرية العراقية';
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'إضافة إعلان مستشفى',
          headerStyle: {
            backgroundColor: '#0EA5E9',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hospital Info */}
        <View style={styles.hospitalInfo}>
          <Text style={styles.hospitalLabel}>نشر في:</Text>
          <Text style={styles.hospitalName}>{getHospitalName()}</Text>
        </View>

        {/* Announcement Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع الإعلان</Text>
          <View style={styles.typeContainer}>
            {announcementTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  { backgroundColor: announcementData.type === type.id ? type.color : '#F3F4F6' }
                ]}
                onPress={() => setAnnouncementData(prev => ({ ...prev, type: type.id as any }))}
              >
                {announcementData.type === type.id && type.icon}
                <Text style={[
                  styles.typeButtonText,
                  { color: announcementData.type === type.id ? COLORS.white : COLORS.black }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>العنوان *</Text>
          <TextInput
            style={styles.textInput}
            value={announcementData.title}
            onChangeText={(text) => setAnnouncementData(prev => ({ ...prev, title: text }))}
            placeholder="أدخل عنوان الإعلان"
            placeholderTextColor={COLORS.darkGray}
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المحتوى *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={announcementData.content}
            onChangeText={(text) => setAnnouncementData(prev => ({ ...prev, content: text }))}
            placeholder="أدخل محتوى الإعلان..."
            placeholderTextColor={COLORS.darkGray}
            multiline
            numberOfLines={6}
            textAlign={isRTL ? 'right' : 'left'}
            textAlignVertical="top"
          />
        </View>

        {/* Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>صورة الإعلان (اختياري)</Text>
          
          {announcementData.image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: announcementData.image }} style={styles.announcementImage} />
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <X size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={handleImagePicker}>
              <Camera size={24} color="#0EA5E9" />
              <Text style={styles.uploadButtonText}>اختر صورة</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Scheduled Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تاريخ النشر (اختياري)</Text>
          <View style={styles.inputWithIcon}>
            <Calendar size={20} color="#0EA5E9" />
            <TextInput
              style={[styles.textInput, styles.textInputWithIcon]}
              value={announcementData.scheduledDate}
              onChangeText={(text) => setAnnouncementData(prev => ({ ...prev, scheduledDate: text }))}
              placeholder="YYYY-MM-DD (اتركه فارغاً للنشر الفوري)"
              placeholderTextColor={COLORS.darkGray}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>
          <Text style={styles.helperText}>
            اتركه فارغاً للنشر الفوري، أو أدخل تاريخ للنشر المجدول
          </Text>
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معاينة الإعلان</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={[
                styles.previewTypeBadge, 
                { backgroundColor: announcementTypes.find(t => t.id === announcementData.type)?.color || '#6B7280' }
              ]}>
                <Text style={styles.previewTypeBadgeText}>
                  {announcementTypes.find(t => t.id === announcementData.type)?.label || 'عام'}
                </Text>
              </View>
              <Text style={styles.previewDate}>
                {announcementData.scheduledDate || new Date().toISOString().split('T')[0]}
              </Text>
            </View>
            
            <Text style={styles.previewTitle}>
              {announcementData.title || 'عنوان الإعلان'}
            </Text>
            
            <Text style={styles.previewContent}>
              {announcementData.content || 'محتوى الإعلان سيظهر هنا...'}
            </Text>
            
            {announcementData.image && (
              <Image source={{ uri: announcementData.image }} style={styles.previewImage} />
            )}
          </View>
        </View>

        {/* Publish Button */}
        <TouchableOpacity 
          style={[styles.publishButtonLarge, isLoading && styles.publishButtonDisabled]}
          onPress={handlePublish}
          disabled={isLoading}
        >
          <Send size={20} color={COLORS.white} />
          <Text style={styles.publishButtonText}>
            {isLoading ? 'جاري النشر...' : 'نشر الإعلان'}
          </Text>
        </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  hospitalInfo: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  hospitalLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: 'right',
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0EA5E9',
    textAlign: 'right',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
    minHeight: 120,
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
  helperText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 8,
    textAlign: 'right',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0EA5E9',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    gap: 8,
    backgroundColor: '#F8FAFC',
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  announcementImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewTypeBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  previewDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  previewContent: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    textAlign: 'right',
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginTop: 8,
    resizeMode: 'cover',
  },
  publishButtonLarge: {
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
  publishButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});