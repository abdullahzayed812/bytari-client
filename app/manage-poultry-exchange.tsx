/**
 * manage-poultry-exchange.tsx
 * Admin screen to input daily poultry exchange prices per governorate.
 */
import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useSavePoultryExchange, usePoultryExchange } from "../hooks/usePoultryExchange";
import { useApp } from "../providers/AppProvider";

const IRAQ_GOVERNORATES = [
  "بغداد", "نينوى", "البصرة", "النجف", "أربيل",
  "السليمانية", "كربلاء", "ديالى", "واسط", "صلاح الدين",
  "الأنبار", "بابل", "ذي قار", "ميسان", "المثنى",
  "القادسية", "دهوك", "حلبجة",
];

type PriceRow = { broilerPricePerKg: string; layerPricePerBird: string };

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function ManagePoultryExchangeScreen() {
  const router = useRouter();
  const { isSuperAdmin, moderatorPermissions } = useApp();
  const canEdit = isSuperAdmin || moderatorPermissions?.some((p: any) => p.permissionName === "manage_poultry_exchange");
  const today = todayStr();
  const { data, isLoading } = usePoultryExchange(today);
  const { mutate: savePrices, isPending } = useSavePoultryExchange();

  const [prices, setPrices] = useState<Record<string, PriceRow>>(() => {
    const init: Record<string, PriceRow> = {};
    IRAQ_GOVERNORATES.forEach((gov) => {
      init[gov] = { broilerPricePerKg: "", layerPricePerBird: "" };
    });
    return init;
  });

  useEffect(() => {
    if (data?.prices?.length) {
      const loaded: Record<string, PriceRow> = {};
      IRAQ_GOVERNORATES.forEach((gov) => {
        loaded[gov] = { broilerPricePerKg: "", layerPricePerBird: "" };
      });
      data.prices.forEach((p: any) => {
        if (loaded[p.governorate]) {
          loaded[p.governorate] = {
            broilerPricePerKg: p.broilerPricePerKg ? String(p.broilerPricePerKg) : "",
            layerPricePerBird: p.layerPricePerBird ? String(p.layerPricePerBird) : "",
          };
        }
      });
      setPrices(loaded);
    }
  }, [data]);

  const updatePrice = (gov: string, field: keyof PriceRow, value: string) => {
    setPrices((prev) => ({
      ...prev,
      [gov]: { ...prev[gov], [field]: value },
    }));
  };

  const handleSave = () => {
    const rows = IRAQ_GOVERNORATES
      .filter((gov) => prices[gov].broilerPricePerKg || prices[gov].layerPricePerBird)
      .map((gov) => ({
        governorate: gov,
        broilerPricePerKg: prices[gov].broilerPricePerKg ? Number(prices[gov].broilerPricePerKg) : undefined,
        layerPricePerBird: prices[gov].layerPricePerBird ? Number(prices[gov].layerPricePerBird) : undefined,
      }));

    savePrices({ date: today, prices: rows as any }, {
      onSuccess: () => router.back(),
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "إدارة بورصة الدواجن",
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
              <Text style={styles.headerText}>أسعار اليوم — {today}</Text>
              <Text style={styles.headerSub}>أدخل السعر بالدينار العراقي لكل محافظة</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              {/* Column headers */}
              <View style={styles.colHeader}>
                <Text style={[styles.colHeaderText, { flex: 1.2 }]}>المحافظة</Text>
                <Text style={styles.colHeaderText}>دجاج لحم{"\n"}(د.ع/كغ)</Text>
                <Text style={styles.colHeaderText}>دجاج بياض{"\n"}(د.ع/طير)</Text>
              </View>

              {IRAQ_GOVERNORATES.map((gov) => (
                <View key={gov} style={styles.row}>
                  <Text style={styles.govName}>{gov}</Text>
                  {canEdit ? (
                    <>
                      <TextInput
                        style={styles.priceInput}
                        value={prices[gov]?.broilerPricePerKg}
                        onChangeText={(v) => updatePrice(gov, "broilerPricePerKg", v)}
                        keyboardType="numeric"
                        placeholder="0"
                        textAlign="center"
                      />
                      <TextInput
                        style={styles.priceInput}
                        value={prices[gov]?.layerPricePerBird}
                        onChangeText={(v) => updatePrice(gov, "layerPricePerBird", v)}
                        keyboardType="numeric"
                        placeholder="0"
                        textAlign="center"
                      />
                    </>
                  ) : (
                    <>
                      <Text style={[styles.priceInput, styles.priceReadOnly]}>{prices[gov]?.broilerPricePerKg || "—"}</Text>
                      <Text style={[styles.priceInput, styles.priceReadOnly]}>{prices[gov]?.layerPricePerBird || "—"}</Text>
                    </>
                  )}
                </View>
              ))}

              {canEdit && (
                <TouchableOpacity
                  style={[styles.saveBtn, isPending && styles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={isPending}
                >
                  {isPending ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.saveBtnText}>حفظ الأسعار</Text>
                  )}
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
  govName: { flex: 1.2, fontSize: 13, fontWeight: "500", color: COLORS.black, textAlign: "right" },
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
    textAlign: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingVertical: 6,
    marginHorizontal: 4,
    overflow: "hidden",
  },
});
