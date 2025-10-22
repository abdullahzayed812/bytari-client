import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter } from 'expo-router';
import Button from "../components/Button";
import { Search, MapPin, Calendar, MessageCircle, UserCheck, ChevronRight, Feather } from 'lucide-react-native';
import { Stack } from 'expo-router';

// Mock data for poultry farms
const mockPoultryFarms = [
  {
    id: '1',
    name: 'مزرعة الأمل للدواجن',
    ownerName: 'أحمد محمد الأحمد',
    location: 'الرياض - حي النرجس',
    farmSize: '5000 طائر',
    currentWeek: 3,
    totalWeeks: 6,
    status: 'active',
    assignedVet: null,
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80',
    phone: '+966 50 123 4567',
    createdAt: '2024-01-15',
    lastUpdate: '2024-01-20'
  },
  {
    id: '2',
    name: 'مزرعة النجاح للدواجن',
    ownerName: 'فاطمة علي السالم',
    location: 'جدة - حي الصفا',
    farmSize: '3000 طائر',
    currentWeek: 5,
    totalWeeks: 8,
    status: 'active',
    assignedVet: {
      id: 'vet1',
      name: 'د. محمد أحمد',
      specialization: 'طب الدواجن'
    },
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80',
    phone: '+966 55 987 6543',
    createdAt: '2024-01-10',
    lastUpdate: '2024-01-22'
  },
  {
    id: '3',
    name: 'مزرعة الخير للدواجن',
    ownerName: 'خالد عبدالله المطيري',
    location: 'الدمام - حي الشاطئ',
    farmSize: '7000 طائر',
    currentWeek: 2,
    totalWeeks: 6,
    status: 'active',
    assignedVet: null,
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    phone: '+966 56 456 7890',
    createdAt: '2024-01-18',
    lastUpdate: '2024-01-21'
  }
];

// Mock data for available vets
const mockVets = [
  {
    id: 'vet1',
    name: 'د. محمد أحمد البيطري',
    specialization: 'طب الدواجن',
    experience: '8 سنوات',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    phone: '+966 50 111 2222',
    assignedFarms: 2
  },
  {
    id: 'vet2',
    name: 'د. سارة علي الأحمد',
    specialization: 'طب الدواجن والطيور',
    experience: '6 سنوات',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    phone: '+966 55 333 4444',
    assignedFarms: 1
  },
  {
    id: 'vet3',
    name: 'د. عبدالله خالد المطيري',
    specialization: 'الطب البيطري العام',
    experience: '10 سنوات',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    phone: '+966 56 555 6666',
    assignedFarms: 0
  }
];

export default function AssignVetToPoultryFarmScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFarm, setSelectedFarm] = useState<typeof mockPoultryFarms[0] | null>(null);
  const [showVetSelection, setShowVetSelection] = useState<boolean>(false);

  const filteredFarms = mockPoultryFarms.filter(farm =>
    farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFarm = (farm: typeof mockPoultryFarms[0]) => {
    setSelectedFarm(farm);
    setShowVetSelection(true);
  };

  const handleAssignVet = (vet: typeof mockVets[0]) => {
    if (!selectedFarm) return;
    
    Alert.alert(
      'تأكيد التعيين',
      `هل تريد تعيين ${vet.name} لمتابعة مزرعة ${selectedFarm.name}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          onPress: () => {
            console.log(`Assigned vet ${vet.id} to farm ${selectedFarm.id}`);
            Alert.alert('تم التعيين', 'تم تعيين الطبيب بنجاح');
            setShowVetSelection(false);
            setSelectedFarm(null);
          }
        }
      ]
    );
  };

  const handleOpenChat = (farm: typeof mockPoultryFarms[0]) => {
    router.push(`/poultry-farm-chat?farmId=${farm.id}&farmName=${encodeURIComponent(farm.name)}`);
  };

  const renderFarmItem = ({ item }: { item: typeof mockPoultryFarms[0] }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active':
          return COLORS.success;
        case 'completed':
          return COLORS.primary;
        case 'inactive':
          return COLORS.darkGray;
        default:
          return COLORS.darkGray;
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'active':
          return 'نشط';
        case 'completed':
          return 'مكتمل';
        case 'inactive':
          return 'غير نشط';
        default:
          return status;
      }
    };

    return (
      <TouchableOpacity
        style={styles.farmCard}
        onPress={() => handleSelectFarm(item)}
      >
        <View style={[styles.farmContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Image source={{ uri: item.image }} style={styles.farmImage} />
          
          <View style={[styles.farmDetails, { flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
            <View style={[styles.farmHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.farmName, { textAlign: isRTL ? 'right' : 'left', flex: 1 }]}>
                {item.name}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
              </View>
            </View>
            
            <Text style={[styles.ownerName, { textAlign: isRTL ? 'right' : 'left' }]}>
              المالك: {item.ownerName}
            </Text>
            
            <View style={[styles.farmInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.infoItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <MapPin size={14} color={COLORS.primary} />
                <Text style={[styles.infoText, { marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }]}>
                  {item.location}
                </Text>
              </View>
            </View>
            
            <View style={[styles.farmInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.infoItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Feather size={14} color={COLORS.success} />
                <Text style={[styles.infoText, { marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }]}>
                  {item.farmSize}
                </Text>
              </View>
              
              <View style={[styles.infoItem, { flexDirection: isRTL ? 'row-reverse' : 'row', marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0 }]}>
                <Calendar size={14} color={COLORS.warning} />
                <Text style={[styles.infoText, { marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }]}>
                  الأسبوع {item.currentWeek}/{item.totalWeeks}
                </Text>
              </View>
            </View>
            
            {item.assignedVet && (
              <View style={[styles.assignedVetInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <UserCheck size={14} color={COLORS.primary} />
                <Text style={[styles.assignedVetText, { marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }]}>
                  الطبيب المتابع: {item.assignedVet.name}
                </Text>
              </View>
            )}
            
            <View style={[styles.actionButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => handleOpenChat(item)}
              >
                <MessageCircle size={16} color={COLORS.white} />
                <Text style={styles.chatButtonText}>رسائل</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => handleSelectFarm(item)}
              >
                <Text style={styles.detailsButtonText}>عرض التفاصيل</Text>
                <ChevronRight size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderVetItem = ({ item }: { item: typeof mockVets[0] }) => {
    return (
      <TouchableOpacity
        style={styles.vetCard}
        onPress={() => handleAssignVet(item)}
      >
        <View style={[styles.vetContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Image source={{ uri: item.image }} style={styles.vetImage} />
          
          <View style={[styles.vetDetails, { flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
            <Text style={[styles.vetName, { textAlign: isRTL ? 'right' : 'left' }]}>
              {item.name}
            </Text>
            
            <Text style={[styles.vetSpecialization, { textAlign: isRTL ? 'right' : 'left' }]}>
              {item.specialization}
            </Text>
            
            <View style={[styles.vetInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.vetExperience}>الخبرة: {item.experience}</Text>
              <Text style={[styles.vetRating, { marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0 }]}>⭐ {item.rating}</Text>
            </View>
            
            <Text style={[styles.assignedFarms, { textAlign: isRTL ? 'right' : 'left' }]}>
              المزارع المتابعة: {item.assignedFarms}
            </Text>
          </View>
          
          <View style={styles.assignIcon}>
            <UserCheck size={24} color={COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (showVetSelection && selectedFarm) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'تعيين طبيب',
            headerStyle: { backgroundColor: COLORS.white },
            headerTintColor: COLORS.black,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        
        <ScrollView contentContainerStyle={styles.content}>
          {/* Selected Farm Info */}
          <View style={styles.selectedFarmCard}>
            <Text style={styles.selectedFarmTitle}>المزرعة المختارة</Text>
            <View style={[styles.selectedFarmContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Image source={{ uri: selectedFarm.image }} style={styles.selectedFarmImage} />
              <View style={[styles.selectedFarmInfo, { flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                <Text style={[styles.selectedFarmName, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {selectedFarm.name}
                </Text>
                <Text style={[styles.selectedFarmOwner, { textAlign: isRTL ? 'right' : 'left' }]}>
                  المالك: {selectedFarm.ownerName}
                </Text>
                <Text style={[styles.selectedFarmDetails, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {selectedFarm.location} • {selectedFarm.farmSize}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Available Vets */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الأطباء المتاحون</Text>
          </View>
          
          <FlatList
            data={mockVets}
            renderItem={renderVetItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
          
          <Button
            title="إلغاء"
            onPress={() => {
              setShowVetSelection(false);
              setSelectedFarm(null);
            }}
            type="outline"
            size="medium"
            style={styles.cancelButton}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'تعيين طبيب لحقل دواجن',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Search size={20} color={COLORS.darkGray} />
          <TextInput
            style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
            placeholder="البحث عن مزرعة..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.darkGray}
          />
        </View>
      </View>
      
      {/* Farms List */}
      <FlatList
        data={filteredFarms}
        renderItem={renderFarmItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>لا توجد مزارع دواجن</Text>
          </View>
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
  content: {
    padding: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchBar: {
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  listContent: {
    padding: 16,
  },
  farmCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  farmContent: {
    alignItems: 'flex-start',
  },
  farmImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  farmDetails: {
    justifyContent: 'flex-start',
  },
  farmHeader: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  farmName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
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
  farmInfo: {
    alignItems: 'center',
    marginBottom: 4,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  assignedVetInfo: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  assignedVetText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionButtons: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  chatButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsButton: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  detailsButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedFarmCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedFarmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  selectedFarmContent: {
    alignItems: 'center',
  },
  selectedFarmImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  selectedFarmInfo: {
    justifyContent: 'center',
  },
  selectedFarmName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  selectedFarmOwner: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  selectedFarmDetails: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  vetCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vetContent: {
    alignItems: 'center',
  },
  vetImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  vetDetails: {
    justifyContent: 'center',
  },
  vetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  vetSpecialization: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 8,
  },
  vetInfo: {
    alignItems: 'center',
    marginBottom: 4,
  },
  vetExperience: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  vetRating: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  assignedFarms: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  assignIcon: {
    padding: 8,
  },
  cancelButton: {
    marginTop: 24,
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 16,
    textAlign: 'center',
  },
});