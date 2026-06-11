/**
 * manage-egg-exchange.tsx
 * Admin screen to input daily egg exchange prices per governorate.
 */
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useSaveEggExchange, useEggExchange } from "../hooks/usePoultryExchange";
import { useApp } from "../providers/AppProvider";

const IRAQ_GOVERNORATES = [
  "بغداد",
  "نينوى",
  "البصرة",
  "النجف",
  "كربلاء",
  "ديالى",
  "واسط",
  "صلاح الدين",
  "الأنبار",
  "بابل",
  "ذي قار",
  "ميسان",
  "المثنى",
  "القادسية",
  "كركوك",
  "إقليم كردستان",
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function ManageEggExchangeScreen() {
  const router = useRouter();
  const { isSuperAdmin, moderatorPermissions } = useApp();
  const canEdit = isSuperAdmin || moderatorPermissions?.some((p: any) => p.permissionName === "manage_egg_exchange");
  const today = todayStr();
  const { data, isLoading } = useEggExchange(today);
  const { mutate: savePrices, isPending } = useSaveEggExchange();

  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    IRAQ_GOVERNORATES.forEach((gov) => {
      init[gov] = "";
    });
    return init;
  });

  useEffect(() => {
    if (data?.rows?.length) {
      const loaded: Record<string, string> = {};
      IRAQ_GOVERNORATES.forEach((gov) => {
        loaded[gov] = "";
      });
      data.rows.forEach((r: any) => {
        if (r.pricePerTray != null) {
          loaded[r.governorate] = String(r.pricePerTray);
        }
      });
      setPrices(loaded);
    }
  }, [data]);

  const handleSave = () => {
    const rows = IRAQ_GOVERNORATES.filter((gov) => prices[gov]).map((gov) => ({
      governorate: gov,
      pricePerTray: Number(prices[gov]),
    }));

    savePrices(
      { date: today, prices: rows as any },
      {
        onSuccess: () => router.back(),
      },
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "إدارة بورصة البيض",
          headerStyle: { backgroundColor: "#064E3B" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {isLoading ? (
          <ActivityIndicator style={{ flex: 1, marginTop: 40 }} color={COLORS.primary} size="large" />
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.headerText}>أسعار البيض — {today}</Text>
              <Text style={styles.headerSub}>أدخل سعر الطبقة (30 بيضة) بالدينار العراقي</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.colHeader}>
                <Text style={[styles.colHeaderText, { flex: 1.5 }]}>المحافظة</Text>
                <Text style={styles.colHeaderText}>سعر الطبقة (د.ع)</Text>
              </View>

              {IRAQ_GOVERNORATES.map((gov) => (
                <View key={gov} style={styles.row}>
                  <Text style={styles.govName}>{gov}</Text>
                  {canEdit ? (
                    <TextInput
                      style={styles.priceInput}
                      value={prices[gov]}
                      onChangeText={(v) => setPrices((prev) => ({ ...prev, [gov]: v }))}
                      keyboardType="numeric"
                      placeholder="0"
                      textAlign="center"
                    />
                  ) : (
                    <Text style={[styles.priceInput, styles.priceReadOnly]}>{prices[gov] || "—"}</Text>
                  )}
                </View>
              ))}

              {canEdit && (
                <TouchableOpacity style={[styles.saveBtn, isPending && styles.saveBtnDisabled]} onPress={handleSave} disabled={isPending}>
                  {isPending ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>حفظ الأسعار</Text>}
                </TouchableOpacity>
              )}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "flex-end",
  },
  headerText: { fontSize: 15, fontWeight: "700", color: COLORS.black },
  headerSub: { fontSize: 12, color: COLORS.darkGray, marginTop: 2 },
  content: { padding: 16, paddingBottom: 40 },
  colHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#064E3B",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  colHeaderText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  govName: { flex: 1.5, fontSize: 13, fontWeight: "500", color: COLORS.black, textAlign: "right" },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 13,
    backgroundColor: "#F9FAFB",
    marginHorizontal: 4,
  },
  saveBtn: {
    backgroundColor: "#064E3B",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  priceReadOnly: {
    flex: 1,
    fontSize: 13,
    color: COLORS.black,
    textAlign: "center" as const,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
});
