import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, Stack } from 'expo-router';
import Button from "../components/Button";
import { 
  Calendar,
  Users,
  FileText,
  Settings,
  BarChart3,
  Clock,
  Phone,
  MessageSquare,
  Star,
  MapPin,
  Stethoscope,
  PlusCircle
} from 'lucide-react-native';
import { useQuery } from "@tanstack/react-query";

export default function ClinicControlPanel() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const { user } = useApp();

  const { data: clinicData, isLoading, error } = useQuery(trpc.clinics.getUserClinics.queryOptions({ userId: user.id }));

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  if (!clinicData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No clinic data found.</Text>
      </View>
    );
  }

  const dashboardItems = [
    {
      title: 'المواعيد اليوم',
      value: clinicData.todayAppointments,
      icon: <Calendar size={24} color={COLORS.primary} />,
      color: COLORS.primary,
      onPress: () => router.push('/appointments')
    },
    {
      title: 'إجمالي المرضى',
      value: clinicData.totalPatients,
      icon: <Users size={24} color={COLORS.success} />,
      color: COLORS.success,
      onPress: () => router.push('/pets')
    },
    {
      title: 'الإيرادات الشهرية',
      value: `${clinicData.monthlyRevenue} د.ع`,
      icon: <BarChart3 size={24} color={COLORS.warning} />,
      color: COLORS.warning,
      onPress: () => router.push('/orders')
    },
    {
      title: 'الطلبات المعلقة',
      value: clinicData.pendingRequests,
      icon: <Clock size={24} color={COLORS.error} />,
      color: COLORS.error,
      onPress: () => router.push('/notifications')
    }
  ];

  const managementOptions = [
    {
      title: 'إدارة المواعيد',
      description: 'عرض وإدارة مواعيد العيادة',
      icon: <Calendar size={20} color={COLORS.primary} />,
      onPress: () => router.push('/appointments')
    },
    {
      title: 'إدارة المرضى',
      description: 'عرض وإدارة ملفات المرضى',
      icon: <Users size={20} color={COLORS.primary} />,
      onPress: () => router.push('/pets')
    },
    {
      title: 'التقارير والإحصائيات',
      description: 'عرض تقارير العيادة والإحصائيات',
      icon: <BarChart3 size={20} color={COLORS.primary} />,
      onPress: () => router.push('/orders')
    },
    {
      title: 'الرسائل والاستشارات',
      description: 'إدارة الرسائل والاستشارات',
      icon: <MessageSquare size={20} color={COLORS.primary} />,
      onPress: () => router.push('/consultations-list')
    },
    {
      title: 'إعدادات العيادة',
      description: 'تحديث معلومات وإعدادات العيادة',
      icon: <Settings size={20} color={COLORS.primary} />,
      onPress: () => router.push('/settings')
    },
    {
      title: 'إدارة الموظفين',
      description: 'إضافة وإدارة موظفي العيادة',
      icon: <Stethoscope size={20} color={COLORS.primary} />,
      onPress: () => router.push('/vet-inquiries')
    }
  ];

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'لوحة تحكم العيادة',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black, fontWeight: 'bold' },
          headerTitleAlign: 'center'
        }} 
      />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Clinic Header */}
          <View style={styles.header}>
            <View style={[styles.headerContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Image source={{ uri: clinicData.image }} style={styles.clinicImage} />
              <View style={[styles.clinicInfo, { marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0 }]}>
                <Text style={[styles.clinicName, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {clinicData.name}
                </Text>
                <View style={[styles.clinicDetailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <MapPin size={16} color={COLORS.darkGray} />
                  <Text style={[styles.clinicDetailText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                    {clinicData.address}
                  </Text>
                </View>
                <View style={[styles.clinicDetailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Phone size={16} color={COLORS.darkGray} />
                  <Text style={[styles.clinicDetailText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                    {clinicData.phone}
                  </Text>
                </View>
                <View style={[styles.ratingRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={[styles.ratingText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                    {clinicData.rating}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: clinicData.isActive ? COLORS.success : COLORS.error }]}>
                    <Text style={styles.statusText}>{clinicData.isActive ? 'نشط' : 'غير نشط'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Dashboard Stats */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>نظرة عامة</Text>
            <View style={styles.statsGrid}>
              {dashboardItems.map((item, index) => (
                <TouchableOpacity key={index} style={styles.statCard} onPress={item.onPress}>
                  <View style={[styles.statIcon, { backgroundColor: `${item.color}20` }]}>
                    {item.icon}
                  </View>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statTitle}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Management Options */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>إدارة العيادة</Text>
            <View style={styles.managementGrid}>
              {managementOptions.map((option, index) => (
                <TouchableOpacity key={index} style={styles.managementCard} onPress={option.onPress}>
                  <View style={[styles.managementIcon, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                    {option.icon}
                  </View>
                  <Text style={[styles.managementTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.managementDescription, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>إجراءات سريعة</Text>
            <View style={styles.quickActionsContainer}>
              <Button
                title="إضافة موعد جديد"
                onPress={() => router.push('/appointments')}
                type="primary"
                size="medium"
                icon={<PlusCircle size={16} color={COLORS.white} />}
                style={styles.quickActionButton}
              />
              <Button
                title="إضافة مريض جديد"
                onPress={() => router.push('/add-pet')}
                type="secondary"
                size="medium"
                icon={<Users size={16} color={COLORS.primary} />}
                style={styles.quickActionButton}
              />
              <Button
                title="عرض التقارير"
                onPress={() => router.push('/orders')}
                type="outline"
                size="medium"
                icon={<FileText size={16} color={COLORS.primary} />}
                style={styles.quickActionButton}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    alignItems: 'center',
  },
  clinicImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  clinicInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  clinicName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  clinicDetailRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  clinicDetailText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  ratingRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: COLORS.white,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  managementGrid: {
    gap: 12,
  },
  managementCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  managementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  managementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  managementDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  quickActionsContainer: {
    gap: 12,
  },
  quickActionButton: {
    width: '100%',
  },
});