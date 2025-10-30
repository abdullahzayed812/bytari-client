import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Heart,
  User,
  Palette,
  Weight,
  Ruler,
} from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { mockLostPets } from "../mocks/data";

const { width: screenWidth } = Dimensions.get("window");

export default function AdoptionPetDetailsScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { id, type } = useLocalSearchParams<{
    id: string;
    type: "adoption" | "breeding";
  }>();
  const [isFavorite, setIsFavorite] = useState(false);

  // Find the pet by ID
  const pet = mockLostPets.find((p) => p.id === id);

  if (!pet) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Pet Not Found" }} />
        <Text>Pet not found</Text>
      </View>
    );
  }

  const handleContact = () => {
    const actionType = type === "adoption" ? "التبني" : "التزاوج";
    Alert.alert(
      "اتصال بالمالك",
      `هل تريد الاتصال بمالك ${pet.name} لـ${actionType}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "اتصال",
          onPress: () => console.log(`Contacting owner for ${actionType}`),
        },
      ]
    );
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    console.log(
      `${isFavorite ? "Removed from" : "Added to"} favorites: ${pet.name}`
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: pet.name,
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTintColor: COLORS.black,
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleFavorite}
              style={styles.favoriteHeaderButton}
            >
              <Heart
                size={24}
                color={isFavorite ? "#EF4444" : COLORS.darkGray}
                fill={isFavorite ? "#EF4444" : "transparent"}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Pet Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: pet.image }} style={styles.petImage} />

          {/* Status Badge */}
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.badge,
                type === "adoption"
                  ? styles.adoptionBadge
                  : styles.breedingBadge,
              ]}
            >
              <Text style={styles.badgeText}>
                {type === "adoption" ? "للتبني" : "للتزاوج"}
              </Text>
            </View>
          </View>
        </View>

        {/* Pet Basic Info */}
        <View style={styles.section}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petType}>{t(`pets.types.${pet.type}`)}</Text>
        </View>

        {/* Pet Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الحيوان</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar size={20} color="#10B981" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>العمر</Text>
              <Text style={styles.detailValue}>
                {Math.floor(Math.random() * 5) + 1} سنوات
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <User size={20} color="#10B981" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>الجنس</Text>
              <Text style={styles.detailValue}>
                {Math.random() > 0.5 ? "ذكر" : "أنثى"}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Palette size={20} color="#10B981" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>اللون</Text>
              <Text style={styles.detailValue}>{pet.color}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Weight size={20} color="#10B981" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>الوزن</Text>
              <Text style={styles.detailValue}>
                {Math.floor(Math.random() * 20) + 5} كيلو
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MapPin size={20} color="#10B981" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>الموقع</Text>
              <Text style={styles.detailValue}>{pet.lastSeen.location}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الوصف</Text>
          <Text style={styles.description}>
            {type === "adoption"
              ? `${pet.name} حيوان أليف محبوب ومدرب جيداً، يبحث عن عائلة محبة لتوفير له بيت دافئ وملئ بالحب والرعاية.`
              : `${pet.name} حيوان أص��ل وصحي، مناسب للتزاوج. يتمتع بصحة ممتازة وسلالة نقية.`}
          </Text>
        </View>

        {/* Owner Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات المالك</Text>

          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <User size={24} color={COLORS.white} />
            </View>
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{pet.contactInfo.name}</Text>
              <Text style={styles.ownerLocation}>{pet.lastSeen.location}</Text>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContact}
            >
              <Phone size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.contactActionButton}
          onPress={handleContact}
        >
          <Phone size={20} color={COLORS.white} />
          <Text style={styles.contactActionText}>
            {type === "adoption" ? "اتصال للتبني" : "اتصال للتزاوج"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  favoriteHeaderButton: {
    padding: 8,
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  petImage: {
    width: screenWidth,
    height: 300,
    resizeMode: "cover",
  },
  badgeContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  adoptionBadge: {
    backgroundColor: "#10B981",
  },
  breedingBadge: {
    backgroundColor: "#8B5CF6",
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 4,
  },
  petType: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.darkGray,
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    padding: 12,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 2,
  },
  ownerLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSpacing: {
    height: 100,
  },
  actionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  contactActionButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  contactActionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
