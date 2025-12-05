import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import { ArrowLeft, Plus, Edit3, Eye, EyeOff, Trash2, Download } from "lucide-react-native";
import Button from "../components/Button";
import { trpc } from "@/lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function HomeTipsManagementScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch Tips
  const { data: tipsData, isLoading } = useQuery(trpc.content.listTips.queryOptions({}));

  const tips = tipsData?.tips || [];



  // Toggle visibility
  const toggleVisibilityMutation = useMutation(trpc.content.toggleTipHomeVisibility.mutationOptions());

  // Delete tip
  const deleteTipMutation = useMutation(trpc.content.deleteTip.mutationOptions());

  const handleToggleHomeVisibility = (tipId: number) => {
    toggleVisibilityMutation.mutate({ id: tipId } as any, {
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.content.listTips.queryKey());
      },
    });
  };

  const handleDeleteTip = (tipId: number) => {
    Alert.alert("حذف النصيحة", "هل أنت متأكد من حذف هذه النصيحة؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deleteTipMutation.mutate({ id: tipId } as any, {
            onSuccess: () => {
              queryClient.invalidateQueries(trpc.content.listTips.queryKey());
            },
          });
        },
      },
    ]);
  };

  const handleEditTip = (tipId: number) => {
    router.push({ pathname: "/edit-tip", params: { id: tipId } });
  };

  const handleAddTip = () => {
    router.push("/add-tip");
  };

  if (isLoading) return <ActivityIndicator size="large" />;

  const visibleTips = tips.filter((tip: any) => tip.isPublished);
  const hiddenTips = tips.filter((tip: any) => !tip.isPublished);

  const renderTipCard = (tip: any, isVisible: boolean) => (
    <View key={tip.id} style={styles.tipCard}>
      <View style={styles.tipCardContent}>
        {tip.images?.length > 0 ? (

          <Image source={{ uri: tip.images[0] }} style={styles.tipImage} />
        ) : (
          null
        )}

        <View style={styles.tipDetails}>
          <Text style={styles.tipTitle} numberOfLines={2}>
            {tip.title}
          </Text>
          <Text style={styles.tipContent} numberOfLines={3}>
            {tip.summary || tip.content}
          </Text>
        </View>
      </View>

      <View style={styles.tipActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.visibilityButton]}
          onPress={() => handleToggleHomeVisibility(tip.id)}
        >
          {isVisible ? <EyeOff size={16} color={COLORS.white} /> : <Eye size={16} color={COLORS.white} />}
          <Text style={styles.actionButtonText}>{isVisible ? "إخفاء" : "إظهار"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditTip(tip.id)}>
          <Edit3 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>تعديل</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteTip(tip.id)}>
          <Trash2 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>حذف</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة النصائح - الصفحة الرئيسية",
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>إدارة أفضل النصائح</Text>
          <Text style={styles.headerSubtitle}>تحكم في النصائح التي تظهر في الصفحة الرئيسية</Text>
        </View>

        {/* Add Tip Button */}
        <View style={styles.addSection}>
          <Button
            title="إضافة نصيحة جديدة"
            onPress={handleAddTip}
            type="primary"
            size="medium"
            icon={<Plus size={16} color={COLORS.white} />}
          />
        </View>

        {/* Visible Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>النصائح المعروضة ({visibleTips.length})</Text>

          {visibleTips.length > 0 ? (
            visibleTips.map((tip: any) => renderTipCard(tip, true))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد نصائح معروضة</Text>
            </View>
          )}
        </View>

        {/* Hidden Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>النصائح المخفية ({hiddenTips.length})</Text>

          {hiddenTips.length > 0 ? (
            hiddenTips.map((tip: any) => renderTipCard(tip, false))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد نصائح مخفية</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  backButton: { padding: 8 },
  content: { flex: 1 },
  header: { padding: 20, backgroundColor: COLORS.white, marginBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: COLORS.black, textAlign: "right", marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: COLORS.darkGray, textAlign: "right" },
  addSection: { padding: 20, backgroundColor: COLORS.white, marginBottom: 10 },
  section: { padding: 20, backgroundColor: COLORS.white, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.black, textAlign: "right", marginBottom: 15 },
  tipCard: { backgroundColor: COLORS.lightGray, borderRadius: 12, padding: 16, marginBottom: 12 },
  tipCardContent: { flexDirection: "row-reverse", marginBottom: 12 },
  tipImage: { width: 80, height: 80, borderRadius: 8 },
  tipDetails: { flex: 1, marginRight: 16 },
  tipTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.black, textAlign: "right", marginBottom: 8 },
  tipContent: { fontSize: 14, color: COLORS.darkGray, textAlign: "right" },
  tipActions: { flexDirection: "row-reverse", justifyContent: "space-between", gap: 8 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  visibilityButton: { backgroundColor: COLORS.info },
  editButton: { backgroundColor: COLORS.primary },
  deleteButton: { backgroundColor: COLORS.error },
  actionButtonText: { color: COLORS.white, fontSize: 14, fontWeight: "600" },
  emptyState: { padding: 40, alignItems: "center" },
  emptyStateText: { fontSize: 16, color: COLORS.darkGray },
});
