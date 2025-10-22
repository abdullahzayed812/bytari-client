import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { trpc } from "../lib/trpc";

export default function DatabaseExample() {
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');

  // Get users query
  const usersQuery = trpc.users.list.useQuery({
    limit: 10,
    offset: 0,
  });

  // Create user mutation
  const createUserMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      Alert.alert('نجح', 'تم إنشاء المستخدم بنجاح');
      setUserName('');
      setUserEmail('');
      setUserPhone('');
      usersQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('خطأ', error.message);
    },
  });

  const handleCreateUser = () => {
    if (!userName || !userEmail) {
      Alert.alert('خطأ', 'يرجى ملء الحقول المطلوبة');
      return;
    }

    createUserMutation.mutate({
      name: userName,
      email: userEmail,
      phone: userPhone,
      userType: 'user',
    });
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'مثال قاعدة البيانات',
          headerStyle: { backgroundColor: '#4ECDC4' },
          headerTintColor: '#fff',
        }} 
      />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إنشاء مستخدم جديد</Text>
          
          <TextInput
            style={styles.input}
            placeholder="الاسم"
            value={userName}
            onChangeText={setUserName}
            placeholderTextColor="#999"
          />
          
          <TextInput
            style={styles.input}
            placeholder="البريد الإلكتروني"
            value={userEmail}
            onChangeText={setUserEmail}
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
          
          <TextInput
            style={styles.input}
            placeholder="رقم الهاتف (اختياري)"
            value={userPhone}
            onChangeText={setUserPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleCreateUser}
            disabled={createUserMutation.isPending}
          >
            <Text style={styles.buttonText}>
              {createUserMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء مستخدم'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>قائمة المستخدمين</Text>
          
          {usersQuery.isLoading && (
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          )}
          
          {usersQuery.error && (
            <Text style={styles.errorText}>خطأ: {usersQuery.error.message}</Text>
          )}
          
          {usersQuery.data?.users.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userType}>النوع: {user.userType}</Text>
              {user.phone && (
                <Text style={styles.userPhone}>الهاتف: {user.phone}</Text>
              )}
              <Text style={styles.userDate}>
                تاريخ الإنشاء: {new Date(user.createdAt * 1000).toLocaleDateString('ar-SA')}
              </Text>
            </View>
          ))}
          
          {usersQuery.data?.users.length === 0 && (
            <Text style={styles.emptyText}>لا توجد مستخدمين</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات قاعدة البيانات</Text>
          <Text style={styles.infoText}>• تم إنشاء قاعدة بيانات SQLite محلية</Text>
          <Text style={styles.infoText}>• تحتوي على جداول للمستخدمين والحيوانات الأليفة والمواعيد</Text>
          <Text style={styles.infoText}>• يمكن الوصول إليها عبر tRPC APIs</Text>
          <Text style={styles.infoText}>• تدعم العمليات الأساسية (إنشاء، قراءة، تحديث، حذف)</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    textAlign: 'right',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    color: '#ff4444',
    fontSize: 16,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
  userCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    color: '#4ECDC4',
    textAlign: 'right',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginBottom: 8,
    lineHeight: 20,
  },
});