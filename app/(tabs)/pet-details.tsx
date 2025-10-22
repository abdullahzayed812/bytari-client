import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { useLocalSearchParams, useRouter } from 'expo-router';
import Button from "../../components/Button";
import { Calendar, Clock, MapPin, MessageSquare, AlertTriangle, Plus, X, Camera, Edit3, Trash2 } from 'lucide-react-native';
import { MedicalRecord, Pet, Reminder, Vaccination } from "../../types";
import * as ImagePicker from 'expo-image-picker';

export default function PetDetailsScreen() {
  const { t } = useI18n();
  const { pets, updatePet, userMode, user, sendNotification, addTreatmentCard } = useApp();
  const router = useRouter();
  const { id, clinicAccess } = useLocalSearchParams<{ id: string; clinicAccess?: string }>();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'medical' | 'vaccinations' | 'reminders'>('info');
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [treatmentForm, setTreatmentForm] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: '',
    followUpDate: '',
  });
  
  // Modal states for adding records
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpRequestSent, setFollowUpRequestSent] = useState(false);
  
  // Form states
  const [medicalForm, setMedicalForm] = useState({ diagnosis: '', treatment: '', notes: '', prescriptionImage: '' });
  const [vaccinationForm, setVaccinationForm] = useState({ name: '', nextDate: '', notes: '' });
  const [reminderForm, setReminderForm] = useState({ title: '', description: '', date: '' });
  const [followUpForm, setFollowUpForm] = useState({ reason: '', notes: '', urgency: 'normal' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    type: '',
    breed: '',
    age: '',
    gender: '',
    weight: '',
    color: '',
    birthDate: '',
    image: ''
  });
  
  const isClinicAccess = clinicAccess === 'true' && userMode === 'veterinarian';
  const isOwner = !isClinicAccess && userMode === 'pet_owner';
  
  // Check if pet has any clinic follow-ups (medical records, vaccinations, or reminders from clinics)
  const hasClinicFollowUps = pet ? (
    pet.medicalRecords.length > 0 || 
    pet.vaccinations.some(v => v.clinicName) || 
    pet.reminders.length > 0
  ) : false;

  useEffect(() => {
    if (id) {
      // First try to find in user's pets
      let foundPet = pets.find((p: Pet) => p.id === id);
      
      // If not found and this is clinic access, search in all mock pets
      if (!foundPet && isClinicAccess) {
        const { mockPets } = require('@/mocks/data');
        foundPet = mockPets.find((p: Pet) => p.id === id);
      }
      
      // If still not found, search in all mock pets for general access
      if (!foundPet) {
        const { mockPets } = require('@/mocks/data');
        foundPet = mockPets.find((p: Pet) => p.id === id);
      }
      
      if (foundPet) {
        setPet(foundPet);
        setEditForm({
          name: foundPet.name || '',
          type: foundPet.type || '',
          breed: foundPet.breed || '',
          age: foundPet.age?.toString() || '',
          gender: foundPet.gender || '',
          weight: foundPet.weight?.toString() || '',
          color: foundPet.color || '',
          birthDate: foundPet.birthDate || '',
          image: foundPet.image || ''
        });
      }
    }
  }, [id, pets, isClinicAccess]);

  const handleReportLost = () => {
    if (pet) {
      router.push({
        pathname: '/report-lost-pet',
        params: { petId: pet.id }
      });
    }
  };

  const handleAddMedicalRecord = () => {
    if (!isClinicAccess || !pet || !user) return;
    setShowMedicalModal(true);
  };

  const handleAddVaccination = () => {
    if (!isClinicAccess || !pet || !user) return;
    setShowVaccinationModal(true);
  };

  const handleAddReminder = () => {
    if (!isClinicAccess || !pet || !user) return;
    setShowReminderModal(true);
  };

  const handleFollowUp = () => {
    if (!isClinicAccess || !pet || !user) return;
    setShowFollowUpModal(true);
  };

  const submitFollowUpRequest = async () => {
    if (!followUpForm.reason) {
      Alert.alert('خطأ', 'يرجى إدخال سبب المتابعة');
      return;
    }
    
    if (!pet) return;
    
    await sendClinicNotification(
      'follow_up', 
      'طلب متابعة الحالة', 
      `تم طلب متابعة حالة الحيوان ${pet?.name} - السبب: ${followUpForm.reason}`
    );
    
    setShowFollowUpModal(false);
    setFollowUpRequestSent(true);
    setFollowUpForm({ reason: '', notes: '', urgency: 'normal' });
    
    Alert.alert(
      'تم إرسال الطلب',
      'تم إرسال طلب متابعة الحالة لصاحب الحيوان وفي انتظار الموافقة',
      [{ text: 'موافق', onPress: () => setFollowUpRequestSent(false) }]
    );
  };

  const handleAddTreatmentCard = () => {
    if (!isClinicAccess || !pet || !user) return;
    setShowTreatmentModal(true);
  };

  const handlePrescriptionImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى الصور');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setMedicalForm(prev => ({ ...prev, prescriptionImage: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة');
    }
  };

  const handlePetImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى الصور');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEditForm(prev => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة');
    }
  };

  const sendClinicNotification = async (actionType: 'medical_record' | 'vaccination' | 'reminder' | 'follow_up', title: string, message: string) => {
    if (!pet || !user) return;
    
    const actionTypeText = {
      'medical_record': 'إضافة سجل طبي',
      'vaccination': 'إضافة تطعيم', 
      'reminder': 'إضافة تذكير',
      'follow_up': 'متابعة الحالة'
    }[actionType];
    
    await sendNotification({
      userId: pet.ownerId,
      type: actionType,
      title: `طلب ${actionTypeText}`,
      message: `طلبت العيادة ${user.clinicName || 'العيادة'} ${actionTypeText} للحيوان ${pet.name}. يمكنك الموافقة أو الرفض أو الإبلاغ عن العيادة إذا لم تزرها.`,
      data: {
        petId: pet.id,
        petName: pet.name,
        clinicId: user.id,
        clinicName: user.clinicName || 'العيادة',
        actionType
      },
      status: 'pending',
    });
  };

  const addMedicalRecord = async (diagnosis: string, treatment: string, notes: string) => {
    if (!pet || !user) return;
    
    const newRecord = {
      id: Date.now().toString(),
      petId: pet.id,
      clinicId: user.id,
      clinicName: user.clinicName || 'العيادة',
      diagnosis,
      treatment,
      notes,
      date: new Date().toISOString(),
    };
    
    const updatedPet = {
      ...pet,
      medicalRecords: [...pet.medicalRecords, newRecord]
    };
    
    await updatePet(updatedPet);
    setPet(updatedPet);
    
    await sendClinicNotification('medical_record', 'سجل طبي جديد', `تم إضافة سجل طبي جديد للحيوان ${pet.name}`);
  };

  const addVaccination = async (name: string, nextDate: string, notes: string) => {
    if (!pet || !user) return;
    
    const newVaccination = {
      id: Date.now().toString(),
      petId: pet.id,
      name,
      date: new Date().toISOString(),
      nextDate: nextDate ? new Date(nextDate).toISOString() : undefined,
      clinicName: user.clinicName || 'العيادة',
      notes,
    };
    
    const updatedPet = {
      ...pet,
      vaccinations: [...pet.vaccinations, newVaccination]
    };
    
    await updatePet(updatedPet);
    setPet(updatedPet);
    
    await sendClinicNotification('vaccination', 'تطعيم جديد', `تم إضافة تطعيم ${name} للحيوان ${pet.name}`);
  };

  const addReminder = async (title: string, description: string, reminderDate: string) => {
    if (!pet || !user) return;
    
    const newReminder = {
      id: Date.now().toString(),
      petId: pet.id,
      title,
      description,
      date: new Date(reminderDate).toISOString(),
      type: 'checkup' as const,
      isCompleted: false,
    };
    
    const updatedPet = {
      ...pet,
      reminders: [...pet.reminders, newReminder]
    };
    
    await updatePet(updatedPet);
    setPet(updatedPet);
    
    await sendClinicNotification('reminder', 'تذكير جديد', `تم إضافة تذكير ${title} للحيوان ${pet.name}`);
  };

  const submitTreatmentCard = async () => {
    if (!pet || !user || !treatmentForm.medications[0].name) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    await addTreatmentCard({
      petId: pet.id,
      clinicId: user.id,
      clinicName: user.clinicName || 'العيادة',
      medications: treatmentForm.medications.filter(med => med.name),
      instructions: treatmentForm.instructions,
      followUpDate: treatmentForm.followUpDate,
    });
    
    setShowTreatmentModal(false);
    setTreatmentForm({
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      instructions: '',
      followUpDate: '',
    });
    
    Alert.alert(
      'تم إرسال الطلب',
      'تم إرسال طلب كرت صرف العلاج لصاحب الحيوان وفي انتظار الموافقة',
      [{ text: 'موافق' }]
    );
  };

  const addMedicationField = () => {
    setTreatmentForm(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedicationField = (index: number) => {
    setTreatmentForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setTreatmentForm(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };
  
  const submitMedicalRecord = async () => {
    if (!medicalForm.diagnosis || !medicalForm.treatment) {
      Alert.alert('خطأ', 'يرجى ملء الحقول المطلوبة');
      return;
    }
    
    await sendClinicNotification(
      'medical_record',
      'طلب إضافة سجل طبي',
      `طلب إضافة سجل طبي جديد للحيوان ${pet?.name} - التشخيص: ${medicalForm.diagnosis}`
    );
    
    setShowMedicalModal(false);
    setMedicalForm({ diagnosis: '', treatment: '', notes: '', prescriptionImage: '' });
    
    Alert.alert(
      'تم إرسال الطلب',
      'تم إرسال طلب إضافة السجل الطبي لصاحب الحيوان وفي انتظار الموافقة',
      [{ text: 'موافق' }]
    );
  };
  
  const submitVaccination = async () => {
    if (!vaccinationForm.name) {
      Alert.alert('خطأ', 'يرجى إدخال اسم التطعيم');
      return;
    }
    
    await sendClinicNotification(
      'vaccination',
      'طلب إضافة تطعيم',
      `طلب إضافة تطعيم ${vaccinationForm.name} للحيوان ${pet?.name}`
    );
    
    setShowVaccinationModal(false);
    setVaccinationForm({ name: '', nextDate: '', notes: '' });
    
    Alert.alert(
      'تم إرسال الطلب',
      'تم إرسال طلب إضافة التطعيم لصاحب الحيوان وفي انتظار الموافقة',
      [{ text: 'موافق' }]
    );
  };
  
  const submitReminder = async () => {
    if (!reminderForm.title || !reminderForm.date) {
      Alert.alert('خطأ', 'يرجى ملء الحقول المطلوبة');
      return;
    }
    
    await sendClinicNotification(
      'reminder',
      'طلب إضافة تذكير',
      `طلب إضافة تذكير ${reminderForm.title} للحيوان ${pet?.name}`
    );
    
    setShowReminderModal(false);
    setReminderForm({ title: '', description: '', date: '' });
    
    Alert.alert(
      'تم إرسال الطلب',
      'تم إرسال طلب إضافة التذكير لصاحب الحيوان وفي انتظار الموافقة',
      [{ text: 'موافق' }]
    );
  };

  const handleEditPet = () => {
    if (!pet) return;
    setShowEditModal(true);
  };

  const submitEditPet = async () => {
    if (!editForm.name || !editForm.type) {
      Alert.alert('خطأ', 'يرجى ملء الحقول المطلوبة');
      return;
    }
    
    if (!pet) return;
    
    const updatedPet = {
      ...pet,
      name: editForm.name,
      type: editForm.type as 'dog' | 'cat' | 'rabbit' | 'bird' | 'other',
      breed: editForm.breed,
      age: editForm.age ? parseInt(editForm.age) : pet.age,
      gender: editForm.gender as 'male' | 'female',
      weight: editForm.weight ? parseFloat(editForm.weight) : pet.weight,
      color: editForm.color,
      birthDate: editForm.birthDate,
      image: editForm.image || pet.image
    };
    
    await updatePet(updatedPet);
    setPet(updatedPet);
    setShowEditModal(false);
    
    Alert.alert('تم', 'تم تحديث معلومات الحيوان بنجاح');
  };

  const handleDeleteMedicalRecord = (recordId: string) => {
    if (!pet) return;
    
    Alert.alert(
      'حذف السجل الطبي',
      'هل أنت متأكد من حذف هذا السجل الطبي؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const updatedPet = {
              ...pet,
              medicalRecords: pet.medicalRecords.filter(record => record.id !== recordId)
            };
            await updatePet(updatedPet);
            setPet(updatedPet);
            Alert.alert('تم', 'تم حذف السجل الطبي');
          }
        }
      ]
    );
  };

  const handleDeleteVaccination = (vaccinationId: string) => {
    if (!pet) return;
    
    Alert.alert(
      'حذف التطعيم',
      'هل أنت متأكد من حذف هذا التطعيم؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const updatedPet = {
              ...pet,
              vaccinations: pet.vaccinations.filter(vaccination => vaccination.id !== vaccinationId)
            };
            await updatePet(updatedPet);
            setPet(updatedPet);
            Alert.alert('تم', 'تم حذف التطعيم');
          }
        }
      ]
    );
  };

  const handleDeleteReminder = (reminderId: string) => {
    if (!pet) return;
    
    Alert.alert(
      'حذف التذكير',
      'هل أنت متأكد من حذف هذا التذكير؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const updatedPet = {
              ...pet,
              reminders: pet.reminders.filter(reminder => reminder.id !== reminderId)
            };
            await updatePet(updatedPet);
            setPet(updatedPet);
            Alert.alert('تم', 'تم حذف التذكير');
          }
        }
      ]
    );
  };

  const handleCancelFollowUp = () => {
    
    Alert.alert(
      'إلغاء المتابعات',
      'هل تريد إلغاء جميع طلبات المتابعة المعلقة لهذا الحيوان؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم',
          onPress: () => {
            Alert.alert('تم', 'تم إلغاء جميع طلبات المتابعة المعلقة');
          }
        }
      ]
    );
  };

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Pet not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: pet.image }} style={styles.petImage} />
        <View style={styles.petInfo}>
          <View style={styles.petNameRow}>
            <Text style={styles.petName}>{pet.name}</Text>
            {/* Edit Icon - Always show for demonstration */}
            <TouchableOpacity onPress={handleEditPet} style={styles.editIcon}>
              <Edit3 size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.petType}>
            {t(`pets.types.${pet.type}`)} {pet.breed ? `- ${pet.breed}` : ''}
          </Text>
          
          <View style={styles.petDetailsRow}>
            <View style={styles.petDetailItem}>
              <Text style={styles.petDetailLabel}>{t('pets.age')}</Text>
              <Text style={styles.petDetailValue}>{pet.age} سنة</Text>
            </View>
            
            <View style={styles.petDetailItem}>
              <Text style={styles.petDetailLabel}>{t('pets.gender')}</Text>
              <Text style={styles.petDetailValue}>
                {pet.gender === 'male' ? t('pets.male') : t('pets.female')}
              </Text>
            </View>
            
            {pet.weight && (
              <View style={styles.petDetailItem}>
                <Text style={styles.petDetailLabel}>{t('pets.weight')}</Text>
                <Text style={styles.petDetailValue}>{pet.weight} كجم</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            معلومات
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'medical' && styles.activeTab]}
          onPress={() => setActiveTab('medical')}
        >
          <Text style={[styles.tabText, activeTab === 'medical' && styles.activeTabText]}>
            السجل الطبي
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vaccinations' && styles.activeTab]}
          onPress={() => setActiveTab('vaccinations')}
        >
          <Text style={[styles.tabText, activeTab === 'vaccinations' && styles.activeTabText]}>
            التطعيمات
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reminders' && styles.activeTab]}
          onPress={() => setActiveTab('reminders')}
        >
          <Text style={[styles.tabText, activeTab === 'reminders' && styles.activeTabText]}>
            التذكيرات
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {activeTab === 'info' && (
          <View>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>معلومات عامة</Text>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t('pets.birthDate')}</Text>
                <Text style={styles.infoValue}>
                  {pet.birthDate ? new Date(pet.birthDate).toLocaleDateString() : 'غير محدد'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t('pets.color')}</Text>
                <Text style={styles.infoValue}>{pet.color || 'غير محدد'}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>رقم المعرف</Text>
                <Text style={styles.infoValue}>{pet.id}</Text>
              </View>
            </View>
            
            {/* Owner Actions - Always show for demonstration */}
            <View style={styles.ownerActions}>
              {/* Cancel Follow-ups Button */}
              <Button
                title="إلغاء المتابعات"
                onPress={handleCancelFollowUp}
                type="outline"
                size="medium"
                style={styles.actionButton}
                icon={<X size={16} color={COLORS.primary} />}
              />
              
              {/* Report Lost Button */}
              <Button
                title={t('pets.reportLost')}
                onPress={handleReportLost}
                type="outline"
                size="medium"
                icon={<AlertTriangle size={16} color={COLORS.primary} />}
                style={styles.actionButton}
              />
              
              {/* Adoption and Breeding Buttons */}
              <View style={styles.adoptionBreedingButtons}>
                <Button
                  title="عرض للتبني"
                  onPress={() => {
                    console.log(`Show pet ${pet.id} for adoption`);
                    Alert.alert(
                      'عرض للتبني',
                      'هل تريد عرض هذا الحيوان للتبني؟ سيتم إضافته إلى قائمة الحيوانات المتاحة للتبني.',
                      [
                        { text: 'إلغاء', style: 'cancel' },
                        { 
                          text: 'نعم', 
                          onPress: () => {
                            Alert.alert('تم', 'تم عرض الحيوان للتبني بنجاح');
                          }
                        }
                      ]
                    );
                  }}
                  type="primary"
                  size="medium"
                  style={[styles.actionButton, styles.adoptionButton]}
                />
                
                <Button
                  title="عرض للتزاوج"
                  onPress={() => {
                    console.log(`Show pet ${pet.id} for breeding`);
                    Alert.alert(
                      'عرض للتزاوج',
                      'هل تريد عرض هذا الحيوان للتزاوج؟ سيتم إضافته إلى قائمة الحيوانات المتاحة للتزاوج.',
                      [
                        { text: 'إلغاء', style: 'cancel' },
                        { 
                          text: 'نعم', 
                          onPress: () => {
                            Alert.alert('تم', 'تم عرض الحيوان للتزاوج بنجاح');
                          }
                        }
                      ]
                    );
                  }}
                  type="primary"
                  size="medium"
                  style={[styles.actionButton, styles.breedingButton]}
                />
              </View>
            </View>
          </View>
        )}
        
        {activeTab === 'medical' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('pets.medicalRecord')}</Text>
              {isClinicAccess && (
                <Button
                  title="إضافة سجل"
                  onPress={handleAddMedicalRecord}
                  type="primary"
                  size="small"
                />
              )}
            </View>
            
            {pet.medicalRecords.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>لا يوجد سجلات طبية</Text>
              </View>
            ) : (
              pet.medicalRecords.map((record: MedicalRecord) => (
                <View key={record.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordTitleRow}>
                      <Text style={styles.recordTitle}>{record.diagnosis}</Text>
                      {/* Delete Button - Always show for demonstration */}
                      <TouchableOpacity 
                        onPress={() => handleDeleteMedicalRecord(record.id)}
                        style={styles.deleteButton}
                      >
                        <Trash2 size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.recordDate}>
                      {new Date(record.date).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>العيادة</Text>
                    <Text style={styles.recordValue}>{record.clinicName}</Text>
                  </View>
                  
                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>العلاج</Text>
                    <Text style={styles.recordValue}>{record.treatment}</Text>
                  </View>
                  
                  {record.notes && (
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>ملاحظات</Text>
                      <Text style={styles.recordValue}>{record.notes}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
        
        {activeTab === 'vaccinations' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('pets.vaccinations')}</Text>
              {isClinicAccess && (
                <Button
                  title="إضافة تطعيم"
                  onPress={handleAddVaccination}
                  type="primary"
                  size="small"
                />
              )}
            </View>
            
            {pet.vaccinations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>لا يوجد تطعيمات</Text>
              </View>
            ) : (
              pet.vaccinations.map((vaccination: Vaccination) => (
                <View key={vaccination.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordTitleRow}>
                      <Text style={styles.recordTitle}>{vaccination.name}</Text>
                      {/* Delete Button - Always show for demonstration */}
                      <TouchableOpacity 
                        onPress={() => handleDeleteVaccination(vaccination.id)}
                        style={styles.deleteButton}
                      >
                        <Trash2 size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.recordDate}>
                      {new Date(vaccination.date).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {vaccination.clinicName && (
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>العيادة</Text>
                      <Text style={styles.recordValue}>{vaccination.clinicName}</Text>
                    </View>
                  )}
                  
                  {vaccination.nextDate && (
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>الموعد القادم</Text>
                      <Text style={styles.recordValue}>
                        {new Date(vaccination.nextDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  
                  {vaccination.notes && (
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>ملاحظات</Text>
                      <Text style={styles.recordValue}>{vaccination.notes}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
        
        {activeTab === 'reminders' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('pets.reminders')}</Text>
              {isClinicAccess && (
                <Button
                  title="إضافة تذكير"
                  onPress={handleAddReminder}
                  type="primary"
                  size="small"
                />
              )}
            </View>
            
            {pet.reminders.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>لا يوجد تذكيرات</Text>
              </View>
            ) : (
              pet.reminders.map((reminder: Reminder) => (
                <View
                  key={reminder.id}
                  style={[
                    styles.recordCard,
                    reminder.isCompleted && styles.completedReminderCard,
                  ]}
                >
                  <View style={styles.recordHeader}>
                    <View style={styles.recordTitleRow}>
                      <Text style={styles.recordTitle}>{reminder.title}</Text>
                      {/* Delete Button - Always show for demonstration */}
                      <TouchableOpacity 
                        onPress={() => handleDeleteReminder(reminder.id)}
                        style={styles.deleteButton}
                      >
                        <Trash2 size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.recordDate}>
                      {new Date(reminder.date).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {reminder.description && (
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>الوصف</Text>
                      <Text style={styles.recordValue}>{reminder.description}</Text>
                    </View>
                  )}
                  
                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>النوع</Text>
                    <Text style={styles.recordValue}>
                      {reminder.type === 'vaccination'
                        ? 'تطعيم'
                        : reminder.type === 'medication'
                        ? 'دواء'
                        : reminder.type === 'checkup'
                        ? 'فحص'
                        : 'أخرى'}
                    </Text>
                  </View>
                  
                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>الحالة</Text>
                    <Text
                      style={[
                        styles.recordValue,
                        reminder.isCompleted
                          ? styles.completedStatus
                          : styles.pendingStatus,
                      ]}
                    >
                      {reminder.isCompleted ? 'مكتمل' : 'قيد الانتظار'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>
      
      {/* Edit Pet Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تعديل معلومات الحيوان</Text>
            <TouchableOpacity onPress={submitEditPet}>
              <Text style={styles.saveButton}>حفظ</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>صورة الحيوان</Text>
              <View style={styles.imageUploadContainer}>
                <TouchableOpacity onPress={handlePetImageUpload} style={styles.imageUploadButton}>
                  {editForm.image ? (
                    <Image source={{ uri: editForm.image }} style={styles.uploadedImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Camera size={32} color={COLORS.darkGray} />
                      <Text style={styles.imagePlaceholderText}>اضغط لاختيار صورة</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {editForm.image && (
                  <TouchableOpacity 
                    onPress={() => setEditForm(prev => ({ ...prev, image: '' }))}
                    style={styles.removeImageButton}
                  >
                    <X size={16} color={COLORS.white} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>اسم الحيوان *</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                placeholder="أدخل اسم الحيوان"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>نوع الحيوان *</Text>
              <View style={styles.typeSelector}>
                {['dog', 'cat', 'rabbit', 'bird', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      editForm.type === type && styles.selectedTypeOption
                    ]}
                    onPress={() => setEditForm(prev => ({ ...prev, type }))}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      editForm.type === type && styles.selectedTypeOptionText
                    ]}>
                      {type === 'dog' ? 'كلب' : 
                       type === 'cat' ? 'قطة' :
                       type === 'rabbit' ? 'أرنب' :
                       type === 'bird' ? 'طائر' : 'أخرى'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>السلالة</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.breed}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, breed: text }))}
                placeholder="أدخل السلالة"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>العمر (سنة)</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.age}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, age: text }))}
                  placeholder="العمر"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>الوزن (كجم)</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.weight}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, weight: text }))}
                  placeholder="الوزن"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>الجنس</Text>
              <View style={styles.genderSelector}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editForm.gender === 'male' && styles.selectedGenderOption
                  ]}
                  onPress={() => setEditForm(prev => ({ ...prev, gender: 'male' }))}
                >
                  <Text style={[
                    styles.genderOptionText,
                    editForm.gender === 'male' && styles.selectedGenderOptionText
                  ]}>ذكر</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editForm.gender === 'female' && styles.selectedGenderOption
                  ]}
                  onPress={() => setEditForm(prev => ({ ...prev, gender: 'female' }))}
                >
                  <Text style={[
                    styles.genderOptionText,
                    editForm.gender === 'female' && styles.selectedGenderOptionText
                  ]}>أنثى</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>اللون</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.color}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, color: text }))}
                placeholder="أدخل لون الحيوان"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>تاريخ الميلاد</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.birthDate}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, birthDate: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  petInfo: {
    flex: 1,
    marginRight: 16,
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  petType: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  petDetailsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  petDetailItem: {
    alignItems: 'center',
  },
  petDetailLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  petDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  tabsContainer: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  reportLostButton: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  recordCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  completedReminderCard: {
    opacity: 0.7,
  },
  recordHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  recordDate: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  recordItem: {
    marginBottom: 8,
  },
  recordLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 14,
    color: COLORS.black,
  },
  completedStatus: {
    color: COLORS.success,
  },
  pendingStatus: {
    color: COLORS.warning,
  },
  notFoundText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
    color: COLORS.darkGray,
  },
  petNameRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  editIcon: {
    padding: 4,
  },
  ownerActions: {
    gap: 16,
  },
  adoptionBreedingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  adoptionButton: {
    backgroundColor: '#10B981',
  },
  breedingButton: {
    backgroundColor: '#8B5CF6',
  },
  recordTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'right',
    backgroundColor: COLORS.white,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  formHalf: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  selectedTypeOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeOptionText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  selectedTypeOptionText: {
    color: COLORS.white,
  },
  genderSelector: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  selectedGenderOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderOptionText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  selectedGenderOptionText: {
    color: COLORS.white,
  },
  imageUploadContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  imageUploadButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
  },
  uploadedImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});