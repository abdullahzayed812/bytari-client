import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Building2, MapPin, Phone, Mail, Users, Bell, BellOff, Search, Edit3, Star } from 'lucide-react-native';

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
  announcements: number;
  rating: number;
}

export default function UnionBranchesScreen() {
  const { t, isRTL } = useI18n();
  const { isSuperAdmin } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [followingBranches, setFollowingBranches] = useState<Set<string>>(new Set());

  const branches: UnionBranch[] = [
    {
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
      announcements: 8,
      rating: 4.9
    },
    {
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
      announcements: 5,
      rating: 4.7
    },
    {
      id: '3',
      name: 'نقابة الأطباء البيطريين - أربيل',
      governorate: 'أربيل',
      region: 'kurdistan',
      address: 'منطقة عنكاوا - شارع الجامعة - مجمع النقابات المهنية',
      phone: '+964 750 345 6789',
      email: 'erbil@iraqvetunion.org',
      president: 'د. آوات محمد صالح',
      membersCount: 520,
      isFollowing: true,
      announcements: 6,
      rating: 4.8
    },
    {
      id: '4',
      name: 'نقابة الأطباء البيطريين - الموصل',
      governorate: 'نينوى',
      region: 'northern',
      address: 'الجانب الأيمن - حي الزهراء - مجمع النقابات المهنية',
      phone: '+964 790 456 7890',
      email: 'mosul@iraqvetunion.org',
      president: 'د. أحمد يوسف الطائي',
      membersCount: 420,
      isFollowing: false,
      announcements: 4,
      rating: 4.6
    },
    {
      id: '5',
      name: 'نقابة الأطباء البيطريين - النجف',
      governorate: 'النجف',
      region: 'central',
      address: 'حي الأمير - شارع الكوفة - مبنى النقابات المهنية',
      phone: '+964 760 567 8901',
      email: 'najaf@iraqvetunion.org',
      president: 'د. علي حسين الموسوي',
      membersCount: 350,
      isFollowing: true,
      announcements: 3,
      rating: 4.5
    },
    {
      id: '6',
      name: 'نقابة الأطباء البيطريين - كربلاء',
      governorate: 'كربلاء',
      region: 'central',
      address: 'حي الحسين - شارع الإمام علي - مجمع النقابات',
      phone: '+964 740 678 9012',
      email: 'karbala@iraqvetunion.org',
      president: 'د. فاطمة جواد الكربلائي',
      membersCount: 280,
      isFollowing: false,
      announcements: 2,
      rating: 4.4
    },
    {
      id: '7',
      name: 'نقابة الأطباء البيطريين - السليمانية',
      governorate: 'السليمانية',
      region: 'kurdistan',
      address: 'حي سالم - شارع الجامعة - مجمع النقابات المهنية',
      phone: '+964 770 789 0123',
      email: 'sulaymaniyah@iraqvetunion.org',
      president: 'د. شيرين عمر قادر',
      membersCount: 380,
      isFollowing: true,
      announcements: 7,
      rating: 4.7
    },
    {
      id: '8',
      name: 'نقابة الأطباء البيطريين - دهوك',
      governorate: 'دهوك',
      region: 'kurdistan',
      address: 'مركز المدينة - شارع زاخو - مبنى النقابات المهنية',
      phone: '+964 750 890 1234',
      email: 'duhok@iraqvetunion.org',
      president: 'د. بيرفان أحمد حسن',
      membersCount: 220,
      isFollowing: false,
      announcements: 4,
      rating: 4.3
    },
    {
      id: '9',
      name: 'نقابة الأطباء البيطريين - ديالى',
      governorate: 'ديالى',
      region: 'central',
      address: 'بعقوبة - حي المعلمين - شارع الجمهورية',
      phone: '+964 780 901 2345',
      email: 'diyala@iraqvetunion.org',
      president: 'د. خالد محمد الدليمي',
      membersCount: 180,
      isFollowing: false,
      announcements: 2,
      rating: 4.2
    },
    {
      id: '10',
      name: 'نقابة الأطباء البيطريين - الأنبار',
      governorate: 'الأنبار',
      region: 'central',
      address: 'الرمادي - حي الضباط - شارع الجامعة',
      phone: '+964 790 012 3456',
      email: 'anbar@iraqvetunion.org',
      president: 'د. عبدالرحمن صالح العاني',
      membersCount: 160,
      isFollowing: false,
      announcements: 1,
      rating: 4.1
    },
    {
      id: '11',
      name: 'نقابة الأطباء البيطريين - ذي قار',
      governorate: 'ذي قار',
      region: 'southern',
      address: 'الناصرية - حي الحسين - شارع الحبوبي',
      phone: '+964 760 123 4567',
      email: 'thiqar@iraqvetunion.org',
      president: 'د. حيدر عبدالله الناصري',
      membersCount: 240,
      isFollowing: false,
      announcements: 3,
      rating: 4.3
    },
    {
      id: '12',
      name: 'نقابة الأطباء البيطريين - ميسان',
      governorate: 'ميسان',
      region: 'southern',
      address: 'العمارة - حي الثورة - شارع الجمهورية',
      phone: '+964 740 234 5678',
      email: 'maysan@iraqvetunion.org',
      president: 'د. نور الهدى جاسم العامري',
      membersCount: 140,
      isFollowing: false,
      announcements: 2,
      rating: 4.0
    }
  ];

  const regions = [
    { id: 'all', name: 'جميع المناطق', color: COLORS.primary },
    { id: 'central', name: 'المنطقة الوسطى', color: '#3B82F6' },
    { id: 'northern', name: 'المنطقة الشمالية', color: '#10B981' },
    { id: 'southern', name: 'المنطقة الجنوبية', color: '#F59E0B' },
    { id: 'kurdistan', name: 'إقليم كردستان', color: '#EF4444' }
  ];

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         branch.governorate.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || branch.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleFollowToggle = (branchId: string) => {
    const newFollowing = new Set(followingBranches);
    if (newFollowing.has(branchId)) {
      newFollowing.delete(branchId);
    } else {
      newFollowing.add(branchId);
    }
    setFollowingBranches(newFollowing);
  };

  const handleBranchPress = (branch: UnionBranch) => {
    router.push(`/union-branch-details?id=${branch.id}`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={12} color="#FFD700" fill="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" size={12} color="#FFD700" fill="#FFD700" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={12} color="#E5E7EB" />);
    }
    
    return stars;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'فروع النقابة البيطرية في العراق',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            isSuperAdmin ? (
              <TouchableOpacity 
                onPress={() => router.push('/union-branches-management')}
                style={[styles.headerButton, styles.editButton]}
              >
                <Edit3 size={20} color={COLORS.white} />
              </TouchableOpacity>
            ) : null
          ),
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث عن فرع النقابة أو المحافظة..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.darkGray}
            />
          </View>
        </View>

        {/* Region Filter */}
        <View style={styles.regionsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionsList}>
            {regions.map((region) => (
              <TouchableOpacity
                key={region.id}
                style={[
                  styles.regionItem,
                  { backgroundColor: selectedRegion === region.id ? region.color : COLORS.white },
                  selectedRegion === region.id && styles.selectedRegionItem
                ]}
                onPress={() => setSelectedRegion(region.id)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.regionText,
                  { color: selectedRegion === region.id ? COLORS.white : COLORS.black }
                ]}>
                  {region.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Branches List */}
        <View style={styles.branchesSection}>
          <Text style={styles.sectionTitle}>
            النتائج ({filteredBranches.length} فرع)
          </Text>
          
          {filteredBranches.map((branch) => (
            <TouchableOpacity
              key={branch.id}
              style={styles.branchCard}
              onPress={() => handleBranchPress(branch)}
              activeOpacity={0.8}
            >
              <View style={styles.branchHeader}>
                <View style={styles.branchIcon}>
                  <Building2 size={24} color={COLORS.primary} />
                </View>
                <View style={styles.branchInfo}>
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
                  style={styles.followButton}
                  onPress={() => handleFollowToggle(branch.id)}
                >
                  {followingBranches.has(branch.id) || branch.isFollowing ? (
                    <Bell size={20} color={COLORS.primary} fill={COLORS.primary} />
                  ) : (
                    <BellOff size={20} color={COLORS.darkGray} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.branchDetails}>
                <View style={styles.detailItem}>
                  <MapPin size={16} color={COLORS.darkGray} />
                  <Text style={styles.detailText}>{branch.address}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Phone size={16} color={COLORS.darkGray} />
                  <Text style={styles.detailText}>{branch.phone}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Mail size={16} color={COLORS.darkGray} />
                  <Text style={styles.detailText}>{branch.email}</Text>
                </View>
              </View>

              <View style={styles.branchStats}>
                <View style={styles.statItem}>
                  <Users size={16} color={COLORS.primary} />
                  <Text style={styles.statText}>{branch.membersCount} عضو</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.presidentLabel}>الرئيس:</Text>
                  <Text style={styles.presidentName}>{branch.president}</Text>
                </View>
                
                {branch.announcements > 0 && (
                  <View style={styles.announcementsBadge}>
                    <Text style={styles.announcementsText}>{branch.announcements} إعلان جديد</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredBranches.length === 0 && (
          <View style={styles.emptyState}>
            <Building2 size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyStateTitle}>لا توجد فروع</Text>
            <Text style={styles.emptyStateText}>لم يتم العثور على فروع تطابق البحث المحدد</Text>
          </View>
        )}
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
  searchSection: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'right',
  },
  regionsSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  regionsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  regionItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedRegionItem: {
    borderColor: 'transparent',
  },
  regionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  branchesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  branchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  branchHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  branchIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
  branchGovernorate: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  followButton: {
    padding: 8,
  },
  branchDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: 'right',
  },
  branchStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  presidentLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  presidentName: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: '600',
  },
  announcementsBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  announcementsText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    paddingHorizontal: 32,
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