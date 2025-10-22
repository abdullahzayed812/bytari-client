import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { useRouter } from 'expo-router';
import Button from "../../components/Button";
import { Building2, Calendar, Plus, Users, Clock, MapPin, Phone, Star } from 'lucide-react-native';

// Mock data for vet clinic
const mockClinicData = {
  id: '1',
  name: 'عيادة الدكتور محمد أحمد البيطرية',
  address: 'شارع الملك فهد، الرياض',
  phone: '+966 11 123 4567',
  rating: 4.8,
  image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  workingHours: 'السبت - الخميس: 8:00 ص - 10:00 م',
  services: ['فحص عام', 'تطعيمات', 'جراحة', 'أشعة', 'تحاليل مخبرية'],
  todayAppointments: 12,
  totalPatients: 156,
  isPremium: true
};

const mockAppointments = [
  {
    id: '1',
    petName: 'فلفل',
    ownerName: 'أحمد محمد',
    time: '09:00 ص',
    type: 'فحص عام',
    status: 'confirmed',
    petImage: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80'
  },
  {
    id: '2',
    petName: 'لولو',
    ownerName: 'فاطمة علي',
    time: '10:30 ص',
    type: 'تطعيم',
    status: 'pending',
    petImage: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'
  },
  {
    id: '3',
    petName: 'سمسم',
    ownerName: 'خالد أحمد',
    time: '02:00 م',
    type: 'جراحة',
    status: 'confirmed',
    petImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80'
  }
];

export default function VetClinicScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { user } = useApp();

  const handleAddAppointment = () => {
    router.push('/appointments');
  };

  const handleViewAllAppointments = () => {
    router.push('/appointments');
  };

  const handleEditClinic = () => {
    console.log('Edit clinic info');
    // TODO: Navigate to edit clinic page
  };

  const renderAppointmentItem = ({ item }: { item: typeof mockAppointments[0] }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'confirmed':
          return COLORS.success;
        case 'pending':
          return COLORS.warning;
        case 'cancelled':
          return COLORS.error;
        default:
          return COLORS.darkGray;
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'confirmed':
          return 'مؤكد';
        case 'pending':
          return 'في الانتظار';
        case 'cancelled':
          return 'ملغي';
        default:
          return status;
      }
    };

    return (
      <TouchableOpacity
        style={styles.appointmentCard}
        onPress={() => {
          console.log(`View appointment ${item.id}`);
          // TODO: Navigate to appointment details
        }}
      >
        <View style={[styles.appointmentContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Image source={{ uri: item.petImage }} style={styles.petImage} />
          
          <View style={[styles.appointmentDetails, { flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
            <View style={[styles.appointmentHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.petName, { textAlign: isRTL ? 'right' : 'left' }]}>
                {item.petName}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
              </View>
            </View>
            
            <Text style={[styles.ownerName, { textAlign: isRTL ? 'right' : 'left' }]}>
              المالك: {item.ownerName}
            </Text>
            
            <View style={[styles.appointmentInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.infoItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Clock size={16} color={COLORS.primary} />
                <Text style={[styles.infoText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                  {item.time}
                </Text>
              </View>
              
              <View style={[styles.infoItem, { flexDirection: isRTL ? 'row-reverse' : 'row', marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0 }]}>
                <Building2 size={16} color={COLORS.primary} />
                <Text style={[styles.infoText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                  {item.type}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mockAppointments}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Clinic Info Card */}
            <View style={styles.clinicCard}>
              <View style={[styles.clinicHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Image source={{ uri: mockClinicData.image }} style={styles.clinicImage} />
                
                <View style={[styles.clinicInfo, { flex: 1, marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0 }]}>
                  {mockClinicData.isPremium && (
                    <View style={[styles.premiumBadgeContainer, { alignSelf: isRTL ? 'flex-start' : 'flex-end' }]}>
                      <View style={styles.premiumBadge}>
                        <Star size={12} color={COLORS.white} fill={COLORS.white} />
                        <Text style={styles.premiumBadgeText}>مميز</Text>
                      </View>
                    </View>
                  )}
                  
                  <Text style={[styles.clinicName, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {mockClinicData.name}
                  </Text>
                  
                  <View style={[styles.clinicInfoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <MapPin size={16} color={COLORS.primary} />
                    <Text style={[styles.clinicInfoText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                      {mockClinicData.address}
                    </Text>
                  </View>
                  
                  <View style={[styles.clinicInfoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Phone size={16} color={COLORS.primary} />
                    <Text style={[styles.clinicInfoText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                      {mockClinicData.phone}
                    </Text>
                  </View>
                  
                  <View style={[styles.ratingRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.ratingText, { marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }]}>
                      {mockClinicData.rating}
                    </Text>
                    <Star size={16} color="#FFD700" fill="#FFD700" />
                  </View>
                </View>
              </View>
              
              <Button
                title="تعديل معلومات العيادة"
                onPress={handleEditClinic}
                type="outline"
                size="medium"
                style={styles.editButton}
              />
            </View>

            {/* Stats Cards */}
            <View style={[styles.statsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Calendar size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.statValue}>{mockClinicData.todayAppointments}</Text>
                <Text style={styles.statLabel}>مواعيد اليوم</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Users size={24} color={COLORS.success} />
                </View>
                <Text style={styles.statValue}>{mockClinicData.totalPatients}</Text>
                <Text style={styles.statLabel}>إجمالي المرضى</Text>
              </View>
            </View>

            {/* Today's Appointments Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>مواعيد اليوم</Text>
              <TouchableOpacity onPress={handleViewAllAppointments}>
                <Text style={styles.seeAllText}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Building2 size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>لا توجد مواعيد لليوم</Text>
            <Button
              title="إضافة موعد جديد"
              onPress={handleAddAppointment}
              type="primary"
              size="medium"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.emptyButton}
            />
          </View>
        }
        ListFooterComponent={
          mockAppointments.length > 0 ? (
            <Button
              title="إضافة موعد جديد"
              onPress={handleAddAppointment}
              type="primary"
              size="medium"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.addButton}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  listContent: {
    padding: 16,
  },
  clinicCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clinicHeader: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clinicImage: {
    width: 100,
    height: 80,
    borderRadius: 12,
  },
  clinicInfo: {
    justifyContent: 'flex-start',
  },
  premiumBadgeContainer: {
    marginBottom: 8,
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
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  clinicInfoRow: {
    alignItems: 'center',
    marginBottom: 6,
  },
  clinicInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  ratingRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  editButton: {
    width: '100%',
  },
  statsContainer: {
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentContent: {
    alignItems: 'flex-start',
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  appointmentDetails: {
    justifyContent: 'flex-start',
  },
  appointmentHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  ownerName: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  appointmentInfo: {
    alignItems: 'center',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginVertical: 16,
    textAlign: 'center',
  },
  emptyButton: {
    width: '100%',
  },
  addButton: {
    marginTop: 16,
    width: '100%',
  },
});