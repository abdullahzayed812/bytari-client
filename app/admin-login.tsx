import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useApp } from "@/providers/AppProvider";

export default function AdminLoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login } = useApp();

  const loginMutation = useMutation(trpc.admin.auth.login.mutationOptions());

  const testModeratorLogin = async (type: "courses" | "union" | "hospitals") => {
    let moderatorPermissions = {};
    let name = "";

    switch (type) {
      case "courses":
        moderatorPermissions = {
          coursesManagement: true,
          coursesPermissions: {
            canCreate: true,
            canEdit: true,
            canDelete: true,
            canManageRegistrations: true,
            canViewAnalytics: true,
            canSendNotifications: true,
          },
        };
        name = "مشرف الدورات والندوات";
        break;
      case "union":
        moderatorPermissions = {
          unionManagement: true,
          unionPermissions: {
            canManageMainSettings: true,
            canManageBranches: true,
            canManageAnnouncements: true,
            canManageMembers: true,
            canManageEvents: true,
            canManageCertificates: true,
            canViewReports: true,
            canViewAnalytics: true,
            canSendNotifications: true,
            canManageUsers: true,
          },
        };
        name = "مشرف النقابة";
        break;
      case "hospitals":
        moderatorPermissions = {
          hospitalsManagement: true,
          hospitalPermissions: {
            canCreate: true,
            canEdit: true,
            canDelete: true,
            canManageAnnouncements: true,
            canManageDoctors: true,
            canManageAppointments: true,
            canViewReports: true,
            canManageSettings: true,
            canViewAnalytics: true,
            canManageUsers: true,
          },
        };
        name = "مشرف المستشفيات";
        break;
    }

    try {
      await login(
        {
          name,
          email: `${type}-moderator@test.com`,
          isModerator: true,
          moderatorPermissions,
        },
        "veterinarian"
      );

      Alert.alert("تم تسجيل الدخول بنجاح! 👋", `مرحباً بك ${name}`, [
        {
          text: "الانتقال للوحة التحكم",
          onPress: () => {
            router.replace("/moderator-quick-actions");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("خطأ", "فشل في تسجيل الدخول");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("خطأ", "يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    console.log("بدء عملية تسجيل دخول الإدارة...");

    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: (result) => {
          if (result.success) {
            console.log("تم تسجيل دخول الإدارة بنجاح");

            Alert.alert("مرحباً بك في الإدارة! 👋", result.message, [
              {
                text: "العودة للصفحة الرئيسية",
                onPress: () => {
                  router.replace("/(tabs)");
                },
              },
              {
                text: "الانتقال للوحة التحكم",
                onPress: () => {
                  router.replace("/admin-dashboard");
                },
              },
            ]);
          } else {
            Alert.alert("خطأ في تسجيل الدخول ❌", result.message);
          }
        },
        onError: (error) => {
          console.error("خطأ في تسجيل دخول الإدارة:", error);
          Alert.alert("خطأ في تسجيل الدخول ❌", "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.");
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowRight size={24} color="#6b7280" />
            <Text style={styles.backButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Lock size={40} color="#2563eb" />
          </View>
          <Text style={styles.title}>لوحة تحكم الإدارة</Text>
          <Text style={styles.subtitle}>تسجيل دخول المشرفين</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="البريد الإلكتروني"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="right"
            />
          </View>

          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputIcon}>
              {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="كلمة المرور"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textAlign="right"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loginMutation.isPending && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
          >
            <Text style={styles.loginButtonText}>
              {loginMutation.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🔑 بيانات الدخول</Text>
          <Text style={styles.infoText}>الأدمن الأساسي: zuhairalrawi0@gmail.com</Text>
          <Text style={styles.infoText}>كلمة المرور: zuh000123000321zuh</Text>
          <Text style={styles.infoNote}>⚠️ للمستخدمين المرقيين: استخدم بريدك الإلكتروني وكلمة المرور: admin123</Text>
        </View>

        {/* Test Moderator Buttons */}
        <View style={styles.testSection}>
          <Text style={styles.testTitle}>🧪 اختبار المشرفين</Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => testModeratorLogin("courses")}
            disabled={loginMutation.isPending}
          >
            <Text style={styles.testButtonText}>مشرف الدورات والندوات</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => testModeratorLogin("union")}
            disabled={loginMutation.isPending}
          >
            <Text style={styles.testButtonText}>مشرف النقابة</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => testModeratorLogin("hospitals")}
            disabled={loginMutation.isPending}
          >
            <Text style={styles.testButtonText}>مشرف المستشفيات</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#1f2937",
  },
  loginButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  infoNote: {
    fontSize: 12,
    color: "#059669",
    textAlign: "center",
    fontStyle: "italic",
  },
  testSection: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0c4a6e",
    marginBottom: 12,
    textAlign: "center",
  },
  testButton: {
    backgroundColor: "#0ea5e9",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: "center",
  },
  testButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  backButtonContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  backButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 14,
    color: "#6b7280",
    marginRight: 6,
    fontWeight: "500",
  },
});
