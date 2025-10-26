import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import React, { useMemo } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { Stack } from "expo-router";
import Card from "../components/Card";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/providers/AppProvider";

export default function ConsultationsListScreen() {
  const { user } = useApp();
  const { t, isRTL } = useI18n();
  const router = useRouter();

  const { data: consultationsData, isLoading: consultationsLoading } = useQuery({
    ...trpc.consultations.listForUser.queryOptions({ userId: user?.id }),
  });
  const consultations = useMemo(() => (consultationsData as any)?.consultations, [consultationsData]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "الاستشارات السابقة",
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              {isRTL ? <ArrowRight size={24} color={COLORS.black} /> : <ArrowLeft size={24} color={COLORS.black} />}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {consultations.map((con) => (
          <Card
            key={con.id}
            title={con.question}
            subtitle={new Date(con.createdAt).toLocaleDateString()}
            style={styles.consultationCard}
            onPress={() => {
              console.log(`View consultation ${con.id}`);
              // TODO: Navigate to consultation details
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
          </Card>
        ))}
      </ScrollView>
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
  },
  content: {
    flex: 1,
    padding: 16,
  },
  consultationCard: {
    marginBottom: 16,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 8,
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
  answerText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
  },

  consultationHistoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    width: 250,
    marginBottom: 8,
  },

  consultationHistoryContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  consultationHistoryDetails: {
    flex: 1,
    paddingHorizontal: 8,
  },

  consultationHistoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },

  consultationHistoryPet: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
  },

  consultationHistoryDescription: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 4,
    lineHeight: 18,
  },

  consultationUrgency: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },

  consultationHistoryDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
});
