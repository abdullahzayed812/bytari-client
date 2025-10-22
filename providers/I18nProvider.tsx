import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Language = "ar" | "en";

interface I18nContextType {
  language: Language;
  isRTL: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  changeLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

// Complete translations for the veterinary app
const translations = {
  ar: {
    "auth.login": "تسجيل الدخول",
    "auth.register": "إنشاء حساب",
    "auth.logout": "تسجيل الخروج",
    "auth.loginTitle": "تسجيل الدخول",
    "auth.registerTitle": "إنشاء حساب جديد",
    "auth.selectAccountType": "اختر نوع الحساب",
    "auth.petOwner": "صاحب حيوان",
    "auth.veterinarian": "طبيب بيطري أو صاحب عيادة",
    "auth.selectVetType": "حدد نوع الحساب",
    "auth.vetStudent": "طالب في كلية الطب البيطري",
    "auth.vetDoctor": "طبيب بيطري",
    "auth.name": "الاسم",
    "auth.nameLabel": "أدخل اسمك الكامل",
    "auth.emailUsername": "اسم المستخدم أو البريد الإلكتروني",
    "auth.email": "البريد الإلكتروني",
    "auth.emailLabel": "أدخل بريدك الإلكتروني",
    "auth.phoneNumber": "رقم الهاتف",
    "auth.password": "كلمة المرور",
    "auth.passwordLabel": "أدخل كلمة المرور",
    "auth.confirmPassword": "تأكيد كلمة المرور",
    "auth.confirmPasswordLabel": "أعد إدخال كلمة المرور",
    "auth.country": "البلد",
    "auth.selectCountry": "اختر البلد",
    "auth.province": "المحافظة",
    "auth.selectProvince": "اختر المحافظة",
    "auth.gender": "الجنس",
    "auth.selectGender": "اختر الجنس",
    "auth.male": "ذكر",
    "auth.female": "أنثى",
    "auth.forgotPassword": "نسيت كلمة المرور؟",
    "auth.dontHaveAccount": "ليس لديك حساب؟",
    "auth.alreadyHaveAccount": "لديك حساب بالفعل؟",
    "auth.createAccount": "إنشاء حساب",
    "auth.idFront": "صورة وجه الهوية",
    "auth.idBack": "صورة ظهر الهوية",
    "auth.studentIdFront": "صورة وجه هوية الطالب",
    "auth.studentIdBack": "صورة ظهر هوية الطالب",
    "auth.doctorIdFront": "صورة وجه هوية الطبيب",
    "auth.doctorIdBack": "صورة ظهر هوية الطبيب",
    "auth.uploadIdFront": "رفع صورة وجه الهوية",
    "auth.uploadIdBack": "رفع صورة ظهر الهوية",
    "auth.registrationPending":
      "تم إرسال طلب التسجيل للمشرفين للمراجعة والموافقة. سيتم إشعارك عبر البريد الإلكتروني عند الموافقة على حسابك. يرجى تسجيل الدخول بعد الموافقة.",
    "auth.loginError": "حدث خطأ أثناء تسجيل الدخول",
    "auth.requestSent": "تم إرسال الطلب بنجاح",
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ",
    "common.success": "تم بنجاح",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.add": "إضافة",
    "common.search": "بحث",
    "common.ok": "موافق",
    "onboarding.getStarted": "ابدأ الآن",
    "onboarding.welcome": "مرحباً بك",
    "onboarding.description": "اكتشف أفضل الخدمات البيطرية",
    "home.title": "الرئيسية",
    "home.consultation": "أرسل استشارتك وسنجيبك فوراً\nلدينا طاقم طبي ومتخصص",
    "home.consultationVet": "اذا كان لديك اي استفسار عن مرض معين او عن علاج او اي شيء يخص الطب البيطري فتفضل بمراسلتنا",
    "home.sendConsultation": "إرسال استشارة",
    "home.availableClinics": "العيادات المتاحة",
    "home.vetMagazine": "المجلة البيطرية",
    "home.bestTips": "أفضل النصائح",
    "home.vetBooks": "الكتب البيطرية",
    "home.lostPets": "الحيوانات المفقودة",
    "home.reportLostPet": "بلاغ حيوان مفقود",
    "home.previousConsultations": "الاستشارات السابقة",
    "home.stores": "المتاجر",
    "home.vetStores": "المتاجر البيطرية",
    "profile.title": "الملف الشخصي",
    "profile.points": "النقاط",
    "profile.subscribeToPremium": "الاشتراك المميز",
    "profile.settings": "الإعدادات",
    "profile.language": "اللغة",
    "profile.notifications": "الإشعارات",
    "profile.shareApp": "شارك التطبيق",
    "profile.logout": "تسجيل الخروج",
    "profile.shareAppMessage": "جرب هذا التطبيق البيطري الرائع",
    "profile.shareAppTitle": "شارك التطبيق",
    "profile.linkCopied": "تم نسخ الرابط",
    "profile.shareError": "حدث خطأ أثناء المشاركة",
    "store.title": "المتجر",
    "pets.title": "الحيوانات الأليفة",
    "sections.title": "الأقسام",
    "validation.usernameEmailRequired": "يرجى إدخال اسم المستخدم أو البريد الإلكتروني",
    "validation.passwordRequired": "يرجى إدخال كلمة المرور",
    "validation.passwordTooShort": "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    "validation.nameRequired": "يرجى إدخال الاسم",
    "validation.emailRequired": "يرجى إدخال البريد الإلكتروني",
    "validation.emailInvalid": "يرجى إدخال بريد إلكتروني صحيح",
    "validation.phoneRequired": "يرجى إدخال رقم الهاتف",
    "validation.confirmPasswordRequired": "يرجى تأكيد كلمة المرور",
    "validation.passwordsNotMatch": "كلمة المرور غير متطابقة",
    "validation.countryRequired": "يرجى اختيار البلد",
    "validation.provinceRequired": "يرجى اختيار المحافظة",
    "validation.genderRequired": "يرجى اختيار الجنس",
    "validation.studentIdFrontRequired": "يرجى رفع صورة وجه هوية الطالب",
    "validation.doctorIdFrontRequired": "يرجى رفع صورة وجه هوية الطبيب",
    "validation.studentIdBackRequired": "يرجى رفع صورة ظهر هوية الطالب",
    "validation.doctorIdBackRequired": "يرجى رفع صورة ظهر هوية الطبيب",
    "auth.adminName": "زهير الراوي - الإدمن الأساسي",
    "auth.pendingReview": "حسابك قيد المراجعة",
    "auth.pendingReviewMessage":
      "حسابك كطبيب بيطري لا يزال قيد المراجعة من قبل الإدارة. سيتم إشعارك عبر البريد الإلكتروني عند الموافقة على حسابك.",
    "auth.registerError": "حدث خطأ أثناء إنشاء الحساب",
    "auth.warning": "تنبيه",
    "auth.enterEmailFirst": "يرجى إدخال البريد الإلكتروني أولاً",
    "auth.enterValidEmail": "يرجى إدخال بريد إلكتروني صحيح",
    "auth.passwordResetSent": "تم إرسال رابط إعادة تعيين كلمة المرور",
    "auth.passwordResetEmailSent":
      "تم إرسال رابط إعادة تعيين كلمة المرور إلى {email}. يرجى فحص بريدك الإلكتروني واتباع التعليمات.",
    "auth.passwordResetError": "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.",
    "auth.invalidCredentials": "بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.",
  },
  en: {
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.logout": "Logout",
    "auth.loginTitle": "Login",
    "auth.registerTitle": "Create New Account",
    "auth.selectAccountType": "Select Account Type",
    "auth.petOwner": "Pet Owner",
    "auth.veterinarian": "Veterinarian or Clinic Owner",
    "auth.selectVetType": "Select Account Type",
    "auth.vetStudent": "Veterinary Student",
    "auth.vetDoctor": "Veterinarian",
    "auth.name": "Name",
    "auth.nameLabel": "Enter your full name",
    "auth.emailUsername": "Username or Email",
    "auth.email": "Email",
    "auth.emailLabel": "Enter your email",
    "auth.phoneNumber": "Phone Number",
    "auth.password": "Password",
    "auth.passwordLabel": "Enter password",
    "auth.confirmPassword": "Confirm Password",
    "auth.confirmPasswordLabel": "Re-enter password",
    "auth.country": "Country",
    "auth.selectCountry": "Select Country",
    "auth.province": "Province",
    "auth.selectProvince": "Select Province",
    "auth.gender": "Gender",
    "auth.selectGender": "Select Gender",
    "auth.male": "Male",
    "auth.female": "Female",
    "auth.forgotPassword": "Forgot Password?",
    "auth.dontHaveAccount": "Don't have an account?",
    "auth.alreadyHaveAccount": "Already have an account?",
    "auth.createAccount": "Create Account",
    "auth.idFront": "ID Front Photo",
    "auth.idBack": "ID Back Photo",
    "auth.studentIdFront": "Student ID Front Photo",
    "auth.studentIdBack": "Student ID Back Photo",
    "auth.doctorIdFront": "Doctor ID Front Photo",
    "auth.doctorIdBack": "Doctor ID Back Photo",
    "auth.uploadIdFront": "Upload ID Front Photo",
    "auth.uploadIdBack": "Upload ID Back Photo",
    "auth.registrationPending":
      "Your registration request has been sent to administrators for review and approval. You will be notified via email when your account is approved. Please log in after approval.",
    "auth.loginError": "An error occurred during login",
    "auth.requestSent": "Request sent successfully",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.search": "Search",
    "common.ok": "OK",
    "onboarding.getStarted": "Get Started",
    "onboarding.welcome": "Welcome",
    "onboarding.description": "Discover the best veterinary services",
    "home.title": "Home",
    "home.consultation":
      "Send your consultation and we will answer it immediately\nWe have medical and specialized staff",
    "home.consultationVet": "Veterinary Consultations",
    "home.sendConsultation": "Send Consultation",
    "home.availableClinics": "Available Clinics",
    "home.vetMagazine": "Veterinary Magazine",
    "home.bestTips": "Best Tips",
    "home.vetBooks": "Veterinary Books",
    "home.lostPets": "Lost Pets",
    "home.reportLostPet": "Report Lost Pet",
    "home.previousConsultations": "Previous Consultations",
    "home.stores": "Stores",
    "home.vetStores": "Veterinary Stores",
    "profile.title": "Profile",
    "profile.points": "Points",
    "profile.subscribeToPremium": "Subscribe to Premium",
    "profile.settings": "Settings",
    "profile.language": "Language",
    "profile.notifications": "Notifications",
    "profile.shareApp": "Share App",
    "profile.logout": "Logout",
    "profile.shareAppMessage": "Try this amazing veterinary app",
    "profile.shareAppTitle": "Share App",
    "profile.linkCopied": "Link copied",
    "profile.shareError": "Error occurred while sharing",
    "store.title": "Store",
    "pets.title": "Pets",
    "sections.title": "Sections",
    "validation.usernameEmailRequired": "Please enter username or email",
    "validation.passwordRequired": "Please enter password",
    "validation.passwordTooShort": "Password must be at least 6 characters",
    "validation.nameRequired": "Please enter name",
    "validation.emailRequired": "Please enter email",
    "validation.emailInvalid": "Please enter valid email",
    "validation.phoneRequired": "Please enter phone number",
    "validation.confirmPasswordRequired": "Please confirm password",
    "validation.passwordsNotMatch": "Passwords do not match",
    "validation.countryRequired": "Please select country",
    "validation.provinceRequired": "Please select province",
    "validation.genderRequired": "Please select gender",
    "validation.studentIdFrontRequired": "Please upload student ID front photo",
    "validation.doctorIdFrontRequired": "Please upload doctor ID front photo",
    "validation.studentIdBackRequired": "Please upload student ID back photo",
    "validation.doctorIdBackRequired": "Please upload doctor ID back photo",
    "auth.adminName": "Zuhair Al-Rawi - Main Admin",
    "auth.pendingReview": "Your account is under review",
    "auth.pendingReviewMessage":
      "Your veterinarian account is still under review by the administration. You will be notified via email when your account is approved.",
    "auth.registerError": "An error occurred while creating account",
    "auth.warning": "Warning",
    "auth.enterEmailFirst": "Please enter email first",
    "auth.enterValidEmail": "Please enter valid email",
    "auth.passwordResetSent": "Password reset link sent",
    "auth.passwordResetEmailSent":
      "Password reset link has been sent to {email}. Please check your email and follow the instructions.",
    "auth.passwordResetError": "An error occurred while sending password reset link. Please try again.",
    "auth.invalidCredentials": "Invalid login credentials. Please check your email and password.",
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");

  useEffect(() => {
    loadLanguage();
  }, []);

  console.log({ language });

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage && (savedLanguage === "ar" || savedLanguage === "en")) {
        setLanguageState(savedLanguage);
      }
      setLanguageState("ar");
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem("language", lang);
      setLanguageState(lang);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  // Alias for changeLanguage (some components might use this name)
  const changeLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem("language", lang);
      setLanguageState(lang);

      // Update RTL configuration when language changes
      if (lang === "ar") {
        // RTL configuration is handled globally, but we can trigger a re-render
        console.log("Language changed to Arabic (RTL)");
      } else {
        console.log("Language changed to English (LTR)");
      }
    } catch (error) {
      console.error("Error changing language:", error);
      throw error;
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        isRTL: language === "ar",
        setLanguage,
        changeLanguage,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
