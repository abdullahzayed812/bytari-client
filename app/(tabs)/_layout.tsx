import { Tabs, Redirect } from "expo-router";
import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { Home, ShoppingBag, Grid, User, Building2, PawPrint } from "lucide-react-native";
import { AdminTopBar } from "../../components/AdminTopBar";

// مكون الأيقونة المتحركة
const AnimatedTabIcon = ({
  focused,
  children,
  onPress,
}: {
  focused: boolean;
  children: React.ReactNode;
  onPress?: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.2 : 1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      // حركة التكبير مع الارتداد
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.3,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: -8,
            tension: 300,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // العودة للحالة الطبيعية
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          tension: 300,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [focused, scaleAnim, bounceAnim, glowAnim]);

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(76, 175, 80, 0)", "rgba(76, 175, 80, 0.3)"],
  });

  return (
    <Animated.View
      style={[
        styles.animatedIconContainer,
        {
          transform: [{ scale: scaleAnim }, { translateY: bounceAnim }],
        },
      ]}
    >
      {/* هالة متوهجة */}
      <Animated.View
        style={[
          styles.glowContainer,
          {
            backgroundColor: glowColor,
            opacity: glowAnim,
          },
        ]}
      />

      {/* الأيقونة الرئيسية */}
      <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>{children}</View>
    </Animated.View>
  );
};

export default function TabLayout() {
  const { t, isRTL } = useI18n();
  const { isAuthenticated, isLoading, userMode, hasAdminAccess, isSuperAdmin } = useApp();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return (
    <View style={styles.container}>
      {/* القائمة العلوية للإدارة - تظهر فقط للمستخدمين الذين لديهم صلاحيات إدارية */}
      {/* <View style={styles.greenBar} /> */}
      {hasAdminAccess ? <AdminTopBar /> : null}

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.white,
          tabBarInactiveTintColor: COLORS.primary,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            height: 70,
            paddingBottom: 15,
            paddingTop: 8,
            elevation: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -5 },
            shadowOpacity: 0.15,
            shadowRadius: 15,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            flexDirection: isRTL ? "row-reverse" : "row",
            borderTopColor: "rgba(76, 175, 80, 0.1)",
            borderTopWidth: 2,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
            textAlign: "center",
            marginTop: 5,
          },
          tabBarActiveBackgroundColor: "transparent",
          tabBarItemStyle: {
            paddingVertical: 5,
          },
        }}
      >
        <Tabs.Screen
          name="profile"
          options={{
            title: t("profile.title"),
            tabBarLabel: "",
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedTabIcon focused={focused}>
                <User size={22} color={focused ? COLORS.white : COLORS.primary} />
              </AnimatedTabIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="store"
          options={{
            title: t("store.title"),
            tabBarLabel: "",
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedTabIcon focused={focused}>
                <ShoppingBag size={22} color={focused ? COLORS.white : COLORS.primary} />
              </AnimatedTabIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: t("home.title"),
            tabBarLabel: "",
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedTabIcon focused={focused}>
                <Home size={22} color={focused ? COLORS.white : COLORS.primary} />
              </AnimatedTabIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="pets"
          options={{
            title: userMode === "veterinarian" || isSuperAdmin ? "عيادتي" : t("pets.title"),
            tabBarLabel: "",
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedTabIcon focused={focused}>
                {userMode === "veterinarian" || isSuperAdmin ? (
                  <Building2 size={22} color={focused ? COLORS.white : COLORS.primary} />
                ) : (
                  <PawPrint size={22} color={focused ? COLORS.white : COLORS.primary} />
                )}
              </AnimatedTabIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="sections"
          options={{
            title: t("sections.title"),
            tabBarLabel: "",
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedTabIcon focused={focused}>
                <Grid size={22} color={focused ? COLORS.white : COLORS.primary} />
              </AnimatedTabIcon>
            ),
          }}
        />

        {/* إخفاء الشاشات الإضافية التي تظهر كأسهم */}
        <Tabs.Screen
          name="add-pet"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="pet-details"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="lost-pet"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="report-lost-pet"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="clinics"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  animatedIconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeIconContainer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.white,
  },
  glowContainer: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -7.5,
    left: -7.5,
  },
  greenBar: {
    height: 60,
    backgroundColor: COLORS.primary,
    width: "100%",
  },
});
