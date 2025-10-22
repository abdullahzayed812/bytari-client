import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Stethoscope, Heart, Store } from 'lucide-react-native';
import { COLORS } from "../constants/colors";

export default function StoreTypeSelectionScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleStoreTypeSelection = (storeType: 'vet' | 'user') => {
    console.log('Selected store type:', storeType);
    if (storeType === 'vet') {
      router.push('/vet-stores-management');
    } else {
      router.push('/user-stores-management');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'اختيار نوع المتجر',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' as const }
        }} 
      />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إدارة المتاجر</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>اختر نوع المتجر المراد إدارته</Text>
          <Text style={styles.subtitle}>
            يمكنك إدارة متاجر الأطباء البيطريين أو متاجر أصحاب الحيوانات
          </Text>

          <View style={styles.optionsContainer}>
            {/* Vet Stores Option */}
            <TouchableOpacity
              style={[styles.optionCard, styles.vetStoreCard]}
              onPress={() => handleStoreTypeSelection('vet')}
              testID="vet-stores-option"
            >
              <View style={styles.optionIcon}>
                <Stethoscope size={48} color={COLORS.white} />
              </View>
              <Text style={styles.optionTitle}>متاجر الأطباء البيطريين</Text>
              <Text style={styles.optionDescription}>
                إدارة المتاجر الخاصة بالأطباء البيطريين والعيادات
              </Text>
              <View style={styles.optionFeatures}>
                <Text style={styles.featureText}>• أدوية بيطرية</Text>
                <Text style={styles.featureText}>• معدات طبية</Text>
                <Text style={styles.featureText}>• مستلزمات العيادات</Text>
                <Text style={styles.featureText}>• منتجات علاجية</Text>
              </View>
            </TouchableOpacity>

            {/* Pet Owner Stores Option */}
            <TouchableOpacity
              style={[styles.optionCard, styles.userStoreCard]}
              onPress={() => handleStoreTypeSelection('user')}
              testID="user-stores-option"
            >
              <View style={styles.optionIcon}>
                <Heart size={48} color={COLORS.white} />
              </View>
              <Text style={styles.optionTitle}>متاجر أصحاب الحيوانات</Text>
              <Text style={styles.optionDescription}>
                إدارة المتاجر الخاصة بأصحاب الحيوانات الأليفة
              </Text>
              <View style={styles.optionFeatures}>
                <Text style={styles.featureText}>• طعام الحيوانات</Text>
                <Text style={styles.featureText}>• ألعاب وإكسسوارات</Text>
                <Text style={styles.featureText}>• أقفاص ومساكن</Text>
                <Text style={styles.featureText}>• منتجات العناية</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoIcon}>
              <Store size={24} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>معلومات هامة</Text>
              <Text style={styles.infoText}>
                • كل نوع متجر له نظام إدارة منفصل ومخصص
              </Text>
              <Text style={styles.infoText}>
                • يمكنك التبديل بين الأنواع في أي وقت
              </Text>
              <Text style={styles.infoText}>
                • جميع العمليات مراقبة ومسجلة للأمان
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 32,
  },
  optionCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  vetStoreCard: {
    backgroundColor: '#4CAF50',
  },
  userStoreCard: {
    backgroundColor: '#FF6B6B',
  },
  optionIcon: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
    lineHeight: 20,
  },
  optionFeatures: {
    alignItems: 'flex-start',
    width: '100%',
  },
  featureText: {
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 4,
    opacity: 0.9,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  infoIcon: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 4,
  },
});