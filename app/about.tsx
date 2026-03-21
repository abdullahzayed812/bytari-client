import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from "react-native";
import React from "react";
import { COLORS } from "../constants/colors";
import { Stack, router } from "expo-router";
import { ArrowRight, Info, Heart, Users, Shield, Star, ExternalLink, ArrowLeft } from "lucide-react-native";
import { useI18n } from "@/providers/I18nProvider";

export default function AboutScreen() {
  const { t } = useI18n();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t("screens.about"),
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black, fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Heart size={40} color={COLORS.white} />
          <Text style={styles.headerText}>{t("about.appName")}</Text>
          <Text style={styles.versionText}>{t("about.version")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("about.aboutTitle")}</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              {t("about.aboutText")}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("about.featuresTitle")}</Text>
          <View style={styles.featuresCard}>
            <View style={styles.featureItem}>
              <Users size={24} color={COLORS.primary} />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{t("about.feature1Title")}</Text>
                <Text style={styles.featureDescription}>{t("about.feature1Description")}</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Shield size={24} color={COLORS.primary} />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{t("about.feature2Title")}</Text>
                <Text style={styles.featureDescription}>{t("about.feature2Description")}</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Star size={24} color={COLORS.primary} />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{t("about.feature3Title")}</Text>
                <Text style={styles.featureDescription}>{t("about.feature3Description")}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("about.teamTitle")}</Text>
          <View style={styles.teamCard}>
            <Text style={styles.teamText}>
              {t("about.teamText")}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("about.contactTitle")}</Text>
          <View style={styles.contactCard}>
            {/* <TouchableOpacity style={styles.contactItem} onPress={() => handleLinkPress("https://petcare.com")}>
              <ExternalLink size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>الموقع الإلكتروني</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleLinkPress("mailto:info@baytariapp@gmail.com")}
            >
              <ExternalLink size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{t("about.contactEmail")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => router.push("/contact-us")}>
              <ExternalLink size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{t("about.contactPage")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("about.legalTitle")}</Text>
          <View style={styles.legalCard}>
            <TouchableOpacity style={styles.legalItem} onPress={() => router.push("/privacy")}>
              <Text style={styles.legalText}>{t("about.privacyPolicy")}</Text>
              <ArrowRight size={16} color={COLORS.darkGray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>{t("about.termsOfUse")}</Text>
              <ArrowRight size={16} color={COLORS.darkGray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>{t("about.licenseAgreement")}</Text>
              <ArrowRight size={16} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("about.footerText")}</Text>
          <Text style={styles.footerSubtext}>{t("about.footerSubtext")}</Text>
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
  backButton: {
    padding: 8,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    color: COLORS.white,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  section: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "left",
  },
  aboutCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: "left",
  },
  featuresCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },
  featureInfo: {
    marginRight: 16,
    flex: 1,
    alignItems: "flex-end",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "left",
  },
  teamCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: "left",
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  contactText: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 12,
    fontWeight: "500",
  },
  legalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legalItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  legalText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    padding: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
});
