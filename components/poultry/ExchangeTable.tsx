import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { COLORS } from "../../constants/colors";

interface ExchangeRow {
  governorate: string;
  broilerPricePerKg?: number | null;
  layerPricePerBird?: number | null;
  broilerChange?: number | null;
  layerChange?: number | null;
  broilerTrend?: "up" | "down" | "same" | null;
  layerTrend?: "up" | "down" | "same" | null;
}

interface ExchangeTableProps {
  rows: ExchangeRow[];
  mode?: "poultry" | "egg";
}

function TrendIcon({ trend }: { trend?: "up" | "down" | "same" | null }) {
  if (trend === "up") return <TrendingUp size={14} color="#10B981" />;
  if (trend === "down") return <TrendingDown size={14} color="#EF4444" />;
  if (trend === "same") return <Minus size={14} color={COLORS.darkGray} />;
  return null;
}

export function ExchangeTable({ rows, mode = "poultry" }: ExchangeTableProps) {
  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.govCell]}>المحافظة</Text>
        <Text style={styles.headerCell}>{mode === "poultry" ? "سعر دجاج اللحم\n(د.ع/الكيلو)" : "سعر البيض\n(د.ع/الطبقة)"}</Text>
        {mode === "poultry" && <Text style={styles.headerCell}>سعر الدجاج البياض{"\n"}(د.ع/الطبقة)</Text>}
      </View>

      {rows.map((row, index) => (
        <View key={row.governorate} style={[styles.row, index % 2 === 0 && styles.evenRow]}>
          <View style={[styles.cell, styles.govCell]}>
            <Text style={styles.govText}>{row.governorate}</Text>
          </View>

          <View style={styles.cell}>
            {row.broilerPricePerKg != null ? (
              <View style={styles.priceCell}>
                <Text style={[styles.price, row.broilerTrend === "up" ? styles.priceUp : row.broilerTrend === "down" ? styles.priceDown : {}]}>
                  {row.broilerPricePerKg.toLocaleString()}
                </Text>
                <TrendIcon trend={row.broilerTrend} />
              </View>
            ) : (
              <Text style={styles.dash}>—</Text>
            )}
          </View>

          {mode === "poultry" && (
            <View style={styles.cell}>
              {row.layerPricePerBird != null ? (
                <View style={styles.priceCell}>
                  <Text style={[styles.price, row.layerTrend === "up" ? styles.priceUp : row.layerTrend === "down" ? styles.priceDown : {}]}>
                    {row.layerPricePerBird.toLocaleString()}
                  </Text>
                  <TrendIcon trend={row.layerTrend} />
                </View>
              ) : (
                <Text style={styles.dash}>—</Text>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#064E3B",
    paddingVertical: 10,
  },
  headerCell: {
    flex: 1,
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 11,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  evenRow: { backgroundColor: "#F9FAFB" },
  cell: { flex: 1, alignItems: "center", justifyContent: "center" },
  govCell: { flex: 1.2 },
  govText: { fontSize: 13, color: COLORS.black, fontWeight: "500", textAlign: "center" },
  priceCell: { flexDirection: "row", alignItems: "center", gap: 4 },
  price: { fontSize: 14, fontWeight: "700", color: COLORS.black },
  priceUp: { color: "#10B981" },
  priceDown: { color: "#EF4444" },
  dash: { fontSize: 14, color: COLORS.lightGray },
});
