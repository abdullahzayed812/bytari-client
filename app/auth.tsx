import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions, Alert } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { COUNTRIES, CITIES, DEFAULT_COUNTRY } from "../constants/currency";
import Button from "../components/Button";
import { useRouter } from "expo-router";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, Upload, FileText, User, Stethoscope, Globe, MessageCircle } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { API_URL, trpc } from "../lib/trpc";
import { useMutation } from "@tanstack/react-query";

const { height } = Dimensions.get("window");

const countries = COUNTRIES;

const provinces = CITIES;

// Will be updated with translations in the component

export default function AuthScreen() {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const { login } = useApp();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedLocationCountry, setSelectedLocationCountry] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [showLocationCountryPicker, setShowLocationCountryPicker] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [accountType, setAccountType] = useState<"pet_owner" | "veterinarian">("pet_owner");
  const [veterinarianType, setVeterinarianType] = useState<"student" | "veterinarian">("student");

  const [idFrontImage, setIdFrontImage] = useState<any>(null);
  const [idBackImage, setIdBackImage] = useState<any>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Translated genders based on current language
  const genders = [
    { value: "male", label: t("auth.male") },
    { value: "female", label: t("auth.female") },
  ];

  const loginMutation = useMutation(trpc.auth.login.mutationOptions());
  const registerMutation = useMutation(trpc.auth.register.mutationOptions());
  const vetApplicationMutation = useMutation(trpc.admin.veterinarianApprovals.submitApplication.mutationOptions());
  // const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation(); // Uncomment when backend procedure is created

  const isLoading = loginMutation.isPending || registerMutation.isPending || vetApplicationMutation.isPending;

  const validateLogin = () => {
    const newErrors: { [key: string]: string } = {};

    if (!usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = t("validation.usernameEmailRequired");
    }

    if (!password.trim()) {
      newErrors.password = t("validation.passwordRequired");
    } else if (password.length < 6) {
      newErrors.password = t("validation.passwordTooShort");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = t("validation.nameRequired");
    }

    if (!usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = t("validation.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(usernameOrEmail)) {
      newErrors.usernameOrEmail = t("validation.emailInvalid");
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = t("validation.phoneRequired");
    }

    if (!password.trim()) {
      newErrors.password = t("validation.passwordRequired");
    } else if (password.length < 6) {
      newErrors.password = t("validation.passwordTooShort");
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t("validation.confirmPasswordRequired");
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t("validation.passwordsNotMatch");
    }

    if (!selectedLocationCountry) {
      newErrors.country = t("validation.countryRequired");
    }

    if (!selectedProvince) {
      newErrors.province = t("validation.provinceRequired");
    }

    if (!selectedGender) {
      newErrors.gender = t("validation.genderRequired");
    }

    if (accountType === "veterinarian") {
      if (!idFrontImage) {
        newErrors.idFront =
          veterinarianType === "student"
            ? t("validation.studentIdFrontRequired")
            : t("validation.doctorIdFrontRequired");
      }

      if (!idBackImage) {
        newErrors.idBack =
          veterinarianType === "student" ? t("validation.studentIdBackRequired") : t("validation.doctorIdBackRequired");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFakeLogin = async (userType: "pet_owner" | "veterinarian" | "moderator" | "admin") => {
    setErrors({});

    // Map user types to test credentials from seed data
    const credentials = {
      pet_owner: {
        email: "user1@example.com",
        password: "user123",
      },
      veterinarian: {
        email: "vet1@example.com",
        password: "vet123",
      },
      moderator: {
        email: "admin@petapp.com",
        password: "admin123",
      },
      admin: {
        email: "zuhairalrawi0@gmail.com",
        password: "zuh000123000321zuh",
      },
    };

    const creds = credentials[userType];

    loginMutation.mutate(
      { email: creds.email, password: creds.password },
      {
        onSuccess: async (data) => {
          await login(data?.user, data?.tokens?.accessToken);

          console.log(data.user);
          router.replace("/(tabs)");
        },
        onError: (error) => {
          setErrors({ general: error.message || t("auth.loginError") });
          Alert.alert("Login Error", `${error.message}\n\nURL: ${API_URL}`, [{ text: "OK" }]);
        },
      }
    );
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    setErrors({});
    loginMutation.mutate(
      { email: usernameOrEmail, password },
      {
        onSuccess: async (data) => {
          // Assuming the login function in useApp handles token storage and user state
          await login(data.user, data.tokens.accessToken);

          router.replace("/(tabs)");
        },
        onError: (error) => {
          setErrors({ general: error.message || t("auth.loginError") });
        },
      }
    );
  };

  const handleRegister = async () => {
    if (!validateRegister()) return;

    setErrors({});

    if (accountType === "veterinarian") {
      // Handle veterinarian application
      vetApplicationMutation.mutate(
        {
          name,
          email: usernameOrEmail,
          password,
          phone: `${selectedCountry.code}${phoneNumber}`,
          country: selectedLocationCountry,
          province: selectedProvince,
          gender: selectedGender as "male" | "female",
          idFrontImage: idFrontImage?.uri, // Assuming URI is the path to the uploaded file
          idBackImage: idBackImage?.uri,
          veterinarianType,
        },
        {
          onSuccess: () => {
            Alert.alert(t("auth.requestSent"), t("auth.registrationPending"), [
              {
                text: t("common.ok"),
                onPress: () => {
                  setActiveTab("login");
                  // Clear form
                  setName("");
                  setUsernameOrEmail("");
                  setPassword("");
                  setConfirmPassword("");
                  setPhoneNumber("");
                  setSelectedLocationCountry("");
                  setSelectedProvince("");
                  setSelectedGender("");
                  setIdFrontImage(null);
                  setIdBackImage(null);
                  setErrors({});
                },
              },
            ]);
          },
          onError: (error) => {
            setErrors({ general: error.message || "حدث خطأ أثناء إرسال الطلب" });
          },
        }
      );
    } else {
      // Handle regular pet owner registration
      registerMutation.mutate(
        {
          name,
          email: usernameOrEmail,
          password,
          phone: `${selectedCountry.code}${phoneNumber}`,
          country: selectedLocationCountry,
          province: selectedProvince,
          gender: selectedGender as "male" | "female",
        },
        {
          onSuccess: async (data) => {
            await login(data.user, data.user.accountType);
            router.replace("/(tabs)");
          },
          onError: (error) => {
            setErrors({ general: error.message || "حدث خطأ أثناء إنشاء الحساب" });
          },
        }
      );
    }
  };

  const handleForgotPassword = async () => {
    if (!usernameOrEmail.trim() || !/\S+@\S+\.\S+/.test(usernameOrEmail)) {
      Alert.alert("تنبيه", "يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    Alert.alert("Info", "The forgot password functionality is not yet implemented in the backend.");
    // Uncomment the following when the backend procedure is ready
    /*
    forgotPasswordMutation.mutate({ email: usernameOrEmail }, {
      onSuccess: () => {
        Alert.alert(
          "تم إرسال رابط إعادة تعيين كلمة المرور",
          `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${usernameOrEmail}. يرجى فحص بريدك الإلكتروني واتباع التعليمات.`,
          [{ text: "موافق" }]
        );
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message || "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور.");
      }
    });
    */
  };

  const handleLanguageChange = () => {
    if (isLoading) return;
    try {
      router.push("/language");
    } catch (error) {
      console.error("Navigation error to language:", error);
    }
  };

  const handleContactUs = () => {
    if (isLoading) return;
    try {
      router.push("/contact-us");
    } catch (error) {
      console.error("Navigation error to contact-us:", error);
    }
  };

  const handleCountrySelect = (country: (typeof countries)[0]) => {
    if (isLoading) return;
    // For now, just keep the default country since we only show Iraq
    setSelectedCountry(DEFAULT_COUNTRY);
    setShowCountryPicker(false);
  };

  const handleLocationCountrySelect = (countryName: string) => {
    if (isLoading) return;
    setSelectedLocationCountry(countryName);
    setSelectedProvince("");
    setShowLocationCountryPicker(false);
  };

  const handleProvinceSelect = (province: string) => {
    if (isLoading) return;
    setSelectedProvince(province);
    setShowProvincePicker(false);
  };

  const handleGenderSelect = (gender: (typeof genders)[0]) => {
    if (isLoading) return;
    setSelectedGender(gender.value);
    setShowGenderPicker(false);
  };

  const handleIdFrontPick = async () => {
    if (isLoading) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setIdFrontImage(result.assets[0]);
        if (errors.idFront) {
          setErrors((prev) => ({ ...prev, idFront: "" }));
        }
      }
    } catch (error) {
      console.error("ID front pick error:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء اختيار صورة وجه الهوية");
    }
  };

  const handleIdBackPick = async () => {
    if (isLoading) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setIdBackImage(result.assets[0]);
        if (errors.idBack) {
          setErrors((prev) => ({ ...prev, idBack: "" }));
        }
      }
    } catch (error) {
      console.error("ID back pick error:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء اختيار صورة ظهر الهوية");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.topIconsContainer}>
        <View style={styles.topIcons}>
          <TouchableOpacity style={styles.topIconButton} onPress={handleLanguageChange}>
            <Globe size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.topIconButton} onPress={handleContactUs}>
            <MessageCircle size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.backgroundContainer}>
        <View style={styles.overlay} />
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <View style={[styles.tabContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "login" && styles.activeTab]}
              onPress={() => {
                if (!isLoading) {
                  setActiveTab("login");
                  setErrors({});
                }
              }}
              disabled={isLoading}
            >
              <Text style={[styles.tabText, activeTab === "login" && styles.activeTabText]}>{t("auth.login")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "register" && styles.activeTab]}
              onPress={() => {
                if (!isLoading) {
                  setActiveTab("register");
                  setErrors({});
                }
              }}
              disabled={isLoading}
            >
              <Text style={[styles.tabText, activeTab === "register" && styles.activeTabText]}>
                {t("auth.register")}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.formTitle, { textAlign: isRTL ? "right" : "center" }]}>
            {activeTab === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}
          </Text>

          {errors.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {activeTab === "register" && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { textAlign: "center", marginBottom: 16 }]}>
                  {t("auth.selectAccountType")}
                </Text>
                <View style={styles.accountTypeButtons}>
                  <TouchableOpacity
                    style={[styles.accountTypeButton, accountType === "pet_owner" && styles.accountTypeButtonActive]}
                    onPress={() => setAccountType("pet_owner")}
                  >
                    <User size={24} color={accountType === "pet_owner" ? COLORS.white : COLORS.primary} />
                    <Text style={[styles.accountTypeText, accountType === "pet_owner" && styles.accountTypeTextActive]}>
                      {t("auth.petOwner")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.accountTypeButton, accountType === "veterinarian" && styles.accountTypeButtonActive]}
                    onPress={() => setAccountType("veterinarian")}
                  >
                    <Stethoscope size={24} color={accountType === "veterinarian" ? COLORS.white : COLORS.primary} />
                    <Text
                      style={[styles.accountTypeText, accountType === "veterinarian" && styles.accountTypeTextActive]}
                    >
                      {t("auth.veterinarian")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === "register" && accountType === "veterinarian" && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { textAlign: "center", marginBottom: 16 }]}>
                  {t("auth.selectVetType")}
                </Text>
                <View style={styles.veterinarianTypeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.veterinarianTypeButton,
                      veterinarianType === "student" && styles.veterinarianTypeButtonActive,
                    ]}
                    onPress={() => setVeterinarianType("student")}
                  >
                    <Text
                      style={[
                        styles.veterinarianTypeText,
                        veterinarianType === "student" && styles.veterinarianTypeTextActive,
                      ]}
                    >
                      {t("auth.vetStudent")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.veterinarianTypeButton,
                      veterinarianType === "veterinarian" && styles.veterinarianTypeButtonActive,
                    ]}
                    onPress={() => setVeterinarianType("veterinarian")}
                  >
                    <Text
                      style={[
                        styles.veterinarianTypeText,
                        veterinarianType === "veterinarian" && styles.veterinarianTypeTextActive,
                      ]}
                    >
                      {t("auth.vetDoctor")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === "register" && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { textAlign: isRTL ? "right" : "left" }]}>{t("auth.name")}</Text>
                <TextInput
                  style={[styles.input, { textAlign: isRTL ? "right" : "left" }, errors.name && styles.inputError]}
                  placeholder={t("auth.nameLabel")}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: "" }));
                    }
                  }}
                  placeholderTextColor={COLORS.darkGray}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { textAlign: isRTL ? "right" : "left" }]}>
                {activeTab === "login" ? t("auth.emailUsername") : t("auth.email")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { textAlign: isRTL ? "right" : "left" },
                  errors.usernameOrEmail && styles.inputError,
                ]}
                placeholder={activeTab === "login" ? t("auth.emailUsername") : t("auth.emailLabel")}
                value={usernameOrEmail}
                onChangeText={(text) => {
                  setUsernameOrEmail(text);
                  if (errors.usernameOrEmail) {
                    setErrors((prev) => ({ ...prev, usernameOrEmail: "" }));
                  }
                }}
                keyboardType={activeTab === "login" ? "default" : "email-address"}
                autoCapitalize="none"
                placeholderTextColor={COLORS.darkGray}
              />
              {errors.usernameOrEmail && <Text style={styles.errorText}>{errors.usernameOrEmail}</Text>}
            </View>

            {activeTab === "register" && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { textAlign: isRTL ? "right" : "left" }]}>
                  {t("auth.phoneNumber")}
                </Text>
                <View style={styles.phoneContainer}>
                  <TouchableOpacity
                    style={styles.countrySelector}
                    onPress={() => setShowCountryPicker(!showCountryPicker)}
                  >
                    <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                    <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                    <ChevronDown size={16} color={COLORS.darkGray} />
                  </TouchableOpacity>
                  <TextInput
                    style={[
                      styles.phoneInput,
                      { textAlign: isRTL ? "right" : "left" },
                      errors.phoneNumber && styles.inputError,
                    ]}
                    placeholder={t("auth.phoneNumber")}
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                      if (errors.phoneNumber) {
                        setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                      }
                    }}
                    keyboardType="phone-pad"
                    placeholderTextColor={COLORS.darkGray}
                  />
                </View>

                {showCountryPicker && (
                  <View style={styles.countryPicker}>
                    <ScrollView style={styles.countryList} nestedScrollEnabled>
                      {countries
                        .filter((country) => country.name === "العراق")
                        .map((country, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.countryItem}
                            onPress={() => handleCountrySelect(country)}
                          >
                            <Text style={styles.countryFlag}>{country.flag}</Text>
                            <Text style={styles.countryName}>{country.name}</Text>
                            <Text style={styles.countryCodeInList}>{country.code}</Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </View>
                )}
                {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { textAlign: isRTL ? "right" : "left" }]}>{t("auth.password")}</Text>
              <TextInput
                style={[styles.input, { textAlign: isRTL ? "right" : "left" }, errors.password && styles.inputError]}
                placeholder={t("auth.passwordLabel")}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                secureTextEntry
                placeholderTextColor={COLORS.darkGray}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {activeTab === "register" && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { textAlign: isRTL ? "right" : "left" }]}>
                  {t("auth.confirmPassword")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { textAlign: isRTL ? "right" : "left" },
                    errors.confirmPassword && styles.inputError,
                  ]}
                  placeholder={t("auth.confirmPasswordLabel")}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }
                  }}
                  secureTextEntry
                  placeholderTextColor={COLORS.darkGray}
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
            )}

            {activeTab === "register" && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { textAlign: isRTL ? "right" : "left" }]}>{t("auth.country")}</Text>
                <TouchableOpacity
                  style={[styles.pickerButton, errors.country && styles.inputError]}
                  onPress={() => {
                    setShowLocationCountryPicker(!showLocationCountryPicker);
                    if (errors.country) {
                      setErrors((prev) => ({ ...prev, country: "" }));
                    }
                  }}
                >
                  <Text style={[styles.pickerButtonText, !selectedLocationCountry && styles.placeholderText]}>
                    {selectedLocationCountry || t("auth.selectCountry")}
                  </Text>
                  <ChevronDown size={16} color={COLORS.darkGray} />
                </TouchableOpacity>

                {showLocationCountryPicker && (
                  <View style={styles.pickerDropdown}>
                    <ScrollView style={styles.pickerList} nestedScrollEnabled>
                      {Object.keys(provinces).map((country, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.pickerItem}
                          onPress={() => handleLocationCountrySelect(country)}
                        >
                          <Text style={styles.pickerItemText}>{country}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
              </View>
            )}

            {activeTab === "register" && selectedLocationCountry && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { textAlign: isRTL ? "right" : "left" }]}>{t("auth.province")}</Text>
                <TouchableOpacity
                  style={[styles.pickerButton, errors.province && styles.inputError]}
                  onPress={() => {
                    setShowProvincePicker(!showProvincePicker);
                    if (errors.province) {
                      setErrors((prev) => ({ ...prev, province: "" }));
                    }
                  }}
                >
                  <Text style={[styles.pickerButtonText, !selectedProvince && styles.placeholderText]}>
                    {selectedProvince || t("auth.selectProvince")}
                  </Text>
                  <ChevronDown size={16} color={COLORS.darkGray} />
                </TouchableOpacity>

                {showProvincePicker && (
                  <View style={styles.pickerDropdown}>
                    <ScrollView style={styles.pickerList} nestedScrollEnabled>
                      {provinces[selectedLocationCountry as keyof typeof provinces]?.map((province, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.pickerItem}
                          onPress={() => handleProvinceSelect(province)}
                        >
                          <Text style={styles.pickerItemText}>{province}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {errors.province && <Text style={styles.errorText}>{errors.province}</Text>}
              </View>
            )}

            {activeTab === "register" && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { textAlign: isRTL ? "right" : "left" }]}>{t("auth.gender")}</Text>
                <TouchableOpacity
                  style={[styles.pickerButton, errors.gender && styles.inputError]}
                  onPress={() => {
                    setShowGenderPicker(!showGenderPicker);
                    if (errors.gender) {
                      setErrors((prev) => ({ ...prev, gender: "" }));
                    }
                  }}
                >
                  <Text style={[styles.pickerButtonText, !selectedGender && styles.placeholderText]}>
                    {genders.find((g) => g.value === selectedGender)?.label || t("auth.selectGender")}
                  </Text>
                  <ChevronDown size={16} color={COLORS.darkGray} />
                </TouchableOpacity>

                {showGenderPicker && (
                  <View style={styles.pickerDropdown}>
                    <ScrollView style={styles.pickerList} nestedScrollEnabled>
                      {genders.map((gender, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.pickerItem}
                          onPress={() => handleGenderSelect(gender)}
                        >
                          <Text style={styles.pickerItemText}>{gender.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
              </View>
            )}

            {activeTab === "register" && accountType === "veterinarian" && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { textAlign: isRTL ? "right" : "left" }]}>
                    {veterinarianType === "student" ? t("auth.studentIdFront") : t("auth.doctorIdFront")}
                  </Text>
                  <TouchableOpacity
                    style={[styles.documentButton, errors.idFront && styles.inputError]}
                    onPress={handleIdFrontPick}
                  >
                    <View style={styles.documentButtonContent}>
                      {idFrontImage ? (
                        <>
                          <FileText size={20} color={COLORS.primary} />
                          <Text style={styles.documentButtonText}>{idFrontImage.name}</Text>
                        </>
                      ) : (
                        <>
                          <Upload size={20} color={COLORS.darkGray} />
                          <Text style={[styles.documentButtonText, styles.placeholderText]}>
                            {t("auth.uploadIdFront")}
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                  {errors.idFront && <Text style={styles.errorText}>{errors.idFront}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { textAlign: isRTL ? "right" : "left" }]}>
                    {veterinarianType === "student" ? t("auth.studentIdBack") : t("auth.doctorIdBack")}
                  </Text>
                  <TouchableOpacity
                    style={[styles.documentButton, errors.idBack && styles.inputError]}
                    onPress={handleIdBackPick}
                  >
                    <View style={styles.documentButtonContent}>
                      {idBackImage ? (
                        <>
                          <FileText size={20} color={COLORS.primary} />
                          <Text style={styles.documentButtonText}>{idBackImage.name}</Text>
                        </>
                      ) : (
                        <>
                          <Upload size={20} color={COLORS.darkGray} />
                          <Text style={[styles.documentButtonText, styles.placeholderText]}>
                            {t("auth.uploadIdBack")}
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                  {errors.idBack && <Text style={styles.errorText}>{errors.idBack}</Text>}
                </View>
              </>
            )}

            {activeTab === "login" && (
              <>
                <TouchableOpacity
                  style={[styles.forgotPasswordContainer, { alignSelf: isRTL ? "flex-start" : "flex-end" }]}
                  onPress={handleForgotPassword}
                  disabled={isLoading}
                >
                  <Text style={styles.forgotPasswordText}>نسيت كلمة المرور؟</Text>
                </TouchableOpacity>

                <View style={styles.fakeLoginContainer}>
                  <Text style={styles.fakeLoginTitle}>تسجيل دخول وهمي للاختبار:</Text>

                  <View style={styles.fakeLoginButtons}>
                    <TouchableOpacity
                      style={[styles.fakeLoginButton, styles.fakeLoginPetOwner]}
                      onPress={() => handleFakeLogin("pet_owner")}
                      disabled={isLoading}
                    >
                      <User size={20} color={COLORS.white} />
                      <Text style={styles.fakeLoginButtonText}>صاحب حيوان</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.fakeLoginButton, styles.fakeLoginVet]}
                      onPress={() => handleFakeLogin("veterinarian")}
                      disabled={isLoading}
                    >
                      <Stethoscope size={20} color={COLORS.white} />
                      <Text style={styles.fakeLoginButtonText}>طبيب بيطري</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.fakeLoginButtons}>
                    <TouchableOpacity
                      style={[styles.fakeLoginButton, styles.fakeLoginModerator]}
                      onPress={() => handleFakeLogin("moderator")}
                      disabled={isLoading}
                    >
                      <User size={20} color={COLORS.white} />
                      <Text style={styles.fakeLoginButtonText}>مشرف عادي</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.fakeLoginButton, styles.fakeLoginAdmin]}
                      onPress={() => handleFakeLogin("admin")}
                      disabled={isLoading}
                    >
                      <User size={20} color={COLORS.white} />
                      <Text style={styles.fakeLoginButtonText}>إدمن أساسي</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {activeTab === "login" && (
              <TouchableOpacity
                style={[styles.forgotPasswordContainer, { alignSelf: isRTL ? "flex-start" : "flex-end" }]}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>{t("auth.forgotPassword")}</Text>
              </TouchableOpacity>
            )}

            <Button
              title={
                isLoading ? t("common.loading") : activeTab === "login" ? t("auth.login") : t("auth.createAccount")
              }
              onPress={activeTab === "login" ? handleLogin : handleRegister}
              type="primary"
              size="large"
              style={styles.submitButton}
              disabled={isLoading}
            />

            <View style={[styles.switchContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={styles.switchText}>
                {activeTab === "login" ? t("auth.dontHaveAccount") + " " : t("auth.alreadyHaveAccount") + " "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (!isLoading) {
                    setActiveTab(activeTab === "login" ? "register" : "login");
                    setErrors({});
                  }
                }}
                disabled={isLoading}
              >
                <Text style={styles.switchButtonText}>
                  {activeTab === "login" ? t("auth.register") : t("auth.login")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 0,
    width: "100%",
    maxWidth: 400,
    maxHeight: height * 0.9,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  tabContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
    color: COLORS.black,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
    position: "relative",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: COLORS.black,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: COLORS.white,
    color: COLORS.black,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: COLORS.gray,
    minWidth: 100,
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 4,
  },
  countryCode: {
    fontSize: 16,
    color: COLORS.black,
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: COLORS.white,
    borderLeftWidth: 0,
    color: COLORS.black,
  },
  countryPicker: {
    position: "absolute",
    top: 85,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  countryList: {
    maxHeight: 200,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 8,
  },
  countryCodeInList: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  forgotPasswordContainer: {
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  submitButton: {
    width: "100%",
    marginBottom: 20,
  },
  orText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 20,
  },
  socialContainer: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  googleButton: {
    backgroundColor: "#DB4437",
  },
  facebookButton: {
    backgroundColor: "#4267B2",
  },
  socialButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  switchContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  switchText: {
    color: COLORS.darkGray,
    fontSize: 14,
  },
  switchButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  pickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
  },
  pickerButtonText: {
    fontSize: 16,
    color: COLORS.black,
  },
  placeholderText: {
    color: COLORS.darkGray,
  },
  pickerDropdown: {
    position: "absolute",
    top: 85,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerList: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  pickerItemText: {
    fontSize: 16,
    color: COLORS.black,
    textAlign: "right",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#f44336",
    fontSize: 14,
    marginTop: 4,
    textAlign: "right",
  },
  inputError: {
    borderColor: "#f44336",
    borderWidth: 1,
  },
  accountTypeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  veterinarianTypeButtons: {
    gap: 12,
  },
  veterinarianTypeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  veterinarianTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  veterinarianTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
  },
  veterinarianTypeTextActive: {
    color: COLORS.white,
  },
  accountTypeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  accountTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  accountTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 8,
  },
  accountTypeTextActive: {
    color: COLORS.white,
  },
  documentButton: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  documentButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  documentButtonText: {
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 8,
  },

  topIconsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "transparent",
  },
  topIcons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 10,
    gap: 15,
  },
  topIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 2,
    borderColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fakeLoginContainer: {
    marginTop: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  fakeLoginTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF8C00",
    textAlign: "center",
    marginBottom: 12,
  },
  fakeLoginButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  fakeLoginButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  fakeLoginPetOwner: {
    backgroundColor: "#4ECDC4",
  },
  fakeLoginVet: {
    backgroundColor: "#45B7D1",
  },
  fakeLoginModerator: {
    backgroundColor: "#96CEB4",
  },
  fakeLoginAdmin: {
    backgroundColor: "#FF6B6B",
  },
  fakeLoginButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
});
