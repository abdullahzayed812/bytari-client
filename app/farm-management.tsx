import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter } from 'expo-router';
import Button from "../components/Button";
import { Feather } from '@expo/vector-icons';
import { trpc } from '../lib/trpc';
import { useQuery } from '@tanstack/react-query';

export default function FarmManagementScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();

  // Fetch the list of user's poultry farms
  const { data: farms, isLoading, error } = useQuery(trpc.poultryFarms.getUserFarms.queryOptions());

  const handleViewFarmDetails = (farm: any) => {
    router.push({
      pathname: '/poultry-farm-management',
      params: { 
        farmId: farm.id,
        farmName: farm.name,
        location: farm.location,
        area: farm.area,
        establishmentDate: farm.establishmentDate,
        initialChickCount: farm.initialChickCount,
        pricePerChick: farm.pricePerChick,
       }
    });
  };

  const handleAddNewFarm = () => {
    router.push('/create-poultry-farm');
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل المزارع...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>حدث خطأ في تحميل البيانات: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إدارة مزارع الدواجن</Text>
        <Text style={styles.headerSubtitle}>عرض وإدارة جميع مزارع الدواجن الخاصة بك</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {farms && farms.length > 0 ? (
          farms.map((farm) => (
            <TouchableOpacity
              key={farm.id}
              style={styles.farmCard}
              onPress={() => handleViewFarmDetails(farm)}
            >
              <View style={[styles.farmIcon, { backgroundColor: '#10B981' }]}>
                <Feather name="archive" size={24} color={COLORS.white} />
              </View>
              <View style={styles.farmInfo}>
                <Text style={[styles.farmName, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {farm.name}
                </Text>
                <Text style={[styles.farmDetail, { textAlign: isRTL ? 'right' : 'left' }]}>
                  الموقع: {farm.location}
                </Text>
                <Text style={[styles.farmDetail, { textAlign: isRTL ? 'right' : 'left' }]}>
                  العدد الأولي: {farm.initialChickCount}
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                  <Feather name={isRTL ? "chevron-left" : "chevron-right"} size={24} color={COLORS.darkGray} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>لا توجد مزارع دواجن.</Text>
            <Text style={styles.emptyStateSubtext}>ابدأ بإضافة مزرعة جديدة لإدارتها.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="إضافة مزرعة دواجن جديدة"
          onPress={handleAddNewFarm}
          type="primary"
          size="large"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  farmCard: {
    flexDirection: 'row-reverse',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  farmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  farmInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  farmDetail: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  arrowContainer: {
      paddingHorizontal: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});
