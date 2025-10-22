import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useLocalSearchParams, useRouter } from 'expo-router';
import Button from "../components/Button";
import { Calendar, Clock, MapPin, MessageSquare, AlertTriangle, Plus, X, Camera, Edit3, Trash2 } from 'lucide-react-native';
import { MedicalRecord, Pet, Reminder, Vaccination } from "../types";
import * as ImagePicker from 'expo-image-picker';

export default function PetDetailsScreen() {
  const { t } = useI18n();
  const { pets, updatePet, userMode, user, sendNotification, addTreatmentCard } = useApp();
  const router = useRouter();
  const { petId, id, clinicAccess, fromClinic, openSection } = useLocalSearchParams<{ petId?: string; id?: string; clinicAccess?: string; fromClinic?: string; openSection?: string }>();
  
  // Use petId if available, otherwise use id for backward compatibility
  const actualPetId = petId || id;
  
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
    birthDate: ''
  });
  
  const isClinicAccess = (clinicAccess === 'true' || fromClinic === 'true') && userMode === 'veterinarian';
  const isOwner = !isClinicAccess && userMode === 'pet_owner';
  
  // Check if pet has any clinic follow-ups (medical records, vaccinations, or reminders from clinics)
  const hasClinicFollowUps = pet ? (
    pet.medicalRecords.length > 0 || 
    pet.vaccinations.some(v => v.clinicName) || 
    pet.reminders.length > 0
  ) : false;

  useEffect(() => {
    if (actualPetId) {
      // First try to find in user's pets
      let foundPet = pets.find((p: Pet) => p.id === actualPetId);
      
      // If not found and this is clinic access, search in all mock pets
      if (!foundPet && (isClinicAccess || fromClinic === 'true')) {
        const { mockPets } = require('@/mocks/data');
        foundPet = mockPets.find((p: Pet) => p.id === actualPetId);
      }
      
      // If still not found, search in all mock pets for general access
      if (!foundPet) {
        const { mockPets } = require('@/mocks/data');
        foundPet = mockPets.find((p: Pet) => p.id === actualPetId);
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
          birthDate: foundPet.birthDate || ''
        });
      }
    }
  }, [actualPetId, pets, isClinicAccess, fromClinic]);

  // Handle opening specific section when navigating from clinic pages
  useEffect(() => {
    if (openSection && pet) {
      switch (openSection) {
        case 'followups':
        case 'medical':
          setActiveTab('medical');
          break;
        case 'vaccinations':
          setActiveTab('vaccinations');
          break;
        case 'reminders':
          setActiveTab('reminders');
          break;
        default:
          setActiveTab('info');
      }
    }
  }, [openSection, pet]);

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
    if (!isOwner || !pet) return;
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
      birthDate: editForm.birthDate
    };
    
    await updatePet(updatedPet);
    setPet(updatedPet);
    setShowEditModal(false);
    
    Alert.alert('تم', 'تم تحديث معلومات الحيوان بنجاح');
  };

  const handleDeleteMedicalRecord = (recordId: string) => {
    if (!isOwner || !pet) return;
    
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
    if (!isOwner || !pet) return;
    
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
    if (!isOwner || !pet) return;
    
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
    if (!isOwner) return;
    
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
            {isOwner && (
              <TouchableOpacity onPress={handleEditPet} style={styles.editIcon}>
                <Edit3 size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
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
          
          {isClinicAccess && (
            <View style={styles.clinicActions}>
              <Button
                title="متابعة الحالة"
                onPress={handleFollowUp}
                type="primary"
                size="medium"
                style={styles.followUpButton}
              />
            </View>
          )}
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
            
            {isOwner && (
              <View style={styles.ownerActions}>
                {hasClinicFollowUps && (
                  <Button
                    title="إلغاء المتابعات"
                    onPress={handleCancelFollowUp}
                    type="outline"
                    size="medium"
                    style={styles.actionButton}
                  />
                )}
                
                <Button
                  title={t('pets.reportLost')}
                  onPress={handleReportLost}
                  type="outline"
                  size="medium"
                  icon={<AlertTriangle size={16} color={COLORS.primary} />}
                  style={styles.actionButton}
                />
                
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
                              // TODO: Implement show for adoption functionality
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
                              // TODO: Implement show for breeding functionality
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
            )}
          </View>
        )}
        
        {activeTab === 'medical' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('pets.medicalRecord')}</Text>
              {isClinicAccess && userMode === 'veterinarian' && (
                <TouchableOpacity 
                  style={styles.addSectionButton}
                  onPress={handleAddMedicalRecord}
                >
                  <Plus size={16} color={COLORS.primary} />
                  <Text style={styles.addSectionButtonText}>إضافة سجل</Text>
                </TouchableOpacity>
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
                      {isOwner && (
                        <TouchableOpacity 
                          onPress={() => handleDeleteMedicalRecord(record.id)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={16} color={COLORS.error} />
                        </TouchableOpacity>
                      )}
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
              {isClinicAccess && userMode === 'veterinarian' && (
                <TouchableOpacity 
                  style={styles.addSectionButton}
                  onPress={handleAddVaccination}
                >
                  <Plus size={16} color={COLORS.primary} />
                  <Text style={styles.addSectionButtonText}>إضافة تطعيم</Text>
                </TouchableOpacity>
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
                      {isOwner && (
                        <TouchableOpacity 
                          onPress={() => handleDeleteVaccination(vaccination.id)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={16} color={COLORS.error} />
                        </TouchableOpacity>
                      )}
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
              {isClinicAccess && userMode === 'veterinarian' && (
                <TouchableOpacity 
                  style={styles.addSectionButton}
                  onPress={handleAddReminder}
                >
                  <Plus size={16} color={COLORS.primary} />
                  <Text style={styles.addSectionButtonText}>إضافة تذكير</Text>
                </TouchableOpacity>
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
                      {isOwner && (
                        <TouchableOpacity 
                          onPress={() => handleDeleteReminder(reminder.id)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={16} color={COLORS.error} />
                        </TouchableOpacity>
                      )}
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
      
      <Modal
        visible={showTreatmentModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>كرت صرف علاج</Text>
            <TouchableOpacity onPress={() => setShowTreatmentModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>الأدوية</Text>
            
            {treatmentForm.medications.map((medication, index) => (
              <View key={index} style={styles.medicationCard}>
                <View style={styles.medicationHeader}>
                  <Text style={styles.medicationIndex}>دواء {index + 1}</Text>
                  {treatmentForm.medications.length > 1 && (
                    <TouchableOpacity onPress={() => removeMedicationField(index)}>
                      <X size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </View>
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="اسم الدواء"
                  value={medication.name}
                  onChangeText={(value) => updateMedication(index, 'name', value)}
                />
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="الجرعة"
                  value={medication.dosage}
                  onChangeText={(value) => updateMedication(index, 'dosage', value)}
                />
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="عدد مرات الاستخدام"
                  value={medication.frequency}
                  onChangeText={(value) => updateMedication(index, 'frequency', value)}
                />
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="مدة الاستخدام"
                  value={medication.duration}
                  onChangeText={(value) => updateMedication(index, 'duration', value)}
                />
              </View>
            ))}
            
            <TouchableOpacity style={styles.addMedicationButton} onPress={addMedicationField}>
              <Plus size={20} color={COLORS.primary} />
              <Text style={styles.addMedicationText}>إضافة دواء آخر</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalSectionTitle}>التعليمات</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="تعليمات الاستخدام"
              value={treatmentForm.instructions}
              onChangeText={(value) => setTreatmentForm(prev => ({ ...prev, instructions: value }))}
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.modalSectionTitle}>موعد المتابعة (اختياري)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="تاريخ المتابعة"
              value={treatmentForm.followUpDate}
              onChangeText={(value) => setTreatmentForm(prev => ({ ...prev, followUpDate: value }))}
            />
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="إلغاء"
              onPress={() => setShowTreatmentModal(false)}
              type="outline"
              size="medium"
              style={styles.modalButton}
            />
            <Button
              title="إرسال"
              onPress={submitTreatmentCard}
              type="primary"
              size="medium"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
      
      {/* Medical Record Modal */}
      <Modal
        visible={showMedicalModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>إضافة سجل طبي</Text>
            <TouchableOpacity onPress={() => setShowMedicalModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>التشخيص *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="أدخل التشخيص"
              value={medicalForm.diagnosis}
              onChangeText={(value) => setMedicalForm(prev => ({ ...prev, diagnosis: value }))}
            />
            
            <Text style={styles.modalSectionTitle}>العلاج *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="أدخل العلاج"
              value={medicalForm.treatment}
              onChangeText={(value) => setMedicalForm(prev => ({ ...prev, treatment: value }))}
            />
            
            <Text style={styles.modalSectionTitle}>ملاحظات إضافية</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="أدخل ملاحظات إضافية (اختياري)"
              value={medicalForm.notes}
              onChangeText={(value) => setMedicalForm(prev => ({ ...prev, notes: value }))}
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.modalSectionTitle}>صورة الوصفة (اختياري)</Text>
            <TouchableOpacity 
              style={styles.prescriptionImageButton}
              onPress={handlePrescriptionImageUpload}
            >
              <Camera size={24} color={COLORS.primary} />
              <Text style={styles.prescriptionImageText}>
                {medicalForm.prescriptionImage ? 'تم رفع الصورة' : 'رفع صورة الوصفة'}
              </Text>
            </TouchableOpacity>
            
            {medicalForm.prescriptionImage && (
              <View style={styles.uploadedImageContainer}>
                <Image 
                  source={{ uri: medicalForm.prescriptionImage }} 
                  style={styles.uploadedImage} 
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setMedicalForm(prev => ({ ...prev, prescriptionImage: '' }))}
                >
                  <X size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="إلغاء"
              onPress={() => setShowMedicalModal(false)}
              type="outline"
              size="medium"
              style={styles.modalButton}
            />
            <Button
              title="حفظ"
              onPress={submitMedicalRecord}
              type="primary"
              size="medium"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
      
      {/* Vaccination Modal */}
      <Modal
        visible={showVaccinationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>إضافة تطعيم</Text>
            <TouchableOpacity onPress={() => setShowVaccinationModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>اسم التطعيم *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="أدخل اسم التطعيم"
              value={vaccinationForm.name}
              onChangeText={(value) => setVaccinationForm(prev => ({ ...prev, name: value }))}
            />
            
            <Text style={styles.modalSectionTitle}>تاريخ التطعيم القادم</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="YYYY-MM-DD (اختياري)"
              value={vaccinationForm.nextDate}
              onChangeText={(value) => setVaccinationForm(prev => ({ ...prev, nextDate: value }))}
            />
            
            <Text style={styles.modalSectionTitle}>ملاحظات إضافية</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="أدخل ملاحظات إضافية (اختياري)"
              value={vaccinationForm.notes}
              onChangeText={(value) => setVaccinationForm(prev => ({ ...prev, notes: value }))}
              multiline
              numberOfLines={4}
            />
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="إلغاء"
              onPress={() => setShowVaccinationModal(false)}
              type="outline"
              size="medium"
              style={styles.modalButton}
            />
            <Button
              title="حفظ"
              onPress={submitVaccination}
              type="primary"
              size="medium"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
      
      {/* Reminder Modal */}
      <Modal
        visible={showReminderModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>إضافة تذكير</Text>
            <TouchableOpacity onPress={() => setShowReminderModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>عنوان التذكير *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="أدخل عنوان التذكير"
              value={reminderForm.title}
              onChangeText={(value) => setReminderForm(prev => ({ ...prev, title: value }))}
            />
            
            <Text style={styles.modalSectionTitle}>وصف التذكير</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="أدخل وصف التذكير (اختياري)"
              value={reminderForm.description}
              onChangeText={(value) => setReminderForm(prev => ({ ...prev, description: value }))}
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.modalSectionTitle}>تاريخ التذكير *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="YYYY-MM-DD"
              value={reminderForm.date}
              onChangeText={(value) => setReminderForm(prev => ({ ...prev, date: value }))}
            />
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="إلغاء"
              onPress={() => setShowReminderModal(false)}
              type="outline"
              size="medium"
              style={styles.modalButton}
            />
            <Button
              title="حفظ"
              onPress={submitReminder}
              type="primary"
              size="medium"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
      
      {/* Follow Up Modal */}
      <Modal
        visible={showFollowUpModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>طلب متابعة الحالة</Text>
            <TouchableOpacity onPress={() => setShowFollowUpModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.petInfoCard}>
              <Text style={styles.petInfoTitle}>معلومات الحيوان</Text>
              <Text style={styles.petInfoText}>الاسم: {pet?.name}</Text>
              <Text style={styles.petInfoText}>النوع: {pet?.type}</Text>
              <Text style={styles.petInfoText}>العمر: {pet?.age} سنة</Text>
            </View>
            
            <Text style={styles.modalSectionTitle}>سبب المتابعة *</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="أدخل سبب طلب متابعة الحالة"
              value={followUpForm.reason}
              onChangeText={(value) => setFollowUpForm(prev => ({ ...prev, reason: value }))}
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.modalSectionTitle}>ملاحظات إضافية</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="أدخل ملاحظات إضافية (اختياري)"
              value={followUpForm.notes}
              onChangeText={(value) => setFollowUpForm(prev => ({ ...prev, notes: value }))}
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.modalSectionTitle}>مستوى الأولوية</Text>
            <View style={styles.urgencyContainer}>
              <TouchableOpacity
                style={[
                  styles.urgencyOption,
                  followUpForm.urgency === 'low' && styles.urgencyOptionSelected
                ]}
                onPress={() => setFollowUpForm(prev => ({ ...prev, urgency: 'low' }))}
              >
                <Text style={[
                  styles.urgencyText,
                  followUpForm.urgency === 'low' && styles.urgencyTextSelected
                ]}>منخفضة</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.urgencyOption,
                  followUpForm.urgency === 'normal' && styles.urgencyOptionSelected
                ]}
                onPress={() => setFollowUpForm(prev => ({ ...prev, urgency: 'normal' }))}
              >
                <Text style={[
                  styles.urgencyText,
                  followUpForm.urgency === 'normal' && styles.urgencyTextSelected
                ]}>عادية</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.urgencyOption,
                  followUpForm.urgency === 'high' && styles.urgencyOptionSelected
                ]}
                onPress={() => setFollowUpForm(prev => ({ ...prev, urgency: 'high' }))}
              >
                <Text style={[
                  styles.urgencyText,
                  followUpForm.urgency === 'high' && styles.urgencyTextSelected
                ]}>عالية</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="إلغاء"
              onPress={() => setShowFollowUpModal(false)}
              type="outline"
              size="medium"
              style={styles.modalButton}
            />
            <Button
              title="إرسال الطلب"
              onPress={submitFollowUpRequest}
              type="primary"
              size="medium"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
      
      {/* Edit Pet Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>تعديل معلومات الحيوان</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>اسم الحيوان *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="أدخل اسم الحيوان"
              value={editForm.name}
              onChangeText={(value) => setEditForm(prev => ({ ...prev, name: value }))}
            />
            
            <Text style={styles.modalSectionTitle}>نوع الحيوان *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="أدخل نوع الحيوان"
              value={editForm.type}
              onChangeText={(value) => setEditForm(prev => ({ ...prev, type: value }))}
            />
            
            <Text style={styles.modalSectionTitle}>السلالة</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="أدخل السلالة (اختياري)"
              value={editForm.breed}
              onChangeText={(value) => setEditForm(prev => ({ ...prev, breed: value }))}
            />
            
            <Text style={styles.modalSectionTitle}>العمر (بالسنوات)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="أدخل العمر"
              value={editForm.age}
              onChangeText={(value) => setEditForm(prev => ({ ...prev, age: value }))}
              keyboardType="numeric"
            />
            
            <Text style={styles.modalSectionTitle}>الجنس</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  editForm.gender === 'male' && styles.genderOptionSelected
                ]}
                onPress={() => setEditForm(prev => ({ ...prev, gender: 'male' }))}
              >
                <Text style={[
                  styles.genderText,
                  editForm.gender === 'male' && styles.genderTextSelected
                ]}>ذكر</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  editForm.gender === 'female' && styles.genderOptionSelected
                ]}
                onPress={() => setEditForm(prev => ({ ...prev, gender: 'female' }))}
              >
                <Text style={[
                  styles.genderText,
                  editForm.gender === 'female' && styles.genderTextSelected
                ]}>أنثى</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSectionTitle}>الوزن (كجم)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="أدخل الوزن (اختياري)"
              value={editForm.weight}
              onChangeText={(value) => setEditForm(prev => ({ ...prev, weight: value }))}
              keyboardType="numeric"
            />
            
            <Text style={styles.modalSectionTitle}>اللون</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="أدخل اللون (اختياري)"
              value={editForm.color}
              onChangeText={(value) => setEditForm(prev => ({ ...prev, color: value }))}
            />
            
            <Text style={styles.modalSectionTitle}>تاريخ الميلاد</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="YYYY-MM-DD (اختياري)"
              value={editForm.birthDate}
              onChangeText={(value) => setEditForm(prev => ({ ...prev, birthDate: value }))}
            />
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="إلغاء"
              onPress={() => setShowEditModal(false)}
              type="outline"
              size="medium"
              style={styles.modalButton}
            />
            <Button
              title="حفظ التغييرات"
              onPress={submitEditPet}
              type="primary"
              size="medium"
              style={styles.modalButton}
            />
          </View>
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
  petNameRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  editIcon: {
    padding: 4,
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
    alignItems: 'flex-start',
    marginBottom: 12,
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
  clinicActions: {
    marginTop: 16,
    alignItems: 'center',
  },
  followUpButton: {
    width: '100%',
  },
  clinicButtonsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  clinicButton: {
    minWidth: 100,
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
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    marginTop: 16,
  },
  medicationCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  medicationHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationIndex: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addMedicationButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addMedicationText: {
    marginRight: 8,
    color: COLORS.primary,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row-reverse',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  petInfoCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  petInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  petInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  urgencyContainer: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 16,
  },
  urgencyOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  urgencyOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  urgencyText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  urgencyTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  prescriptionImageButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
    marginBottom: 16,
    backgroundColor: COLORS.gray,
  },
  prescriptionImageText: {
    marginRight: 8,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  uploadedImageContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
  },
  uploadedImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderContainer: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginBottom: 16,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  genderTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  addSectionButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addSectionButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});