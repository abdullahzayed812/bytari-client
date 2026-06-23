import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator, Clipboard } from "react-native";
// Using remote service for barcode images instead of react-native-barcode-builder
// to avoid native ART dependencies incompatible with Expo Go.
import { Image as RNImage } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import Button from "../../components/Button 2";
import {
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  Plus,
  Check,
  XIcon,
  MessageCircle,
  PauseCircle,
  PlayCircle,
  Camera,
  ImageIcon,
  ArrowRightLeft,
  Zap,
  ClipboardList,
  Stethoscope,
  Syringe,
  FlaskConical,
  Folder,
  FileText,
  Phone,
  Bell,
  Heart,
  ShieldCheck,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageUploader } from "@/components/ImageUploader";
import { useImageUpload } from "@/hooks/useImageUpload";
import { trpc } from "../../lib/trpc";
import { PET_TYPE_LABELS } from "../add-adoption-pet";
import { useToastContext } from "@/providers/ToastProvider";
import ImageViewerModal from "@/components/ImageViewerModal";

// Small component so hooks can be called per follow-up card without violating rules of hooks
function ClinicChatButton({ petId, clinicId, petName }: { petId: string; clinicId: number; petName: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // const queryKey = trpc.clinics.chat.getChat.queryKey({ petId, clinicId });
  const { data, refetch } = useQuery({
    ...trpc.clinics.chat.getChat.queryOptions({ petId, clinicId }),
    refetchInterval: 15000,
  });
  const markAsReadMutation = useMutation(trpc.clinics.chat.markAsRead.mutationOptions());

  const chat = (data as any)?.chat;
  if (!chat || !chat.isActive) return null;
  const unread: number = chat.unreadCount ?? 0;

  const handlePress = async () => {
    if (unread > 0) {
      try {
        markAsReadMutation.mutate(
          { chatId: chat.id },
          {
            onSuccess: () => {
              queryClient.invalidateQueries(trpc.clinics.chat.getChat.queryKey() as any);
            },
          },
        );
      } catch {}
      refetch();
    }
    router.push({
      pathname: "/clinic-chat-thread",
      params: { chatId: chat.id, petName, senderRole: "owner" },
    });
  };

  return (
    <TouchableOpacity style={{ flexDirection: "row", gap: 4, padding: 6, marginLeft: 8, position: "relative" }} onPress={handlePress}>
      <MessageCircle size={22} color={COLORS.primary} />
      <Text style={styles.clinicName}>محادثة</Text>
      {unread > 0 && (
        <View style={chatBadgeStyles.badge}>
          <Text style={chatBadgeStyles.badgeText}>{unread > 99 ? "99+" : unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const chatBadgeStyles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: 0,
    left: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
});

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
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<
    "info" | "medical" | "vaccinations" | "reminders" | "clinics" | "requests" | "myRequests" | "lab" | "files" | "notes"
  >("info");

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);

  // Modal states for adding records
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const [editingMedicalRecord, setEditingMedicalRecord] = useState<any>(null);
  const [editingVaccination, setEditingVaccination] = useState<any>(null);
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showAccessRequestModal, setShowAccessRequestModal] = useState(false);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  const [selectedCard, setSelectedCard] = useState<{ type: "medical" | "vaccination" | "reminder" | "lab" | "file"; data: any } | null>(null);

  const {
    pickAndUploadImage,
    takeAndUploadFromCamera,
    isLoading: isMedicalImageUploading,
  } = useImageUpload({
    onUploadSuccess: (url) => setMedicalForm((prev) => ({ ...prev, prescriptionImage: url })),
  });

  const [showLabModal, setShowLabModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);

  const {
    pickAndUploadImage: pickFileImage,
    takeAndUploadFromCamera: takeFileImage,
    isLoading: isFileImageUploading,
  } = useImageUpload({
    onUploadSuccess: (url) => setFileForm((prev) => ({ ...prev, prescriptionImage: url })),
  });

  // barcode modal state
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

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
    isNeutered: false,
  });

  // Example with pre-filled values for testing
  const [treatmentForm, setTreatmentForm] = useState<TreatmentForm>({
    medications: [
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
      },
    ],
    instructions: "",
    followUpDate: "",
  });

  const [medicalForm, setMedicalForm] = useState<MedicalForm>({
    diagnosis: "",
    treatment: "",
    notes: "",
    prescriptionImage: "",
  });

  const [vaccinationForm, setVaccinationForm] = useState<VaccinationForm>({
    name: "",
    nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // بعد 30 يوم
    notes: "",
  });

  const [reminderForm, setReminderForm] = useState<ReminderForm>({
    title: "",
    description: "",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // بعد 7 أيام
  });

  const [followUpForm, setFollowUpForm] = useState<FollowUpForm>({
    reason: "",
    notes: "",
    urgency: "normal", // يمكن أيضًا استخدام "high" أو "low" حسب الحالة
  });

  const [labForm, setLabForm] = useState({ labNotes: "", notes: "" });
  const [fileForm, setFileForm] = useState({ description: "", prescriptionImage: "" });

  const [accessRequestForm, setAccessRequestForm] = useState<AccessRequestForm>({
    reason: "",
  });

  const isClinicAccess = (clinicAccess === "true" || fromClinic === "true") && userMode === "veterinarian";
  const isOwner = !isClinicAccess && userMode === "pet_owner";
  const isAdmin = userMode === "admin";

  // Fetch pet details based on user mode
  const petQuery = useQuery({
    ...trpc.pets.getProfile.queryOptions({
      petId: petId,
      clinicId: clinicId ? Number(clinicId) : undefined,
    }),
  });

  // Fetch my clinic requests (for vets)
  const myRequestsQuery = useQuery({
    ...trpc.pets.getMyAccessRequests.queryOptions({
      petId: petId,
      clinicId: Number(clinicId),
    }),
    enabled: isClinicAccess,
  });

  // Fetch access requests (for owner)
  const accessRequestsQuery = useQuery({
    ...trpc.pets.getPendingAccessRequests.queryOptions({ petId: petId }),
    enabled: isOwner,
  });

  // Fetch pending medical action requests (for owners)
  const pendingMedicalActionsQuery = useQuery({
    ...trpc.pets.getPendingMedicalActions.queryOptions({ petId: petId }),
    enabled: isOwner,
  });

  // Fetch clinic follow-ups (approved access)
  const clinicFollowUpsQuery = useQuery({
    ...trpc.pets.getClinicFollowUps.queryOptions({
      petId: petId,
    }),
    enabled: isOwner && !!petId,
  });

  const pet = petQuery.data?.pet;
  const isLoading = petQuery.isLoading;

  const checkAccess = useQuery({
    ...trpc.pets.checkClinicAccess.queryOptions({
      petId: petId,
      clinicId: Number(clinicId),
    }),
    enabled: isClinicAccess,
  });

  const [hasAccess, setHasAccess] = useState(false);
  useEffect(() => {
    if (checkAccess.data?.hasAccess) setHasAccess(true);
  }, [checkAccess.data]);

  const createApprovalMutation = useMutation(trpc.pets.createApprovalRequest.mutationOptions({}));
  const initiateTransferMutation = useMutation(trpc.pets.transfer.initiate.mutationOptions({}));
  const updatePetMutation = useMutation(trpc.admin.pets.updateProfile.mutationOptions({}));
  const deletePetMutation = useMutation(trpc.admin.pets.delete.mutationOptions({}));
  const updatePetOwnerMutation = useMutation(trpc.pets.update.mutationOptions({}));
  const deletePetOwnerMutation = useMutation(trpc.pets.delete.mutationOptions({}));
  // const deletePetOwnerMutation = useMutation(trpc.pets.delete.mutationOptions({}));

  // Direct add mutations (no approval flow)
  const createQuickReviewMutation = useMutation(trpc.clinics.quickReview.createQuickReview.mutationOptions());
  const createFullExamMutation = useMutation(trpc.clinics.quickReview.createFullExam.mutationOptions());
  const addVaccinationDirectMutation = useMutation(trpc.clinics.quickReview.addVaccination.mutationOptions());
  const addReminderDirectMutation = useMutation(trpc.clinics.quickReview.addReminder.mutationOptions());
  const updateVaccinationMutation = useMutation(trpc.clinics.quickReview.updateVaccination.mutationOptions());
  const updateReminderMutation = useMutation(trpc.clinics.quickReview.updateReminder.mutationOptions());
  const updateMedicalRecordMutation = useMutation(trpc.clinics.quickReview.updateMedicalRecord.mutationOptions());

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

  // Clinic chat — vet side: available to any clinic user viewing this pet
  const clinicChatQuery = useQuery({
    ...trpc.clinics.chat.getOrCreate.queryOptions({
      petId: petId as string,
      clinicId: Number(clinicId),
    }),
    enabled: isClinicAccess,
  });
  const chatData = (clinicChatQuery.data as any)?.chat as { id: number; isActive: boolean } | undefined;

  const toggleChatMutation = useMutation(trpc.clinics.chat.toggleActive.mutationOptions());

  const handleOpenChat = () => {
    if (!chatData) return;
    router.push({
      pathname: "/clinic-chat-thread",
      params: {
        chatId: chatData.id,
        petName: pet?.name ?? "",
        senderRole: "clinic",
        clinicId: String(clinicId),
        initialIsActive: chatData.isActive ? "true" : "false",
      },
    });
  };

  const handleToggleChat = () => {
    if (!chatData) return;
    toggleChatMutation.mutate(
      { chatId: chatData.id, clinicId: Number(clinicId) },
      {
        onSuccess: () => clinicChatQuery.refetch(),
        onError: (error) => showToast({ type: "error", message: error.message }),
      },
    );
  };

  // Refetch pet data when returning from quick-review / full-exam screens
  useFocusEffect(
    useCallback(() => {
      petQuery.refetch();
    }, []),
  );

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
        isNeutered: (pet as any).isNeutered || false,
      });
    }
  }, [pet]);

  // Set initial tab once userMode is known
  useEffect(() => {
    if (!userMode) return;
    if (openSection) return; // openSection effect handles this case
    const isClinician = (clinicAccess === "true" || fromClinic === "true") && userMode === "veterinarian";
    setActiveTab(isClinician ? "medical" : "info");
  }, [userMode]);

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
  const hasClinicFollowUps = pet ? pet.medicalRecords?.length > 0 || pet.vaccinations?.some((v: any) => v.clinicName) || pet.reminders?.length > 0 : false;

  const handleTransferOwnership = () => {
    if (!transferEmail.trim()) {
      showToast({ type: "error", message: "يرجى إدخال البريد الإلكتروني" });
      return;
    }
    if (!pet) return;
    initiateTransferMutation.mutate(
      { petId: pet.id, toEmail: transferEmail.trim() },
      {
        onSuccess: () => {
          showToast({ type: "success", message: "تم إرسال طلب نقل الملكية بنجاح. سيتم إشعار المستلم." });
          setShowTransferModal(false);
          setTransferEmail("");
          queryClient.invalidateQueries(trpc.pets.transfer.getSent.queryKey as any);
        },
        onError: (error) => {
          showToast({ type: "error", message: error.message || "حدث خطأ أثناء إرسال الطلب" });
        },
      },
    );
  };

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

  const handleAddTreatmentCard = () => {
    if (!isClinicAccess || !pet || !user) return;
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
        petId: pet.id,
        clinicId: Number(clinicId!),
        reason: followUpForm.reason,
      } as any);

      setShowFollowUpModal(false);
      setFollowUpForm({ reason: "", notes: "", urgency: "normal" });
      accessRequestsQuery.refetch();

      Alert.alert("تم إرسال الطلب", "تم إرسال طلب الصلاحية إلى مالك الحيوان. ستتمكن من إضافة البيانات بعد الموافقة.", [{ text: "موافق" }]);
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
        petId: pet.id,
        clinicId: Number(clinicId!),
        reason: accessRequestForm.reason,
      } as any);

      setShowAccessRequestModal(false);
      setAccessRequestForm({ reason: "" });
      accessRequestsQuery.refetch();

      Alert.alert("تم إرسال الطلب", "تم إرسال طلب الصلاحية إلى مالك الحيوان. ستتمكن من إضافة البيانات بعد الموافقة.", [{ text: "موافق" }]);
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

  const submitMedicalRecord = async () => {
    if (!medicalForm.diagnosis || !medicalForm.treatment) {
      Alert.alert("خطأ", "يرجى ملء الحقول المطلوبة");
      return;
    }
    if (!pet || !user) return;
    try {
      if (editingMedicalRecord) {
        await updateMedicalRecordMutation.mutateAsync({
          recordId: Number(editingMedicalRecord.id),
          diagnosis: medicalForm.diagnosis,
          treatment: medicalForm.treatment,
          notes: medicalForm.notes || undefined,
        });
        showToast({ message: "تم تحديث السجل الطبي", type: "success" });
      } else {
        await createQuickReviewMutation.mutateAsync({
          petId: pet.id,
          clinicId: Number(clinicId!),
          diagnosis: medicalForm.diagnosis,
          treatment: medicalForm.treatment,
          notes: medicalForm.notes,
        });
        showToast({ message: "تم إضافة السجل الطبي بنجاح", type: "success" });
      }
      setShowMedicalModal(false);
      setEditingMedicalRecord(null);
      setMedicalForm({ diagnosis: "", treatment: "", notes: "", prescriptionImage: "" });
      petQuery.refetch();
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل في حفظ السجل الطبي");
    }
  };

  const submitVaccination = async () => {
    if (!vaccinationForm.name) {
      Alert.alert("خطأ", "يرجى إدخال اسم التطعيم");
      return;
    }
    if (!pet || !user) return;
    try {
      if (editingVaccination) {
        await updateVaccinationMutation.mutateAsync({
          vaccinationId: Number(editingVaccination.id),
          name: vaccinationForm.name,
          nextDate: vaccinationForm.nextDate || undefined,
          notes: vaccinationForm.notes || undefined,
        });
        showToast({ message: "تم تحديث التطعيم", type: "success" });
      } else {
        await addVaccinationDirectMutation.mutateAsync({
          petId: pet.id,
          clinicId: Number(clinicId!),
          name: vaccinationForm.name,
          nextDate: vaccinationForm.nextDate || undefined,
          notes: vaccinationForm.notes || undefined,
        });
        showToast({ message: "تم إضافة التطعيم بنجاح", type: "success" });
      }
      setShowVaccinationModal(false);
      setEditingVaccination(null);
      setVaccinationForm({ name: "", nextDate: "", notes: "" });
      petQuery.refetch();
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل في حفظ التطعيم");
    }
  };

  const submitReminder = async () => {
    if (!reminderForm.title || !reminderForm.date) {
      Alert.alert("خطأ", "يرجى ملء الحقول المطلوبة");
      return;
    }
    if (!pet || !user) return;
    try {
      if (editingReminder) {
        await updateReminderMutation.mutateAsync({
          reminderId: Number(editingReminder.id),
          title: reminderForm.title,
          description: reminderForm.description || undefined,
          reminderDate: reminderForm.date,
        });
        showToast({ message: "تم تحديث التذكير", type: "success" });
      } else {
        await addReminderDirectMutation.mutateAsync({
          petId: pet.id,
          clinicId: Number(clinicId!),
          title: reminderForm.title,
          description: reminderForm.description || undefined,
          reminderDate: reminderForm.date,
          reminderType: "checkup",
        });
        showToast({ message: "تم إضافة التذكير بنجاح", type: "success" });
      }
      setShowReminderModal(false);
      setEditingReminder(null);
      setReminderForm({ title: "", description: "", date: "" });
      petQuery.refetch();
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل في حفظ التذكير");
    }
  };

  const submitLabResult = async () => {
    if (!labForm.labNotes) {
      Alert.alert("خطأ", "يرجى إدخال نتائج التحليل");
      return;
    }
    if (!pet || !user) return;
    try {
      await createFullExamMutation.mutateAsync({
        petId: pet.id,
        clinicId: Number(clinicId!),
        diagnosis: "تحاليل مختبرية",
        treatment: "—",
        labNotes: labForm.labNotes,
        notes: labForm.notes || undefined,
        recordType: "تحليل",
      });
      setShowLabModal(false);
      setLabForm({ labNotes: "", notes: "" });
      showToast({ message: "تم إضافة نتيجة التحليل بنجاح", type: "success" });
      petQuery.refetch();
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل في إضافة التحليل");
    }
  };

  const submitFile = async () => {
    if (!fileForm.prescriptionImage) {
      Alert.alert("خطأ", "يرجى إضافة صورة أو ملف");
      return;
    }
    if (!pet || !user) return;
    try {
      await createFullExamMutation.mutateAsync({
        petId: pet.id,
        clinicId: Number(clinicId!),
        diagnosis: fileForm.description || "ملف طبي",
        treatment: "—",
        prescriptionImage: fileForm.prescriptionImage || undefined,
        recordType: "ملف",
      });
      setShowFileModal(false);
      setFileForm({ description: "", prescriptionImage: "" });
      showToast({ message: "تم إضافة الملف بنجاح", type: "success" });
      petQuery.refetch();
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل في إضافة الملف");
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
          isNeutered: editForm.isNeutered,
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
        },
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
          isNeutered: editForm.isNeutered,
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
        },
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
            },
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
            },
          );
        },
      },
    ]);
  };

  const handleEditMedicalRecord = (record: any) => {
    setEditingMedicalRecord(record);
    setMedicalForm({ diagnosis: record.diagnosis, treatment: record.treatment, notes: record.notes || "", prescriptionImage: record.prescriptionImage || "" });
    setShowMedicalModal(true);
  };

  const handleEditVaccination = (vaccination: any) => {
    setEditingVaccination(vaccination);
    setVaccinationForm({
      name: vaccination.name,
      nextDate: vaccination.nextDate ? new Date(vaccination.nextDate).toISOString().split("T")[0] : "",
      notes: vaccination.notes || "",
    });
    setShowVaccinationModal(true);
  };

  const handleEditReminder = (reminder: any) => {
    setEditingReminder(reminder);
    setReminderForm({
      title: reminder.title,
      description: reminder.description || "",
      date: reminder.date ? new Date(reminder.date).toISOString().split("T")[0] : reminder.reminderDate || "",
    });
    setShowReminderModal(true);
  };

  const handleDeleteMedicalRecord = (recordId: string) => {
    if (!isClinicAccess) return;
    if (!pet) return;

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
    if (!isClinicAccess && !isOwner) return;
    if (!pet) return;

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
    if (!isClinicAccess && !isOwner) return;
    if (!pet) return;

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
                petId: petId,
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
      ],
    );
  };

  const handleAdoptionBreeding = (type: string) => {
    Alert.alert(`عرض ${type === "adoption" ? "للتبني" : "للتزاوج"}`, `هل تريد عرض هذا الحيوان ${type === "adoption" ? "للتبني" : "للتزاوج"}؟`, [
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
            },
          );
        },
      },
    ]);
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

      {/* ── Pet Identity Card ── */}
      <View style={styles.petIdentityCard}>
        {pet.isLost && (
          <View style={{ marginBottom: 10 }}>
            <View style={styles.heroBanner}>
              <AlertTriangle size={13} color={COLORS.white} />
              <Text style={styles.heroBannerText}>مفقود</Text>
            </View>
          </View>
        )}

        <View style={styles.petIdentityRow}>
          {/* Avatar */}
          <Image source={{ uri: pet.image }} style={styles.petAvatarImage} resizeMode="cover" />

          {/* Name + type + chips */}
          <View style={styles.petIdentityInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petType}>
              {PET_TYPE_LABELS[pet.type as keyof typeof PET_TYPE_LABELS] ?? pet.type}
              {pet.breed ? ` · ${pet.breed}` : ""}
            </Text>

            <View style={styles.heroChipsRow}>
              {pet.age ? (
                <View style={styles.heroChip}>
                  <Text style={styles.heroChipLabel}>العمر</Text>
                  <Text style={styles.heroChipValue}>{pet.age} سنة</Text>
                </View>
              ) : null}
              <View style={[styles.heroChip, { borderColor: pet.gender === "male" ? "#3B82F6" : "#EC4899" }]}>
                <Text style={styles.heroChipLabel}>الجنس</Text>
                <Text style={[styles.heroChipValue, { color: pet.gender === "male" ? "#3B82F6" : "#EC4899" }]}>{pet.gender === "male" ? "ذكر" : "أنثى"}</Text>
              </View>
              {pet.weight ? (
                <View style={styles.heroChip}>
                  <Text style={styles.heroChipLabel}>الوزن</Text>
                  <Text style={styles.heroChipValue}>{pet.weight} كجم</Text>
                </View>
              ) : null}
              {pet.color ? (
                <View style={styles.heroChip}>
                  <Text style={styles.heroChipLabel}>اللون</Text>
                  <Text style={styles.heroChipValue}>{pet.color}</Text>
                </View>
              ) : null}
              {(pet as any).isNeutered !== undefined && (
                <View style={[styles.heroChip, { borderColor: (pet as any).isNeutered ? COLORS.success : "#CBD5E1" }]}>
                  <ShieldCheck size={11} color={(pet as any).isNeutered ? COLORS.success : COLORS.darkGray} />
                  <Text style={[styles.heroChipValue, { color: (pet as any).isNeutered ? COLORS.success : COLORS.darkGray }]}>
                    {(pet as any).isNeutered ? "عقيم" : "غير عقيم"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Edit / Delete — aligned with avatar and name */}
          {isOwner && (
            <View style={{ gap: 8 }}>
              <TouchableOpacity onPress={handleEditPet} style={styles.heroIconBtn}>
                <Edit3 size={16} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeletePetForOwner} style={[styles.heroIconBtn, { backgroundColor: "rgba(239,68,68,0.85)" }]}>
                <Trash2 size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* ── Clinic Info Card ── */}
      {isClinicAccess && (
        <View style={styles.clinicInfoCard}>
          <View style={styles.ownerContactRow}>
            <View style={styles.ownerContactItem}>
              <View style={styles.ownerContactIcon}>
                <ClipboardList size={14} color={COLORS.primary} />
              </View>
              <Text style={styles.ownerContactLabel}>صاحب الحيوان</Text>
              <Text style={styles.ownerContactValue}>{pet.ownerName}</Text>
            </View>
            {(pet as any).ownerPhone && (
              <View style={styles.ownerContactItem}>
                <View style={[styles.ownerContactIcon, { backgroundColor: "#E8F5E9" }]}>
                  <Phone size={14} color={COLORS.success} />
                </View>
                <Text style={styles.ownerContactValue}>{(pet as any).ownerPhone}</Text>
              </View>
            )}
          </View>

          <View style={styles.clinicActionButtons}>
            <TouchableOpacity
              style={styles.quickReviewBtn}
              onPress={() => router.push({ pathname: "/clinic-quick-review", params: { clinicId: clinicId!, petId: petId! } })}
            >
              <Zap size={18} color={COLORS.white} />
              <Text style={styles.clinicActionBtnText}>مراجعة سريعة</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fullExamBtn}
              onPress={() => router.push({ pathname: "/clinic-full-exam", params: { clinicId: clinicId!, petId: petId! } })}
            >
              <ClipboardList size={18} color={COLORS.white} />
              <Text style={styles.clinicActionBtnText}>فحص كامل</Text>
            </TouchableOpacity>
          </View>

          {/* Chat with owner — visible to any clinic user */}
          {chatData && (
            <View style={styles.clinicChatRow}>
              <TouchableOpacity style={styles.chatOpenBtn} onPress={handleOpenChat} disabled={!chatData}>
                <MessageCircle size={18} color={COLORS.white} />
                <Text style={styles.clinicActionBtnText}>محادثة المالك</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chatToggleBtn, { backgroundColor: chatData?.isActive ? "#FFF3E0" : "#E8F5E9" }]}
                onPress={handleToggleChat}
                disabled={toggleChatMutation.isPending || !chatData}
              >
                {chatData?.isActive ? <PauseCircle size={18} color={COLORS.warning} /> : <PlayCircle size={18} color={COLORS.success} />}
                <Text style={[styles.chatToggleBtnText, { color: chatData?.isActive ? COLORS.warning : COLORS.success }]}>
                  {chatData?.isActive ? "إيقاف المحادثة" : "تفعيل المحادثة"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.clinicStatsRow}>
            <View style={styles.clinicStatItem}>
              <Text style={styles.clinicStatValue}>{pet.vaccinations?.length ?? 0}</Text>
              <Text style={styles.clinicStatLabel}>التطعيمات</Text>
            </View>
            <View style={styles.clinicStatDivider} />
            <View style={styles.clinicStatItem}>
              <Text style={styles.clinicStatValue}>{pet.medicalRecords?.length ?? 0}</Text>
              <Text style={styles.clinicStatLabel}>إجمالي الزيارات</Text>
            </View>
            <View style={styles.clinicStatDivider} />
            <View style={styles.clinicStatItem}>
              <Text style={styles.clinicStatValue}>
                {pet.medicalRecords?.[0]?.date ? new Date(pet.medicalRecords[0].date).toLocaleDateString("ar-SA") : "—"}
              </Text>
              <Text style={styles.clinicStatLabel}>آخر زيارة</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── Clinic icon tabs ── */}
      {isClinicAccess ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clinicTabsBar} contentContainerStyle={styles.clinicTabsContent}>
          {(
            [
              { key: "medical", label: "السجلات الطبية", Icon: ClipboardList },
              { key: "vaccinations", label: "التطعيمات", Icon: Syringe },
              { key: "reminders", label: "التذكيرات", Icon: Bell },
              { key: "lab", label: "التحاليل", Icon: FlaskConical },
              { key: "files", label: "الملفات", Icon: Folder },
            ] as const
          ).map(({ key, label, Icon }) => {
            const isActive = activeTab === key;
            return (
              <TouchableOpacity key={key} style={[styles.clinicIconTab, isActive && styles.clinicIconTabActive]} onPress={() => setActiveTab(key)}>
                <Icon size={20} color={isActive ? COLORS.success : COLORS.darkGray} />
                <Text style={[styles.clinicIconTabText, isActive && styles.clinicIconTabTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScrollWrapper} contentContainerStyle={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === "info" && styles.activeTab]} onPress={() => setActiveTab("info")}>
            <Text style={[styles.tabText, activeTab === "info" && styles.activeTabText]}>معلومات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === "vaccinations" && styles.activeTab]} onPress={() => setActiveTab("vaccinations")}>
            <Text style={[styles.tabText, activeTab === "vaccinations" && styles.activeTabText]}>التطعيمات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === "reminders" && styles.activeTab]} onPress={() => setActiveTab("reminders")}>
            <Text style={[styles.tabText, activeTab === "reminders" && styles.activeTabText]}>التذكيرات</Text>
          </TouchableOpacity>
          {isOwner && (
            <TouchableOpacity style={[styles.tab, activeTab === "clinics" && styles.activeTab]} onPress={() => setActiveTab("clinics")}>
              <Text style={[styles.tabText, activeTab === "clinics" && styles.activeTabText]}>العيادات</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

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
                <Text style={styles.infoLabel}>التعقيم</Text>
                <View style={[styles.neuteredBadge]}>
                  <Text style={styles.neuteredBadgeText}>{(pet as any).isNeutered ? "عقيم" : "غير عقيم"}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>رقم المعرف</Text>
                <TouchableOpacity
                  onPress={() => {
                    Clipboard.setString(String(pet.id));
                    showToast({ message: "تم نسخ رقم المعرف", type: "success" });
                  }}
                >
                  <Text style={[styles.infoValue, { textDecorationLine: "underline" }]}>{pet.id}</Text>
                </TouchableOpacity>
              </View>

              {pet.id && (
                <TouchableOpacity onPress={() => setShowBarcodeModal(true)} style={styles.barcodeRow}>
                  <RNImage
                    source={{ uri: `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(pet.id.toString())}&code=Code128&translate-esc=true` }}
                    style={styles.barcodeThumbnail}
                  />
                  <Text style={styles.barcodeTapHint}>اضغط للتكبير</Text>
                </TouchableOpacity>
              )}

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
                {/* {clinicFollowUpsQuery.data?.followUps && clinicFollowUpsQuery.data.followUps.length > 0 && (
                  <View style={styles.clinicFollowUpsSection}>
                    <Text style={styles.sectionTitle}>المتابعات مع العيادات</Text>
                    {clinicFollowUpsQuery.data.followUps.map((clinic) => (
                      <View key={clinic.clinicId} style={styles.clinicFollowUpCard}>
                        <View style={styles.clinicInfo}>
                          <View style={styles.clinicNameRow}>
                            <ClinicChatButton petId={petId as string} clinicId={clinic.clinicId} petName={pet?.name ?? ""} />
                          </View>
                          <TouchableOpacity
                            style={styles.clinicNameRow}
                            onPress={() =>
                              router.push({
                                pathname: "/clinic-profile",
                                params: { id: clinic.clinicId },
                              })
                            }
                          >
                            <Text style={styles.clinicName}>{clinic.clinicName}</Text>
                          </TouchableOpacity>
                          <Text style={styles.followUpDetails}>
                            {clinic.medicalRecordsCount} سجلات طبية • {clinic.vaccinationsCount} تطعيمات • {clinic.remindersCount} تذكيرات
                          </Text>
                          {clinic.expiresAt && (
                            <Text style={styles.followUpDate}>الصلاحية تنتهي: {new Date(clinic.expiresAt).toLocaleDateString("ar-SA")}</Text>
                          )}
                          {clinic.pendingFollowUpsCount > 0 && <Text style={styles.pendingRequests}>{clinic.pendingFollowUpsCount} طلب متابعة معلق</Text>}
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
                )} */}

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

                <Button
                  title="نقل الملكية"
                  onPress={() => setShowTransferModal(true)}
                  type="outline"
                  size="medium"
                  style={styles.actionButton}
                  icon={<ArrowRightLeft size={16} color={COLORS.primary} />}
                />
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

        {activeTab === "medical" && isClinicAccess && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>السجلات الطبية</Text>
            </View>

            {!pet.medicalRecords || pet.medicalRecords.filter((r: any) => r.recordType !== "تحليل" && r.recordType !== "ملف").length === 0 ? (
              <View style={styles.emptyState}>
                <Stethoscope size={36} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>لا توجد سجلات طبية</Text>
              </View>
            ) : (
              pet.medicalRecords
                .filter((r: any) => r.recordType !== "تحليل" && r.recordType !== "ملف")
                .slice()
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((record: any) => {
                  const isQuick = record.recordType === "مراجعة_سريعة";
                  const typeLabel = isQuick ? "مراجعة سريعة" : record.recordType === "فحص_شامل" ? "فحص شامل" : "سجل طبي";
                  const typeColor = isQuick ? COLORS.warning : COLORS.primary;
                  return (
                    <TouchableOpacity
                      key={record.id}
                      style={styles.recordCard}
                      onPress={() => setSelectedCard({ type: "medical", data: record })}
                      activeOpacity={0.85}
                    >
                      <View style={styles.recordTitleRow}>
                        <Text style={[styles.recordTitle, { flex: 1 }]}>{record.diagnosis}</Text>
                        <View style={[styles.recordTypeBadge, { backgroundColor: typeColor + "22", borderColor: typeColor }]}>
                          {isQuick ? <Zap size={11} color={typeColor} /> : <ClipboardList size={11} color={typeColor} />}
                          <Text style={[styles.recordTypeText, { color: typeColor }]}>{typeLabel}</Text>
                        </View>
                        {isClinicAccess && (
                          <View style={{ flexDirection: "row", gap: 6 }}>
                            <TouchableOpacity onPress={() => handleEditMedicalRecord(record)} style={styles.deleteButton}>
                              <Edit3 size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteMedicalRecord(record.id)} style={styles.deleteButton}>
                              <Trash2 size={16} color={COLORS.error} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>

                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>التاريخ</Text>
                        <Text style={styles.recordValue}>{new Date(record.date).toLocaleDateString("ar-SA")}</Text>
                      </View>

                      {record.clinicName && (
                        <View style={styles.recordItem}>
                          <Text style={styles.recordLabel}>العيادة</Text>
                          <Text style={styles.recordValue}>{record.clinicName}</Text>
                        </View>
                      )}

                      {record.doctorName && (
                        <View style={styles.recordItem}>
                          <Text style={styles.recordLabel}>الطبيب</Text>
                          <Text style={styles.recordValue}>{record.doctorName}</Text>
                        </View>
                      )}

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
                              setSelectedImageUrl(record.prescriptionImage);
                              setShowImageModal(true);
                            }}
                          >
                            <Image source={{ uri: record.prescriptionImage }} style={styles.prescriptionThumbnail} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
            )}
          </View>
        )}

        <ImageViewerModal visible={showImageModal} imageUrl={selectedImageUrl} onClose={() => setShowImageModal(false)} />

        {/* barcode enlarged modal */}
        <Modal visible={showBarcodeModal} transparent={true} animationType="fade" onRequestClose={() => setShowBarcodeModal(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.6)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: COLORS.white,
                padding: 20,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              {pet.id && (
                <RNImage
                  source={{
                    uri: `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(pet.id.toString())}&code=Code128&translate-esc=true`,
                  }}
                  style={{ width: 300, height: 120 }}
                />
              )}
              <Text style={{ fontSize: 16, marginTop: 8 }}>{pet.id}</Text>
              <TouchableOpacity onPress={() => setShowBarcodeModal(false)} style={{ marginTop: 12 }}>
                <Text style={{ color: COLORS.primary }}>إغلاق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {activeTab === "vaccinations" && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("التطعيمات")}</Text>
              {isClinicAccess && userMode === "veterinarian" && (
                <TouchableOpacity style={styles.addSectionButton} onPress={handleAddVaccination}>
                  <Plus size={16} color={COLORS.primary} />
                  <Text style={styles.addSectionButtonText}>إضافة تطعيم</Text>
                </TouchableOpacity>
              )}
            </View>

            {!pet.vaccinations || pet.vaccinations.length === 0 ? (
              <View style={styles.emptyState}>
                <Syringe size={36} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>لا يوجد تطعيمات</Text>
              </View>
            ) : (
              <>
                {pet.vaccinations
                  .slice()
                  .reverse()
                  .map((vaccination: any) => (
                    <TouchableOpacity
                      key={vaccination.id}
                      style={[styles.recordCard, { borderLeftColor: COLORS.success }]}
                      onPress={() => setSelectedCard({ type: "vaccination", data: vaccination })}
                      activeOpacity={0.85}
                    >
                      <View style={styles.recordTitleRow}>
                        <Text style={styles.recordTitle}>{vaccination.name}</Text>
                        {isClinicAccess ? (
                          <View style={{ flexDirection: "row", gap: 6 }}>
                            <TouchableOpacity onPress={() => handleEditVaccination(vaccination)} style={styles.deleteButton}>
                              <Edit3 size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteVaccination(vaccination.id)} style={styles.deleteButton}>
                              <Trash2 size={16} color={COLORS.error} />
                            </TouchableOpacity>
                          </View>
                        ) : isOwner ? (
                          <TouchableOpacity onPress={() => handleDeleteVaccination(vaccination.id)} style={styles.deleteButton}>
                            <Trash2 size={16} color={COLORS.error} />
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>التاريخ</Text>
                        <Text style={styles.recordValue}>{new Date(vaccination.date).toLocaleDateString("ar-SA")}</Text>
                      </View>

                      {vaccination.nextDate && (
                        <View style={styles.recordItem}>
                          <Text style={styles.recordLabel}>الموعد القادم</Text>
                          <Text style={styles.recordValue}>{new Date(vaccination.nextDate).toLocaleDateString("ar-SA")}</Text>
                        </View>
                      )}

                      {vaccination.notes && (
                        <View style={styles.recordItem}>
                          <Text style={styles.recordLabel}>ملاحظات</Text>
                          <Text style={styles.recordValue}>{vaccination.notes}</Text>
                        </View>
                      )}

                      {isClinicAccess && vaccination.clinicId === Number(clinicId) && vaccination.doctorName && (
                        <View style={styles.recordItem}>
                          <Stethoscope size={13} color={COLORS.darkGray} />
                          <Text style={styles.recordLabel}>الطبيب</Text>
                          <Text style={styles.recordValue}>{vaccination.doctorName}</Text>
                        </View>
                      )}
                      {vaccination.clinicName && (
                        <View style={styles.recordItem}>
                          <Text style={styles.recordLabel}>العيادة</Text>
                          <Text style={styles.recordValue}>{vaccination.clinicName}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                {isClinicAccess && (
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
                <TouchableOpacity style={styles.addSectionButton} onPress={handleAddReminder}>
                  <Plus size={16} color={COLORS.primary} />
                  <Text style={styles.addSectionButtonText}>إضافة تذكير</Text>
                </TouchableOpacity>
              )}
            </View>

            {!pet.reminders || pet.reminders.length === 0 ? (
              <View style={styles.emptyState}>
                <Bell size={36} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>لا يوجد تذكيرات</Text>
              </View>
            ) : (
              pet.reminders
                .slice()
                .reverse()
                .map((reminder: any) => (
                  <TouchableOpacity
                    key={reminder.id}
                    style={[styles.recordCard, { borderLeftColor: COLORS.warning }, reminder.isCompleted && styles.completedReminderCard]}
                    onPress={() => setSelectedCard({ type: "reminder", data: reminder })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.recordTitleRow}>
                      <Text style={styles.recordTitle}>{reminder.title}</Text>
                      {isClinicAccess ? (
                        <View style={{ flexDirection: "row", gap: 6 }}>
                          <TouchableOpacity onPress={() => handleEditReminder(reminder)} style={styles.deleteButton}>
                            <Edit3 size={16} color={COLORS.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteReminder(reminder.id)} style={styles.deleteButton}>
                            <Trash2 size={16} color={COLORS.error} />
                          </TouchableOpacity>
                        </View>
                      ) : isOwner ? (
                        <TouchableOpacity onPress={() => handleDeleteReminder(reminder.id)} style={styles.deleteButton}>
                          <Trash2 size={16} color={COLORS.error} />
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>التاريخ</Text>
                      <Text style={styles.recordValue}>{new Date(reminder.date).toLocaleDateString("ar-SA")}</Text>
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
                        {reminder.type === "vaccination" ? "تطعيم" : reminder.type === "medication" ? "دواء" : reminder.type === "checkup" ? "فحص" : "أخرى"}
                      </Text>
                    </View>

                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>الحالة</Text>
                      <Text style={[styles.recordValue, reminder.isCompleted ? styles.completedStatus : styles.pendingStatus]}>
                        {reminder.isCompleted ? "مكتمل" : "قيد الانتظار"}
                      </Text>
                    </View>

                    {isClinicAccess && reminder.clinicId === Number(clinicId) && reminder.doctorName && (
                      <View style={styles.recordItem}>
                        <Stethoscope size={13} color={COLORS.darkGray} />
                        <Text style={styles.recordLabel}>الطبيب</Text>
                        <Text style={styles.recordValue}>{reminder.doctorName}</Text>
                      </View>
                    )}
                    {reminder.clinicName && (
                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>العيادة</Text>
                        <Text style={styles.recordValue}>{reminder.clinicName}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
            )}
          </View>
        )}

        {/* ── التحاليل tab ── */}
        {activeTab === "lab" && isClinicAccess && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>التحاليل والفحوصات المخبرية</Text>
              <TouchableOpacity style={styles.addSectionButton} onPress={() => setShowLabModal(true)}>
                <Plus size={16} color={COLORS.primary} />
                <Text style={styles.addSectionButtonText}>إضافة تحليل</Text>
              </TouchableOpacity>
            </View>
            {pet.medicalRecords?.filter((r: any) => r.labNotes)?.length === 0 ? (
              <View style={styles.emptyState}>
                <FlaskConical size={36} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>لا توجد نتائج تحاليل</Text>
              </View>
            ) : (
              pet.medicalRecords
                ?.filter((r: any) => r.labNotes)
                .slice()
                .reverse()
                .map((record: any) => (
                  <TouchableOpacity
                    key={record.id}
                    style={styles.recordCard}
                    onPress={() => setSelectedCard({ type: "lab", data: record })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>التاريخ</Text>
                      <Text style={styles.recordValue}>{new Date(record.date).toLocaleDateString("ar-SA")}</Text>
                    </View>
                    {record.clinicName && (
                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>العيادة</Text>
                        <Text style={styles.recordValue}>{record.clinicName}</Text>
                      </View>
                    )}
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>نتائج التحاليل</Text>
                      <Text style={styles.recordValue}>{record.labNotes}</Text>
                    </View>
                    {record.notes && (
                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>ملاحظات</Text>
                        <Text style={styles.recordValue}>{record.notes}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
            )}
            {pet.medicalRecords?.filter((r: any) => r.labNotes)?.length > 0 && (
              <TouchableOpacity style={styles.addMoreButton} onPress={() => setShowLabModal(true)}>
                <Plus size={20} color={COLORS.primary} />
                <Text style={styles.addMoreButtonText}>إضافة تحليل جديد</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── الملفات tab ── */}
        {activeTab === "files" && isClinicAccess && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الملفات والصور المرفقة</Text>
              <TouchableOpacity style={styles.addSectionButton} onPress={() => setShowFileModal(true)}>
                <Plus size={16} color={COLORS.primary} />
                <Text style={styles.addSectionButtonText}>إضافة ملف</Text>
              </TouchableOpacity>
            </View>
            {pet.medicalRecords?.filter((r: any) => r.prescriptionImage || r.fileUrls?.length > 0)?.length === 0 ? (
              <View style={styles.emptyState}>
                <Folder size={36} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>لا توجد ملفات مرفقة</Text>
              </View>
            ) : (
              pet.medicalRecords
                ?.filter((r: any) => r.prescriptionImage || r.fileUrls?.length > 0)
                .slice()
                .reverse()
                .map((record: any) => (
                  <TouchableOpacity
                    key={record.id}
                    style={styles.recordCard}
                    onPress={() => setSelectedCard({ type: "file", data: record })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>التاريخ</Text>
                      <Text style={styles.recordValue}>{new Date(record.date).toLocaleDateString("ar-SA")}</Text>
                    </View>
                    {record.diagnosis && record.diagnosis !== "ملف طبي" && (
                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>الوصف</Text>
                        <Text style={styles.recordValue}>{record.diagnosis}</Text>
                      </View>
                    )}
                    {record.prescriptionImage && (
                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>صورة الوصفة</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedImageUrl(record.prescriptionImage);
                            setShowImageModal(true);
                          }}
                        >
                          <Image source={{ uri: record.prescriptionImage }} style={styles.prescriptionThumbnail} />
                        </TouchableOpacity>
                      </View>
                    )}
                    {record.fileUrls?.map((url: string, i: number) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => {
                          setSelectedImageUrl(url);
                          setShowImageModal(true);
                        }}
                      >
                        <Image source={{ uri: url }} style={[styles.prescriptionThumbnail, { marginTop: 6 }]} />
                      </TouchableOpacity>
                    ))}
                  </TouchableOpacity>
                ))
            )}
            {pet.medicalRecords?.filter((r: any) => r.prescriptionImage || r.fileUrls?.length > 0)?.length > 0 && (
              <TouchableOpacity style={styles.addMoreButton} onPress={() => setShowFileModal(true)}>
                <Plus size={20} color={COLORS.primary} />
                <Text style={styles.addMoreButtonText}>إضافة ملف جديد</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── الملاحظات tab ── */}
        {activeTab === "notes" && isClinicAccess && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الملاحظات الطبية</Text>
            </View>
            {pet.medicalRecords?.filter((r: any) => r.notes)?.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={36} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>لا توجد ملاحظات</Text>
              </View>
            ) : (
              pet.medicalRecords
                ?.filter((r: any) => r.notes)
                .slice()
                .reverse()
                .map((record: any) => (
                  <View key={record.id} style={styles.recordCard}>
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>التاريخ</Text>
                      <Text style={styles.recordValue}>{new Date(record.date).toLocaleDateString("ar-SA")}</Text>
                    </View>
                    {record.clinicName && (
                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>العيادة</Text>
                        <Text style={styles.recordValue}>{record.clinicName}</Text>
                      </View>
                    )}
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>الملاحظات</Text>
                      <Text style={styles.recordValue}>{record.notes}</Text>
                    </View>
                  </View>
                ))
            )}
          </View>
        )}

        {activeTab === "clinics" && isOwner && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>العيادات التي زارها الحيوان</Text>
            </View>
            {clinicFollowUpsQuery.isLoading ? (
              <ActivityIndicator size="large" />
            ) : !clinicFollowUpsQuery.data?.followUps || clinicFollowUpsQuery.data.followUps.length === 0 ? (
              <View style={styles.emptyState}>
                <Heart size={36} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>لم يزر الحيوان أي عيادة بعد</Text>
              </View>
            ) : (
              clinicFollowUpsQuery.data.followUps.map((clinic: any) => (
                <TouchableOpacity
                  key={clinic.clinicId}
                  style={styles.clinicFollowUpCard}
                  onPress={() => router.push({ pathname: "/clinic-profile", params: { id: clinic.clinicId } })}
                >
                  <View style={styles.clinicInfo}>
                    <View style={styles.clinicNameRow}>
                      {clinic.clinicLogo ? (
                        <Image source={{ uri: clinic.clinicLogo }} style={{ width: 36, height: 36, borderRadius: 18, marginLeft: 8 }} />
                      ) : null}
                      <Text style={styles.clinicName}>{clinic.clinicName}</Text>
                    </View>
                    <ClinicChatButton petId={petId as string} clinicId={clinic.clinicId} petName={pet?.name ?? ""} />
                    <Text style={styles.followUpDetails}>
                      {clinic.medicalRecordsCount} سجلات طبية • {clinic.vaccinationsCount} تطعيمات • {clinic.remindersCount} تذكيرات
                    </Text>
                  </View>
                </TouchableOpacity>
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
                <Button title="طلب متابعة جديد" onPress={handleFollowUp} type="primary" size="medium" style={styles.requestAccessButton} />
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
                      {request.status === "approved" ? "مقبول" : request.status === "rejected" ? "مرفوض" : "قيد الانتظار"}
                    </Text>
                  </View>

                  <Text style={styles.requestReason}>{request.reason}</Text>
                  <Text style={styles.requestDate}>{new Date(request.createdAt).toLocaleDateString()}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* {activeTab === "requests" && isOwner && (
          <View> */}
        {/* --- Section 1: Clinic Access Requests --- */}
        {/* <View style={styles.sectionHeader}>
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
                    <TouchableOpacity style={[styles.requestButton, styles.approveButton]} onPress={() => handleApproveRequest(request.id)}>
                      <Check size={16} color={COLORS.white} />
                      <Text style={styles.requestButtonText}>موافقة</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.requestButton, styles.rejectButton]} onPress={() => handleRejectRequest(request.id)}>
                      <XIcon size={16} color={COLORS.white} />
                      <Text style={styles.requestButtonText}>رفض</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )} */}

        {/* --- Section 2: Medical Data Requests --- */}
        {/* <View style={styles.sectionHeader}>
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
                    {request.actionType === "medical_record" ? "سجل طبي" : request.actionType === "vaccination" ? "تطعيم" : "تذكير"}
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
                    <TouchableOpacity style={[styles.requestButton, styles.approveButton]} onPress={() => handleApproveMedicalAction(request.id)}>
                      <Check size={16} color={COLORS.white} />
                      <Text style={styles.requestButtonText}>موافقة</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.requestButton, styles.rejectButton]} onPress={() => handleRejectMedicalAction(request.id)}>
                      <XIcon size={16} color={COLORS.white} />
                      <Text style={styles.requestButtonText}>رفض</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )} */}
      </View>

      {/* ── Card Detail Modal ── */}
      <Modal visible={!!selectedCard} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedCard(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedCard?.type === "medical"
                ? selectedCard.data.recordType === "مراجعة_سريعة"
                  ? "تفاصيل المراجعة السريعة"
                  : selectedCard.data.recordType === "فحص_شامل"
                    ? "تفاصيل الفحص الشامل"
                    : "تفاصيل السجل الطبي"
                : selectedCard?.type === "vaccination"
                  ? "تفاصيل التطعيم"
                  : selectedCard?.type === "reminder"
                    ? "تفاصيل التذكير"
                    : selectedCard?.type === "lab"
                      ? "تفاصيل التحليل"
                      : "تفاصيل الملف"}
            </Text>
            <TouchableOpacity onPress={() => setSelectedCard(null)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedCard?.type === "medical" &&
              (() => {
                const d = selectedCard.data;
                const isQuick = d.recordType === "مراجعة_سريعة";
                const typeLabel = isQuick ? "مراجعة سريعة" : d.recordType === "فحص_شامل" ? "فحص شامل" : "سجل طبي";
                const typeColor = isQuick ? COLORS.warning : COLORS.primary;
                return (
                  <View>
                    <View style={[detailStyles.typeBadge, { backgroundColor: typeColor + "22", borderColor: typeColor }]}>
                      {isQuick ? <Zap size={13} color={typeColor} /> : <ClipboardList size={13} color={typeColor} />}
                      <Text style={[detailStyles.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
                    </View>
                    <View style={detailStyles.row}>
                      <Text style={detailStyles.label}>التاريخ</Text>
                      <Text style={detailStyles.value}>{new Date(d.date).toLocaleDateString("ar-SA")}</Text>
                    </View>
                    {d.clinicName && (
                      <View style={detailStyles.row}>
                        <Text style={detailStyles.label}>العيادة</Text>
                        <Text style={detailStyles.value}>{d.clinicName}</Text>
                      </View>
                    )}
                    {d.doctorName && (
                      <View style={detailStyles.row}>
                        <Stethoscope size={14} color={COLORS.darkGray} />
                        <Text style={detailStyles.label}>الطبيب</Text>
                        <Text style={detailStyles.value}>{d.doctorName}</Text>
                      </View>
                    )}
                    <View style={detailStyles.divider} />
                    <View style={detailStyles.row}>
                      <Text style={detailStyles.label}>التشخيص</Text>
                      <Text style={[detailStyles.value, { flex: 1 }]}>{d.diagnosis}</Text>
                    </View>
                    <View style={detailStyles.row}>
                      <Text style={detailStyles.label}>العلاج</Text>
                      <Text style={[detailStyles.value, { flex: 1 }]}>{d.treatment}</Text>
                    </View>
                    {d.symptoms && (
                      <View style={detailStyles.row}>
                        <Text style={detailStyles.label}>الأعراض</Text>
                        <Text style={[detailStyles.value, { flex: 1 }]}>{d.symptoms}</Text>
                      </View>
                    )}
                    {d.severity && (
                      <View style={detailStyles.row}>
                        <Text style={detailStyles.label}>الشدة</Text>
                        <Text style={detailStyles.value}>{d.severity}</Text>
                      </View>
                    )}
                    {d.notes && (
                      <View style={detailStyles.row}>
                        <Text style={detailStyles.label}>ملاحظات</Text>
                        <Text style={[detailStyles.value, { flex: 1 }]}>{d.notes}</Text>
                      </View>
                    )}
                    {d.labNotes && (
                      <>
                        <View style={detailStyles.divider} />
                        <View style={detailStyles.row}>
                          <Text style={detailStyles.label}>نتائج التحاليل</Text>
                          <Text style={[detailStyles.value, { flex: 1 }]}>{d.labNotes}</Text>
                        </View>
                      </>
                    )}
                    {d.prescriptionImage && (
                      <>
                        <View style={detailStyles.divider} />
                        <Text style={detailStyles.label}>صورة الوصفة</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedCard(null);
                            setSelectedImageUrl(d.prescriptionImage);
                            setShowImageModal(true);
                          }}
                        >
                          <Image source={{ uri: d.prescriptionImage }} style={detailStyles.image} resizeMode="cover" />
                        </TouchableOpacity>
                      </>
                    )}
                    {d.fileUrls?.length > 0 && (
                      <>
                        <View style={detailStyles.divider} />
                        <Text style={detailStyles.label}>الملفات المرفقة</Text>
                        {d.fileUrls.map((url: string, i: number) => (
                          <TouchableOpacity
                            key={i}
                            onPress={() => {
                              setSelectedCard(null);
                              setSelectedImageUrl(url);
                              setShowImageModal(true);
                            }}
                          >
                            <Image source={{ uri: url }} style={[detailStyles.image, { marginTop: 8 }]} resizeMode="cover" />
                          </TouchableOpacity>
                        ))}
                      </>
                    )}
                  </View>
                );
              })()}

            {selectedCard?.type === "vaccination" &&
              (() => {
                const d = selectedCard.data;
                return (
                  <View>
                    <Text style={detailStyles.bigTitle}>{d.name}</Text>
                    <View style={detailStyles.row}>
                      <Text style={detailStyles.label}>تاريخ التطعيم</Text>
                      <Text style={detailStyles.value}>{new Date(d.date).toLocaleDateString("ar-SA")}</Text>
                    </View>
                    {d.nextDate && (
                      <View style={detailStyles.row}>
                        <Text style={detailStyles.label}>الموعد القادم</Text>
                        <Text style={detailStyles.value}>{new Date(d.nextDate).toLocaleDateString("ar-SA")}</Text>
                      </View>
                    )}
                    {d.status && (
                      <View style={detailStyles.row}>
                        <Text style={detailStyles.label}>الحالة</Text>
                        <Text style={[detailStyles.value, { color: COLORS.success }]}>{d.status === "completed" ? "مكتمل" : d.status}</Text>
                      </View>
                    )}
                    {d.doctorName && (
                      <View style={detailStyles.row}>
                        <Stethoscope size={14} color={COLORS.darkGray} />
                        <Text style={detailStyles.label}>الطبيب</Text>
                        <Text style={detailStyles.value}>{d.doctorName}</Text>
                      </View>
                    )}
                    {d.clinicName && (
                      <View style={detailStyles.row}>
                        <Text style={detailStyles.label}>العيادة</Text>
                        <Text style={detailStyles.value}>{d.clinicName}</Text>
                      </View>
                    )}
                    {d.notes && (
                      <>
                        <View style={detailStyles.divider} />
                        <View style={detailStyles.row}>
                          <Text style={detailStyles.label}>ملاحظات</Text>
                          <Text style={[detailStyles.value, { flex: 1 }]}>{d.notes}</Text>
                        </View>
                      </>
                    )}
                  </View>
                );
              })()}

            {selectedCard?.type === "reminder" &&
              (() => {
                const d = selectedCard.data;
                const typeMap: Record<string, string> = { vaccination: "تطعيم", medication: "دواء", checkup: "فحص", other: "أخرى" };
                return (
                  <View>
                    <Text style={detailStyles.bigTitle}>{d.title}</Text>
                    <View style={[detailStyles.statusBadge, { backgroundColor: d.isCompleted ? "#E8F5E9" : "#FFF3E0" }]}>
                      {d.isCompleted ? <Check size={14} color={COLORS.success} /> : <Bell size={14} color={COLORS.warning} />}
                      <Text style={[detailStyles.statusBadgeText, { color: d.isCompleted ? COLORS.success : COLORS.warning }]}>
                        {d.isCompleted ? "مكتمل" : "قيد الانتظار"}
                      </Text>
                    </View>
                    <View style={detailStyles.row}>
                      <Text style={detailStyles.label}>التاريخ</Text>
                      <Text style={detailStyles.value}>{new Date(d.date).toLocaleDateString("ar-SA")}</Text>
                    </View>
                    <View style={detailStyles.row}>
                      <Text style={detailStyles.label}>النوع</Text>
                      <Text style={detailStyles.value}>{typeMap[d.type] ?? d.type}</Text>
                    </View>
                    {d.doctorName && (
                      <View style={detailStyles.row}>
                        <Stethoscope size={14} color={COLORS.darkGray} />
                        <Text style={detailStyles.label}>الطبيب</Text>
                        <Text style={detailStyles.value}>{d.doctorName}</Text>
                      </View>
                    )}
                    {d.clinicName && (
                      <View style={detailStyles.row}>
                        <Text style={detailStyles.label}>العيادة</Text>
                        <Text style={detailStyles.value}>{d.clinicName}</Text>
                      </View>
                    )}
                    {d.description && (
                      <>
                        <View style={detailStyles.divider} />
                        <View style={detailStyles.row}>
                          <Text style={detailStyles.label}>الوصف</Text>
                          <Text style={[detailStyles.value, { flex: 1 }]}>{d.description}</Text>
                        </View>
                      </>
                    )}
                  </View>
                );
              })()}

            {selectedCard?.type === "lab" &&
              (() => {
                const d = selectedCard.data;
                return (
                  <View>
                    <View style={detailStyles.row}>
                      <Text style={detailStyles.label}>التاريخ</Text>
                      <Text style={detailStyles.value}>{new Date(d.date).toLocaleDateString("ar-SA")}</Text>
                    </View>
                    {d.clinicName && (
                      <View style={detailStyles.row}>
                        <Text style={detailStyles.label}>العيادة</Text>
                        <Text style={detailStyles.value}>{d.clinicName}</Text>
                      </View>
                    )}
                    {d.doctorName && (
                      <View style={detailStyles.row}>
                        <Stethoscope size={14} color={COLORS.darkGray} />
                        <Text style={detailStyles.label}>الطبيب</Text>
                        <Text style={detailStyles.value}>{d.doctorName}</Text>
                      </View>
                    )}
                    <View style={detailStyles.divider} />
                    <Text style={detailStyles.label}>نتائج التحاليل</Text>
                    <Text style={detailStyles.multilineValue}>{d.labNotes}</Text>
                    {d.notes && (
                      <>
                        <View style={detailStyles.divider} />
                        <Text style={detailStyles.label}>ملاحظات</Text>
                        <Text style={detailStyles.multilineValue}>{d.notes}</Text>
                      </>
                    )}
                  </View>
                );
              })()}

            {selectedCard?.type === "file" &&
              (() => {
                const d = selectedCard.data;
                return (
                  <View>
                    <View style={detailStyles.row}>
                      <Text style={detailStyles.label}>التاريخ</Text>
                      <Text style={detailStyles.value}>{new Date(d.date).toLocaleDateString("ar-SA")}</Text>
                    </View>
                    {d.diagnosis && d.diagnosis !== "ملف طبي" && (
                      <View style={detailStyles.row}>
                        <Text style={detailStyles.label}>الوصف</Text>
                        <Text style={[detailStyles.value, { flex: 1 }]}>{d.diagnosis}</Text>
                      </View>
                    )}
                    {d.clinicName && (
                      <View style={detailStyles.row}>
                        <Text style={detailStyles.label}>العيادة</Text>
                        <Text style={detailStyles.value}>{d.clinicName}</Text>
                      </View>
                    )}
                    {d.doctorName && (
                      <View style={detailStyles.row}>
                        <Stethoscope size={14} color={COLORS.darkGray} />
                        <Text style={detailStyles.label}>الطبيب</Text>
                        <Text style={detailStyles.value}>{d.doctorName}</Text>
                      </View>
                    )}
                    {d.prescriptionImage && (
                      <>
                        <View style={detailStyles.divider} />
                        <Text style={detailStyles.label}>الصورة / الوصفة</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedCard(null);
                            setSelectedImageUrl(d.prescriptionImage);
                            setShowImageModal(true);
                          }}
                        >
                          <Image source={{ uri: d.prescriptionImage }} style={detailStyles.image} resizeMode="cover" />
                        </TouchableOpacity>
                      </>
                    )}
                    {d.fileUrls?.length > 0 && (
                      <>
                        <View style={detailStyles.divider} />
                        <Text style={detailStyles.label}>الملفات المرفقة</Text>
                        {d.fileUrls.map((url: string, i: number) => (
                          <TouchableOpacity
                            key={i}
                            onPress={() => {
                              setSelectedCard(null);
                              setSelectedImageUrl(url);
                              setShowImageModal(true);
                            }}
                          >
                            <Image source={{ uri: url }} style={[detailStyles.image, { marginTop: 8 }]} resizeMode="cover" />
                          </TouchableOpacity>
                        ))}
                      </>
                    )}
                  </View>
                );
              })()}
          </ScrollView>

          <View style={styles.modalFooter}>
            {isClinicAccess && selectedCard?.type === "medical" && (
              <Button
                title="تعديل"
                onPress={() => {
                  const d = selectedCard.data;
                  setSelectedCard(null);
                  handleEditMedicalRecord(d);
                }}
                type="primary"
                size="medium"
                style={styles.modalButton}
              />
            )}
            {isClinicAccess && selectedCard?.type === "vaccination" && (
              <Button
                title="تعديل"
                onPress={() => {
                  const d = selectedCard.data;
                  setSelectedCard(null);
                  handleEditVaccination(d);
                }}
                type="primary"
                size="medium"
                style={styles.modalButton}
              />
            )}
            {isClinicAccess && selectedCard?.type === "reminder" && (
              <Button
                title="تعديل"
                onPress={() => {
                  const d = selectedCard.data;
                  setSelectedCard(null);
                  handleEditReminder(d);
                }}
                type="primary"
                size="medium"
                style={styles.modalButton}
              />
            )}
            <Button title="إغلاق" onPress={() => setSelectedCard(null)} type="outline" size="medium" style={styles.modalButton} />
          </View>
        </View>
      </Modal>

      {/* Lab Result Modal */}
      <Modal visible={showLabModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>إضافة نتيجة تحليل</Text>
            <TouchableOpacity onPress={() => setShowLabModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>نتائج التحليل *</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="أدخل نتائج التحاليل المخبرية"
              value={labForm.labNotes}
              onChangeText={(value) => setLabForm((prev) => ({ ...prev, labNotes: value }))}
              multiline
              numberOfLines={5}
            />
            <Text style={styles.modalSectionTitle}>ملاحظات إضافية</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="ملاحظات إضافية (اختياري)"
              value={labForm.notes}
              onChangeText={(value) => setLabForm((prev) => ({ ...prev, notes: value }))}
              multiline
              numberOfLines={3}
            />
          </ScrollView>
          <View style={styles.modalFooter}>
            <Button title="إلغاء" onPress={() => setShowLabModal(false)} type="outline" size="medium" style={styles.modalButton} />
            <Button title="حفظ" onPress={submitLabResult} type="primary" size="medium" style={styles.modalButton} />
          </View>
        </View>
      </Modal>

      {/* File Upload Modal */}
      <Modal visible={showFileModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>إضافة ملف</Text>
            <TouchableOpacity onPress={() => setShowFileModal(false)}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>وصف الملف (اختياري)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="وصف الملف أو الصورة"
              value={fileForm.description}
              onChangeText={(value) => setFileForm((prev) => ({ ...prev, description: value }))}
            />
            <Text style={styles.modalSectionTitle}>الصورة أو الملف *</Text>
            {fileForm.prescriptionImage ? (
              <View style={styles.prescriptionImageContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedImageUrl(fileForm.prescriptionImage);
                    setShowImageModal(true);
                  }}
                  activeOpacity={0.85}
                >
                  <RNImage source={{ uri: fileForm.prescriptionImage }} style={styles.prescriptionImageThumb} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.prescriptionImageRemove} onPress={() => setFileForm((prev) => ({ ...prev, prescriptionImage: "" }))}>
                  <X size={14} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : null}
            <View style={styles.prescriptionButtonsRow}>
              <TouchableOpacity
                style={[styles.prescriptionPickBtn, isFileImageUploading && { opacity: 0.6 }]}
                onPress={() => takeFileImage([4, 3])}
                disabled={isFileImageUploading}
              >
                {isFileImageUploading ? <ActivityIndicator size="small" color={COLORS.white} /> : <Camera size={18} color={COLORS.white} />}
                <Text style={styles.prescriptionPickBtnText}>التقاط صورة</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.prescriptionPickBtn, { backgroundColor: COLORS.darkGray }, isFileImageUploading && { opacity: 0.6 }]}
                onPress={() => pickFileImage([4, 3])}
                disabled={isFileImageUploading}
              >
                <ImageIcon size={18} color={COLORS.white} />
                <Text style={styles.prescriptionPickBtnText}>من المعرض</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <Button title="إلغاء" onPress={() => setShowFileModal(false)} type="outline" size="medium" style={styles.modalButton} />
            <Button title="حفظ" onPress={submitFile} type="primary" size="medium" style={styles.modalButton} />
          </View>
        </View>
      </Modal>

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
              بعد الموافقة على طلبك، ستتمكن من: • إضافة السجلات الطبية • إضافة التطعيمات • إضافة التذكيرات • إنشاء كروت العلاج • متابعة الحالة الصحية
            </Text>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button title="إلغاء" onPress={() => setShowFollowUpModal(false)} type="outline" size="medium" style={styles.modalButton} />
            <Button title="إرسال طلب الصلاحية" onPress={submitFollowUpRequest} type="primary" size="medium" style={styles.modalButton} />
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

            <Text style={styles.modalDescription}>سيتم إرسال طلب الصلاحية إلى مالك الحيوان. بعد الموافقة، ستتمكن من إضافة البيانات الطبية.</Text>

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
            <Button title="إلغاء" onPress={() => setShowAccessRequestModal(false)} type="outline" size="medium" style={styles.modalButton} />
            <Button title="إرسال طلب الصلاحية" onPress={submitAccessRequest} type="primary" size="medium" style={styles.modalButton} />
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
            <Button title="إلغاء" onPress={() => setShowTreatmentModal(false)} type="outline" size="medium" style={styles.modalButton} />
            <Button title="إرسال" onPress={submitTreatmentCard} type="primary" size="medium" style={styles.modalButton} />
          </View>
        </View>
      </Modal>

      {/* Medical Record Modal */}
      <Modal visible={showMedicalModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingMedicalRecord ? "تعديل السجل الطبي" : "إضافة سجل طبي"}</Text>
            <TouchableOpacity
              onPress={() => {
                setShowMedicalModal(false);
                setEditingMedicalRecord(null);
                setMedicalForm({ diagnosis: "", treatment: "", notes: "", prescriptionImage: "" });
              }}
            >
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

            {medicalForm.prescriptionImage ? (
              <View style={styles.prescriptionImageContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedImageUrl(medicalForm.prescriptionImage!);
                    setShowImageModal(true);
                  }}
                  activeOpacity={0.85}
                >
                  <RNImage source={{ uri: medicalForm.prescriptionImage }} style={styles.prescriptionImageThumb} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.prescriptionImageRemove} onPress={() => setMedicalForm((prev) => ({ ...prev, prescriptionImage: undefined }))}>
                  <X size={14} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.prescriptionButtonsRow}>
              <TouchableOpacity
                style={[styles.prescriptionPickBtn, isMedicalImageUploading && { opacity: 0.6 }]}
                onPress={() => takeAndUploadFromCamera([4, 3])}
                disabled={isMedicalImageUploading}
              >
                {isMedicalImageUploading ? <ActivityIndicator size="small" color={COLORS.white} /> : <Camera size={18} color={COLORS.white} />}
                <Text style={styles.prescriptionPickBtnText}>التقاط صورة</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.prescriptionPickBtn, { backgroundColor: COLORS.darkGray }, isMedicalImageUploading && { opacity: 0.6 }]}
                onPress={() => pickAndUploadImage([4, 3])}
                disabled={isMedicalImageUploading}
              >
                <ImageIcon size={18} color={COLORS.white} />
                <Text style={styles.prescriptionPickBtnText}>من المعرض</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="إلغاء"
              onPress={() => {
                setShowMedicalModal(false);
                setEditingMedicalRecord(null);
                setMedicalForm({ diagnosis: "", treatment: "", notes: "", prescriptionImage: "" });
              }}
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
            <Text style={styles.modalTitle}>{editingVaccination ? "تعديل التطعيم" : "إضافة تطعيم"}</Text>
            <TouchableOpacity
              onPress={() => {
                setShowVaccinationModal(false);
                setEditingVaccination(null);
                setVaccinationForm({ name: "", nextDate: "", notes: "" });
              }}
            >
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
              onPress={() => {
                setShowVaccinationModal(false);
                setEditingVaccination(null);
                setVaccinationForm({ name: "", nextDate: "", notes: "" });
              }}
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
            <Text style={styles.modalTitle}>{editingReminder ? "تعديل التذكير" : "إضافة تذكير"}</Text>
            <TouchableOpacity
              onPress={() => {
                setShowReminderModal(false);
                setEditingReminder(null);
                setReminderForm({ title: "", description: "", date: "" });
              }}
            >
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
              onPress={() => {
                setShowReminderModal(false);
                setEditingReminder(null);
                setReminderForm({ title: "", description: "", date: "" });
              }}
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
                <Text style={[styles.urgencyText, followUpForm.urgency === "low" && styles.urgencyTextSelected]}>منخفضة</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.urgencyOption, followUpForm.urgency === "normal" && styles.urgencyOptionSelected]}
                onPress={() => setFollowUpForm((prev) => ({ ...prev, urgency: "normal" }))}
              >
                <Text style={[styles.urgencyText, followUpForm.urgency === "normal" && styles.urgencyTextSelected]}>عادية</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.urgencyOption, followUpForm.urgency === "high" && styles.urgencyOptionSelected]}
                onPress={() => setFollowUpForm((prev) => ({ ...prev, urgency: "high" }))}
              >
                <Text style={[styles.urgencyText, followUpForm.urgency === "high" && styles.urgencyTextSelected]}>عالية</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button title="إلغاء" onPress={() => setShowFollowUpModal(false)} type="outline" size="medium" style={styles.modalButton} />
            <Button title="إرسال الطلب" onPress={submitFollowUpRequest} type="primary" size="medium" style={styles.modalButton} />
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
            <TouchableOpacity onPress={submitEditPet} disabled={updatePetMutation.isPending || updatePetOwnerMutation.isPending}>
              <Text style={styles.saveButton}>{updatePetMutation.isPending || updatePetOwnerMutation.isPending ? "جاري الحفظ..." : "حفظ"}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>صورة الحيوان</Text>
              <ImageUploader
                imageUri={editForm.image}
                onUploadComplete={(url) => setEditForm((prev) => ({ ...prev, image: url }))}
                aspect={[1, 1]}
                containerStyle={{ marginBottom: 8 }}
              />
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
                      {type === "dog" ? "كلب" : type === "cat" ? "قطة" : type === "rabbit" ? "أرنب" : type === "bird" ? "طائر" : "أخرى"}
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
                  <Text style={[styles.genderOptionText, editForm.gender === "male" && styles.selectedGenderOptionText]}>ذكر</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.genderOption, editForm.gender === "female" && styles.selectedGenderOption]}
                  onPress={() => setEditForm((prev) => ({ ...prev, gender: "female" }))}
                >
                  <Text style={[styles.genderOptionText, editForm.gender === "female" && styles.selectedGenderOptionText]}>أنثى</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>التعقيم</Text>
              <View style={styles.genderSelector}>
                <TouchableOpacity
                  style={[styles.genderOption, editForm.isNeutered === false && styles.selectedGenderOption]}
                  onPress={() => setEditForm((prev) => ({ ...prev, isNeutered: false }))}
                >
                  <Text style={[styles.genderOptionText, editForm.isNeutered === false && styles.selectedGenderOptionText]}>غير عقيم</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderOption, editForm.isNeutered === true && styles.selectedGenderOption]}
                  onPress={() => setEditForm((prev) => ({ ...prev, isNeutered: true }))}
                >
                  <Text style={[styles.genderOptionText, editForm.isNeutered === true && styles.selectedGenderOptionText]}>عقيم</Text>
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

      {/* Transfer Ownership Modal */}
      <Modal visible={showTransferModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowTransferModal(false);
                setTransferEmail("");
              }}
            >
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>نقل ملكية الحيوان</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.transferInfoBox}>
              <ArrowRightLeft size={32} color={COLORS.primary} />
              <Text style={styles.transferInfoTitle}>نقل ملكية "{pet?.name}"</Text>
              <Text style={styles.transferInfoText}>
                أدخل البريد الإلكتروني للشخص الذي تريد نقل ملكية الحيوان إليه. سيتلقى إشعاراً ويمكنه قبول أو رفض الطلب.
              </Text>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>البريد الإلكتروني للمالك الجديد *</Text>
              <TextInput
                style={styles.modalInput}
                value={transferEmail}
                onChangeText={setTransferEmail}
                placeholder="example@email.com"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Button
              title={initiateTransferMutation.isPending ? "جاري الإرسال..." : "إرسال طلب النقل"}
              onPress={handleTransferOwnership}
              type="primary"
              size="medium"
              disabled={initiateTransferMutation.isPending}
              style={{ marginTop: 8 }}
            />
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
    color: COLORS.darkGray,
  },
  heroIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.error,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBannerText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  petIdentityCard: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  petIdentityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  petAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  petIdentityInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 3,
  },
  editIcon: {
    padding: 4,
  },
  petType: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  heroChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  heroChip: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "#FAFBFC",
    flexDirection: "row",
    gap: 4,
  },
  heroChipLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
  },
  heroChipValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.black,
  },
  clinicInfoCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 14,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  petInfo: {},
  petNameRow: {},
  petDetailsRow: {},
  petDetailItem: {},
  petDetailLabel: {},
  petDetailValue: {},
  barcodeRow: {
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#FAFBFC",
    borderRadius: 10,
    marginTop: 8,
  },
  barcodeThumbnail: {
    width: 200,
    height: 70,
  },
  barcodeTapHint: {
    fontSize: 11,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  neuteredBadge: {
    marginTop: 4,
  },
  neuteredBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
  },
  tabsScrollWrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  content: {
    padding: 16,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 14,
    borderRightWidth: 3,
    borderRightColor: COLORS.primary,
    paddingRight: 10,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  lostBanner: {
    flexDirection: "row",
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
    flexDirection: "row",
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
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E8ECF0",
    borderStyle: "dashed",
    gap: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
  },
  recordCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  completedReminderCard: {
    opacity: 0.7,
  },
  recordHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    // marginBottom: 12,
  },
  recordTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  recordLabel: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: "500",
    minWidth: 80,
  },
  recordValue: {
    fontSize: 13,
    color: COLORS.black,
    flex: 1,
    textAlign: "left",
    lineHeight: 18,
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
    width: "100%",
  },
  ownerContactRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  ownerContactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  ownerContactIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  ownerContactLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  ownerContactValue: {
    fontSize: 13,
    color: COLORS.black,
    fontWeight: "600",
  },
  clinicStatsRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginTop: 12,
    padding: 14,
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  clinicStatItem: {
    alignItems: "center",
    flex: 1,
  },
  clinicStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  clinicStatLabel: {
    fontSize: 11,
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: "center",
  },
  clinicStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E0E0E0",
  },
  clinicTabsBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
    maxHeight: 72,
  },
  clinicTabsContent: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  clinicIconTab: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 3,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
  },
  clinicIconTabActive: {
    backgroundColor: COLORS.success + "20",
  },
  clinicIconTabText: {
    fontSize: 11,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  clinicIconTabTextActive: {
    color: COLORS.success,
    fontWeight: "700",
  },
  clinicActionButtons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  quickReviewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FF8C00",
    paddingVertical: 11,
    borderRadius: 10,
  },
  fullExamBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 10,
  },
  clinicActionBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "bold",
  },
  clinicChatRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 10,
  },
  chatOpenBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.success,
    paddingVertical: 11,
    borderRadius: 10,
  },
  chatToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  chatToggleBtnText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  recordTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  recordTypeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  chatActionsRow: {
    flexDirection: "row-reverse",
    marginTop: 10,
    gap: 12,
  },
  chatActionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.gray,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  chatActionText: {
    fontSize: 13,
    color: COLORS.black,
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
    flexDirection: "row-reverse",
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
    textAlign: "left",
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
  prescriptionImageContainer: {
    alignSelf: "center",
    marginBottom: 12,
    position: "relative",
  },
  prescriptionImageThumb: {
    width: 200,
    height: 140,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
  },
  prescriptionImageRemove: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12,
    padding: 4,
  },
  prescriptionButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  prescriptionPickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
  },
  prescriptionPickBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
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
    textAlign: "left",
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "left",
    backgroundColor: COLORS.white,
  },
  formRow: {
    flexDirection: "row-reverse",
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
    textAlign: "left",
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
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicNameRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 4,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
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
  transferInfoBox: {
    alignItems: "center",
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    gap: 10,
  },
  transferInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
  },
  transferInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 22,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
});

const detailStyles = StyleSheet.create({
  bigTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: "500",
    minWidth: 90,
  },
  value: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "400",
  },
  multilineValue: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 22,
    marginTop: 6,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: "#F1F5F9",
  },
});
