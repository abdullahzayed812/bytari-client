import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Plus, Stethoscope } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";

export default function AddVetStoreScreen() {
  const { t } = useI18n();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    ownerEmail: "",
    phone: "",
    address: "",
    city: "",
    description: "",
    specialties: "",
  });

  const handleBack = () => {
    router.back();
  };

  const handleCreate = () => {
    if (!formData.name || !formData.ownerName || !formData.ownerEmail) {
      Alert.alert(t("common.error"), t("validation.required"));
      return;
    }

    Alert.alert(t("addVetStore.title"), t("addVetStore.confirmCreate"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("addVetStore.create"),
        onPress: () => {
          console.log("New vet store created:", formData);
          router.back();
        },
      },
    ]);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t("addVetStore.title"),
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" as const },
        }}
      />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("addVetStore.title")}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Stethoscope size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>{t("addVetStore.storeInfo")}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addVetStore.storeName")}</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => updateField("name", value)}
                placeholder={t("addVetStore.enterStoreName")}
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addVetStore.ownerDoctorName")}</Text>
              <TextInput
                style={styles.input}
                value={formData.ownerName}
                onChangeText={(value) => updateField("ownerName", value)}
                placeholder={t("addVetStore.enterOwnerName")}
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addVetStore.emailRequired")}</Text>
              <TextInput
                style={styles.input}
                value={formData.ownerEmail}
                onChangeText={(value) => updateField("ownerEmail", value)}
                placeholder={t("auth.emailLabel")}
                placeholderTextColor={COLORS.darkGray}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("common.phone")}</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => updateField("phone", value)}
                placeholder={t("addClinic.enterPhone")}
                placeholderTextColor={COLORS.darkGray}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("common.address")}</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(value) => updateField("address", value)}
                placeholder={t("addClinic.enterAddress")}
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addVetStore.city")}</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(value) => updateField("city", value)}
                placeholder={t("addVetStore.enterCity")}
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addVetStore.specialties")}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.specialties}
                onChangeText={(value) => updateField("specialties", value)}
                placeholder={t("addVetStore.enterSpecialties")}
                placeholderTextColor={COLORS.darkGray}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addVetStore.storeDesc")}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => updateField("description", value)}
                placeholder={t("addVetStore.enterStoreDesc")}
                placeholderTextColor={COLORS.darkGray}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <Text style={styles.requiredNote}>{t("addVetStore.requiredFields")}</Text>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Plus size={20} color={COLORS.white} />
            <Text style={styles.createButtonText}>{t("addVetStore.createVetStore")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    textAlign: "left",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  requiredNote: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "left",
    marginTop: 8,
  },
  bottomActions: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  createButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
});
