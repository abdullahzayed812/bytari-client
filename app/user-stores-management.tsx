import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Store, 
  Heart, 
  MapPin, 
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  DollarSign,
  Star
} from 'lucide-react-native';
import { COLORS } from "../constants/colors";

interface UserStore {
  id: number;
  name: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  address: string;
  city: string;
  status: 'active' | 'pending' | 'suspended';
  productsCount: number;
  totalSales: number;
  rating: number;
  joinDate: string;
  lastActive: string;
  categories: string[];
  verified: boolean;
}

export default function UserStoresManagementScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<UserStore | null>(null);

  // Mock data for user stores
  const mockUserStores: UserStore[] = [
    {
      id: 1,
      name: 'متجر أصدقاء الحيوانات',
      ownerName: 'علي محمد الجبوري',
      ownerEmail: 'ali.aljabouri@petfriends.com',
      phone: '+964 770 111 2222',
      address: 'شارع الأميرات، حي الكرادة',
      city: 'بغداد',
      status: 'active',
      productsCount: 156,
      totalSales: 8750000,
      rating: 4.5,
      joinDate: '2023-03-10',
      lastActive: '2024-01-20',
      categories: ['طعام القطط', 'طعام الكلاب', 'ألعاب', 'إكسسوارات'],
      verified: true,
    },
    {
      id: 2,
      name: 'عالم الحيوانات الأليفة',
      ownerName: 'نور الهدى الموسوي',
      ownerEmail: 'noor@petworld.com',
      phone: '+964 771 222 3333',
      address: 'شارع الجامعة، حي الجادرية',
      city: 'بغداد',
      status: 'pending',
      productsCount: 89,
      totalSales: 3200000,
      rating: 4.2,
      joinDate: '2023-12-05',
      lastActive: '2024-01-19',
      categories: ['أقفاص', 'مساكن', 'منتجات العناية'],
      verified: false,
    },
    {
      id: 3,
      name: 'متجر الحب للحيوانات',
      ownerName: 'حسام الدين العراقي',
      ownerEmail: 'hussam@loveforpets.com',
      phone: '+964 772 333 4444',
      address: 'شارع الحبيبية، مركز المدينة',
      city: 'البصرة',
      status: 'active',
      productsCount: 203,
      totalSales: 12400000,
      rating: 4.7,
      joinDate: '2022-11-20',
      lastActive: '2024-01-20',
      categories: ['طعام متنوع', 'ألعاب تفاعلية', 'منتجات صحية', 'إكسسوارات فاخرة'],
      verified: true,
    },
    {
      id: 4,
      name: 'بيت الحيوانات السعيدة',
      ownerName: 'زينب أحمد الكربلائي',
      ownerEmail: 'zainab@happypets.com',
      phone: '+964 773 444 5555',
      address: 'شارع الإمام الحسين، كربلاء المقدسة',
      city: 'كربلاء',
      status: 'suspended',
      productsCount: 67,
      totalSales: 1800000,
      rating: 3.9,
      joinDate: '2023-08-15',
      lastActive: '2024-01-05',
      categories: ['طعام اقتصادي', 'ألعاب بسيطة'],
      verified: false,
    },
    {
      id: 5,
      name: 'مملكة الحيوانات الأليفة',
      ownerName: 'محمد عبد الله النجفي',
      ownerEmail: 'mohammed@petkingdom.com',
      phone: '+964 774 555 6666',
      address: 'شارع الصادق، النجف الأشرف',
      city: 'النجف',
      status: 'active',
      productsCount: 312,
      totalSales: 18900000,
      rating: 4.8,
      joinDate: '2022-06-30',
      lastActive: '2024-01-20',
      categories: ['جميع فئات المنتجات', 'منتجات مستوردة', 'علامات تجارية عالمية'],
      verified: true,
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'suspended': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'pending': return 'في الانتظار';
      case 'suspended': return 'معلق';
      default: return 'غير محدد';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} color="#4CAF50" />;
      case 'pending': return <Clock size={16} color="#FF9800" />;
      case 'suspended': return <XCircle size={16} color="#F44336" />;
      default: return null;
    }
  };

  const filteredStores = mockUserStores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || store.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleStoreAction = (action: string, store: UserStore) => {
    console.log(`${action} store:`, store.name);
    
    switch (action) {
      case 'view':
        setSelectedStore(store);
        setShowStoreModal(true);
        break;
      case 'edit':
        router.push(`/edit-user-store?id=${store.id}`);
        break;
      case 'activate':
        Alert.alert(
          'تفعيل المتجر',
          `هل تريد تفعيل متجر "${store.name}"؟`,
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'تفعيل', onPress: () => console.log('Store activated') }
          ]
        );
        break;
      case 'suspend':
        Alert.alert(
          'تعليق المتجر',
          `هل تريد تعليق متجر "${store.name}"؟`,
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'تعليق', style: 'destructive', onPress: () => console.log('Store suspended') }
          ]
        );
        break;
      case 'delete':
        Alert.alert(
          'حذف المتجر',
          `هل تريد حذف متجر "${store.name}" نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`,
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'حذف', style: 'destructive', onPress: () => console.log('Store deleted') }
          ]
        );
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderStoreCard = (store: UserStore) => (
    <View key={store.id} style={styles.storeCard}>
      <View style={styles.storeHeader}>
        <View style={styles.storeInfo}>
          <View style={styles.storeTitleRow}>
            <Text style={styles.storeName}>{store.name}</Text>
            {store.verified && (
              <View style={styles.verifiedBadge}>
                <CheckCircle size={16} color="#4CAF50" />
              </View>
            )}
          </View>
          <Text style={styles.storeOwner}>المالك: {store.ownerName}</Text>
          <View style={styles.storeLocation}>
            <MapPin size={14} color={COLORS.darkGray} />
            <Text style={styles.locationText}>{store.address}, {store.city}</Text>
          </View>
        </View>
        <View style={styles.storeStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(store.status) }]}>
            {getStatusIcon(store.status)}
            <Text style={styles.statusText}>{getStatusText(store.status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.storeStats}>
        <View style={styles.statItem}>
          <Package size={16} color={COLORS.primary} />
          <Text style={styles.statValue}>{store.productsCount}</Text>
          <Text style={styles.statLabel}>منتج</Text>
        </View>
        <View style={styles.statItem}>
          <DollarSign size={16} color={COLORS.primary} />
          <Text style={styles.statValue}>{formatCurrency(store.totalSales)}</Text>
          <Text style={styles.statLabel}>إجمالي المبيعات</Text>
        </View>
        <View style={styles.statItem}>
          <Star size={16} color={COLORS.primary} />
          <Text style={styles.ratingValue}>{store.rating}</Text>
          <Text style={styles.statLabel}>التقييم</Text>
        </View>
      </View>

      <View style={styles.storeCategories}>
        <Text style={styles.categoriesTitle}>الفئات:</Text>
        <View style={styles.categoriesList}>
          {store.categories.map((category, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.storeActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleStoreAction('view', store)}
        >
          <Eye size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>عرض</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleStoreAction('edit', store)}
        >
          <Edit3 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>تعديل</Text>
        </TouchableOpacity>

        {store.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.activateButton]}
            onPress={() => handleStoreAction('activate', store)}
          >
            <CheckCircle size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>تفعيل</Text>
          </TouchableOpacity>
        )}

        {store.status === 'active' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.suspendButton]}
            onPress={() => handleStoreAction('suspend', store)}
          >
            <XCircle size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>تعليق</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleStoreAction('delete', store)}
        >
          <Trash2 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>حذف</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStoreModal = () => (
    <Modal visible={showStoreModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedStore && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>تفاصيل المتجر</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowStoreModal(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>معلومات أساسية</Text>
                  <Text style={styles.modalText}>الاسم: {selectedStore.name}</Text>
                  <Text style={styles.modalText}>المالك: {selectedStore.ownerName}</Text>
                  <Text style={styles.modalText}>البريد الإلكتروني: {selectedStore.ownerEmail}</Text>
                  <Text style={styles.modalText}>الهاتف: {selectedStore.phone}</Text>
                  <Text style={styles.modalText}>العنوان: {selectedStore.address}</Text>
                  <Text style={styles.modalText}>المدينة: {selectedStore.city}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>الإحصائيات</Text>
                  <Text style={styles.modalText}>عدد المنتجات: {selectedStore.productsCount}</Text>
                  <Text style={styles.modalText}>إجمالي المبيعات: {formatCurrency(selectedStore.totalSales)}</Text>
                  <Text style={styles.modalText}>التقييم: {selectedStore.rating} ⭐</Text>
                  <Text style={styles.modalText}>تاريخ الانضمام: {selectedStore.joinDate}</Text>
                  <Text style={styles.modalText}>آخر نشاط: {selectedStore.lastActive}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>الفئات</Text>
                  {selectedStore.categories.map((category, index) => (
                    <Text key={index} style={styles.modalText}>• {category}</Text>
                  ))}
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'إدارة متاجر أصحاب الحيوانات',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' as const }
        }} 
      />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>متاجر أصحاب الحيوانات</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في المتاجر..."
              placeholderTextColor={COLORS.darkGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: 'الكل' },
              { key: 'active', label: 'نشط' },
              { key: 'pending', label: 'في الانتظار' },
              { key: 'suspended', label: 'معلق' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.activeFilterButton
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter.key && styles.activeFilterButtonText
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Store size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{mockUserStores.length}</Text>
            <Text style={styles.statLabel}>إجمالي المتاجر</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{mockUserStores.filter(s => s.status === 'active').length}</Text>
            <Text style={styles.statLabel}>متاجر نشطة</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={24} color="#FF9800" />
            <Text style={styles.statNumber}>{mockUserStores.filter(s => s.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>في الانتظار</Text>
          </View>
        </View>

        {/* Stores List */}
        <ScrollView style={styles.storesList} showsVerticalScrollIndicator={false}>
          {filteredStores.length > 0 ? (
            filteredStores.map(renderStoreCard)
          ) : (
            <View style={styles.emptyState}>
              <Heart size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>لا توجد متاجر تطابق البحث</Text>
            </View>
          )}
        </ScrollView>

        {/* Add Store Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-user-store')}
        >
          <Plus size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>إضافة متجر جديد</Text>
        </TouchableOpacity>

        {renderStoreModal()}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'right',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  activeFilterButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 4,
  },
  storesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  storeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
  },
  verifiedBadge: {
    padding: 2,
  },
  storeOwner: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  storeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  storeStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  storeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.lightGray,
    marginVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  storeCategories: {
    marginBottom: 16,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryTag: {
    backgroundColor: '#FFE0E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  storeActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  activateButton: {
    backgroundColor: '#4CAF50',
  },
  suspendButton: {
    backgroundColor: '#FF5722',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  modalScroll: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: 'right',
  },
});