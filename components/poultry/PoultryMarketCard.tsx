import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Phone, MessageCircle, MapPin, Clock } from "lucide-react-native";
import { COLORS } from "../../constants/colors";
import { Linking } from "react-native";

export const POULTRY_TYPE_LABELS: Record<string, string> = {
  broiler: "دجاج لحم",
  layer: "دجاج بياض",
  rooster: "ديوك",
  turkey: "ديك رومي",
  local: "دجاج بلدي",
  other: "أخرى",
};

export const POULTRY_TYPE_ICONS: Record<string, string> = {
  broiler: "🐔",
  layer: "🥚",
  rooster: "🐓",
  turkey: "🦃",
  local: "🐔",
  other: "🐦",
};

interface PoultryMarketCardProps {
  ad: {
    id: number;
    poultryType: string;
    breed?: string | null;
    quantity: number;
    unit: string;
    pricePerUnit?: string | null;
    totalPrice?: string | null;
    ageWeeks?: number | null;
    weightKg?: string | null;
    governorate?: string | null;
    region?: string | null;
    contactPhone?: string | null;
    contactWhatsapp?: string | null;
    images?: string[];
    notes?: string | null;
    isFeatured?: boolean;
    createdAt: string | Date;
    sellerName?: string | null;
  };
  isAdmin?: boolean;
  onDelete?: () => void;
  onPress?: () => void;
}

export function PoultryMarketCard({ ad, isAdmin, onDelete, onPress }: PoultryMarketCardProps) {
  const typeLabel = POULTRY_TYPE_LABELS[ad.poultryType] || ad.poultryType;
  const typeIcon = POULTRY_TYPE_ICONS[ad.poultryType] || "🐔";
  const firstImage = ad.images?.[0];

  const handleCall = () => {
    if (ad.contactPhone) Linking.openURL(`tel:${ad.contactPhone}`);
  };

  const handleWhatsApp = () => {
    if (ad.contactWhatsapp) {
      const phone = ad.contactWhatsapp.replace(/\D/g, "");
      Linking.openURL(`https://wa.me/${phone}`);
    }
  };

  return (
    <View style={styles.card}>
      {ad.isFeatured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>مميز</Text>
        </View>
      )}

      <View style={styles.row}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {firstImage ? (
            <Image source={{ uri: firstImage }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.typeIcon}>{typeIcon}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.typeLabel}>{typeLabel}</Text>
          {ad.breed && <Text style={styles.breed}>{ad.breed}</Text>}

          <View style={styles.statsRow}>
            <Text style={styles.statText}>
              الكمية:{" "}
              <Text style={styles.statValue}>
                {ad.quantity.toLocaleString()} {ad.unit === "bird" ? "طير" : ad.unit}
              </Text>
            </Text>
          </View>

          {ad.pricePerUnit && (
            <View style={styles.statsRow}>
              <Text style={styles.statText}>
                السعر: <Text style={styles.price}>{Number(ad.pricePerUnit).toLocaleString()} د.ع</Text>
              </Text>
            </View>
          )}

          {ad.ageWeeks && <Text style={styles.detail}>العمر: {ad.ageWeeks} أسبوع</Text>}

          {(ad.governorate || ad.region) && (
            <View style={styles.locationRow}>
              <MapPin size={12} color={COLORS.darkGray} />
              <Text style={styles.location}>{[ad.governorate, ad.region].filter(Boolean).join(" - ")}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
          <Text style={styles.actionBtnText}>التفاصيل</Text>
        </TouchableOpacity>

        {ad.contactWhatsapp && (
          <TouchableOpacity style={[styles.actionBtn, styles.whatsappBtn]} onPress={handleWhatsApp}>
            <MessageCircle size={14} color={COLORS.white} />
            <Text style={[styles.actionBtnText, { color: COLORS.white }]}>واتساب</Text>
          </TouchableOpacity>
        )}

        {ad.contactPhone && (
          <TouchableOpacity style={[styles.actionBtn, styles.callBtn]} onPress={handleCall}>
            <Phone size={14} color={COLORS.white} />
            <Text style={[styles.actionBtnText, { color: COLORS.white }]}>اتصال</Text>
          </TouchableOpacity>
        )}

        {isAdmin && onDelete && (
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
            <Text style={[styles.actionBtnText, { color: COLORS.white }]}>حذف</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  featuredText: { color: COLORS.white, fontSize: 10, fontWeight: "700" },
  row: { flexDirection: "row", gap: 10, marginBottom: 10 },
  imageContainer: { width: 90, height: 90 },
  image: { width: 90, height: 90, borderRadius: 8 },
  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#F0FFF4",
    justifyContent: "center",
    alignItems: "center",
  },
  typeIcon: { fontSize: 36 },
  info: { flex: 1 },
  typeLabel: { fontSize: 16, fontWeight: "700", color: COLORS.black, marginBottom: 2 },
  breed: { fontSize: 12, color: COLORS.darkGray, marginBottom: 4 },
  statsRow: { flexDirection: "row", marginBottom: 2 },
  statText: { fontSize: 13, color: COLORS.darkGray },
  statValue: { fontWeight: "600", color: COLORS.black },
  price: { fontWeight: "700", color: "#059669", fontSize: 14 },
  detail: { fontSize: 12, color: COLORS.darkGray },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  location: { fontSize: 12, color: COLORS.darkGray },
  actions: { flexDirection: "row", gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    gap: 4,
  },
  actionBtnText: { fontSize: 12, fontWeight: "600", color: COLORS.darkGray },
  whatsappBtn: { backgroundColor: "#25D366", borderColor: "#25D366" },
  callBtn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  deleteBtn: { backgroundColor: COLORS.error, borderColor: COLORS.error },
});
