import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
import React, { useMemo, useRef } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter, useFocusEffect, Stack } from "expo-router";
import { ArrowLeft, ArrowRight, Plus, Edit3 } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
// import { mockTips } from "../mocks/data";

export default function TipsListScreen() {
  const { t, isRTL } = useI18n();
  const { isSuperAdmin } = useApp();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: tipsData, isLoading: tipsLoading } = useQuery(trpc.content.listTips.queryOptions());
  const tips = useMemo(() => (tipsData as any)?.tips, [tipsData]);

  // Scroll to top when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "أفضل النصائح",
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              {isRTL ? <ArrowRight size={24} color={COLORS.black} /> : <ArrowLeft size={24} color={COLORS.black} />}
            </TouchableOpacity>
          ),
          headerRight: () =>
            isSuperAdmin ? (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/admin-content-manager?type=tips");
                  }}
                  style={[styles.headerButton, styles.addButton]}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/admin-content-manager?type=tips");
                  }}
                  style={[styles.headerButton, styles.editButton]}
                >
                  <Edit3 size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : null,
        }}
      />

      <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
        {tips.map((tip) => (
          <TouchableOpacity
            key={tip.id}
            style={styles.tipCard}
            onPress={() => {
              router.push(`/tip-details?id=${tip.id}`);
            }}
          >
            <Image source={{ uri: tip.images[0] }} style={styles.tipImage} />
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { textAlign: isRTL ? "right" : "left" }]}>{tip.title}</Text>
              <Text style={[styles.tipDescription, { textAlign: isRTL ? "right" : "left" }]}>{tip.content}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tipCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  tipImage: {
    width: "100%",
    height: 140,
  },
  tipContent: {
    padding: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 6,
  },
  tipDescription: {
    fontSize: 13,
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: COLORS.success || "#28a745",
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
});
