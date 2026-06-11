import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, ScrollView, Linking } from "react-native";
import { Phone, MessageCircle, MapPin, Clock, X, Trash2 } from "lucide-react-native";
import { COLORS } from "../../constants/colors";

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
    sellerId?: number | null;
    poultryType: string;
    breed?: string | null;
    quantity: number;
    unit: string;
    pricePerUnit?: string | null;
    totalPrice?: string | null;
    pricingMethod?: string | null;
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
    sellerPhone?: string | null;
  };
  currentUserId?: number | null;
  onDelete?: () => void;
}

function formatDateTime(date: string | Date) {
  const d = new Date(date);
  return (
    d.toLocaleDateString("ar-SA") +
    " • " +
    d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
  );
}

export function PoultryMarketCard({ ad, currentUserId, onDelete }: PoultryMarketCardProps) {
  const [showModal, setShowModal] = useState(false);
  const typeLabel = POULTRY_TYPE_LABELS[ad.poultryType] || ad.poultryType;
  const typeIcon = POULTRY_TYPE_ICONS[ad.poultryType] || "🐔";
  const unitLabel = ad.unit === "bird" ? "طير" : ad.unit;
  const firstImage = ad.images?.[0];

  const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);
  const handleWhatsApp = (phone: string) => {
    Linking.openURL(`https://wa.me/${phone.replace(/\D/g, "")}`);
  };

  return (
    <>
      <View style={styles.card}>
        {ad.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>مميز</Text>
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.imageContainer}>
            {firstImage ? (
              <Image source={{ uri: firstImage }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.typeIcon}>{typeIcon}</Text>
              </View>
            )}
          </View>

          <View style={styles.info}>
            <Text style={styles.typeLabel}>{typeLabel}</Text>
            {ad.breed && <Text style={styles.breed}>{ad.breed}</Text>}

            <Text style={styles.statText}>
              الكمية:{" "}
              <Text style={styles.statValue}>
                {ad.quantity.toLocaleString()} {unitLabel}
              </Text>
            </Text>

            {ad.pricePerUnit && (
              <Text style={styles.statText}>
                السعر: <Text style={styles.price}>{Number(ad.pricePerUnit).toLocaleString()} د.ع</Text>
              </Text>
            )}

            {ad.ageWeeks != null && (
              <Text style={styles.detail}>العمر: {ad.ageWeeks} أسبوع</Text>
            )}

            {(ad.governorate || ad.region) && (
              <View style={styles.locationRow}>
                <MapPin size={12} color={COLORS.darkGray} />
                <Text style={styles.location}>{[ad.governorate, ad.region].filter(Boolean).join(" - ")}</Text>
              </View>
            )}

            <View style={styles.dateRow}>
              <Clock size={11} color={COLORS.darkGray} />
              <Text style={styles.dateText}>{formatDateTime(ad.createdAt)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.actionBtnText}>التفاصيل</Text>
          </TouchableOpacity>

          {ad.contactWhatsapp && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.whatsappBtn]}
              onPress={() => handleWhatsApp(ad.contactWhatsapp!)}
            >
              <MessageCircle size={14} color={COLORS.white} />
              <Text style={[styles.actionBtnText, { color: COLORS.white }]}>واتساب</Text>
            </TouchableOpacity>
          )}

          {ad.contactPhone && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.callBtn]}
              onPress={() => handleCall(ad.contactPhone!)}
            >
              <Phone size={14} color={COLORS.white} />
              <Text style={[styles.actionBtnText, { color: COLORS.white }]}>اتصال</Text>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
              <Trash2 size={14} color={COLORS.white} />
              <Text style={[styles.actionBtnText, { color: COLORS.white }]}>حذف</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Details Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{typeIcon} {typeLabel}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {ad.images && ad.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                  {ad.images.map((uri, i) => (
                    <Image key={i} source={{ uri }} style={styles.modalImage} />
                  ))}
                </ScrollView>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>معلومات الإعلان</Text>
                {ad.breed && <DetailRow label="السلالة" value={ad.breed} />}
                <DetailRow label="الكمية" value={`${ad.quantity.toLocaleString()} ${unitLabel}`} />
                {ad.pricePerUnit && (
                  <DetailRow label="السعر للوحدة" value={`${Number(ad.pricePerUnit).toLocaleString()} د.ع`} valueColor="#059669" />
                )}
                {ad.totalPrice && (
                  <DetailRow label="السعر الإجمالي" value={`${Number(ad.totalPrice).toLocaleString()} د.ع`} valueColor="#059669" />
                )}
                {ad.ageWeeks != null && <DetailRow label="العمر" value={`${ad.ageWeeks} أسبوع`} />}
                {ad.weightKg && <DetailRow label="الوزن" value={`${ad.weightKg} كغ`} />}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>الموقع</Text>
                {ad.governorate && <DetailRow label="المحافظة" value={ad.governorate} />}
                {ad.region && <DetailRow label="المنطقة" value={ad.region} />}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>معلومات البائع</Text>
                {ad.sellerName && <DetailRow label="الاسم" value={ad.sellerName} />}
                {ad.contactPhone && <DetailRow label="الهاتف" value={ad.contactPhone} />}
                {ad.contactWhatsapp && <DetailRow label="واتساب" value={ad.contactWhatsapp} />}
              </View>

              {ad.notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>ملاحظات</Text>
                  <Text style={styles.notesText}>{ad.notes}</Text>
                </View>
              )}

              <View style={styles.section}>
                <DetailRow label="تاريخ النشر" value={formatDateTime(ad.createdAt)} />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              {ad.contactWhatsapp && (
                <TouchableOpacity
                  style={[styles.modalBtn, styles.whatsappBtn]}
                  onPress={() => handleWhatsApp(ad.contactWhatsapp!)}
                >
                  <MessageCircle size={16} color={COLORS.white} />
                  <Text style={styles.modalBtnText}>واتساب</Text>
                </TouchableOpacity>
              )}
              {ad.contactPhone && (
                <TouchableOpacity
                  style={[styles.modalBtn, styles.callBtn]}
                  onPress={() => handleCall(ad.contactPhone!)}
                >
                  <Phone size={16} color={COLORS.white} />
                  <Text style={styles.modalBtnText}>اتصال</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  style={[styles.modalBtn, styles.deleteBtn]}
                  onPress={() => { setShowModal(false); onDelete(); }}
                >
                  <Trash2 size={16} color={COLORS.white} />
                  <Text style={styles.modalBtnText}>حذف</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
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
  statText: { fontSize: 13, color: COLORS.darkGray, marginBottom: 2 },
  statValue: { fontWeight: "600", color: COLORS.black },
  price: { fontWeight: "700", color: "#059669", fontSize: 14 },
  detail: { fontSize: 12, color: COLORS.darkGray, marginBottom: 2 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  location: { fontSize: 12, color: COLORS.darkGray },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  dateText: { fontSize: 11, color: COLORS.darkGray },
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

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.black },
  imageScroll: { paddingHorizontal: 16, paddingVertical: 10 },
  modalImage: { width: 200, height: 150, borderRadius: 10, marginLeft: 10 },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.darkGray, marginBottom: 8, textAlign: "right" },
  detailRow: { flexDirection: "row-reverse", justifyContent: "space-between", paddingVertical: 4 },
  detailLabel: { fontSize: 13, color: COLORS.darkGray, flex: 1, textAlign: "right" },
  detailValue: { fontSize: 13, fontWeight: "600", color: COLORS.black, flex: 2, textAlign: "right" },
  notesText: { fontSize: 13, color: COLORS.darkGray, textAlign: "right", lineHeight: 20 },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  modalBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  modalBtnText: { color: COLORS.white, fontWeight: "600", fontSize: 14 },
});
