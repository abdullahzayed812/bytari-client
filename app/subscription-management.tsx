import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  Building2,
  Package,
  Crown,
  Edit3,
  Save,
  X,
} from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { COLORS } from "../constants/colors";

interface SubscriptionSettings {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  isEnabled: boolean;
  icon: React.ReactNode;
  color: string;
}

export default function SubscriptionManagementScreen() {
  const router = useRouter();
  const [, setEditingSubscription] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempSubscription, setTempSubscription] = useState<SubscriptionSettings | null>(null);

  // إعدادات الاشتراكات الافتراضية
  const [subscriptions, setSubscriptions] = useState<SubscriptionSettings[]>([
    {
      id: 'premium-member',
      title: 'العضوية المميزة',
      description: 'اشتراك شهري للأعضاء المميزين مع مزايا إضافية',
      price: '29.99 ريال/شهر',
      features: [
        'استشارات بيطرية مجانية',
        'خصومات على المنتجات',
        'أولوية في الحجوزات',
        'محتوى تعليمي حصري',
        'دعم فني متقدم'
      ],
      isEnabled: true,
      icon: <Crown size={24} color={COLORS.white} />,
      color: '#FFD700',
    },
    {
      id: 'clinic-subscription',
      title: 'اشتراك العيادات',
      description: 'اشتراك شهري للعيادات البيطرية لإدارة العمليات',
      price: '199.99 ريال/شهر',
      features: [
        'إدارة المواعيد والحجوزات',
        'نظام إدارة المرضى',
        'تقارير مالية مفصلة',
        'دعم فني على مدار الساعة',
        'تكامل مع أنظمة الدفع'
      ],
      isEnabled: true,
      icon: <Building2 size={24} color={COLORS.white} />,
      color: '#2196F3',
    },
    {
      id: 'warehouse-subscription',
      title: 'اشتراك المخازن',
      description: 'اشتراك شهري لإدارة المخازن والمستودعات',
      price: '149.99 ريال/شهر',
      features: [
        'إدارة المخزون والمنتجات',
        'تتبع الطلبات والشحنات',
        'تقارير المبيعات',
        'إدارة الموردين',
        'نظام الإنذار المبكر للمخزون'
      ],
      isEnabled: true,
      icon: <Package size={24} color={COLORS.white} />,
      color: '#4CAF50',
    },
  ]);

  const handleToggleSubscription = (id: string) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id ? { ...sub, isEnabled: !sub.isEnabled } : sub
      )
    );
    
    const subscription = subscriptions.find(sub => sub.id === id);
    const newStatus = !subscription?.isEnabled;
    
    Alert.alert(
      'تم التحديث',
      `تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} ${subscription?.title} بنجاح`,
      [{ text: 'موافق', style: 'default' }]
    );
  };

  const handleEditSubscription = (subscription: SubscriptionSettings) => {
    setTempSubscription({ ...subscription });
    setEditingSubscription(subscription.id);
    setShowEditModal(true);
  };

  const handleSaveSubscription = () => {
    if (!tempSubscription) return;
    
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === tempSubscription.id ? tempSubscription : sub
      )
    );
    
    setShowEditModal(false);
    setEditingSubscription(null);
    setTempSubscription(null);
    
    Alert.alert(
      'تم الحفظ',
      'تم حفظ التغييرات بنجاح',
      [{ text: 'موافق', style: 'default' }]
    );
  };

  const handleAddFeature = () => {
    if (!tempSubscription) return;
    
    setTempSubscription({
      ...tempSubscription,
      features: [...tempSubscription.features, 'ميزة جديدة']
    });
  };

  const handleRemoveFeature = (index: number) => {
    if (!tempSubscription) return;
    
    setTempSubscription({
      ...tempSubscription,
      features: tempSubscription.features.filter((_, i) => i !== index)
    });
  };

  const handleUpdateFeature = (index: number, value: string) => {
    if (!tempSubscription) return;
    
    const newFeatures = [...tempSubscription.features];
    newFeatures[index] = value;
    
    setTempSubscription({
      ...tempSubscription,
      features: newFeatures
    });
  };

  const handleBack = () => {
    router.back();
  };

  const renderEditModal = () => {
    if (!tempSubscription) return null;

    return (
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تعديل الاشتراك</Text>
            <TouchableOpacity onPress={handleSaveSubscription}>
              <Save size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>عنوان الاشتراك</Text>
              <TextInput
                style={styles.textInput}
                value={tempSubscription.title}
                onChangeText={(text) => setTempSubscription({...tempSubscription, title: text})}
                placeholder="أدخل عنوان الاشتراك"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الوصف</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={tempSubscription.description}
                onChangeText={(text) => setTempSubscription({...tempSubscription, description: text})}
                placeholder="أدخل وصف الاشتراك"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>السعر</Text>
              <TextInput
                style={styles.textInput}
                value={tempSubscription.price}
                onChangeText={(text) => setTempSubscription({...tempSubscription, price: text})}
                placeholder="أدخل سعر الاشتراك"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.featuresHeader}>
                <Text style={styles.inputLabel}>المزايا</Text>
                <TouchableOpacity onPress={handleAddFeature} style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ إضافة ميزة</Text>
                </TouchableOpacity>
              </View>
              
              {tempSubscription.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <TextInput
                    style={[styles.textInput, styles.featureInput]}
                    value={feature}
                    onChangeText={(text) => handleUpdateFeature(index, text)}
                    placeholder="أدخل الميزة"
                  />
                  <TouchableOpacity 
                    onPress={() => handleRemoveFeature(index)}
                    style={styles.removeButton}
                  >
                    <X size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إدارة تفعيل الاشتراكات</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>إدارة أنواع الاشتراكات</Text>
          <Text style={styles.sectionDescription}>
            يمكنك تفعيل أو إلغاء تفعيل أنواع الاشتراكات المختلفة وتعديل تفاصيلها
          </Text>

          {subscriptions.map((subscription) => (
            <View key={subscription.id} style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <View style={styles.subscriptionInfo}>
                  <View style={[styles.subscriptionIcon, { backgroundColor: subscription.color }]}>
                    {subscription.icon}
                  </View>
                  <View style={styles.subscriptionDetails}>
                    <Text style={styles.subscriptionTitle}>{subscription.title}</Text>
                    <Text style={styles.subscriptionPrice}>{subscription.price}</Text>
                  </View>
                </View>
                <View style={styles.subscriptionActions}>
                  <TouchableOpacity 
                    onPress={() => handleEditSubscription(subscription)}
                    style={styles.editButton}
                  >
                    <Edit3 size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Switch
                    value={subscription.isEnabled}
                    onValueChange={() => handleToggleSubscription(subscription.id)}
                    trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
                    thumbColor={subscription.isEnabled ? COLORS.white : '#F4F4F4'}
                  />
                </View>
              </View>

              <Text style={styles.subscriptionDescription}>
                {subscription.description}
              </Text>

              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>المزايا المتضمنة:</Text>
                {subscription.features.map((feature, index) => (
                  <Text key={index} style={styles.featureItem}>• {feature}</Text>
                ))}
              </View>

              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: subscription.isEnabled ? '#E8F5E8' : '#FFF3E0' }
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: subscription.isEnabled ? '#4CAF50' : '#FF9800' }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: subscription.isEnabled ? '#4CAF50' : '#FF9800' }
                  ]}>
                    {subscription.isEnabled ? 'مفعل' : 'غير مفعل'}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {/* معلومات إضافية */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>معلومات هامة</Text>
            <Text style={styles.infoText}>
              • عند إلغاء تفعيل اشتراك، سيصبح مجانياً للمستخدمين
            </Text>
            <Text style={styles.infoText}>
              • يمكنك تعديل الأسعار والمزايا في أي وقت
            </Text>
            <Text style={styles.infoText}>
              • التغييرات تطبق فوراً على جميع المستخدمين الجدد
            </Text>
            <Text style={styles.infoText}>
              • المستخدمون الحاليون سيحتفظون بشروط اشتراكهم الحالي
            </Text>
          </View>
        </ScrollView>

        {renderEditModal()}
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  subscriptionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subscriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subscriptionDetails: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  subscriptionPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  subscriptionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 13,
    color: COLORS.darkGray,
    lineHeight: 18,
    marginBottom: 4,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 4,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.black,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  featuresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureInput: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
});