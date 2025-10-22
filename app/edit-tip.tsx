import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from "../constants/colors";
import { ArrowLeft, Save, Upload } from 'lucide-react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from "../lib/trpc";

export default function EditTipScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const tipId = parseInt(id as string);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    category: ''
  });

  const { data: tip, isLoading, error } = useQuery(trpc.admin.content.getTipById.queryOptions({ id: tipId }));
  const updateTipMutation = useMutation(trpc.admin.content.updateTip.mutationOptions());

  useEffect(() => {
    if (tip) {
      setFormData({
        title: tip.title,
        content: tip.content,
        image: tip.image,
        category: tip.category,
      });
    }
  }, [tip]);

  const handleSave = () => {
    updateTipMutation.mutate({
        id: tipId,
        ...formData,
    }, {
        onSuccess: () => {
            Alert.alert('نجح', 'تم تحديث النصيحة بنجاح');
            router.back();
        },
        onError: (error) => {
            Alert.alert('خطأ', error.message || 'فشل في تحديث النصيحة');
        }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'تعديل النصيحة',
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
            <Image source={{ uri: formData.image }} style={styles.tipImage} />
            <TouchableOpacity style={styles.uploadButton}>
              <Upload size={16} color={COLORS.white} />
              <Text style={styles.uploadButtonText}>تغيير الصورة</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان النصيحة</Text>
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
            <Text style={styles.label}>محتوى النصيحة</Text>
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
          title={updateTipMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
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
  tipImage: {
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