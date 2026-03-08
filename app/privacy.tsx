import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { COLORS } from "../constants/colors";
import { Stack, router } from 'expo-router';
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react-native';
import { useI18n } from "@/providers/I18nProvider";

export default function PrivacyScreen() {
  const { t } = useI18n();

  return (
    <>
      <Stack.Screen
        options={{
          title: t("privacy.title"),
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black, fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Shield size={40} color={COLORS.white} />
          <Text style={styles.headerText}>
            {t("privacy.headerText")}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t("privacy.dataCollection.title")}</Text>
          </View>
          <Text style={styles.sectionContent}>
            {t("privacy.dataCollection.content")}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t("privacy.dataUsage.title")}</Text>
          </View>
          <Text style={styles.sectionContent}>
            {t("privacy.dataUsage.content")}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t("privacy.dataProtection.title")}</Text>
          </View>
          <Text style={styles.sectionContent}>
            {t("privacy.dataProtection.content")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("privacy.yourRights.title")}</Text>
          <View style={styles.rightsList}>
            <Text style={styles.rightItem}>{t("privacy.yourRights.right1")}</Text>
            <Text style={styles.rightItem}>{t("privacy.yourRights.right2")}</Text>
            <Text style={styles.rightItem}>{t("privacy.yourRights.right3")}</Text>
            <Text style={styles.rightItem}>{t("privacy.yourRights.right4")}</Text>
            <Text style={styles.rightItem}>{t("privacy.yourRights.right5")}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("privacy.cookies.title")}</Text>
          <Text style={styles.sectionContent}>
            {t("privacy.cookies.content")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("privacy.dataSharing.title")}</Text>
          <Text style={styles.sectionContent}>
            {t("privacy.dataSharing.content")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("privacy.updates.title")}</Text>
          <Text style={styles.sectionContent}>
            {t("privacy.updates.content")}
          </Text>
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
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    marginTop: 12,
  },
  section: {
    backgroundColor: COLORS.white,
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginRight: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: 'right',
  },
  rightsList: {
    marginTop: 8,
  },
  rightItem: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 4,
  },

});
