import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../../constants/colors";
import { useApp } from "../../providers/AppProvider";
import { useRouter, Stack } from "expo-router";
import Button from "../../components/Button";
import { MapPin, Plus, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { trpc } from "../../lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/providers/ToastProvider";

export default function ReportLostPetScreen() {
  const { user } = useApp();
  const router = useRouter();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();

  // Pet Information
  const [name, setName] = useState("Buddy");
  const [type, setType] = useState("Dog");
  const [breed, setBreed] = useState("Golden Retriever");
  const [color, setColor] = useState("Golden");
  const [age, setAge] = useState("3");
  const [weight, setWeight] = useState("25"); // in kg
  const [gender, setGender] = useState("Male");
  const [image, setImage] = useState<string | null>("https://example.com/images/buddy-main.jpg");
  const [additionalImages, setAdditionalImages] = useState<string[]>([
    "https://example.com/images/buddy-1.jpg",
    "https://example.com/images/buddy-2.jpg",
  ]);

  // Lost Pet Specific (REQUIRED)
  const [lastSeenLocation, setLastSeenLocation] = useState("Central Park, New York");
  const [lastSeenDate, setLastSeenDate] = useState(new Date().toISOString().split("T")[0]);
  const [latitude, setLatitude] = useState<number | undefined>(40.785091);
  const [longitude, setLongitude] = useState<number | undefined>(-73.968285);
  const [reward, setReward] = useState("100");

  // Additional Information
  const [description, setDescription] = useState(
    "Friendly and playful. Responds to the name Buddy. Has a blue collar."
  );
  const [specialRequirements, setSpecialRequirements] = useState("Needs daily medication for allergies.");

  // Contact Information
  const [contactName, setContactName] = useState("John Doe");
  const [contactPhone, setContactPhone] = useState("+1 555-123-4567");
  const [contactEmail, setContactEmail] = useState("johndoe@example.com");

  // Documents
  const [ownershipProof, setOwnershipProof] = useState<string | null>("https://example.com/docs/ownership-proof.pdf");
  const [veterinaryCertificate, setVeterinaryCertificate] = useState<string | null>(
    "https://example.com/docs/vet-certificate.pdf"
  );

  const createApprovalMutation = useMutation(trpc.pets.createApprovalRequest.mutationOptions({}));

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

  const handleAddAdditionalImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAdditionalImages([...additionalImages, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const handleAddOwnershipProof = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setOwnershipProof(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleAddVeterinaryCertificate = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVeterinaryCertificate(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleSelectLocation = () => {
    // Navigate to map to select location
    // When returning from map, set latitude and longitude
    router.push({
      pathname: "/map-location",
      params: { returnTo: "report-lost-pet" },
    });
  };

  const handleSubmit = () => {
    // Validation
    if (!name || !type || !lastSeenLocation || !lastSeenDate) {
      showToast({
        type: "error",
        message: "يرجى ملء جميع الحقول المطلوبة (الاسم، النوع، آخر مكان، التاريخ)",
      });
      return;
    }

    if (!contactName || !contactPhone) {
      showToast({
        type: "error",
        message: "يرجى إدخال معلومات الاتصال (الاسم ورقم الهاتف)",
      });
      return;
    }

    if (!user) {
      showToast({ type: "error", message: "يرجى تسجيل الدخول أولاً" });
      return;
    }

    // Prepare images array (main image + additional images)
    const allImages = [image, ...additionalImages].filter(Boolean) as string[];

    // Prepare contact info string
    const contactInfo = `${contactName} - ${contactPhone}${contactEmail ? ` - ${contactEmail}` : ""}`;

    // Parse date to Date object
    const parsedDate = new Date(lastSeenDate);

    createApprovalMutation.mutate(
      {
        // Pet basic info
        name: name.trim(),
        type: type.trim(),
        breed: breed.trim() || undefined,
        age: age ? parseInt(age) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        color: color.trim() || undefined,
        gender: gender.trim() || undefined,
        image: image || undefined,

        // Documents
        ownershipProof: ownershipProof || undefined,
        veterinaryCertificate: veterinaryCertificate || undefined,

        // Owner
        ownerId: parseInt(user.id.toString()),

        // Request type
        requestType: "lost_pet",

        // Lost pet specific (REQUIRED)
        lastSeenLocation: lastSeenLocation.trim(),
        lastSeenDate: parsedDate,
        latitude: latitude,
        longitude: longitude,

        // Additional info
        description: description.trim() || undefined,
        images: allImages.length > 0 ? allImages : undefined,
        contactInfo: contactInfo,
        location: lastSeenLocation.trim(), // Use lastSeenLocation as location
        reward: reward ? parseFloat(reward) : undefined,
        specialRequirements: specialRequirements.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          showToast({
            type: "success",
            message: data?.message || "تم إرسال البلاغ بنجاح وهو الآن قيد المراجعة.",
          });
          router.navigate("(tabs)/");
          // queryClient.invalidateQueries(trpc.pets.getApproved.queryKey);
        },
        onError: (error: any) => {
          console.error("Error submitting lost pet report:", error);
          showToast({
            type: "error",
            message: error?.message || "حدث خطأ أثناء إرسال البلاغ. حاول مرة أخرى.",
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

      <ScrollView style={[styles.container, { direction: "rtl" }]} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>تقرير حيوان مفقود</Text>

        {/* Main Image */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>صورة الحيوان الرئيسية</Text>
          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
                <X size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
              <Plus size={24} color={COLORS.primary} />
              <Text style={styles.addImageText}>إضافة صورة</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Additional Images */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>صور إضافية (اختياري)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {additionalImages.map((img, index) => (
              <View key={index} style={styles.additionalImageContainer}>
                <Image source={{ uri: img }} style={styles.additionalImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveAdditionalImage(index)}>
                  <X size={12} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addAdditionalImageButton} onPress={handleAddAdditionalImage}>
              <Plus size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الحيوان الأساسية</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>اسم الحيوان *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="أدخل اسم الحيوان"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>نوع الحيوان *</Text>
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

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>العمر (اختياري)</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="السنوات"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>الوزن (كجم)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="الوزن"
                placeholderTextColor={COLORS.darkGray}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>الجنس (اختياري)</Text>
            <TextInput
              style={styles.input}
              value={gender}
              onChangeText={setGender}
              placeholder="ذكر / أنثى"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>
        </View>

        {/* Lost Pet Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل الفقدان</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>آخر مكان شوهد فيه *</Text>
            <View style={styles.locationContainer}>
              <TextInput
                style={styles.locationInput}
                value={lastSeenLocation}
                onChangeText={setLastSeenLocation}
                placeholder="أدخل آخر مكان شوهد فيه"
                placeholderTextColor={COLORS.darkGray}
              />
              <TouchableOpacity style={styles.mapButton} onPress={handleSelectLocation}>
                <MapPin size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>تاريخ آخر مشاهدة *</Text>
            <TextInput
              style={styles.input}
              value={lastSeenDate}
              onChangeText={setLastSeenDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>المكافأة (اختياري)</Text>
            <TextInput
              style={styles.input}
              value={reward}
              onChangeText={setReward}
              placeholder="المكافأة بالدينار"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="numeric"
            />
          </View>
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>متطلبات خاصة (اختياري)</Text>
          <TextInput
            style={styles.textArea}
            value={specialRequirements}
            onChangeText={setSpecialRequirements}
            placeholder="أي متطلبات أو احتياطات خاصة"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الاتصال</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>الاسم *</Text>
            <TextInput
              style={styles.input}
              value={contactName}
              onChangeText={setContactName}
              placeholder="أدخل اسمك"
              placeholderTextColor={COLORS.darkGray}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>رقم الهاتف *</Text>
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

        {/* Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المستندات (اختياري)</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>إثبات الملكية</Text>
            {ownershipProof ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: ownershipProof }} style={styles.image} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => setOwnershipProof(null)}>
                  <X size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addImageButton} onPress={handleAddOwnershipProof}>
                <Plus size={24} color={COLORS.primary} />
                <Text style={styles.addImageText}>إضافة إثبات ملكية</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>شهادة بيطرية</Text>
            {veterinaryCertificate ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: veterinaryCertificate }} style={styles.image} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => setVeterinaryCertificate(null)}>
                  <X size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addImageButton} onPress={handleAddVeterinaryCertificate}>
                <Plus size={24} color={COLORS.primary} />
                <Text style={styles.addImageText}>إضافة شهادة بيطرية</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Button
          title="إرسال البلاغ"
          onPress={handleSubmit}
          type="primary"
          size="large"
          style={styles.submitButton}
          loading={createApprovalMutation.isPending}
          disabled={
            !name ||
            !type ||
            !lastSeenLocation ||
            !lastSeenDate ||
            !contactName ||
            !contactPhone ||
            createApprovalMutation.isPending
          }
        />

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
  additionalImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    position: "relative",
  },
  additionalImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  addAdditionalImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
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
