import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useMemo, useRef } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter, useFocusEffect, Stack } from "expo-router";
import Button from "../components/Button";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

export default function VetInquiriesScreen() {
  const { t, isRTL } = useI18n();
  const { user, userMode } = useApp();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: inquiriesData, isLoading: inquiriesLoading } = useQuery(
    trpc.inquiries.listForUser.queryOptions({ userId: user?.id })
  );
  const inquiries = useMemo(() => (inquiriesData as any)?.inquiries, [inquiriesData]);

  const { data: consultationsData, isLoading: consultationsLoading } = useQuery({
    ...trpc.consultations.listForUser.queryOptions({ userId: user?.id }),
  });
  const consultations = useMemo(() => (consultationsData as any)?.consultations, [consultationsData]);

  // Scroll to top when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const handleSendConsultation = () => {
    if (userMode === "veterinarian") {
      router.push("/new-inquiry");
    } else {
      router.push("/consultation");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: userMode === "veterinarian" ? "الاستفسارات" : "الاستشارات",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Consultation Section */}
        <View style={styles.consultationSection}>
          <View style={styles.consultationCard}>
            <Text style={[styles.consultationText, { textAlign: "center" }]}>
              {userMode === "veterinarian" ? t("home.consultationVet") : t("home.consultation")}
            </Text>
            <Button
              title={userMode === "veterinarian" ? "ارسل استفسارك" : t("home.sendConsultation")}
              onPress={handleSendConsultation}
              type="primary"
              size="medium"
              style={styles.consultationButton}
            />
          </View>
        </View>

        {/* Previous Consultations/Inquiries Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {userMode === "veterinarian" ? "استفساراتك السابقة" : "استشاراتك السابقة"}
          </Text>

          {inquiriesLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : inquiries?.length > 0 ? (
            inquiries?.slice(0, 3).map((inquiry) => (
              <TouchableOpacity
                key={inquiry.id}
                style={[styles.consultationHistoryCard, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                onPress={() => {
                  if (userMode === "veterinarian") {
                    router.push("/vet-inquiries");
                  } else {
                    router.push("/consultation");
                  }
                }}
              >
                <View style={[styles.consultationHistoryContent, { flexDirection: isRTL ? "row" : "row-reverse" }]}>
                  {/* Status Badge */}
                  <View style={[styles.statusContainer, { alignSelf: isRTL ? "flex-start" : "flex-end" }]}>
                    <View
                      style={[
                        styles.statusIndicator,
                        inquiry.status === "pending"
                          ? styles.statusPending
                          : inquiry.status === "answered"
                          ? styles.statusAnswered
                          : styles.statusClosed,
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {inquiry.status === "pending"
                        ? "قيد المراجعة"
                        : inquiry.status === "answered"
                        ? "تم الرد"
                        : "مغلق"}
                    </Text>
                  </View>

                  {/* Consultation Info */}
                  <View style={styles.consultationHistoryDetails}>
                    <Text
                      style={[styles.consultationHistoryTitle, { textAlign: isRTL ? "left" : "right" }]}
                      numberOfLines={2}
                    >
                      {inquiry.title}
                    </Text>

                    {inquiry.petName && (
                      <Text style={[styles.consultationHistoryPet, { textAlign: isRTL ? "left" : "right" }]}>
                        الحيوان: {inquiry.petName}
                      </Text>
                    )}

                    <Text
                      style={[styles.consultationHistoryDescription, { textAlign: isRTL ? "left" : "right" }]}
                      numberOfLines={3}
                    >
                      {inquiry.content}
                    </Text>

                    <Text style={[styles.consultationHistoryDate, { textAlign: isRTL ? "left" : "right" }]}>
                      {new Date(inquiry.createdAt).toLocaleDateString("ar-SA")}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : consultationsLoading ? (
            <ActivityIndicator size="large" />
          ) : consultations?.length > 0 ? (
            consultations.slice(0, 3).map((con) => (
              <TouchableOpacity
                key={con.id}
                style={[styles.consultationHistoryCard, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                onPress={() => {
                  router.push({
                    pathname: "/consultation-details",
                    params: { id: con.id },
                  });
                }}
              >
                <View style={[styles.consultationHistoryContent, { flexDirection: isRTL ? "row" : "row-reverse" }]}>
                  {/* 🔵 Status Badge */}
                  <View style={[styles.statusContainer, { alignSelf: isRTL ? "flex-start" : "flex-end" }]}>
                    <View
                      style={[
                        styles.statusIndicator,
                        con.status === "pending"
                          ? styles.statusPending
                          : con.status === "answered"
                          ? styles.statusAnswered
                          : styles.statusClosed,
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {con.status === "pending" ? "قيد المراجعة" : con.status === "answered" ? "تم الرد" : "مغلق"}
                    </Text>
                  </View>

                  {/* 🐾 Consultation Info */}
                  <View style={styles.consultationHistoryDetails}>
                    {/* Title */}
                    <Text
                      style={[styles.consultationHistoryTitle, { textAlign: isRTL ? "left" : "right" }]}
                      numberOfLines={2}
                    >
                      {con.title}
                    </Text>

                    {/* Category / Pet Type */}
                    {con.category && (
                      <Text style={[styles.consultationHistoryPet, { textAlign: isRTL ? "left" : "right" }]}>
                        النوع: {con.category}
                      </Text>
                    )}

                    {/* Description */}
                    <Text
                      style={[styles.consultationHistoryDescription, { textAlign: isRTL ? "left" : "right" }]}
                      numberOfLines={3}
                    >
                      {con.description}
                    </Text>

                    {/* Urgency */}
                    <Text
                      style={[
                        styles.consultationUrgency,
                        {
                          color:
                            con.urgencyLevel === "emergency"
                              ? COLORS.error
                              : con.urgencyLevel === "high"
                              ? COLORS.warning
                              : COLORS.darkGray,
                          textAlign: isRTL ? "left" : "right",
                        },
                      ]}
                    >
                      مستوى الأهمية:{" "}
                      {con.urgencyLevel === "emergency"
                        ? "طارئ"
                        : con.urgencyLevel === "high"
                        ? "عالي"
                        : con.urgencyLevel === "medium"
                        ? "متوسط"
                        : "منخفض"}
                    </Text>

                    {/* Date */}
                    <Text style={[styles.consultationHistoryDate, { textAlign: isRTL ? "left" : "right" }]}>
                      {new Date(con.createdAt).toLocaleDateString("ar-SA")}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text>لا توجد استشارات</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  content: {
    flex: 1,
    paddingBottom: 90,
  },
  consultationSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 16,
  },
  consultationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultationText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 26,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  consultationButton: {
    width: "100%",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
  },
  consultationHistoryCard: {
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
  consultationHistoryContent: {
    alignItems: "flex-start",
  },
  consultationHistoryDetails: {
    flex: 1,
  },
  consultationHistoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 6,
    lineHeight: 22,
  },
  consultationHistoryPet: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
    marginBottom: 6,
  },
  consultationHistoryDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 8,
  },
  consultationHistoryDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  consultationUrgency: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  statusContainer: {
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusPending: {
    backgroundColor: COLORS.warning,
  },
  statusAnswered: {
    backgroundColor: COLORS.success,
  },
  statusClosed: {
    backgroundColor: COLORS.darkGray,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
});
