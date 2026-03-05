import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";
import { ArrowLeft, Plus, Edit3, Eye, EyeOff, Trash2, Star, MapPin, Phone, Download } from "lucide-react-native";

import { useApp } from "../../providers/AppProvider";
import { trpc } from "../../lib/trpc";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button 2";
import { useI18n } from "@/providers/I18nProvider";

type Clinic = {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  email?: string | null;
  images: string[];
  rating: number | null;
  services: string[];
  workingHours: any;
  isActive: boolean;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export default function ClinicsScreen() {
  const router = useRouter();
  const { isSuperAdmin } = useApp();
  const { t } = useI18n();

  // Fetch clinics from database
  const { data, isLoading, error } = useQuery(
    trpc.clinics.getActiveList.queryOptions({
      limit: 50,
      offset: 0,
      search: "",
      city: "",
      country: "",
    })
  );
  const clinics = useMemo(() => (data as any)?.clinics, [data]);

  const handleDeleteClinic = (clinicId: number) => {
    Alert.alert(t("clinics.deleteClinic"), t("clinics.deleteClinicConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
      },
    ]);
  };

  const handleEditClinic = (clinicId: number) => {
    router.push({
      pathname: "/edit-clinic",
      params: { id: clinicId.toString() },
    });
  };

  const handleAddClinic = () => {
    router.push("/add-clinic");
  };

  const renderClinicCard = (clinic: Clinic) => {
    const clinicImage =
      clinic.images && clinic.images.length > 0
        ? clinic.images[0]
        : "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";

    return (
      <TouchableOpacity
        key={clinic.id}
        style={styles.clinicCard}
        onPress={() =>
          router.push({
            pathname: "/clinic-profile",
            params: { id: clinic.id.toString() },
          })
        }
      >
        <View style={styles.clinicCardContent}>
          <Image source={{ uri: clinicImage }} style={styles.clinicImage} />

          <View style={styles.clinicDetails}>
            <View style={styles.clinicHeader}>
              <Text style={styles.clinicName}>{clinic.name}</Text>
              {(clinic.rating || 0) >= 4.5 && (
                <View style={styles.premiumBadge}>
                  <Star size={12} color={COLORS.white} fill={COLORS.white} />
                  <Text style={styles.premiumBadgeText}>{t("common.premium")}</Text>
                </View>
              )}
            </View>

            <View style={styles.clinicInfoRow}>
              <MapPin size={14} color={COLORS.darkGray} />
              <Text style={styles.clinicInfoText} numberOfLines={2}>
                {clinic.address}
              </Text>
            </View>

            {clinic.phone && (
              <View style={styles.clinicInfoRow}>
                <Phone size={14} color={COLORS.darkGray} />
                <Text style={styles.clinicInfoText}>{clinic.phone}</Text>
              </View>
            )}

            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{clinic.rating?.toFixed(1) || "0.0"}</Text>
            </View>
          </View>
        </View>

        {isSuperAdmin && (
          <View style={styles.clinicActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleEditClinic(clinic.id);
              }}
            >
              <Edit3 size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>{t("common.edit")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteClinic(clinic.id);
              }}
            >
              <Trash2 size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>{t("common.delete")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: t("clinics.title"),
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("clinics.allRegisteredClinics")}</Text>
          <Text style={styles.headerSubtitle}>{t("clinics.browseAllClinics")}</Text>
        </View>

        {/* Add Clinic Button - Only for Super Admin */}
        {isSuperAdmin && (
          <View style={styles.addSection}>
            <Button
              title="إضافة عيادة جديدة"
              onPress={handleAddClinic}
              type="primary"
              size="medium"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.addButton}
            />
          </View>
        )}

        {/* Clinics List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>العيادات المتاحة ({clinics?.length})</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>جاري تحميل العيادات...</Text>
            </View>
          ) : clinics?.length > 0 ? (
            clinics.map((clinic) => renderClinicCard(clinic))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد عيادات مسجلة</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    // textAlign: "left",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    // textAlign: "left",
  },
  addSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  addButton: {
    width: "100%",
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    // textAlign: "left",
    marginBottom: 15,
  },
  clinicCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clinicCardContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  clinicImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  clinicDetails: {
    flex: 1,
    marginRight: 16,
  },
  clinicHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  premiumBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  premiumBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  clinicInfoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  clinicInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  ratingContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  clinicActions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 10,
  },
});
