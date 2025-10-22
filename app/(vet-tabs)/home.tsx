import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { Calendar, MessageCircle, Users, TrendingUp, Clock, Bell, MapPin, Phone, Star, Plus, Store } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Button from "../../components/Button";

export default function VetHomeScreen() {
  const { t } = useI18n();
  const { user } = useApp();
  const router = useRouter();

  // Mock clinic data for veterinarian
  const mockClinic = {
    id: 'clinic1',
    name: 'عيادة الرحمة البيطرية',
    address: 'بغداد - الكرادة - شارع الطيران',
    phone: '+964 770 123 4567',
    rating: 4.8,
    reviewsCount: 156,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    isOpen: true,
    openingHours: '8:00 ص - 10:00 م',
    services: ['فحص عام', 'تطعيمات', 'جراحة', 'أشعة'],
    isPremium: true
  };

  const quickActions = [
    {
      id: 'consultations',
      title: 'الاستشارات',
      icon: MessageCircle,
      color: COLORS.primary,
      count: '12',
      onPress: () => router.push('/consultations-list')
    },
    {
      id: 'appointments',
      title: 'المواعيد',
      icon: Calendar,
      color: COLORS.info,
      count: '8',
      onPress: () => router.push('/appointments')
    },
    {
      id: 'patients',
      title: 'المرضى',
      icon: Users,
      color: COLORS.success,
      count: '45',
      onPress: () => router.push('/vet-inquiries')
    },
    {
      id: 'earnings',
      title: 'الأرباح',
      icon: TrendingUp,
      color: COLORS.warning,
      count: '2,450 ر.س',
      onPress: () => router.push('/vet-dashboard')
    }
  ];

  const todaySchedule = [
    {
      id: '1',
      time: '09:00',
      patient: 'قطة فلافي',
      owner: 'أحمد محمد',
      type: 'فحص دوري'
    },
    {
      id: '2',
      time: '10:30',
      patient: 'كلب ماكس',
      owner: 'سارة أحمد',
      type: 'تطعيم'
    },
    {
      id: '3',
      time: '14:00',
      patient: 'أرنب لولو',
      owner: 'محمد علي',
      type: 'استشارة'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>مرحباً د. {user?.name || 'الطبيب'}</Text>
          <Text style={styles.subtitle}>لديك {todaySchedule.length} مواعيد اليوم</Text>
        </View>

        {/* Clinic Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عيادتي</Text>
          
          <TouchableOpacity
            style={styles.clinicCard}
            onPress={() => router.push('/clinic-dashboard')}
            activeOpacity={0.8}
          >
            <Image source={{ uri: mockClinic.image }} style={styles.clinicImage} />
            <View style={styles.clinicInfo}>
              <View style={styles.clinicHeader}>
                <Text style={styles.clinicName}>{mockClinic.name}</Text>
                {mockClinic.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Star size={12} color={COLORS.white} fill={COLORS.white} />
                    <Text style={styles.premiumBadgeText}>مميز</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.clinicInfoRow}>
                <MapPin size={14} color={COLORS.darkGray} />
                <Text style={styles.clinicInfoText}>{mockClinic.address}</Text>
              </View>
              
              <View style={styles.clinicInfoRow}>
                <Phone size={14} color={COLORS.darkGray} />
                <Text style={styles.clinicInfoText}>{mockClinic.phone}</Text>
              </View>
              
              <View style={styles.clinicInfoRow}>
                <Clock size={14} color={mockClinic.isOpen ? COLORS.success : COLORS.error} />
                <Text style={[styles.clinicInfoText, { color: mockClinic.isOpen ? COLORS.success : COLORS.error }]}>
                  {mockClinic.isOpen ? 'مفتوح الآن' : 'مغلق'} - {mockClinic.openingHours}
                </Text>
              </View>
              
              <View style={styles.ratingContainer}>
                <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.ratingText}>{mockClinic.rating} ({mockClinic.reviewsCount} تقييم)</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <View style={styles.clinicActions}>
            <Button
              title="إضافة عيادة جديدة"
              onPress={() => router.push('/clinic-system')}
              type="secondary"
              size="medium"
              icon={<Plus size={16} color={COLORS.primary} />}
              style={styles.actionButtonStyle}
            />
            
            <Button
              title="إضافة مذخر بيطري"
              onPress={() => router.push('/add-store')}
              type="primary"
              size="medium"
              icon={<Store size={16} color={COLORS.white} />}
              style={[styles.actionButtonStyle, styles.storeButton]}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإحصائيات السريعة</Text>
          <View style={styles.statsGrid}>
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.statCard, { borderColor: action.color }]}
                  onPress={action.onPress}
                >
                  <View style={[styles.statIcon, { backgroundColor: action.color }]}>
                    <IconComponent size={20} color={COLORS.white} />
                  </View>
                  <Text style={styles.statCount}>{action.count}</Text>
                  <Text style={styles.statTitle}>{action.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>جدول اليوم</Text>
            <TouchableOpacity onPress={() => router.push('/appointments')}>
              <Text style={styles.viewAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          
          {todaySchedule.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentTime}>
                <Clock size={16} color={COLORS.primary} />
                <Text style={styles.timeText}>{appointment.time}</Text>
              </View>
              <View style={styles.appointmentDetails}>
                <Text style={styles.patientName}>{appointment.patient}</Text>
                <Text style={styles.ownerName}>المالك: {appointment.owner}</Text>
                <Text style={styles.appointmentType}>{appointment.type}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/new-inquiry')}
          >
            <MessageCircle size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>بدء استشارة جديدة</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: COLORS.info }]}
            onPress={() => router.push('/vet-dashboard')}
          >
            <TrendingUp size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>عرض التقارير</Text>
          </TouchableOpacity>
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
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    minWidth: 80,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 5,
  },
  appointmentDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginBottom: 2,
  },
  appointmentType: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: 'right',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  clinicCard: {
    flexDirection: 'row-reverse',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  clinicImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  clinicInfo: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'center',
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
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  clinicActions: {
    gap: 12,
  },
  actionButtonStyle: {
    width: '100%',
  },
  storeButton: {
    backgroundColor: '#8B5CF6',
  },
});