import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import {
  ArrowRight,
  Save,
  Settings,
  Globe,
  Shield,
  Edit3,
} from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { COLORS } from "../constants/colors";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UnionGeneralSettingsScreen() {
  const router = useRouter();
  const [unionName, setUnionName] = useState('نقابة الأطباء البيطريين');
  const [unionDescription, setUnionDescription] = useState('نقابة مهنية تهدف إلى تطوير مهنة الطب البيطري');
  const [contactEmail, setContactEmail] = useState('info@vetunion.com');
  const [contactPhone, setContactPhone] = useState('+964 770 123 4567');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);

  const handleSave = () => {
    Alert.alert(
      'حفظ الإعدادات',
      'هل تريد حفظ التغييرات؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حفظ',
          onPress: () => {
            Alert.alert('تم الحفظ', 'تم حفظ الإعدادات بنجاح');
          },
        },
      ]
    );
  };

  const handleEditMainInfo = () => {
    router.push('/edit-union-main');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإعدادات العامة</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Save size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* معلومات النقابة */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>معلومات النقابة</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editMainInfoButton}
            onPress={handleEditMainInfo}
          >
            <Edit3 size={20} color={COLORS.primary} />
            <Text style={styles.editMainInfoText}>
              تعديل المعلومات الأساسية للنقابة
            </Text>
            <ArrowRight size={16} color={COLORS.primary} />
          </TouchableOpacity>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم النقابة</Text>
            <TextInput
              style={styles.input}
              value={unionName}
              onChangeText={setUnionName}
              placeholder="أدخل اسم النقابة"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>وصف النقابة</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={unionDescription}
              onChangeText={setUnionDescription}
              placeholder="أدخل وصف النقابة"
              textAlign="right"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* معلومات الاتصال */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>معلومات الاتصال</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder="أدخل البريد الإلكتروني"
              textAlign="right"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الهاتف</Text>
            <TextInput
              style={styles.input}
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="أدخل رقم الهاتف"
              textAlign="right"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* إعدادات النظام */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>إعدادات النظام</Text>
          </View>
          
          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>وضع الصيانة</Text>
              <Text style={styles.switchDescription}>تعطيل الوصول للمستخدمين مؤقتاً</Text>
            </View>
            <Switch
              value={isMaintenanceMode}
              onValueChange={setIsMaintenanceMode}
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor={isMaintenanceMode ? COLORS.white : '#F3F4F6'}
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
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor={allowRegistration ? COLORS.white : '#F3F4F6'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>يتطلب موافقة</Text>
              <Text style={styles.switchDescription}>يتطلب موافقة المشرف على التسجيلات الجديدة</Text>
            </View>
            <Switch
              value={requireApproval}
              onValueChange={setRequireApproval}
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor={requireApproval ? COLORS.white : '#F3F4F6'}
            />
          </View>
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
    fontSize: 18,
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
  input: {
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
  editMainInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editMainInfoText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'right',
    marginHorizontal: 12,
  },
});