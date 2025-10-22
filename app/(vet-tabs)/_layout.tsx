import { Tabs } from "expo-router";
import React from "react";
import { View, I18nManager } from "react-native";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { Home, ShoppingBag, Building2, Grid, User } from "lucide-react-native";

export default function VetTabLayout() {
  const { t, isRTL } = useI18n();

  // Define tab order based on RTL
  const tabOrder = isRTL 
    ? ['profile', 'store', 'index', 'clinics']
    : ['clinics', 'index', 'store', 'profile'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.darkGray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGray,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          textAlign: isRTL ? 'right' : 'left',
        },
        tabBarItemStyle: {
          padding: 5,
        },
        tabBarActiveBackgroundColor: 'transparent',
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarLabel: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: focused ? 40 : size,
              height: focused ? 40 : size,
              backgroundColor: focused ? COLORS.primary : 'transparent',
              borderRadius: focused ? 20 : 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <User size={size} color={focused ? COLORS.white : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: t('store.title'),
          tabBarLabel: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: focused ? 40 : size,
              height: focused ? 40 : size,
              backgroundColor: focused ? COLORS.primary : 'transparent',
              borderRadius: focused ? 20 : 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <ShoppingBag size={size} color={focused ? COLORS.white : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: t('home.title'),
          tabBarLabel: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: focused ? 40 : size,
              height: focused ? 40 : size,
              backgroundColor: focused ? COLORS.primary : 'transparent',
              borderRadius: focused ? 20 : 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Home size={size} color={focused ? COLORS.white : color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="clinics"
        options={{
          title: t('sections.title'),
          tabBarLabel: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: focused ? 40 : size,
              height: focused ? 40 : size,
              backgroundColor: focused ? COLORS.primary : 'transparent',
              borderRadius: focused ? 20 : 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Grid size={size} color={focused ? COLORS.white : color} />
            </View>
          ),
        }}
      />
      
      {/* إخفاء الشاشات الإضافية التي قد تتعارض مع التبويبات */}
      <Tabs.Screen
        name="pets"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="vet-home"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}