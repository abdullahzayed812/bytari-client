import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { trpc } from "../lib/trpc";
import { Plus, Settings, Eye, EyeOff } from 'lucide-react-native';
import { COLORS } from "../constants/colors";
import AdvertisementCarousel from "../components/AdvertisementCarousel";

const colors = {
  primary: COLORS.primary,
  white: COLORS.white,
  black: COLORS.black,
  gray: COLORS.darkGray,
  lightGray: COLORS.lightGray,
  background: COLORS.background,
  text: COLORS.black,
  error: COLORS.error,
  success: COLORS.success,
};

export default function AdsManagementScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  // Fetch all advertisements
  const adsQuery = trpc.admin.ads.getAll.useQuery({
    adminId: 1, // TODO: Get from auth context
    includeInactive: showInactive,
    limit: 50,
    offset: 0,
  });

  // Toggle ad status mutation
  const toggleAdMutation = trpc.admin.ads.update.useMutation({
    onSuccess: () => {
      adsQuery.refetch();
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'فشل في تحديث الإعلان');
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await adsQuery.refetch();
    setRefreshing(false);
  };

  const handleToggleAdStatus = async (adId: number, currentStatus: boolean) => {
    try {
      await toggleAdMutation.mutateAsync({
        adminId: 1, // TODO: Get from auth context
        adId,
        isActive: !currentStatus,
      });
    } catch (error) {
      console.error('Failed to toggle ad status:', error);
    }
  };

  const handleCreateAd = () => {
    router.push('/create-ad');
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'إدارة الإعلانات',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCreateAd}
            >
              <Plus size={24} color={colors.white} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Preview Section */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>معاينة الإعلانات</Text>
          <Text style={styles.sectionSubtitle}>
            كيف تظهر الإعلانات للمستخدمين
          </Text>
          <AdvertisementCarousel
            position="home"
            type="banner"
            height={180}
            showAdminControls={true}
            adminId={1}
          />
        </View>

        {/* Controls */}
        <View style={styles.controlsSection}>
          <View style={styles.controlsHeader}>
            <Text style={styles.sectionTitle}>جميع الإعلانات</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                showInactive && styles.toggleButtonActive
              ]}
              onPress={() => setShowInactive(!showInactive)}
            >
              {showInactive ? (
                <EyeOff size={16} color={colors.white} />
              ) : (
                <Eye size={16} color={colors.primary} />
              )}
              <Text style={[
                styles.toggleButtonText,
                showInactive && styles.toggleButtonTextActive
              ]}>
                {showInactive ? 'إخفاء المحذوفة' : 'عرض المحذوفة'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ads List */}
        <View style={styles.adsSection}>
          {adsQuery.isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>جاري التحميل...</Text>
            </View>
          ) : adsQuery.isError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                فشل في تحميل الإعلانات
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => adsQuery.refetch()}
              >
                <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
              </TouchableOpacity>
            </View>
          ) : !adsQuery.data?.length ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد إعلانات</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateAd}
              >
                <Plus size={20} color={colors.white} />
                <Text style={styles.createButtonText}>إنشاء إعلان جديد</Text>
              </TouchableOpacity>
            </View>
          ) : (
            adsQuery.data.map((ad: any) => (
              <View key={ad.id} style={styles.adCard}>
                <View style={styles.adHeader}>
                  <View style={styles.adInfo}>
                    <Text style={styles.adTitle}>{ad.title}</Text>
                    <Text style={styles.adType}>
                      {ad.type === 'banner' ? 'بانر' : 
                       ad.type === 'popup' ? 'نافذة منبثقة' : 'مدمج'}
                    </Text>
                  </View>
                  <View style={styles.adActions}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        ad.isActive ? styles.activeButton : styles.inactiveButton
                      ]}
                      onPress={() => handleToggleAdStatus(ad.id, ad.isActive)}
                    >
                      <Text style={[
                        styles.statusButtonText,
                        ad.isActive ? styles.activeButtonText : styles.inactiveButtonText
                      ]}>
                        {ad.isActive ? 'نشط' : 'معطل'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.settingsButton}
                      onPress={() => router.push(`/edit-ad?id=${ad.id}`)}
                    >
                      <Settings size={16} color={colors.gray} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.adDetails}>
                  <View style={styles.adDetailRow}>
                    <Text style={styles.adDetailLabel}>الموقع:</Text>
                    <Text style={styles.adDetailValue}>
                      {ad.position || 'غير محدد'}
                    </Text>
                  </View>
                  <View style={styles.adDetailRow}>
                    <Text style={styles.adDetailLabel}>المدة:</Text>
                    <Text style={styles.adDetailValue}>
                      {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                    </Text>
                  </View>
                  <View style={styles.adDetailRow}>
                    <Text style={styles.adDetailLabel}>الإحصائيات:</Text>
                    <Text style={styles.adDetailValue}>
                      {ad.impressions || 0} مشاهدة • {ad.clicks || 0} نقرة
                    </Text>
                  </View>
                </View>

                {ad.content && (
                  <Text style={styles.adContent} numberOfLines={2}>
                    {ad.content}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  previewSection: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'right',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'right',
    marginBottom: 15,
  },
  controlsSection: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 10,
  },
  controlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: colors.white,
  },
  adsSection: {
    backgroundColor: colors.white,
    padding: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  adCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  adInfo: {
    flex: 1,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'right',
    marginBottom: 4,
  },
  adType: {
    fontSize: 12,
    color: colors.gray,
    textAlign: 'right',
  },
  adActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  activeButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  inactiveButton: {
    backgroundColor: colors.white,
    borderColor: colors.error,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeButtonText: {
    color: colors.white,
  },
  inactiveButtonText: {
    color: colors.error,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  adDetails: {
    marginBottom: 12,
  },
  adDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  adDetailLabel: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '600',
  },
  adDetailValue: {
    fontSize: 12,
    color: colors.text,
  },
  adContent: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
    lineHeight: 20,
  },
});