import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Image } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import Button from "../components/Button";
import { ArrowRight, Upload, MapPin, Phone, Mail, Clock, Eye, EyeOff, Edit } from "lucide-react-native";
import { router } from "expo-router";
import { Stack } from "expo-router";
import { trpc } from "../lib/trpc";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";

interface StoreFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseImage: string;
  workingHours: string;
}

export default function AddStoreScreen() {
  const { t, isRTL } = useI18n();
  const { hasAdminAccess } = useApp();
  const [showSubscription, setShowSubscription] = useState(false);
  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    licenseNumber: "",
    licenseImage: "",
    workingHours: "",
  });

  const createStoreMutation = useMutation(
    trpc.stores.create.mutationOptions({
      onSuccess: (data) => {
        Alert.alert("نجح", data.message, [
          {
            text: "موافق",
            onPress: () => router.back(),
          },
        ]);
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message);
      },
    })
  );

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert("خطأ", "اسم المذخر مطلوب");
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert("خطأ", "العنوان مطلوب");
      return;
    }
    if (!formData.licenseNumber.trim()) {
      Alert.alert("خطأ", "رقم الترخيص مطلوب");
      return;
    }
    if (!formData.licenseImage.trim()) {
      Alert.alert("خطأ", "صورة الترخيص مطلوبة");
      return;
    }

    // setIsSubmitting(true);
    try {
      await createStoreMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        licenseNumber: formData.licenseNumber,
        licenseImage: formData.licenseImage,
        workingHours: formData.workingHours,
      });
    } catch (error) {
      console.error("Error creating store:", error);
    } finally {
      // setIsSubmitting(false);
    }
  };

  const handleImageUpload = async () => {
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
        setFormData((prev) => ({
          ...prev,
          licenseImage: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء اختيار الصورة");
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
              <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
                <Upload size={24} color={COLORS.primary} />
                <Text style={styles.uploadText}>{formData.licenseImage ? "تم رفع الصورة" : "رفع صورة الترخيص"}</Text>
              </TouchableOpacity>
              {formData.licenseImage && <Image source={{ uri: formData.licenseImage }} style={styles.previewImage} />}
            </View>
          </View>

          {/* Admin Controls for Subscription */}
          {hasAdminAccess && (
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
                {hasAdminAccess && (
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
