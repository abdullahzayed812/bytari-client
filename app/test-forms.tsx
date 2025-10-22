import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { COLORS } from "../constants/colors";
import { useRouter, Stack } from 'expo-router';
import { trpc } from "../lib/trpc";
import { useApp } from "../providers/AppProvider";
import { 
  Plus, 
  Heart, 
  Bell, 
  Megaphone, 
  Users, 
  FileText, 
  Award,
  ExternalLink,
  Settings,
  TestTube,
  CheckCircle
} from 'lucide-react-native';

interface TestService {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface TestNews {
  id: string;
  title: string;
  date: string;
  summary: string;
}

export default function TestFormsScreen() {
  const router = useRouter();
  const { user, isSuperAdmin, isModerator } = useApp();
  const [isTestingInquiry, setIsTestingInquiry] = useState(false);
  const [isTestingConsultation, setIsTestingConsultation] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');

  const createInquiryMutation = trpc.inquiries.create.useMutation();
  const createConsultationMutation = trpc.consultations.create.useMutation();

  const testInquiry = async () => {
    setIsTestingInquiry(true);
    try {
      const result = await createInquiryMutation.mutateAsync({
        userId: Number(user?.id) || 1,
        title: 'استفسار تجريبي',
        content: 'هذا استفسار تجريبي لاختبار النظام',
        category: 'عام',
        priority: 'normal' as const,
      });
      
      console.log('✅ Test inquiry result:', result);
      
      let message = 'تم إرسال الاستفسار التجريبي بنجاح!';
      if (result && typeof result === 'object' && 'message' in result && typeof result.message === 'string') {
        message = result.message;
      }
      
      Alert.alert('نجح الاختبار', message);
    } catch (error) {
      console.error('❌ Test inquiry error:', error);
      Alert.alert('فشل الاختبار', 'حدث خطأ أثناء اختبار الاستفسار');
    } finally {
      setIsTestingInquiry(false);
    }
  };

  const testConsultation = async () => {
    setIsTestingConsultation(true);
    try {
      const result = await createConsultationMutation.mutateAsync({
        userId: Number(user?.id) || 1,
        petType: 'cat',
        question: 'هذه استشارة تجريبية لاختبار النظام',
        priority: 'normal' as const,
      });
      
      console.log('✅ Test consultation result:', result);
      
      let message = 'تم إرسال الاستشارة التجريبية بنجاح!';
      if (result && typeof result === 'object' && 'message' in result && typeof result.message === 'string') {
        message = result.message;
      }
      
      Alert.alert('نجح الاختبار', message);
    } catch (error) {
      console.error('❌ Test consultation error:', error);
      Alert.alert('فشل الاختبار', 'حدث خطأ أثناء اختبار الاستشارة');
    } finally {
      setIsTestingConsultation(false);
    }
  };

  const services: TestService[] = [
    {
      id: '1',
      title: 'اختبار الاستفسارات',
      description: 'اختبار نظام إرسال واستقبال الاستفسارات والردود التلقائية',
      icon: <Users size={24} color={COLORS.white} />,
      color: '#3B82F6'
    },
    {
      id: '2',
      title: 'اختبار الاستشارات',
      description: 'اختبار نظام الاستشارات البيطرية والتواصل مع الأطباء',
      icon: <Award size={24} color={COLORS.white} />,
      color: '#10B981'
    },
    {
      id: '3',
      title: 'اختبار النماذج',
      description: 'اختبار جميع النماذج والحقول المطلوبة في التطبيق',
      icon: <FileText size={24} color={COLORS.white} />,
      color: '#F59E0B'
    },
    {
      id: '4',
      title: 'اختبار الإشعارات',
      description: 'اختبار نظام الإشعارات والتنبيهات للمستخدمين',
      icon: <Bell size={24} color={COLORS.white} />,
      color: '#EF4444'
    }
  ];

  const news: TestNews[] = [
    {
      id: '1',
      title: 'تحديث نظام الاختبارات الجديد',
      date: '2024-12-01',
      summary: 'تم إطلاق نظام اختبارات محدث يتضمن المزيد من الميزات والاختبارات الشاملة لجميع وظائف التطبيق...'
    },
    {
      id: '2',
      title: 'إضافة اختبارات الأداء والسرعة',
      date: '2024-11-28',
      summary: 'تم إضافة مجموعة جديدة من اختبارات الأداء لضمان سرعة واستقرار التطبيق في جميع الظروف...'
    },
    {
      id: '3',
      title: 'تحسينات على واجهة الاختبارات',
      date: '2024-11-25',
      summary: 'تحسينات شاملة على واجهة المستخدم لصفحة الاختبارات لتوفير تجربة أفضل وأكثر وضوحاً...'
    }
  ];

  const handleFollowPress = () => {
    setIsFollowing(!isFollowing);
    Alert.alert('تم', isFollowing ? 'تم إلغاء متابعة نظام الاختبارات' : 'تم متابعة نظام الاختبارات بنجاح');
  };

  const handleCreateSection = () => {
    if (!newSectionName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم القسم');
      return;
    }
    
    console.log('إنشاء قسم جديد:', {
      name: newSectionName,
      description: newSectionDescription
    });
    
    Alert.alert('تم', `تم إنشاء قسم "${newSectionName}" بنجاح`);
    setNewSectionName('');
    setNewSectionDescription('');
    setShowCreateSection(false);
  };

  const handleServicePress = (serviceId: string) => {
    switch (serviceId) {
      case '1':
        testInquiry();
        break;
      case '2':
        testConsultation();
        break;
      case '3':
        Alert.alert('اختبار النماذج', 'سيتم إضافة المزيد من اختبارات النماذج قريباً');
        break;
      case '4':
        Alert.alert('اختبار الإشعارات', 'سيتم إضافة اختبارات الإشعارات قريباً');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'نظام اختبار النماذج',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => {
            const canManageTests = isSuperAdmin || isModerator;
            
            return canManageTests ? (
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  onPress={() => setShowCreateSection(true)} 
                  style={[styles.headerButton, styles.addButton]}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    Alert.alert('إعدادات الاختبارات', 'سيتم إضافة إعدادات الاختبارات قريباً');
                  }} 
                  style={[styles.headerButton, styles.editButton]}
                >
                  <Settings size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ) : null;
          },
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Test System Info */}
        <View style={styles.systemInfoSection}>
          <View style={styles.logoContainer}>
            <TestTube size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.systemTitle}>نظام اختبار النماذج والوظائف</Text>
          <Text style={styles.systemDescription}>
            نظام شامل لاختبار جميع وظائف التطبيق والتأكد من عمل النماذج والاستفسارات والاستشارات بشكل صحيح. يوفر النظام أدوات متقدمة لاختبار الأداء والتحقق من صحة البيانات وضمان جودة التطبيق.
          </Text>
          
          {/* Follow Button */}
          <TouchableOpacity 
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollowPress}
            activeOpacity={0.8}
          >
            <View style={styles.followButtonContent}>
              {isFollowing ? (
                <>
                  <Bell size={20} color={COLORS.white} />
                  <Text style={styles.followButtonText}>متابع</Text>
                </>
              ) : (
                <>
                  <Heart size={20} color={COLORS.white} />
                  <Text style={styles.followButtonText}>متابعة</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* System Announcements */}
        <View style={styles.announcementsSection}>
          <View style={styles.announcementHeader}>
            <Text style={styles.sectionTitle}>إعلانات النظام</Text>
            {(isSuperAdmin || isModerator) && (
              <TouchableOpacity 
                onPress={() => {
                  Alert.alert('إضافة إعلان', 'سيتم إضافة ميزة إضافة الإعلانات قريباً');
                }}
                style={styles.addAnnouncementButton}
              >
                <Plus size={16} color={COLORS.white} />
                <Text style={styles.addAnnouncementText}>إضافة إعلان</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.announcementBox}>
            <View style={styles.announcementIcon}>
              <Megaphone size={24} color={COLORS.primary} />
            </View>
            <View style={styles.announcementContent}>
              <Text style={styles.announcementTitle}>تحديث مهم على نظام الاختبارات</Text>
              <Text style={styles.announcementText}>
                تم تحديث نظام اختبار النماذج ليشمل المزيد من الاختبارات الشاملة والتحقق من صحة جميع الوظائف. يرجى اختبار جميع الميزات والتأكد من عملها بشكل صحيح.
              </Text>
              <Text style={styles.announcementDate}>تاريخ النشر: 2024-12-01</Text>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>خدمات الاختبار</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, { backgroundColor: service.color }]}
                onPress={() => handleServicePress(service.id)}
                activeOpacity={0.8}
              >
                <View style={styles.serviceIcon}>
                  {service.icon}
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Tests */}
        <View style={styles.quickTestsSection}>
          <Text style={styles.sectionTitle}>الاختبارات السريعة</Text>
          
          <View style={styles.testSection}>
            <View style={styles.testHeader}>
              <CheckCircle size={20} color={COLORS.primary} />
              <Text style={styles.testSectionTitle}>اختبار الاستفسارات</Text>
            </View>
            <TouchableOpacity 
              style={[styles.testButton, isTestingInquiry && styles.testButtonDisabled]}
              onPress={testInquiry}
              disabled={isTestingInquiry}
            >
              <Text style={styles.testButtonText}>
                {isTestingInquiry ? 'جاري الاختبار...' : 'اختبار إرسال استفسار'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.testSection}>
            <View style={styles.testHeader}>
              <CheckCircle size={20} color={COLORS.primary} />
              <Text style={styles.testSectionTitle}>اختبار الاستشارات</Text>
            </View>
            <TouchableOpacity 
              style={[styles.testButton, isTestingConsultation && styles.testButtonDisabled]}
              onPress={testConsultation}
              disabled={isTestingConsultation}
            >
              <Text style={styles.testButtonText}>
                {isTestingConsultation ? 'جاري الاختبار...' : 'اختبار إرسال استشارة'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Section */}
        <View style={styles.navigationSection}>
          <Text style={styles.sectionTitle}>الانتقال إلى الصفحات</Text>
          <TouchableOpacity 
            style={styles.navCard}
            onPress={() => router.push('/new-inquiry')}
            activeOpacity={0.8}
          >
            <View style={styles.navIcon}>
              <Users size={32} color={COLORS.white} />
            </View>
            <View style={styles.navContent}>
              <Text style={styles.navTitle}>صفحة الاستفسارات</Text>
              <Text style={styles.navDescription}>
                انتقل إلى صفحة الاستفسارات لإرسال استفسار جديد أو مراجعة الاستفسارات السابقة
              </Text>
            </View>
            <ExternalLink size={20} color={COLORS.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navCard}
            onPress={() => router.push('/consultation')}
            activeOpacity={0.8}
          >
            <View style={styles.navIcon}>
              <Award size={32} color={COLORS.white} />
            </View>
            <View style={styles.navContent}>
              <Text style={styles.navTitle}>صفحة الاستشارات</Text>
              <Text style={styles.navDescription}>
                انتقل إلى صفحة الاستشارات للحصول على استشارة بيطرية من الأطباء المختصين
              </Text>
            </View>
            <ExternalLink size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* News & Updates */}
        <View style={styles.newsSection}>
          <Text style={styles.sectionTitle}>الأخبار والتحديثات</Text>
          {news.map((item) => (
            <View key={item.id} style={styles.newsCard}>
              <Text style={styles.newsDate}>{item.date}</Text>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsSummary}>{item.summary}</Text>
              <TouchableOpacity style={styles.readMoreButton}>
                <Text style={styles.readMoreText}>اقرأ المزيد</Text>
                <ExternalLink size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Create Section Modal */}
      {showCreateSection && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إنشاء قسم جديد</Text>
            
            <TextInput
              style={styles.input}
              placeholder="اسم القسم"
              value={newSectionName}
              onChangeText={setNewSectionName}
              placeholderTextColor={COLORS.darkGray}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="وصف القسم (اختياري)"
              value={newSectionDescription}
              onChangeText={setNewSectionDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.darkGray}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowCreateSection(false);
                  setNewSectionName('');
                  setNewSectionDescription('');
                }}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreateSection}
              >
                <Text style={styles.createButtonText}>إنشاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  systemInfoSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  systemTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  systemDescription: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  followingButton: {
    backgroundColor: COLORS.success || '#28a745',
  },
  followButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  followButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: COLORS.success || '#28a745',
  },
  editButton: {
    backgroundColor: COLORS.white,
  },
  announcementsSection: {
    padding: 16,
    paddingBottom: 0,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addAnnouncementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addAnnouncementText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  announcementBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  announcementIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  announcementContent: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  announcementText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    textAlign: 'right',
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
  servicesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 12,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 16,
  },
  quickTestsSection: {
    padding: 16,
  },
  testSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  testSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  testButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: COLORS.darkGray,
    opacity: 0.6,
  },
  testButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigationSection: {
    padding: 16,
  },
  navCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  navIcon: {
    marginRight: 16,
  },
  navContent: {
    flex: 1,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 6,
    textAlign: 'right',
  },
  navDescription: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 20,
    textAlign: 'right',
  },
  newsSection: {
    padding: 16,
  },
  newsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: 'right',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'right',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
  },
  readMoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});