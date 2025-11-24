import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useToastContext } from "../providers/ToastProvider";
import Button from "../components/Button";
import { Upload, MapPin, Phone, Mail, Clock, Eye, EyeOff, Edit, School } from "lucide-react-native";
import { router } from "expo-router";
import { Stack } from "expo-router";
import { queryClient, trpc } from "../lib/trpc";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";

interface StoreFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  category: string;
  licenseNumber: string;
  licenseImage: string;
  identityImage: string;
  workingHours: string;
  facebook: string;
  instagram: string;
  whatsapp: string;
  website: string;
}

export default function AddStoreScreen() {
  const { isRTL } = useI18n();
  const { isSuperAdmin, user } = useApp();
  const { showToast } = useToastContext();

  const [showSubscription, setShowSubscription] = useState(false);
  const [formData, setFormData] = useState<StoreFormData>({
    name: "متجر الرعاية للحيوانات الأليفة",
    description: "نوفر جميع مستلزمات الحيوانات الأليفة من طعام، أدوات عناية، ألعاب، وأدوية بيطرية بأفضل الأسعار.",
    address: "شارع التحلية، حي الروضة، جدة، المملكة العربية السعودية",
    phone: "+966500112233",
    email: "info@petcarestore.sa",
    category: "متجر مستلزمات حيوانات",
    licenseNumber: "STORE-2025-98765",
    licenseImage: "https://example.com/store-license.jpg",
    identityImage: "https://bytari.com/media/identity-image.png",
    workingHours: "من السبت إلى الخميس: 10:00 صباحًا - 10:00 مساءً",
    facebook: "https://facebook.com/mohamed-ali",
    instagram: "https://instagram.com/mohamed-ali",
    whatsapp: "07993322113",
    website: "https://bytari.com",
  });

  const createStoreMutation = useMutation(trpc.stores.create.mutationOptions({}));

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast({ type: "error", message: "اسم المذخر مطلوب" });
      return;
    }
    if (!formData.address.trim()) {
      showToast({ type: "error", message: "العنوان مطلوب" });
      return;
    }
    if (!formData.category.trim()) {
      showToast({ type: "error", message: "الفئة مطلوبة" });
      return;
    }
    if (!formData.licenseNumber.trim()) {
      showToast({ type: "error", message: "رقم الترخيص مطلوب" });
      return;
    }
    if (!formData.licenseImage.trim()) {
      showToast({ type: "error", message: "صورة الترخيص مطلوبة" });
      return;
    }

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        category: formData.category,
        licenseNumber: formData.licenseNumber,
        licenseImage: formData.licenseImage,
        identityImage: formData.identityImage,
        workingHours: formData.workingHours,
        facebook: formData.facebook,
        instagram: formData.instagram,
        whatsapp: formData.whatsapp,
        website: formData.website,
      };

      // ✅ Add adminId only if user has admin access
      if (isSuperAdmin && user?.id) {
        payload.adminId = user.id;
      }

      createStoreMutation.mutate(payload, {
        onSuccess: (data) => {
          showToast({ type: "success", message: data.message });
          queryClient.invalidateQueries(trpc.content.stores.list.queryKey);
          router.back();
        },
        onError: (error) => {
          showToast({ type: "error", message: error.message });
        },
      });
    } catch (error) {
      console.error("Error creating store:", error);
      showToast({ type: "error", message: "حدث خطأ أثناء إرسال الطلب" });
    }
  };

  const handleImageUpload = async (type: "identity" | " license") => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showToast({ type: "error", message: "نحتاج إلى إذن للوصول إلى الصور" });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData((prev) => ({
          ...prev,
          ...(type === "identity" ? { identityImage: result.assets[0].uri } : { licenseImage: result.assets[0].uri }),
        }));
        showToast({ type: "success", message: "تم رفع الصورة بنجاح" });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showToast({ type: "error", message: "حدث خطأ أثناء اختيار الصورة" });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "إضافة مذخر بيطري",
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات المذخر</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>اسم المذخر *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                placeholder="أدخل اسم المذخر"
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الوصف</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                placeholder="وصف المذخر والخدمات المقدمة"
                multiline
                numberOfLines={3}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>العنوان *</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={formData.address}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, address: text }))}
                  placeholder="العنوان الكامل للمذخر"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات التواصل</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>رقم الهاتف</Text>
              <View style={styles.inputWithIcon}>
                <Phone size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={formData.phone}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
                  placeholder="رقم الهاتف"
                  keyboardType="phone-pad"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <View style={styles.inputWithIcon}>
                <Mail size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={formData.email}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                  placeholder="البريد الإلكتروني"
                  keyboardType="email-address"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الفئة *</Text>
              <View style={styles.inputWithIcon}>
                <School size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={formData.category}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, category: text }))}
                  placeholder="الفئة المتعلق بها المتجر"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ساعات العمل</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color={COLORS.darkGray} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={formData.workingHours}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, workingHours: text }))}
                  placeholder="مثال: السبت - الخميس: 8:00 ص - 10:00 م"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الموقع الإلكتروني</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.inputWithIconText}
                  value={formData.website}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, website: text }))}
                  placeholder="موقع العيادة الإكتروني"
                  placeholderTextColor={COLORS.darkGray}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>صفحة الفيسبوك</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.inputWithIconText}
                  value={formData.facebook}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, facebook: text }))}
                  placeholder="رابط صفحة فيسبوك"
                  placeholderTextColor={COLORS.darkGray}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>صفحة الانستجرام</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.inputWithIconText}
                  value={formData.instagram}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, instagram: text }))}
                  placeholder="رابط سفحة انستجرام"
                  placeholderTextColor={COLORS.darkGray}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>رقم واتساب</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.inputWithIconText}
                  value={formData.whatsapp}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, whatsapp: text }))}
                  placeholder="رقم تواصل واتساب"
                  placeholderTextColor={COLORS.darkGray}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات الترخيص</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>رقم الترخيص *</Text>
              <TextInput
                style={styles.input}
                value={formData.licenseNumber}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, licenseNumber: text }))}
                placeholder="رقم ترخيص المذخر"
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>صورة الترخيص *</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={() => handleImageUpload(" license")}>
                <Upload size={24} color={COLORS.primary} />
                <Text style={styles.uploadText}>{formData.licenseImage ? "تم رفع الصورة" : "رفع صورة الترخيص"}</Text>
              </TouchableOpacity>
              {formData.licenseImage && <Image source={{ uri: formData.licenseImage }} style={styles.previewImage} />}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>صورة الهوية *</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={() => handleImageUpload("identity")}>
                <Upload size={24} color={COLORS.primary} />
                <Text style={styles.uploadText}>{formData.identityImage ? "تم رفع الصورة" : "رفع صورة الترخيص"}</Text>
              </TouchableOpacity>
              {formData.identityImage && <Image source={{ uri: formData.identityImage }} style={styles.previewImage} />}
            </View>
          </View>

          {/* Admin Controls for Subscription */}
          {isSuperAdmin && (
            <View style={styles.adminControls}>
              <TouchableOpacity style={styles.adminButton} onPress={() => setShowSubscription(!showSubscription)}>
                {showSubscription ? (
                  <EyeOff size={20} color={COLORS.primary} />
                ) : (
                  <Eye size={20} color={COLORS.primary} />
                )}
                <Text style={styles.adminButtonText}>
                  {showSubscription ? "إخفاء معلومات الاشتراك" : "إظهار معلومات الاشتراك"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Subscription Info - Only shown if admin enables it */}
          {showSubscription && (
            <View style={styles.subscriptionInfo}>
              <View style={styles.subscriptionHeader}>
                <Text style={styles.subscriptionTitle}>معلومات الاشتراك</Text>
                {isSuperAdmin && (
                  <TouchableOpacity style={styles.editSubscriptionButton}>
                    <Edit size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.subscriptionText}>• الاشتراك الشهري: 25 دولار</Text>
              <Text style={styles.subscriptionText}>• يتضمن: عرض المذخر في التطبيق، إضافة المنتجات، إدارة المخزون</Text>
              <Text style={styles.subscriptionText}>• سيتم تفعيل المذخر بعد الموافقة على الطلب ودفع الاشتراك</Text>
            </View>
          )}

          <Button
            title={createStoreMutation.isPending ? "جاري الإرسال..." : "إرسال طلب الإضافة"}
            onPress={handleSubmit}
            disabled={createStoreMutation.isPending}
            style={styles.submitButton}
          />
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
  content: {
    padding: 16,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
  },
  inputWithIconText: {
    flex: 1,
    borderWidth: 0,
    marginRight: 8,
  },
  uploadButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    backgroundColor: COLORS.gray,
  },
  uploadText: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 8,
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  adminControls: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  adminButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: COLORS.lightBlue,
    borderRadius: 8,
  },
  adminButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginRight: 8,
    textAlign: "right",
  },
  subscriptionInfo: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  subscriptionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "right",
  },
  editSubscriptionButton: {
    padding: 4,
  },
  subscriptionText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: "right",
  },
  submitButton: {
    marginBottom: 20,
  },
});
