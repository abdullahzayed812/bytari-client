import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import {
  ArrowRight,
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
} from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { COLORS } from "../constants/colors";
import { SafeAreaView } from 'react-native-safe-area-context';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'member';
  status: 'active' | 'inactive';
  joinDate: string;
}

export default function UnionUsersManagementScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'moderator' | 'member'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  const [newUserBranch, setNewUserBranch] = useState('');
  
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'د. أحمد محمد',
      email: 'ahmed@example.com',
      role: 'admin',
      status: 'active',
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'د. فاطمة علي',
      email: 'fatima@example.com',
      role: 'moderator',
      status: 'active',
      joinDate: '2024-02-20'
    },
    {
      id: '3',
      name: 'د. محمد حسن',
      email: 'mohammed@example.com',
      role: 'member',
      status: 'inactive',
      joinDate: '2024-03-10'
    },
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (userId: string) => {
    Alert.alert('تعديل المستخدم', `تعديل المستخدم ${userId}`);
  };

  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      'حذف المستخدم',
      'هل أنت متأكد من حذف هذا المستخدم؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: () => {
          Alert.alert('تم الحذف', 'تم حذف المستخدم بنجاح');
        }}
      ]
    );
  };

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل';
    Alert.alert(`${action} المستخدم`, `تم ${action} المستخدم بنجاح`);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'moderator': return 'مشرف';
      case 'member': return 'عضو';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#EF4444';
      case 'moderator': return '#F59E0B';
      case 'member': return '#10B981';
      default: return COLORS.darkGray;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة المستخدمين</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.headerAddButton}>
          <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث عن المستخدمين..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {['all', 'admin', 'moderator', 'member'].map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.filterButton,
                  selectedRole === role && styles.filterButtonActive
                ]}
                onPress={() => setSelectedRole(role as any)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedRole === role && styles.filterButtonTextActive
                ]}>
                  {role === 'all' ? 'الكل' : getRoleText(role)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <View style={[
                    styles.roleBadge,
                    { backgroundColor: getRoleColor(user.role) }
                  ]}>
                    <Text style={styles.roleText}>{getRoleText(user.role)}</Text>
                  </View>
                </View>
                
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.joinDate}>انضم في: {user.joinDate}</Text>
                
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: user.status === 'active' ? '#10B981' : '#EF4444' }
                ]}>
                  <Text style={styles.statusText}>
                    {user.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#0EA5E9' }]}
                  onPress={() => handleEditUser(user.id)}
                >
                  <Edit size={16} color={COLORS.white} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: user.status === 'active' ? '#F59E0B' : '#10B981' }
                  ]}
                  onPress={() => handleToggleStatus(user.id, user.status)}
                >
                  {user.status === 'active' ? 
                    <UserX size={16} color={COLORS.white} /> :
                    <UserCheck size={16} color={COLORS.white} />
                  }
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                  onPress={() => handleDeleteUser(user.id)}
                >
                  <Trash2 size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
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
              <Text style={styles.label}>الفرع المسؤول عنه</Text>
              <Text style={styles.helperText}>اختر الفرع الذي سيكون المشرف مسؤولاً عنه (سيتمكن من التحكم فيه فقط)</Text>
              <ScrollView style={styles.branchesList} showsVerticalScrollIndicator={false}>
                {[
                  { id: '1', name: 'فرع بغداد الرئيسي', location: 'بغداد' },
                  { id: '2', name: 'فرع البصرة', location: 'البصرة' },
                  { id: '3', name: 'فرع الموصل', location: 'الموصل' },
                  { id: '4', name: 'فرع أربيل', location: 'أربيل' },
                  { id: '5', name: 'فرع النجف', location: 'النجف' },
                  { id: '6', name: 'فرع كربلاء', location: 'كربلاء' },
                  { id: '7', name: 'فرع الأنبار', location: 'الأنبار' },
                  { id: '8', name: 'فرع ديالى', location: 'ديالى' },
                  { id: '9', name: 'فرع واسط', location: 'واسط' },
                  { id: '10', name: 'فرع ميسان', location: 'ميسان' }
                ].map((branch) => (
                  <TouchableOpacity
                    key={branch.id}
                    style={[
                      styles.branchOption,
                      newUserBranch === branch.id && styles.branchOptionActive
                    ]}
                    onPress={() => setNewUserBranch(branch.id)}
                  >
                    <View style={styles.branchOptionContent}>
                      <Text style={[
                        styles.branchOptionText,
                        newUserBranch === branch.id && styles.branchOptionTextActive
                      ]}>
                        {branch.name}
                      </Text>
                      <Text style={[
                        styles.branchLocationText,
                        newUserBranch === branch.id && styles.branchLocationTextActive
                      ]}>
                        📍 {branch.location}
                      </Text>
                    </View>
                    {newUserBranch === branch.id && (
                      <Shield size={16} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setNewUserName('');
                  setNewUserEmail('');
                  setNewUserBranch('');
                }}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (!newUserName || !newUserEmail) {
                    Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
                    return;
                  }
                  
                  if (!newUserBranch) {
                    Alert.alert('خطأ', 'يرجى تحديد الفرع المسؤول عنه');
                    return;
                  }

                  const branchName = [
                    { id: '1', name: 'فرع بغداد الرئيسي' },
                    { id: '2', name: 'فرع البصرة' },
                    { id: '3', name: 'فرع الموصل' },
                    { id: '4', name: 'فرع أربيل' },
                    { id: '5', name: 'فرع النجف' },
                    { id: '6', name: 'فرع كربلاء' },
                    { id: '7', name: 'فرع الأنبار' },
                    { id: '8', name: 'فرع ديالى' },
                    { id: '9', name: 'فرع واسط' },
                    { id: '10', name: 'فرع ميسان' }
                  ].find(b => b.id === newUserBranch)?.name;
                  
                  Alert.alert(
                    'تم الإضافة بنجاح', 
                    `تم إضافة المشرف "${newUserName}" للفرع: ${branchName}\n\nالمشرف سيحصل على صلاحيات كاملة للتحكم في الفرع المحدد فقط.\n\nسيتم إرسال بيانات الدخول عبر البريد الإلكتروني.`,
                    [
                      {
                        text: 'موافق',
                        onPress: () => {
                          setShowAddModal(false);
                          setNewUserName('');
                          setNewUserEmail('');
                          setNewUserBranch('');
                        }
                      }
                    ]
                  );
                }}
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
    backgroundColor: COLORS.primary,
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
  headerAddButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchSection: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  usersList: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
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
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
  joinDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: 'right',
  },
  statusBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
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
  branchesList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  branchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  branchOptionActive: {
    backgroundColor: '#EBF8FF',
  },
  branchOptionContent: {
    flex: 1,
  },
  branchOptionText: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: 'right',
  },
  branchOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  branchLocationText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
  },
  branchLocationTextActive: {
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
});