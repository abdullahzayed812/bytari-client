import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from "../constants/colors";
import { ArrowLeft, Plus, Upload } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { trpc } from "../lib/trpc";

export default function AddTipScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });

  const createTipMutation = useMutation(trpc.admin.content.createTip.mutationOptions());

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    createTipMutation.mutate({
        title: formData.title,
        content: formData.content,
        category: formData.category,
    }, {
        onSuccess: () => {
            Alert.alert('نجح', 'تم إضافة النصيحة بنجاح');
            router.back();
        },
        onError: (error) => {
            Alert.alert('خطأ', error.message || 'فشل في إضافة النصيحة');
        }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إضافة نصيحة جديدة',
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
              <Text style={styles.imagePlaceholderText}>اختر صورة النصيحة</Text>
            </View>
            <TouchableOpacity style={styles.uploadButton}>
              <Upload size={16} color={COLORS.white} />
              <Text style={styles.uploadButtonText}>رفع صورة</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان النصيحة *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
              placeholder="أدخل عنوان النصيحة"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>التصنيف</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData({...formData, category: text})}
              placeholder="أدخل تصنيف النصيحة"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>محتوى النصيحة *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData({...formData, content: text})}
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
          title={createTipMutation.isPending ? 'جاري الإضافة...' : 'إضافة النصيحة'}
          onPress={handleSave}
          type="primary"
          size="large"
          icon={<Plus size={20} color={COLORS.white} />}
          disabled={createTipMutation.isPending}
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
    width: 200,
    height: 120,
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
    height: 120,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});