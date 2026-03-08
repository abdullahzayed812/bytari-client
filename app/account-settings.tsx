import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import { COLORS } from "../constants/colors";
import { Stack, router } from "expo-router";
import { ArrowLeft, User, Mail, Phone, Lock, Trash2, Edit3, Save, X } from "lucide-react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useApp } from "../providers/AppProvider";
import { ImageUploader } from "../components/ImageUploader";
import { useI18n } from "../providers/I18nProvider";

export default function AccountSettingsScreen() {
  const { t } = useI18n();
  const { user, logout } = useApp();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Fetch user profile data
  const { data, isLoading: isProfileLoading, error: profileError } = useQuery(trpc.auth.getProfile.queryOptions({}));

  const profileData = useMemo(() => (data as any)?.user, [data]);

  console.log("profile data------------", data);

  // Update profile mutation
  const updateProfileMutation = useMutation(trpc.auth.updateProfile.mutationOptions());
  const changePasswordMutation = useMutation(trpc.auth.changePassword.mutationOptions());
  const deleteAccountMutation = useMutation(trpc.auth.deleteAccount.mutationOptions());

  useEffect(() => {
    if (profileData) {
      setName(profileData?.name || "");
      setEmail(profileData?.email || "");
      setPhone(profileData?.phone || "");
      setAvatar(profileData?.avatar || "");
    }
  }, [profileData]);

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert(t("common.error"), t("accountSettings.fillNameEmail"));
      return;
    }

    updateProfileMutation.mutate(
      { name, phone, avatar },
      {
        onSuccess: () => {
          Alert.alert(t("common.success"), t("accountSettings.saveSuccess"));
          setIsEditing(false);
        },
        onError: (error) => {
          Alert.alert(t("common.error"), error.message || t("accountSettings.updateFailed"));
        },
      }
    );
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const submitChangePassword = () => {
    if (!currentPassword || !newPassword) {
      Alert.alert(t("common.error"), t("common.required"));
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(t("common.error"), t("accountSettings.passwordMinLength"));
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          Alert.alert(t("common.success"), t("accountSettings.passwordChanged"));
          setShowPasswordModal(false);
          setCurrentPassword("");
          setNewPassword("");
        },
        onError: (error) => {
          Alert.alert(t("common.error"), error.message || t("accountSettings.passwordChangeFailed"));
        },
      }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(t("accountSettings.deleteAccount"), t("accountSettings.deleteConfirmMsg"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          deleteAccountMutation.mutate(undefined, {
            onSuccess: () => {
              Alert.alert(t("common.success"), t("accountSettings.deletedMsg"));
              logout();
              router.replace("/(auth)/login");
            },
            onError: (error) => {
              Alert.alert(t("common.error"), error.message || t("accountSettings.deleteFailed"));
            },
          });
        },
      },
    ]);
  };

  if (isProfileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>{t("accountSettings.loading")}</Text>
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "red" }}>{profileError.message}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t("screens.accountSettings"),
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black, fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
              style={styles.editButton}
              disabled={updateProfileMutation.isPending}
            >
              {isEditing ? (
                updateProfileMutation.isPending ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <Save size={24} color={COLORS.primary} />
                )
              ) : (
                <Edit3 size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          {isEditing ? (
            <ImageUploader
              imageUri={avatar}
              onUploadComplete={setAvatar}
              imageStyle={{ width: 80, height: 80, borderRadius: 40 }}
              containerStyle={{ marginBottom: 0 }}
            />
          ) : avatar ? (
            <Image source={{ uri: avatar }} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 12 }} />
          ) : (
            <User size={40} color={COLORS.white} />
          )}
          <Text style={styles.headerText}>{t("accountSettings.manageInfo")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("accountSettings.personalInfo")}</Text>

          <View style={styles.infoCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("accountSettings.fullName")}</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={name}
                  onChangeText={setName}
                  editable={isEditing}
                  placeholder={t("accountSettings.enterFullName")}
                  placeholderTextColor={COLORS.darkGray}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("common.email")}</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={email}
                  onChangeText={setEmail}
                  editable={isEditing}
                  placeholder={t("auth.emailLabel")}
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("common.phone")}</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={phone}
                  onChangeText={setPhone}
                  editable={isEditing}
                  placeholder={t("accountSettings.enterPhone")}
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("accountSettings.notifSettings")}</Text>

          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t("accountSettings.generalNotif")}</Text>
                <Text style={styles.settingDescription}>{t("accountSettings.generalNotifDesc")}</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={notifications ? COLORS.white : COLORS.darkGray}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t("accountSettings.emailNotif")}</Text>
                <Text style={styles.settingDescription}>{t("accountSettings.emailNotifDesc")}</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={emailNotifications ? COLORS.white : COLORS.darkGray}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("accountSettings.security")}</Text>

          <View style={styles.actionCard}>
            <TouchableOpacity style={styles.actionItem} onPress={handleChangePassword}>
              <View style={styles.actionContent}>
                <Lock size={24} color={COLORS.primary} />
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>{t("accountSettings.changePassword")}</Text>
                  <Text style={styles.actionDescription}>{t("accountSettings.changePasswordDesc")}</Text>
                </View>
              </View>
              <ArrowLeft size={20} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>{t("accountSettings.dangerZone")}</Text>

          <View style={styles.dangerCard}>
            <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
              <View style={styles.dangerContent}>
                <Trash2 size={24} color={COLORS.error} />
                <View style={styles.dangerInfo}>
                  <Text style={styles.dangerActionTitle}>{t("accountSettings.deleteAccount")}</Text>
                  <Text style={styles.dangerDescription}>{t("accountSettings.deleteAccountDesc")}</Text>
                </View>
              </View>
              <ArrowLeft size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("accountSettings.changePassword")}</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <X size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t("accountSettings.currentPassword")}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  textAlign="right"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t("accountSettings.newPassword")}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  textAlign="right"
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={submitChangePassword}
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.saveButtonText}>{t("accountSettings.saveChanges")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  headerText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
    marginTop: 12,
  },
  section: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "left",
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  inputWrapper: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "left",
  },
  disabledInput: {
    color: COLORS.darkGray,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingInfo: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  actionContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
  },
  actionInfo: {
    marginRight: 16,
    alignItems: "flex-end",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  dangerSection: {
    margin: 16,
    marginBottom: 32,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.error,
    marginBottom: 12,
    textAlign: "left",
  },
  dangerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  dangerContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
  },
  dangerInfo: {
    marginRight: 16,
    alignItems: "flex-end",
  },
  dangerActionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.error,
    marginBottom: 4,
  },
  dangerDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  modalContent: {
    width: "100%",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "left",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
