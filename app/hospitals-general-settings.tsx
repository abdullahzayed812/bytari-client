import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Switch, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter } from 'expo-router';
import { ArrowRight, Save, Settings, Globe, Shield, Clock, Edit3, AlertTriangle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePermissions, validateHospitalOperation } from "../lib/permissions";

export default function HospitalsGeneralSettingsScreen() {
  const router = useRouter();
  const permissions = usePermissions();
  
  // معرف المستشفى الحالي (في التطبيق الحقيقي سيأتي من المعاملات أو الرابط)
  const currentHospitalId = '1'; // مثال: المستشفى البيطري الرئيسي - بغداد
  
  const [hospitalName, setHospitalName] = useState('المستشفى البيطري المركزي');
  const [hospitalDescription, setHospitalDescription] = useState('المستشفى البيطري الرئيسي في العراق');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [autoApproval, setAutoApproval] = useState(false);
  const canEdit = true; // المشرف يستطيع التحكم بكل شيء في المستشفى المخصص له

  const handleSave = () => {
    Alert.alert('تم الحفظ', 'تم حفظ إعدادات المستشفى بنجاح');
  };

  const handleEditMainInfo = () => {
    router.push('/edit-hospital-main');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإعدادات العامة</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.saveButton}
        >
          <Save size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>


        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>معلومات المستشفى</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editMainInfoButton}
            onPress={handleEditMainInfo}
          >
            <Edit3 size={20} color="#2563EB" />
            <Text style={styles.editMainInfoText}>
              تعديل المعلومات الأساسية للمستشفى
            </Text>
            <ArrowRight size={16} color="#2563EB" />
          </TouchableOpacity>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم المستشفى</Text>
            <TextInput
              style={styles.textInput}
              value={hospitalName}
              onChangeText={setHospitalName}
              placeholder="أدخل اسم المستشفى"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>وصف المستشفى</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={hospitalDescription}
              onChangeText={setHospitalDescription}
              placeholder="أدخل وصف المستشفى"
              textAlign="right"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>إعدادات الأمان</Text>
          </View>
          
          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>وضع الصيانة</Text>
              <Text style={styles.switchDescription}>إيقاف الوصول للمستخدمين مؤقتاً</Text>
            </View>
            <Switch
              value={isMaintenanceMode}
              onValueChange={setIsMaintenanceMode}
              trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
              thumbColor={isMaintenanceMode ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>السماح بالتسجيل</Text>
              <Text style={styles.switchDescription}>السماح للمستخدمين الجدد بالتسجيل</Text>
            </View>
            <Switch
              value={allowRegistration}
              onValueChange={setAllowRegistration}
              trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
              thumbColor={allowRegistration ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>الموافقة التلقائية</Text>
              <Text style={styles.switchDescription}>الموافقة على المحتوى تلقائياً</Text>
            </View>
            <Switch
              value={autoApproval}
              onValueChange={setAutoApproval}
              trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
              thumbColor={autoApproval ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>إعدادات النظام</Text>
          </View>
          
          <TouchableOpacity style={styles.actionButton}>
            <Globe size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>
              إعدادات اللغة
            </Text>
            <ArrowRight size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Clock size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>
              المنطقة الزمنية
            </Text>
            <ArrowRight size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.permissionInfo}>
          <Shield size={16} color="#10B981" />
          <Text style={styles.permissionInfoText}>
            لديك صلاحية كاملة لتعديل إعدادات هذا المستشفى
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: '#2563EB',
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
  saveButton: {
    padding: 8,
  },

  content: {
    flex: 1,
    padding: 16,
  },

  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginLeft: 8,
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

  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchInfo: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'right',
    marginHorizontal: 12,
  },
  editMainInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  editMainInfoText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    textAlign: 'right',
    marginHorizontal: 12,
  },

  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  permissionInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#059669',
    textAlign: 'right',
    marginLeft: 8,
    fontWeight: '500',
  },
});