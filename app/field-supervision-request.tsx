import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Shield, User, Mail, Phone, MapPin, GraduationCap, FileText, Award, Building2, Users } from 'lucide-react-native';
import { COLORS } from "../constants/colors";

export default function FieldSupervisionRequestScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    education: '',
    experience: '',
    qualifications: '',
    previousExperience: '',
    farmName: '',
    farmLocation: '',
    farmCapacity: '',
    requestType: 'supervision'
  });

  const handleSubmit = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.farmName || !formData.farmLocation) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const requestTypeText = formData.requestType === 'supervision' ? 'إشراف' : 
                           formData.requestType === 'vet_assignment' ? 'تعيين طبيب بيطري' : 
                           'إشراف وتعيين طبيب';

    Alert.alert(
      'تم الإرسال',
      `تم إرسال طلب ${requestTypeText} لمزرعة "${formData.farmName}" للإدارة للمراجعة والموافقة.\n\nسيتم التواصل معك قريباً.`,
      [
        {
          text: 'موافق',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'طلب إشراف حقول',
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
            <Shield size={32} color={COLORS.white} />
          </View>
          <Text style={styles.headerTitle}>طلب إشراف حقول</Text>
          <Text style={styles.headerSubtitle}>قدم طلباً للإشراف على الحقول والمزارع</Text>
        </View>
        
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الاسم الكامل *</Text>
            <View style={styles.inputWithIcon}>
              <User size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.fullName}
                onChangeText={(text) => setFormData({...formData, fullName: text})}
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
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
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
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                placeholder="05xxxxxxxx"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>موقع الإقامة</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.location}
                onChangeText={(text) => setFormData({...formData, location: text})}
                placeholder="المدينة، المنطقة"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>معلومات المزرعة</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم المزرعة *</Text>
            <View style={styles.inputWithIcon}>
              <Building2 size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.farmName}
                onChangeText={(text) => setFormData({...formData, farmName: text})}
                placeholder="أدخل اسم مزرعة الدواجن"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>موقع المزرعة *</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.farmLocation}
                onChangeText={(text) => setFormData({...formData, farmLocation: text})}
                placeholder="المحافظة - المنطقة"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>سعة المزرعة (عدد الطيور)</Text>
            <View style={styles.inputWithIcon}>
              <Users size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.farmCapacity}
                onChangeText={(text) => setFormData({...formData, farmCapacity: text})}
                placeholder="مثال: 50,000 طائر"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>نوع الطلب</Text>
            <View style={styles.requestTypeContainer}>
              <TouchableOpacity 
                style={[styles.requestTypeButton, formData.requestType === 'supervision' && styles.activeRequestType]}
                onPress={() => setFormData({...formData, requestType: 'supervision'})}
              >
                <Text style={[styles.requestTypeText, formData.requestType === 'supervision' && styles.activeRequestTypeText]}>
                  طلب إشراف
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.requestTypeButton, formData.requestType === 'vet_assignment' && styles.activeRequestType]}
                onPress={() => setFormData({...formData, requestType: 'vet_assignment'})}
              >
                <Text style={[styles.requestTypeText, formData.requestType === 'vet_assignment' && styles.activeRequestTypeText]}>
                  طلب طبيب بيطري
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.requestTypeButton, formData.requestType === 'both' && styles.activeRequestType]}
                onPress={() => setFormData({...formData, requestType: 'both'})}
              >
                <Text style={[styles.requestTypeText, formData.requestType === 'both' && styles.activeRequestTypeText]}>
                  كلاهما
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          
          <Text style={styles.sectionTitle}>المؤهلات والخبرة</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>المؤهل العلمي</Text>
            <View style={styles.inputWithIcon}>
              <GraduationCap size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.education}
                onChangeText={(text) => setFormData({...formData, education: text})}
                placeholder="بكالوريوس الطب البيطري، الزراعة، الإنتاج الحيواني..."
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الخبرة في المجال البيطري</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.experience}
              onChangeText={(text) => setFormData({...formData, experience: text})}
              placeholder="اذكر خبراتك في المجال البيطري وسنوات الخبرة..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الشهادات والمؤهلات الإضافية</Text>
            <View style={styles.inputWithIcon}>
              <Award size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.qualifications}
                onChangeText={(text) => setFormData({...formData, qualifications: text})}
                placeholder="شهادات، دورات تدريبية، تراخيص..."
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الخبرة السابقة في إدارة المزارع</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.previousExperience}
              onChangeText={(text) => setFormData({...formData, previousExperience: text})}
              placeholder="اذكر خبراتك السابقة في إدارة أو الإشراف على المزارع والحقول..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          

        </View>
        
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <FileText size={20} color={COLORS.white} />
          <Text style={styles.submitButtonText}>إرسال الطلب</Text>
        </TouchableOpacity>
        
        <Text style={styles.note}>
          * سيتم مراجعة طلب الإشراف من قبل الإدارة وسيتم التواصل معك لترتيب زيارة ميدانية للمزرعة. في حالة الموافقة، سيتم تعيينك للإشراف على المزرعة.
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
    backgroundColor: '#6f42c1',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    marginTop: 8,
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
    backgroundColor: '#6f42c1',
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
  requestTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  requestTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    minWidth: 100,
  },
  activeRequestType: {
    backgroundColor: '#6f42c1',
    borderColor: '#6f42c1',
  },
  requestTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  activeRequestTypeText: {
    color: COLORS.white,
  },
});