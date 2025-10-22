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
  type Hospital,
  type Permission
} from "../lib/permissions";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'moderator' | 'doctor';
  status: 'active' | 'inactive';
  lastLogin: string;
  hospitalId: string;
  hospitalName: string;
  permissions: Permission[];
}

export default function HospitalsUsersManagementScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const permissions = usePermissions();

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole] = useState<'moderator'>('moderator');
  const [newUserHospital, setNewUserHospital] = useState('');



  // تحديث قائمة المستشفيات عند تحميل الصفحة
  React.useEffect(() => {
    refreshHospitalsList();
  }, []);

  // قائمة المستشفيات المتاحة - يتم تحديثها تلقائياً عند إضافة مستشفى جديد
  const [hospitals, setHospitals] = useState<Hospital[]>([
    { id: '1', name: 'المستشفى البيطري الرئيسي - بغداد', location: 'بغداد', status: 'active' },
    { id: '2', name: 'مستشفى البصرة البيطري', location: 'البصرة', status: 'active' },
    { id: '3', name: 'مستشفى الموصل البيطري', location: 'الموصل', status: 'active' },
    { id: '4', name: 'مستشفى أربيل البيطري', location: 'أربيل', status: 'active' },
    { id: '5', name: 'مستشفى النجف البيطري', location: 'النجف', status: 'active' },
    { id: '6', name: 'مستشفى كربلاء البيطري', location: 'كربلاء', status: 'active' },
    { id: '7', name: 'مستشفى الأنبار البيطري', location: 'الأنبار', status: 'active' },
    { id: '8', name: 'مستشفى ديالى البيطري', location: 'ديالى', status: 'active' },
    { id: '9', name: 'مستشفى واسط البيطري', location: 'واسط', status: 'active' },
    { id: '10', name: 'مستشفى ميسان البيطري', location: 'ميسان', status: 'active' },
    { id: '11', name: 'مستشفى ذي قار البيطري', location: 'ذي قار', status: 'active' },
    { id: '12', name: 'مستشفى المثنى البيطري', location: 'المثنى', status: 'active' },
    { id: '13', name: 'مستشفى القادسية البيطري', location: 'القادسية', status: 'active' },
    { id: '14', name: 'مستشفى بابل البيطري', location: 'بابل', status: 'active' },
    { id: '15', name: 'مستشفى صلاح الدين البيطري', location: 'صلاح الدين', status: 'active' },
    { id: '16', name: 'مستشفى كركوك البيطري', location: 'كركوك', status: 'active' },
    { id: '17', name: 'مستشفى دهوك البيطري', location: 'دهوك', status: 'active' },
    { id: '18', name: 'مستشفى السليمانية البيطري', location: 'السليمانية', status: 'active' },
  ]);

  // محاكاة تحديث قائمة المستشفيات تلقائياً عند إضافة مستشفى جديد من قبل الإدمن
  const refreshHospitalsList = () => {
    // هذه الدالة ستتصل بالخادم لجلب أحدث قائمة المستشفيات
    console.log('تحديث قائمة المستشفيات...');
    // في التطبيق الحقيقي، ستكون هناك استدعاء API هنا
    // مثال على إضافة مستشفى جديد تلقائياً:
    // setHospitals(prev => [...prev, { id: 'new', name: 'مستشفى جديد' }]);
  };

  const [users] = useState<User[]>([
    {
      id: '2',
      name: 'د. فاطمة علي',
      email: 'fatima@hospital.com',
      role: 'moderator',
      status: 'active',
      lastLogin: '2024-01-14',
      hospitalId: '1',
      hospitalName: 'المستشفى البيطري الرئيسي - بغداد',
      permissions: MODERATOR_PERMISSIONS.filter(p => 
        ['hospital_manage_info', 'hospital_manage_announcements', 'hospital_view_reports'].includes(p.id)
      )
    },
    {
      id: '3',
      name: 'محمد حسن',
      email: 'mohammed@hospital.com',
      role: 'moderator',
      status: 'active',
      lastLogin: '2024-01-13',
      hospitalId: '2',
      hospitalName: 'مستشفى البصرة البيطري',
      permissions: MODERATOR_PERMISSIONS.filter(p => 
        ['hospital_manage_info', 'hospital_manage_announcements', 'hospital_manage_doctors'].includes(p.id)
      )
    },
    {
      id: '4',
      name: 'سارة أحمد',
      email: 'sara@hospital.com',
      role: 'moderator',
      status: 'active',
      lastLogin: '2024-01-10',
      hospitalId: '3',
      hospitalName: 'مستشفى الموصل البيطري',
      permissions: MODERATOR_PERMISSIONS
    }
  ]);

  const getRoleText = (role: string) => {
    switch (role) {
      case 'moderator': return 'مشرف';
      case 'doctor': return 'طبيب';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'moderator': return '#F59E0B';
      case 'doctor': return '#10B981';
      default: return '#6B7280';
    }
  };

  const handleAddUser = () => {
    if (!newUserName || !newUserEmail) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    if (!newUserHospital) {
      Alert.alert('خطأ', 'يرجى تحديد المستشفى المسؤول عنه');
      return;
    }


    
    const hospitalName = hospitals.find(h => h.id === newUserHospital)?.name;
    
    Alert.alert(
      'تم الإضافة بنجاح', 
      `تم إضافة المشرف "${newUserName}" للمستشفى: ${hospitalName}\n\nالمشرف سيحصل على صلاحيات كاملة للتحكم في المستشفى المحدد فقط.\n\nسيتم إرسال بيانات الدخول عبر البريد الإلكتروني.`,
      [
        {
          text: 'موافق',
          onPress: () => {
            setShowAddUserModal(false);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserHospital('');
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
      `المشرف: ${user?.name}\nالمستشفى: ${user?.hospitalName}\nالصلاحيات الحالية: ${userPermissions}\n\nسيتم فتح نافذة التعديل...`
    );
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    const userPermissions = user?.permissions.map(p => p.name).join('، ') || 'لا توجد صلاحيات';
    
    Alert.alert(
      'حذف المشرف',
      `هل أنت متأكد من حذف المشرف "${user?.name}"؟\n\nالمستشفى: ${user?.hospitalName}\nالصلاحيات: ${userPermissions}\n\n⚠️ تحذير: سيفقد المشرف جميع صلاحياته فوراً ولن يتمكن من الوصول لأي من أنظمة المستشفى.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive', 
          onPress: () => Alert.alert(
            'تم الحذف', 
            `تم حذف المشرف "${user?.name}" بنجاح.\nتم إلغاء جميع صلاحياته في ${user?.hospitalName}.`
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
      `هل تريد ${action} حساب المشرف "${user?.name}"؟\n\nالمستشفى: ${user?.hospitalName}\n\n${user?.status === 'active' ? '⚠️ سيفقد المشرف القدرة على الوصول لجميع الأنظمة' : '✅ سيتمكن المشرف من الوصول للأنظمة مرة أخرى'}`,
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
        <Text style={styles.headerTitle}>إدارة مشرفي المستشفيات</Text>
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
                <Text style={styles.hospitalName}>المستشفى: {user.hospitalName}</Text>
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
              <Text style={styles.label}>المستشفى المسؤول عنه</Text>
              <Text style={styles.helperText}>اختر المستشفى الذي سيكون المشرف مسؤولاً عنه (سيتمكن من التحكم فيه فقط)</Text>
              <ScrollView style={styles.hospitalsList} showsVerticalScrollIndicator={false}>
                {hospitals.map((hospital) => (
                  <TouchableOpacity
                    key={hospital.id}
                    style={[
                      styles.hospitalOption,
                      newUserHospital === hospital.id && styles.hospitalOptionActive
                    ]}
                    onPress={() => setNewUserHospital(hospital.id)}
                  >
                    <View style={styles.hospitalOptionContent}>
                      <Text style={[
                        styles.hospitalOptionText,
                        newUserHospital === hospital.id && styles.hospitalOptionTextActive
                      ]}>
                        {hospital.name}
                      </Text>
                      <Text style={[
                        styles.hospitalLocationText,
                        newUserHospital === hospital.id && styles.hospitalLocationTextActive
                      ]}>
                        📍 {hospital.location}
                      </Text>
                    </View>
                    {newUserHospital === hospital.id && (
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
  hospitalName: {
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
  hospitalsList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  hospitalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  hospitalOptionActive: {
    backgroundColor: '#EBF8FF',
  },
  hospitalOptionContent: {
    flex: 1,
  },
  hospitalOptionText: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: 'right',
  },
  hospitalOptionTextActive: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  hospitalLocationText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
  },
  hospitalLocationTextActive: {
    color: '#0EA5E9',
  },
  permissionsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  permissionsInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#059669',
    textAlign: 'right',
    marginLeft: 8,
    fontWeight: '500',
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