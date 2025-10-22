import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from "../constants/colors";
import { ArrowLeft, Plus, Edit3, Eye, EyeOff, Trash2, Star, MapPin, Phone, Download } from 'lucide-react-native';
import Button from "../components/Button";
import { mockClinics } from "../mocks/data";

type Clinic = {
  id: string;
  name: string;
  address: string;
  phone: string;
  image: string;
  rating: number;
  isPremium: boolean;
  isSelectedForHome: boolean;
};

export default function HomeClinicsManagementScreen() {
  const router = useRouter();
  const [clinics, setClinics] = useState<Clinic[]>(
    mockClinics.map(clinic => ({
      ...clinic,
      image: clinic.image || 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      isSelectedForHome: clinic.isSelectedForHome || false
    }))
  );

  const handleToggleHomeVisibility = (clinicId: string) => {
    setClinics(prevClinics => 
      prevClinics.map(clinic => 
        clinic.id === clinicId 
          ? { ...clinic, isSelectedForHome: !clinic.isSelectedForHome }
          : clinic
      )
    );
  };

  const handleDeleteClinic = (clinicId: string) => {
    Alert.alert(
      'حذف العيادة',
      'هل أنت متأكد من حذف هذه العيادة من الصفحة الرئيسية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setClinics(prevClinics => prevClinics.filter(clinic => clinic.id !== clinicId));
          }
        }
      ]
    );
  };

  const handleEditClinic = (clinicId: string) => {
    router.push({ pathname: '/edit-clinic', params: { id: clinicId } });
  };

  const handleAddClinic = () => {
    router.push('/add-clinic');
  };

  const handleImportClinics = () => {
    // Get all available clinics from main sections that are not already selected for home
    const availableClinics = mockClinics.filter(clinic => 
      !clinics.some(homeClinic => homeClinic.id === clinic.id)
    );

    if (availableClinics.length === 0) {
      Alert.alert('لا توجد عيادات', 'جميع العيادات المتاحة موجودة بالفعل في الصفحة الرئيسية');
      return;
    }

    Alert.alert(
      'استيراد العيادات',
      `تم العثور على ${availableClinics.length} عيادة متاحة للاستيراد. هل تريد استيرادها جميعاً؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'استيراد الكل',
          onPress: () => {
            const importedClinics = availableClinics.map(clinic => ({
              id: clinic.id,
              name: clinic.name,
              address: clinic.address,
              phone: clinic.phone,
              image: clinic.image || 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              rating: clinic.rating,
              isPremium: clinic.isPremium,
              isSelectedForHome: true
            }));
            setClinics(prevClinics => [...prevClinics, ...importedClinics]);
            Alert.alert('تم الاستيراد', `تم استيراد ${importedClinics.length} عيادة بنجاح`);
          }
        },
        {
          text: 'اختيار يدوي',
          onPress: () => {
            // Show selection modal (for now, import first 3)
            const selectedClinics = availableClinics.slice(0, 3).map(clinic => ({
              id: clinic.id,
              name: clinic.name,
              address: clinic.address,
              phone: clinic.phone,
              image: clinic.image || 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
              rating: clinic.rating,
              isPremium: clinic.isPremium,
              isSelectedForHome: true
            }));
            setClinics(prevClinics => [...prevClinics, ...selectedClinics]);
            Alert.alert('تم الاستيراد', `تم استيراد ${selectedClinics.length} عيادة بنجاح`);
          }
        }
      ]
    );
  };

  const visibleClinics = clinics.filter(clinic => clinic.isSelectedForHome);
  const hiddenClinics = clinics.filter(clinic => !clinic.isSelectedForHome);

  const renderClinicCard = (clinic: Clinic, isVisible: boolean) => (
    <View key={clinic.id} style={styles.clinicCard}>
      <View style={styles.clinicCardContent}>
        <Image source={{ uri: clinic.image }} style={styles.clinicImage} />
        
        <View style={styles.clinicDetails}>
          <View style={styles.clinicHeader}>
            <Text style={styles.clinicName}>{clinic.name}</Text>
            {clinic.isPremium && (
              <View style={styles.premiumBadge}>
                <Star size={12} color={COLORS.white} fill={COLORS.white} />
                <Text style={styles.premiumBadgeText}>مميز</Text>
              </View>
            )}
          </View>
          
          <View style={styles.clinicInfoRow}>
            <MapPin size={14} color={COLORS.darkGray} />
            <Text style={styles.clinicInfoText}>{clinic.address}</Text>
          </View>
          
          <View style={styles.clinicInfoRow}>
            <Phone size={14} color={COLORS.darkGray} />
            <Text style={styles.clinicInfoText}>{clinic.phone}</Text>
          </View>
          
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{clinic.rating}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.clinicActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.visibilityButton]}
          onPress={() => handleToggleHomeVisibility(clinic.id)}
        >
          {isVisible ? (
            <EyeOff size={16} color={COLORS.white} />
          ) : (
            <Eye size={16} color={COLORS.white} />
          )}
          <Text style={styles.actionButtonText}>
            {isVisible ? 'إخفاء' : 'إظهار'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditClinic(clinic.id)}
        >
          <Edit3 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>تعديل</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteClinic(clinic.id)}
        >
          <Trash2 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>حذف</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إدارة العيادات - الصفحة الرئيسية',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>إدارة العيادات المتواجدة</Text>
          <Text style={styles.headerSubtitle}>
            تحكم في العيادات التي تظهر في الصفحة الرئيسية
          </Text>
        </View>
        
        {/* Add Clinic Button */}
        <View style={styles.addSection}>
          <View style={styles.buttonRow}>
            <Button
              title="إضافة عيادة جديدة"
              onPress={handleAddClinic}
              type="primary"
              size="medium"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.halfButton}
            />
            <Button
              title="استيراد من الأقسام"
              onPress={handleImportClinics}
              type="secondary"
              size="medium"
              icon={<Download size={16} color={COLORS.primary} />}
              style={styles.halfButton}
            />
          </View>
        </View>
        
        {/* Visible Clinics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            العيادات المعروضة في الصفحة الرئيسية ({visibleClinics.length})
          </Text>
          {visibleClinics.length > 0 ? (
            visibleClinics.map(clinic => renderClinicCard(clinic, true))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد عيادات معروضة في الصفحة الرئيسية</Text>
            </View>
          )}
        </View>
        
        {/* Hidden Clinics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            العيادات المخفية ({hiddenClinics.length})
          </Text>
          {hiddenClinics.length > 0 ? (
            hiddenClinics.map(clinic => renderClinicCard(clinic, false))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد عيادات مخفية</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  addSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  addButton: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  halfButton: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 15,
  },
  clinicCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clinicCardContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  clinicImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  clinicDetails: {
    flex: 1,
    marginRight: 16,
  },
  clinicHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  premiumBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  premiumBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  clinicInfoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  clinicInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  ratingContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  clinicActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  visibilityButton: {
    backgroundColor: COLORS.info,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});