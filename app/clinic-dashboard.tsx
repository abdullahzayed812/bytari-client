import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Star, MapPin, Phone, Users, Calendar, TrendingUp, Stethoscope, Bell, Syringe, Settings, ClipboardList, Heart } from 'lucide-react-native';
import { mockPets } from "../mocks/data";
import { useApp } from "../providers/AppProvider";

export default function ClinicDashboard() {
  const router = useRouter();
  const { userClinics } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAnimals, setFilteredAnimals] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [clinicData, setClinicData] = useState<any>(null);

  // Load user's first clinic data
  useEffect(() => {
    if (userClinics && userClinics.length > 0) {
      const clinic = userClinics[0];
      setClinicData({
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        rating: clinic.rating || 4.8,
        reviewsCount: 156, // Mock data
        isPremium: clinic.isPremium || false,
        stats: {
          totalAnimals: 85, // Mock data
          activePatients: 18, // Mock data
          completedTreatments: 256 // Mock data
        },
        recentAnimals: mockPets.map(pet => ({
          id: pet.id,
          name: pet.name,
          type: pet.type === 'cat' ? 'قط' : pet.type === 'dog' ? 'كلب' : pet.type === 'rabbit' ? 'أرنب' : pet.type === 'bird' ? 'طائر' : 'حيوان أليف',
          breed: pet.breed,
          age: `${pet.age} ${pet.age === 1 ? 'سنة' : 'سنوات'}`,
          owner: 'محمد أحمد',
          lastVisit: '10-06-2024',
          status: Math.random() > 0.5 ? 'تحت العلاج' : Math.random() > 0.5 ? 'متعافي' : 'فحص دوري',
          image: pet.image,
          petData: pet
        }))
      });
    } else {
      // Fallback to mock data if no user clinics
      setClinicData({
        id: 'clinic1',
        name: 'عيادتي البيطرية',
        address: 'الموقع المسجل',
        phone: '+964 770 123 4567',
        rating: 4.8,
        reviewsCount: 156,
        isPremium: false,
        stats: {
          totalAnimals: 85,
          activePatients: 18,
          completedTreatments: 256
        },
        recentAnimals: mockPets.map(pet => ({
          id: pet.id,
          name: pet.name,
          type: pet.type === 'cat' ? 'قط' : pet.type === 'dog' ? 'كلب' : pet.type === 'rabbit' ? 'أرنب' : pet.type === 'bird' ? 'طائر' : 'حيوان أليف',
          breed: pet.breed,
          age: `${pet.age} ${pet.age === 1 ? 'سنة' : 'سنوات'}`,
          owner: 'محمد أحمد',
          lastVisit: '10-06-2024',
          status: Math.random() > 0.5 ? 'تحت العلاج' : Math.random() > 0.5 ? 'متعافي' : 'فحص دوري',
          image: pet.image,
          petData: pet
        }))
      });
    }
  }, [userClinics]);

  if (!clinicData) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل بيانات العيادة...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'تحت العلاج': return COLORS.warning;
      case 'متعافي': return COLORS.success;
      case 'فحص دوري': return COLORS.primary;
      default: return COLORS.darkGray;
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال نص للبحث');
      return;
    }

    setIsSearching(true);
    
    // Filter animals based on search query
    const results = clinicData.recentAnimals.filter((animal: any) => 
      animal.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (animal.breed && animal.breed.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setFilteredAnimals(results);
    
    if (results.length === 0) {
      Alert.alert('نتائج البحث', 'لم يتم العثور على نتائج مطابقة للبحث');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredAnimals([]);
    setIsSearching(false);
  };

  const handleReportsAndStats = () => {
    Alert.alert(
      'التقارير والإحصائيات',
      'اختر نوع التقرير المطلوب:',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تقرير شهري', onPress: () => generateMonthlyReport() },
        { text: 'إحصائيات العيادة', onPress: () => showClinicStats() },
        { text: 'تقرير الحيوانات', onPress: () => generateAnimalsReport() }
      ]
    );
  };

  const generateMonthlyReport = () => {
    Alert.alert('تقرير شهري', 'تم إنشاء التقرير الشهري بنجاح');
  };

  const showClinicStats = () => {
    Alert.alert(
      'إحصائيات العيادة',
      `إجمالي الحيوانات: ${clinicData.stats.totalAnimals}\nالمرضى النشطون: ${clinicData.stats.activePatients}\nالعلاجات المكتملة: ${clinicData.stats.completedTreatments}\nمعدل النجاح: 95%\nمتوسط الزيارات اليومية: 12`
    );
  };

  const generateAnimalsReport = () => {
    Alert.alert('تقرير الحيوانات', 'تم إنشاء تقرير الحيوانات بنجاح');
  };

  const handleAllAnimals = () => {
    // Navigate directly to clinic animals page
    router.push({
      pathname: '/clinic-animals',
      params: {
        clinicId: clinicData.id,
        clinicName: clinicData.name
      }
    });
  };

  const handleAnimalPress = (animal: any) => {
    if (animal.petData) {
      // Navigate to pet details with full pet data
      router.push({
        pathname: '/pet-details',
        params: {
          petId: animal.petData.id,
          fromClinic: 'true'
        }
      });
    } else {
      // Fallback for animals without full data
      router.push({
        pathname: '/pet-details',
        params: {
          petId: animal.id,
          petName: animal.name,
          petType: animal.type,
          petBreed: animal.breed,
          petAge: animal.age,
          ownerName: animal.owner,
          lastVisit: animal.lastVisit,
          status: animal.status,
          image: animal.image
        }
      });
    }
  };

  const renderAnimalItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.animalCard} 
      activeOpacity={0.8}
      onPress={() => handleAnimalPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.animalImage} />
      <View style={styles.animalInfo}>
        <View style={styles.animalHeader}>
          <Text style={styles.animalName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.animalDetails}>{item.type} - {item.breed}</Text>
        <Text style={styles.animalAge}>العمر: {item.age}</Text>
        <Text style={styles.ownerName}>المالك: {item.owner}</Text>
        <Text style={styles.lastVisit}>آخر زيارة: {item.lastVisit}</Text>
        <Text style={styles.animalId}>ID: {item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>لوحة العيادة</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Clinic Info Card */}
          <View style={styles.clinicCard}>
            <View style={styles.clinicHeader}>
              <View style={styles.clinicIconContainer}>
                <Stethoscope size={32} color={COLORS.white} />
              </View>
              <View style={styles.clinicInfo}>
                <View style={styles.clinicNameRow}>
                  <Text style={styles.clinicName}>{clinicData.name}</Text>
                  {clinicData.isPremium && (
                    <View style={styles.premiumBadge}>
                      <Star size={12} color={COLORS.white} fill={COLORS.white} />
                      <Text style={styles.premiumText}>Premium</Text>
                    </View>
                  )}
                </View>
                <View style={styles.clinicDetailRow}>
                  <MapPin size={14} color={COLORS.darkGray} />
                  <Text style={styles.clinicDetailText}>{clinicData.address}</Text>
                </View>
                <View style={styles.clinicDetailRow}>
                  <Phone size={14} color={COLORS.darkGray} />
                  <Text style={styles.clinicDetailText}>{clinicData.phone}</Text>
                </View>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{clinicData.stats.totalAnimals}</Text>
                <Text style={styles.statLabel}>إجمالي الحيوانات</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{clinicData.stats.activePatients}</Text>
                <Text style={styles.statLabel}>المرضى النشطون</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{clinicData.stats.completedTreatments}</Text>
                <Text style={styles.statLabel}>العلاجات المكتملة</Text>
              </View>
            </View>
          </View>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <Text style={styles.sectionTitle}>البحث عن حيوان</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="ادخل رقم ID أو اسمه أو اسم المالك"
                placeholderTextColor={COLORS.darkGray}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={handleSearch}
              >
                <Search size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Results or Recent Animals Section */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isSearching ? 'نتائج البحث' : 'الحيوانات الأخيرة'}
              </Text>
              {isSearching ? (
                <TouchableOpacity onPress={clearSearch}>
                  <Text style={styles.clearSearchText}>مسح البحث</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => handleAllAnimals()}>
                  <Text style={styles.viewAllText}>عرض الكل</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <FlatList
              data={isSearching ? filteredAnimals : clinicData.recentAnimals}
              renderItem={renderAnimalItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                isSearching ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>لا توجد نتائج للبحث</Text>
                  </View>
                ) : null
              }
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/clinic-today-cases')}>
                <ClipboardList size={24} color={COLORS.primary} />
                <Text style={styles.actionText}>حالات اليوم</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard} onPress={() => handleAllAnimals()}>
                <Users size={24} color={COLORS.success} />
                <Text style={styles.actionText}>جميع الحيوانات</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/clinic-reminders')}>
                <Bell size={24} color={COLORS.warning} />
                <Text style={styles.actionText}>تذكيرات الحيوانات</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/clinic-vaccinations')}>
                <Syringe size={24} color={COLORS.error} />
                <Text style={styles.actionText}>التطعيمات</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>إعدادات العيادة</Text>
            <View style={styles.settingsGrid}>
              <TouchableOpacity style={styles.settingCard} onPress={() => router.push('/clinic-settings')}>
                <Settings size={20} color={COLORS.primary} />
                <Text style={styles.settingText}>إعدادات عامة</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingCard} onPress={() => router.push('/clinic-vaccinations')}>
                <Syringe size={20} color={COLORS.success} />
                <Text style={styles.settingText}>إدارة التطعيمات</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingCard} onPress={() => router.push('/clinic-reminders')}>
                <Bell size={20} color={COLORS.warning} />
                <Text style={styles.settingText}>إدارة التذكيرات</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingCard} onPress={() => router.push('/clinic-followups')}>
                <Heart size={20} color={COLORS.error} />
                <Text style={styles.settingText}>المتابعات</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingCard} onPress={() => router.push('/appointments')}>
                <Calendar size={20} color={COLORS.darkGray} />
                <Text style={styles.settingText}>جدولة المواعيد</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingCard} onPress={() => handleReportsAndStats()}>
                <TrendingUp size={20} color={COLORS.primary} />
                <Text style={styles.settingText}>التقارير والإحصائيات</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  clinicCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  clinicHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
  },
  clinicIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clinicInfo: {
    flex: 1,
    marginRight: 16,
  },
  clinicNameRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  clinicName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  clinicDetailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  clinicDetailText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  statItem: {
    alignItems: 'center',
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
  searchSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'right',
  },
  searchButton: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    padding: 12,
    marginLeft: 4,
  },
  recentSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  animalCard: {
    flexDirection: 'row-reverse',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  animalInfo: {
    flex: 1,
    marginRight: 12,
  },
  animalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  animalDetails: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  animalAge: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  lastVisit: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  animalId: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  clearSearchText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 24,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  settingCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 80,
    justifyContent: 'center',
  },
  settingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: 6,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});