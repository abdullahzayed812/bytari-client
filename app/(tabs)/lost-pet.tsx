import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Linking,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { COLORS } from "../../constants/colors";
import { useLocalSearchParams } from "expo-router";
import { MapPin, Phone, Mail, AlertTriangle } from "lucide-react-native";
import { trpc } from "../../lib/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "../../providers/AppProvider";
import { useState } from "react";
import { useI18n } from "@/providers/I18nProvider";

export default function LostPetScreen() {
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useApp();

  const queryClient = useQueryClient();

  const [showSightingReportModal, setShowSightingReportModal] = useState(false);
  const [sightingInfo, setSightingInfo] = useState({
    sightingLocation: "",
    description: "",
    reporterName: user?.name || "",
    reporterPhone: user?.phone || "",
    reporterEmail: user?.email || "",
  });

  const { data, isLoading, error, refetch } = useQuery({
    ...trpc.pets.getLostPetDetails.queryOptions({
      id: parseInt(id || "0"),
    }),
    enabled: !!id,
  });

  const pet = data?.pet;
  const isOwner = user && pet && user.id === pet?.contactInfo?.ownerId;

  const {
    data: reportsData,
    isLoading: isLoadingReports,
    refetch: refetchReports,
  } = useQuery({
    ...trpc.pets.sighting.getReports.queryOptions({
      lostPetId: pet?.id ? Number(pet.id) : -1,
    }),
    enabled: isOwner && !!pet?.id,
  });
  const sightingReports = reportsData?.reports;

  const reportSightingMutation = useMutation(trpc.pets.sighting.report.mutationOptions());
  const closeReportMutation = useMutation(trpc.pets.sighting.closeReport.mutationOptions());
  const dismissReportMutation = useMutation(trpc.pets.sighting.dismissReport.mutationOptions());

  const handleCloseReport = (reportId: number) => {
    if (!user?.id || !pet?.contactInfo?.ownerId) return;

    Alert.alert(t("lostPet.confirmClose"), t("lostPet.confirmCloseMsg"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("lostPet.yesClose"),
        onPress: () => {
          closeReportMutation.mutate(
            { reportId, ownerId: user.id },
            {
              onSuccess: () => {
                Alert.alert(t("lostPet.closedTitle"), t("lostPet.closedMsg"));
                refetchReports();
                refetch();
                queryClient.invalidateQueries(trpc.pets.getApproved.queryKey as any);
              },
              onError: (err) => {
                Alert.alert(t("common.error"), t("lostPet.closeError") + err.message);
              },
            },
          );
        },
      },
    ]);
  };

  const handleDismissReport = (reportId: number) => {
    if (!user?.id || !pet?.contactInfo?.ownerId) return;

    Alert.alert(t("lostPet.confirmDismiss"), t("lostPet.confirmDismissMsg"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("lostPet.yesDismiss"),
        onPress: () => {
          dismissReportMutation.mutate(
            { reportId, ownerId: Number(user.id) },
            {
              onSuccess: () => {
                Alert.alert(t("lostPet.dismissedTitle"), t("lostPet.dismissedMsg"));
                refetchReports();
                refetch();
                queryClient.invalidateQueries(trpc.pets.getApproved.queryKey as any);
              },
              onError: (err) => {
                Alert.alert(t("common.error"), t("lostPet.dismissError") + err.message);
              },
            },
          );
        },
      },
    ]);
  };

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
    setShowSightingReportModal(true);
  };

  const handleSubmitSightingReport = () => {
    if (!pet?.id || !sightingInfo.sightingLocation.trim()) {
      Alert.alert(t("common.error"), t("lostPet.locationRequired"));
      return;
    }

    reportSightingMutation.mutate(
      {
        lostPetId: Number(pet.id),
        reporterId: Number(user?.id),
        sightingDate: new Date(),
        sightingLocation: sightingInfo.sightingLocation,
        description: sightingInfo.description,
        contactInfo: {
          name: sightingInfo.reporterName,
          phone: sightingInfo.reporterPhone,
          email: sightingInfo.reporterEmail,
        },
      },
      {
        onSuccess: () => {
          Alert.alert(t("lostPet.reportedTitle"), t("lostPet.reportedMsg"));
          setShowSightingReportModal(false);
          setSightingInfo({
            sightingLocation: "",
            description: "",
            reporterName: user?.name || "",
            reporterPhone: user?.phone || "",
            reporterEmail: user?.email || "",
          });
          refetchReports();
        },
        onError: (err) => {
          Alert.alert(t("common.error"), t("lostPet.reportError") + err.message);
        },
      },
    );
  };

  const getPetStatus = (status: string) => {
    switch (status) {
      case "found":
        return { text: t("lostPet.statusFound"), color: COLORS.success };
      case "closed":
        return { text: t("lostPet.statusClosed"), color: COLORS.darkGray };
      default:
        return { text: t("lostPet.statusLost"), color: COLORS.error };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  if (error || !pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>{t("lostPet.notFound")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          {pet?.images[0] && <Image source={{ uri: pet.image || pet.images?.[0] }} style={styles.petImage} />}
          <View style={[styles.lostBadge, { backgroundColor: getPetStatus(pet.status).color }]}>
            <AlertTriangle size={16} color={COLORS.white} />
            <Text style={styles.lostBadgeText}>{getPetStatus(pet.status).text}</Text>
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
              <Text style={styles.sectionTitle}>{t("lostPet.lastSeen")}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t("common.location")}</Text>
              <Text style={styles.infoValue}>{pet.lastSeen.location}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t("common.date")}</Text>
              <Text style={styles.infoValue}>{new Date(pet.lastSeen.date).toLocaleDateString("ar-SA")}</Text>
            </View>
          </View>

          {pet.description && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AlertTriangle size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>{t("common.description")}</Text>
              </View>

              <Text style={styles.description}>{pet.description}</Text>
            </View>
          )}

          {pet.specialRequirements && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AlertTriangle size={20} color={COLORS.warning} />
                <Text style={styles.sectionTitle}>{t("lostPet.specialNotes")}</Text>
              </View>

              <Text style={styles.description}>{pet.specialRequirements}</Text>
            </View>
          )}

          {pet.reward && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AlertTriangle size={20} color={COLORS.success} />
                <Text style={styles.sectionTitle}>{t("lostPet.reward")}</Text>
              </View>

              <Text style={styles.rewardText}>{t("lostPet.rewardAmount").replace("{amount}", pet.reward)}</Text>
            </View>
          )}

          {isOwner && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Mail size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>{t("lostPet.sightingReports")}</Text>
              </View>
              {isLoadingReports ? (
                <Text style={styles.loadingText}>{t("lostPet.loadingReports")}</Text>
              ) : sightingReports && sightingReports.length > 0 ? (
                sightingReports.map((report) => (
                  <View key={report.id} style={styles.reportItem}>
                    <Text style={styles.reportSender}>{t("lostPet.from")}{report.reporterName || t("lostPet.unknownUser")}</Text>
                    {report.contactInfo?.phone && (
                      <Text style={styles.reportContact}>{t("lostPet.phoneLabel")}{report.contactInfo.phone}</Text>
                    )}
                    {report.contactInfo?.email && (
                      <Text style={styles.reportContact}>{t("lostPet.emailLabel")}{report.contactInfo.email}</Text>
                    )}
                    <Text style={styles.reportLocation}>{t("lostPet.sightingLocationLabel")}{report.sightingLocation}</Text>
                    <Text style={styles.reportDate}>
                      {t("lostPet.sightingDateLabel")}{new Date(report.sightingDate).toLocaleDateString("ar-SA")}
                    </Text>
                    {report.description && <Text style={styles.reportDescription}>{t("lostPet.sightingDescLabel")}{report.description}</Text>}
                    {!report.isDismissed && (
                      <View style={styles.reportActions}>
                        <TouchableOpacity style={styles.dismissButton} onPress={() => handleDismissReport(report.id)}>
                          <Text style={styles.dismissButtonText}>{t("lostPet.dismissContact")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeButton} onPress={() => handleCloseReport(report.id)}>
                          <Text style={styles.closeButtonText}>{t("lostPet.closeReport")}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {report.isDismissed && <Text style={styles.dismissedText}>{t("lostPet.contactDismissed")}</Text>}
                  </View>
                ))
              ) : (
                <Text style={styles.infoValue}>{t("lostPet.noReports")}</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.bottomActions}>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Phone size={20} color={COLORS.white} />
              <Text style={styles.callButtonText}>{t("lostPet.callOwner")}</Text>
            </TouchableOpacity>

            {pet.contactInfo.email && (
              <TouchableOpacity style={styles.emailButton} onPress={handleEmail}>
                <Mail size={20} color={COLORS.primary} />
                <Text style={styles.emailButtonText}>{t("lostPet.sendEmail")}</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.reportButton} onPress={handleReportSighting}>
            <Text style={styles.reportButtonText}>{t("lostPet.reportSighting")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sighting Report Modal */}
      <Modal
        visible={showSightingReportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSightingReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("lostPet.reportSighting")}</Text>

            <Text style={styles.inputLabel}>{t("lostPet.sightingLocationInput")}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t("lostPet.enterSightingLocation")}
              value={sightingInfo.sightingLocation}
              onChangeText={(text) => setSightingInfo((prev) => ({ ...prev, sightingLocation: text }))}
            />

            <Text style={styles.inputLabel}>{t("lostPet.descriptionOptional")}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t("lostPet.descBrief")}
              value={sightingInfo.description}
              onChangeText={(text) => setSightingInfo((prev) => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>{t("lostPet.yourNameLabel")}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t("lostPet.yourName")}
              value={sightingInfo.reporterName}
              onChangeText={(text) => setSightingInfo((prev) => ({ ...prev, reporterName: text }))}
            />

            <Text style={styles.inputLabel}>{t("lostPet.phoneOptional")}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t("lostPet.yourPhone")}
              value={sightingInfo.reporterPhone}
              onChangeText={(text) => setSightingInfo((prev) => ({ ...prev, reporterPhone: text }))}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>{t("lostPet.emailOptional")}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t("lostPet.yourEmail")}
              value={sightingInfo.reporterEmail}
              onChangeText={(text) => setSightingInfo((prev) => ({ ...prev, reporterEmail: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowSightingReportModal(false)}>
                <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, !sightingInfo.sightingLocation.trim() && styles.disabledButton]}
                onPress={handleSubmitSightingReport}
                disabled={!sightingInfo.sightingLocation.trim()}
              >
                <Text style={styles.submitButtonText}>{t("lostPet.submit")}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  },
  petName: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "left",
  },
  petType: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 24,
    textAlign: "left",
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
    textAlign: "left",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "left",
  },
  description: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 24,
    textAlign: "left",
  },
  bottomActions: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButtons: {
    flexDirection: "row-reverse",
    gap: 12,
    marginBottom: 16,
  },
  callButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
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
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
    color: COLORS.darkGray,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.success,
    textAlign: "left",
  },
  reportItem: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  reportSender: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
    marginBottom: 5,
  },
  reportContact: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "left",
    marginBottom: 3,
  },
  reportLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "left",
    marginBottom: 3,
  },
  reportDate: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: "left",
    marginBottom: 5,
  },
  reportDescription: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: "left",
    lineHeight: 20,
  },
  reportActions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 10,
  },
  dismissButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  dismissButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: COLORS.darkGray,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  dismissedText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "left",
    marginTop: 10,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "left",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "left",
  },
  modalActions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: COLORS.darkGray,
    borderColor: COLORS.gray,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
});
