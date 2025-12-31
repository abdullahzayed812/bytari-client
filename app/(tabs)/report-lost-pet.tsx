import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../../constants/colors";
import { useApp } from "../../providers/AppProvider";
import { useRouter, Stack } from "expo-router";
import Button from "../../components/Button";
import { MapPin } from "lucide-react-native";
import { trpc } from "../../lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageGalleryUploader } from "../../components/ImageGalleryUploader";

export default function ReportLostPetScreen() {
  const { user } = useApp();
  const router = useRouter();

  const [name, setName] = useState("Buddy");
  const [type, setType] = useState("Dog");
  const [breed, setBreed] = useState("Golden Retriever");
  const [color, setColor] = useState("Golden");
  const [location, setLocation] = useState("Central Park, New York");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState(
    "Friendly and well-trained. Last seen wearing a blue collar. Please contact if found."
  );
  const [contactName, setContactName] = useState(user?.name || "John Doe");
  const [contactPhone, setContactPhone] = useState("+1 555 123 4567");
  const [contactEmail, setContactEmail] = useState(user?.email || "john@example.com");
  const [images, setImages] = useState<string[]>(["https://images.unsplash.com/photo-1601758228041-f3b2795255f1"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create pet approval request mutation
  const createApprovalMutation = useMutation(trpc.pets.createApprovalRequest.mutationOptions({}));

  // Image upload is now handled by ImageGalleryUploader component

  const handleSelectLocation = () => {
    router.push({
      pathname: "/map-location",
      params: {
        returnTo: "report-lost-pet",
      },
    });
  };

  const handleSubmit = async () => {
    if (!name || !type || !location || !contactName || !contactPhone) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (!user) {
      Alert.alert("خطأ", "يرجى تسجيل الدخول أولاً");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create pet approval request for lost pet
      createApprovalMutation.mutate(
        {
          name: name.trim(),
          type: type.trim(),
          breed: breed.trim() || undefined,
          color: color.trim() || undefined,
          image: images[0] || "https://images.unsplash.com/photo-1601758228041-f3b2795255f1",
          ownerId: parseInt(user?.id.toString()),
          requestType: "lost_pet",
          description: `${description}\n\nتاريخ الفقدان: ${date}\nاسم المبلغ: ${contactName}\nرقم الهاتف: ${contactPhone}${
            contactEmail ? `\nالبريد الإلكتروني: ${contactEmail}` : ""
          }`,
          images: images,
          contactInfo: `${contactName} - ${contactPhone}${contactEmail ? ` - ${contactEmail}` : ""}`,
          lastSeenLocation: location.trim(),
          lastSeenDate: new Date(date),
        } as any,
        {
          onSuccess: (data) => {
            Alert.alert(
              "تم إرسال البلاغ",
              "تم إرسال بلاغ الحيوان المفقود بنجاح وهو الآن في انتظار موافقة الإدارة. سيتم إشعارك عند اتخاذ قرار بشأن البلاغ.",
              [
                {
                  text: "موافق",
                  onPress: () => {
                    router.back();
                  },
                },
              ]
            );
          },
          onError: (error) => {
            Alert.alert("خطأ", error.message || "حدث خطأ أثناء إرسال البلاغ");
          },
        }
      );
    } catch (error) {
      console.error("Error submitting lost pet report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "بلاغ حيوان مفقود",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          presentation: "modal",
        }}
      />

      <ScrollView style={[styles.container, { direction: "rtl" }]} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{"تقرير حيوان مفقود"}</Text>

        <View style={styles.formGroup}>
          <ImageGalleryUploader
            images={images}
            onImagesChange={setImages}
            maxImages={5}
            label="صور الحيوان المفقود"
            aspect={[4, 3]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>اسم الحيوان</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="أدخل اسم الحيوان"
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>نوع الحيوان</Text>
          <TextInput
            style={styles.input}
            value={type}
            onChangeText={setType}
            placeholder="مثال: كلب، قطة، أرنب"
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>السلالة (اختياري)</Text>
            <TextInput
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
              placeholder="السلالة"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>اللون (اختياري)</Text>
            <TextInput
              style={styles.input}
              value={color}
              onChangeText={setColor}
              placeholder="اللون"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>آخر مكان شوهد فيه</Text>
          <View style={styles.locationContainer}>
            <TextInput
              style={styles.locationInput}
              value={location}
              onChangeText={setLocation}
              placeholder="أدخل الموقع"
              placeholderTextColor={COLORS.darkGray}
            />
            <TouchableOpacity style={styles.mapButton} onPress={handleSelectLocation}>
              <MapPin size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>تاريخ الفقدان</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>وصف إضافي (اختياري)</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="أي معلومات إضافية قد تساعد في العثور على الحيوان"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الاتصال</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>الاسم</Text>
            <TextInput
              style={styles.input}
              value={contactName}
              onChangeText={setContactName}
              placeholder="أدخل اسمك"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>رقم الهاتف</Text>
            <TextInput
              style={styles.input}
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="أدخل رقم هاتفك"
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>البريد الإلكتروني (اختياري)</Text>
            <TextInput
              style={styles.input}
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder="أدخل بريدك الإلكتروني"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>
        </View>

        <Button
          title="إرسال البلاغ"
          onPress={handleSubmit}
          type="primary"
          size="large"
          style={styles.submitButton}
          loading={isSubmitting}
          disabled={
            !name ||
            !type ||
            !location ||
            !contactName ||
            !contactPhone ||
            isSubmitting ||
            createApprovalMutation.isPending
          }
        />

        {/* Notice */}
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>
            📋 ملاحظة: سيتم مراجعة بلاغك من قبل الإدارة قبل النشر. سيتم إشعارك عند الموافقة على البلاغ.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: COLORS.black,
    textAlign: "right",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: COLORS.black,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "right",
    writingDirection: "rtl",
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlign: "right",
    writingDirection: "rtl",
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 8,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    width: 150,
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 8,
    textAlign: "center",
  },
  locationContainer: {
    flexDirection: "row-reverse",
  },
  locationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    textAlign: "right",
    writingDirection: "rtl",
  },
  mapButton: {
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.black,
    textAlign: "right",
  },
  submitButton: {
    width: "100%",
    marginBottom: 16,
  },
  noticeContainer: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  noticeText: {
    fontSize: 14,
    color: "#1976D2",
    textAlign: "right",
    lineHeight: 20,
  },
});
