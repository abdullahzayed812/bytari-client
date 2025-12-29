import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { Save, X, MapPin, Phone, Mail, ExternalLink } from "lucide-react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { ImageUploader } from "@/components/ImageUploader";

interface UnionInfo {
  name: string;
  description: string;
  logoUrl: string;
  establishedYear: string;
  memberCount: string;
  phone1: string;
  phone2: string;
  email: string;
  website: string;
  address: string;
  services: {
    id: string;
    title: string;
    description: string;
    color: string;
  }[];
}

export default function EditUnionMainScreen() {
  const { t, isRTL } = useI18n();
  const { isSuperAdmin } = useApp();
  const router = useRouter();

  const { data: initialData, isLoading: isFetching } = useQuery(trpc.union.main.get.queryOptions());
  const mutation = useMutation(trpc.union.main.update.mutationOptions());

  const [unionInfo, setUnionInfo] = useState<UnionInfo | null>(null);

  useEffect(() => {
    if (initialData) {
      setUnionInfo({
        ...initialData,
        establishedYear: initialData.establishedYear?.toString() || "",
        memberCount: initialData.memberCount?.toString() || "",
        services: initialData.services ? JSON.parse(initialData.services) : [],
      });
    }
  }, [initialData]);

  const [isLoading, setIsLoading] = useState(false);

  if (!isSuperAdmin) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "تعديل معلومات النقابة",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
          }}
        />
        <View style={styles.noPermissionContainer}>
          <Text style={styles.noPermissionText}>ليس لديك صلاحية للوصول إلى هذه الصفحة</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleSave = async () => {
    if (!unionInfo) return;
    setIsLoading(true);
    try {
      await mutation.mutateAsync({
        ...unionInfo,
        establishedYear: parseInt(unionInfo.establishedYear, 10) || 0,
        memberCount: parseInt(unionInfo.memberCount, 10) || 0,
        services: JSON.stringify(unionInfo.services),
      });

      Alert.alert("تم الحفظ", "تم حفظ معلومات النقابة بنجاح", [
        {
          text: "موافق",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceUpdate = (serviceId: string, field: "title" | "description" | "color", value: string) => {
    setUnionInfo((prev) => ({
      ...prev,
      services: prev.services.map((service) => (service.id === serviceId ? { ...service, [field]: value } : service)),
    }));
  };

  const addNewService = () => {
    const newService = {
      id: Date.now().toString(),
      title: "خدمة جديدة",
      description: "وصف الخدمة الجديدة",
      color: "#6B7280",
    };

    setUnionInfo((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }));
  };

  const removeService = (serviceId: string) => {
    Alert.alert("حذف الخدمة", "هل أنت متأكد من حذف هذه الخدمة؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          setUnionInfo((prev) => ({
            ...prev,
            services: prev.services.filter((service) => service.id !== serviceId),
          }));
        },
      },
    ]);
  };

  if (isFetching || !unionInfo) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "تعديل معلومات النقابة الأساسية",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isLoading}>
              <Save size={20} color={COLORS.white} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* معلومات أساسية */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>

          {/* الشعار */}
          <View style={styles.logoSection}>
            <Text style={styles.fieldLabel}>شعار النقابة</Text>
            <ImageUploader
              onUploadComplete={(url) => setUnionInfo((prev) => ({ ...prev, logoUrl: url }))}
              imageUri={unionInfo.logoUrl}
            />
          </View>

          {/* اسم النقابة */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>اسم النقابة</Text>
            <TextInput
              style={styles.input}
              value={unionInfo.name}
              onChangeText={(text) => setUnionInfo((prev) => ({ ...prev, name: text }))}
              placeholder="اسم النقابة"
            />
          </View>

          {/* الوصف */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>وصف النقابة</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={unionInfo.description}
              onChangeText={(text) => setUnionInfo((prev) => ({ ...prev, description: text }))}
              placeholder="وصف النقابة"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* سنة التأسيس */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>سنة التأسيس</Text>
            <TextInput
              style={styles.input}
              value={unionInfo.establishedYear}
              onChangeText={(text) => setUnionInfo((prev) => ({ ...prev, establishedYear: text }))}
              placeholder="سنة التأسيس"
              keyboardType="numeric"
            />
          </View>

          {/* عدد الأعضاء */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>عدد الأعضاء</Text>
            <TextInput
              style={styles.input}
              value={unionInfo.memberCount}
              onChangeText={(text) => setUnionInfo((prev) => ({ ...prev, memberCount: text }))}
              placeholder="عدد الأعضاء"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* معلومات الاتصال */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الاتصال</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>الهاتف الأول</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputField}
                value={unionInfo.phone1}
                onChangeText={(text) => setUnionInfo((prev) => ({ ...prev, phone1: text }))}
                placeholder="الهاتف الأول"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>الهاتف الثاني</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputField}
                value={unionInfo.phone2}
                onChangeText={(text) => setUnionInfo((prev) => ({ ...prev, phone2: text }))}
                placeholder="الهاتف الثاني"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>البريد الإلكتروني</Text>
            <View style={styles.inputWithIcon}>
              <Mail size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputField}
                value={unionInfo.email}
                onChangeText={(text) => setUnionInfo((prev) => ({ ...prev, email: text }))}
                placeholder="البريد الإلكتروني"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>الموقع الإلكتروني</Text>
            <View style={styles.inputWithIcon}>
              <ExternalLink size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputField}
                value={unionInfo.website}
                onChangeText={(text) => setUnionInfo((prev) => ({ ...prev, website: text }))}
                placeholder="الموقع الإلكتروني"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>العنوان</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={COLORS.darkGray} />
              <TextInput
                style={[styles.inputField, styles.textArea]}
                value={unionInfo.address}
                onChangeText={(text) => setUnionInfo((prev) => ({ ...prev, address: text }))}
                placeholder="العنوان الكامل"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* الخدمات */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>خدمات النقابة</Text>
            <TouchableOpacity style={styles.addServiceButton} onPress={addNewService}>
              <Text style={styles.addServiceText}>+ إضافة خدمة</Text>
            </TouchableOpacity>
          </View>

          {unionInfo.services.map((service, index) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceNumber}>الخدمة {index + 1}</Text>
                <TouchableOpacity onPress={() => removeService(service.id)} style={styles.removeServiceButton}>
                  <X size={16} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>عنوان الخدمة</Text>
                <TextInput
                  style={styles.input}
                  value={service.title}
                  onChangeText={(text) => handleServiceUpdate(service.id, "title", text)}
                  placeholder="عنوان الخدمة"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>وصف الخدمة</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={service.description}
                  onChangeText={(text) => handleServiceUpdate(service.id, "description", text)}
                  placeholder="وصف الخدمة"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>لون الخدمة</Text>
                <View style={styles.colorPicker}>
                  <View style={[styles.colorPreview, { backgroundColor: service.color }]} />
                  <TextInput
                    style={styles.colorInput}
                    value={service.color}
                    onChangeText={(text) => handleServiceUpdate(service.id, "color", text)}
                    placeholder="#000000"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* أزرار الحفظ والإلغاء */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveActionButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Save size={20} color={COLORS.white} />
            <Text style={styles.saveActionText}>{isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.cancelActionButton]}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <X size={20} color={COLORS.darkGray} />
            <Text style={styles.cancelActionText}>إلغاء</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noPermissionText: {
    fontSize: 18,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: COLORS.success || "#28a745",
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    textAlign: "right",
  },
  textArea: {
    minHeight: 80,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
  },
  inputField: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "right",
  },
  logoSection: {
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  logoPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  uploadText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  addServiceButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addServiceText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  serviceCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  removeServiceButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#FEE2E2",
  },
  colorPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  colorInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    textAlign: "left",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  saveActionButton: {
    backgroundColor: COLORS.primary,
  },
  cancelActionButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  saveActionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelActionText: {
    color: COLORS.darkGray,
    fontSize: 16,
    fontWeight: "bold",
  },
});
