import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Linking,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useLocalSearchParams, router } from "expo-router";
import Button from "../components/Button";
import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  Navigation,
} from "lucide-react-native";
import { LostPet } from "../types";
import { mockLostPets } from "../mocks/data";

export default function LostPetScreen() {
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [pet, setPet] = useState<LostPet | null>(null);

  useEffect(() => {
    if (id) {
      const foundPet = mockLostPets.find((p) => p.id === id);
      if (foundPet) {
        setPet(foundPet);
      }
    }
  }, [id]);

  const handleCall = () => {
    if (pet && pet.contactInfo.phone) {
      Linking.openURL(`tel:${pet.contactInfo.phone}`);
    }
  };

  const handleEmail = () => {
    if (pet && pet.contactInfo.email) {
      Linking.openURL(`mailto:${pet.contactInfo.email}`);
    }
  };

  const handleReportSighting = () => {
    Alert.alert(
      "الإبلاغ عن مشاهدة",
      "هل شاهدت هذا الحيوان؟ سيتم التواصل مع صاحبه.",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "نعم، أبلغ", onPress: () => console.log("Report sighting") },
      ]
    );
  };

  const handleShowLocation = () => {
    if (pet) {
      router.push({
        pathname: "/map-location",
        params: {
          mode: "directions",
          name: `موقع فقدان ${pet.name}`,
          address: pet.lastSeen.location,
          latitude: "24.7136", // Mock coordinates - in real app would come from pet data
          longitude: "46.6753",
        },
      });
    }
  };

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>الحيوان غير موجود</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: pet.image }} style={styles.petImage} />
          <View style={styles.lostBadge}>
            <AlertTriangle size={16} color={COLORS.white} />
            <Text style={styles.lostBadgeText}>مفقود</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petType}>
            {pet.type} {pet.breed ? `- ${pet.breed}` : ""}
          </Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>آخر مشاهدة</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>الموقع</Text>
              <View style={styles.locationRow}>
                <Text style={styles.infoValue}>{pet.lastSeen.location}</Text>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={handleShowLocation}
                >
                  <Navigation size={16} color={COLORS.primary} />
                  <Text style={styles.locationButtonText}>عرض على الخريطة</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>التاريخ</Text>
              <Text style={styles.infoValue}>
                {new Date(pet.lastSeen.date).toLocaleDateString("ar-SA")}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Phone size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>معلومات الاتصال</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>الاسم</Text>
              <Text style={styles.infoValue}>{pet.contactInfo.name}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>الهاتف</Text>
              <Text style={styles.infoValue}>{pet.contactInfo.phone}</Text>
            </View>

            {pet.contactInfo.email && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>البريد الإلكتروني</Text>
                <Text style={styles.infoValue}>{pet.contactInfo.email}</Text>
              </View>
            )}
          </View>

          {pet.description && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AlertTriangle size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>وصف</Text>
              </View>

              <Text style={styles.description}>{pet.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Phone size={20} color={COLORS.white} />
            <Text style={styles.callButtonText}>اتصال بالمالك</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emailButton} onPress={handleEmail}>
            <Mail size={20} color={COLORS.primary} />
            <Text style={styles.emailButtonText}>إرسال بريد</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.reportButton}
          onPress={handleReportSighting}
        >
          <Text style={styles.reportButtonText}>الإبلاغ عن مشاهدة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  petImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  lostBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  lostBadgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 200,
  },
  petName: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "right",
  },
  petType: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 24,
    textAlign: "right",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginRight: 8,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: "right",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "right",
  },
  locationRow: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  locationButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 24,
    textAlign: "right",
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  callButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  callButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  emailButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emailButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  reportButton: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#E0F2FE",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  reportButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  notFoundText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
    color: COLORS.darkGray,
  },
});
