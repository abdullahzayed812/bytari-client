import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import React from 'react';
import { COLORS } from "../constants/colors";
import { Stack, router } from 'expo-router';
import { ArrowRight, Info, Heart, Users, Shield, Star, ExternalLink, ArrowLeft } from 'lucide-react-native';

export default function AboutScreen() {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'حول التطبيق',
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
          <Heart size={40} color={COLORS.white} />
          <Text style={styles.headerText}>
            تطبيق رعاية الحيوانات الأليفة
          </Text>
          <Text style={styles.versionText}>الإصدار 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عن التطبيق</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              تطبيق رعاية الحيوانات الأليفة هو منصة شاملة مصممة لمساعدة الأطباء البيطريين و أصحاب الحيوانات الأليفة في العناية بحيواناتهم الأليفة بأفضل طريقة ممكنة. نوفر خدمات متنوعة من حجز المواعيد البيطرية إلى متجر لوازم الحيوانات الأليفة.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مميزاتنا</Text>
          <View style={styles.featuresCard}>
            <View style={styles.featureItem}>
              <Users size={24} color={COLORS.primary} />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>مجتمع محب للحيوانات</Text>
                <Text style={styles.featureDescription}>انضم إلى مجتمع من محبي الحيوانات الأليفة</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Shield size={24} color={COLORS.primary} />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>رعاية طبية متخصصة</Text>
                <Text style={styles.featureDescription}>احجز مواعيد مع أفضل الأطباء البيطريين</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Star size={24} color={COLORS.primary} />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>خدمات متميزة</Text>
                <Text style={styles.featureDescription}>متجر شامل لجميع احتياجات حيوانك الأليف</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>فريق العمل</Text>
          <View style={styles.teamCard}>
            <Text style={styles.teamText}>
              تم تطوير هذا التطبيق بواسطة فريق متخصص من الاطباءالبيطريين ومحبي الحيوانات الأليفة. نحن نعمل بشغف لتوفير أفضل تجربة ممكنة للأطباء البيطريين واصحاب الحيوانات الاليفة
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تواصل معنا</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleLinkPress('https://petcare.com')}
            >
              <ExternalLink size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>الموقع الإلكتروني</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleLinkPress('mailto:info@petcare.com')}
            >
              <ExternalLink size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>البريد الإلكتروني</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => router.push('/contact-us')}
            >
              <ExternalLink size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>صفحة التواصل</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الشروط والأحكام</Text>
          <View style={styles.legalCard}>
            <TouchableOpacity 
              style={styles.legalItem}
              onPress={() => router.push('/privacy')}
            >
              <Text style={styles.legalText}>سياسة الخصوصية</Text>
              <ArrowRight size={16} color={COLORS.darkGray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>شروط الاستخدام</Text>
              <ArrowRight size={16} color={COLORS.darkGray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.legalItem}>
              <Text style={styles.legalText}>اتفاقية الترخيص</Text>
              <ArrowRight size={16} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Veterinary App. جميع الحقوق محفوظة
          </Text>
          <Text style={styles.footerSubtext}>
            صنع بـ ❤️ للأطباء البيطريين ولمحبي الحيوانات الأليفة
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
    fontSize: 20,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  section: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  aboutCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: 'right',
  },
  featuresCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureInfo: {
    marginRight: 16,
    flex: 1,
    alignItems: 'flex-end',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  teamCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: 'right',
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  contactText: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 12,
    fontWeight: '500',
  },
  legalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legalItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  legalText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
});