import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter } from 'expo-router';
import { ArrowRight, Plus, Edit, Trash2, UserCheck, UserX, Search, Shield } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  permissionManager, 
  usePermissions, 
  MODERATOR_PERMISSIONS,
  type User as PermissionUser,
  type Permission
} from "../lib/permissions";

interface PoultryFarm {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'supervisor' | 'doctor';
  status: 'active' | 'inactive';
  lastLogin: string;
  farmId: string;
  farmName: string;
  permissions: Permission[];
}

export default function FieldSupervisorsManagementScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const permissions = usePermissions();

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole] = useState<'supervisor'>('supervisor');
  const [newUserFarm, setNewUserFarm] = useState('');

  // تحديث قائمة الحقول عند تحميل الصفحة
  React.useEffect(() => {
    refreshFarmsList();
  }, []);

  // قائمة حقول الدواجن المتاحة - يتم تحديثها تلقائياً عند إضافة حقل جديد
  const [farms, setFarms] = useState<PoultryFarm[]>([
    { id: '1', name: 'حقل الدواجن الرئيسي - بغداد', location: 'بغداد', status: 'active' },
    { id: '2', name: 'حقل البصرة للدواجن', location: 'البصرة', status: 'active' },
    { id: '3', name: 'حقل الموصل للدواجن', location: 'الموصل', status: 'active' },
    { id: '4', name: 'حقل أربيل للدواجن', location: 'أربيل', status: 'active' },
    { id: '5', name: 'حقل النجف للدواجن', location: 'النجف', status: 'active' },
    { id: '6', name: 'حقل كربلاء للدواجن', location: 'كربلاء', status: 'active' },
    { id: '7', name: 'حقل الأنبار للدواجن', location: 'الأنبار', status: 'active' },
    { id: '8', name: 'حقل ديالى للدواجن', location: 'ديالى', status: 'active' },
    { id: '9', name: 'حقل واسط للدواجن', location: 'واسط', status: 'active' },
    { id: '10', name: 'حقل ميسان للدواجن', location: 'ميسان', status: 'active' },
    { id: '11', name: 'حقل ذي قار للدواجن', location: 'ذي قار', status: 'active' },
    { id: '12', name: 'حقل المثنى للدواجن', location: 'المثنى', status: 'active' },
    { id: '13', name: 'حقل القادسية للدواجن', location: 'القادسية', status: 'active' },
    { id: '14', name: 'حقل بابل للدواجن', location: 'بابل', status: 'active' },
    { id: '15', name: 'حقل صلاح الدين للدواجن', location: 'صلاح الدين', status: 'active' },
    { id: '16', name: 'حقل كركوك للدواجن', location: 'كركوك', status: 'active' },
    { id: '17', name: 'حقل دهوك للدواجن', location: 'دهوك', status: 'active' },
    { id: '18', name: 'حقل السليمانية للدواجن', location: 'السليمانية', status: 'active' },
  ]);

  // محاكاة تحديث قائمة الحقول تلقائياً عند إضافة حقل جديد من قبل الإدمن
  const refreshFarmsList = () => {
    // هذه الدالة ستتصل بالخادم لجلب أحدث قائمة الحقول
    console.log('تحديث قائمة الحقول...');
    // في التطبيق الحقيقي، ستكون هناك استدعاء API هنا
  };

  const [users] = useState<User[]>([
    {
      id: '2',
      name: 'أحمد محمد',
      email: 'ahmed@farm.com',
      role: 'supervisor',
      status: 'active',
      lastLogin: '2024-01-14',
      farmId: '1',
      farmName: 'حقل الدواجن الرئيسي - بغداد',
      permissions: MODERATOR_PERMISSIONS.filter(p => 
        ['field_manage_info', 'field_manage_reports', 'field_view_analytics'].includes(p.id)
      )
    },
    {
      id: '3',
      name: 'فاطمة علي',
      email: 'fatima@farm.com',
      role: 'supervisor',
      status: 'active',
      lastLogin: '2024-01-13',
      farmId: '2',
      farmName: 'حقل البصرة للدواجن',
      permissions: MODERATOR_PERMISSIONS.filter(p => 
        ['field_manage_info', 'field_manage_reports', 'field_manage_doctors'].includes(p.id)
      )
    },
    {
      id: '4',
      name: 'محمد حسن',
      email: 'mohammed@farm.com',
      role: 'supervisor',
      status: 'active',
      lastLogin: '2024-01-10',
      farmId: '3',
      farmName: 'حقل الموصل للدواجن',
      permissions: MODERATOR_PERMISSIONS
    }
  ]);

  const getRoleText = (role: string) => {
    switch (role) {
      case 'supervisor': return 'مشرف';
      case 'doctor': return 'طبيب';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'supervisor': return '#F59E0B';
      case 'doctor': return '#10B981';
      default: return '#6B7280';
    }
  };

  const handleAddUser = () => {
    if (!newUserName || !newUserEmail) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    if (!newUserFarm) {
      Alert.alert('خطأ', 'يرجى تحديد الحقل المسؤول عنه');
      return;
    }

    const farmName = farms.find(f => f.id === newUserFarm)?.name;
    
    Alert.alert(
      'تم الإضافة بنجاح', 
      `تم إضافة المشرف "${newUserName}" للحقل: ${farmName}\n\nالمشرف سيحصل على صلاحيات كاملة للتحكم في الحقل المحدد فقط.\n\nسيتم إرسال بيانات الدخول عبر البريد الإلكتروني.`,
      [
        {
          text: 'موافق',
          onPress: () => {
            setShowAddUserModal(false);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserFarm('');
          }
        }
      ]
    );
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    const userPermissions = user?.permissions.map(p => p.name).join('، ') || 'لا توجد صلاحيات';
    
    Alert.alert(
      'تعديل المشرف', 
      `المشرف: ${user?.name}\nالحقل: ${user?.farmName}\nالصلاحيات الحالية: ${userPermissions}\n\nسيتم فتح نافذة التعديل...`
    );
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    const userPermissions = user?.permissions.map(p => p.name).join('، ') || 'لا توجد صلاحيات';
    
    Alert.alert(
      'حذف المشرف',
      `هل أنت متأكد من حذف المشرف "${user?.name}"؟\n\nالحقل: ${user?.farmName}\nالصلاحيات: ${userPermissions}\n\n⚠️ تحذير: سيفقد المشرف جميع صلاحياته فوراً ولن يتمكن من الوصول لأي من أنظمة الحقل.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive', 
          onPress: () => Alert.alert(
            'تم الحذف', 
            `تم حذف المشرف "${user?.name}" بنجاح.\nتم إلغاء جميع صلاحياته في ${user?.farmName}.`
          ) 
        }
      ]
    );
  };

  const handleToggleStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    const newStatus = user?.status === 'active' ? 'معطل' : 'مفعل';
    const action = user?.status === 'active' ? 'تعطيل' : 'تفعيل';
    
    Alert.alert(
      `${action} المشرف`,
      `هل تريد ${action} حساب المشرف "${user?.name}"؟\n\nالحقل: ${user?.farmName}\n\n${user?.status === 'active' ? '⚠️ سيفقد المشرف القدرة على الوصول لجميع الأنظمة' : '✅ سيتمكن المشرف من الوصول للأنظمة مرة أخرى'}`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: action, 
          onPress: () => Alert.alert(
            'تم التحديث', 
            `تم ${newStatus} حساب المشرف "${user?.name}" بنجاح.`
          ) 
        }
      ]
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة مشرفي الحقول</Text>
        <TouchableOpacity onPress={() => setShowAddUserModal(true)} style={styles.addButton}>
          <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث عن المشرفين..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
          </View>
        </View>

        <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                    <Text style={styles.roleText}>{getRoleText(user.role)}</Text>
                  </View>
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.farmName}>الحقل: {user.farmName}</Text>
                <View style={styles.permissionsContainer}>
                  <Text style={styles.permissionsLabel}>الصلاحيات:</Text>
                  <View style={styles.permissionsBadges}>
                    {user.permissions.slice(0, 2).map((permission) => (
                      <View key={permission.id} style={styles.permissionBadge}>
                        <Text style={styles.permissionBadgeText}>{permission.name}</Text>
                      </View>
                    ))}
                    {user.permissions.length > 2 && (
                      <View style={styles.permissionBadge}>
                        <Text style={styles.permissionBadgeText}>+{user.permissions.length - 2}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.lastLogin}>آخر دخول: {user.lastLogin}</Text>
              </View>

              <View style={styles.userActions}>
                <TouchableOpacity
                  style={[styles.statusButton, user.status === 'active' ? styles.activeButton : styles.inactiveButton]}
                  onPress={() => handleToggleStatus(user.id)}
                >
                  {user.status === 'active' ? (
                    <UserCheck size={16} color={COLORS.white} />
                  ) : (
                    <UserX size={16} color={COLORS.white} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditUser(user.id)}
                >
                  <Edit size={16} color="#0EA5E9" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteUser(user.id)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={showAddUserModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إضافة مشرف جديد</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>اسم المشرف</Text>
              <TextInput
                style={styles.textInput}
                value={newUserName}
                onChangeText={setNewUserName}
                placeholder="أدخل اسم المشرف"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <TextInput
                style={styles.textInput}
                value={newUserEmail}
                onChangeText={setNewUserEmail}
                placeholder="أدخل البريد الإلكتروني"
                textAlign="right"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الحقل المسؤول عنه</Text>
              <Text style={styles.helperText}>اختر الحقل الذي سيكون المشرف مسؤولاً عنه (سيتمكن من التحكم فيه فقط)</Text>
              <ScrollView style={styles.farmsList} showsVerticalScrollIndicator={false}>
                {farms.map((farm) => (
                  <TouchableOpacity
                    key={farm.id}
                    style={[
                      styles.farmOption,
                      newUserFarm === farm.id && styles.farmOptionActive
                    ]}
                    onPress={() => setNewUserFarm(farm.id)}
                  >
                    <View style={styles.farmOptionContent}>
                      <Text style={[
                        styles.farmOptionText,
                        newUserFarm === farm.id && styles.farmOptionTextActive
                      ]}>
                        {farm.name}
                      </Text>
                      <Text style={[
                        styles.farmLocationText,
                        newUserFarm === farm.id && styles.farmLocationTextActive
                      ]}>
                        📍 {farm.location}
                      </Text>
                    </View>
                    {newUserFarm === farm.id && (
                      <Shield size={16} color="#0EA5E9" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddUserModal(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddUser}
              >
                <Text style={styles.saveButtonText}>إضافة</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 12,
  },
  usersList: {
    flex: 1,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  roleText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: 'right',
  },
  farmName: {
    fontSize: 13,
    color: '#0EA5E9',
    marginBottom: 4,
    textAlign: 'right',
    fontWeight: '500',
  },
  permissionsContainer: {
    marginBottom: 8,
  },
  permissionsLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 4,
  },
  permissionsBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 4,
  },
  permissionBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  permissionBadgeText: {
    fontSize: 10,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  lastLogin: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginBottom: 12,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  statusButton: {
    padding: 8,
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: '#10B981',
  },
  inactiveButton: {
    backgroundColor: '#6B7280',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EBF8FF',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  farmsList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  farmOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  farmOptionActive: {
    backgroundColor: '#EBF8FF',
  },
  farmOptionContent: {
    flex: 1,
  },
  farmOptionText: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: 'right',
  },
  farmOptionTextActive: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  farmLocationText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
  },
  farmLocationTextActive: {
    color: '#0EA5E9',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
});