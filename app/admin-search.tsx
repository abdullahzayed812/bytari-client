import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, User, Heart, Building2, ShoppingBag, FileText, MessageCircle, Edit3, Ban, Trash2, X } from 'lucide-react-native';
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { trpc } from "../lib/trpc";

import { AdminTopBar } from "../components/AdminTopBar";

import Button from "../components/Button";

type SearchCategory = 'users' | 'pets' | 'clinics' | 'stores' | 'inquiries' | 'consultations' | 'all';

interface SearchResult {
  id: string;
  type: SearchCategory;
  title: string;
  subtitle: string;
  status?: string;
  details?: string;
  timestamp?: Date;
  isActive?: boolean;
  email?: string;
  phone?: string;
  userType?: string;
  ownerName?: string;
  ownerEmail?: string;
}



export default function AdminSearchScreen() {
  const router = useRouter();
  const { hasAdminAccess, isSuperAdmin } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    userType?: string;
    isActive?: boolean;
    type?: string;
    breed?: string;
    isLost?: boolean;
  }>({});

  // Fetch data from database
  const usersQuery = trpc.admin.users.listAll.useQuery({ adminId: 1 });
  const storesQuery = trpc.stores.list.useQuery();

  if (!hasAdminAccess) {
    Alert.alert('خطأ', 'ليس لديك صلاحية للوصول إلى هذه الصفحة');
    router.back();
    return null;
  }

  const categories = [
    { key: 'all' as SearchCategory, label: 'الكل', icon: Search, color: COLORS.primary },
    { key: 'users' as SearchCategory, label: 'المستخدمين', icon: User, color: COLORS.info },
    { key: 'pets' as SearchCategory, label: 'الحيوانات', icon: Heart, color: COLORS.success },
    { key: 'clinics' as SearchCategory, label: 'العيادات', icon: Building2, color: COLORS.warning },
    { key: 'stores' as SearchCategory, label: 'المتاجر', icon: ShoppingBag, color: '#9C27B0' },
    { key: 'inquiries' as SearchCategory, label: 'الاستفسارات', icon: FileText, color: '#FF5722' },
    { key: 'consultations' as SearchCategory, label: 'الاستشارات', icon: MessageCircle, color: '#795548' },
  ];

  const getResultIcon = (type: SearchCategory) => {
    const category = categories.find(cat => cat.key === type);
    const IconComponent = category?.icon || Search;
    return <IconComponent size={20} color={COLORS.primary} />;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'نشط':
      case 'متاح':
      case 'معتمدة':
        return COLORS.success;
      case 'قيد المراجعة':
      case 'معلق':
        return COLORS.warning;
      case 'محظور':
      case 'مرفوض':
        return COLORS.error;
      default:
        return COLORS.gray;
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Combine all data sources
    const allResults: SearchResult[] = [];
    
    // Add users
    if (usersQuery.data?.users && (selectedCategory === 'all' || selectedCategory === 'users')) {
      const userResults = usersQuery.data.users
        .filter((user: any) => 
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.id?.toString().includes(searchQuery)
        )
        .map((user: any) => ({
          id: user.id.toString(),
          type: 'users' as SearchCategory,
          title: user.name || 'مستخدم بدون اسم',
          subtitle: user.userType === 'vet' ? 'طبيب بيطري' : user.userType === 'admin' ? 'مشرف' : 'مستخدم',
          status: user.isActive ? 'نشط' : 'محظور',
          details: `ID: ${user.id} • ${user.email || 'بدون بريد'} • انضم: ${new Date(user.createdAt).toLocaleDateString('ar-SA')}`,
          timestamp: new Date(user.createdAt),
          isActive: user.isActive,
          email: user.email,
          phone: user.phone,
          userType: user.userType
        }));
      allResults.push(...userResults);
    }
    
    // Add stores
    if (storesQuery.data?.stores && (selectedCategory === 'all' || selectedCategory === 'stores')) {
      const storeResults = storesQuery.data.stores
        .filter((store: any) => 
          store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((store: any) => ({
          id: store.id.toString(),
          type: 'stores' as SearchCategory,
          title: store.name || 'متجر بدون اسم',
          subtitle: 'متجر مستلزمات',
          status: store.isActive ? 'نشط' : 'معطل',
          details: `${store.description || 'بدون وصف'} • ${store.location || 'موقع غير محدد'}`,
          timestamp: new Date(store.createdAt),
          isActive: store.isActive
        }));
      allResults.push(...storeResults);
    }
    
    setSearchResults(allResults);
    setIsSearching(false);
  };

  const handleResultPress = (result: SearchResult) => {
    // Navigate to appropriate detail page based on result type
    switch (result.type) {
      case 'users':
        // Navigate to user profile or management page
        console.log('Navigate to user:', result.id);
        break;
      case 'pets':
        router.push(`/pet-details?id=${result.id}`);
        break;
      case 'clinics':
        router.push(`/clinic-profile?id=${result.id}`);
        break;
      case 'stores':
        router.push(`/store-details?id=${result.id}`);
        break;
      case 'inquiries':
        router.push(`/vet-inquiries?id=${result.id}`);
        break;
      case 'consultations':
        router.push(`/consultation-list?id=${result.id}`);
        break;
    }
  };

  const handleEditItem = (result: SearchResult) => {
    setSelectedItem(result);
    if (result.type === 'users') {
      setEditForm({
        name: result.title,
        email: result.email || '',
        phone: result.phone || '',
        userType: result.userType || 'user',
        isActive: result.isActive ?? true,
      });
    } else if (result.type === 'pets') {
      setEditForm({
        name: result.title,
        type: result.subtitle.split(' - ')[0] || '',
        breed: result.subtitle.split(' - ')[1] || '',
        isLost: result.status === 'مفقود',
      });
    }
    setShowEditModal(true);
  };

  const banUserMutation = trpc.admin.users.ban.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      handleSearch(); // Refresh search results
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء تحديث المستخدم');
    }
  });

  const handleBanItem = (result: SearchResult) => {
    if (result.type !== 'users') return;
    
    const action = result.isActive ? 'حظر' : 'إلغاء حظر';
    Alert.alert(
      `${action} المستخدم`,
      `هل أنت متأكد من ${action} هذا المستخدم؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: action,
          style: result.isActive ? 'destructive' : 'default',
          onPress: () => {
            banUserMutation.mutate({
              userId: parseInt(result.id),
              adminId: 1,
              ban: result.isActive || false
            });
          }
        }
      ]
    );
  };

  const deleteUserMutation = trpc.admin.users.delete.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      handleSearch(); // Refresh search results
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء حذف المستخدم');
    }
  });

  const handleDeleteItem = (result: SearchResult) => {
    const itemType = result.type === 'users' ? 'المستخدم' : result.type === 'stores' ? 'المتجر' : 'العنصر';
    Alert.alert(
      `حذف ${itemType}`,
      `هل أنت متأكد من حذف ${itemType}؟ هذا الإجراء لا يمكن التراجع عنه.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            if (result.type === 'users') {
              deleteUserMutation.mutate({ 
                userId: parseInt(result.id),
                adminId: 1
              });
            } else {
              Alert.alert('تنبيه', 'حذف هذا النوع من العناصر غير متاح حالياً');
            }
          }
        }
      ]
    );
  };

  const updateUserMutation = trpc.admin.users.updateProfile.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      handleSearch(); // Refresh search results
      Alert.alert('تم', 'تم حفظ التغييرات بنجاح');
      setShowEditModal(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء حفظ التغييرات');
    }
  });

  const handleSaveEdit = () => {
    if (!selectedItem) return;
    
    if (selectedItem.type === 'users') {
      updateUserMutation.mutate({
        userId: parseInt(selectedItem.id),
        adminId: 1,
        name: editForm.name || '',
        email: editForm.email || '',
        phone: editForm.phone,
        userType: editForm.userType as 'user' | 'vet' | 'admin',
        isActive: editForm.isActive || false
      });
    } else {
      Alert.alert('تنبيه', 'تعديل هذا النوع من العناصر غير متاح حالياً');
    }
  };

  const canAccessCategory = (category: SearchCategory) => {
    if (isSuperAdmin) return true;
    
    // For now, all admin users can access all categories
    // In a real app, you would check specific permissions from the database
    return hasAdminAccess;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'البحث الإداري',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <AdminTopBar />
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث بالاسم، الإيميل، أو رقم ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>بحث</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.key;
          const hasAccess = canAccessCategory(category.key);
          
          if (!hasAccess) return null;
          
          return (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                isSelected && { ...styles.selectedCategory, backgroundColor: category.color }
              ]}
              onPress={() => {
                console.log('Category selected:', category.key);
                setSelectedCategory(category.key);
                if (searchQuery.trim()) {
                  handleSearch();
                }
              }}
              activeOpacity={0.7}
            >
              <IconComponent 
                size={16} 
                color={isSelected ? COLORS.white : category.color} 
              />
              <Text style={[
                styles.categoryText,
                isSelected ? styles.selectedCategoryText : { color: category.color }
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content Area - No extra spacing */}
      <View style={styles.contentContainer}>
        {searchResults.length > 0 ? (
          <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
            {searchResults.map((result) => (
              <TouchableOpacity
                key={result.id}
                style={styles.resultCard}
                onPress={() => handleResultPress(result)}
              >
                <View style={styles.resultHeader}>
                  <View style={styles.resultInfo}>
                    {getResultIcon(result.type)}
                    <View style={styles.resultContent}>
                      <Text style={styles.resultTitle}>{result.title}</Text>
                      <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.resultActions}>
                    {result.status && (
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(result.status) }
                      ]}>
                        <Text style={styles.statusText}>{result.status}</Text>
                      </View>
                    )}
                    
                    {(result.type === 'users' || result.type === 'stores') && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.editButton]}
                          onPress={() => handleEditItem(result)}
                          disabled={updateUserMutation.isPending}
                        >
                          <Edit3 size={16} color={COLORS.white} />
                        </TouchableOpacity>
                        
                        {result.type === 'users' && (
                          <TouchableOpacity
                            style={[
                              styles.actionButton, 
                              result.isActive ? styles.banButton : styles.unbanButton
                            ]}
                            onPress={() => handleBanItem(result)}
                            disabled={banUserMutation.isPending}
                          >
                            <Ban size={16} color={COLORS.white} />
                          </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => handleDeleteItem(result)}
                          disabled={deleteUserMutation.isPending}
                        >
                          <Trash2 size={16} color={COLORS.white} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                
                {result.details && (
                  <Text style={styles.resultDetails}>{result.details}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : isSearching ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري البحث...</Text>
          </View>
        ) : usersQuery.isLoading || storesQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
          </View>
        ) : usersQuery.error || storesQuery.error ? (
          <View style={styles.emptyState}>
            <Search size={48} color={COLORS.error} />
            <Text style={styles.emptyText}>خطأ في تحميل البيانات</Text>
          </View>
        ) : searchQuery ? (
          <View style={styles.emptyState}>
            <Search size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>لا توجد نتائج للبحث</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Search size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>ابدأ البحث للعثور على النتائج</Text>
            <Text style={styles.emptySubtext}>يمكنك البحث بالاسم، الإيميل، أو رقم ID في المستخدمين والمتاجر</Text>
          </View>
        )}
      </View>
      
      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              تعديل {selectedItem?.type === 'users' ? 'المستخدم' : 'الحيوان'}
            </Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedItem?.type === 'users' ? (
              <>
                <Text style={styles.fieldLabel}>الاسم</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.name}
                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, name: value }))}
                  placeholder="أدخل الاسم"
                />
                
                <Text style={styles.fieldLabel}>البريد الإلكتروني</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.email}
                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, email: value }))}
                  placeholder="أدخل البريد الإلكتروني"
                  keyboardType="email-address"
                />
                
                <Text style={styles.fieldLabel}>رقم الهاتف</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.phone}
                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, phone: value }))}
                  placeholder="أدخل رقم الهاتف"
                  keyboardType="phone-pad"
                />
                
                <Text style={styles.fieldLabel}>نوع المستخدم</Text>
                <View style={styles.userTypeContainer}>
                  {['user', 'vet', 'admin'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.userTypeOption,
                        editForm.userType === type && styles.userTypeOptionSelected
                      ]}
                      onPress={() => setEditForm((prev) => ({ ...prev, userType: type }))}
                    >
                      <Text style={[
                        styles.userTypeText,
                        editForm.userType === type && styles.userTypeTextSelected
                      ]}>
                        {type === 'user' ? 'مستخدم' : type === 'vet' ? 'طبيب' : 'مشرف'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.switchContainer}>
                  <Text style={styles.fieldLabel}>الحساب نشط</Text>
                  <TouchableOpacity
                    style={[
                      styles.switch,
                      editForm.isActive && styles.switchActive
                    ]}
                    onPress={() => setEditForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  >
                    <View style={[
                      styles.switchThumb,
                      editForm.isActive && styles.switchThumbActive
                    ]} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>اسم الحيوان</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.name}
                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, name: value }))}
                  placeholder="أدخل اسم الحيوان"
                />
                
                <Text style={styles.fieldLabel}>نوع الحيوان</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.type}
                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, type: value }))}
                  placeholder="أدخل نوع الحيوان"
                />
                
                <Text style={styles.fieldLabel}>السلالة</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.breed}
                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, breed: value }))}
                  placeholder="أدخل السلالة"
                />
                
                <View style={styles.switchContainer}>
                  <Text style={styles.fieldLabel}>مفقود</Text>
                  <TouchableOpacity
                    style={[
                      styles.switch,
                      editForm.isLost && styles.switchActive
                    ]}
                    onPress={() => setEditForm((prev) => ({ ...prev, isLost: !prev.isLost }))}
                  >
                    <View style={[
                      styles.switchThumb,
                      editForm.isLost && styles.switchThumbActive
                    ]} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="إلغاء"
              onPress={() => setShowEditModal(false)}
              type="outline"
              size="medium"
              style={styles.modalButton}
            />
            <Button
              title={updateUserMutation.isPending ? "جاري الحفظ..." : "حفظ"}
              onPress={handleSaveEdit}
              type="primary"
              size="medium"
              style={styles.modalButton}
              disabled={updateUserMutation.isPending}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'right',
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    gap: 6,
    marginRight: 8,
    minWidth: 90,
    height: 40,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategory: {
    borderColor: 'transparent',
    shadowOpacity: 0.2,
    elevation: 5,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  contentContainer: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.gray,
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  banButton: {
    backgroundColor: COLORS.warning,
  },
  unbanButton: {
    backgroundColor: COLORS.success,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  resultInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '500',
  },
  resultDetails: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 8,
    lineHeight: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'right',
    backgroundColor: COLORS.white,
  },
  userTypeContainer: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 16,
  },
  userTypeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  userTypeOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  userTypeText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  userTypeTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: COLORS.primary,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  modalFooter: {
    flexDirection: 'row-reverse',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});