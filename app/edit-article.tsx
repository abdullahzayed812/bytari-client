import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from "../constants/colors";
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from "../lib/trpc";

export default function EditArticleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const articleId = parseInt(id as string);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    authorTitle: '',
    content: '',
    image: '',
    category: ''
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const { data: article, isLoading, error } = useQuery(trpc.admin.content.getArticleById.queryOptions({ id: articleId }));
  const updateArticleMutation = useMutation(trpc.admin.content.updateArticle.mutationOptions());

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        author: article.author,
        authorTitle: article.authorTitle,
        content: article.content,
        image: article.image,
        category: article.category
      });
      setSelectedImage(article.image);
    }
  }, [article]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('خطأ', 'فشل في اختيار الصورة');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'text/rtf',
          'application/rtf'
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        Alert.alert('تم', `تم اختيار الملف: ${result.assets[0].name}`);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('خطأ', 'فشل في اختيار الملف');
    }
  };

  const handleSave = () => {
    updateArticleMutation.mutate({
        id: articleId,
        ...formData,
        image: selectedImage,
        file: selectedFile,
    }, {
        onSuccess: () => {
            Alert.alert('نجح', 'تم تحديث المقال بنجاح');
            router.back();
        },
        onError: (error) => {
            Alert.alert('خطأ', error.message || 'فشل في تحديث المقال');
        }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'تعديل المقال',
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
            <Image source={{ uri: selectedImage || formData.image }} style={styles.articleImage} />
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Upload size={16} color={COLORS.white} />
              <Text style={styles.uploadButtonText}>تغيير الصورة</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان المقال</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
              placeholder="أدخل عنوان المقال"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم الكاتب</Text>
            <TextInput
              style={styles.input}
              value={formData.author}
              onChangeText={(text) => setFormData({...formData, author: text})}
              placeholder="أدخل اسم الكاتب"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>مسمى الكاتب</Text>
            <TextInput
              style={styles.input}
              value={formData.authorTitle}
              onChangeText={(text) => setFormData({...formData, authorTitle: text})}
              placeholder="أدخل مسمى الكاتب"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>التصنيف</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData({...formData, category: text})}
              placeholder="أدخل تصنيف المقال"
              textAlign="right"
            />
          </View>

          <View style={styles.fileSection}>
            <Text style={styles.sectionTitle}>ملف المقال (اختياري)</Text>
            <View style={styles.filePlaceholder}>
              <FileText size={32} color={COLORS.primary} />
              <Text style={styles.filePlaceholderText}>
                {selectedFile ? selectedFile.name : 'اختر ملف المقال الجديد'}
              </Text>
              <Text style={styles.fileSubText}>PDF, DOC, DOCX أو ملف نصي</Text>
              {selectedFile && (
                <Text style={styles.fileInfo}>
                  الحجم: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.fileButton} onPress={pickDocument}>
              <Upload size={16} color={COLORS.primary} />
              <Text style={styles.fileButtonText}>
                {selectedFile ? 'تغيير الملف' : 'اختيار ملف جديد'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>محتوى المقال</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData({...formData, content: text})}
              placeholder={selectedFile ? 'محتوى اختياري (تم رفع ملف)' : 'أدخل محتوى المقال'}
              textAlign="right"
              multiline
              numberOfLines={8}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={updateArticleMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          onPress={handleSave}
          type="primary"
          size="large"
          icon={<Save size={20} color={COLORS.white} />}
          disabled={updateArticleMutation.isPending}
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
  articleImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
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
    height: 150,
    textAlignVertical: 'top',
  },
  fileSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  filePlaceholder: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  filePlaceholderText: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  fileSubText: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  fileInfo: {
    fontSize: 10,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 12,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});