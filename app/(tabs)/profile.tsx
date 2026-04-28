import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, FlatList, Platform, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useRef } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import Button from "../../components/Button";
import UserAvatar from "../../components/UserAvatar";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Globe,
  LogOut,
  MessageSquare,
  Settings,
  Share2,
  X,
  Heart,
  ShoppingBag,
  Phone,
  Store,
  Edit3,
  Eye,
  EyeOff,
  Camera,
} from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
// import { Language } from "../../types";
import { Linking, Share } from "react-native";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "../../lib/trpc";
import { useLanguage, LANGUAGE_LABELS, Language } from "../../providers/LanguageProvider";

const languages = [
  { code: "ar" as Language, name: "العربية", flag: "🇸🇦" },
  // { code: "en" as Language, name: "English", flag: "🇬🇧" },
  // { code: "ku" as Language, name: "کوردی", flag: "🇮🇶" },
  // { code: "fr" as Language, name: "Français", flag: "🇫🇷" },
  // { code: "tr" as Language, name: "Türkçe", flag: "🇹🇷" },
  // { code: "de" as Language, name: "Deutsch", flag: "🇩🇪" },
  // { code: "fa" as Language, name: "فارسی", flag: "🇮🇷" },
];

export default function ProfileScreen() {
  const { t, isRTL, changeLanguage, language } = useI18n();
  const { user, pointsHistory, logout, hasAdminAccess, isSuperAdmin, updateUser } = useApp();
  const { selectedLanguage, getLanguageLabel } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPremiumSectionVisible, setIsPremiumSectionVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Update profile mutation
  const updateProfileMutation = useMutation(trpc.auth.updateProfile.mutationOptions());

  // Image upload hook
  const { pickAndUploadImage, isLoading: isUploadingImage } = useImageUpload({
    onUploadSuccess: async (url) => {
      // Update profile with new avatar
      updateProfileMutation.mutate(
        { avatar: url },
        {
          onSuccess: async (response) => {
            Alert.alert(t("common.success"), t("profile.photoUpdateSuccess"));
            // Update local user data
            if (response.user) {
              await updateUser({ avatar: response.user.avatar });
            }
          },
          onError: (error) => {
            Alert.alert(t("common.error"), error.message || t("profile.photoUpdateFailed"));
          },
        },
      );
    },
    onUploadError: (error) => {
      Alert.alert(t("common.error"), `${t("profile.photoUploadFailed").replace("{error}", String(error))}`);
    },
  });

  // Scroll to top when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      // Load premium section visibility from storage
      loadPremiumSectionVisibility();
    }, []),
  );

  const loadPremiumSectionVisibility = async () => {
    try {
      const visibility = await AsyncStorage.getItem("premiumSectionVisible");
      if (visibility !== null) {
        setIsPremiumSectionVisible(JSON.parse(visibility));
      } else {
        // Default to hidden if no value is stored
        setIsPremiumSectionVisible(false);
      }
    } catch (error) {
      console.error("Error loading premium section visibility:", error);
      setIsPremiumSectionVisible(false);
    }
  };

  const togglePremiumSectionVisibility = async () => {
    const newVisibility = !isPremiumSectionVisible;
    setIsPremiumSectionVisible(newVisibility);
    try {
      await AsyncStorage.setItem("premiumSectionVisible", JSON.stringify(newVisibility));
      console.log("Premium section visibility updated:", newVisibility);
    } catch (error) {
      console.error("Error saving premium section visibility:", error);
    }
  };

  const handleEditPremiumSection = () => {
    console.log("Edit premium section");
    // TODO: Navigate to premium section edit page
    router.push("/premium-subscription");
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleShareApp = async () => {
    try {
      const appUrl = "https://petcare.app"; // Replace with your actual app URL
      const message = `${t("profile.shareAppMessage")} ${appUrl}`;

      if (Platform.OS === "web") {
        // For web, use Web Share API if available, otherwise copy to clipboard
        if (navigator.share) {
          await navigator.share({
            title: t("profile.shareAppTitle"),
            text: message,
            url: appUrl,
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(message);
          Alert.alert(t("common.success"), t("profile.linkCopied"));
        }
      } else {
        // For mobile, use React Native Share API
        const result = await Share.share({
          message: message,
          url: appUrl,
          title: t("profile.shareAppTitle"),
        });

        if (result.action === Share.sharedAction) {
          console.log("App shared successfully");
        }
      }
    } catch (error) {
      console.error("Error sharing app:", error);
      Alert.alert(t("common.error"), t("profile.shareError"));
    }
  };

  // const handleEmailPress = (email: string) => {
  //   Linking.openURL(`mailto:${email}`);
  // };

  // const handlePhonePress = (phone: string) => {
  //   Linking.openURL(`tel:${phone}`);
  // };

  // const handleWhatsAppPress = (phone: string) => {
  //   Linking.openURL(`whatsapp://send?phone=${phone}`);
  // };

  const handleLanguageSelect = (lang: Language) => {
    // changeLanguage(lang);
    // setShowLanguageModal(false);
  };

  const handleImagePicker = () => {
    pickAndUploadImage([1, 1]);
  };

  // const handleSubscribeToPremium = () => {
  //   console.log("Subscribe to premium");
  //   // TODO: Navigate to premium subscription page
  // };

  // Get current language label from context
  const currentLanguageLabel = getLanguageLabel(selectedLanguage);

  const renderLanguageItem = ({ item }: { item: (typeof languages)[0] }) => (
    <TouchableOpacity style={[styles.languageItem, language === item.code && styles.selectedLanguageItem]} onPress={() => handleLanguageSelect(item.code)}>
      <Text style={styles.languageFlag}>{item.flag}</Text>
      <Text style={[styles.languageName, language === item.code && styles.selectedLanguageName]}>{item.name}</Text>
      {language === item.code && <View style={styles.selectedIndicator} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView ref={scrollViewRef} style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle}>{t("profile.title")}</Text>
        </View>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <UserAvatar uri={user?.avatar} gender={user?.gender} size={80} />
              <TouchableOpacity style={styles.editAvatarButton} onPress={handleImagePicker} disabled={isUploadingImage}>
                <Camera size={16} color={COLORS.white} />
              </TouchableOpacity>
              {isUploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <Text style={styles.uploadingText}>{t("common.uploading")}</Text>
                </View>
              )}
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <Text style={styles.userId}>
                {t("profile.userId")}
                {user?.id || "1001"}
              </Text>
            </View>
          </View>

          {isSuperAdmin ? (
            <View style={styles.pointsCard}>
              <View style={styles.pointsHeader}>
                <Text style={styles.pointsTitle}>{t("profile.points")}</Text>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/points-exchange");
                  }}
                >
                  <Text style={styles.pointsHistory}>{t("profile.redeemPoints")}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.pointsValue}>{user?.points}</Text>
              <Button title={t("common.seeAll")} onPress={() => router.push("/points-history")} type="outline" size="small" style={styles.pointsButton} />
            </View>
          ) : null}

          {/* {isSuperAdmin && (
            <View style={styles.premiumCard}>
              {(hasAdminAccess || isSuperAdmin) && (
                <View style={styles.adminControls}>
                  <TouchableOpacity style={styles.adminControlButton} onPress={handleEditPremiumSection}>
                    <Edit3 size={16} color={COLORS.primary} />
                    <Text style={styles.adminControlText}>تعديل</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adminControlButton} onPress={togglePremiumSectionVisibility}>
                    <EyeOff size={16} color={COLORS.error} />
                    <Text style={[styles.adminControlText, { color: COLORS.error }]}>إخفاء</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.premiumContent}>
                <Award size={24} color={COLORS.primary} />
                <View style={styles.premiumTextContainer}>
                  <Text style={styles.premiumTitle}>{t("premium.title")}</Text>
                  <Text style={styles.premiumDescription}>
                    {t("premium.storeDiscounts")} • {t("premium.clinicDiscounts")}
                  </Text>
                </View>
              </View>
              <Button
                title={t("profile.subscribeToPremium")}
                onPress={() => router.push("/premium-subscription")}
                type="primary"
                size="small"
                style={styles.premiumButton}
              />
            </View>
          )} */}

          {/* Admin control to show hidden premium section */}
          {isSuperAdmin && (
            <View style={styles.hiddenSectionIndicator}>
              <View style={styles.hiddenSectionContent}>
                <EyeOff size={20} color={COLORS.darkGray} />
                <Text style={styles.hiddenSectionText}>{t("profile.premiumHidden")}</Text>
              </View>
              <View style={styles.adminControls}>
                <TouchableOpacity style={styles.adminControlButton} onPress={handleEditPremiumSection}>
                  <Edit3 size={16} color={COLORS.primary} />
                  <Text style={styles.adminControlText}>{t("common.edit")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.adminControlButton} onPress={togglePremiumSectionVisibility}>
                  <Eye size={16} color={COLORS.primary} />
                  <Text style={styles.adminControlText}>{t("common.show")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/favorites")}>
              <View style={styles.menuItemLeft}>
                <Heart size={20} color={COLORS.darkGray} />
                <Text style={styles.menuItemText}>{t("profile.favorites")}</Text>
              </View>
              <View style={{ width: 20, height: 20 }}>
                {isRTL ? <ChevronLeft size={20} color={COLORS.darkGray} /> : <ChevronRight size={20} color={COLORS.darkGray} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/orders")}>
              <View style={styles.menuItemLeft}>
                <ShoppingBag size={20} color={COLORS.darkGray} />
                <Text style={styles.menuItemText}>{t("profile.myOrders")}</Text>
              </View>
              <View style={{ width: 20, height: 20 }}>
                {isRTL ? <ChevronLeft size={20} color={COLORS.darkGray} /> : <ChevronRight size={20} color={COLORS.darkGray} />}
              </View>
            </TouchableOpacity>

            {/* Show store management for veterinarians */}
            {user?.userType === "veterinarians" && (
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/add-store")}>
                <View style={styles.menuItemLeft}>
                  <Store size={20} color={COLORS.darkGray} />
                  <Text style={styles.menuItemText}>{t("profile.addOffice")}</Text>
                </View>
                <View style={{ width: 20, height: 20 }}>
                  {isRTL ? <ChevronLeft size={20} color={COLORS.darkGray} /> : <ChevronRight size={20} color={COLORS.darkGray} />}
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/settings")}>
              <View style={styles.menuItemLeft}>
                <Settings size={20} color={COLORS.darkGray} />
                <Text style={styles.menuItemText}>{t("profile.settings")}</Text>
              </View>
              <View style={{ width: 20, height: 20 }}>
                {isRTL ? <ChevronLeft size={20} color={COLORS.darkGray} /> : <ChevronRight size={20} color={COLORS.darkGray} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.navigate("/language")}>
              <View style={styles.menuItemLeft}>
                <Globe size={20} color={COLORS.darkGray} />
                <Text style={styles.menuItemText}>{t("profile.language")}</Text>
              </View>
              <View style={styles.languagePreview}>
                <Text style={styles.menuItemValue}>{currentLanguageLabel}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/notifications")}>
              <View style={styles.menuItemLeft}>
                <MessageSquare size={20} color={COLORS.darkGray} />
                <Text style={styles.menuItemText}>{t("profile.notifications")}</Text>
              </View>
              <View style={{ width: 20, height: 20 }}>
                {isRTL ? <ChevronLeft size={20} color={COLORS.darkGray} /> : <ChevronRight size={20} color={COLORS.darkGray} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleShareApp}>
              <View style={styles.menuItemLeft}>
                <Share2 size={20} color={COLORS.darkGray} />
                <Text style={styles.menuItemText}>{t("profile.shareApp")}</Text>
              </View>
              <View style={{ width: 20, height: 20 }}>
                {isRTL ? <ChevronLeft size={20} color={COLORS.darkGray} /> : <ChevronRight size={20} color={COLORS.darkGray} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/contact-us")}>
              <View style={styles.menuItemLeft}>
                <Phone size={20} color={COLORS.darkGray} />
                <Text style={styles.menuItemText}>{t("profile.contactUs")}</Text>
              </View>
              <View style={{ width: 20, height: 20 }}>
                {isRTL ? <ChevronLeft size={20} color={COLORS.darkGray} /> : <ChevronRight size={20} color={COLORS.darkGray} />}
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]} onPress={handleLogout} disabled={isLoggingOut}>
            <LogOut size={20} color={isLoggingOut ? COLORS.darkGray : COLORS.error} />
            <Text style={[styles.logoutText, isLoggingOut && styles.logoutTextDisabled]}>{isLoggingOut ? "جاري تسجيل الخروج..." : t("profile.logout")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showLanguageModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowLanguageModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t("profile.language")}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowLanguageModal(false)}>
              <X size={24} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>

          <FlatList data={languages} renderItem={renderLanguageItem} keyExtractor={(item) => item.code} style={styles.languageList} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
    paddingBottom: 90,
  },
  titleContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
  },
  header: {
    padding: 16,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  nameContainer: {
    marginRight: 16,
    alignItems: "flex-end",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  userId: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  pointsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  pointsHistory: {
    fontSize: 14,
    color: COLORS.primary,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
  },
  pointsButton: {
    alignSelf: "flex-end",
  },
  premiumCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  premiumTextContainer: {
    marginRight: 16,
    flex: 1,
    alignItems: "flex-end",
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  premiumButton: {
    width: "100%",
  },
  menuSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuItemLeft: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.black,
    marginRight: 16,
  },
  menuItemValue: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  languagePreview: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  languageFlag: {
    fontSize: 18,
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    color: COLORS.error,
    marginRight: 8,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: "row",
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
  closeButton: {
    padding: 4,
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedLanguageItem: {
    backgroundColor: COLORS.gray,
  },
  languageName: {
    fontSize: 16,
    color: COLORS.black,
    marginRight: 12,
    flex: 1,
    textAlign: "right",
  },
  selectedLanguageName: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutTextDisabled: {
    color: COLORS.darkGray,
  },
  adminControls: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  adminControlButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gray,
  },
  adminControlText: {
    fontSize: 12,
    color: COLORS.primary,
    marginRight: 4,
    fontWeight: "600",
  },
  hiddenSectionIndicator: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
    borderStyle: "dashed",
  },
  hiddenSectionContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  hiddenSectionText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginRight: 8,
    fontStyle: "italic",
  },
});
