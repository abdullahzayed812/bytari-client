import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput, Switch, Image } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Building2, MapPin, Phone, Mail, Users, Save, Trash2, Plus, Edit3, Calendar, X, Link, Upload, Camera } from 'lucide-react-native';

interface UnionBranch {
  id: string;
  name: string;
  governorate: string;
  region: 'central' | 'northern' | 'southern' | 'kurdistan';
  address: string;
  phone: string;
  email: string;
  president: string;
  membersCount: number;
  isFollowing: boolean;
  announcements: Announcement[];
  rating: number;
  description: string;
  establishedYear: number;
  services: string[];
}

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
}

export default function EditUnionBranchScreen() {
  const { isSuperAdmin, hasAdminAccess, isModerator, moderatorPermissions } = useApp();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mock data - in real app, fetch based on id
  const getBranchData = (branchId: string): UnionBranch => {
    const branches: { [key: string]: UnionBranch } = {
      '1': {
        id: '1',
        name: 'نقابة الأطباء البيطريين - بغداد',
        governorate: 'بغداد',
        region: 'central',
        address: 'الكرادة الشرقية - شارع أبو نواس - مجمع النقابات المهنية - الطابق الثالث',
        phone: '+964 780 123 4567',
        email: 'baghdad@iraqvetunion.org',
        president: 'د. محمد جاسم العبيدي',
        membersCount: 1850,
        isFollowing: true,
        rating: 4.9,
        description: 'نقابة الأطباء البيطريين في بغداد هي النقابة الرئيسية والأكبر في العراق، تأسست عام 1959 وتضم أكثر من 1850 طبيب بيطري. تقود النقابة جهود تطوير مهنة الطب البيطري في العراق وتعمل على حماية حقوق الأطباء البيطريين وتقديم أفضل الخدمات للمجتمع.',
        establishedYear: 1959,
        services: [
          'تسجيل وترخيص الأطباء البيطريين',
          'برامج التطوير المهني والتدريب المستمر',
          'الاستشارات القانونية والمهنية',
          'برامج التأمين الصحي والاجتماعي',
          'تنظيم المؤتمرات والندوات العلمية',
          'البحوث والدراسات البيطرية',
          'برامج التعاون الدولي',
          'مراقبة جودة الخدمات البيطرية'
        ],
        announcements: [
          {
            id: '1',
            title: 'اجتماع الجمعية العمومية السنوي 2025',
            content: 'يسر نقابة الأطباء البيطريين في بغداد دعوة جميع الأعضاء لحضور اجتماع الجمعية العمومية السنوي المقرر عقده يوم الخميس الموافق 30/1/2025 في قاعة المؤتمرات بمقر النقابة. سيتم مناقشة التقرير السنوي والخطط المستقبلية.',
            date: '2025-01-15',
            type: 'meeting',
            isImportant: true
          },
          {
            id: '2',
            title: 'مؤتمر الطب البيطري الدولي 2025',
            content: 'تنظم النقابة مؤتمرها الدولي السنوي للطب البيطري بمشاركة خبراء من العراق والعالم. التسجيل مفتوح لجميع الأطباء البيطريين.',
            date: '2025-01-10',
            type: 'event',
            isImportant: true
          },
          {
            id: '3',
            title: 'برنامج التدريب المتقدم في جراحة الحيوانات',
            content: 'يبدأ برنامج التدريب المتقدم في جراحة الحيوانات الأليفة بالتعاون مع جامعة بغداد. البرنامج يشمل تدريب عملي ونظري.',
            date: '2025-01-08',
            type: 'event',
            isImportant: false
          }
        ]
      },
      // Add other branches here...
    };
    
    return branches[branchId as string] || branches['1'];
  };
  
  const originalBranch = getBranchData(id as string);
  
  // Form state
  const [formData, setFormData] = useState<UnionBranch>(originalBranch);
  const [newService, setNewService] = useState<string>('');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState<boolean>(false);
  const [newAnnouncement, setNewAnnouncement] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    type: 'general',
    isImportant: false,
    image: '',
    link: '',
    linkText: '',
    author: ''
  });
  const [selectedAnnouncementImage, setSelectedAnnouncementImage] = useState<string | null>(null);

  // Check if user has permission to edit
  if (!isSuperAdmin && !hasAdminAccess && !(isModerator && moderatorPermissions?.sections?.includes('union-branches'))) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'غير مصرح' }} />
        <View style={styles.noPermissionContainer}>
          <Text style={styles.noPermissionText}>ليس لديك صلاحية لتعديل معلومات النقابة</Text>
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

  const handleSave = () => {
    Alert.alert(
      'حفظ التغييرات',
      'هل أنت متأكد من حفظ جميع التغييرات؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حفظ',
          onPress: () => {
            // Here you would save to backend
            console.log('Saving branch data:', formData);
            Alert.alert('تم الحفظ', 'تم حفظ التغييرات بنجاح', [
              { text: 'موافق', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
    }
  };

  const handleRemoveService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleAddAnnouncement = () => {
    if (newAnnouncement.title && newAnnouncement.content) {
      const announcement: Announcement = {
        id: Date.now().toString(),
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        date: newAnnouncement.date || new Date().toISOString().split('T')[0],
        type: newAnnouncement.type as 'general' | 'urgent' | 'event' | 'meeting',
        isImportant: newAnnouncement.isImportant || false
      };
      
      setFormData(prev => ({
        ...prev,
        announcements: [announcement, ...prev.announcements]
      }));
      
      setNewAnnouncement({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        type: 'general',
        isImportant: false,
        image: '',
        link: '',
        linkText: '',
        author: ''
      });
      setSelectedAnnouncementImage(null);
      setShowAddAnnouncement(false);
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
  };

  const handleUpdateAnnouncement = () => {
    if (editingAnnouncement) {
      setFormData(prev => ({
        ...prev,
        announcements: prev.announcements.map(ann => 
          ann.id === editingAnnouncement.id ? editingAnnouncement : ann
        )
      }));
      setEditingAnnouncement(null);
    }
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    Alert.alert(
      'حذف الإعلان',
      'هل أنت متأكد من حذف هذا الإعلان؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setFormData(prev => ({
              ...prev,
              announcements: prev.announcements.filter(ann => ann.id !== announcementId)
            }));
          }
        }
      ]
    );
  };

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return COLORS.error;
      case 'meeting': return COLORS.primary;
      case 'event': return COLORS.success;
      default: return COLORS.darkGray;
    }
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
          title: 'تعديل معلومات النقابة',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Save size={20} color={COLORS.white} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>اسم النقابة</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="اسم النقابة"
              textAlign="right"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>المحافظة</Text>
            <TextInput
              style={styles.textInput}
              value={formData.governorate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, governorate: text }))}
              placeholder="المحافظة"
              textAlign="right"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>رئيس النقابة</Text>
            <TextInput
              style={styles.textInput}
              value={formData.president}
              onChangeText={(text) => setFormData(prev => ({ ...prev, president: text }))}
              placeholder="رئيس النقابة"
              textAlign="right"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>سنة التأسيس</Text>
            <TextInput
              style={styles.textInput}
              value={formData.establishedYear.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, establishedYear: parseInt(text) || 0 }))}
              placeholder="سنة التأسيس"
              keyboardType="numeric"
              textAlign="right"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>عدد الأعضاء</Text>
            <TextInput
              style={styles.textInput}
              value={formData.membersCount.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, membersCount: parseInt(text) || 0 }))}
              placeholder="عدد الأعضاء"
              keyboardType="numeric"
              textAlign="right"
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الاتصال</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>العنوان</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              placeholder="العنوان الكامل"
              multiline
              numberOfLines={3}
              textAlign="right"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>رقم الهاتف</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="رقم الهاتف"
              keyboardType="phone-pad"
              textAlign="right"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="البريد الإلكتروني"
              keyboardType="email-address"
              textAlign="right"
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نبذة عن النقابة</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="نبذة تعريفية عن النقابة"
            multiline
            numberOfLines={5}
            textAlign="right"
          />
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الخدمات المقدمة</Text>
          
          <View style={styles.addServiceContainer}>
            <TouchableOpacity onPress={handleAddService} style={styles.addServiceButton}>
              <Plus size={16} color={COLORS.white} />
            </TouchableOpacity>
            <TextInput
              style={[styles.textInput, styles.addServiceInput]}
              value={newService}
              onChangeText={setNewService}
              placeholder="إضافة خدمة جديدة"
              textAlign="right"
              onSubmitEditing={handleAddService}
            />
          </View>
          
          <View style={styles.servicesList}>
            {formData.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <TouchableOpacity 
                  onPress={() => handleRemoveService(index)}
                  style={styles.removeServiceButton}
                >
                  <X size={16} color={COLORS.error} />
                </TouchableOpacity>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity 
              onPress={() => setShowAddAnnouncement(true)}
              style={styles.addButton}
            >
              <Plus size={16} color={COLORS.white} />
              <Text style={styles.addButtonText}>إضافة إعلان</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>الإعلانات والأخبار</Text>
          </View>
          
          {/* Add Announcement Form */}
          {showAddAnnouncement && (
            <View style={styles.announcementForm}>
              <Text style={styles.formTitle}>إضافة إعلان جديد</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>عنوان الإعلان</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAnnouncement.title}
                  onChangeText={(text) => setNewAnnouncement(prev => ({ ...prev, title: text }))}
                  placeholder="عنوان الإعلان"
                  textAlign="right"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>محتوى الإعلان</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={newAnnouncement.content}
                  onChangeText={(text) => setNewAnnouncement(prev => ({ ...prev, content: text }))}
                  placeholder="محتوى الإعلان"
                  multiline
                  numberOfLines={4}
                  textAlign="right"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>المؤلف/المسؤول</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAnnouncement.author}
                  onChangeText={(text) => setNewAnnouncement(prev => ({ ...prev, author: text }))}
                  placeholder="اسم المؤلف أو المسؤول"
                  textAlign="right"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>رابط ذات صلة</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAnnouncement.link}
                  onChangeText={(text) => setNewAnnouncement(prev => ({ ...prev, link: text }))}
                  placeholder="رابط الموقع أو الملف"
                  textAlign="right"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>نص الرابط</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAnnouncement.linkText}
                  onChangeText={(text) => setNewAnnouncement(prev => ({ ...prev, linkText: text }))}
                  placeholder="نص يظهر للرابط (مثال: رابط التسجيل)"
                  textAlign="right"
                />
              </View>
              
              {/* Image Upload for Announcement */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>صورة الإعلان</Text>
                {selectedAnnouncementImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: selectedAnnouncementImage }} style={styles.imagePreview} />
                    <View style={styles.imageActions}>
                      <TouchableOpacity style={styles.changeImageButton} onPress={() => {/* Add image picker logic */}}>
                        <Camera size={16} color={COLORS.white} />
                        <Text style={styles.imageActionText}>تغيير</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.removeImageButton} onPress={() => {
                        setSelectedAnnouncementImage(null);
                        setNewAnnouncement(prev => ({ ...prev, image: '' }));
                      }}>
                        <X size={16} color={COLORS.white} />
                        <Text style={styles.imageActionText}>حذف</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={() => {/* Add image picker logic */}}>
                    <Upload size={24} color={COLORS.primary} />
                    <Text style={styles.uploadButtonText}>اختيار صورة</Text>
                    <Text style={styles.uploadButtonSubtext}>من المعرض أو التقاط صورة جديدة</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>تاريخ الإعلان</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAnnouncement.date}
                  onChangeText={(text) => setNewAnnouncement(prev => ({ ...prev, date: text }))}
                  placeholder="YYYY-MM-DD"
                  textAlign="right"
                />
              </View>
              
              <View style={styles.switchContainer}>
                <Switch
                  value={newAnnouncement.isImportant}
                  onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, isImportant: value }))}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={newAnnouncement.isImportant ? COLORS.white : COLORS.gray}
                />
                <Text style={styles.switchLabel}>إعلان مهم</Text>
              </View>
              
              <View style={styles.formActions}>
                <TouchableOpacity 
                  onPress={() => setShowAddAnnouncement(false)}
                  style={[styles.formButton, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleAddAnnouncement}
                  style={[styles.formButton, styles.saveFormButton]}
                >
                  <Text style={styles.saveFormButtonText}>إضافة</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Edit Announcement Form */}
          {editingAnnouncement && (
            <View style={styles.announcementForm}>
              <Text style={styles.formTitle}>تعديل الإعلان</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>عنوان الإعلان</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingAnnouncement.title}
                  onChangeText={(text) => setEditingAnnouncement(prev => prev ? ({ ...prev, title: text }) : null)}
                  placeholder="عنوان الإعلان"
                  textAlign="right"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>محتوى الإعلان</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={editingAnnouncement.content}
                  onChangeText={(text) => setEditingAnnouncement(prev => prev ? ({ ...prev, content: text }) : null)}
                  placeholder="محتوى الإعلان"
                  multiline
                  numberOfLines={4}
                  textAlign="right"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>المؤلف/المسؤول</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingAnnouncement.author}
                  onChangeText={(text) => setEditingAnnouncement(prev => prev ? ({ ...prev, author: text }) : null)}
                  placeholder="اسم المؤلف أو المسؤول"
                  textAlign="right"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>رابط ذات صلة</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingAnnouncement.link}
                  onChangeText={(text) => setEditingAnnouncement(prev => prev ? ({ ...prev, link: text }) : null)}
                  placeholder="رابط الموقع أو الملف"
                  textAlign="right"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>نص الرابط</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingAnnouncement.linkText}
                  onChangeText={(text) => setEditingAnnouncement(prev => prev ? ({ ...prev, linkText: text }) : null)}
                  placeholder="نص يظهر للرابط"
                  textAlign="right"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>تاريخ الإعلان</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingAnnouncement.date}
                  onChangeText={(text) => setEditingAnnouncement(prev => prev ? ({ ...prev, date: text }) : null)}
                  placeholder="YYYY-MM-DD"
                  textAlign="right"
                />
              </View>
              
              <View style={styles.switchContainer}>
                <Switch
                  value={editingAnnouncement.isImportant}
                  onValueChange={(value) => setEditingAnnouncement(prev => prev ? ({ ...prev, isImportant: value }) : null)}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={editingAnnouncement.isImportant ? COLORS.white : COLORS.gray}
                />
                <Text style={styles.switchLabel}>إعلان مهم</Text>
              </View>
              
              <View style={styles.formActions}>
                <TouchableOpacity 
                  onPress={() => setEditingAnnouncement(null)}
                  style={[styles.formButton, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleUpdateAnnouncement}
                  style={[styles.formButton, styles.saveFormButton]}
                >
                  <Text style={styles.saveFormButtonText}>حفظ</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Announcements List */}
          <View style={styles.announcementsList}>
            {formData.announcements.map((announcement) => (
              <View key={announcement.id} style={styles.announcementCard}>
                <View style={styles.announcementHeader}>
                  <View style={styles.announcementActions}>
                    <TouchableOpacity 
                      onPress={() => handleDeleteAnnouncement(announcement.id)}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={14} color={COLORS.error} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleEditAnnouncement(announcement)}
                      style={styles.editButton}
                    >
                      <Edit3 size={14} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.announcementMeta}>
                    <View style={[
                      styles.announcementType,
                      { backgroundColor: getAnnouncementTypeColor(announcement.type) }
                    ]}>
                      <Text style={styles.announcementTypeText}>
                        {getAnnouncementTypeLabel(announcement.type)}
                      </Text>
                    </View>
                    {announcement.isImportant && (
                      <View style={styles.importantBadge}>
                        <Text style={styles.importantText}>مهم</Text>
                      </View>
                    )}
                    <Text style={styles.announcementDate}>{announcement.date}</Text>
                  </View>
                </View>
                
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementContent}>{announcement.content}</Text>
              </View>
            ))}
          </View>
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
  section: {
    backgroundColor: COLORS.white,
    marginTop: 8,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addServiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  addServiceInput: {
    flex: 1,
  },
  addServiceButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicesList: {
    gap: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  removeServiceButton: {
    padding: 4,
  },
  serviceText: {
    fontSize: 14,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: 'right',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  announcementForm: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  formButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  cancelButtonText: {
    color: COLORS.darkGray,
    fontSize: 14,
    fontWeight: '600',
  },
  saveFormButton: {
    backgroundColor: COLORS.primary,
  },
  saveFormButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  announcementsList: {
    gap: 12,
  },
  announcementCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  announcementActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  announcementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  announcementType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  announcementTypeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  importantBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  importantText: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  announcementDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  announcementContent: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    textAlign: 'right',
  },
  imagePreviewContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
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
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  removeImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
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
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});