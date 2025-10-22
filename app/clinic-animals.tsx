import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, FlatList, TextInput } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Users, Phone } from 'lucide-react-native';
import { mockPets } from "../mocks/data";

export default function ClinicAnimals() {
  const router = useRouter();
  const { clinicId, clinicName } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAnimals, setFilteredAnimals] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock clinic animals data - in real app this would come from API based on clinicId
  const clinicAnimals = mockPets.map(pet => ({
    id: pet.id,
    name: pet.name,
    type: pet.type === 'cat' ? 'قط' : pet.type === 'dog' ? 'كلب' : pet.type === 'rabbit' ? 'أرنب' : pet.type === 'bird' ? 'طائر' : 'حيوان أليف',
    breed: pet.breed,
    age: `${pet.age} ${pet.age === 1 ? 'سنة' : 'سنوات'}`,
    owner: 'محمد أحمد',
    ownerPhone: '+964 770 123 4567',
    lastVisit: '10-06-2024',
    nextAppointment: '15-06-2024',
    status: Math.random() > 0.5 ? 'تحت العلاج' : Math.random() > 0.5 ? 'متعافي' : 'فحص دوري',
    image: pet.image,
    petData: pet,
    medicalHistory: [
      { date: '10-06-2024', diagnosis: 'فحص دوري', treatment: 'تطعيم سنوي' },
      { date: '05-05-2024', diagnosis: 'التهاب أذن', treatment: 'مضاد حيوي' }
    ]
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'تحت العلاج': return COLORS.warning;
      case 'متعافي': return COLORS.success;
      case 'فحص دوري': return COLORS.primary;
      default: return COLORS.darkGray;
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredAnimals([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = clinicAnimals.filter(animal => 
      animal.id.toLowerCase().includes(query.toLowerCase()) ||
      animal.name.toLowerCase().includes(query.toLowerCase()) ||
      animal.owner.toLowerCase().includes(query.toLowerCase()) ||
      animal.type.toLowerCase().includes(query.toLowerCase()) ||
      (animal.breed && animal.breed.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredAnimals(results);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredAnimals([]);
    setIsSearching(false);
  };

  const filterByStatus = (status: string) => {
    setFilterStatus(status);
    if (status === 'all') {
      setFilteredAnimals([]);
      setIsSearching(false);
    } else {
      const filtered = clinicAnimals.filter(animal => animal.status === status);
      setFilteredAnimals(filtered);
      setIsSearching(true);
    }
  };

  const handleAnimalPress = (animal: any) => {
    router.push({
      pathname: '/pet-details',
      params: {
        petId: animal.petData.id,
        fromClinic: 'true',
        clinicId: clinicId as string
      }
    });
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
        <View style={styles.ownerInfo}>
          <Text style={styles.ownerName}>المالك: {item.owner}</Text>
          <View style={styles.phoneContainer}>
            <Phone size={12} color={COLORS.darkGray} />
            <Text style={styles.ownerPhone}>{item.ownerPhone}</Text>
          </View>
        </View>
        <View style={styles.visitInfo}>
          <Text style={styles.lastVisit}>آخر زيارة: {item.lastVisit}</Text>
          <Text style={styles.nextAppointment}>الموعد القادم: {item.nextAppointment}</Text>
        </View>
        <Text style={styles.animalId}>ID: {item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  const displayData = isSearching ? filteredAnimals : clinicAnimals;
  const statusCounts = {
    all: clinicAnimals.length,
    'تحت العلاج': clinicAnimals.filter(a => a.status === 'تحت العلاج').length,
    'متعافي': clinicAnimals.filter(a => a.status === 'متعافي').length,
    'فحص دوري': clinicAnimals.filter(a => a.status === 'فحص دوري').length
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>جميع الحيوانات</Text>
            <Text style={styles.clinicNameText}>{clinicName}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Summary */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Users size={24} color={COLORS.primary} />
              <Text style={styles.statsTitle}>إحصائيات الحيوانات</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{statusCounts.all}</Text>
                <Text style={styles.statLabel}>إجمالي الحيوانات</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.warning }]}>{statusCounts['تحت العلاج']}</Text>
                <Text style={styles.statLabel}>تحت العلاج</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.success }]}>{statusCounts['متعافي']}</Text>
                <Text style={styles.statLabel}>متعافي</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.primary }]}>{statusCounts['فحص دوري']}</Text>
                <Text style={styles.statLabel}>فحص دوري</Text>
              </View>
            </View>
          </View>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <Text style={styles.sectionTitle}>البحث والتصفية</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="ابحث بالاسم، المالك، النوع أو المعرف..."
                placeholderTextColor={COLORS.darkGray}
                value={searchQuery}
                onChangeText={handleSearch}
              />
              <Search size={20} color={COLORS.darkGray} style={styles.searchIcon} />
            </View>
            
            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity 
                  style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
                  onPress={() => filterByStatus('all')}
                >
                  <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>الكل ({statusCounts.all})</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterButton, filterStatus === 'تحت العلاج' && styles.filterButtonActive]}
                  onPress={() => filterByStatus('تحت العلاج')}
                >
                  <Text style={[styles.filterText, filterStatus === 'تحت العلاج' && styles.filterTextActive]}>تحت العلاج ({statusCounts['تحت العلاج']})</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterButton, filterStatus === 'متعافي' && styles.filterButtonActive]}
                  onPress={() => filterByStatus('متعافي')}
                >
                  <Text style={[styles.filterText, filterStatus === 'متعافي' && styles.filterTextActive]}>متعافي ({statusCounts['متعافي']})</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterButton, filterStatus === 'فحص دوري' && styles.filterButtonActive]}
                  onPress={() => filterByStatus('فحص دوري')}
                >
                  <Text style={[styles.filterText, filterStatus === 'فحص دوري' && styles.filterTextActive]}>فحص دوري ({statusCounts['فحص دوري']})</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>

          {/* Results Section */}
          <View style={styles.resultsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isSearching ? 
                  (searchQuery ? `نتائج البحث (${displayData.length})` : `تصفية: ${filterStatus} (${displayData.length})`) : 
                  `جميع الحيوانات (${displayData.length})`
                }
              </Text>
              {(isSearching || searchQuery) && (
                <TouchableOpacity onPress={clearSearch}>
                  <Text style={styles.clearText}>مسح</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <FlatList
              data={displayData}
              renderItem={renderAnimalItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {isSearching ? 'لا توجد نتائج للبحث' : 'لا توجد حيوانات مسجلة'}
                  </Text>
                </View>
              }
            />
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
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  clinicNameText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
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
  statsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'right',
  },
  searchIcon: {
    marginLeft: 8,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  resultsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '600',
  },
  animalCard: {
    flexDirection: 'row-reverse',
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
  animalImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  animalInfo: {
    flex: 1,
    marginRight: 16,
  },
  animalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  animalDetails: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  animalAge: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  ownerInfo: {
    marginBottom: 6,
  },
  ownerName: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  phoneContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  ownerPhone: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  visitInfo: {
    marginBottom: 6,
  },
  lastVisit: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  nextAppointment: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },
  animalId: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});