import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, UserPlus, User, Mail, Phone, MapPin, GraduationCap, FileText, Send } from 'lucide-react-native';
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";

interface JobApplicationFormData {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  location: string;
  desiredPosition: string;
  skills: string;
  expectedSalary: string;
  coverLetter: string;
  experience: string;
  education: string;
}

export default function JobApplicationScreen() {
  const router = useRouter();
  const { jobId, jobTitle } = useLocalSearchParams<{ jobId?: string; jobTitle?: string }>();
  
  const [formData, setFormData] = useState<JobApplicationFormData>({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    location: '',
    desiredPosition: '',
    skills: '',
    expectedSalary: '',
    coverLetter: '',
    experience: '',
    education: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const submitApplicationMutation = trpc.admin.jobs.submitJobApplication.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        Alert.alert(
          'تم التقديم بنجاح',
          data.message,
          [
            {
              text: 'موافق',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('خطأ', data.message);
      }
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error('Error submitting application:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.');
      setIsSubmitting(false);
    }
  });

  const handleSubmit = () => {
    // Validate form
    if (!formData.applicantName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال الاسم الكامل');
      return;
    }
    
    if (!formData.applicantEmail.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني');
      return;
    }
    
    if (!formData.applicantPhone.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال رقم الهاتف');
      return;
    }
    
    if (!formData.coverLetter.trim()) {
      Alert.alert('خطأ', 'يرجى كتابة رسالة تعريفية');
      return;
    }
    
    if (!formData.experience.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال معلومات الخبرة');
      return;
    }
    
    if (!formData.education.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال المؤهل التعليمي');
      return;
    }
    
    if (!formData.location.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال الموقع');
      return;
    }
    
    if (!formData.desiredPosition.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال المنصب المرغوب');
      return;
    }
    
    if (!formData.skills.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال المهارات');
      return;
    }
    
    if (!jobId) {
      Alert.alert('خطأ', 'معرف الوظيفة غير صحيح');
      return;
    }
    
    setIsSubmitting(true);
    
    submitApplicationMutation.mutate({
      jobId,
      ...formData
    });
  };
  
  const updateFormData = (field: keyof JobApplicationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'تقديم طلب توظيف',
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
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <UserPlus size={32} color={COLORS.white} />
          </View>
          <Text style={styles.headerTitle}>تقديم طلب توظيف</Text>
          <Text style={styles.headerSubtitle}>أضف معلوماتك الشخصية والمهنية</Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الاسم الكامل *</Text>
            <View style={styles.inputWithIcon}>
              <User size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.applicantName}
                onChangeText={(text) => updateFormData('applicantName', text)}
                placeholder="الاسم الأول والأخير"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>البريد الإلكتروني *</Text>
            <View style={styles.inputWithIcon}>
              <Mail size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.applicantEmail}
                onChangeText={(text) => updateFormData('applicantEmail', text)}
                placeholder="example@email.com"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="email-address"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الهاتف *</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.applicantPhone}
                onChangeText={(text) => updateFormData('applicantPhone', text)}
                placeholder="05xxxxxxxx"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الموقع *</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.location}
                onChangeText={(text) => updateFormData('location', text)}
                placeholder="المدينة، المنطقة"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>المنصب المرغوب *</Text>
            <View style={styles.inputWithIcon}>
              <User size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.desiredPosition}
                onChangeText={(text) => updateFormData('desiredPosition', text)}
                placeholder="طبيب بيطري، مساعد طبيب، إداري..."
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>المؤهل التعليمي *</Text>
            <View style={styles.inputWithIcon}>
              <GraduationCap size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.education}
                onChangeText={(text) => updateFormData('education', text)}
                placeholder="بكالوريوس الطب البيطري، ماجستير، دكتوراه..."
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الخبرة المهنية *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.experience}
              onChangeText={(text) => updateFormData('experience', text)}
              placeholder="اذكر خبراتك المهنية السابقة وسنوات الخبرة..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>المهارات *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.skills}
              onChangeText={(text) => updateFormData('skills', text)}
              placeholder="اذكر مهاراتك التقنية والشخصية..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الراتب المتوقع</Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.currencySymbol}>ر.س</Text>
              <TextInput
                style={styles.inputText}
                value={formData.expectedSalary}
                onChangeText={(text) => updateFormData('expectedSalary', text)}
                placeholder="5000"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>رسالة تعريفية *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.coverLetter}
              onChangeText={(text) => updateFormData('coverLetter', text)}
              placeholder="اكتب رسالة تعريفية عن نفسك ولماذا تريد العمل في هذا المجال..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <FileText size={20} color={COLORS.white} />
          <Text style={styles.submitButtonText}>إرسال الطلب</Text>
        </TouchableOpacity>
        
        <Text style={styles.note}>
          * سيتم مراجعة طلب التوظيف من قبل الإدارة وسيتم التواصل معك في حالة توفر فرصة مناسبة
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 8,
  },
  inputText: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  textArea: {
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  currencySymbol: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
});