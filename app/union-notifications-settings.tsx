import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {
  ArrowRight,
  Save,
  Bell,
  Mail,
  MessageSquare,
  Users,
  Calendar,
  AlertTriangle,
} from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { COLORS } from "../constants/colors";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UnionNotificationsSettingsScreen() {
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [newMemberNotifications, setNewMemberNotifications] = useState(true);
  const [eventNotifications, setEventNotifications] = useState(true);
  const [emergencyNotifications, setEmergencyNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(true);

  const handleSave = () => {
    Alert.alert(
      'حفظ الإعدادات',
      'هل تريد حفظ إعدادات الإشعارات؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حفظ',
          onPress: () => {
            Alert.alert('تم الحفظ', 'تم حفظ إعدادات الإشعارات بنجاح');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
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
        {/* طرق الإشعار */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>طرق الإشعار</Text>
          </View>
          
          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Mail size={18} color={COLORS.darkGray} />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>البريد الإلكتروني</Text>
                <Text style={styles.switchDescription}>إرسال الإشعارات عبر البريد الإلكتروني</Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor={emailNotifications ? COLORS.white : '#F3F4F6'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Bell size={18} color={COLORS.darkGray} />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>الإشعارات الفورية</Text>
                <Text style={styles.switchDescription}>إشعارات فورية على الجهاز</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor={pushNotifications ? COLORS.white : '#F3F4F6'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <MessageSquare size={18} color={COLORS.darkGray} />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>الرسائل النصية</Text>
                <Text style={styles.switchDescription}>إرسال الإشعارات عبر الرسائل النصية</Text>
              </View>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor={smsNotifications ? COLORS.white : '#F3F4F6'}
            />
          </View>
        </View>

        {/* أنواع الإشعارات */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>أنواع الإشعارات</Text>
          </View>
          
          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Users size={18} color={COLORS.darkGray} />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>الأعضاء الجدد</Text>
                <Text style={styles.switchDescription}>إشعار عند انضمام عضو جديد</Text>
              </View>
            </View>
            <Switch
              value={newMemberNotifications}
              onValueChange={setNewMemberNotifications}
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor={newMemberNotifications ? COLORS.white : '#F3F4F6'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Calendar size={18} color={COLORS.darkGray} />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>الفعاليات والأحداث</Text>
                <Text style={styles.switchDescription}>إشعار عند إضافة فعالية جديدة</Text>
              </View>
            </View>
            <Switch
              value={eventNotifications}
              onValueChange={setEventNotifications}
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor={eventNotifications ? COLORS.white : '#F3F4F6'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <AlertTriangle size={18} color={COLORS.darkGray} />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>الإشعارات الطارئة</Text>
                <Text style={styles.switchDescription}>إشعارات مهمة وعاجلة</Text>
              </View>
            </View>
            <Switch
              value={emergencyNotifications}
              onValueChange={setEmergencyNotifications}
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor={emergencyNotifications ? COLORS.white : '#F3F4F6'}
            />
          </View>
        </View>

        {/* التقارير الدورية */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>التقارير الدورية</Text>
          </View>
          
          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Calendar size={18} color={COLORS.darkGray} />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>التقارير الأسبوعية</Text>
                <Text style={styles.switchDescription}>تقرير أسبوعي عن نشاط النقابة</Text>
              </View>
            </View>
            <Switch
              value={weeklyReports}
              onValueChange={setWeeklyReports}
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor={weeklyReports ? COLORS.white : '#F3F4F6'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Calendar size={18} color={COLORS.darkGray} />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>التقارير الشهرية</Text>
                <Text style={styles.switchDescription}>تقرير شهري مفصل عن الإحصائيات</Text>
              </View>
            </View>
            <Switch
              value={monthlyReports}
              onValueChange={setMonthlyReports}
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor={monthlyReports ? COLORS.white : '#F3F4F6'}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchTextContainer: {
    flex: 1,
    marginLeft: 12,
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
});