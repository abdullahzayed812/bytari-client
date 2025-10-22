import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { trpc } from "../lib/trpc";

export default function HospitalsAnalyticsScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();

  const { data, isLoading, error } = useQuery(trpc.admin.stats.getHospitalsAnalytics.queryOptions());

  const analyticsData = [
    {
      title: 'إجمالي المستشفيات',
      value: data?.totalHospitals.value || '0',
      change: data?.totalHospitals.change || '+0',
      changeType: data?.totalHospitals.changeType || 'increase',
      icon: BarChart3,
      color: '#0EA5E9'
    },
    {
      title: 'إجمالي المتابعين',
      value: data?.totalFollowers.value || '0',
      change: data?.totalFollowers.change || '+0',
      changeType: data?.totalFollowers.changeType || 'increase',
      icon: Users,
      color: '#10B981'
    },
    {
      title: 'الإعلانات الشهرية',
      value: data?.monthlyAnnouncements.value || '0',
      change: data?.monthlyAnnouncements.change || '+0',
      changeType: data?.monthlyAnnouncements.changeType || 'increase',
      icon: FileText,
      color: '#F59E0B'
    },
    {
      title: 'معدل النشاط',
      value: data?.activityRate.value || '0%',
      change: data?.activityRate.change || '+0%',
      changeType: data?.activityRate.changeType || 'increase',
      icon: Activity,
      color: '#8B5CF6'
    }
  ];

  const recentActivity = data?.recentActivity || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تحليلات المستشفيات</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>الإحصائيات العامة</Text>
        
        <View style={styles.statsGrid}>
          {analyticsData.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                    <IconComponent size={20} color={COLORS.white} />
                  </View>
                  <View style={[styles.changeIndicator, 
                    { backgroundColor: stat.changeType === 'increase' ? '#10B981' : '#EF4444' }
                  ]}>
                    <TrendingUp size={12} color={COLORS.white} />
                    <Text style={styles.changeText}>{stat.change}</Text>
                  </View>
                </View>
                
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>النشاط الأخير</Text>
        
        <View style={styles.activityList}>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <Calendar size={20} color="#0EA5E9" />
              </View>
              
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.chartPlaceholder}>
          <BarChart3 size={48} color={COLORS.lightGray} />
          <Text style={styles.chartPlaceholderText}>الرسوم البيانية التفصيلية</Text>
          <Text style={styles.chartPlaceholderSubtext}>قريباً - تحليلات متقدمة ورسوم بيانية</Text>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  activityList: {
    gap: 12,
    marginBottom: 24,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
  activityDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: 'right',
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.lightGray,
    textAlign: 'right',
  },
  chartPlaceholder: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  chartPlaceholderSubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
});