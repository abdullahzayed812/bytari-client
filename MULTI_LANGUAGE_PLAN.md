# Multi-Language Support Plan for Bytari Mobile App

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Complete List of Detected Hardcoded Text](#2-complete-list-of-detected-hardcoded-text)
3. [Proposed Multi-Language File Structure](#3-proposed-multi-language-file-structure)
4. [Translation Key Design](#4-translation-key-design)
5. [References to Replace in Screens](#5-references-to-replace-in-screens)
6. [RTL Considerations](#6-rtl-considerations)
7. [Implementation Steps](#7-implementation-steps)

---

## 1. Current State Analysis

### Existing i18n Infrastructure

The app already has a partial i18n system in place:

| Component              | Location                         | Status                                                                                                 |
| ---------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `I18nProvider.tsx`     | `providers/I18nProvider.tsx`     | Active - supports `ar` and `en` only, ~120 flat keys per language                                      |
| `LanguageProvider.tsx` | `providers/LanguageProvider.tsx` | Wrapper - defines 7 languages but only switches ar/en                                                  |
| `translations.ts`      | `constants/translations.ts`      | Backup file - nested structure, 7 languages (ar, en, ku, fr, tr, de, fa), NOT actively used by screens |
| `rtl-config.ts`        | `lib/rtl-config.ts`              | Helper functions for RTL layout                                                                        |

### Key Problems Identified

1. **Dual translation systems**: `I18nProvider.tsx` (flat keys, used by screens) and `constants/translations.ts` (nested keys, unused) are disconnected.
2. **Only ar/en active**: Kurdish and other languages exist in `translations.ts` but the `I18nProvider` only supports `ar | en`.
3. **Massive hardcoded text**: 60+ screen files contain hardcoded Arabic strings NOT wrapped in `t()`.
4. **Missing Kurdish in I18nProvider**: Kurdish (`ku`) is not in the active translation system.
5. **Inconsistent t() usage**: Some screens use `t()` properly, others have fully hardcoded Arabic text.

### Statistics

- **Total screen files**: ~259
- **Files with hardcoded text**: 60+
- **Existing translation keys (I18nProvider)**: ~120 per language
- **Estimated new keys needed**: ~800+
- **Languages requested**: Arabic (ar), English (en), Kurdish (ku)

---

## 2. Complete List of Detected Hardcoded Text

### 2.1 Main Tab Screens

#### `app/(tabs)/index.tsx` (Home Screen) — ~50 hardcoded strings

| Text (Arabic)                                  | English Translation                                | Suggested Key                     |
| ---------------------------------------------- | -------------------------------------------------- | --------------------------------- |
| مرحباً دكتور                                   | Hello Doctor                                       | `home.greetingDoctor`             |
| مرحباً                                         | Hello                                              | `home.greeting`                   |
| الإعلانات                                      | Advertisements                                     | `home.advertisements`             |
| ارسل استفسارك                                  | Send your inquiry                                  | `home.sendInquiry`                |
| استفساراتك السابقة                             | Your previous inquiries                            | `home.previousInquiries`          |
| استشاراتك السابقة                              | Your previous consultations                        | `home.previousConsultations`      |
| قيد المراجعة                                   | Under review                                       | `common.underReview`              |
| تم الرد                                        | Replied                                            | `common.replied`                  |
| مغلق                                           | Closed                                             | `common.closed`                   |
| الحيوان:                                       | Animal:                                            | `common.animalLabel`              |
| لا توجد استفسارات                              | No inquiries found                                 | `home.noInquiries`                |
| لا توجد استشارات                               | No consultations found                             | `home.noConsultations`            |
| النوع:                                         | Type:                                              | `common.typeLabel`                |
| مستوى الأهمية:                                 | Priority level:                                    | `consultation.priorityLevel`      |
| طارئ                                           | Emergency                                          | `consultation.priority.emergency` |
| عالي                                           | High                                               | `consultation.priority.high`      |
| متوسط                                          | Medium                                             | `consultation.priority.medium`    |
| منخفض                                          | Low                                                | `consultation.priority.low`       |
| المكاتب البيطرية                               | Veterinary offices                                 | `home.vetOffices`                 |
| نشط                                            | Active                                             | `common.active`                   |
| اتصال                                          | Call                                               | `common.call`                     |
| المنتجات                                       | Products                                           | `store.products`                  |
| مميز                                           | Premium                                            | `common.premium`                  |
| الخريطة                                        | Map                                                | `common.map`                      |
| حيوانات للتبني أو للتزاوج                      | Pets for adoption or mating                        | `home.petsAdoptionMating`         |
| للتبني                                         | For adoption                                       | `common.forAdoption`              |
| للتزاوج                                        | For mating                                         | `common.forMating`                |
| عمر سنتين                                      | 2 years old                                        | (dynamic - needs interpolation)   |
| التفاصيل                                       | Details                                            | `common.details`                  |
| ابلاغ                                          | Report                                             | `common.report`                   |
| الموقع                                         | Location                                           | `common.location`                 |
| تحميل                                          | Download                                           | `common.download`                 |
| لا يوجد حيوانات مفقوده                         | No lost pets found                                 | `lostPets.noResults`              |
| مرحباً بك في تطبيق بيطري!                      | Welcome to Bytari app!                             | `home.welcomeModal.title`         |
| ماذا يقدم لك تطبيق بيطري?                      | What does Bytari offer you?                        | `home.welcomeModal.subtitle`      |
| إدارة شاملة لحيواناتك الأليفة وسجلاتها الطبية. | Comprehensive pet management and medical records.  | `home.welcomeModal.feature1`      |
| التواصل المباشر مع نخبة من الأطباء البيطريين.  | Direct communication with top veterinarians.       | `home.welcomeModal.feature2`      |
| الوصول إلى أفضل العيادات والمكاتب البيطرية.    | Access to the best clinics and veterinary offices. | `home.welcomeModal.feature3`      |
| ابدأ الآن                                      | Get started                                        | `home.welcomeModal.getStarted`    |
| عيادتي                                         | My clinic                                          | `tabs.myClinic`                   |

#### `app/(tabs)/profile.tsx` — ~20 hardcoded strings

| Text (Arabic)                    | English Translation                | Suggested Key                |
| -------------------------------- | ---------------------------------- | ---------------------------- |
| نجح                              | Success                            | `common.success`             |
| تم تحديث صورة الملف الشخصي بنجاح | Profile photo updated successfully | `profile.photoUpdateSuccess` |
| خطأ                              | Error                              | `common.error`               |
| فشل تحديث الصورة                 | Failed to update photo             | `profile.photoUpdateFailed`  |
| فشل رفع الصورة                   | Failed to upload photo             | `profile.photoUploadFailed`  |
| جاري الرفع...                    | Uploading...                       | `common.uploading`           |
| استبدال النقاط                   | Redeem points                      | `profile.redeemPoints`       |
| العضوية المميزة (مخفية)          | Premium membership (hidden)        | `profile.premiumHidden`      |
| تعديل                            | Edit                               | `common.edit`                |
| إظهار                            | Show                               | `common.show`                |
| المفضلة                          | Favorites                          | `profile.favorites`          |
| طلباتي                           | My orders                          | `profile.myOrders`           |
| إضافة مذخر                       | Add office                         | `profile.addOffice`          |
| تواصل معنا                       | Contact us                         | `profile.contactUs`          |
| جاري تسجيل الخروج...             | Logging out...                     | `profile.loggingOut`         |

#### `app/(tabs)/pets.tsx` — ~80 hardcoded strings

| Text (Arabic)                                  | English Translation                        | Suggested Key                     |
| ---------------------------------------------- | ------------------------------------------ | --------------------------------- |
| تسمين                                          | Fattening                                  | `poultry.farmType.fattening`      |
| بياض                                           | Laying                                     | `poultry.farmType.laying`         |
| أمهات                                          | Breeders                                   | `poultry.farmType.breeders`       |
| مختلط                                          | Mixed                                      | `poultry.farmType.mixed`          |
| سليم                                           | Healthy                                    | `common.healthStatus.healthy`     |
| حجر صحي                                        | Quarantine                                 | `common.healthStatus.quarantine`  |
| مريض                                           | Sick                                       | `common.healthStatus.sick`        |
| كامل الصلاحيات                                 | Full access                                | `roles.fullAccess`                |
| عرض وتعديل الحيوانات                           | View and edit animals                      | `roles.viewEditAnimals`           |
| عرض فقط                                        | View only                                  | `roles.viewOnly`                  |
| المواعيد فقط                                   | Appointments only                          | `roles.appointmentsOnly`          |
| عرض وتعديل المخزون                             | View and edit inventory                    | `roles.viewEditInventory`         |
| إدارة الطلبات فقط                              | Manage orders only                         | `roles.manageOrdersOnly`          |
| بيانات غير صحيحة                               | Invalid data                               | `common.invalidData`              |
| العيادة                                        | Clinic                                     | `common.clinic`                   |
| المذخر                                         | Office                                     | `common.vetOffice`                |
| قيد المراجعة                                   | Under review                               | `common.underReview`              |
| منتهي                                          | Expired                                    | `common.expired`                  |
| عاجل                                           | Urgent                                     | `common.urgent`                   |
| قريب الانتهاء                                  | Expiring soon                              | `common.expiringSoon`             |
| نشط                                            | Active                                     | `common.active`                   |
| اشتراك العيادة                                 | Clinic subscription                        | `subscription.clinicSubscription` |
| اشتراك المذخر                                  | Office subscription                        | `subscription.officeSubscription` |
| تاريخ الانتهاء:                                | Expiry date:                               | `subscription.expiryDate`         |
| الأيام المتبقية:                               | Remaining days:                            | `subscription.remainingDays`      |
| يوم                                            | day(s)                                     | `common.days`                     |
| تجديد الاشتراك                                 | Renew subscription                         | `subscription.renew`              |
| يوجد طلب تجديد قيد المراجعة                    | Renewal request under review               | `subscription.renewalUnderReview` |
| الاشتراك منتهي. يرجى التجديد                   | Subscription expired. Please renew         | `subscription.expiredMessage`     |
| مالك                                           | Owner                                      | `common.owner`                    |
| طبيب                                           | Doctor                                     | `common.doctor`                   |
| موظف                                           | Employee                                   | `common.employee`                 |
| مفعل                                           | Activated                                  | `common.activated`                |
| الصلاحية:                                      | Permission:                                | `common.permissionLabel`          |
| مريض                                           | Patients                                   | `clinic.patients`                 |
| مكتمل                                          | Completed                                  | `common.completed`                |
| منتج                                           | Products                                   | `store.productCount`              |
| مبيعات                                         | Sales                                      | `store.sales`                     |
| متابع                                          | Followers                                  | `store.followers`                 |
| عيادتي ومخازني                                 | My clinics & stores                        | `pets.myClinicsStores`            |
| عياداتي                                        | My clinics                                 | `pets.myClinics`                  |
| العيادات التي تملكها                           | Clinics you own                            | `pets.clinicsOwned`               |
| أعمل فيها                                      | Working at                                 | `pets.workingAt`                  |
| العيادات المعين فيها كطبيب                     | Clinics assigned as doctor                 | `pets.clinicsAssigned`            |
| مخازني                                         | My stores                                  | `pets.myStores`                   |
| المخازن التي تملكها                            | Stores you own                             | `pets.storesOwned`                |
| المخازن المعين فيها كموظف                      | Stores assigned as employee                | `pets.storesAssigned`             |
| لا توجد عيادات أو مخازن مفعلة                  | No active clinics or stores                | `pets.noClinicsStores`            |
| بعد الموافقة على طلباتك ستظهر لوحات التحكم هنا | Dashboards will appear here after approval | `pets.approvalPending`            |
| إضافة عيادة جديدة                              | Add new clinic                             | `pets.addClinic`                  |
| إضافة مكتب بيطري                               | Add veterinary office                      | `pets.addVetOffice`               |
| المالك:                                        | Owner:                                     | `common.ownerLabel`               |
| مفقود                                          | Lost                                       | `common.lost`                     |
| إدارة الحيوانات والمزارع                       | Manage animals and farms                   | `pets.adminHeader`                |
| حيواناتي                                       | My pets                                    | `pets.title`                      |
| الحيوانات الأليفة                              | Pets                                       | `pets.petsSection`                |
| حقول الدواجن                                   | Poultry farms                              | `pets.poultryFarms`               |
| موثق                                           | Verified                                   | `common.verified`                 |
| السعة:                                         | Capacity:                                  | `poultry.capacityLabel`           |
| الحالي:                                        | Current:                                   | `poultry.currentLabel`            |
| رقم الترخيص:                                   | License number:                            | `poultry.licenseNumber`           |
| لا يوجد حقول دواجن مسجلة                       | No poultry farms registered                | `poultry.noFarms`                 |
| لا يوجد حيوانات مسجلة                          | No pets registered                         | `pets.noPets`                     |

#### `app/(tabs)/sections.tsx` — ~5 hardcoded strings

| Text (Arabic) | English Translation | Suggested Key                 |
| ------------- | ------------------- | ----------------------------- |
| عام           | General             | `sections.category.general`   |
| أمراض         | Diseases            | `sections.category.diseases`  |
| تغذية         | Nutrition           | `sections.category.nutrition` |
| جراحة         | Surgery             | `sections.category.surgery`   |
| طوارئ         | Emergency           | `sections.category.emergency` |

#### `app/(tabs)/store.tsx`

Mostly uses `t()` — minimal hardcoded text found.

---

### 2.2 Auth & Onboarding

#### `app/auth.tsx` — ~5 hardcoded strings

| Text (Arabic)                               | English Translation             | Suggested Key               |
| ------------------------------------------- | ------------------------------- | --------------------------- |
| يجب الموافقة على اتفاقية الاستخدام للمتابعة | Must agree to terms to continue | `auth.mustAgreeTerms`       |
| حدث خطأ أثناء إرسال الطلب                   | Error sending request           | `auth.requestError`         |
| صورة الملف الشخصي (اختياري)                 | Profile photo (optional)        | `auth.profilePhotoOptional` |
| أوافق على                                   | I agree to                      | `auth.iAgreeTo`             |
| اتفاقية الاستخدام وشروط التسجيل             | Terms of use and registration   | `auth.termsTitle`           |
| (اضغط للقراءة والموافقة)                    | (Tap to read and agree)         | `auth.tapToReadTerms`       |

---

### 2.3 Consultation Screens (~15 strings)

#### `app/consultation.tsx`

| Text                                                                            | Key                        |
| ------------------------------------------------------------------------------- | -------------------------- |
| ارسل استشارتك وتفاصيل الحالة وارفع صورة او فيديو إن وجدت لنشخص الحالة بشكل دقيق | `consultation.description` |
| نوع الحيوان                                                                     | `consultation.petType`     |
| جاري الإرسال...                                                                 | `common.sending`           |

#### `app/consultation-details.tsx`

Multiple status labels, priority labels, and "الفريق الطبي" (Medical team).

#### `app/consultations-list.tsx`

Status labels, priority labels, search placeholder "البحث في الاستشارات..."

---

### 2.4 Admin Screens (~150+ strings across 15+ files)

Files with hardcoded text:

- `admin-messages.tsx` — error alerts
- `admin-search.tsx` — error alerts
- `admin-login.tsx` — role names, success/error alerts
- `admin-ai-settings.tsx` — test result alerts, AI system prompts
- `admin-dashboard.tsx` — alerts, stats labels
- `admin-approvals.tsx` — status labels, toast messages
- `admin-subscription-management.tsx` — alerts
- `admin-subscription-settings.tsx` — alerts
- `admin-ads-management.tsx` — alerts, labels
- `admin-users-list.tsx` — status labels, alerts
- `admin-clinics-management.tsx` — alerts
- `admin-pets-management.tsx` — alerts
- `admin-stores-management.tsx` — alerts
- `admin-content-manager.tsx` — alerts, labels
- `admin-consultation-details.tsx` — status labels

Common patterns: Alert.alert() with hardcoded Arabic titles and messages, status badge labels, Toast messages.

---

### 2.5 Clinic Screens (~100+ strings across 10+ files)

Files: `clinic-profile.tsx`, `clinic-system.tsx`, `clinic-registration.tsx`, `clinic-animals.tsx`, `clinic-details.tsx`, `clinic-dashboard.tsx`, `clinic-settings.tsx`, `clinic-appointments.tsx`, `clinic-animals-management.tsx`

Common patterns: Error messages, success toasts, form labels, status badges, confirmation dialogs.

---

### 2.6 Store Screens (~80+ strings across 8+ files)

Files: `cart.tsx`, `checkout.tsx`, `store-details.tsx`, `store-management.tsx`, `store-products.tsx`, `store-orders.tsx`, `store-products-management.tsx`, `add-store-product.tsx`, `add-store.tsx`

Common patterns: Cart messages, checkout flow text, order status labels, product management labels.

---

### 2.7 Pet Screens (~60+ strings across 6+ files)

Files: `add-pet.tsx`, `pet-details.tsx`, `pet-store-management.tsx`, `pet-store-settings.tsx`, `pet-category-settings.tsx`, `lost-pets-list.tsx`, `report-lost-pet.tsx`

---

### 2.8 Poultry Screens (~80+ strings across 5+ files)

Files: `poultry-farm-details.tsx`, `poultry-farm-management.tsx`, `add-poultry-farm.tsx`, `add-poultry-batch.tsx`, `poultry-management.tsx`

---

### 2.9 Job/Vacancy Screens (~40+ strings across 5 files)

Files: `job-application.tsx`, `job-details.tsx`, `job-management.tsx`, `job-vacancies.tsx`, `post-job-vacancy.tsx`

---

### 2.10 Union Screens (~60+ strings across 8+ files)

Files: `union-branches-management.tsx`, `union-branches.tsx`, `union-branch-details.tsx`, `union-general-settings.tsx`, `union-management-dashboard.tsx`, `union-notifications-settings.tsx`, `union-users-management.tsx`, `union-settings.tsx`, `vet-union.tsx`

---

### 2.11 Other Screens (~30+ strings)

Files: `messages.tsx`, `notifications.tsx`, `farm-messages.tsx`, `search.tsx`, `favorites.tsx`, `reminders.tsx`, `appointments.tsx`, `tips-list.tsx`, `vet-magazine.tsx`, `vet-books.tsx`, `contact-us.tsx`

---

### 2.12 Components (~100+ strings)

#### `components/TermsAndConditions.tsx` — ~50 strings

Full legal text including sections:

- اتفاقية الاستخدام وشروط التسجيل (Terms of use)
- أولاً: التعريفات (Definitions)
- ثانياً: طبيعة الخدمة (Nature of service)
- شروط استخدام صاحب الحيوان (Pet owner terms)
- Subsections on accounts, medical records, consultations, AI consultations, store

#### `components/ConfirmationModal.tsx`, `components/Toast.tsx`, `components/AdminTopBar.tsx`, etc.

Various hardcoded labels and default text.

---

## 3. Proposed Multi-Language File Structure

### Current (problematic):

```
providers/I18nProvider.tsx     ← Inline translations (ar, en only), flat keys
constants/translations.ts      ← Separate file (7 languages), nested keys, UNUSED
```

### Proposed Structure:

```
mobile/
├── i18n/
│   ├── index.ts                    # Re-exports and helper types
│   ├── ar.ts                       # Arabic translations (complete)
│   ├── en.ts                       # English translations (complete)
│   ├── ku.ts                       # Kurdish translations (complete)
│   └── types.ts                    # TypeScript types for translation keys
├── providers/
│   ├── I18nProvider.tsx             # Updated: imports from i18n/, supports ar/en/ku
│   └── LanguageProvider.tsx         # Updated: restricted to ar/en/ku
├── lib/
│   └── rtl-config.ts               # Unchanged
```

### File Details:

#### `i18n/types.ts` — Type-safe translation keys

```typescript
export type Language = "ar" | "en" | "ku";

export type TranslationKeys = {
  // Common
  "common.loading": string;
  "common.error": string;
  "common.success": string;
  "common.save": string;
  "common.cancel": string;
  "common.delete": string;
  "common.edit": string;
  "common.add": string;
  "common.search": string;
  "common.ok": string;
  "common.confirm": string;
  "common.back": string;
  "common.next": string;
  "common.close": string;
  "common.yes": string;
  "common.no": string;
  "common.send": string;
  "common.sending": string;
  "common.uploading": string;
  "common.download": string;
  "common.details": string;
  "common.report": string;
  "common.location": string;
  "common.map": string;
  "common.call": string;
  "common.show": string;
  "common.active": string;
  "common.inactive": string;
  "common.expired": string;
  "common.urgent": string;
  "common.verified": string;
  "common.owner": string;
  "common.doctor": string;
  "common.employee": string;
  "common.activated": string;
  "common.completed": string;
  "common.closed": string;
  "common.underReview": string;
  "common.replied": string;
  "common.premium": string;
  "common.lost": string;
  "common.forAdoption": string;
  "common.forMating": string;
  "common.expiringSoon": string;
  "common.days": string;
  "common.invalidData": string;
  // ... (800+ keys total)
};
```

#### `i18n/ar.ts` — Arabic (RTL)

```typescript
import { TranslationKeys } from "./types";

const ar: TranslationKeys = {
  "common.loading": "جاري التحميل...",
  "common.error": "حدث خطأ",
  "common.success": "تم بنجاح",
  // ... all keys
};

export default ar;
```

#### `i18n/en.ts` — English (LTR)

```typescript
import { TranslationKeys } from "./types";

const en: TranslationKeys = {
  "common.loading": "Loading...",
  "common.error": "An error occurred",
  "common.success": "Success",
  // ... all keys
};

export default en;
```

#### `i18n/ku.ts` — Kurdish (RTL)

```typescript
import { TranslationKeys } from "./types";

const ku: TranslationKeys = {
  "common.loading": "بارکردن...",
  "common.error": "هەڵەیەک ڕوویدا",
  "common.success": "سەرکەوتوو بوو",
  // ... all keys
};

export default ku;
```

#### `i18n/index.ts` — Aggregator

```typescript
import ar from "./ar";
import en from "./en";
import ku from "./ku";
import { Language, TranslationKeys } from "./types";

export const translations: Record<Language, TranslationKeys> = { ar, en, ku };
export type { Language, TranslationKeys };
```

---

## 4. Translation Key Design

### Key Naming Convention

Use **flat dot-notation keys** (matching existing I18nProvider pattern):

```
{module}.{section}.{identifier}
```

### Key Modules (organized by feature area):

| Module          | Description                             | Est. Keys |
| --------------- | --------------------------------------- | --------- |
| `common`        | Shared labels, statuses, actions        | ~60       |
| `auth`          | Login, register, account types          | ~40       |
| `onboarding`    | Welcome, intro screens                  | ~10       |
| `home`          | Home screen, welcome modal              | ~40       |
| `tabs`          | Tab bar labels                          | ~10       |
| `profile`       | Profile, settings, menu items           | ~30       |
| `pets`          | Pet management, clinics/stores tabs     | ~50       |
| `poultry`       | Poultry farm management                 | ~60       |
| `consultation`  | Consultation flow, statuses, priorities | ~30       |
| `store`         | Store, cart, checkout, orders           | ~50       |
| `clinic`        | Clinic system, registration, dashboard  | ~50       |
| `sections`      | App sections, categories                | ~20       |
| `lostPets`      | Lost pet reporting                      | ~20       |
| `admin`         | Admin dashboard, approvals, management  | ~80       |
| `job`           | Job vacancies, applications             | ~30       |
| `union`         | Vet union, branches, management         | ~50       |
| `subscription`  | Subscription management                 | ~20       |
| `roles`         | Permission/role labels                  | ~10       |
| `validation`    | Form validation messages                | ~30       |
| `premium`       | Premium membership                      | ~15       |
| `messages`      | Messaging system                        | ~20       |
| `notifications` | Notification texts                      | ~15       |
| `terms`         | Terms and conditions                    | ~50       |
| `screens`       | Screen/navigation titles                | ~50       |
| **Total**       |                                         | **~840**  |

---

## 5. References to Replace in Screens

### Replacement Pattern

**Before (hardcoded):**

```tsx
<Text>مرحباً</Text>
<Text>قيد المراجعة</Text>
Alert.alert("خطأ", "حدث خطأ أثناء إرسال الرسالة");
<TextInput placeholder="البحث في الاستشارات..." />
```

**After (internationalized):**

```tsx
<Text>{t("home.greeting")}</Text>
<Text>{t("common.underReview")}</Text>
Alert.alert(t("common.error"), t("messages.sendError"));
<TextInput placeholder={t("consultation.searchPlaceholder")} />
```

### Files Requiring Changes (by priority):

#### Priority 1 — Core User-Facing Screens (High Impact)

| File                                | Est. Replacements |
| ----------------------------------- | ----------------- |
| `app/(tabs)/index.tsx`              | ~50               |
| `app/(tabs)/profile.tsx`            | ~20               |
| `app/(tabs)/pets.tsx`               | ~80               |
| `app/(tabs)/sections.tsx`           | ~5                |
| `app/(tabs)/_layout.tsx`            | ~5                |
| `app/auth.tsx`                      | ~6                |
| `app/onboarding.tsx`                | ~3                |
| `app/consultation.tsx`              | ~5                |
| `components/TermsAndConditions.tsx` | ~50               |

#### Priority 2 — Feature Screens (Medium Impact)

| File                           | Est. Replacements |
| ------------------------------ | ----------------- |
| `app/cart.tsx`                 | ~10               |
| `app/checkout.tsx`             | ~15               |
| `app/add-pet.tsx`              | ~20               |
| `app/pet-details.tsx`          | ~15               |
| `app/consultation-details.tsx` | ~15               |
| `app/consultations-list.tsx`   | ~10               |
| `app/store-details.tsx`        | ~15               |
| `app/lost-pets-list.tsx`       | ~15               |
| `app/report-lost-pet.tsx`      | ~15               |
| `app/messages.tsx`             | ~10               |
| `app/notifications.tsx`        | ~10               |
| `app/search.tsx`               | ~5                |

#### Priority 3 — Management Screens

| File                                | Est. Replacements |
| ----------------------------------- | ----------------- |
| `app/clinic-system.tsx`             | ~20               |
| `app/clinic-registration.tsx`       | ~15               |
| `app/clinic-dashboard.tsx`          | ~10               |
| `app/clinic-settings.tsx`           | ~15               |
| `app/clinic-animals.tsx`            | ~10               |
| `app/store-management.tsx`          | ~20               |
| `app/store-orders.tsx`              | ~20               |
| `app/store-products-management.tsx` | ~15               |
| `app/add-store.tsx`                 | ~20               |
| `app/add-store-product.tsx`         | ~15               |
| `app/poultry-farm-details.tsx`      | ~25               |
| `app/poultry-management.tsx`        | ~25               |
| `app/add-poultry-farm.tsx`          | ~15               |
| `app/add-poultry-batch.tsx`         | ~15               |
| `app/job-vacancies.tsx`             | ~15               |
| `app/post-job-vacancy.tsx`          | ~20               |
| `app/job-application.tsx`           | ~15               |
| `app/pet-store-management.tsx`      | ~20               |
| `app/pet-store-settings.tsx`        | ~20               |
| `app/pet-category-settings.tsx`     | ~20               |

#### Priority 4 — Admin Screens

| File                                    | Est. Replacements |
| --------------------------------------- | ----------------- |
| `app/admin-dashboard.tsx`               | ~15               |
| `app/admin-approvals.tsx`               | ~15               |
| `app/admin-login.tsx`                   | ~10               |
| `app/admin-messages.tsx`                | ~10               |
| `app/admin-search.tsx`                  | ~10               |
| `app/admin-ai-settings.tsx`             | ~10               |
| `app/admin-ads-management.tsx`          | ~15               |
| `app/admin-subscription-management.tsx` | ~10               |
| `app/admin-subscription-settings.tsx`   | ~10               |
| `app/admin-users-list.tsx`              | ~10               |

#### Priority 5 — Union Screens

| File                                 | Est. Replacements |
| ------------------------------------ | ----------------- |
| `app/vet-union.tsx`                  | ~15               |
| `app/union-management-dashboard.tsx` | ~20               |
| `app/union-branches.tsx`             | ~10               |
| `app/union-branch-details.tsx`       | ~20               |
| `app/union-users-management.tsx`     | ~20               |
| `app/union-branches-management.tsx`  | ~15               |
| `app/union-general-settings.tsx`     | ~15               |
| `app/union-settings.tsx`             | ~10               |

---

## 6. RTL Considerations

### Languages and Direction

| Language         | Code | Direction | Script        |
| ---------------- | ---- | --------- | ------------- |
| Arabic           | `ar` | RTL       | Arabic script |
| English          | `en` | LTR       | Latin script  |
| Kurdish (Sorani) | `ku` | RTL       | Arabic script |

### RTL Implementation Status

The app already has solid RTL infrastructure:

1. **`I18nManager`** — Already used to force RTL/LTR with app restart
2. **`rtl-config.ts`** — Helper functions for dynamic RTL styles
3. **NativeWind/Tailwind** — Many screens use `isRTL` for conditional styles

### Required RTL Changes

#### A. Update `I18nProvider.tsx` to support Kurdish RTL

```typescript
// Current: only ar triggers RTL
type Language = "ar" | "en" | "ku"; // Add ku

// RTL languages set
const RTL_LANGUAGES = new Set(["ar", "ku"]);

// In setLanguage():
const shouldBeRTL = RTL_LANGUAGES.has(lang);
if (shouldBeRTL !== I18nManager.isRTL) {
  I18nManager.forceRTL(shouldBeRTL);
  I18nManager.allowRTL(shouldBeRTL);
  RNRestart.Restart();
}
```

#### B. Update `isRTL` logic

```typescript
// Current:
isRTL: language === "ar";

// Updated:
isRTL: language === "ar" || language === "ku";
```

#### C. Text Alignment Considerations

- Kurdish uses Arabic script — same alignment rules as Arabic
- All `textAlign: isRTL ? 'right' : 'left'` patterns already work for Kurdish
- Flex direction reversals already work via `isRTL` flag

#### D. Font Considerations

- Arabic and Kurdish share Arabic script — same fonts work for both
- Ensure the app's Arabic font supports Kurdish-specific characters (ڤ, ۆ, ێ, etc.)
- Test: Kurdish Sorani uses additional characters not in standard Arabic: پ, چ, ژ, ڤ, گ, ڵ, ۆ, ێ, ڕ
- If the current Arabic font does not support these, a Kurdish-compatible font (e.g., NotoSansArabic) should be added

#### E. Number Formatting

- Arabic: May use Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩)
- Kurdish: Uses Western Arabic numerals (0123456789) or Eastern Arabic
- English: Western Arabic numerals
- Consider using `Intl.NumberFormat` with the correct locale

#### F. Date Formatting

- Different calendar preferences per locale
- Use locale-aware date formatting (e.g., `toLocaleDateString(language)`)

---

## 7. Implementation Steps

### Step 1: Create the i18n directory and type definitions

- Create `mobile/i18n/types.ts` with all ~840 translation keys
- Create `mobile/i18n/index.ts` aggregator

### Step 2: Create language files

- Create `mobile/i18n/ar.ts` — Merge existing I18nProvider translations + all hardcoded Arabic text
- Create `mobile/i18n/en.ts` — Merge existing English translations + translate all new keys
- Create `mobile/i18n/ku.ts` — Merge existing Kurdish from `translations.ts` + translate all new keys

### Step 3: Update I18nProvider

- Change type from `"ar" | "en"` to `"ar" | "en" | "ku"`
- Import translations from `i18n/` instead of inline
- Update RTL logic to include Kurdish
- Update `isRTL` to `language === "ar" || language === "ku"`

### Step 4: Update LanguageProvider

- Restrict language options to `ar`, `en`, `ku` only
- Ensure Kurdish selection triggers proper RTL and translation loading

### Step 5: Replace hardcoded text in Priority 1 screens

- `(tabs)/index.tsx`, `(tabs)/profile.tsx`, `(tabs)/pets.tsx`, `(tabs)/sections.tsx`
- `auth.tsx`, `onboarding.tsx`
- `components/TermsAndConditions.tsx`

### Step 6: Replace hardcoded text in Priority 2-5 screens

- Work through each file systematically
- Pattern: find hardcoded string -> add key to all 3 language files -> replace with `t("key")`

### Step 7: Remove old `constants/translations.ts`

- All translations now live in `i18n/*.ts`
- Remove unused file to avoid confusion

### Step 8: Testing

- Test Arabic (RTL) — verify all text appears correctly
- Test English (LTR) — verify layout switches properly
- Test Kurdish (RTL) — verify Kurdish-specific characters render, RTL layout works
- Test language switching — verify app restarts and applies correct direction
- Test all screens for missing translations (keys falling back to key name)

### Step 9: String interpolation audit

- Identify dynamic strings like "الحيوان: {name}" and ensure interpolation works
- Update `t()` function to support interpolation: `t("key", { name: "value" })`

### Interpolation Enhancement for t():

```typescript
const t = (key: string, params?: Record<string, string | number>): string => {
  let text = translations[language][key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
};
```

---

## Summary

| Metric                       | Value                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------ |
| Languages                    | Arabic (ar), English (en), Kurdish (ku)                                        |
| RTL languages                | Arabic, Kurdish                                                                |
| LTR languages                | English                                                                        |
| Total translation keys       | ~840                                                                           |
| Files to modify              | 60+ screen files, 5+ components                                                |
| New files to create          | 4 (`i18n/types.ts`, `i18n/ar.ts`, `i18n/en.ts`, `i18n/ku.ts`, `i18n/index.ts`) |
| Files to update              | `I18nProvider.tsx`, `LanguageProvider.tsx`                                     |
| Files to remove              | `constants/translations.ts` (replaced by i18n/)                                |
| Estimated total replacements | ~840 hardcoded strings                                                         |
| No logic changes             | Confirmed — only text extraction and i18n wiring                               |
