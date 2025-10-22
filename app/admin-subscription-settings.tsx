import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Settings, Star, Eye, EyeOff, Save } from 'lucide-react-native';
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";

export default function SubscriptionSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingSettings, setEditingSettings] = useState<any>(null);

  // جلب إعدادات الاشتراك المميز
  const subscriptionQuery = trpc.admin.subscriptionSettings.get.useQuery({});

  // تحديث إعدادات الاشتراك المميز
  const updateSubscriptionMutation = trpc.admin.subscriptionSettings.update.useMutation({
    onSuccess: () => {
      Alert.alert('تم بنجاح', 'تم تحديث إعدادات الاشتراك المميز');
      subscriptionQuery.refetch();
      setIsEditing(false);
    },
    onError: (error) => {
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء تحديث الإعدادات');
    },
  });

  // تفعيل/إخفاء الاشتراك المميز
  const toggleVisibilityMutation = trpc.admin.subscriptionSettings.toggleVisibility.useMutation({
    onSuccess: () => {
      subscriptionQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء تغيير الإعدادات');
    },
  });

  useEffect(() => {
    if (subscriptionQuery.data?.settings) {
      setSettings(subscriptionQuery.data.settings);
      setEditingSettings(subscriptionQuery.data.settings);
    }
  }, [subscriptionQuery.data]);

  const handleToggleVisibility = () => {
    if (!settings) return;
    
    toggleVisibilityMutation.mutate({
      isVisible: !settings.isVisible,
      adminId: 1, // يجب الحصول على معرف الأدمن الحقيقي
    });
  };

  const handleSaveSettings = () => {
    if (!editingSettings) return;
    
    updateSubscriptionMutation.mutate({
      isVisible: editingSettings.isVisible,
      price: editingSettings.price,
      currency: editingSettings.currency,
      features: editingSettings.features,
      adminId: 1, // يجب الحصول على معرف الأدمن الحقيقي
    });
  };

  const handlePriceChange = (newPrice: string) => {
    const price = parseFloat(newPrice) || 0;
    setEditingSettings((prev: any) => ({ ...prev, price }));
  };

  const handleFeatureChange = (index: number, newFeature: string) => {
    const updatedFeatures = [...editingSettings.features];
    updatedFeatures[index] = newFeature;
    setEditingSettings((prev: any) => ({ ...prev, features: updatedFeatures }));
  };

  const addFeature = () => {
    const updatedFeatures = [...editingSettings.features, 'ميزة جديدة'];
    setEditingSettings((prev: any) => ({ ...prev, features: updatedFeatures }));
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = editingSettings.features.filter((_: any, i: number) => i !== index);
    setEditingSettings((prev: any) => ({ ...prev, features: updatedFeatures }));
  };

  if (subscriptionQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'إعدادات الاشتراك المميز',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Settings size={32} color={COLORS.primary} />
            <Text style={styles.headerTitle}>إدارة الاشتراك المميز</Text>
            <Text style={styles.headerSubtitle}>
              تحكم في إظهار وإخفاء قسم الاشتراك المميز في صفحة إضافة المذخر
            </Text>
          </View>

          {settings && (
            <>
              {/* Visibility Toggle */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>حالة العرض</Text>
                  <View style={styles.visibilityToggle}>
                    <Text style={styles.toggleLabel}>
                      {settings.isVisible ? 'مرئي' : 'مخفي'}
                    </Text>
                    <Switch
                      value={settings.isVisible}
                      onValueChange={handleToggleVisibility}
                      trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                      thumbColor={settings.isVisible ? COLORS.white : COLORS.gray}
                    />
                  </View>
                </View>
                
                <View style={styles.statusCard}>
                  <View style={styles.statusIcon}>
                    {settings.isVisible ? (
                      <Eye size={24} color={COLORS.success} />
                    ) : (
                      <EyeOff size={24} color={COLORS.error} />
                    )}
                  </View>
                  <Text style={styles.statusText}>
                    {settings.isVisible 
                      ? 'قسم الاشتراك المميز مرئي للمستخدمين'
                      : 'قسم الاشتراك المميز مخفي - التسجيل مجاني'
                    }
                  </Text>
                </View>
              </View>

              {/* Current Settings Display */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>الإعدادات الحالية</Text>
                
                <View style={styles.currentSettings}>
                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>السعر:</Text>
                    <Text style={styles.settingValue}>
                      {settings.price} {settings.currency === 'USD' ? 'دولار' : settings.currency}
                    </Text>
                  </View>
                  
                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>العملة:</Text>
                    <Text style={styles.settingValue}>{settings.currency}</Text>
                  </View>
                  
                  <View style={styles.settingColumn}>
                    <Text style={styles.settingLabel}>المميزات:</Text>
                    {settings.features?.map((feature: string, index: number) => (
                      <Text key={index} style={styles.featureItem}>
                        • {feature}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              {/* Edit Settings */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>تعديل الإعدادات</Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(!isEditing)}
                  >
                    <Text style={styles.editButtonText}>
                      {isEditing ? 'إلغاء' : 'تعديل'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {isEditing && editingSettings && (
                  <View style={styles.editForm}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>السعر (بالدولار)</Text>
                      <TextInput
                        style={styles.input}
                        value={editingSettings.price?.toString() || ''}
                        onChangeText={handlePriceChange}
                        placeholder="السعر"
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>المميزات</Text>
                      {editingSettings.features?.map((feature: string, index: number) => (
                        <View key={index} style={styles.featureInputRow}>
                          <TextInput
                            style={[styles.input, styles.featureInput]}
                            value={feature}
                            onChangeText={(text) => handleFeatureChange(index, text)}
                            placeholder={`الميزة ${index + 1}`}
                          />
                          <TouchableOpacity
                            style={styles.removeFeatureButton}
                            onPress={() => removeFeature(index)}
                          >
                            <Text style={styles.removeFeatureText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      
                      <TouchableOpacity
                        style={styles.addFeatureButton}
                        onPress={addFeature}
                      >
                        <Text style={styles.addFeatureText}>+ إضافة ميزة</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSaveSettings}
                      disabled={updateSubscriptionMutation.isPending}
                    >
                      <Save size={20} color={COLORS.white} />
                      <Text style={styles.saveButtonText}>
                        {updateSubscriptionMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Preview */}
              {settings.isVisible && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>معاينة للمستخدمين</Text>
                  
                  <View style={styles.previewCard}>
                    <View style={styles.previewHeader}>
                      <Star size={24} color={COLORS.primary} />
                      <Text style={styles.previewTitle}>معلومات الاشتراك</Text>
                    </View>
                    
                    <Text style={styles.previewPrice}>
                      الاشتراك الشهري: {settings.price} {settings.currency === 'USD' ? 'دولار' : settings.currency}
                    </Text>
                    
                    <Text style={styles.previewDescription}>
                      يتضمن عرض المذخر في التطبيق، إضافة المنتجات، إدارة المخزون
                    </Text>
                    
                    <View style={styles.previewFeatures}>
                      {settings.features?.map((feature: string, index: number) => (
                        <Text key={index} style={styles.previewFeature}>
                          • {feature}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 10,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  visibilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '600',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 15,
    gap: 15,
  },
  statusIcon: {
    padding: 5,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  currentSettings: {
    gap: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingColumn: {
    gap: 5,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  settingValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  featureItem: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  editForm: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  featureInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  featureInput: {
    flex: 1,
  },
  removeFeatureButton: {
    backgroundColor: COLORS.error,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFeatureText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addFeatureButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addFeatureText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 10,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  previewDescription: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  previewFeatures: {
    gap: 5,
  },
  previewFeature: {
    fontSize: 14,
    color: COLORS.black,
  },
});