import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter } from 'expo-router';
import { ArrowRight, Save, Bell, Smartphone, Mail, MessageSquare, Volume2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HospitalsNotificationsSettingsScreen() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newAppointments, setNewAppointments] = useState(true);
  const [newMessages, setNewMessages] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);

  const handleSave = () => {
    Alert.alert('تم الحفظ', 'تم حفظ إعدادات الإشعارات بنجاح');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إعدادات الإشعارات</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Save size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Smartphone size={20} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>طرق الإشعار</Text>
          </View>
          
          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>الإشعارات الفورية</Text>
              <Text style={styles.switchDescription}>إشعارات التطبيق على الهاتف</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#E5E7EB', true: '#0EA5E9' }}
              thumbColor={pushNotifications ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>البريد الإلكتروني</Text>
              <Text style={styles.switchDescription}>إشعارات عبر البريد الإلكتروني</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#E5E7EB', true: '#0EA5E9' }}
              thumbColor={emailNotifications ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>الرسائل النصية</Text>
              <Text style={styles.switchDescription}>إشعارات عبر الرسائل النصية</Text>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{ false: '#E5E7EB', true: '#0EA5E9' }}
              thumbColor={smsNotifications ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>الصوت</Text>
              <Text style={styles.switchDescription}>تشغيل الصوت مع الإشعارات</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#E5E7EB', true: '#0EA5E9' }}
              thumbColor={soundEnabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>أنواع الإشعارات</Text>
          </View>
          
          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>المواعيد الجديدة</Text>
              <Text style={styles.switchDescription}>إشعار عند حجز موعد جديد</Text>
            </View>
            <Switch
              value={newAppointments}
              onValueChange={setNewAppointments}
              trackColor={{ false: '#E5E7EB', true: '#0EA5E9' }}
              thumbColor={newAppointments ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>الرسائل الجديدة</Text>
              <Text style={styles.switchDescription}>إشعار عند وصول رسالة جديدة</Text>
            </View>
            <Switch
              value={newMessages}
              onValueChange={setNewMessages}
              trackColor={{ false: '#E5E7EB', true: '#0EA5E9' }}
              thumbColor={newMessages ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>تحديثات النظام</Text>
              <Text style={styles.switchDescription}>إشعارات التحديثات والصيانة</Text>
            </View>
            <Switch
              value={systemUpdates}
              onValueChange={setSystemUpdates}
              trackColor={{ false: '#E5E7EB', true: '#0EA5E9' }}
              thumbColor={systemUpdates ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>التنبيهات الطارئة</Text>
              <Text style={styles.switchDescription}>إشعارات الحالات الطارئة</Text>
            </View>
            <Switch
              value={emergencyAlerts}
              onValueChange={setEmergencyAlerts}
              trackColor={{ false: '#E5E7EB', true: '#0EA5E9' }}
              thumbColor={emergencyAlerts ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MessageSquare size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>إعدادات متقدمة</Text>
          </View>
          
          <TouchableOpacity style={styles.actionButton}>
            <Volume2 size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>نغمة الإشعار</Text>
            <ArrowRight size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Bell size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>أوقات الإشعارات</Text>
            <ArrowRight size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Mail size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>قوالب الإشعارات</Text>
            <ArrowRight size={16} color="#6B7280" />
          </TouchableOpacity>
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
});