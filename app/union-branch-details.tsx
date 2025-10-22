import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";

import { useApp } from "../providers/AppProvider";
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Building2, MapPin, Phone, Mail, Users, Star, Edit3, Plus, Calendar, MessageSquare, ExternalLink, Bell, BellOff, Link } from 'lucide-react-native';

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

export default function UnionBranchDetailsScreen() {

  const { isSuperAdmin, hasAdminAccess, sendNotification, isModerator, moderatorPermissions } = useApp();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

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
            isImportant: true,
            image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
            link: 'https://baghdadvetunion.org/meeting-2025',
            linkText: 'رابط التسجيل للاجتماع',
            author: 'إدارة النقابة',
            views: 245
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
            views: 189
          },
          {
            id: '3',
            title: 'برنامج التدريب المتقدم في جراحة الحيوانات',
            content: 'يبدأ برنامج التدريب المتقدم في جراحة الحيوانات الأليفة بالتعاون مع جامعة بغداد. البرنامج يشمل تدريب عملي ونظري.',
            date: '2025-01-08',
            type: 'event',
            isImportant: false,
            author: 'قسم التدريب',
            views: 156
          }
        ]
      },
      '2': {
        id: '2',
        name: 'نقابة الأطباء البيطريين - البصرة',
        governorate: 'البصرة',
        region: 'southern',
        address: 'العشار - شارع الكورنيش - مبنى النقابات المهنية - الطابق الثاني',
        phone: '+964 770 234 5678',
        email: 'basra@iraqvetunion.org',
        president: 'د. سارة أحمد الجبوري',
        membersCount: 680,
        isFollowing: false,
        rating: 4.7,
        description: 'نقابة الأطباء البيطريين في البصرة تخدم محافظة البصرة والمناطق الجنوبية، تأسست عام 1968 وتضم 680 طبيب بيطري. تركز على تطوير الثروة الحيوانية والسمكية في المنطقة وتعتبر من أهم النقابات في الجنوب.',
        establishedYear: 1968,
        services: [
          'تسجيل وترخيص الأطباء البيطريين',
          'الإشراف على المسالخ ومعامل اللحوم',
          'مراقبة وتطوير الثروة السمكية',
          'برامج التدريب المتخصص',
          'الاستشارات البيطرية والفنية',
          'مراقبة صحة الحيوانات المستوردة'
        ],
        announcements: [
          {
            id: '1',
            title: 'مؤتمر الثروة السمكية 2025',
            content: 'تنظم النقابة مؤتمرها السنوي حول تطوير الثروة السمكية في العراق بمشاركة خبراء محليين ودوليين.',
            date: '2025-01-20',
            type: 'event',
            isImportant: true
          },
          {
            id: '2',
            title: 'برنامج تدريبي في أمراض الأسماك',
            content: 'يبدأ برنامج تدريبي متخصص في تشخيص وعلاج أمراض الأسماك بالتعاون مع جامعة البصرة.',
            date: '2025-01-12',
            type: 'event',
            isImportant: false
          }
        ]
      },
      '3': {
        id: '3',
        name: 'نقابة الأطباء البيطريين - أربيل',
        governorate: 'أربيل',
        region: 'kurdistan',
        address: 'منطقة عنكاوا - شارع الجامعة - مجمع النقابات',
        phone: '+964 66 789 0123',
        email: 'erbil@iraqvetunion.org',
        president: 'د. كاوه أحمد محمد',
        membersCount: 320,
        isFollowing: false,
        rating: 4.7,
        description: 'نقابة الأطباء البيطريين في أربيل تخدم إقليم كردستان العراق، تأسست عام 1995 وتضم 320 طبيب بيطري. تعمل على تطوير الخدمات البيطرية في الإقليم.',
        establishedYear: 1995,
        services: [
          'تسجيل الأطباء البيطريين',
          'إصدار التراخيص المهنية',
          'التدريب والتأهيل',
          'مراقبة الصحة الحيوانية',
          'الاستشارات الفنية',
          'التعاون الدولي'
        ],
        announcements: [
          {
            id: '1',
            title: 'مؤتمر الطب البيطري الكردستاني',
            content: 'يسر النقابة دعوتكم لحضور المؤتمر السنوي للطب البيطري في إقليم كردستان بمشاركة خبراء من تركيا وإيران.',
            date: '2024-12-15',
            type: 'event',
            isImportant: true
          }
        ]
      },
      '4': {
        id: '4',
        name: 'نقابة الأطباء البيطريين - الموصل',
        governorate: 'نينوى',
        region: 'northern',
        address: 'الجانب الأيمن - حي الزهراء - مجمع النقابات المهنية',
        phone: '+964 60 456 7890',
        email: 'mosul@iraqvetunion.org',
        president: 'د. عمر يوسف الحديدي',
        membersCount: 280,
        isFollowing: false,
        rating: 4.4,
        description: 'نقابة الأطباء البيطريين في الموصل تخدم محافظة نينوى والمناطق الشمالية، تأسست عام 1978 وتم إعادة تأهيلها عام 2018. تعمل على إعادة بناء الخدمات البيطرية في المحافظة.',
        establishedYear: 1978,
        services: [
          'تسجيل الأطباء البيطريين',
          'إصدار التراخيص',
          'إعادة التأهيل المهني',
          'مراقبة الثروة الحيوانية',
          'التدريب التخصصي',
          'الدعم الفني'
        ],
        announcements: [
          {
            id: '1',
            title: 'برنامج إعادة التأهيل المهني',
            content: 'تعلن النقابة عن بدء برنامج إعادة التأهيل المهني للأطباء البيطريين بالتعاون مع منظمات دولية لتطوير القدرات المهنية.',
            date: '2024-12-08',
            type: 'general',
            isImportant: true
          }
        ]
      },
      '5': {
        id: '5',
        name: 'نقابة الأطباء البيطريين - النجف',
        governorate: 'النجف',
        region: 'central',
        address: 'حي الأمير - شارع الكوفة - مبنى النقابات',
        phone: '+964 33 234 5678',
        email: 'najaf@iraqvetunion.org',
        president: 'د. علي حسين الموسوي',
        membersCount: 180,
        isFollowing: false,
        rating: 4.5,
        description: 'نقابة الأطباء البيطريين في النجف تخدم محافظة النجف الأشرف، تأسست عام 1985 وتضم 180 طبيب بيطري. تركز على خدمة المجتمع المحلي والحجاج.',
        establishedYear: 1985,
        services: [
          'تسجيل الأطباء البيطريين',
          'إصدار التراخيص',
          'الخدمات البيطرية للحجاج',
          'مراقبة الأغذية',
          'التدريب المهني',
          'الاستشارات البيطرية'
        ],
        announcements: [
          {
            id: '1',
            title: 'خدمات بيطرية خاصة لموسم الحج',
            content: 'تعلن النقابة عن تفعيل الخدمات البيطرية الخاصة لموسم زيارة الأربعين لضمان سلامة الأغذية والصحة العامة.',
            date: '2024-12-05',
            type: 'general',
            isImportant: false
          }
        ]
      },
      '6': {
        id: '6',
        name: 'نقابة الأطباء البيطريين - كربلاء',
        governorate: 'كربلاء',
        region: 'central',
        address: 'حي الحسين - شارع الإمام علي - مجمع النقابات',
        phone: '+964 32 345 6789',
        email: 'karbala@iraqvetunion.org',
        president: 'د. محمد جواد الكربلائي',
        membersCount: 150,
        isFollowing: false,
        rating: 4.6,
        description: 'نقابة الأطباء البيطريين في كربلاء المقدسة تخدم محافظة كربلاء، تأسست عام 1988 وتضم 150 طبيب بيطري. تقدم خدمات متميزة للزوار والمجتمع المحلي.',
        establishedYear: 1988,
        services: [
          'تسجيل الأطباء البيطريين',
          'إصدار التراخيص',
          'خدمات الزوار والحجاج',
          'مراقبة سلامة الأغذية',
          'التدريب المتخصص',
          'الاستشارات البيطرية'
        ],
        announcements: [
          {
            id: '1',
            title: 'استعدادات خاصة لزيارة الأربعين',
            content: 'تستعد النقابة لتقديم خدمات بيطرية متميزة خلال زيارة الأربعين من خلال فرق متخصصة لمراقبة سلامة الأغذية.',
            date: '2024-12-07',
            type: 'event',
            isImportant: true
          }
        ]
      },
      '8': {
        id: '8',
        name: 'نقابة الأطباء البيطريين - دهوك',
        governorate: 'دهوك',
        region: 'kurdistan',
        address: 'مركز المدينة - شارع زاخو - مبنى النقابات المهنية',
        phone: '+964 62 567 8901',
        email: 'duhok@iraqvetunion.org',
        president: 'د. شيرين أحمد حسن',
        membersCount: 120,
        isFollowing: false,
        rating: 4.3,
        description: 'نقابة الأطباء البيطريين في دهوك تخدم محافظة دهوك في إقليم كردستان، تأسست عام 2000 وتضم 120 طبيب بيطري. تركز على الخدمات الحدودية والتعاون الإقليمي.',
        establishedYear: 2000,
        services: [
          'تسجيل الأطباء البيطريين',
          'إصدار التراخيص',
          'الخدمات الحدودية',
          'مراقبة الاستيراد والتصدير',
          'التدريب المهني',
          'التعاون الإقليمي'
        ],
        announcements: [
          {
            id: '1',
            title: 'ورشة عمل حول الحجر البيطري',
            content: 'تنظم النقابة ورشة عمل متخصصة حول إجراءات الحجر البيطري للحيوانات المستوردة بالتعاون مع السلطات الحدودية.',
            date: '2024-12-09',
            type: 'event',
            isImportant: false
          }
        ]
      },
      '7': {
        id: '7',
        name: 'نقابة الأطباء البيطريين - السليمانية',
        governorate: 'السليمانية',
        region: 'kurdistan',
        address: 'حي سالم - شارع الجامعة - مجمع النقابات المهنية',
        phone: '+964 53 678 9012',
        email: 'sulaymaniyah@iraqvetunion.org',
        president: 'د. رزان عمر قادر',
        membersCount: 200,
        isFollowing: false,
        rating: 4.5,
        description: 'نقابة الأطباء البيطريين في السليمانية تخدم محافظة السليمانية، تأسست عام 1998 وتضم 200 طبيب بيطري. تتميز بالتعاون الأكاديمي والبحث العلمي.',
        establishedYear: 1998,
        services: [
          'تسجيل الأطباء البيطريين',
          'إصدار التراخيص المهنية',
          'البحث العلمي',
          'التعاون الأكاديمي',
          'التدريب المتقدم',
          'الاستشارات التخصصية'
        ],
        announcements: [
          {
            id: '1',
            title: 'مشروع بحثي مشترك مع الجامعة',
            content: 'تعلن النقابة عن بدء مشروع بحثي مشترك مع جامعة السليمانية حول أمراض الحيوانات المحلية وطرق الوقاية منها.',
            date: '2024-12-06',
            type: 'general',
            isImportant: false
          }
        ]
      }
    };
    
    return branches[branchId as string] || branches['1'];
  };
  
  const branch = getBranchData(id as string);

  const handleFollowToggle = async () => {
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    
    if (newFollowingState) {
      // Send notification to user about following
      await sendNotification({
        userId: 'current-user-id', // In real app, get from user context
        type: 'medical_record',
        title: 'متابعة النقابة',
        message: `تم تفعيل متابعة ${branch.name}. ستصلك إشعارات بجميع الإعلانات الجديدة.`,
        data: {
          petId: '',
          petName: '',
          clinicId: branch.id,
          clinicName: branch.name,
          recordId: '',
          actionType: 'medical_record'
        },
        status: 'pending'
      });
    }
    
    Alert.alert(
      'تم التحديث',
      newFollowingState ? 'تم تفعيل المتابعة بنجاح. ستصلك إشعارات بجميع الإعلانات الجديدة.' : 'تم إلغاء المتابعة بنجاح',
      [{ text: 'موافق' }]
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} color="#FFD700" fill="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} color="#FFD700" fill="#FFD700" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} color="#E5E7EB" />);
    }
    
    return stars;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: branch.name,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
          headerRight: () => (
            (isSuperAdmin || hasAdminAccess || (isModerator && moderatorPermissions?.sections?.includes('union-branches'))) ? (
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  onPress={() => router.push(`/add-union-announcement?branchId=${branch.id}`)}
                  style={[styles.headerButton, styles.addButton]}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => router.push(`/edit-union-branch?id=${branch.id}`)}
                  style={[styles.headerButton, styles.editButton]}
                >
                  <Edit3 size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : null
          ),
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Union Announcements - Top Priority */}
        <View style={styles.topAnnouncementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.topSectionTitle}>إعلانات النقابة</Text>
            {(isSuperAdmin || hasAdminAccess || (isModerator && moderatorPermissions?.sections?.includes('union-branches'))) && (
              <TouchableOpacity 
                onPress={() => router.push(`/add-union-announcement?branchId=${branch.id}`)}
                style={styles.addAnnouncementButton}
              >
                <Plus size={16} color={COLORS.primary} />
                <Text style={styles.addAnnouncementText}>إضافة إعلان</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.topAnnouncementsList}>
            {branch.announcements.slice(0, 2).map((announcement) => (
              <View key={announcement.id} style={styles.topAnnouncementCard}>
                <View style={styles.announcementHeader}>
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
                
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementContent}>{announcement.content}</Text>
                
                {announcement.image && (
                  <View style={styles.announcementImageContainer}>
                    <Image source={{ uri: announcement.image }} style={styles.announcementImage} />
                  </View>
                )}
                
                {announcement.link && (
                  <TouchableOpacity style={styles.announcementLink}>
                    <Link size={16} color={COLORS.primary} />
                    <Text style={styles.announcementLinkText}>
                      {announcement.linkText || 'رابط ذات صلة'}
                    </Text>
                    <ExternalLink size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
                
                <View style={styles.announcementFooter}>
                  {announcement.author && (
                    <Text style={styles.announcementAuthor}>بواسطة: {announcement.author}</Text>
                  )}
                  {announcement.views && (
                    <Text style={styles.announcementViews}>{announcement.views} مشاهدة</Text>
                  )}
                </View>
                
                {(isSuperAdmin || hasAdminAccess || (isModerator && moderatorPermissions?.sections?.includes('union-branches'))) && (
                  <View style={styles.announcementActions}>
                    <TouchableOpacity 
                      style={styles.editAnnouncementButton}
                      onPress={() => router.push(`/edit-union-announcement?branchId=${branch.id}&announcementId=${announcement.id}`)}
                    >
                      <Edit3 size={14} color={COLORS.primary} />
                      <Text style={styles.editAnnouncementText}>تعديل</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Branch Header */}
        <View style={styles.branchHeader}>
          <View style={styles.branchIcon}>
            <Building2 size={32} color={COLORS.primary} />
          </View>
          <View style={styles.branchMainInfo}>
            <Text style={styles.branchName}>{branch.name}</Text>
            <Text style={styles.branchGovernorate}>{branch.governorate}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(branch.rating)}
              </View>
              <Text style={styles.ratingText}>({branch.rating})</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.followButton,
              (isFollowing || branch.isFollowing) ? styles.followingButton : styles.notFollowingButton
            ]}
            onPress={handleFollowToggle}
          >
            {(isFollowing || branch.isFollowing) ? (
              <BellOff size={16} color={COLORS.white} />
            ) : (
              <Bell size={16} color={COLORS.primary} />
            )}
            <Text style={[
              styles.followButtonText,
              (isFollowing || branch.isFollowing) ? styles.followingText : styles.notFollowingText
            ]}>
              {(isFollowing || branch.isFollowing) ? 'متابعة' : 'متابعة'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Branch Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نبذة عن النقابة</Text>
          <Text style={styles.description}>{branch.description}</Text>
          <View style={styles.establishedInfo}>
            <Calendar size={16} color={COLORS.primary} />
            <Text style={styles.establishedText}>تأسست عام {branch.establishedYear}</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الاتصال</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <MapPin size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{branch.address}</Text>
            </View>
            
            <TouchableOpacity style={styles.contactItem}>
              <Phone size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{branch.phone}</Text>
              <ExternalLink size={16} color={COLORS.darkGray} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem}>
              <Mail size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{branch.email}</Text>
              <ExternalLink size={16} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Branch Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إحصائيات النقابة</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Users size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{branch.membersCount.toLocaleString()}</Text>
              <Text style={styles.statLabel}>عضو مسجل</Text>
            </View>
            
            <View style={styles.statCard}>
              <MessageSquare size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>{branch.announcements.length}</Text>
              <Text style={styles.statLabel}>إعلان نشط</Text>
            </View>
            
            <View style={styles.statCard}>
              <Star size={24} color="#FFD700" />
              <Text style={styles.statNumber}>{branch.rating}</Text>
              <Text style={styles.statLabel}>تقييم النقابة</Text>
            </View>
          </View>
        </View>

        {/* President Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>رئيس النقابة</Text>
          <View style={styles.presidentCard}>
            <View style={styles.presidentInfo}>
              <Text style={styles.presidentName}>{branch.president}</Text>
              <Text style={styles.presidentTitle}>رئيس نقابة الأطباء البيطريين - {branch.governorate}</Text>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الخدمات المقدمة</Text>
          <View style={styles.servicesList}>
            {branch.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <View style={styles.serviceBullet} />
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Previous Announcements and News */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الأخبار والإعلانات السابقة</Text>
            {(isSuperAdmin || hasAdminAccess || (isModerator && moderatorPermissions?.sections?.includes('union-branches'))) && (
              <TouchableOpacity 
                onPress={() => router.push(`/add-union-announcement?branchId=${branch.id}`)}
                style={styles.addAnnouncementButton}
              >
                <Plus size={16} color={COLORS.primary} />
                <Text style={styles.addAnnouncementText}>إضافة إعلان</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.announcementsList}>
            {branch.announcements.slice(2).map((announcement) => (
              <View key={announcement.id} style={styles.announcementCard}>
                <View style={styles.announcementHeader}>
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
                
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementContent}>{announcement.content}</Text>
                
                {announcement.image && (
                  <View style={styles.announcementImageContainer}>
                    <Image source={{ uri: announcement.image }} style={styles.announcementImage} />
                  </View>
                )}
                
                {announcement.link && (
                  <TouchableOpacity style={styles.announcementLink}>
                    <Link size={16} color={COLORS.primary} />
                    <Text style={styles.announcementLinkText}>
                      {announcement.linkText || 'رابط ذات صلة'}
                    </Text>
                    <ExternalLink size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
                
                <View style={styles.announcementFooter}>
                  {announcement.author && (
                    <Text style={styles.announcementAuthor}>بواسطة: {announcement.author}</Text>
                  )}
                  {announcement.views && (
                    <Text style={styles.announcementViews}>{announcement.views} مشاهدة</Text>
                  )}
                </View>
                
                {(isSuperAdmin || hasAdminAccess || (isModerator && moderatorPermissions?.sections?.includes('union-branches'))) && (
                  <View style={styles.announcementActions}>
                    <TouchableOpacity 
                      style={styles.editAnnouncementButton}
                      onPress={() => router.push(`/edit-union-announcement?branchId=${branch.id}&announcementId=${announcement.id}`)}
                    >
                      <Edit3 size={14} color={COLORS.primary} />
                      <Text style={styles.editAnnouncementText}>تعديل</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  branchHeader: {
    backgroundColor: COLORS.white,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  branchIcon: {
    marginRight: 16,
    marginTop: 4,
  },
  branchMainInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
  branchGovernorate: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    justifyContent: 'center',
    gap: 6,
  },
  followingButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  notFollowingButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  followingText: {
    color: COLORS.white,
  },
  notFollowingText: {
    color: COLORS.primary,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 8,
    padding: 20,
  },
  topAnnouncementsSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'right',
  },
  topAnnouncementsList: {
    gap: 16,
  },
  topAnnouncementCard: {
    backgroundColor: '#F0F9FF',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
  description: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 12,
  },
  establishedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  establishedText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  contactInfo: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  presidentCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  presidentInfo: {
    alignItems: 'flex-end',
  },
  presidentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
  presidentTitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  servicesList: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  serviceText: {
    fontSize: 16,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: 'right',
  },
  addAnnouncementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  addAnnouncementText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  announcementsList: {
    gap: 16,
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
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 12,
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
    flex: 1,
    textAlign: 'right',
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
  announcementActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  editAnnouncementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editAnnouncementText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  announcementImageContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  announcementImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  announcementLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  announcementLinkText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  announcementAuthor: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  announcementViews: {
    fontSize: 12,
    color: COLORS.darkGray,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});