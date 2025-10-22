import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";

import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star,
  Building2,
  Users,
  Bell,
  Edit,
  Heart,
  Award,
  Calendar,
  FileText,
  Megaphone,
  Plus
} from 'lucide-react-native';
import { useApp } from "../providers/AppProvider";
import { usePermissions } from "../lib/permissions";

interface Hospital {
  id: string;
  name: string;
  location: string;
  phone: string;
  rating: number;
  image: string;
  isMain?: boolean;
  province?: string;
  specialties: string[];
  workingHours: string;
  description: string;
  followersCount: number;
  announcementsCount: number;
}

export default function HospitalDetailsScreen() {

  const { isSuperAdmin, isModerator } = useApp();
  const { canAccessHospital } = usePermissions();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isFollowed, setIsFollowed] = useState(false);

  // Mock hospital data
  const hospital: Hospital = {
    id: id as string,
    name: 'المستشفى البيطري المركزي - بغداد',
    location: 'بغداد - الكرادة',
    phone: '+964 770 123 4567',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400',
    isMain: true,
    specialties: ['جراحة', 'طب داخلي', 'أشعة', 'مختبرات', 'طوارئ'],
    workingHours: '24 ساعة',
    description: 'المستشفى البيطري المركزي الرئيسي في العراق، يقدم خدمات طبية متكاملة للحيوانات مع فريق من أمهر الأطباء البيطريين وأحدث التقنيات الطبية.',
    followersCount: 1250,
    announcementsCount: 15
  };

  const handleFollow = () => {
    setIsFollowed(!isFollowed);
  };

  const handleEdit = () => {
    router.push(`/edit-hospital?id=${hospital.id}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'تفاصيل المستشفى',
          headerStyle: { backgroundColor: '#0EA5E9' },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => {
            // Only super admin or hospital-specific moderator can edit
            const canManageHospital = isSuperAdmin || (isModerator && canAccessHospital(hospital.id));
            
            return canManageHospital ? (
              <TouchableOpacity 
                onPress={() => {
                  router.push(`/edit-hospital?id=${hospital.id}`);
                }} 
                style={styles.headerButton}
              >
                <Edit size={20} color={COLORS.white} />
              </TouchableOpacity>
            ) : null;
          },
        }} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hospital Announcements - Moved to top */}
        <View style={styles.announcementsSection}>
          <View style={styles.announcementHeader}>
            <Text style={styles.sectionTitle}>إعلانات المستشفى</Text>
            {(isSuperAdmin || (isModerator && canAccessHospital(hospital.id))) && (
              <TouchableOpacity 
                onPress={() => {
                  router.push(`/add-hospital-announcement?hospitalId=${hospital.id}`);
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
              <Megaphone size={24} color='#0EA5E9' />
            </View>
            <View style={styles.announcementContent}>
              <Text style={styles.announcementTitle}>إعلان مهم من المستشفى</Text>
              <Text style={styles.announcementText}>
                {hospital.isMain 
                  ? 'تعلن المستشفى البيطري المركزي عن إطلاق حملة تطعيم مجانية لجميع الحيوانات الأليفة خلال شهر مارس الحالي مع فحص شامل مجاني.'
                  : `تعلن ${hospital.name} عن توفر خدمات طبية متطورة وفحوصات شاملة للحيوانات الأليفة بأسعار مدعومة.`
                }
              </Text>
              <Text style={styles.announcementDate}>تاريخ النشر: 2024-03-01</Text>
            </View>
          </View>
        </View>

        <View style={[styles.hospitalCard, hospital.isMain && styles.mainHospitalCard]}>
          <Image source={{ uri: hospital.image }} style={styles.hospitalImage} />
          
          <View style={styles.hospitalInfo}>
            <View style={styles.hospitalHeader}>
              <Text style={[styles.hospitalName, hospital.isMain && styles.mainHospitalName]}>
                {hospital.name}
              </Text>
              {hospital.isMain && (
                <View style={styles.mainBadge}>
                  <Award size={16} color={COLORS.white} />
                  <Text style={styles.mainBadgeText}>رئيسي</Text>
                </View>
              )}
            </View>
            
            <View style={styles.hospitalDetails}>
              <View style={styles.detailRow}>
                <MapPin size={18} color="#0EA5E9" />
                <Text style={styles.detailText}>{hospital.location}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Phone size={18} color="#0EA5E9" />
                <Text style={styles.detailText}>{hospital.phone}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Clock size={18} color="#0EA5E9" />
                <Text style={styles.detailText}>{hospital.workingHours}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Star size={18} color="#F59E0B" />
                <Text style={styles.detailText}>{hospital.rating} ⭐</Text>
              </View>
            </View>
            
            <Text style={styles.hospitalDescription}>{hospital.description}</Text>
            
            <View style={styles.specialtiesContainer}>
              <Text style={styles.specialtiesTitle}>التخصصات:</Text>
              <View style={styles.specialtiesList}>
                {hospital.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyBadge}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Users size={20} color="#10B981" />
                <Text style={styles.statNumber}>{hospital.followersCount}</Text>
                <Text style={styles.statLabel}>متابع</Text>
              </View>
              
              <View style={styles.statItem}>
                <FileText size={20} color="#0EA5E9" />
                <Text style={styles.statNumber}>{hospital.announcementsCount}</Text>
                <Text style={styles.statLabel}>إعلان</Text>
              </View>
              
              <View style={styles.statItem}>
                <Calendar size={20} color="#F59E0B" />
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>خدمة</Text>
              </View>
            </View>
            
            <View style={styles.hospitalActions}>
              <TouchableOpacity 
                style={[styles.followButton, isFollowed && styles.followedButton]}
                onPress={handleFollow}
              >
                <Heart size={18} color={isFollowed ? "#0EA5E9" : COLORS.white} fill={isFollowed ? "#0EA5E9" : "none"} />
                <Text style={[styles.followButtonText, isFollowed && styles.followedButtonText]}>
                  {isFollowed ? 'متابع' : 'متابعة'}
                </Text>
              </TouchableOpacity>
              
              {(isSuperAdmin || (isModerator && canAccessHospital(hospital.id))) && (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={handleEdit}
                >
                  <Edit size={18} color={COLORS.white} />
                  <Text style={styles.editButtonText}>تعديل</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.notificationButton}>
                <Bell size={18} color={COLORS.white} />
                <Text style={styles.notificationButtonText}>إشعارات</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>



        <View style={styles.additionalInfo}>
          <Text style={styles.sectionTitle}>معلومات إضافية</Text>
          
          <View style={styles.infoCard}>
            <Building2 size={24} color="#0EA5E9" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>نوع المستشفى</Text>
              <Text style={styles.infoDescription}>
                {hospital.isMain ? 'مستشفى مركزي رئيسي' : 'مستشفى محافظة'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <Users size={24} color="#10B981" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>الفريق الطبي</Text>
              <Text style={styles.infoDescription}>
                فريق من الأطباء البيطريين المتخصصين والمساعدين المدربين
              </Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <Star size={24} color="#F59E0B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>التقييم</Text>
              <Text style={styles.infoDescription}>
                تقييم ممتاز من المراجعين ({hospital.rating}/5.0)
              </Text>
            </View>
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
  headerButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  hospitalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  mainHospitalCard: {
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  hospitalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  hospitalInfo: {
    padding: 20,
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  mainHospitalName: {
    color: '#0EA5E9',
  },
  mainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  mainBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  hospitalDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  detailText: {
    fontSize: 16,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: 'right',
  },
  hospitalDescription: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'right',
  },
  specialtiesContainer: {
    marginBottom: 20,
  },
  specialtiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  specialtyText: {
    color: '#0EA5E9',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  hospitalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  followedButton: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  followButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  followedButtonText: {
    color: '#0EA5E9',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  notificationButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  additionalInfo: {
    gap: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
  infoDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
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
    backgroundColor: '#0EA5E9',
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
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
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
    color: '#0EA5E9',
    fontWeight: '600',
    textAlign: 'right',
  },
});