import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from "../constants/colors";
import { ArrowLeft, Plus, Upload, FileText, X } from 'lucide-react-native';
import Button from "../components/Button";
import * as DocumentPicker from 'expo-document-picker';

export default function AddVetBookScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    pages: '',
    category: '',
    language: 'العربية',
    bookFile: null as any
  });

  const categories = ['تشريح', 'أمراض', 'جراحة', 'صيدلة', 'تغذية', 'طب وقائي', 'تشخيص'];

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        setFormData({...formData, bookFile: result.assets[0]});
      }
    } catch {
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الملف');
    }
  };

  const handleRemoveFile = () => {
    setFormData({...formData, bookFile: null});
  };

  const handleSave = () => {
    if (!formData.title || !formData.author || !formData.category) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    // Here you would upload the file and save the book data to the main books section
    console.log('Vet book data:', formData);
    Alert.alert('نجح', 'تم إضافة الكتاب إلى القسم الأساسي بنجاح');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إضافة كتاب للقسم الأساسي',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.imageSection}>
            <View style={styles.imagePlaceholder}>
              <Upload size={32} color={COLORS.darkGray} />
              <Text style={styles.imagePlaceholderText}>اختر صورة الكتاب</Text>
            </View>
            <TouchableOpacity style={styles.uploadButton}>
              <Upload size={16} color={COLORS.white} />
              <Text style={styles.uploadButtonText}>رفع صورة</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان الكتاب *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
              placeholder="أدخل عنوان الكتاب"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>المؤلف *</Text>
            <TextInput
              style={styles.input}
              value={formData.author}
              onChangeText={(text) => setFormData({...formData, author: text})}
              placeholder="أدخل اسم المؤلف"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>التصنيف *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    formData.category === category && styles.selectedCategoryButton
                  ]}
                  onPress={() => setFormData({...formData, category})}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    formData.category === category && styles.selectedCategoryButtonText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
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
              onChangeText={(text) => setFormData({...formData, pages: text})}
              placeholder="أدخل عدد الصفحات"
              textAlign="right"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>اللغة</Text>
            <View style={styles.languageContainer}>
              {['العربية', 'الإنجليزية', 'الفرنسية'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageButton,
                    formData.language === lang && styles.selectedLanguageButton
                  ]}
                  onPress={() => setFormData({...formData, language: lang})}
                >
                  <Text style={[
                    styles.languageButtonText,
                    formData.language === lang && styles.selectedLanguageButtonText
                  ]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* File Upload Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ملف الكتاب *</Text>
            {formData.bookFile ? (
              <View style={styles.fileContainer}>
                <View style={styles.fileInfo}>
                  <FileText size={20} color={COLORS.primary} />
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>{formData.bookFile.name}</Text>
                    <Text style={styles.fileSize}>
                      {(formData.bookFile.size / (1024 * 1024)).toFixed(2)} MB
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={handleRemoveFile} style={styles.removeFileButton}>
                  <X size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.fileUploadButton} onPress={handlePickFile}>
                <Upload size={20} color={COLORS.primary} />
                <Text style={styles.fileUploadText}>اختر ملف الكتاب (PDF, EPUB)</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="إضافة الكتاب للقسم الأساسي"
          onPress={handleSave}
          type="primary"
          size="large"
          icon={<Plus size={20} color={COLORS.white} />}
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
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePlaceholder: {
    width: 120,
    height: 160,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
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
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: COLORS.white,
  },
  languageContainer: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  selectedLanguageButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  languageButtonText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  selectedLanguageButtonText: {
    color: COLORS.white,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.background,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'right',
  },
  fileSize: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  removeFileButton: {
    padding: 4,
  },
  fileUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    gap: 8,
    backgroundColor: COLORS.background,
  },
  fileUploadText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});