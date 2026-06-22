import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import React, { useMemo, useState } from "react";
import { COLORS } from "../constants/colors";
import { Stack } from "expo-router";
import { Calendar, Clock, MapPin, Phone, CheckCircle, XCircle, AlertCircle, RefreshCcw } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useApp } from "../providers/AppProvider";

type FilterType = "all" | "pending" | "confirmed" | "counter_proposed" | "done";

const STATUS_LABEL: Record<string, string> = {
  pending: "في الانتظار",
  confirmed: "مؤكد",
  cancelled: "ملغي",
  counter_proposed: "اقتراح بديل",
  completed: "مكتمل",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "#FF9800",
  confirmed: "#4CAF50",
  cancelled: "#F44336",
  counter_proposed: "#9C27B0",
  completed: "#2196F3",
};

export default function AppointmentsScreen() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  const { data, isLoading, error, refetch } = useQuery({
    ...trpc.clinics.appointments.getForOwner.queryOptions({ ownerId: Number(user?.id) }),
    enabled: !!user?.id,
  });

  const respondMutation = useMutation(trpc.clinics.appointments.respondToCounterProposal.mutationOptions());

  const appointments: any[] = useMemo(() => (data as any)?.appointments ?? [], [data]);

  const filtered = useMemo(() => {
    if (selectedFilter === "all") return appointments;
    if (selectedFilter === "done") return appointments.filter((a) => a.status === "completed" || a.status === "cancelled");
    return appointments.filter((a) => a.status === selectedFilter);
  }, [appointments, selectedFilter]);

  const handleRespond = (appointmentId: number, accept: boolean) => {
    Alert.alert(
      accept ? "قبول الموعد البديل" : "رفض الموعد البديل",
      accept ? "هل تريد قبول الموعد البديل الذي اقترحته العيادة؟" : "هل تريد رفض الموعد البديل؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: accept ? "قبول" : "رفض",
          style: accept ? "default" : "destructive",
          onPress: () => {
            respondMutation.mutate(
              { appointmentId, accept },
              {
                onSuccess: () => refetch(),
                onError: (e) => Alert.alert("خطأ", e.message),
              },
            );
          },
        },
      ],
    );
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "الكل" },
    { key: "pending", label: "في الانتظار" },
    { key: "confirmed", label: "المؤكدة" },
    { key: "counter_proposed", label: "اقتراح بديل" },
    { key: "done", label: "المنتهية" },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "مواعيدي",
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black },
          headerTintColor: COLORS.black,
        }}
      />

      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, selectedFilter === f.key && styles.filterBtnActive]}
              onPress={() => setSelectedFilter(f.key)}
            >
              <Text style={[styles.filterBtnText, selectedFilter === f.key && styles.filterBtnTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyTitle}>جاري التحميل...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AlertCircle size={48} color={COLORS.error} />
          <Text style={styles.emptyTitle}>حدث خطأ</Text>
          <Text style={styles.emptyDesc}>{(error as any).message}</Text>
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.center}>
              <Calendar size={56} color={COLORS.lightGray} />
              <Text style={styles.emptyTitle}>لا توجد مواعيد</Text>
            </View>
          ) : (
            filtered.map((appt) => {
              const statusColor = STATUS_COLOR[appt.status] ?? "#757575";
              const statusLabel = STATUS_LABEL[appt.status] ?? appt.status;
              const isCounterProposed = appt.status === "counter_proposed";

              return (
                <View key={appt.id} style={styles.card}>
                  {/* Header: clinic + status */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + "22", borderColor: statusColor }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                    <Text style={styles.clinicName}>{appt.clinic?.name ?? "—"}</Text>
                  </View>

                  {/* Pet */}
                  {appt.pet && (
                    <View style={styles.petRow}>
                      {appt.pet.image ? (
                        <Image source={{ uri: appt.pet.image }} style={styles.petImage} />
                      ) : (
                        <View style={[styles.petImage, { backgroundColor: COLORS.lightGray }]} />
                      )}
                      <View>
                        <Text style={styles.petName}>{appt.pet.name}</Text>
                        <Text style={styles.petType}>{appt.pet.type}</Text>
                      </View>
                    </View>
                  )}

                  {/* Original date */}
                  <View style={styles.infoRow}>
                    <Calendar size={15} color={COLORS.primary} />
                    <Text style={styles.infoLabel}>الموعد</Text>
                    <Text style={styles.infoValue}>
                      {new Date(appt.appointmentDate).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}
                    </Text>
                  </View>

                  {/* Counter-proposed date */}
                  {isCounterProposed && appt.counterProposedDate && (
                    <View style={[styles.infoRow, styles.counterRow]}>
                      <RefreshCcw size={15} color="#9C27B0" />
                      <Text style={[styles.infoLabel, { color: "#9C27B0" }]}>موعد بديل مقترح</Text>
                      <Text style={[styles.infoValue, { color: "#9C27B0", fontWeight: "700" }]}>
                        {new Date(appt.counterProposedDate).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}
                      </Text>
                    </View>
                  )}

                  {/* Counter notes */}
                  {isCounterProposed && appt.counterProposedNotes && (
                    <Text style={styles.counterNotes}>{appt.counterProposedNotes}</Text>
                  )}

                  {/* Clinic contact */}
                  {appt.clinic?.phone && (
                    <View style={styles.infoRow}>
                      <Phone size={15} color={COLORS.darkGray} />
                      <Text style={styles.infoValue}>{appt.clinic.phone}</Text>
                    </View>
                  )}

                  {appt.clinic?.address && (
                    <View style={styles.infoRow}>
                      <MapPin size={15} color={COLORS.darkGray} />
                      <Text style={styles.infoValue}>{appt.clinic.address}</Text>
                    </View>
                  )}

                  {/* Notes */}
                  {appt.notes && (
                    <Text style={styles.notes}>{appt.notes}</Text>
                  )}

                  {/* Requested by */}
                  <Text style={styles.requestedBy}>
                    {appt.requestedByClinic ? "طلبه: العيادة" : "طلبته: أنت"}
                  </Text>

                  {/* Accept / Reject counter-proposal */}
                  {isCounterProposed && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
                        onPress={() => handleRespond(appt.id, true)}
                        disabled={respondMutation.isPending}
                      >
                        <CheckCircle size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>قبول الموعد البديل</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: COLORS.error }]}
                        onPress={() => handleRespond(appt.id, false)}
                        disabled={respondMutation.isPending}
                      >
                        <XCircle size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>رفض</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray },
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterContent: { paddingHorizontal: 16, gap: 10, flexDirection: "row" },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterBtnText: { fontSize: 13, color: COLORS.darkGray, fontWeight: "500" },
  filterBtnTextActive: { color: COLORS.white },
  list: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 64 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.darkGray, marginTop: 12 },
  emptyDesc: { fontSize: 14, color: COLORS.darkGray, textAlign: "center", marginTop: 4 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  clinicName: { fontSize: 15, fontWeight: "700", color: COLORS.black },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  petRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.gray,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  petImage: { width: 42, height: 42, borderRadius: 21 },
  petName: { fontSize: 14, fontWeight: "700", color: COLORS.black },
  petType: { fontSize: 12, color: COLORS.darkGray },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  infoLabel: { fontSize: 13, color: COLORS.darkGray },
  infoValue: { fontSize: 13, color: COLORS.black, flex: 1, textAlign: "right" },
  counterRow: {
    backgroundColor: "#F3E5F5",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  counterNotes: {
    fontSize: 12,
    color: "#9C27B0",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  notes: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  requestedBy: {
    fontSize: 11,
    color: COLORS.darkGray,
    textAlign: "left",
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
