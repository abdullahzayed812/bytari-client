import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import Button from "../../components/Button";
import UserAvatar from "../../components/UserAvatar";
import { Award, ChevronLeft, ChevronRight, CreditCard, Gift, Globe, LogOut, MessageSquare, Settings, Share2, X, Heart, ShoppingBag, Phone } from 'lucide-react-native';
import { router } from 'expo-router';
import { Language } from "../../types";

const languages = [
  { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
  { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
  { code: 'ku' as Language, name: 'کوردی', flag: '🇮🇶' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'tr' as Language, name: 'Türkçe', flag: '🇹🇷' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fa' as Language, name: 'فارسی', flag: '🇮🇷' },
];

export default function VetProfileScreen() {
  const { t, isRTL, changeLanguage, language } = useI18n();
  const { user, pointsHistory, logout } = useApp();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleShareApp = () => {
    console.log('Share app');
    // TODO: Implement share app functionality
  };

  const handleLanguageSelect = (lang: Language) => {
    changeLanguage(lang);
    setShowLanguageModal(false);
  };

  const handleSubscribeToPremium = () => {
    console.log('Subscribe to premium');
    // TODO: Navigate to premium subscription page
  };

  const currentLanguage = languages.find(lang => lang.code === language);

  const renderLanguageItem = ({ item }: { item: typeof languages[0] }) => (
    <TouchableOpacity
      style={[styles.languageItem, language === item.code && styles.selectedLanguageItem]}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <Text style={styles.languageFlag}>{item.flag}</Text>
      <Text style={[styles.languageName, language === item.code && styles.selectedLanguageName]}>
        {item.name}
      </Text>
      {language === item.code && (
        <View style={styles.selectedIndicator} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <UserAvatar 
            uri={user?.avatar}
            gender={user?.gender}
            size={80}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.userId}>ID: {user?.id || '1001'}</Text>
          </View>
        </View>
        
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <Text style={styles.pointsTitle}>{t('profile.points')}</Text>
            <TouchableOpacity onPress={() => {
              router.push('/points-exchange');
            }}>
              <Text style={styles.pointsHistory}>استبدال النقاط</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.pointsValue}>{user?.points}</Text>
          <Button
            title={t('common.seeAll')}
            onPress={() => router.push('/points-history')}
            type="outline"
            size="small"
            style={styles.pointsButton}
          />
        </View>
        
        {!user?.isPremium && (
          <View style={styles.premiumCard}>
            <View style={styles.premiumContent}>
              <Award size={24} color={COLORS.primary} />
              <View style={styles.premiumTextContainer}>
                <Text style={styles.premiumTitle}>{t('premium.title')}</Text>
                <Text style={styles.premiumDescription}>
                  {t('premium.storeDiscounts')} • {t('premium.clinicDiscounts')}
                </Text>
              </View>
            </View>
            <Button
              title={t('profile.subscribeToPremium')}
              onPress={() => router.push('/premium-subscription')}
              type="primary"
              size="small"
              style={styles.premiumButton}
            />
          </View>
        )}
        
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/favorites')}
          >
            <View style={styles.menuItemLeft}>
              <Heart size={20} color={COLORS.darkGray} />
              <Text style={styles.menuItemText}>المفضلة</Text>
            </View>
            <View style={{ width: 20, height: 20 }}>
              {isRTL ? <ChevronLeft size={20} color={COLORS.darkGray} /> : <ChevronRight size={20} color={COLORS.darkGray} />}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/orders')}
          >
            <View style={styles.menuItemLeft}>
              <ShoppingBag size={20} color={COLORS.darkGray} />
              <Text style={styles.menuItemText}>طلباتي</Text>
            </View>
            <View style={{ width: 20, height: 20 }}>
              {isRTL ? <ChevronLeft size={20} color={COLORS.darkGray} /> : <ChevronRight size={20} color={COLORS.darkGray} />}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              console.log('Settings pressed');
              // TODO: Navigate to settings page
            }}
          >
            <View style={styles.menuItemLeft}>
              <Settings size={20} color={COLORS.darkGray} />
              <Text style={styles.menuItemText}>{t('profile.settings')}</Text>
            </View>
            <View style={{ width: 20, height: 20 }}>
              {isRTL ? <ChevronLeft size={20} color={COLORS.darkGray} /> : <ChevronRight size={20} color={COLORS.darkGray} />}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowLanguageModal(true)}>
            <View style={styles.menuItemLeft}>
              <Globe size={20} color={COLORS.darkGray} />
              <Text style={styles.menuItemText}>{t('profile.language')}</Text>
            </View>
            <View style={styles.languagePreview}>
              <Text style={styles.languageFlag}>{currentLanguage?.flag}</Text>
              <Text style={styles.menuItemValue}>{currentLanguage?.name}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              console.log('Notifications settings pressed');
              // TODO: Navigate to notification settings page
            }}
          >
            <View style={styles.menuItemLeft}>
              <MessageSquare size={20} color={COLORS.darkGray} />
              <Text style={styles.menuItemText}>{t('profile.notifications')}</Text>
            </View>
            <View style={{ width: 20, height: 20 }}>
              {isRTL ? <ChevronLeft size={20} color={COLORS.darkGray} /> : <ChevronRight size={20} color={COLORS.darkGray} />}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleShareApp}>
            <View style={styles.menuItemLeft}>
              <Share2 size={20} color={COLORS.darkGray} />
              <Text style={styles.menuItemText}>{t('profile.shareApp')}</Text>
            </View>
            <View style={{ width: 20, height: 20 }}>
              {isRTL ? <ChevronLeft size={20} color={COLORS.darkGray} /> : <ChevronRight size={20} color={COLORS.darkGray} />}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/contact-us')}
          >
            <View style={styles.menuItemLeft}>
              <Phone size={20} color={COLORS.darkGray} />
              <Text style={styles.menuItemText}>تواصل معنا</Text>
            </View>
            <View style={{ width: 20, height: 20 }}>
              {isRTL ? <ChevronLeft size={20} color={COLORS.darkGray} /> : <ChevronRight size={20} color={COLORS.darkGray} />}
            </View>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('profile.language')}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <X size={24} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={languages}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.code}
            style={styles.languageList}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    padding: 16,
  },
  profileInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  nameContainer: {
    marginRight: 16,
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  userId: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  pointsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  pointsHistory: {
    fontSize: 14,
    color: COLORS.primary,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  pointsButton: {
    alignSelf: 'flex-end',
  },
  premiumCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumTextContainer: {
    marginRight: 16,
    flex: 1,
    alignItems: 'flex-end',
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  premiumButton: {
    width: '100%',
  },
  menuSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuItemLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.black,
    marginRight: 16,
  },
  menuItemValue: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  languagePreview: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 18,
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    color: COLORS.error,
    marginRight: 8,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedLanguageItem: {
    backgroundColor: COLORS.gray,
  },
  languageName: {
    fontSize: 16,
    color: COLORS.black,
    marginRight: 12,
    flex: 1,
    textAlign: 'right',
  },
  selectedLanguageName: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});