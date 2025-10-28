import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useApp } from "../providers/AppProvider";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

export default function AddBookScreen() {
  const { user } = useApp();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    pages: "",
    category: "",
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // const createBookMutation = trpc.admin.content.createBook.useMutation();
  const createBookMutation = useMutation(
    trpc.admin.content.createBook.mutationOptions()
  );

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("خطأ", "فشل في اختيار الصورة");
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/epub+zip",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "text/rtf",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        Alert.alert("تم", `تم اختيار الملف: ${result.assets[0].name}`);
      }
    } catch (error) {
      console.error("Document picker error:", error);
      Alert.alert("خطأ", "فشل في اختيار الملف");
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.author) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (!selectedFile) {
      Alert.alert("خطأ", "يرجى اختيار ملف الكتاب");
      return;
    }

    createBookMutation.mutate(
      {
        adminId: user?.id ? Number(user.id) : 1,
        title: formData.title,
        author: formData.author,
        description: formData.description,
        pages: formData.pages ? parseInt(formData.pages) : undefined,
        category: formData.category as any,
        coverImage: selectedImage,
        pdfUrl: selectedFile ? selectedFile.uri : undefined,
      },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم إضافة الكتاب بنجاح");
          router.back();
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "فشل في إضافة الكتاب");
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إضافة كتاب جديد",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.imageSection}>
            <View style={styles.imagePlaceholder}>
              <Image size={32} color={COLORS.darkGray} />
              <Text style={styles.imagePlaceholderText}>
                {selectedImage ? "تم اختيار الصورة" : "اختر صورة الكتاب"}
              </Text>
              <Text style={styles.imageSubText}>
                من المعرض أو التقاط صورة جديدة
              </Text>
            </View>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Upload size={16} color={COLORS.white} />
              <Text style={styles.uploadButtonText}>اختيار صورة</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fileSection}>
            <Text style={styles.sectionTitle}>ملف الكتاب *</Text>
            <View style={styles.filePlaceholder}>
              <FileText size={32} color={COLORS.primary} />
              <Text style={styles.filePlaceholderText}>
                {selectedFile ? selectedFile.name : "اختر ملف الكتاب"}
              </Text>
              <Text style={styles.fileSubText}>
                PDF, EPUB, DOC, DOCX أو ملف نصي
              </Text>
              {selectedFile && (
                <Text style={styles.fileInfo}>
                  الحجم: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.fileButton} onPress={pickDocument}>
              <Upload size={16} color={COLORS.primary} />
              <Text style={styles.fileButtonText}>
                {selectedFile ? "تغيير الملف" : "اختيار ملف الكتاب"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان الكتاب *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="أدخل عنوان الكتاب"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>المؤلف *</Text>
            <TextInput
              style={styles.input}
              value={formData.author}
              onChangeText={(text) =>
                setFormData({ ...formData, author: text })
              }
              placeholder="أدخل اسم المؤلف"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              placeholder="أدخل وصف الكتاب"
              textAlign="right"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>عدد الصفحات</Text>
            <TextInput
              style={styles.input}
              value={formData.pages}
              onChangeText={(text) => setFormData({ ...formData, pages: text })}
              placeholder="أدخل عدد الصفحات"
              textAlign="right"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>التصنيف</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) =>
                setFormData({ ...formData, category: text })
              }
              placeholder="أدخل تصنيف الكتاب"
              textAlign="right"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={
            createBookMutation.isPending ? "جاري الإضافة..." : "إضافة الكتاب"
          }
          onPress={handleSave}
          type="primary"
          size="large"
          icon={<Plus size={20} color={COLORS.white} />}
          disabled={createBookMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
    backgroundColor: COLORS.white,
    margin: 10,
    borderRadius: 12,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  imagePlaceholder: {
    width: 120,
    height: 160,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  imageSubText: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 4,
  },
  fileSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  filePlaceholder: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  filePlaceholderText: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  fileSubText: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 4,
  },
  fileInfo: {
    fontSize: 10,
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 12,
  },
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  fileButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
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
  uploadButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 20,
  },
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
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});
