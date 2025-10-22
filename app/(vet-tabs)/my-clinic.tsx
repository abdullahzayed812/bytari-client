import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { useI18n } from "../../providers/I18nProvider";
import { COLORS } from "../../constants/colors";
import {
  Building2,
  Clock,
  Phone,
  MapPin,
  Users,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  Star,
  Edit,
} from 'lucide-react-native';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const { isRTL } = useI18n();
  
  return (
    <View style={[styles.statCard, { backgroundColor: color + '15' }]}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        {icon}
      </View>
      <View style={[styles.statContent, isRTL && styles.statContentRTL]}>
        <Text style={[styles.statValue, isRTL && styles.textRTL]}>{value}</Text>
        <Text style={[styles.statTitle, isRTL && styles.textRTL]}>{title}</Text>
      </View>
    </View>
  );
};

interface ActionButtonProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  color?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ title, icon, onPress, color = COLORS.primary }) => {
  const { isRTL } = useI18n();
  
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        {icon}
      </View>
      <Text style={[styles.actionTitle, isRTL && styles.textRTL]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function MyClinicScreen() {
  const { t, isRTL } = useI18n();

  const clinicData = {
    name: 'عيادة الرحمة البيطرية',
    address: 'شارع الملك فهد، الرياض',
    phone: '+966 11 123 4567',
    workingHours: '8:00 ص - 10:00 م',
    rating: '4.8',
    todayAppointments: '12',
    totalPatients: '1,245',
    monthlyRevenue: '45,000 ريال',
  };

  const handleEditClinic = () => {
    console.log('Edit clinic pressed');
  };

  const handleViewAppointments = () => {
    console.log('View appointments pressed');
  };

  const handleViewPatients = () => {
    console.log('View patients pressed');
  };

  const handleViewAnalytics = () => {
    console.log('View analytics pressed');
  };

  const handleViewReports = () => {
    console.log('View reports pressed');
  };

  const handleSettings = () => {
    console.log('Settings pressed');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t('clinics.myClinic'),
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTintColor: COLORS.black,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerRight: () => (
            <TouchableOpacity onPress={handleEditClinic} style={styles.headerButton}>
              <Edit size={20} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Clinic Info Card */}
        <View style={styles.clinicCard}>
          <View style={styles.clinicHeader}>
            <View style={styles.clinicIcon}>
              <Building2 size={24} color={COLORS.white} />
            </View>
            <View style={[styles.clinicInfo, isRTL && styles.clinicInfoRTL]}>
              <Text style={[styles.clinicName, isRTL && styles.textRTL]}>
                {clinicData.name}
              </Text>
              <View style={[styles.ratingContainer, isRTL && styles.ratingContainerRTL]}>
                <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={[styles.rating, isRTL && styles.textRTL]}>
                  {clinicData.rating}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.clinicDetails}>
            <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
              <MapPin size={16} color={COLORS.gray} />
              <Text style={[styles.detailText, isRTL && styles.textRTL]}>
                {clinicData.address}
              </Text>
            </View>
            <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
              <Phone size={16} color={COLORS.gray} />
              <Text style={[styles.detailText, isRTL && styles.textRTL]}>
                {clinicData.phone}
              </Text>
            </View>
            <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
              <Clock size={16} color={COLORS.gray} />
              <Text style={[styles.detailText, isRTL && styles.textRTL]}>
                {clinicData.workingHours}
              </Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            إحصائيات اليوم
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="مواعيد اليوم"
              value={clinicData.todayAppointments}
              icon={<Calendar size={20} color={COLORS.white} />}
              color={COLORS.primary}
            />
            <StatCard
              title="إجمالي المرضى"
              value={clinicData.totalPatients}
              icon={<Users size={20} color={COLORS.white} />}
              color={COLORS.success}
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              title="الإيرادات الشهرية"
              value={clinicData.monthlyRevenue}
              icon={<BarChart3 size={20} color={COLORS.white} />}
              color={COLORS.warning}
            />
            <StatCard
              title="التقييم"
              value={clinicData.rating + '/5'}
              icon={<Star size={20} color={COLORS.white} />}
              color={COLORS.info}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            إجراءات سريعة
          </Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              title="المواعيد"
              icon={<Calendar size={20} color={COLORS.white} />}
              onPress={handleViewAppointments}
              color={COLORS.primary}
            />
            <ActionButton
              title="المرضى"
              icon={<Users size={20} color={COLORS.white} />}
              onPress={handleViewPatients}
              color={COLORS.success}
            />
            <ActionButton
              title="التحليلات"
              icon={<BarChart3 size={20} color={COLORS.white} />}
              onPress={handleViewAnalytics}
              color={COLORS.warning}
            />
            <ActionButton
              title="التقارير"
              icon={<FileText size={20} color={COLORS.white} />}
              onPress={handleViewReports}
              color={COLORS.info}
            />
          </View>
        </View>

        {/* Settings Button */}
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Settings size={20} color={COLORS.white} />
          <Text style={[styles.settingsText, isRTL && styles.textRTL]}>
            إعدادات العيادة
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  clinicCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clinicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clinicIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicInfoRTL: {
    alignItems: 'flex-end',
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainerRTL: {
    flexDirection: 'row-reverse',
  },
  rating: {
    fontSize: 14,
    color: COLORS.warning,
    marginLeft: 4,
    fontWeight: '600',
  },
  clinicDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailRowRTL: {
    flexDirection: 'row-reverse',
  },
  detailText: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statContentRTL: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
  },
  settingsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  textRTL: {
    textAlign: 'right',
  },
});