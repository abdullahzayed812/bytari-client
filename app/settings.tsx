import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { Stack, router } from 'expo-router';
import { ArrowRight, Phone, Bell, Shield, HelpCircle, Info, Globe, User, ArrowLeft } from 'lucide-react-native';
import { handleBackNavigation } from "../lib/navigation-utils";

export default function SettingsScreen() {
  const { t, isRTL } = useI18n();

  const settingsItems = [
    {
      id: 'contact',
      title: 'تواصل معنا',
      icon: <Phone size={24} color={COLORS.primary} />,
      route: '/contact-us'
    },
    {
      id: 'notifications',
      title: 'إعدادات الإشعارات',
      icon: <Bell size={24} color={COLORS.primary} />,
      route: '/notifications'
    },
    {
      id: 'privacy',
      title: 'الخصوصية والأمان',
      icon: <Shield size={24} color={COLORS.primary} />,
      route: '/privacy'
    },
    {
      id: 'language',
      title: 'اللغة',
      icon: <Globe size={24} color={COLORS.primary} />,
      route: '/language'
    },
    {
      id: 'account',
      title: 'إعدادات الحساب',
      icon: <User size={24} color={COLORS.primary} />,
      route: '/account-settings'
    },
    {
      id: 'help',
      title: 'المساعدة والدعم',
      icon: <HelpCircle size={24} color={COLORS.primary} />,
      route: '/help'
    },
    {
      id: 'about',
      title: 'حول التطبيق',
      icon: <Info size={24} color={COLORS.primary} />,
      route: '/about'
    }
  ];

  const handleItemPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'الإعدادات',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black, fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => handleBackNavigation()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            إدارة إعدادات التطبيق والحساب الشخصي
          </Text>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>الإعدادات العامة</Text>
          
          <View style={styles.settingsCard}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity 
                key={item.id}
                style={[
                  styles.settingItem,
                  index === settingsItems.length - 1 && styles.lastItem
                ]}
                onPress={() => handleItemPress(item.route)}
              >
                <View style={styles.settingItemContent}>
                  {item.icon}
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                  </View>
                </View>
                <ArrowRight size={20} color={COLORS.darkGray} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>إصدار التطبيق: 1.0.0</Text>
          <Text style={styles.appCopyright}>©2025 Veterinary App. جميع الحقوق محفوظة</Text>
        </View>
        
        {/* مساحة إضافية في الأسفل */}
        <View style={{ height: 100 }} />
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
  },
  headerText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  settingsSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingItemContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginRight: 16,
    flex: 1,
    alignItems: 'flex-end',
  },
  settingTitle: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500',
  },
  appInfo: {
    margin: 16,
    marginTop: 32,
    alignItems: 'center',
    paddingBottom: 32,
  },
  appVersion: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  appCopyright: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});