import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter } from 'expo-router';
import Button from "../components/Button";
import { User, MapPin, Phone, Building2, Users, ArrowRight, Search } from 'lucide-react-native';

// Mock data for poultry farms
const mockPoultryFarms = [
  {
    id: '1',
    name: 'مزرعة الأمل للدواجن',
    owner: 'أحمد محمد السعد',
    location: 'الرياض - حي النرجس',
    phone: '+966 50 123 4567',
    capacity: '10,000 طائر',
    type: 'دجاج بياض',
    status: 'نشط',
    hasDoctor: false
  },
  {
    id: '2',
    name: 'مزرعة النور للدواجن',
    owner: 'فاطمة علي الأحمد',
    location: 'جدة - حي الصفا',
    phone: '+966 55 987 6543',
    capacity: '15,000 طائر',
    type: 'دجاج لاحم',
    status: 'نشط',
    hasDoctor: true,
    assignedDoctor: 'د. محمد أحمد'
  },
  {
    id: '3',
    name: 'مزرعة الخير للدواجن',
    owner: 'خالد عبدالله المطيري',
    location: 'الدمام - حي الشاطئ',
    phone: '+966 56 456 7890',
    capacity: '8,000 طائر',
    type: 'دجاج بياض',
    status: 'نشط',
    hasDoctor: false
  }
];

// Mock data for available doctors
const mockDoctors = [
  {
    id: '1',
    name: 'د. محمد أحمد البيطري',
    specialization: 'طب الدواجن',
    experience: '8 سنوات',
    phone: '+966 50 111 2222',
    assignedFarms: 2
  },
  {
    id: '2',
    name: 'د. سارة علي الطبيبة',
    specialization: 'أمراض الدواجن',
    experience: '5 سنوات',
    phone: '+966 55 333 4444',
    assignedFarms: 1
  },
  {
    id: '3',
    name: 'د. عبدالرحمن خالد',
    specialization: 'تغذية الدواجن',
    experience: '10 سنوات',
    phone: '+966 56 555 6666',
    assignedFarms: 3
  }
];

export default function AssignPoultryDoctorScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { user } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  const filteredFarms = mockPoultryFarms.filter(farm => 
    farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignDoctor = () => {
    if (!selectedFarm || !selectedDoctor) {
      Alert.alert('خطأ', 'يرجى اختيار المزرعة والطبيب');
      return;
    }

    const farm = mockPoultryFarms.find(f => f.id === selectedFarm);
    const doctor = mockDoctors.find(d => d.id === selectedDoctor);

    Alert.alert(
      'تأكيد التعيين',
      `هل تريد تعيين ${doctor?.name} لإدارة ${farm?.name}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          onPress: () => {
            console.log(`Assigned doctor ${doctor?.name} to farm ${farm?.name}`);
            Alert.alert('نجح', 'تم تعيين الطبيب بنجاح');
            router.back();
          }
        }
      ]
    );
  };

  const renderFarmCard = (farm: typeof mockPoultryFarms[0]) => {
    const isSelected = selectedFarm === farm.id;
    
    return (
      <TouchableOpacity
        key={farm.id}
        style={[
          styles.farmCard,
          isSelected && styles.selectedCard,
          farm.hasDoctor && styles.assignedCard
        ]}
        onPress={() => {
          if (!farm.hasDoctor) {
            setSelectedFarm(isSelected ? null : farm.id);
          }
        }}
        disabled={farm.hasDoctor}
      >
        <View style={[styles.farmHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.farmInfo}>
            <Text style={[styles.farmName, { textAlign: isRTL ? 'right' : 'left' }]}>
              {farm.name}
            </Text>
            <View style={[styles.farmDetailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <User size={16} color={COLORS.primary} />
              <Text style={[styles.farmDetailText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                {farm.owner}
              </Text>
            </View>
            <View style={[styles.farmDetailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <MapPin size={16} color={COLORS.primary} />
              <Text style={[styles.farmDetailText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                {farm.location}
              </Text>
            </View>
            <View style={[styles.farmDetailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Building2 size={16} color={COLORS.primary} />
              <Text style={[styles.farmDetailText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                {farm.capacity} - {farm.type}
              </Text>
            </View>
          </View>
          
          {farm.hasDoctor && (
            <View style={styles.assignedBadge}>
              <Text style={styles.assignedBadgeText}>معين: {farm.assignedDoctor}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderDoctorCard = (doctor: typeof mockDoctors[0]) => {
    const isSelected = selectedDoctor === doctor.id;
    
    return (
      <TouchableOpacity
        key={doctor.id}
        style={[
          styles.doctorCard,
          isSelected && styles.selectedCard
        ]}
        onPress={() => setSelectedDoctor(isSelected ? null : doctor.id)}
      >
        <View style={[styles.doctorInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.doctorName, { textAlign: isRTL ? 'right' : 'left' }]}>
            {doctor.name}
          </Text>
          <Text style={[styles.doctorSpecialization, { textAlign: isRTL ? 'right' : 'left' }]}>
            {doctor.specialization}
          </Text>
          <View style={[styles.doctorDetailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.doctorDetailLabel}>الخبرة: </Text>
            <Text style={styles.doctorDetailText}>{doctor.experience}</Text>
          </View>
          <View style={[styles.doctorDetailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.doctorDetailLabel}>المزارع المعينة: </Text>
            <Text style={styles.doctorDetailText}>{doctor.assignedFarms}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
              placeholder="البحث في المزارع..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.darkGray}
            />
          </View>
        </View>

        {/* Farms Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            اختر المزرعة
          </Text>
          <Text style={[styles.sectionSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            المزارع المتاحة للتعيين
          </Text>
          
          {filteredFarms.map(renderFarmCard)}
        </View>

        {/* Doctors Section */}
        {selectedFarm && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              اختر الطبيب
            </Text>
            <Text style={[styles.sectionSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              الأطباء المتاحين
            </Text>
            
            {mockDoctors.map(renderDoctorCard)}
          </View>
        )}

        {/* Assign Button */}
        {selectedFarm && selectedDoctor && (
          <View style={styles.assignSection}>
            <Button
              title="تعيين الطبيب"
              onPress={handleAssignDoctor}
              type="primary"
              size="large"
              style={styles.assignButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollContent: {
    padding: 16,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchBar: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  farmCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  assignedCard: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.7,
  },
  farmHeader: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  farmInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  farmDetailRow: {
    alignItems: 'center',
    marginBottom: 6,
  },
  farmDetailText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  assignedBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  assignedBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  doctorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorInfo: {
    width: '100%',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 8,
  },
  doctorDetailRow: {
    marginBottom: 4,
  },
  doctorDetailLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  doctorDetailText: {
    fontSize: 14,
    color: COLORS.black,
  },
  assignSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  assignButton: {
    width: '100%',
  },
});