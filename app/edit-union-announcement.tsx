import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput, Switch, Image } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Save, X, Upload, Camera, Link, Calendar, MessageSquare, Trash2 } from 'lucide-react-native';

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

export default function EditUnionAnnouncementScreen() {
  const { isSuperAdmin, hasAdminAccess, isModerator, moderatorPermissions, user, sendNotification } = useApp();
  const router = useRouter();
  const { branchId, announcementId } = useLocalSearchParams();

  // Mock data - in real app, fetch based on branchId and announcementId
  const getAnnouncementData = (bId: string, aId: string): Announcement | null => {
    const mockAnnouncements: { [key: string]: Announcement[] } = {
      '1': [
        {
          id: '1',
          title: 'اجتماع الجمعية العمومية السنوي 2025',
          content: 'يسر نقابة الأطباء البيطريين في بغداد دعوة جميع الأعضاء لحضور اجتماع الجمعية العمومية السنوي المقرر عقده يوم الخميس الموافق 30/1/2025 في قاعة المؤتمرات بمقر النقابة. سيتم مناقشة التقرير السنوي والخطط المستقبلية.',
          date: '2025-01-15',
          type: 'meeting',
          isImportant: true,
          image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
          link: 'https://baghdadvetunion.org/meeting-2025',
          linkText: 'رابط التسجيل للاجتماع',
          author: 'إدارة النقابة',
          views: 245,
          branchId: '1'
        },
        {
          id: '2',
          title: 'مؤتمر الطب البيطري الدولي 2025',
          content: 'تنظم النقابة مؤتمرها الدولي السنوي للطب البيطري بمشاركة خبراء من العراق والعالم. التسجيل مفتوح لجميع الأطباء البيطريين.',
          date: '2025-01-10',
          type: 'event',
          isImportant: true,
          image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
          link: 'https://vetconference2025.org',
          linkText: 'موقع المؤتمر والتسجيل',
          author: 'لجنة المؤتمرات',
          views: 189,
          branchId: '1'
        }
      ]
    };

    const branchAnnouncements = mockAnnouncements[bId] || [];
    return branchAnnouncements.find(ann => ann.id === aId) || null;
  };

  const originalAnnouncement = getAnnouncementData(branchId as string, announcementId as string);

  // Form state - must be declared before any conditional returns
  const [formData, setFormData] = useState<Announcement>(
    originalAnnouncement || {
      id: '',
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
    }
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(originalAnnouncement?.image || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check if user has permission to edit announcements
  if (!isSuperAdmin && !hasAdminAccess && !(isModerator && moderatorPermissions?.sections?.includes('union-branches'))) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'غير مصرح' }} />
        <View style={styles.noPermissionContainer}>
          <Text style={styles.noPermissionText}>ليس لديك صلاحية لتعديل إعلانات النقابة</Text>
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

  // If announcement not found
  if (!originalAnnouncement) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'إعلان غير موجود' }} />
        <View style={styles.noPermissionContainer}>
          <Text style={styles.noPermissionText}>الإعلان المطلوب غير موجود</Text>
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
      // Update announcement object
      const updatedAnnouncement: Announcement = {
        ...formData,
        image: selectedImage || formData.image,
        views: formData.views || 0
      };

      // In a real app, this would save to backend
      console.log('Updating announcement:', updatedAnnouncement);
      
      // Send notification to followers of this branch about the update
      if (user) {
        await sendNotification({
          userId: 'all-branch-followers', // In real app, get all followers of this branch
          type: 'medical_record',
          title: `تحديث إعلان من ${branchName}`,
          message: `تم تحديث الإعلان: ${formData.title}`,
          data: {
            petId: '',
            petName: '',
            clinicId: branchId as string,
            clinicName: branchName,
            recordId: updatedAnnouncement.id,
            actionType: 'medical_record'
          },
          status: 'pending'
        });
      }
      
      Alert.alert(
        'تم الحفظ',
        'تم تحديث الإعلان بنجاح وإرسال إشعارات للمتابعين',
        [
          { 
            text: 'موافق', 
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating announcement:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الإعلان');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'حذف الإعلان',
      'هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // In a real app, this would delete from backend
              console.log('Deleting announcement:', formData.id);
              
              Alert.alert(
                'تم الحذف',
                'تم حذف الإعلان بنجاح',
                [
                  { 
                    text: 'موافق', 
                    onPress: () => router.back()
                  }
                ]
              );
            } catch (error) {
              console.error('Error deleting announcement:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف الإعلان');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
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
          title: 'تعديل الإعلان',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={handleDelete} 
                style={styles.deleteButton}
                disabled={isLoading}
              >
                <Trash2 size={20} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSave} 
                style={styles.saveButton}
                disabled={isLoading}
              >
                <Save size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
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
            <Text style={styles.branchTitle}>تعديل إعلان في:</Text>
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
              
              {formData.views && (
                <Text style={styles.previewViews}>{formData.views} مشاهدة</Text>
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
              {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
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
    marginBottom: 8,
  },
  previewLinkText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
  previewViews: {
    fontSize: 12,
    color: COLORS.darkGray,
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