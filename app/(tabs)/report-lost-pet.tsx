import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  I18nManager,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import Button from "../../components/Button";
import {
  Calendar,
  Clipboard,
  Droplet,
  Heart,
  MapPin,
  Plus,
  User,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Pet } from "../../types";
import { trpc } from "../../lib/trpc";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/lib/hooks";
import { useToastContext } from "@/providers/ToastProvider";

export default function ReportLostPetScreen() {
  const { user } = useApp();
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [breed, setBreed] = useState("");
  const [color, setColor] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [vaccinations, setVaccinations] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToastContext();

  const createApprovalMutation = useMutation(
    trpc.pets.createApprovalRequest.mutationOptions({})
  );

  const handleAddImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleSelectLocation = () => {
    router.push({
      pathname: "/map-location",
      params: { returnTo: "report-lost-pet" },
    });
  };

  const handleSubmit = () => {
    if (!name || !type || !location || !contactName || !contactPhone) {
      showToast({ type: "error", message: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }

    if (!user) {
      showToast({ type: "error", message: "يرجى تسجيل الدخول أولاً" });
      return;
    }

    setIsSubmitting(true);

    createApprovalMutation.mutate(
      {
        name: name.trim(),
        type: type.trim(),
        breed: breed.trim() || undefined,
        age: age ? parseInt(age) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        color: color.trim() || undefined,
        gender: gender.trim() || undefined,
        image:
          image ||
          "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=80",
        medicalHistory: medicalHistory.trim() || undefined,
        vaccinations: vaccinations.trim() || undefined,
        ownerId: parseInt(user.id.toString()),
        requestType: "lost_pet",
        description: `${description}\n\n📅 تاريخ الفقدان: ${date}\n👤 اسم المبلغ: ${contactName}\n📞 رقم الهاتف: ${contactPhone}${
          contactEmail ? `\n✉️ البريد الإلكتروني: ${contactEmail}` : ""
        }`,
        images: image ? [image] : [],
        contactInfo: `${contactName} - ${contactPhone}${
          contactEmail ? ` - ${contactEmail}` : ""
        }`,
        location: location.trim(),
      },
      {
        onSuccess: (data) => {
          showToast({
            type: "success",
            message:
              data?.message || "تم إرسال البلاغ بنجاح وهو الآن قيد المراجعة.",
          });
          router.navigate("(tabs)/");
        },
        onError: (error: any) => {
          showToast({
            type: "error",
            message:
              error?.message || "حدث خطأ أثناء إرسال البلاغ. حاول مرة أخرى.",
          });
        },
      }
    );
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

      <ScrollView
        style={[styles.container, { direction: "rtl" }]}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>تقرير حيوان مفقود</Text>

        {/* Image */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>صورة الحيوان</Text>
          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
              >
                <X size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handleAddImage}
            >
              <Plus size={24} color={COLORS.primary} />
              <Text style={styles.addImageText}>إضافة صورة</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Info */}
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

        {/* Optional Details with icons */}
        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>
              <User size={14} /> السلالة (اختياري)
            </Text>
            <TextInput
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
              placeholder="السلالة"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>
              <Droplet size={14} /> اللون (اختياري)
            </Text>
            <TextInput
              style={styles.input}
              value={color}
              onChangeText={setColor}
              placeholder="اللون"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>
              <Calendar size={14} /> العمر (اختياري)
            </Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="عدد السنوات"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>
              <Heart size={14} /> الوزن (اختياري)
            </Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="بالكيلوجرام"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            <User size={14} /> الجنس (اختياري)
          </Text>
          <TextInput
            style={styles.input}
            value={gender}
            onChangeText={setGender}
            placeholder="ذكر / أنثى"
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            <Clipboard size={14} /> التاريخ الطبي (اختياري)
          </Text>
          <TextInput
            style={styles.textArea}
            value={medicalHistory}
            onChangeText={setMedicalHistory}
            placeholder="أي معلومات طبية مهمة"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            <Clipboard size={14} /> التطعيمات (اختياري)
          </Text>
          <TextInput
            style={styles.textArea}
            value={vaccinations}
            onChangeText={setVaccinations}
            placeholder="التطعيمات التي تلقاها الحيوان"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        {/* Location */}
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
            <TouchableOpacity
              style={styles.mapButton}
              onPress={handleSelectLocation}
            >
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

        {/* Description */}
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

        {/* Contact Info */}
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

        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>
            📋 ملاحظة: سيتم مراجعة بلاغك من قبل الإدارة قبل النشر. سيتم إشعارك
            عند الموافقة على البلاغ.
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
