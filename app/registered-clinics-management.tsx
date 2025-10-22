import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from "../constants/colors";
import { Edit3, Eye, EyeOff, Trash2, Star, MapPin, Phone, Settings } from 'lucide-react-native';
import { useApp } from "../providers/AppProvider";
import { trpc } from "../lib/trpc";

type RegisteredClinic = {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  email?: string | null;
  images: string[];
  rating: number | null;
  services: string[];
  workingHours: any;
  isActive: boolean;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  ownerId?: number;
  ownerName?: string;
};

export default function RegisteredClinicsManagementScreen() {
  const router = useRouter();
  const { isSuperAdmin } = useApp();
  const [clinics, setClinics] = useState<RegisteredClinic[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch registered clinics from database
  const clinicsQuery = trpc.clinics.getActiveList.useQuery({
    limit: 100,
    offset: 0,
    search: '',
    city: '',
    country: ''
  });
  
  // Debug logging
  if (clinicsQuery.error) {
    console.error('Registered Clinics Query Error:', clinicsQuery.error);
  }
  if (clinicsQuery.data) {
    console.log('Registered clinics loaded successfully:', clinicsQuery.data.clinics?.length || 0, 'clinics');
  }
  
  useEffect(() => {
    if (clinicsQuery.data) {
      console.log('Registered clinics data received:', clinicsQuery.data);
      setClinics(clinicsQuery.data.clinics || []);
      setLoading(false);
    }
    if (clinicsQuery.error) {
      console.error('Error fetching registered clinics:', clinicsQuery.error);
      setLoading(false);
    }
    if (clinicsQuery.isLoading) {
      console.log('Loading registered clinics...');
    }
  }, [clinicsQuery.data, clinicsQuery.error, clinicsQuery.isLoading]);

  // Add fallback mock data if no data from server or if empty
  useEffect(() => {
    if (!clinicsQuery.isLoading && (!clinicsQuery.data || clinicsQuery.data.clinics.length === 0)) {
      console.log('No registered clinics data from server or empty, using mock data');
      const mockRegisteredClinics: RegisteredClinic[] = [
        {
          id: 101,
          name: 'عيادة د. أحمد البيطرية',
          address: 'بغداد - الجادرية - شارع الجامعة',
          phone: '+964 770 111 2222',
          email: 'dr.ahmed@vet-clinic.com',
          images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'],
          rating: 4.9,
          services: ['فحص عام', 'تطعيمات', 'جراحة', 'أشعة'],
          workingHours: {
            saturday: '8:00 AM - 8:00 PM',
            sunday: '8:00 AM - 8:00 PM',
            monday: '8:00 AM - 8:00 PM',
            tuesday: '8:00 AM - 8:00 PM',
            wednesday: '8:00 AM - 8:00 PM',
            thursday: '8:00 AM - 8:00 PM',
            friday: '2:00 PM - 6:00 PM'
          },
          isActive: true,
          ownerId: 1,
          ownerName: 'د. أحمد محمد'
        },
        {
          id: 102,
          name: 'مركز الشفاء البيطري',
          address: 'البصرة - الزبير - شارع الصناعة',
          phone: '+964 770 333 4444',
          email: 'info@shifa-vet.com',
          images: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400'],
          rating: 4.7,
          services: ['طوارئ', 'جراحة متقدمة', 'تحاليل مخبرية'],
          workingHours: {
            saturday: '24 Hours',
            sunday: '24 Hours',
            monday: '24 Hours',
            tuesday: '24 Hours',
            wednesday: '24 Hours',
            thursday: '24 Hours',
            friday: '24 Hours'
          },
          isActive: true,
          ownerId: 2,
          ownerName: 'د. فاطمة علي'
        },
        {
          id: 103,
          name: 'عيادة النجف المتخصصة',
          address: 'النجف - المدينة الصناعية - شارع الكوفة',
          phone: '+964 770 555 6666',
          email: 'najaf.specialized@gmail.com',
          images: ['https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400'],
          rating: 4.8,
          services: ['علاج الماشية', 'تلقيح صناعي', 'فحص الحمل'],
          workingHours: {
            saturday: '7:00 AM - 7:00 PM',
            sunday: '7:00 AM - 7:00 PM',
            monday: '7:00 AM - 7:00 PM',
            tuesday: '7:00 AM - 7:00 PM',
            wednesday: '7:00 AM - 7:00 PM',
            thursday: '7:00 AM - 7:00 PM',
            friday: 'Closed'
          },
          isActive: true,
          ownerId: 3,
          ownerName: 'د. حسن كريم'
        },
        {
          id: 104,
          name: 'مستشفى كربلاء البيطري',
          address: 'كربلاء - حي الحسين - شارع الإمام علي',
          phone: '+964 770 777 8888',
          email: 'karbala.vet.hospital@yahoo.com',
          images: ['https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400'],
          rating: 4.6,
          services: ['جراحة العظام', 'طب العيون البيطري', 'العلاج الطبيعي'],
          workingHours: {
            saturday: '8:00 AM - 10:00 PM',
            sunday: '8:00 AM - 10:00 PM',
            monday: '8:00 AM - 10:00 PM',
            tuesday: '8:00 AM - 10:00 PM',
            wednesday: '8:00 AM - 10:00 PM',
            thursday: '8:00 AM - 10:00 PM',
            friday: '2:00 PM - 8:00 PM'
          },
          isActive: true,
          ownerId: 4,
          ownerName: 'د. زينب حسين'
        }
      ];
      setClinics(mockRegisteredClinics);
      setLoading(false);
    }
  }, [clinicsQuery.isLoading, clinicsQuery.data, clinicsQuery.error]);

  const handleDeleteClinic = (clinicId: number) => {
    Alert.alert(
      'حذف العيادة المسجلة',
      'هل أنت متأكد من حذف هذه العيادة المسجلة؟ سيتم إزالتها من قائمة العيادات المتواجدة.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setClinics(prevClinics => prevClinics.filter(clinic => clinic.id !== clinicId));
          }
        }
      ]
    );
  };

  const handleEditRegisteredClinic = (clinicId: number) => {
    router.push({ pathname: '/edit-clinic', params: { id: clinicId.toString(), type: 'registered' } });
  };

  const handleToggleClinicStatus = (clinicId: number) => {
    setClinics(prevClinics => 
      prevClinics.map(clinic => 
        clinic.id === clinicId 
          ? { ...clinic, isActive: !clinic.isActive }
          : clinic
      )
    );
  };

  const renderRegisteredClinicCard = (clinic: RegisteredClinic) => {
    const clinicImage = clinic.images && clinic.images.length > 0 
      ? clinic.images[0] 
      : 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
    
    return (
      <TouchableOpacity 
        key={clinic.id} 
        style={[styles.clinicCard, !clinic.isActive && styles.inactiveClinicCard]}
        onPress={() => router.push({ pathname: '/clinic-profile', params: { id: clinic.id.toString() } })}
      >
        <View style={styles.clinicCardContent}>
          <Image source={{ uri: clinicImage }} style={styles.clinicImage} />
          
          <View style={styles.clinicDetails}>
            <View style={styles.clinicHeader}>
              <Text style={styles.clinicName}>{clinic.name}</Text>
              <View style={styles.badgeContainer}>
                {!clinic.isActive && (
                  <View style={styles.inactiveBadge}>
                    <EyeOff size={12} color={COLORS.white} />
                    <Text style={styles.inactiveBadgeText}>معطل</Text>
                  </View>
                )}
                {(clinic.rating || 0) >= 4.5 && clinic.isActive && (
                  <View style={styles.premiumBadge}>
                    <Star size={12} color={COLORS.white} fill={COLORS.white} />
                    <Text style={styles.premiumBadgeText}>مميز</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.clinicInfoRow}>
              <MapPin size={14} color={COLORS.darkGray} />
              <Text style={styles.clinicInfoText} numberOfLines={2}>{clinic.address}</Text>
            </View>
            
            {clinic.phone && (
              <View style={styles.clinicInfoRow}>
                <Phone size={14} color={COLORS.darkGray} />
                <Text style={styles.clinicInfoText}>{clinic.phone}</Text>
              </View>
            )}
            
            {clinic.ownerName && (
              <View style={styles.clinicInfoRow}>
                <Settings size={14} color={COLORS.darkGray} />
                <Text style={styles.clinicInfoText}>المالك: {clinic.ownerName}</Text>
              </View>
            )}
            
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{clinic.rating?.toFixed(1) || '0.0'}</Text>
            </View>
          </View>
        </View>
        
        {isSuperAdmin && (
          <View style={styles.clinicActions}>
            <TouchableOpacity
              style={[styles.actionButton, clinic.isActive ? styles.deactivateButton : styles.activateButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleToggleClinicStatus(clinic.id);
              }}
            >
              {clinic.isActive ? (
                <>
                  <EyeOff size={16} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>إخفاء</Text>
                </>
              ) : (
                <>
                  <Eye size={16} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>إظهار</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleEditRegisteredClinic(clinic.id);
              }}
            >
              <Edit3 size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>تعديل</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteClinic(clinic.id);
              }}
            >
              <Trash2 size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>حذف</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إدارة العيادات المسجلة',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>إدارة العيادات المسجلة</Text>
          <Text style={styles.headerSubtitle}>
            إدارة جميع العيادات البيطرية المسجلة من قبل الأطباء البيطريين
          </Text>
        </View>
        
        {/* Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{clinics.filter(c => c.isActive).length}</Text>
            <Text style={styles.statLabel}>عيادات نشطة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{clinics.filter(c => !c.isActive).length}</Text>
            <Text style={styles.statLabel}>عيادات معطلة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{clinics.length}</Text>
            <Text style={styles.statLabel}>إجمالي العيادات</Text>
          </View>
        </View>
        
        {/* Registered Clinics List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            العيادات المسجلة ({clinics.length})
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>جاري تحميل العيادات المسجلة...</Text>
            </View>
          ) : clinics.length > 0 ? (
            clinics.map(clinic => renderRegisteredClinicCard(clinic))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد عيادات مسجلة</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 15,
  },
  clinicCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveClinicCard: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  clinicCardContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  clinicImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  clinicDetails: {
    flex: 1,
    marginRight: 16,
  },
  clinicHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  premiumBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  premiumBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  inactiveBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inactiveBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  clinicInfoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  clinicInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  ratingContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  clinicActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  activateButton: {
    backgroundColor: COLORS.success,
  },
  deactivateButton: {
    backgroundColor: COLORS.warning,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 10,
  },
});