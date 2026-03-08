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
  ActivityIndicator,
  Linking,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Calendar, MapPin, Phone, Heart, User, Palette, Weight, Award } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/AppProvider";
import { useI18n } from "@/providers/I18nProvider";

const { width: screenWidth } = Dimensions.get("window");

export default function AdoptionPetDetailsScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id, type } = useLocalSearchParams<{
    id: string;
    type: "adoption" | "breeding";
  }>();
  const { user } = useApp();
  const [isFavorite, setIsFavorite] = useState(false);

  const { data, isLoading, error, refetch } = useQuery(
    trpc.pets.getAdoptionBreedingPetDetails.queryOptions({
      id: parseInt(id || "0"),
      type: type as "adoption" | "breeding",
    })
  );

  const pet = data?.pet;
  const isOwner = user && pet && user?.id === pet?.ownerId;

  const closeAdoptionMutation = useMutation(trpc.pets.closeAdoptionListing.mutationOptions());
  const closeBreedingMutation = useMutation(trpc.pets.closeBreedingListing.mutationOptions());

  const getAdoptionStatus = (pet: any) => {
    if (pet.isClosedByOwner) {
      return { text: t("common.closed"), color: COLORS.darkGray };
    }
    if (pet.isAvailable) {
      return { text: type === "adoption" ? t("common.forAdoption") : t("common.forMating"), color: type === "adoption" ? "#10B981" : "#8B5CF6" };
    }
    return { text: t("adoptionPet.unavailable"), color: COLORS.darkGray };
  };

  const handleCloseListing = () => {
    if (!isOwner || !pet) return;

    const mutation = type === "adoption" ? closeAdoptionMutation : closeBreedingMutation;
    const petId = pet.id;

    Alert.alert(t("adoptionPet.confirmClose"), t("adoptionPet.confirmCloseMsg"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("adoptionPet.yesClose"),
        onPress: () => {
          mutation.mutate(
            { petId, ownerId: user.id },
            {
              onSuccess: () => {
                Alert.alert(t("adoptionPet.closedTitle"), t("adoptionPet.closedMsg"));
                refetch();
                queryClient.invalidateQueries(trpc.pets.getApproved.queryKey);
              },
              onError: (err) => {
                Alert.alert(t("common.error"), t("adoptionPet.closeError") + err.message);
              },
            }
          );
        },
      },
    ]);
  };

  const handleContact = () => {
    if (!pet) return;

    Alert.alert(t("adoptionPet.contactTitle"), t(type === "adoption" ? "adoptionPet.contactConfirmAdoption" : "adoptionPet.contactConfirmBreeding").replace("{name}", pet.name), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.call"),
        onPress: () => {
          if (pet.contactInfo.phone) {
            Linking.openURL(`tel:${pet.contactInfo.phone}`);
          }
        },
      },
    ]);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: t("common.loading") }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t("common.loadingDetails")}</Text>
        </View>
      </View>
    );
  }

  if (error || !pet) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: t("common.error") }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t("adoptionPet.notFound")}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t("common.back")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getGenderText = (gender: string) => {
    return gender === "male" ? t("adoptionPet.male") : gender === "female" ? t("adoptionPet.female") : t("adoptionPet.genderUnknown");
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleFavorite} style={styles.favoriteHeaderButton}>
              <Heart
                size={24}
                color={isFavorite ? "#EF4444" : COLORS.darkGray}
                fill={isFavorite ? "#EF4444" : "transparent"}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Pet Image */}
        <View style={styles.imageContainer}>
          {pet.images?.[0] && <Image source={{ uri: pet.image || pet.images?.[0] }} style={styles.petImage} />}

          {/* Status Badge */}
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: getAdoptionStatus(pet).color }]}>
              <Text style={styles.badgeText}>{getAdoptionStatus(pet).text}</Text>
            </View>
          </View>

          {/* Price Badge */}
          {pet.price && pet.price > 0 && (
            <View style={styles.priceBadgeContainer}>
              <View style={styles.priceBadge}>
                <Award size={14} color={COLORS.white} />
                <Text style={styles.priceBadgeText}>{pet.price} {t("adoptionPet.currency")}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Pet Basic Info */}
        <View style={styles.section}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petType}>
            {`${pet.type}`} {pet.breed ? `- ${pet.breed}` : ""}
          </Text>
        </View>

        {/* Pet Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("adoptionPet.petInfo")}</Text>

          {pet.age && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Calendar size={20} color="#10B981" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t("adoptionPet.age")}</Text>
                <Text style={styles.detailValue}>{pet.age} {t("adoptionPet.ageUnit")}</Text>
              </View>
            </View>
          )}

          {pet.gender && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <User size={20} color="#10B981" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t("adoptionPet.gender")}</Text>
                <Text style={styles.detailValue}>{getGenderText(pet.gender)}</Text>
              </View>
            </View>
          )}

          {pet.color && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Palette size={20} color="#10B981" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t("adoptionPet.color")}</Text>
                <Text style={styles.detailValue}>{pet.color}</Text>
              </View>
            </View>
          )}

          {pet.weight && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Weight size={20} color="#10B981" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t("adoptionPet.weight")}</Text>
                <Text style={styles.detailValue}>{pet.weight} {t("adoptionPet.weightUnit")}</Text>
              </View>
            </View>
          )}

          {pet.location && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MapPin size={20} color="#10B981" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t("common.location")}</Text>
                <Text style={styles.detailValue}>{pet.location}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        {pet.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("common.description")}</Text>
            <Text style={styles.description}>{pet.description}</Text>
          </View>
        )}

        {/* Breeding Specific Info */}
        {type === "breeding" && (
          <>
            {pet.pedigree && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("adoptionPet.pedigree")}</Text>
                <Text style={styles.description}>{pet.pedigree}</Text>
              </View>
            )}

            {pet.healthCertificates && pet.healthCertificates.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("adoptionPet.healthCerts")}</Text>
                {pet.healthCertificates.map((cert: string, index: number) => (
                  <Text key={index} style={styles.certificateText}>
                    • {cert}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}

        {/* Special Requirements */}
        {pet.specialRequirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("adoptionPet.specialReqs")}</Text>
            <Text style={styles.description}>{pet.specialRequirements}</Text>
          </View>
        )}

        {/* Owner Info */}
        {!pet.isClosedByOwner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("adoptionPet.ownerInfo")}</Text>

            <View style={styles.ownerCard}>
              <View style={styles.ownerAvatar}>
                <User size={24} color={COLORS.white} />
              </View>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{pet.ownerName}</Text>
                <Text style={styles.ownerLocation}>{pet.location}</Text>
              </View>
              <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                <Phone size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {!isOwner && !pet.isClosedByOwner && (
          <TouchableOpacity style={styles.contactActionButton} onPress={handleContact}>
            <Phone size={20} color={COLORS.white} />
            <Text style={styles.contactActionText}>{type === "adoption" ? t("adoptionPet.callForAdoption") : t("adoptionPet.callForBreeding")}</Text>
          </TouchableOpacity>
        )}
        {isOwner && !pet.isClosedByOwner && (
          <TouchableOpacity style={styles.closeActionButton} onPress={handleCloseListing}>
            <Text style={styles.closeActionText}>{t("adoptionPet.closeListing")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
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
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
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
    height: 200,
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
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  contactActionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  closeActionButton: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  closeActionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.darkGray,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  priceBadgeContainer: {
    position: "absolute",
    top: 16,
    left: 16,
  },
  priceBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  priceBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  certificateText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: "left",
  },
});
