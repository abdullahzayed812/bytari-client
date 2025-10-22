import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { COLORS } from "../constants/colors";
import { Stack, router } from 'expo-router';
import { ArrowRight, Globe, Check, ArrowLeft } from 'lucide-react-native';
import { useI18n } from "../providers/I18nProvider";
import { Language } from "../types";

export default function LanguageScreen() {
  const { language, changeLanguage, t, isRTL } = useI18n();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const languages = [
    { code: 'ar' as Language, name: 'العربية', nativeName: 'العربية' },
    { code: 'en' as Language, name: 'English', nativeName: 'English' },
    { code: 'ku' as Language, name: 'Kurdish', nativeName: 'کوردی' },
    { code: 'fr' as Language, name: 'French', nativeName: 'Français' },
    { code: 'tr' as Language, name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'de' as Language, name: 'German', nativeName: 'Deutsch' },
    { code: 'fa' as Language, name: 'Persian', nativeName: 'فارسی' },
  ];

  const handleLanguageSelect = (languageCode: Language) => {
    if (languageCode === selectedLanguage) return;
    
    setSelectedLanguage(languageCode);
    Alert.alert(
      t('profile.language'),
      t('common.confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          onPress: async () => {
            try {
              await changeLanguage(languageCode);
              Alert.alert(t('common.success'), 'Language changed successfully!');
            } catch (error) {
              console.error('Error changing language:', error);
              Alert.alert(t('common.error'), 'Failed to change language');
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: t('profile.language'),
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
          <Globe size={40} color={COLORS.white} />
          <Text style={[styles.headerText, { textAlign: isRTL ? 'center' : 'center' }]}>
            {language === 'ar' ? 'اختر اللغة المفضلة لديك' : 
             language === 'en' ? 'Choose your preferred language' :
             language === 'ku' ? 'زمانی خۆت هەڵبژێرە' :
             language === 'fr' ? 'Choisissez votre langue préférée' :
             language === 'tr' ? 'Tercih ettiğiniz dili seçin' :
             language === 'de' ? 'Wählen Sie Ihre bevorzugte Sprache' :
             language === 'fa' ? 'زبان مورد نظر خود را انتخاب کنید' :
             'Choose your preferred language'}
          </Text>
        </View>

        <View style={styles.languageSection}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {language === 'ar' ? 'اللغات المتاحة' : 
             language === 'en' ? 'Available Languages' :
             language === 'ku' ? 'زمانە بەردەستەکان' :
             language === 'fr' ? 'Langues disponibles' :
             language === 'tr' ? 'Mevcut Diller' :
             language === 'de' ? 'Verfügbare Sprachen' :
             language === 'fa' ? 'زبان‌های موجود' :
             'Available Languages'}
          </Text>
          
          <View style={styles.languageCard}>
            {languages.map((language, index) => (
              <TouchableOpacity 
                key={language.code}
                style={[
                  styles.languageItem,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  index === languages.length - 1 && styles.lastItem,
                  selectedLanguage === language.code && styles.selectedItem
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <View style={[styles.languageInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <Text style={[
                    styles.languageName,
                    selectedLanguage === language.code && styles.selectedText
                  ]}>
                    {language.nativeName}
                  </Text>
                  <Text style={[
                    styles.languageSubtitle,
                    selectedLanguage === language.code && styles.selectedSubtext
                  ]}>
                    {language.name}
                  </Text>
                </View>
                
                {selectedLanguage === language.code && (
                  <View style={[styles.checkIcon, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                    <Check size={20} color={COLORS.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {language === 'ar' ? 'معلومات مهمة' : 
             language === 'en' ? 'Important Information' :
             language === 'ku' ? 'زانیاری گرنگ' :
             language === 'fr' ? 'Informations importantes' :
             language === 'tr' ? 'Önemli Bilgiler' :
             language === 'de' ? 'Wichtige Informationen' :
             language === 'fa' ? 'اطلاعات مهم' :
             'Important Information'}
          </Text>
          <View style={styles.infoCard}>
            <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {language === 'ar' ? '• سيتم تطبيق اللغة الجديدة على جميع أجزاء التطبيق' : 
               language === 'en' ? '• The new language will be applied to all parts of the app' :
               language === 'ku' ? '• زمانی نوێ لە هەموو بەشەکانی ئەپەکە جێبەجێ دەکرێت' :
               language === 'fr' ? '• La nouvelle langue sera appliquée à toutes les parties de l\'app' :
               language === 'tr' ? '• Yeni dil uygulamanın tüm bölümlerine uygulanacak' :
               language === 'de' ? '• Die neue Sprache wird auf alle Teile der App angewendet' :
               language === 'fa' ? '• زبان جدید در تمام بخش‌های برنامه اعمال خواهد شد' :
               '• The new language will be applied to all parts of the app'}
            </Text>
            <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {language === 'ar' ? '• قد يحتاج التطبيق إلى إعادة تشغيل لتطبيق التغييرات' : 
               language === 'en' ? '• The app may need to restart to apply changes' :
               language === 'ku' ? '• ئەپەکە ڕەنگە پێویستی بە دووبارە دەستپێکردنەوە هەبێت' :
               language === 'fr' ? '• L\'app peut avoir besoin de redémarrer pour appliquer les changements' :
               language === 'tr' ? '• Değişiklikleri uygulamak için uygulama yeniden başlatılması gerekebilir' :
               language === 'de' ? '• Die App muss möglicherweise neu gestartet werden, um Änderungen anzuwenden' :
               language === 'fa' ? '• برنامه ممکن است نیاز به راه‌اندازی مجدد داشته باشد' :
               '• The app may need to restart to apply changes'}
            </Text>
            <Text style={[styles.infoText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {language === 'ar' ? '• يمكنك تغيير اللغة في أي وقت من الإعدادات' : 
               language === 'en' ? '• You can change the language anytime from settings' :
               language === 'ku' ? '• دەتوانیت هەر کاتێک زمان بگۆڕیت لە ڕێکخستنەکانەوە' :
               language === 'fr' ? '• Vous pouvez changer la langue à tout moment depuis les paramètres' :
               language === 'tr' ? '• Dili istediğiniz zaman ayarlardan değiştirebilirsiniz' :
               language === 'de' ? '• Sie können die Sprache jederzeit in den Einstellungen ändern' :
               language === 'fa' ? '• می‌توانید زبان را هر زمان از تنظیمات تغییر دهید' :
               '• You can change the language anytime from settings'}
            </Text>
          </View>
        </View>

        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>
            {language === 'ar' ? 'هل تحتاج مساعدة؟' : 
             language === 'en' ? 'Need Help?' :
             language === 'ku' ? 'یارمەتیت دەوێت؟' :
             language === 'fr' ? 'Besoin d\'aide?' :
             language === 'tr' ? 'Yardıma mı ihtiyacınız var?' :
             language === 'de' ? 'Brauchen Sie Hilfe?' :
             language === 'fa' ? 'نیاز به کمک دارید؟' :
             'Need Help?'}
          </Text>
          <Text style={styles.supportText}>
            {language === 'ar' ? 'إذا واجهت أي مشكلة في تغيير اللغة، يرجى التواصل مع فريق الدعم' : 
             language === 'en' ? 'If you encounter any issues changing the language, please contact our support team' :
             language === 'ku' ? 'ئەگەر هەر کێشەیەکت هەبوو لە گۆڕینی زمان، تکایە پەیوەندی بە تیمی پشتگیری بکە' :
             language === 'fr' ? 'Si vous rencontrez des problèmes pour changer la langue, veuillez contacter notre équipe de support' :
             language === 'tr' ? 'Dil değiştirirken herhangi bir sorunla karşılaşırsanız, lütfen destek ekibimizle iletişime geçin' :
             language === 'de' ? 'Wenn Sie Probleme beim Ändern der Sprache haben, wenden Sie sich bitte an unser Support-Team' :
             language === 'fa' ? 'اگر در تغییر زبان با مشکلی مواجه شدید، لطفاً با تیم پشتیبانی تماس بگیرید' :
             'If you encounter any issues changing the language, please contact our support team'}
          </Text>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => router.push('/contact-us')}
          >
            <Text style={styles.supportButtonText}>
              {language === 'ar' ? 'تواصل معنا' : 
               language === 'en' ? 'Contact Us' :
               language === 'ku' ? 'پەیوەندیمان پێوە بکە' :
               language === 'fr' ? 'Nous contacter' :
               language === 'tr' ? 'Bize Ulaşın' :
               language === 'de' ? 'Kontaktieren Sie uns' :
               language === 'fa' ? 'تماس با ما' :
               'Contact Us'}
            </Text>
          </TouchableOpacity>
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
  languageSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  languageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  selectedItem: {
    backgroundColor: COLORS.lightGray,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  languageSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  selectedText: {
    color: COLORS.primary,
  },
  selectedSubtext: {
    color: COLORS.primary,
  },
  checkIcon: {
    // Dynamic margin handled inline
  },
  infoSection: {
    margin: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    marginBottom: 8,
  },
  supportSection: {
    backgroundColor: COLORS.white,
    margin: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  supportButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});