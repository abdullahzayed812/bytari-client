import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useMemo, useState } from "react";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Briefcase, MessageCircle, Send, X } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApp } from "@/providers/AppProvider";
import { useI18n } from "@/providers/I18nProvider";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  joinDate: string;
  avatar?: string;
  profession?: string;
  experience?: string;
  education?: string;
  bio?: string;
  userType?: string;
  isActive?: boolean;
}

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const { user } = useApp();
  const { t } = useI18n();
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [messageSubject, setMessageSubject] = useState<string>("");
  const [messageContent, setMessageContent] = useState<string>("");

  console.log(params);

  // Determine which query to use
  const isAdminView = !!params.userId;
  const ownProfileQuery = useQuery(trpc.auth.getProfile.queryOptions({ enabled: !isAdminView }));
  const userProfileQuery = useQuery(
    trpc.admin.users.getProfile.queryOptions(
      { userId: +params.userId!, adminId: Number(user?.id) },
      { enabled: isAdminView }
    )
  );

  const { data, isLoading, error } = isAdminView ? userProfileQuery : ownProfileQuery;
  const userData = useMemo(() => data as any, [data]);

  const sendMessageMutation = useMutation(trpc.admin.messages.sendSystemMessage.mutationOptions());

  const userProfile: UserProfile | null = userData
    ? {
        id: userData?.id?.toString(),
        name: userData.name || "N/A",
        email: userData.email || "N/A",
        phone: userData.phone || null,
        location: userData.province || t("common.unknown"),
        joinDate: new Date(userData.createdAt).toLocaleDateString("ar-SA"),
        profession: userData.userType === "vet" ? t("auth.vetDoctor") : userData.userType === "admin" ? t("userProfile.supervisor") : t("userProfile.regularUser"),
        experience: userData.experience || t("common.unknown"),
        education: userData.education || t("common.unknown"),
        bio: userData.bio || t("userProfile.noBio"),
        userType: userData.userType,
        isActive: userData.isActive,
        avatar: userData.avatar,
      }
    : null;

  const { data: petsData, isLoading: petsLoading } = useQuery(
    trpc.pets.getUserPets.queryOptions({ userId: userProfile?.id! }, { enabled: !isAdminView && !!userProfile?.id })
  );

  const handleSendMessage = () => {
    setShowMessageModal(true);
  };

  const handleSendMessageSubmit = async () => {
    if (!messageSubject.trim() || !messageContent.trim() || !userProfile) {
      Alert.alert(t("common.error"), t("userProfile.fillAllFields"));
      return;
    }

    sendMessageMutation.mutate(
      {
        senderId: Number(user?.id),
        title: messageSubject,
        content: messageContent,
        type: "announcement",
        targetAudience: "specific",
        targetUserIds: [Number(userProfile.id)],
      },
      {
        onSuccess: () => {
          Alert.alert(t("userProfile.messageSent"), t("userProfile.messageSentSuccess"));
          setShowMessageModal(false);
          setMessageSubject("");
          setMessageContent("");
        },
        onError: (err) => {
          Alert.alert(t("common.error"), err.message || t("messages.sendError"));
        },
      }
    );
  };

  const handleCloseModal = () => {
    setShowMessageModal(false);
    setMessageSubject("");
    setMessageContent("");
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.errorText}>{t("userProfile.loadingProfile")}</Text>
      </View>
    );
  }

  if (error || !userProfile) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: t("profile.title"),
            headerStyle: { backgroundColor: COLORS.white },
            headerTintColor: COLORS.black,
            headerTitleStyle: { fontWeight: "bold" },
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={COLORS.black} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error?.message || t("userProfile.profileNotFound")}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("profile.title"),
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {(userProfile as any).avatar ? (
              <Image source={{ uri: (userProfile as any).avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{userProfile.name.charAt(0)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.userName}>{userProfile.name}</Text>

          {userProfile.profession && (
            <View style={styles.professionContainer}>
              <Briefcase size={16} color={COLORS.primary} />
              <Text style={styles.professionText}>{userProfile.profession}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.messageButton} onPress={handleSendMessage}>
            <MessageCircle size={20} color={COLORS.white} />
            <Text style={styles.messageButtonText}>{t("userProfile.sendMessage")}</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{t("userProfile.basicInfo")}</Text>

          <View style={styles.infoItem}>
            <Mail size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("common.email")}</Text>
              <Text style={styles.infoValue}>{userProfile.email}</Text>
            </View>
          </View>

          {userProfile.phone && (
            <View style={styles.infoItem}>
              <Phone size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t("common.phone")}</Text>
                <Text style={styles.infoValue}>{userProfile.phone}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoItem}>
            <MapPin size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("common.location")}</Text>
              <Text style={styles.infoValue}>{userProfile.location}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Calendar size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("userProfile.joinDate")}</Text>
              <Text style={styles.infoValue}>{userProfile.joinDate}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View
              style={[styles.statusBadge, { backgroundColor: (userProfile as any).isActive ? "#4CAF50" : "#F44336" }]}
            >
              <Text style={styles.statusText}>{(userProfile as any).isActive ? t("common.active") : t("userProfile.disabled")}</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("userProfile.accountStatus")}</Text>
              <Text style={styles.infoValue}>ID: {userProfile.id}</Text>
            </View>
          </View>
        </View>

        {/* Professional Information */}
        {(userProfile.experience || userProfile.education) && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>{t("userProfile.professionalInfo")}</Text>

            {userProfile.experience && (
              <View style={styles.infoItem}>
                <Briefcase size={20} color={COLORS.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t("userProfile.yearsOfExperience")}</Text>
                  <Text style={styles.infoValue}>{userProfile.experience}</Text>
                </View>
              </View>
            )}

            {userProfile.education && (
              <View style={styles.infoItem}>
                <View style={styles.educationIcon}>
                  <Text style={styles.educationIconText}>🎓</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t("userProfile.education")}</Text>
                  <Text style={styles.infoValue}>{userProfile.education}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Bio */}
        {userProfile.bio && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>{t("userProfile.bio")}</Text>
            <Text style={styles.bioText}>{userProfile.bio}</Text>
          </View>
        )}

        {/* Pets Section */}
        {!isAdminView && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>{t("userProfile.pets")}</Text>
            {petsLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : petsData && petsData.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {petsData.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={styles.petCard}
                    onPress={() => router.push(`/pet-details?petId=${pet.id}`)}
                  >
                    <Image source={{ uri: pet.image || undefined }} style={styles.petImage} />
                    <Text style={styles.petName}>{pet.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text>{t("userProfile.noPets")}</Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSendMessage}>
            <MessageCircle size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>{t("userProfile.sendMessage")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.callButton]}>
            <Phone size={20} color="#4CAF50" />
            <Text style={[styles.actionButtonText, { color: "#4CAF50" }]}>{t("common.call")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.emailButton]}>
            <Mail size={20} color="#FF9800" />
            <Text style={[styles.actionButtonText, { color: "#FF9800" }]}>{t("common.email")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Message Modal */}
      <Modal
        visible={showMessageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t("userProfile.sendMessage")}</Text>
            <TouchableOpacity
              onPress={handleSendMessageSubmit}
              style={[styles.sendButton && styles.sendButtonDisabled]}
              // disabled={isSending}
            >
              <Send size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.recipientInfo}>
              <View style={styles.recipientAvatar}>
                {(userProfile as any)?.avatar ? (
                  <Image source={{ uri: (userProfile as any).avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{userProfile?.name.charAt(0)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.recipientDetails}>
                <Text style={styles.recipientName}>{t("common.to")}: {userProfile?.name}</Text>
                <Text style={styles.recipientProfession}>{userProfile?.profession}</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("userProfile.messageSubject")} *</Text>
              <TextInput
                style={styles.subjectInput}
                value={messageSubject}
                onChangeText={setMessageSubject}
                placeholder={t("userProfile.messageSubjectPlaceholder")}
                placeholderTextColor={COLORS.lightGray}
                textAlign="right"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("userProfile.messageContent")} *</Text>
              <TextInput
                style={styles.messageInput}
                value={messageContent}
                onChangeText={setMessageContent}
                placeholder={t("userProfile.messageContentPlaceholder")}
                placeholderTextColor={COLORS.lightGray}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                textAlign="right"
              />
            </View>

            <View style={styles.messageInfo}>
              <Text style={styles.messageInfoText}>{t("userProfile.messageTip")}</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  profileHeader: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "center",
  },
  professionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
  },
  professionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.black,
  },
  educationIcon: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  educationIconText: {
    fontSize: 16,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.black,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    backgroundColor: COLORS.white,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  recipientInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  recipientAvatar: {
    width: 50,
    height: 50,
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  recipientProfession: {
    fontSize: 14,
    color: COLORS.primary,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  subjectInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    minHeight: 120,
  },
  messageInfo: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  messageInfoText: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: "left",
    lineHeight: 20,
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "bold",
  },
  actionButtonsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  callButton: {
    borderColor: "#4CAF50",
  },
  emailButton: {
    borderColor: "#FF9800",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  petCard: {
    marginRight: 10,
    alignItems: "center",
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
  },
  petName: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
});
