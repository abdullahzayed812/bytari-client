import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrendingUp, TrendingDown } from "lucide-react-native";
import { COLORS } from "../../constants/colors";

interface StatRow {
  governorate: string;
  totalBirds: number;
  farmCount: number;
  lastUpdated?: Date | null;
}

interface StatisticsTableProps {
  rows: StatRow[];
}

export function StatisticsTable({ rows }: StatisticsTableProps) {
  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.govCell]}>المحافظة</Text>
        <Text style={styles.headerCell}>عدد المزارع</Text>
        <Text style={styles.headerCell}>مجموع الدجاج</Text>
      </View>

      {rows.map((row, index) => (
        <View key={row.governorate} style={[styles.row, index % 2 === 0 && styles.evenRow]}>
          <View style={[styles.cell, styles.govCell]}>
            <Text style={styles.govText}>{row.governorate}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.farmCount}>{row.farmCount}</Text>
            <Text style={styles.farmLabel}>مزرعة</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.birdCount}>{row.totalBirds.toLocaleString()}</Text>
            <Text style={styles.birdLabel}>طير</Text>
          </View>
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
  cell: { flex: 1, alignItems: "center" },
  govCell: { flex: 1.2 },
  govText: { fontSize: 13, fontWeight: "500", color: COLORS.black },
  farmCount: { fontSize: 16, fontWeight: "700", color: COLORS.primary },
  farmLabel: { fontSize: 10, color: COLORS.darkGray },
  birdCount: { fontSize: 16, fontWeight: "700", color: "#059669" },
  birdLabel: { fontSize: 10, color: COLORS.darkGray },
});
