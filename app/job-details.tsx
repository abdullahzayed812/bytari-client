import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import {
  ArrowLeft,
  Briefcase,
  Check,
  Clock,
  Download,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  X,
} from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useApp } from "@/providers/AppProvider";

export default function JobDetailsScreen() {
  const router = useRouter();
  const { user } = useApp();
  const { requestId, requestType } = useLocalSearchParams();

  const { data, isLoading, error } = useQuery(
    trpc.admin.jobs.getRequestDetails.queryOptions({
      adminId: user?.id ? Number(user.id) : 0,
      requestId: requestId as string,
      requestType: requestType as any,
    })
  );
  const request = data as any;

  const handleApprove = () => {
    // Approve logic here
    Alert.alert("تمت الموافقة", "تمت الموافقة على الطلب بنجاح.");
  };

  const handleReject = () => {
    // Reject logic here
    Alert.alert("تم الرفض", "تم رفض الطلب.");
  };

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "تفاصيل الطلب",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {request && (
          <View style={styles.detailsCard}>
            <View style={styles.header}>
              <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10 }}>
                {request.type === "job_posting" && <Briefcase size={24} color={COLORS.primary} />}
                {request.type === "job_application" && <FileText size={24} color={"#28a745"} />}
                {request.type === "field_supervision" && <Shield size={24} color={"#6f42c1"} />}
                <Text style={styles.title}>{request.title}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: request.statusColor }]}>
                <Text style={styles.statusText}>{request.statusLabel}</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <User size={16} color={COLORS.darkGray} />
                <Text style={styles.infoText}>
                  {request.type === "job_posting" ? "الناشر" : "المتقدم"}: {request.applicantName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Clock size={16} color={COLORS.darkGray} />
                <Text style={styles.infoText}>تاريخ التقديم: {request.submittedDate}</Text>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={16} color={COLORS.darkGray} />
                <Text style={styles.infoText}>الموقع: {request.location}</Text>
              </View>
            </View>

            {request.details && (
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>تفاصيل</Text>
                {Object.entries(request.details).map(([key, value]) => (
                  <View key={key} style={styles.detailItem}>
                    <Text style={styles.detailKey}>{key}:</Text>
                    <Text style={styles.detailValue}>{value}</Text>
                  </View>
                ))}
              </View>
            )}

            {request.applicantInfo && (
              <View style={styles.applicantSection}>
                <Text style={styles.sectionTitle}>معلومات المتقدم</Text>
                <View style={{ alignItems: "center", marginBottom: 16 }}>
                  <Image source={{ uri: request.applicantInfo.avatar }} style={styles.avatar} />
                  <Text style={styles.applicantName}>{request.applicantInfo.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Mail size={16} color={COLORS.darkGray} />
                  <Text style={styles.infoText}>{request.applicantInfo.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Phone size={16} color={COLORS.darkGray} />
                  <Text style={styles.infoText}>{request.applicantInfo.phone}</Text>
                </View>
                {request.applicantInfo.cv && (
                  <TouchableOpacity style={styles.cvButton}>
                    <Download size={16} color={COLORS.white} />
                    <Text style={styles.cvButtonText}>تحميل السيرة الذاتية</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {request.status === "pending" && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                  <X size={20} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>رفض</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
                  <Check size={20} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>موافقة</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  infoSection: {
    marginBottom: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  detailsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  detailKey: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.black,
  },
  applicantSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
  },
  cvButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  cvButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  actionButtons: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 16,
  },
  approveButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc3545",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
});
