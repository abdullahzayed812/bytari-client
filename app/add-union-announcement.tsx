import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput, Switch, Image } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Save, X, Upload, Camera, Link, Calendar, MessageSquare } from 'lucide-react-native';

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'general' | 'urgent' | 'event' | 'meeting';
  isImportant: boolean;
  image?: string;
  link?: string;
  linkText?: string;
  author?: string;
  views?: number;
  branchId: string;
}

export default function AddUnionAnnouncementScreen() {
  const { isSuperAdmin, hasAdminAccess, isModerator, moderatorPermissions, user, sendUnionNotification } = useApp();
  const router = useRouter();
  const { branchId } = useLocalSearchParams();

  // Form state - must be declared before any conditional returns
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    type: 'general',
    isImportant: false,
    image: '',
    link: '',
    linkText: '',
    author: user?.name || '',
    branchId: branchId as string
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check if user has permission to add announcements
  if (!isSuperAdmin && !hasAdminAccess && !(isModerator && moderatorPermissions?.sections?.includes('union-branches'))) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'غير مصرح' }} />
        <View style={styles.noPermissionContainer}>
          <Text style={styles.noPermissionText}>ليس لديك صلاحية لإضافة إعلانات النقابة</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Get branch name for display
  const getBranchName = (id: string): string => {
    if (id === 'main') {
      return 'نقابة الأطباء البيطريين العراقية - المقر الرئيسي';
    }
    const branches: { [key: string]: string } = {
      '1': 'نقابة الأطباء البيطريين - بغداد',
      '2': 'نقابة الأطباء البيطريين - البصرة',
      '3': 'نقابة الأطباء البيطريين - أربيل',
      '4': 'نقابة الأطباء البيطريين - الموصل',
      '5': 'نقابة الأطباء البيطريين - النجف',
      '6': 'نقابة الأطباء البيطريين - كربلاء',
      '7': 'نقابة الأطباء البيطريين - السليمانية',
      '8': 'نقابة الأطباء البيطريين - دهوك'
    };
    return branches[id] || 'نقابة غير معروفة';
  };

  const branchName = getBranchName(branchId as string);

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create announcement object
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        date: formData.date || new Date().toISOString().split('T')[0],
        type: formData.type as 'general' | 'urgent' | 'event' | 'meeting',
        isImportant: formData.isImportant || false,
        image: selectedImage || formData.image,
        link: formData.link,
        linkText: formData.linkText,
        author: formData.author,
        views: 0,
        branchId: branchId as string
      };

      // In a real app, this would save to backend
      console.log('Saving announcement:', newAnnouncement);
      
      // Send notification to union followers (only for main union)
      if (branchId === 'main') {
        await sendUnionNotification(
          formData.title,
          formData.content.substring(0, 100) + (formData.content.length > 100 ? '...' : ''),
          newAnnouncement.id
        );
      }
      
      Alert.alert(
        'تم الحفظ',
        branchId === 'main' ? 'تم إضافة الإعلان بنجاح وإرسال إشعارات لمتابعي النقابة' : 'تم إضافة الإعلان بنجاح',
        [
          { 
            text: 'موافق', 
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving announcement:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الإعلان');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = () => {
    // In a real app, this would open image picker
    Alert.alert(
      'اختيار صورة',
      'اختر مصدر الصورة',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'المعرض', onPress: () => console.log('Open gallery') },
        { text: 'الكاميرا', onPress: () => console.log('Open camera') }
      ]
    );
  };

  const getAnnouncementTypeLabel = (type: string) => {
    switch (type) {
      case 'urgent': return 'عاجل';
      case 'meeting': return 'اجتماع';
      case 'event': return 'فعالية';
      default: return 'عام';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إضافة إعلان جديد',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave} 
              style={styles.saveButton}
              disabled={isLoading}
            >
              <Save size={20} color={COLORS.white} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Branch Info */}
        <View style={styles.branchInfoSection}>
          <View style={styles.branchIcon}>
            <MessageSquare size={24} color={COLORS.primary} />
          </View>
          <View style={styles.branchInfo}>
            <Text style={styles.branchTitle}>إضافة إعلان إلى:</Text>
            <Text style={styles.branchName}>{branchName}</Text>
          </View>
        </View>

        {/* Announcement Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الإعلان</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>عنوان الإعلان *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="اكتب عنوان الإعلان هنا"
              textAlign="right"
              maxLength={100}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>محتوى الإعلان *</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={formData.content}
              onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
              placeholder="اكتب محتوى الإعلان بالتفصيل"
              multiline
              numberOfLines={6}
              textAlign="right"
              maxLength={1000}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>المؤلف/المسؤول</Text>
            <TextInput
              style={styles.textInput}
              value={formData.author}
              onChangeText={(text) => setFormData(prev => ({ ...prev, author: text }))}
              placeholder="اسم المؤلف أو المسؤول عن الإعلان"
              textAlign="right"
            />
          </View>
        </View>

        {/* Announcement Type and Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع الإعلان والأولوية</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>نوع الإعلان</Text>
            <View style={styles.typeSelector}>
              {['general', 'urgent', 'event', 'meeting'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    formData.type === type && styles.selectedTypeOption
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, type: type as any }))}
                >
                  <Text style={[
                    styles.typeOptionText,
                    formData.type === type && styles.selectedTypeOptionText
                  ]}>
                    {getAnnouncementTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.switchContainer}>
            <Switch
              value={formData.isImportant}
              onValueChange={(value) => setFormData(prev => ({ ...prev, isImportant: value }))}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={formData.isImportant ? COLORS.white : COLORS.gray}
            />
            <Text style={styles.switchLabel}>إعلان مهم (سيظهر في المقدمة)</Text>
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات إضافية</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>تاريخ الإعلان</Text>
            <View style={styles.dateInputContainer}>
              <Calendar size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.textInput, styles.dateInput]}
                value={formData.date}
                onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
                textAlign="right"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>رابط ذات صلة</Text>
            <View style={styles.linkInputContainer}>
              <Link size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.textInput, styles.linkInput]}
                value={formData.link}
                onChangeText={(text) => setFormData(prev => ({ ...prev, link: text }))}
                placeholder="https://example.com"
                textAlign="right"
                keyboardType="url"
              />
            </View>
          </View>
          
          {formData.link && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>نص الرابط</Text>
              <TextInput
                style={styles.textInput}
                value={formData.linkText}
                onChangeText={(text) => setFormData(prev => ({ ...prev, linkText: text }))}
                placeholder="مثال: رابط التسجيل، المزيد من التفاصيل"
                textAlign="right"
              />
            </View>
          )}
        </View>

        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>صورة الإعلان</Text>
          
          {selectedImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <View style={styles.imageActions}>
                <TouchableOpacity style={styles.changeImageButton} onPress={handleImagePicker}>
                  <Camera size={16} color={COLORS.white} />
                  <Text style={styles.imageActionText}>تغيير الصورة</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={() => {
                    setSelectedImage(null);
                    setFormData(prev => ({ ...prev, image: '' }));
                  }}
                >
                  <X size={16} color={COLORS.white} />
                  <Text style={styles.imageActionText}>حذف الصورة</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={handleImagePicker}>
              <Upload size={32} color={COLORS.primary} />
              <Text style={styles.uploadButtonText}>اختيار صورة للإعلان</Text>
              <Text style={styles.uploadButtonSubtext}>من المعرض أو التقاط صورة جديدة (اختياري)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Preview Section */}
        {formData.title && formData.content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معاينة الإعلان</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={styles.previewMeta}>
                  <View style={[
                    styles.previewType,
                    { backgroundColor: formData.type === 'urgent' ? COLORS.error : 
                                      formData.type === 'meeting' ? COLORS.primary : 
                                      formData.type === 'event' ? COLORS.success : COLORS.darkGray }
                  ]}>
                    <Text style={styles.previewTypeText}>
                      {getAnnouncementTypeLabel(formData.type || 'general')}
                    </Text>
                  </View>
                  {formData.isImportant && (
                    <View style={styles.previewImportantBadge}>
                      <Text style={styles.previewImportantText}>مهم</Text>
                    </View>
                  )}
                  <Text style={styles.previewDate}>{formData.date}</Text>
                </View>
              </View>
              
              <Text style={styles.previewTitle}>{formData.title}</Text>
              <Text style={styles.previewContent}>{formData.content}</Text>
              
              {formData.author && (
                <Text style={styles.previewAuthor}>بواسطة: {formData.author}</Text>
              )}
              
              {formData.link && (
                <View style={styles.previewLink}>
                  <Link size={14} color={COLORS.primary} />
                  <Text style={styles.previewLinkText}>
                    {formData.linkText || 'رابط ذات صلة'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>إلغاء</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveActionButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading || !formData.title || !formData.content}
          >
            <Text style={styles.saveActionButtonText}>
              {isLoading ? 'جاري الحفظ...' : 'نشر الإعلان'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPermissionText: {
    fontSize: 18,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  branchInfoSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  branchIcon: {
    marginRight: 16,
  },
  branchInfo: {
    flex: 1,
  },
  branchTitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: 'right',
  },
  branchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'right',
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 8,
    padding: 20,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
  },
  linkInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkInput: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  selectedTypeOption: {
    backgroundColor: COLORS.primary,
  },
  typeOptionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  selectedTypeOptionText: {
    color: COLORS.white,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  changeImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  removeImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  imageActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    gap: 12,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  previewHeader: {
    marginBottom: 12,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  previewType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewTypeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  previewImportantBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  previewImportantText: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  previewDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: 'right',
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
    marginBottom: 8,
  },
  previewAuthor: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '500',
    textAlign: 'right',
    marginBottom: 8,
  },
  previewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    gap: 6,
  },
  previewLinkText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
  actionSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  saveActionButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveActionButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
});