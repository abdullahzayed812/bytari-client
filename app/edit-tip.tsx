import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "../constants/colors";
import { ArrowLeft, Save, Upload } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import Button from "../components/Button";

export default function EditTipScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();
  const tipId = Number(id);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    category: "",
    image: "",
  });

  // Fetch tip
  const { data, isLoading } = useQuery(trpc.content.getTipById.queryOptions({ id: tipId }));

  const updateTipMutation = useMutation(trpc.content.updateTip.mutationOptions());

  useEffect(() => {
    if (data?.tip) {
      const tip = data.tip;

      const images = tip.images ? JSON.parse(tip.images) : [];
      const image = images[0] || "";

      setFormData({
        title: tip.title,
        content: tip.content,
        summary: tip.summary || "",
        category: tip.category,
        image,
      });
    }
  }, [data]);

  const handleSave = () => {
    updateTipMutation.mutate(
      {
        id: tipId,
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        category: formData.category,
        images: [formData.image], // server expects array
      } as any,
      {
        onSuccess: () => {
          queryClient.invalidateQueries(trpc.content.getTipById.queryKey());
          queryClient.invalidateQueries(trpc.content.listTips.queryKey());
          Alert.alert("تم", "تم تحديث النصيحة بنجاح");
          router.back();
        },
        onError: (e: any) => {
          Alert.alert("خطأ", e.message || "حدث خطأ أثناء التحديث");
        },
      }
    );
  };

  if (isLoading)
    return (
      <View style={{ marginTop: 80 }}>
        <Text style={{ textAlign: "center" }}>جاري التحميل...</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "تعديل النصيحة",
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
        <View style={styles.form}>
          {/* Image Section */}
          <View style={styles.imageSection}>
            <Image
              source={{
                uri: formData.image || "https://placehold.co/200x120?text=No+Image",
              }}
              style={styles.tipImage}
            />
            <TouchableOpacity style={styles.uploadButton}>
              <Upload size={16} color={COLORS.white} />
              <Text style={styles.uploadButtonText}>تغيير الصورة</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان النصيحة</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="أدخل عنوان النصيحة"
              textAlign="right"
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>التصنيف</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              placeholder="أدخل تصنيف النصيحة"
              textAlign="right"
            />
          </View>

          {/* Summary */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الملخص</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={formData.summary}
              onChangeText={(text) => setFormData({ ...formData, summary: text })}
              placeholder="اكتب ملخصًا مختصرًا"
              textAlign="right"
              multiline
            />
          </View>

          {/* Content */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>محتوى النصيحة</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              placeholder="أدخل محتوى النصيحة"
              textAlign="right"
              multiline
              numberOfLines={6}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={updateTipMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          onPress={handleSave}
          type="primary"
          size="large"
          icon={<Save size={20} color={COLORS.white} />}
          disabled={updateTipMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  backButton: { padding: 8 },
  content: { flex: 1 },
  form: {
    padding: 20,
    backgroundColor: COLORS.white,
    margin: 10,
    borderRadius: 12,
  },
  imageSection: { alignItems: "center", marginBottom: 24 },
  tipImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonText: { color: COLORS.white, fontSize: 14, fontWeight: "600" },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  textArea: { height: 140, textAlignVertical: "top" },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});
