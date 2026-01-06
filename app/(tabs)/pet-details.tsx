import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import Button from "../../components/Button 2";
import { Camera, Edit3, Trash2, X, AlertTriangle, Plus, Check, XIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "../../lib/trpc";
import { useToastContext } from "@/providers/ToastProvider";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface TreatmentForm {
  medications: Medication[];
  instructions: string;
  followUpDate: string;
}

interface MedicalForm {
  diagnosis: string;
  treatment: string;
  notes: string;
  prescriptionImage: string;
}

interface VaccinationForm {
  name: string;
  nextDate: string;
  notes: string;
}

interface ReminderForm {
  title: string;
  description: string;
  date: string;
}

interface FollowUpForm {
  reason: string;
  notes: string;
  urgency: "low" | "normal" | "high";
}

interface AccessRequestForm {
  reason: string;
}

export default function PetDetailsScreen() {
  const { t } = useI18n();
  const { userMode, user } = useApp();
  const router = useRouter();
  const { petId, clinicId, clinicAccess, fromClinic, openSection } = useLocalSearchParams<{
    petId: string;
    clinicId: string;
    clinicAccess?: string;
    fromClinic?: string;
    openSection?: string;
  }>();
  const { showToast } = useToastContext();

  const [activeTab, setActiveTab] = useState<
    "info" | "medical" | "vaccinations" | "reminders" | "requests" | "myRequests"
  >("info");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);

  // Modal states for adding records
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showAccessRequestModal, setShowAccessRequestModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    gender: "",
    weight: "",
    color: "",
    image: "",
    medicalHistory: "",
    vaccinations: "",
    isLost: false,
  });

  // Example with pre-filled values for testing
  const [treatmentForm, setTreatmentForm] = useState<TreatmentForm>({
    medications: [
      {
        name: "",
        dosage: "مرة واحدة يومياً",
        frequency: "كل 24 ساعة",
        duration: "7 أيام",
      },
    ],
    instructions: "يؤخذ بعد الطعام",
    followUpDate: "",
  });

  const [medicalForm, setMedicalForm] = useState<MedicalForm>({
    diagnosis: "التهاب في الأذن اليمنى",
    treatment: "تنظيف الأذن واستخدام قطرات مضاد حيوي مرتين يوميًا",
    notes: "يجب متابعة الحالة بعد أسبوع للتأكد من تحسن الالتهاب.",
    prescriptionImage: "https://example.com/prescription-test.jpg",
  });

  const [vaccinationForm, setVaccinationForm] = useState<VaccinationForm>({
    name: "تطعيم داء الكلب",
    nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // بعد 30 يوم
    notes: "يُفضل إعطاء التطعيم في الصباح ومتابعة درجة الحرارة بعد التطعيم.",
  });

  const [reminderForm, setReminderForm] = useState<ReminderForm>({
    title: "تذكير بزيارة الطبيب البيطري",
    description: "زيارة متابعة بعد انتهاء كورس العلاج للتأكد من الشفاء الكامل.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // بعد 7 أيام
  });

  const [followUpForm, setFollowUpForm] = useState<FollowUpForm>({
    reason: "متابعة بعد علاج التهاب الأذن",
    notes: "يبدو أن الحيوان الأليف يستجيب جيدًا للعلاج، ولكن ما زال يحك أذنه قليلاً.",
    urgency: "normal", // يمكن أيضًا استخدام "high" أو "low" حسب الحالة
  });

  const [accessRequestForm, setAccessRequestForm] = useState<AccessRequestForm>({
    reason: "أحتاج إلى صلاحية الوصول لإدارة الحالة الصحية للحيوان",
  });

  const isClinicAccess = (clinicAccess === "true" || fromClinic === "true") && userMode === "veterinarian";
  const isOwner = !isClinicAccess && userMode === "pet_owner";
  const isAdmin = userMode === "admin";

  // State to track if clinic has access
  const [hasAccess, setHasAccess] = useState(false);

  // Fetch pet details based on user mode
  const petQuery = useQuery({
    ...trpc.pets.getProfile.queryOptions({
      petId: Number(petId),
    }),
  });

  // Fetch my clinic requests (for vets)
  const myRequestsQuery = useQuery({
    ...trpc.pets.getMyAccessRequests.queryOptions({
      petId: Number(petId),
      clinicId: Number(clinicId),
    }),
    enabled: isClinicAccess,
  });

  // Fetch access requests (for owner)
  const accessRequestsQuery = useQuery({
    ...trpc.pets.getPendingAccessRequests.queryOptions({ petId: Number(petId) }),
    enabled: isOwner,
  });

  // Fetch pending medical action requests (for owners)
  const pendingMedicalActionsQuery = useQuery({
    ...trpc.pets.getPendingMedicalActions.queryOptions({ petId: Number(petId) }),
    enabled: isOwner,
  });

  // Fetch clinic follow-ups (approved access)
  const clinicFollowUpsQuery = useQuery({
    ...trpc.pets.getClinicFollowUps.queryOptions({
      petId: Number(petId),
    }),
    enabled: isOwner && !!petId,
  });

  const pet = petQuery.data?.pet;
  const isLoading = petQuery.isLoading;

  const checkAccess = useQuery({
    ...trpc.pets.checkClinicAccess.queryOptions({
      petId: Number(petId),
      clinicId: Number(clinicId),
    }),
    enabled: isClinicAccess,
  });

  // console.log("--------------------------", checkAccess);

  // Check access when component loads
  useEffect(() => {
    if (isClinicAccess && pet && clinicId) {
      setHasAccess(checkAccess?.data?.hasAccess);
    }
  }, [checkAccess.data]);

  const createApprovalMutation = useMutation(trpc.pets.createApprovalRequest.mutationOptions({}));
  const updatePetMutation = useMutation(trpc.admin.pets.updateProfile.mutationOptions({}));
  const deletePetMutation = useMutation(trpc.admin.pets.delete.mutationOptions({}));
  const updatePetOwnerMutation = useMutation(trpc.pets.update.mutationOptions({}));
  const deletePetOwnerMutation = useMutation(trpc.pets.delete.mutationOptions({}));
  // const deletePetOwnerMutation = useMutation(trpc.pets.delete.mutationOptions({}));

  // Update mutations
  const requestMedicalRecordMutation = useMutation(trpc.pets.requestAddMedicalRecord.mutationOptions({}));
  const requestVaccinationMutation = useMutation(trpc.pets.requestAddVaccination.mutationOptions({}));
  const requestReminderMutation = useMutation(trpc.pets.requestAddReminder.mutationOptions({}));

  // Approval mutations for owners
  const approveMedicalActionMutation = useMutation(trpc.pets.approveMedicalAction.mutationOptions({}));
  const rejectMedicalActionMutation = useMutation(trpc.pets.rejectMedicalAction.mutationOptions({}));

  // Mutations for access management
  const requestAccessMutation = useMutation(trpc.pets.requestClinicAccess.mutationOptions({}));
  const approveAccessMutation = useMutation(trpc.pets.approveClinicAccess.mutationOptions({}));
  const rejectAccessMutation = useMutation(trpc.pets.rejectClinicAccess.mutationOptions({}));

  // Mutations for deleting records
  const deleteMedicalRecordMutation = useMutation(trpc.pets.deleteMedicalRecord.mutationOptions({}));
  const deleteVaccinationMutation = useMutation(trpc.pets.deleteVaccination.mutationOptions({}));
  const deleteReminderMutation = useMutation(trpc.pets.deleteReminder.mutationOptions({}));

  const createTreatmentCardMutation = useMutation(trpc.pets.createTreatmentCard.mutationOptions({}));
  // Cancel clinic follow-ups mutation (revoke access)
  const cancelClinicFollowUpsMutation = useMutation(trpc.pets.cancelFollowUps.mutationOptions({}));

  // Initialize edit form when pet data is loaded
  useEffect(() => {
    if (pet) {
      setEditForm({
        name: pet.name || "",
        type: pet.type || "",
        breed: pet.breed || "",
        age: pet.age?.toString() || "",
        gender: pet.gender || "",
        weight: pet.weight?.toString() || "",
        color: pet.color || "",
        image: pet.image || "",
        medicalHistory: pet.medicalHistory || "",
        vaccinations: pet.vaccinations || "",
        isLost: pet.isLost || false,
      });
    }
  }, [pet]);

  // Handle opening specific section when navigating from clinic pages
  useEffect(() => {
    if (openSection && pet) {
      switch (openSection) {
        case "followups":
        case "medical":
          setActiveTab("medical");
          break;
        case "vaccinations":
          setActiveTab("vaccinations");
          break;
        case "reminders":
          setActiveTab("reminders");
          break;
        default:
          setActiveTab("info");
      }
    }
  }, [openSection, pet]);

  // Check if pet has any clinic follow-ups
  const hasClinicFollowUps = pet
    ? pet.medicalRecords?.length > 0 || pet.vaccinations?.some((v: any) => v.clinicName) || pet.reminders?.length > 0
    : false;

  const handleReportLost = () => {
    if (pet) {
      router.push({
        pathname: "/report-lost-pet",
        params: { petId: pet.id },
      });
    }
  };

  const handleAddMedicalRecord = () => {
    if (!isClinicAccess || !pet || !user) return;

    if (!hasAccess) {
      setShowAccessRequestModal(true);
      return;
    }

    setShowMedicalModal(true);
  };

  const handleAddVaccination = () => {
    if (!isClinicAccess || !pet || !user) return;

    if (!hasAccess) {
      setShowAccessRequestModal(true);
      return;
    }

    setShowVaccinationModal(true);
  };

  const handleAddReminder = () => {
    if (!isClinicAccess || !pet || !user) return;

    if (!hasAccess) {
      setShowAccessRequestModal(true);
      return;
    }

    setShowReminderModal(true);
  };

  const handleFollowUp = () => {
    if (!isClinicAccess || !pet || !user) return;
    setShowFollowUpModal(true);
  };

  const handleAddTreatmentCard = () => {
    if (!isClinicAccess || !pet || !user) return;

    if (!hasAccess) {
      setShowAccessRequestModal(true);
      return;
    }

    setShowTreatmentModal(true);
  };

  const addMedicationField = () => {
    setTreatmentForm((prev) => ({
      ...prev,
      medications: [...prev.medications, { name: "", dosage: "", frequency: "", duration: "" }],
    }));
  };

  const removeMedicationField = (index: number) => {
    setTreatmentForm((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setTreatmentForm((prev) => ({
      ...prev,
      medications: prev.medications.map((med, i) => (i === index ? { ...med, [field]: value } : med)),
    }));
  };

  const handleApproveMedicalAction = async (requestId: number) => {
    try {
      await approveMedicalActionMutation.mutateAsync({ requestId } as any);

      showToast({
        message: "تمت الموافقة على الطلب وإضافة البيانات",
        type: "success",
      });

      pendingMedicalActionsQuery.refetch();
      petQuery.refetch();
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل في الموافقة على الطلب");
    }
  };

  const handleRejectMedicalAction = async (requestId: number) => {
    Alert.alert("رفض الطلب", "هل أنت متأكد من رفض هذا الطلب؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "رفض",
        style: "destructive",
        onPress: async () => {
          try {
            await rejectMedicalActionMutation.mutateAsync({
              requestId,
              rejectionReason: "تم الرفض من قبل المالك",
            } as any);

            showToast({
              message: "تم رفض الطلب",
              type: "success",
            });

            pendingMedicalActionsQuery.refetch();
          } catch (error: any) {
            Alert.alert("خطأ", error.message || "فشل في رفض الطلب");
          }
        },
      },
    ]);
  };

  const handlePrescriptionImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("خطأ", "نحتاج إلى إذن للوصول إلى الصور");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setMedicalForm((prev) => ({ ...prev, prescriptionImage: result.assets[0].uri }));
      }
    } catch (error) {
      console.error("Error picking prescription image:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء اختيار صورة الوصفة");
    }
  };

  const handlePetImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("خطأ", "نحتاج إلى إذن للوصول إلى الصور");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEditForm((prev) => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      console.error("Error picking pet image:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء اختيار صورة الحيوان");
    }
  };

  const submitTreatmentCard = async () => {
    if (!pet || !user || !treatmentForm.medications[0].name) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (!hasAccess) {
      Alert.alert("خطأ", "لا تملك صلاحية إنشاء كروت العلاج. يرجى طلب الصلاحية أولاً.");
      return;
    }

    try {
      await createTreatmentCardMutation.mutateAsync({
        petId: pet.id,
        clinicId: clinicId!,
        medications: treatmentForm.medications.filter((med) => med.name), // Only include medications with names
        instructions: treatmentForm.instructions,
        followUpDate: treatmentForm.followUpDate,
      } as any);

      setShowTreatmentModal(false);
      setTreatmentForm({
        medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
        instructions: "",
        followUpDate: "",
      });

      showToast({
        message: "تم إنشاء كرت العلاج بنجاح",
        type: "success",
      });

      // Refresh pet data if needed
      petQuery.refetch();
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل في إنشاء كرت العلاج");
    }
  };

  const submitFollowUpRequest = async () => {
    if (!followUpForm.reason) {
      Alert.alert("خطأ", "يرجى إدخال سبب المتابعة");
      return;
    }

    if (!pet || !user) return;

    try {
      await requestAccessMutation.mutateAsync({
        petId: Number(pet.id),
        clinicId: Number(clinicId!),
        reason: followUpForm.reason,
      } as any);

      setShowFollowUpModal(false);
      setFollowUpForm({ reason: "", notes: "", urgency: "normal" });
      accessRequestsQuery.refetch();

      Alert.alert("تم إرسال الطلب", "تم إرسال طلب الصلاحية إلى مالك الحيوان. ستتمكن من إضافة البيانات بعد الموافقة.", [
        { text: "موافق" },
      ]);
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل في إرسال طلب الصلاحية");
    }
  };

  const submitAccessRequest = async () => {
    if (!accessRequestForm.reason) {
      Alert.alert("خطأ", "يرجى إدخال سبب الطلب");
      return;
    }

    if (!pet || !user) return;

    try {
      await requestAccessMutation.mutateAsync({
        petId: Number(pet.id),
        clinicId: Number(clinicId!),
        reason: accessRequestForm.reason,
      } as any);

      setShowAccessRequestModal(false);
      setAccessRequestForm({ reason: "" });
      accessRequestsQuery.refetch();

      Alert.alert("تم إرسال الطلب", "تم إرسال طلب الصلاحية إلى مالك الحيوان. ستتمكن من إضافة البيانات بعد الموافقة.", [
        { text: "موافق" },
      ]);
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل في إرسال طلب الصلاحية");
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      await approveAccessMutation.mutateAsync({
        requestId,
        accessDuration: 365, // 1 year access
      } as any);

      showToast({
        message: "تم منح الصلاحية للعيادة بنجاح",
        type: "success",
      });

      // Refresh requests list
      accessRequestsQuery.refetch();
      clinicFollowUpsQuery.refetch();
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل في الموافقة على الطلب");
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    Alert.alert("رفض الطلب", "هل أنت متأكد من رفض طلب الصلاحية؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "رفض",
        style: "destructive",
        onPress: async () => {
          try {
            await rejectAccessMutation.mutateAsync({
              requestId,
              rejectionReason: "تم الرفض من قبل المالك",
            } as any);

            showToast({
              message: "تم رفض طلب الصلاحية",
              type: "success",
            });

            // Refresh requests list
            accessRequestsQuery.refetch();
          } catch (error: any) {
            Alert.alert("خطأ", error.message || "فشل في رفض الطلب");
          }
        },
      },
    ]);
  };

  // Updated medical procedures with access check
  const submitMedicalRecord = async () => {
    if (!medicalForm.diagnosis || !medicalForm.treatment) {
      Alert.alert("خطأ", "يرجى ملء الحقول المطلوبة");
      return;
    }

    if (!pet || !user) return;

    try {
      await requestMedicalRecordMutation.mutateAsync({
        petId: Number(pet.id),
        clinicId: Number(clinicId!),
        diagnosis: medicalForm.diagnosis,
        treatment: medicalForm.treatment,
        notes: medicalForm.notes,
        prescriptionImage: medicalForm.prescriptionImage,
        requestReason: "إضافة سجل طبي بعد الفحص",
      } as any);

      setShowMedicalModal(false);
      setMedicalForm({ diagnosis: "", treatment: "", notes: "", prescriptionImage: "" });

      showToast({
        message: "تم إرسال طلب إضافة السجل الطبي إلى المالك",
        type: "success",
      });
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل في إرسال الطلب");
    }
  };

  const submitVaccination = async () => {
    if (!vaccinationForm.name) {
      Alert.alert("خطأ", "يرجى إدخال اسم التطعيم");
      return;
    }

    if (!pet || !user) return;

    try {
      await requestVaccinationMutation.mutateAsync({
        petId: Number(pet.id),
        clinicId: Number(clinicId!),
        name: vaccinationForm.name,
        nextDate: vaccinationForm.nextDate,
        notes: vaccinationForm.notes,
        requestReason: "إضافة تطعيم جديد", // Add reason field
      } as any);

      setShowVaccinationModal(false);
      setVaccinationForm({ name: "", nextDate: "", notes: "" });

      showToast({
        message: "تم إرسال طلب إضافة التطعيم إلى المالك",
        type: "success",
      });
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل في إرسال الطلب");
    }
  };

  const submitReminder = async () => {
    if (!reminderForm.title || !reminderForm.date) {
      Alert.alert("خطأ", "يرجى ملء الحقول المطلوبة");
      return;
    }

    if (!pet || !user) return;

    try {
      await requestReminderMutation.mutateAsync({
        petId: Number(pet.id),
        clinicId: Number(clinicId!),
        title: reminderForm.title,
        description: reminderForm.description,
        reminderDate: reminderForm.date,
        reminderType: "checkup",
        requestReason: "إضافة تذكير للمتابعة", // Add reason field
      } as any);

      setShowReminderModal(false);
      setReminderForm({ title: "", description: "", date: "" });

      showToast({
        message: "تم إرسال طلب إضافة التذكير إلى المالك",
        type: "success",
      });
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل في إرسال الطلب");
    }
  };

  const handleEditPet = () => {
    if (!isOwner || !pet) return;
    setShowEditModal(true);
  };

  const submitEditPet = async () => {
    if (!editForm.name || !editForm.type) {
      Alert.alert("خطأ", "يرجى ملء الحقول المطلوبة");
      return;
    }

    if (!pet || !user) return;

    if (isAdmin) {
      // Admin update with all fields
      updatePetMutation.mutate(
        {
          petId: pet.id,
          adminId: user.id,
          name: editForm.name.trim(),
          type: editForm.type,
          breed: editForm.breed.trim() || undefined,
          age: editForm.age ? parseInt(editForm.age) : undefined,
          gender: editForm.gender as "male" | "female" | undefined,
          weight: editForm.weight ? parseFloat(editForm.weight) : undefined,
          color: editForm.color.trim() || undefined,
          image: editForm.image || undefined,
          medicalHistory: editForm.medicalHistory.trim() || undefined,
          vaccinations: editForm.vaccinations.trim() || undefined,
          isLost: editForm.isLost,
        } as any,
        {
          onSuccess: () => {
            showToast({
              message: "تم تحديث معلومات الحيوان بنجاح",
              type: "success",
            });
            setShowEditModal(false);
            petQuery.refetch();
          },
          onError: (error) => {
            showToast({
              message: error.message || "حدث خطأ أثناء تحديث الحيوان",
              type: "error",
            });
          },
        }
      );
    } else {
      // Pet owner update (limited fields)
      updatePetOwnerMutation.mutate(
        {
          id: pet.id,
          name: editForm.name.trim(),
          type: editForm.type as "dog" | "cat" | "rabbit" | "bird" | "other",
          breed: editForm.breed.trim() || undefined,
          age: editForm.age ? parseInt(editForm.age) : undefined,
          gender: editForm.gender as "male" | "female",
          weight: editForm.weight ? parseFloat(editForm.weight) : undefined,
          color: editForm.color.trim() || undefined,
          image: editForm.image || undefined,
        } as any,
        {
          onSuccess: () => {
            showToast({
              message: "تم تحديث معلومات الحيوان بنجاح",
              type: "success",
            });
            setShowEditModal(false);
            petQuery.refetch();
          },
          onError: (error) => {
            showToast({
              message: error.message || "حدث خطأ أثناء تحديث الحيوان",
              type: "error",
            });
          },
        }
      );
    }
  };

  const handleDeletePetForOwner = () => {
    if (!pet || !user || !isOwner) return;

    Alert.alert("حذف الحيوان", "هل أنت متأكد من حذف هذا الحيوان؟ هذا الإجراء لا يمكن التراجع عنه.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deletePetOwnerMutation.mutate(
            {
              id: pet.id,
            },
            {
              onSuccess: () => {
                showToast({
                  message: "تم حذف الحيوان بنجاح",
                  type: "success",
                });
                router.back();
              },
              onError: (error) => {
                showToast({
                  message: error.message || "حدث خطأ أثناء حذف الحيوان",
                  type: "error",
                });
              },
            }
          );
        },
      },
    ]);
  };

  const handleDeletePet = () => {
    if (!pet || !user || !isAdmin) return;

    Alert.alert("حذف الحيوان", "هل أنت متأكد من حذف هذا الحيوان؟ هذا الإجراء لا يمكن التراجع عنه.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deletePetMutation.mutate(
            {
              petId: pet.id,
              adminId: user.id,
              reason: "Admin deletion",
            } as any,
            {
              onSuccess: () => {
                showToast({
                  message: "تم حذف الحيوان بنجاح",
                  type: "success",
                });
                router.back();
              },
              onError: (error) => {
                showToast({
                  message: error.message || "حدث خطأ أثناء حذف الحيوان",
                  type: "error",
                });
              },
            }
          );
        },
      },
    ]);
  };

  const handleDeleteMedicalRecord = (recordId: string) => {
    if (!isOwner || !pet) return;

    Alert.alert("حذف السجل الطبي", "هل أنت متأكد من حذف هذا السجل الطبي؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          deleteMedicalRecordMutation.mutate({ recordId } as any);
          petQuery.refetch();
          Alert.alert("تم", "تم حذف السجل الطبي");
        },
      },
    ]);
  };

  const handleDeleteVaccination = (vaccinationId: string) => {
    if (!isOwner || !pet) return;

    Alert.alert("حذف التطعيم", "هل أنت متأكد من حذف هذا التطعيم؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          deleteVaccinationMutation.mutate({ vaccinationId } as any);
          petQuery.refetch();
          Alert.alert("تم", "تم حذف التطعيم");
        },
      },
    ]);
  };

  const handleDeleteReminder = (reminderId: string) => {
    if (!isOwner || !pet) return;

    Alert.alert("حذف التذكير", "هل أنت متأكد من حذف هذا التذكير؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          deleteReminderMutation.mutate({ reminderId } as any);
          petQuery.refetch();
          Alert.alert("تم", "تم حذف التذكير");
        },
      },
    ]);
  };

  // Handle canceling follow-up for a specific clinic
  const handleCancelClinicFollowUp = (clinicId: number, clinicName: string) => {
    Alert.alert(
      `إلغاء المتابعة مع ${clinicName}`,
      "هل أنت متأكد من إلغاء المتابعة مع هذه العيادة؟ هذا الإجراء سيمنع العيادة من إضافة سجلات طبية جديدة لحيوانك الأليف.",
      [
        {
          text: "إلغاء",
          style: "cancel",
        },
        {
          text: "نعم، إلغاء المتابعة",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelClinicFollowUpsMutation.mutateAsync({
                petId: Number(petId),
                clinicId: Number(clinicId),
              } as any);

              showToast({
                message: `تم إلغاء المتابعة مع ${clinicName} بنجاح`,
                type: "success",
              });

              // Refresh the clinic follow-ups data
              clinicFollowUpsQuery.refetch();

              // Also refresh access requests if needed
              accessRequestsQuery.refetch();
            } catch (error: any) {
              // Dismiss loading toast if exists
              showToast({
                message: error.message || "فشل في إلغاء المتابعة",
                type: "error",
              });
            }
          },
        },
      ]
    );
  };

  const handleAdoptionBreeding = (type: string) => {
    Alert.alert(
      `عرض ${type === "adoption" ? "للتبني" : "للتزاوج"}`,
      `هل تريد عرض هذا الحيوان ${type === "adoption" ? "للتبني" : "للتزاوج"}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "نعم",
          onPress: () => {
            // ✅ Validate required fields
            if (!pet?.name?.trim()) {
              showToast({
                type: "error",
                message: "يرجى إدخال اسم الحيوان",
              });
              return;
            }
            if (!pet?.age > 0) {
              showToast({
                type: "error",
                message: "يرجى إدخال عمر الحيوان",
              });
              return;
            }
            if (!pet?.color?.trim()) {
              showToast({
                type: "error",
                message: "يرجى إدخال لون الحيوان",
              });
              return;
            }
            if (!user) {
              showToast({
                type: "error",
                message: "يرجى تسجيل الدخول أولاً",
              });
              return;
            }

            createApprovalMutation.mutate(
              {
                name: pet?.name,
                type: pet?.type,
                breed: pet?.breed || undefined,
                age: pet?.age ? parseInt(pet?.age) : undefined,
                gender: pet?.gender,
                weight: pet?.weight ? parseFloat(pet?.weight) : undefined,
                color: pet?.color || undefined,
                image: pet?.image,
                ownerId: parseInt(user?.id.toString()),
                requestType: type,
                description: pet?.description,
                images: [pet?.image],
                contactInfo: pet?.contactInfo || undefined,
                location: pet?.location,
                price: pet?.price ? parseFloat(pet?.price) : undefined,
                specialRequirements: pet.specialRequirements || undefined,
              } as any,
              {
                onSuccess: (data) => {
                  showToast({
                    type: "success",
                    message: data?.message || "تم إرسال الطلب بنجاح وهو الآن في انتظار موافقة الإدارة",
                  });
                },
                onError: (error) => {
                  showToast({
                    type: "error",
                    message: error.message || "حدث خطأ أثناء إرسال الطلب",
                  });
                },
              }
            );
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Pet not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {createApprovalMutation.isPending ? <ActivityIndicator size="large" /> : null}
      </View>

      <View style={styles.header}>
        <Image source={{ uri: pet.image }} style={styles.petImage} />
        <View style={styles.petInfo}>
          <View style={styles.petNameRow}>
            <Text style={styles.petName}>{pet.name}</Text>
            {isOwner && (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={handleEditPet} style={styles.editIcon}>
                  <Edit3 size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeletePetForOwner} style={styles.editIcon}>
                  <Trash2 size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <Text style={styles.petType}>
            {t(`${pet.type}`)} {pet.breed ? `- ${pet.breed}` : ""}
          </Text>

          <View style={styles.petDetailsRow}>
            <View style={styles.petDetailItem}>
              <Text style={styles.petDetailLabel}>{t("العمر")}</Text>
              <Text style={styles.petDetailValue}>{pet.age} سنة</Text>
            </View>

            <View style={styles.petDetailItem}>
              <Text style={styles.petDetailLabel}>{t("الجنس")}</Text>
              <Text style={styles.petDetailValue}>{pet.gender === "male" ? t("ذكر") : t("انثى")}</Text>
            </View>

            {pet.weight && (
              <View style={styles.petDetailItem}>
                <Text style={styles.petDetailLabel}>{t("الوزن")}</Text>
                <Text style={styles.petDetailValue}>{pet.weight} كجم</Text>
              </View>
            )}
          </View>

          {isClinicAccess && (
            <View style={styles.clinicActions}>
              {hasAccess ? (
                <Text style={styles.accessGrantedText}>✓ يمكنك إضافة السجلات الطبية والتطعيمات</Text>
              ) : (
                <Button
                  title={"طلب متابعة الحيوان"}
                  onPress={handleFollowUp}
                  type={hasAccess ? "outline" : "primary"}
                  size="medium"
                  style={styles.followUpButton}
                />
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "info" && styles.activeTab]}
          onPress={() => setActiveTab("info")}
        >
          <Text style={[styles.tabText, activeTab === "info" && styles.activeTabText]}>معلومات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "medical" && styles.activeTab]}
          onPress={() => setActiveTab("medical")}
        >
          <Text style={[styles.tabText, activeTab === "medical" && styles.activeTabText]}>السجل الطبي</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "vaccinations" && styles.activeTab]}
          onPress={() => setActiveTab("vaccinations")}
        >
          <Text style={[styles.tabText, activeTab === "vaccinations" && styles.activeTabText]}>التطعيمات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "reminders" && styles.activeTab]}
          onPress={() => setActiveTab("reminders")}
        >
          <Text style={[styles.tabText, activeTab === "reminders" && styles.activeTabText]}>التذكيرات</Text>
        </TouchableOpacity>

        {isOwner && (
          <TouchableOpacity
            style={[styles.tab, activeTab === "requests" && styles.activeTab]}
            onPress={() => setActiveTab("requests")}
          >
            <Text style={[styles.tabText, activeTab === "requests" && styles.activeTabText]}>طلبات العيادات</Text>
          </TouchableOpacity>
        )}

        {isClinicAccess && (
          <TouchableOpacity
            style={[styles.tab, activeTab === "myRequests" && styles.activeTab]}
            onPress={() => setActiveTab("myRequests")}
          >
            <Text style={[styles.tabText, activeTab === "myRequests" && styles.activeTabText]}>طلباتي</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {activeTab === "info" && (
          <View>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>معلومات عامة</Text>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t("اللون")}</Text>
                <Text style={styles.infoValue}>{pet.color || "غير محدد"}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>رقم المعرف</Text>
                <Text style={styles.infoValue}>{pet.id}</Text>
              </View>

              {pet.isLost && (
                <View style={styles.lostBanner}>
                  <AlertTriangle size={20} color={COLORS.error} />
                  <Text style={styles.lostBannerText}>هذا الحيوان مفقود</Text>
                </View>
              )}

              {/* Show owner info for admin */}
              {isAdmin && "ownerName" in pet && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 20 }]}>معلومات المالك</Text>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>الاسم</Text>
                    <Text style={styles.infoValue}>{pet.ownerName}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>البريد الإلكتروني</Text>
                    <Text style={styles.infoValue}>{pet.ownerEmail}</Text>
                  </View>
                </>
              )}

              {/* Medical History - Admin only */}
              {isAdmin && pet.medicalHistory && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 20 }]}>التاريخ الطبي</Text>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoValue}>{pet.medicalHistory}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Owner Actions */}
            {isOwner && (
              <View style={styles.ownerActions}>
                {clinicFollowUpsQuery.data?.followUps && clinicFollowUpsQuery.data.followUps.length > 0 && (
                  <View style={styles.clinicFollowUpsSection}>
                    <Text style={styles.sectionTitle}>المتابعات مع العيادات</Text>
                    {clinicFollowUpsQuery.data.followUps.map((clinic) => (
                      <View key={clinic.clinicId} style={styles.clinicFollowUpCard}>
                        <View style={styles.clinicInfo}>
                          <Text style={styles.clinicName}>{clinic.clinicName}</Text>
                          <Text style={styles.followUpDetails}>
                            {clinic.medicalRecordsCount} سجلات طبية • {clinic.vaccinationsCount} تطعيمات •{" "}
                            {clinic.remindersCount} تذكيرات
                          </Text>
                          {clinic.expiresAt && (
                            <Text style={styles.followUpDate}>
                              الصلاحية تنتهي: {new Date(clinic.expiresAt).toLocaleDateString("ar-SA")}
                            </Text>
                          )}
                          {clinic.pendingFollowUpsCount > 0 && (
                            <Text style={styles.pendingRequests}>{clinic.pendingFollowUpsCount} طلب متابعة معلق</Text>
                          )}
                        </View>
                        <TouchableOpacity
                          style={styles.cancelClinicFollowUpButton}
                          onPress={() => handleCancelClinicFollowUp(clinic.clinicId, clinic.clinicName)}
                        >
                          <X size={16} color={COLORS.error} />
                          <Text style={styles.cancelClinicFollowUpText}>إلغاء المتابعة</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <Button
                  title={t("بلغ عن حيوان مفقود")}
                  onPress={handleReportLost}
                  type="outline"
                  size="medium"
                  style={styles.actionButton}
                  icon={<AlertTriangle size={16} color={COLORS.primary} />}
                />

                <View style={styles.adoptionBreedingButtons}>
                  <Button
                    title="عرض للتبني"
                    onPress={() => handleAdoptionBreeding("adoption")}
                    type="primary"
                    size="medium"
                    style={[styles.actionButton, styles.adoptionButton]}
                  />

                  <Button
                    title="عرض للتزاوج"
                    onPress={() => handleAdoptionBreeding("breeding")}
                    type="primary"
                    size="medium"
                    style={[styles.actionButton, styles.breedingButton]}
                  />
                </View>
              </View>
            )}

            {/* Admin Actions */}
            {isAdmin && (
              <View style={styles.adminActions}>
                <Button
                  title="حذف الحيوان"
                  onPress={handleDeletePet}
                  type="outline"
                  size="medium"
                  style={[styles.actionButton, styles.deleteButton]}
                  icon={<Trash2 size={16} color={COLORS.error} />}
                />
              </View>
            )}
          </View>
        )}

        {activeTab === "medical" && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("السجل الطبي")}</Text>
              {isClinicAccess && userMode === "veterinarian" && (
                <TouchableOpacity
                  style={[styles.addSectionButton, !hasAccess && styles.disabledButton]}
                  onPress={hasAccess ? handleAddMedicalRecord : () => setShowAccessRequestModal(true)}
                  disabled={!hasAccess}
                >
                  <Plus size={16} color={hasAccess ? COLORS.primary : COLORS.darkGray} />
                  <Text style={[styles.addSectionButtonText, !hasAccess && styles.disabledButtonText]}>إضافة سجل</Text>
                </TouchableOpacity>
              )}
            </View>

            {!pet.medicalRecords || pet.medicalRecords.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>لا يوجد سجلات طبية</Text>
              </View>
            ) : (
              <>
                {pet.medicalRecords.map((record: any) => (
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
                      <Text style={styles.recordDate}>{new Date(record.date).toLocaleDateString("ar-SA")}</Text>
                    </View>

                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>العيادة</Text>
                      <Text style={styles.recordValue}>{record.clinicName || "غير محدد"}</Text>
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

                    {record.prescriptionImage && (
                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>صورة الوصفة</Text>
                        <TouchableOpacity
                          onPress={() => {
                            // TODO: Implement image preview
                            Alert.alert("صورة الوصفة", "عرض صورة الوصفة الطبية");
                          }}
                        >
                          <Image source={{ uri: record.prescriptionImage }} style={styles.prescriptionThumbnail} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {activeTab === "vaccinations" && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("التطعيمات")}</Text>
              {isClinicAccess && userMode === "veterinarian" && (
                <TouchableOpacity
                  style={[styles.addSectionButton, !hasAccess && styles.disabledButton]}
                  onPress={hasAccess ? handleAddVaccination : () => setShowAccessRequestModal(true)}
                  disabled={!hasAccess}
                >
                  <Plus size={16} color={hasAccess ? COLORS.primary : COLORS.darkGray} />
                  <Text style={[styles.addSectionButtonText, !hasAccess && styles.disabledButtonText]}>
                    إضافة تطعيم
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {!pet.vaccinations || pet.vaccinations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>لا يوجد تطعيمات</Text>
              </View>
            ) : (
              <>
                {pet.vaccinations.map((vaccination: any) => (
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
                      <Text style={styles.recordDate}>{new Date(vaccination.date).toLocaleDateString("ar-SA")}</Text>
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
                          {new Date(vaccination.nextDate).toLocaleDateString("ar-SA")}
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
                ))}
                {isClinicAccess && hasAccess && (
                  <TouchableOpacity style={styles.addMoreButton} onPress={handleAddVaccination}>
                    <Plus size={20} color={COLORS.primary} />
                    <Text style={styles.addMoreButtonText}>إضافة تطعيم جديد</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {activeTab === "reminders" && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("التذكيرات")}</Text>
              {isClinicAccess && userMode === "veterinarian" && (
                <TouchableOpacity
                  style={[styles.addSectionButton, !hasAccess && styles.disabledButton]}
                  onPress={hasAccess ? handleAddReminder : () => setShowAccessRequestModal(true)}
                  disabled={!hasAccess}
                >
                  <Plus size={16} color={hasAccess ? COLORS.primary : COLORS.darkGray} />
                  <Text style={[styles.addSectionButtonText, !hasAccess && styles.disabledButtonText]}>
                    إضافة تذكير
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {!pet.reminders || pet.reminders.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>لا يوجد تذكيرات</Text>
                {isClinicAccess && !hasAccess && (
                  <Text style={styles.noAccessText}>يجب الحصول على صلاحية الوصول لإضافة تذكيرات</Text>
                )}
              </View>
            ) : (
              pet.reminders.map((reminder: any) => (
                <View
                  key={reminder.id}
                  style={[styles.recordCard, reminder.isCompleted && styles.completedReminderCard]}
                >
                  <View style={styles.recordHeader}>
                    <View style={styles.recordTitleRow}>
                      <Text style={styles.recordTitle}>{reminder.title}</Text>
                      {isOwner && (
                        <TouchableOpacity onPress={() => handleDeleteReminder(reminder.id)} style={styles.deleteButton}>
                          <Trash2 size={16} color={COLORS.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.recordDate}>{new Date(reminder.date).toLocaleDateString("ar-SA")}</Text>
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
                      {reminder.type === "vaccination"
                        ? "تطعيم"
                        : reminder.type === "medication"
                        ? "دواء"
                        : reminder.type === "checkup"
                        ? "فحص"
                        : "أخرى"}
                    </Text>
                  </View>

                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>الحالة</Text>
                    <Text
                      style={[styles.recordValue, reminder.isCompleted ? styles.completedStatus : styles.pendingStatus]}
                    >
                      {reminder.isCompleted ? "مكتمل" : "قيد الانتظار"}
                    </Text>
                  </View>

                  {reminder.clinicName && (
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>العيادة</Text>
                      <Text style={styles.recordValue}>{reminder.clinicName}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "myRequests" && isClinicAccess && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>طلبات المتابعة</Text>
            </View>

            {myRequestsQuery.isLoading ? (
              <ActivityIndicator size="large" />
            ) : !myRequestsQuery.data?.requests || myRequestsQuery.data.requests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>لا توجد طلبات صلاحية</Text>
                <Button
                  title="طلب متابعة جديد"
                  onPress={handleFollowUp}
                  type="primary"
                  size="medium"
                  style={styles.requestAccessButton}
                />
              </View>
            ) : (
              myRequestsQuery.data.requests.map((request: any) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestPetName}>{request.petName}</Text>
                    <Text
                      style={[
                        styles.requestStatus,
                        request.status === "approved" && styles.statusApproved,
                        request.status === "rejected" && styles.statusRejected,
                        request.status === "pending" && styles.statusPending,
                      ]}
                    >
                      {request.status === "approved"
                        ? "مقبول"
                        : request.status === "rejected"
                        ? "مرفوض"
                        : "قيد الانتظار"}
                    </Text>
                  </View>

                  <Text style={styles.requestReason}>{request.reason}</Text>
                  <Text style={styles.requestDate}>{new Date(request.createdAt).toLocaleDateString()}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "requests" && isOwner && (
          <View>
            {/* --- Section 1: Clinic Access Requests --- */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>طلبات صلاحية العيادات</Text>
            </View>

            {accessRequestsQuery.isLoading ? (
              <ActivityIndicator size="large" />
            ) : !accessRequestsQuery.data?.requests || accessRequestsQuery.data.requests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>لا توجد طلبات صلاحية معلقة</Text>
              </View>
            ) : (
              accessRequestsQuery.data.requests.map((request: any) => (
                <View key={`clinic-${request.id}`} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestClinicName}>{request.clinicName}</Text>
                    <Text style={styles.requestDate}>{new Date(request.createdAt).toLocaleDateString()}</Text>
                  </View>

                  <Text style={styles.requestReason}>{request.reason}</Text>

                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.approveButton]}
                      onPress={() => handleApproveRequest(request.id)}
                    >
                      <Check size={16} color={COLORS.white} />
                      <Text style={styles.requestButtonText}>موافقة</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.requestButton, styles.rejectButton]}
                      onPress={() => handleRejectRequest(request.id)}
                    >
                      <XIcon size={16} color={COLORS.white} />
                      <Text style={styles.requestButtonText}>رفض</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* --- Section 2: Medical Data Requests --- */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>طلبات البيانات الطبية</Text>
            </View>

            {pendingMedicalActionsQuery.isLoading ? (
              <ActivityIndicator size="large" />
            ) : !pendingMedicalActionsQuery.data?.requests || pendingMedicalActionsQuery.data.requests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>لا توجد طلبات بيانات طبية معلقة</Text>
              </View>
            ) : (
              pendingMedicalActionsQuery.data.requests.map((request: any) => (
                <View key={`medical-${request.id}`} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestClinicName}>{request.clinicName}</Text>
                    <Text style={styles.requestDate}>{new Date(request.createdAt).toLocaleDateString()}</Text>
                  </View>

                  <Text style={styles.requestType}>
                    {request.actionType === "medical_record"
                      ? "سجل طبي"
                      : request.actionType === "vaccination"
                      ? "تطعيم"
                      : "تذكير"}
                  </Text>

                  <Text style={styles.requestReason}>{request.reason}</Text>

                  <View style={styles.actionDetails}>
                    {request.actionType === "medical_record" && (
                      <>
                        <Text style={styles.detailLabel}>التشخيص:</Text>
                        <Text style={styles.detailValue}>{request.actionData.diagnosis}</Text>
                        <Text style={styles.detailLabel}>العلاج:</Text>
                        <Text style={styles.detailValue}>{request.actionData.treatment}</Text>
                      </>
                    )}
                    {request.actionType === "vaccination" && (
                      <>
                        <Text style={styles.detailLabel}>اسم التطعيم:</Text>
                        <Text style={styles.detailValue}>{request.actionData.name}</Text>
                      </>
                    )}
                    {request.actionType === "reminder" && (
                      <>
                        <Text style={styles.detailLabel}>العنوان:</Text>
                        <Text style={styles.detailValue}>{request.actionData.title}</Text>
                      </>
                    )}
                  </View>

                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.approveButton]}
                      onPress={() => handleApproveMedicalAction(request.id)}
                    >
                      <Check size={16} color={COLORS.white} />
                      <Text style={styles.requestButtonText}>موافقة</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.requestButton, styles.rejectButton]}
                      onPress={() => handleRejectMedicalAction(request.id)}
                    >
                      <XIcon size={16} color={COLORS.white} />
                      <Text style={styles.requestButtonText}>رفض</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* Follow Up Modal - Now used for access requests */}
      <Modal visible={showFollowUpModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>طلب صلاحية الوصول</Text>
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

            <Text style={styles.modalSectionTitle}>سبب طلب الصلاحية *</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="أدخل سبب طلب الصلاحية للوصول إلى البيانات الطبية للحيوان"
              value={followUpForm.reason}
              onChangeText={(value) => setFollowUpForm((prev) => ({ ...prev, reason: value }))}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.modalDescription}>
              بعد الموافقة على طلبك، ستتمكن من: • إضافة السجلات الطبية • إضافة التطعيمات • إضافة التذكيرات • إنشاء كروت
              العلاج • متابعة الحالة الصحية
            </Text>
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
              title="إرسال طلب الصلاحية"
              onPress={submitFollowUpRequest}
              type="primary"
              size="medium"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Access Request Modal (for direct access requests) */}
      <Modal visible={showAccessRequestModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>طلب صلاحية الوصول</Text>
            <TouchableOpacity onPress={() => setShowAccessRequestModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>أنت تطلب صلاحية الوصول إلى {pet?.name}</Text>

            <Text style={styles.modalDescription}>
              سيتم إرسال طلب الصلاحية إلى مالك الحيوان. بعد الموافقة، ستتمكن من إضافة البيانات الطبية.
            </Text>

            <Text style={styles.modalSectionTitle}>سبب الطلب *</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="أدخل سبب طلب الصلاحية..."
              value={accessRequestForm.reason}
              onChangeText={(value) => setAccessRequestForm((prev) => ({ ...prev, reason: value }))}
              multiline
              numberOfLines={4}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="إلغاء"
              onPress={() => setShowAccessRequestModal(false)}
              type="outline"
              size="medium"
              style={styles.modalButton}
            />
            <Button
              title="إرسال طلب الصلاحية"
              onPress={submitAccessRequest}
              type="primary"
              size="medium"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Treatment Modal */}
      <Modal visible={showTreatmentModal} animationType="slide" presentationStyle="pageSheet">
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
                  onChangeText={(value) => updateMedication(index, "name", value)}
                />

                <TextInput
                  style={styles.modalInput}
                  placeholder="الجرعة"
                  value={medication.dosage}
                  onChangeText={(value) => updateMedication(index, "dosage", value)}
                />

                <TextInput
                  style={styles.modalInput}
                  placeholder="عدد مرات الاستخدام"
                  value={medication.frequency}
                  onChangeText={(value) => updateMedication(index, "frequency", value)}
                />

                <TextInput
                  style={styles.modalInput}
                  placeholder="مدة الاستخدام"
                  value={medication.duration}
                  onChangeText={(value) => updateMedication(index, "duration", value)}
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
              onChangeText={(value) => setTreatmentForm((prev) => ({ ...prev, instructions: value }))}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.modalSectionTitle}>موعد المتابعة (اختياري)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="تاريخ المتابعة"
              value={treatmentForm.followUpDate}
              onChangeText={(value) => setTreatmentForm((prev) => ({ ...prev, followUpDate: value }))}
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
      <Modal visible={showMedicalModal} animationType="slide" presentationStyle="pageSheet">
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
              onChangeText={(value) => setMedicalForm((prev) => ({ ...prev, diagnosis: value }))}
            />

            <Text style={styles.modalSectionTitle}>العلاج *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="أدخل العلاج"
              value={medicalForm.treatment}
              onChangeText={(value) => setMedicalForm((prev) => ({ ...prev, treatment: value }))}
            />

            <Text style={styles.modalSectionTitle}>ملاحظات إضافية</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="أدخل ملاحظات إضافية (اختياري)"
              value={medicalForm.notes}
              onChangeText={(value) => setMedicalForm((prev) => ({ ...prev, notes: value }))}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.modalSectionTitle}>صورة الوصفة (اختياري)</Text>
            <TouchableOpacity style={styles.prescriptionImageButton} onPress={handlePrescriptionImageUpload}>
              <Camera size={24} color={COLORS.primary} />
              <Text style={styles.prescriptionImageText}>
                {medicalForm.prescriptionImage ? "تم رفع الصورة" : "رفع صورة الوصفة"}
              </Text>
            </TouchableOpacity>

            {medicalForm.prescriptionImage && (
              <View style={styles.uploadedImageContainer}>
                <Image source={{ uri: medicalForm.prescriptionImage }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setMedicalForm((prev) => ({ ...prev, prescriptionImage: "" }))}
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
            <Button title="حفظ" onPress={submitMedicalRecord} type="primary" size="medium" style={styles.modalButton} />
          </View>
        </View>
      </Modal>

      {/* Vaccination Modal */}
      <Modal visible={showVaccinationModal} animationType="slide" presentationStyle="pageSheet">
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
              onChangeText={(value) => setVaccinationForm((prev) => ({ ...prev, name: value }))}
            />

            <Text style={styles.modalSectionTitle}>تاريخ التطعيم القادم</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="YYYY-MM-DD (اختياري)"
              value={vaccinationForm.nextDate}
              onChangeText={(value) => setVaccinationForm((prev) => ({ ...prev, nextDate: value }))}
            />

            <Text style={styles.modalSectionTitle}>ملاحظات إضافية</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="أدخل ملاحظات إضافية (اختياري)"
              value={vaccinationForm.notes}
              onChangeText={(value) => setVaccinationForm((prev) => ({ ...prev, notes: value }))}
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
            <Button title="حفظ" onPress={submitVaccination} type="primary" size="medium" style={styles.modalButton} />
          </View>
        </View>
      </Modal>

      {/* Reminder Modal */}
      <Modal visible={showReminderModal} animationType="slide" presentationStyle="pageSheet">
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
              onChangeText={(value) => setReminderForm((prev) => ({ ...prev, title: value }))}
            />

            <Text style={styles.modalSectionTitle}>وصف التذكير</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="أدخل وصف التذكير (اختياري)"
              value={reminderForm.description}
              onChangeText={(value) => setReminderForm((prev) => ({ ...prev, description: value }))}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.modalSectionTitle}>تاريخ التذكير *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="YYYY-MM-DD"
              value={reminderForm.date}
              onChangeText={(value) => setReminderForm((prev) => ({ ...prev, date: value }))}
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
            <Button title="حفظ" onPress={submitReminder} type="primary" size="medium" style={styles.modalButton} />
          </View>
        </View>
      </Modal>

      {/* Follow Up Modal */}
      <Modal visible={showFollowUpModal} animationType="slide" presentationStyle="pageSheet">
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
              onChangeText={(value) => setFollowUpForm((prev) => ({ ...prev, reason: value }))}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.modalSectionTitle}>ملاحظات إضافية</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="أدخل ملاحظات إضافية (اختياري)"
              value={followUpForm.notes}
              onChangeText={(value) => setFollowUpForm((prev) => ({ ...prev, notes: value }))}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.modalSectionTitle}>مستوى الأولوية</Text>
            <View style={styles.urgencyContainer}>
              <TouchableOpacity
                style={[styles.urgencyOption, followUpForm.urgency === "low" && styles.urgencyOptionSelected]}
                onPress={() => setFollowUpForm((prev) => ({ ...prev, urgency: "low" }))}
              >
                <Text style={[styles.urgencyText, followUpForm.urgency === "low" && styles.urgencyTextSelected]}>
                  منخفضة
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.urgencyOption, followUpForm.urgency === "normal" && styles.urgencyOptionSelected]}
                onPress={() => setFollowUpForm((prev) => ({ ...prev, urgency: "normal" }))}
              >
                <Text style={[styles.urgencyText, followUpForm.urgency === "normal" && styles.urgencyTextSelected]}>
                  عادية
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.urgencyOption, followUpForm.urgency === "high" && styles.urgencyOptionSelected]}
                onPress={() => setFollowUpForm((prev) => ({ ...prev, urgency: "high" }))}
              >
                <Text style={[styles.urgencyText, followUpForm.urgency === "high" && styles.urgencyTextSelected]}>
                  عالية
                </Text>
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
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تعديل معلومات الحيوان</Text>
            <TouchableOpacity
              onPress={submitEditPet}
              disabled={updatePetMutation.isPending || updatePetOwnerMutation.isPending}
            >
              <Text style={styles.saveButton}>
                {updatePetMutation.isPending || updatePetOwnerMutation.isPending ? "جاري الحفظ..." : "حفظ"}
              </Text>
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
                    onPress={() => setEditForm((prev) => ({ ...prev, image: "" }))}
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
                onChangeText={(text) => setEditForm((prev) => ({ ...prev, name: text }))}
                placeholder="أدخل اسم الحيوان"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>نوع الحيوان *</Text>
              <View style={styles.typeSelector}>
                {["dog", "cat", "rabbit", "bird", "other"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeOption, editForm.type === type && styles.selectedTypeOption]}
                    onPress={() => setEditForm((prev) => ({ ...prev, type }))}
                  >
                    <Text style={[styles.typeOptionText, editForm.type === type && styles.selectedTypeOptionText]}>
                      {type === "dog"
                        ? "كلب"
                        : type === "cat"
                        ? "قطة"
                        : type === "rabbit"
                        ? "أرنب"
                        : type === "bird"
                        ? "طائر"
                        : "أخرى"}
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
                onChangeText={(text) => setEditForm((prev) => ({ ...prev, breed: text }))}
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
                  onChangeText={(text) => setEditForm((prev) => ({ ...prev, age: text }))}
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
                  onChangeText={(text) => setEditForm((prev) => ({ ...prev, weight: text }))}
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
                  style={[styles.genderOption, editForm.gender === "male" && styles.selectedGenderOption]}
                  onPress={() => setEditForm((prev) => ({ ...prev, gender: "male" }))}
                >
                  <Text
                    style={[styles.genderOptionText, editForm.gender === "male" && styles.selectedGenderOptionText]}
                  >
                    ذكر
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.genderOption, editForm.gender === "female" && styles.selectedGenderOption]}
                  onPress={() => setEditForm((prev) => ({ ...prev, gender: "female" }))}
                >
                  <Text
                    style={[styles.genderOptionText, editForm.gender === "female" && styles.selectedGenderOptionText]}
                  >
                    أنثى
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>اللون</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.color}
                onChangeText={(text) => setEditForm((prev) => ({ ...prev, color: text }))}
                placeholder="أدخل لون الحيوان"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            {/* Admin-only fields */}
            {isAdmin && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>التاريخ الطبي</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={editForm.medicalHistory}
                    onChangeText={(text) => setEditForm((prev) => ({ ...prev, medicalHistory: text }))}
                    placeholder="أدخل التاريخ الطبي"
                    placeholderTextColor={COLORS.darkGray}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>التطعيمات</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={editForm.vaccinations}
                    onChangeText={(text) => setEditForm((prev) => ({ ...prev, vaccinations: text }))}
                    placeholder="أدخل التطعيمات"
                    placeholderTextColor={COLORS.darkGray}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={[styles.checkbox, editForm.isLost && styles.checkboxChecked]}
                      onPress={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          isLost: !prev.isLost,
                        }))
                      }
                    >
                      {editForm.isLost && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                    <Text style={styles.checkboxLabel}>الحيوان مفقود</Text>
                  </View>
                </View>
              </>
            )}
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
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
    color: COLORS.darkGray,
  },
  header: {
    padding: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
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
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  petName: {
    fontSize: 24,
    fontWeight: "bold",
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
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  petDetailItem: {
    alignItems: "center",
  },
  petDetailLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  petDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  tabsContainer: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
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
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
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
    fontWeight: "600",
    color: COLORS.black,
  },
  lostBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  lostBannerText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.error,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addSectionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addSectionButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  recordTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "bold",
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
    textAlign: "center",
    marginTop: 24,
    color: COLORS.darkGray,
  },
  clinicActions: {
    marginTop: 16,
    alignItems: "center",
  },
  followUpButton: {
    width: "100%",
  },
  ownerActions: {
    gap: 16,
  },
  adminActions: {
    gap: 16,
    marginTop: 16,
  },
  adoptionBreedingButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  adoptionButton: {
    backgroundColor: "#10B981",
  },
  breedingButton: {
    backgroundColor: "#8B5CF6",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    textAlign: "right",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  medicationCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  medicationHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  medicationIndex: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  addMedicationButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: "dashed",
    marginBottom: 16,
  },
  addMedicationText: {
    marginRight: 8,
    color: COLORS.primary,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: "row-reverse",
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
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
  },
  petInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  urgencyContainer: {
    flexDirection: "row-reverse",
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
    alignItems: "center",
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
    fontWeight: "600",
  },
  prescriptionImageButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: "dashed",
    marginBottom: 16,
    backgroundColor: COLORS.gray,
  },
  prescriptionImageText: {
    marginRight: 8,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  uploadedImageContainer: {
    position: "relative",
    marginBottom: 16,
    alignItems: "center",
  },
  uploadedImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "right",
    backgroundColor: COLORS.white,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  formHalf: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
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
    flexDirection: "row-reverse",
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    alignItems: "center",
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
    position: "relative",
    alignItems: "center",
  },
  imageUploadButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.gray,
  },
  imagePlaceholder: {
    alignItems: "center",
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.black,
  },

  accessGrantedText: {
    fontSize: 12,
    color: COLORS.success,
    textAlign: "center",
    marginTop: 8,
  },
  noAccessText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 8,
  },
  requestCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  requestClinicName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  requestPetName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  requestDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  requestReason: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  requestStatus: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusApproved: {
    backgroundColor: COLORS.success + "20",
    color: COLORS.success,
  },
  statusRejected: {
    backgroundColor: COLORS.error + "20",
    color: COLORS.error,
  },
  statusPending: {
    backgroundColor: COLORS.warning + "20",
    color: COLORS.warning,
  },
  requestActions: {
    flexDirection: "row-reverse",
    gap: 8,
    marginTop: 8,
  },
  requestButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  requestButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  requestAccessButton: {
    marginTop: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "right",
  },
  prescriptionThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: COLORS.darkGray,
  },
  accessPrompt: {
    alignItems: "center",
    marginTop: 8,
  },
  addFirstButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: "dashed",
    marginTop: 16,
    gap: 8,
  },
  addFirstButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  addMoreButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: "dashed",
    marginTop: 8,
    gap: 8,
  },
  addMoreButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  actionDetails: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  // Detail labels and values
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.darkGray,
    marginTop: 8,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },

  // Tab state for medical requests
  medicalRequestsTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },

  requestType: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    backgroundColor: COLORS.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },

  clinicFollowUpsSection: {
    marginBottom: 20,
    width: "100%",
  },
  clinicFollowUpCard: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  followUpDetails: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  cancelClinicFollowUpButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.error + "20",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  cancelClinicFollowUpText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: "600",
  },
  followUpDate: {
    fontSize: 11,
    color: COLORS.warning,
    marginBottom: 4,
    fontFamily: "System",
  },
  pendingRequests: {
    fontSize: 11,
    color: COLORS.error,
    fontWeight: "600",
    marginBottom: 4,
  },
});
