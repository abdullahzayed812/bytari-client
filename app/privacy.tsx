import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { COLORS } from "../constants/colors";
import { Stack, router } from 'expo-router';
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react-native';

export default function PrivacyScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'الخصوصية والأمان',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black, fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Shield size={40} color={COLORS.white} />
          <Text style={styles.headerText}>
            نحن نحترم خصوصيتك ونحمي بياناتك الشخصية
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>جمع البيانات</Text>
          </View>
          <Text style={styles.sectionContent}>
            نقوم بجمع المعلومات التي تقدمها لنا مباشرة مثل الاسم والبريد الإلكتروني ومعلومات الحيوانات الأليفة. كما نجمع معلومات حول استخدامك للتطبيق لتحسين خدماتنا.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>استخدام البيانات</Text>
          </View>
          <Text style={styles.sectionContent}>
            نستخدم بياناتك لتقديم الخدمات المطلوبة، تحسين التطبيق، إرسال الإشعارات المهمة، والتواصل معك بخصوص حسابك أو خدماتنا.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>حماية البيانات</Text>
          </View>
          <Text style={styles.sectionContent}>
            نستخدم تقنيات التشفير المتقدمة لحماية بياناتك. جميع المعلومات الحساسة محمية بكلمات مرور قوية وبروتوكولات أمان عالية المستوى.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حقوقك</Text>
          <View style={styles.rightsList}>
            <Text style={styles.rightItem}>• الحق في الوصول إلى بياناتك الشخصية</Text>
            <Text style={styles.rightItem}>• الحق في تصحيح البيانات غير الصحيحة</Text>
            <Text style={styles.rightItem}>• الحق في حذف بياناتك</Text>
            <Text style={styles.rightItem}>• الحق في نقل بياناتك</Text>
            <Text style={styles.rightItem}>• الحق في الاعتراض على معالجة البيانات</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملفات تعريف الارتباط</Text>
          <Text style={styles.sectionContent}>
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك في استخدام التطبيق وتذكر تفضيلاتك. يمكنك إدارة هذه الملفات من خلال إعدادات المتصفح.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مشاركة البيانات</Text>
          <Text style={styles.sectionContent}>
            لا نبيع أو نؤجر بياناتك الشخصية لأطراف ثالثة. قد نشارك المعلومات مع مقدمي الخدمات الموثوقين فقط لتقديم خدماتنا بشكل أفضل.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التحديثات</Text>
          <Text style={styles.sectionContent}>
            قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإشعارك بأي تغييرات مهمة عبر التطبيق أو البريد الإلكتروني.
          </Text>
        </View>


      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  backButton: {
    padding: 8,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    marginTop: 12,
  },
  section: {
    backgroundColor: COLORS.white,
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginRight: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: 'right',
  },
  rightsList: {
    marginTop: 8,
  },
  rightItem: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 4,
  },

});