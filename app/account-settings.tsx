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
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import { COLORS } from "../constants/colors";
import { Stack, router } from "expo-router";
import { ArrowLeft, User, Mail, Phone, Lock, Trash2, Edit3, Save } from "lucide-react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useApp } from "../providers/AppProvider";

export default function AccountSettingsScreen() {
  const { user } = useApp();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);

  // Fetch user profile data
  const { data, isLoading: isProfileLoading, error: profileError } = useQuery(trpc.auth.getProfile.queryOptions({}));

  const profileData = useMemo(() => (data as any)?.user, [data]);

  console.log("profile data------------", profileData);

  // Update profile mutation
  const updateProfileMutation = useMutation(trpc.auth.updateProfile.mutationOptions());

  // TODO: Implement these mutations when backend procedures are ready
  // const changePasswordMutation = trpc.auth.changePassword.useMutation();
  // const deleteAccountMutation = trpc.auth.deleteAccount.useMutation();

  useEffect(() => {
    if (profileData) {
      setName(profileData?.name || "");
      setEmail(profileData?.email || "");
      setPhone(profileData?.phone || "");
    }
  }, [profileData]);

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("خطأ", "يرجى ملء حقول الاسم والبريد الإلكتروني");
      return;
    }

    updateProfileMutation.mutate(
      { name, email, phone },
      {
        onSuccess: () => {
          Alert.alert("تم الحفظ", "تم تحديث معلوماتك بنجاح");
          setIsEditing(false);
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "فشل تحديث المعلومات");
        },
      }
    );
  };

  const handleChangePassword = () => {
    // TODO: Replace with a modal to get current and new password
    Alert.alert(
      "تغيير كلمة المرور",
      "هذه الميزة قيد التطوير."
      // `سيتم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني`,
      // [
      //   { text: 'إلغاء', style: 'cancel' },
      //   { text: 'إرسال', onPress: () => Alert.alert('تم الإرسال', 'تم إرسال الرابط إلى بريدك الإلكتروني') }
      // ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert("حذف الحساب", "هل أنت متأكد من رغبتك في حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          // deleteAccountMutation.mutate(undefined, {
          //   onSuccess: () => {
          //     Alert.alert('تم الحذف', 'تم حذف حسابك بنجاح');
          //     // Log user out and navigate to auth screen
          //   },
          //   onError: (error) => {
          //     Alert.alert('خطأ', error.message || 'فشل حذف الحساب');
          //   }
          // })
          Alert.alert("قيد التطوير", "هذه الميزة لم تنفذ بعد في الخلفية.");
        },
      },
    ]);
  };

  if (isProfileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>جاري تحميل معلومات الحساب...</Text>
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
          title: "إعدادات الحساب",
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
          <User size={40} color={COLORS.white} />
          <Text style={styles.headerText}>إدارة معلومات حسابك الشخصي</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>

          <View style={styles.infoCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>الاسم الكامل</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={name}
                  onChangeText={setName}
                  editable={isEditing}
                  placeholder="أدخل اسمك الكامل"
                  placeholderTextColor={COLORS.darkGray}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={email}
                  onChangeText={setEmail}
                  editable={isEditing}
                  placeholder="أدخل بريدك الإلكتروني"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>رقم الهاتف</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={phone}
                  onChangeText={setPhone}
                  editable={isEditing}
                  placeholder="أدخل رقم هاتفك"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات الإشعارات</Text>

          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>الإشعارات العامة</Text>
                <Text style={styles.settingDescription}>تلقي إشعارات حول التحديثات والأخبار</Text>
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
                <Text style={styles.settingTitle}>إشعارات البريد الإلكتروني</Text>
                <Text style={styles.settingDescription}>تلقي رسائل بريد إلكتروني دورية</Text>
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
          <Text style={styles.sectionTitle}>الأمان</Text>

          <View style={styles.actionCard}>
            <TouchableOpacity style={styles.actionItem} onPress={handleChangePassword}>
              <View style={styles.actionContent}>
                <Lock size={24} color={COLORS.primary} />
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>تغيير كلمة المرور</Text>
                  <Text style={styles.actionDescription}>تحديث كلمة مرور حسابك</Text>
                </View>
              </View>
              <ArrowLeft size={20} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>المنطقة الخطرة</Text>

          <View style={styles.dangerCard}>
            <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
              <View style={styles.dangerContent}>
                <Trash2 size={24} color={COLORS.error} />
                <View style={styles.dangerInfo}>
                  <Text style={styles.dangerActionTitle}>حذف الحساب</Text>
                  <Text style={styles.dangerDescription}>حذف حسابك وجميع بياناتك نهائياً</Text>
                </View>
              </View>
              <ArrowLeft size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    textAlign: "right",
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
    textAlign: "right",
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
    textAlign: "right",
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
    textAlign: "right",
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
});
