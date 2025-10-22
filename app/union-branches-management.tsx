import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Building2, Plus, Edit3, Trash2, Save, X, MapPin, Phone, Mail, Users, Star } from 'lucide-react-native';

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

export default function UnionBranchesManagementScreen() {
  const { t, isRTL } = useI18n();
  const { isSuperAdmin } = useApp();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<UnionBranch | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mock data - in real app this would come from backend
  const [branches, setBranches] = useState<UnionBranch[]>([
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
    }
  ]);

  const [formData, setFormData] = useState<Partial<UnionBranch>>({
    name: '',
    governorate: '',
    region: 'central',
    address: '',
    phone: '',
    email: '',
    president: '',
    membersCount: 0,
    isFollowing: false,
    announcements: 0,
    rating: 4.0
  });

  const regions = [
    { id: 'central', name: 'المنطقة الوسطى' },
    { id: 'northern', name: 'المنطقة الشمالية' },
    { id: 'southern', name: 'المنطقة الجنوبية' },
    { id: 'kurdistan', name: 'إقليم كردستان' }
  ];

  // Redirect if not super admin
  if (!isSuperAdmin) {
    router.replace('/union-branches');
    return null;
  }

  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.governorate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBranch = () => {
    if (!formData.name || !formData.governorate || !formData.address || !formData.phone || !formData.email || !formData.president) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const newBranch: UnionBranch = {
      id: Date.now().toString(),
      name: formData.name!,
      governorate: formData.governorate!,
      region: formData.region!,
      address: formData.address!,
      phone: formData.phone!,
      email: formData.email!,
      president: formData.president!,
      membersCount: formData.membersCount || 0,
      isFollowing: false,
      announcements: 0,
      rating: formData.rating || 4.0
    };

    setBranches([...branches, newBranch]);
    setFormData({
      name: '',
      governorate: '',
      region: 'central',
      address: '',
      phone: '',
      email: '',
      president: '',
      membersCount: 0,
      isFollowing: false,
      announcements: 0,
      rating: 4.0
    });
    setShowAddModal(false);
    Alert.alert('نجح', 'تم إضافة النقابة بنجاح');
  };

  const handleEditBranch = () => {
    if (!editingBranch || !formData.name || !formData.governorate || !formData.address || !formData.phone || !formData.email || !formData.president) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const updatedBranches = branches.map(branch => 
      branch.id === editingBranch.id 
        ? { ...branch, ...formData } as UnionBranch
        : branch
    );

    setBranches(updatedBranches);
    setEditingBranch(null);
    setFormData({
      name: '',
      governorate: '',
      region: 'central',
      address: '',
      phone: '',
      email: '',
      president: '',
      membersCount: 0,
      isFollowing: false,
      announcements: 0,
      rating: 4.0
    });
    Alert.alert('نجح', 'تم تحديث النقابة بنجاح');
  };

  const handleDeleteBranch = (branchId: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذه النقابة؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setBranches(branches.filter(branch => branch.id !== branchId));
            Alert.alert('نجح', 'تم حذف النقابة بنجاح');
          }
        }
      ]
    );
  };

  const openEditModal = (branch: UnionBranch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      governorate: branch.governorate,
      region: branch.region,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      president: branch.president,
      membersCount: branch.membersCount,
      rating: branch.rating
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingBranch(null);
    setFormData({
      name: '',
      governorate: '',
      region: 'central',
      address: '',
      phone: '',
      email: '',
      president: '',
      membersCount: 0,
      isFollowing: false,
      announcements: 0,
      rating: 4.0
    });
  };

  const renderFormModal = () => (
    <Modal
      visible={showAddModal || editingBranch !== null}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingBranch ? 'تعديل النقابة' : 'إضافة نقابة جديدة'}
          </Text>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <X size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>اسم النقابة *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="مثال: نقابة الأطباء البيطريين - بغداد"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>المحافظة *</Text>
            <TextInput
              style={styles.input}
              value={formData.governorate}
              onChangeText={(text) => setFormData({ ...formData, governorate: text })}
              placeholder="مثال: بغداد"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>المنطقة *</Text>
            <View style={styles.regionSelector}>
              {regions.map((region) => (
                <TouchableOpacity
                  key={region.id}
                  style={[
                    styles.regionOption,
                    formData.region === region.id && styles.selectedRegionOption
                  ]}
                  onPress={() => setFormData({ ...formData, region: region.id as any })}
                >
                  <Text style={[
                    styles.regionOptionText,
                    formData.region === region.id && styles.selectedRegionOptionText
                  ]}>
                    {region.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>العنوان *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="العنوان الكامل للنقابة"
              placeholderTextColor={COLORS.darkGray}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>رقم الهاتف *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="+964 XXX XXX XXXX"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>البريد الإلكتروني *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="example@iraqvetunion.org"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>رئيس النقابة *</Text>
            <TextInput
              style={styles.input}
              value={formData.president}
              onChangeText={(text) => setFormData({ ...formData, president: text })}
              placeholder="د. اسم رئيس النقابة"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>عدد الأعضاء</Text>
            <TextInput
              style={styles.input}
              value={formData.membersCount?.toString()}
              onChangeText={(text) => setFormData({ ...formData, membersCount: parseInt(text) || 0 })}
              placeholder="0"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>التقييم (1-5)</Text>
            <TextInput
              style={styles.input}
              value={formData.rating?.toString()}
              onChangeText={(text) => {
                const rating = parseFloat(text) || 4.0;
                setFormData({ ...formData, rating: Math.min(5, Math.max(1, rating)) });
              }}
              placeholder="4.0"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="decimal-pad"
            />
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={closeModal}
          >
            <Text style={styles.cancelButtonText}>إلغاء</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={editingBranch ? handleEditBranch : handleAddBranch}
          >
            <Save size={20} color={COLORS.white} />
            <Text style={styles.saveButtonText}>
              {editingBranch ? 'حفظ التغييرات' : 'إضافة النقابة'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
          title: 'إدارة فروع النقابة البيطرية',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => setShowAddModal(true)}
              style={styles.addButton}
            >
              <Plus size={20} color={COLORS.white} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="البحث عن النقابات..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Building2 size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{branches.length}</Text>
            <Text style={styles.statLabel}>إجمالي النقابات</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>
              {branches.reduce((sum, branch) => sum + branch.membersCount, 0)}
            </Text>
            <Text style={styles.statLabel}>إجمالي الأعضاء</Text>
          </View>
        </View>

        {/* Branches List */}
        <View style={styles.branchesSection}>
          <Text style={styles.sectionTitle}>
            النقابات المسجلة ({filteredBranches.length})
          </Text>
          
          {filteredBranches.map((branch) => (
            <View key={branch.id} style={styles.branchCard}>
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
                <View style={styles.branchActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => openEditModal(branch)}
                  >
                    <Edit3 size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDeleteBranch(branch.id)}
                  >
                    <Trash2 size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
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
              </View>
            </View>
          ))}
        </View>

        {filteredBranches.length === 0 && (
          <View style={styles.emptyState}>
            <Building2 size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyStateTitle}>لا توجد نقابات</Text>
            <Text style={styles.emptyStateText}>لم يتم العثور على نقابات تطابق البحث المحدد</Text>
          </View>
        )}
      </ScrollView>

      {renderFormModal()}
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
  addButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: COLORS.success || '#28a745',
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'right',
  },
  statsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: 'center',
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
  branchActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    backgroundColor: '#E3F2FD',
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE',
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  regionSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regionOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: COLORS.white,
  },
  selectedRegionOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  regionOptionText: {
    fontSize: 14,
    color: COLORS.black,
  },
  selectedRegionOptionText: {
    color: COLORS.white,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});