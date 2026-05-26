import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { COLORS } from "../../constants/colors";

interface PoultryFeatureCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function PoultryFeatureCard({ icon, title, subtitle, onPress }: PoultryFeatureCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.text}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <ChevronLeft size={20} color={COLORS.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  content: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  icon: { fontSize: 32 },
  text: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.black },
  subtitle: { fontSize: 12, color: COLORS.darkGray, marginTop: 2 },
});
