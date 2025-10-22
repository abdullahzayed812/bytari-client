import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import {
  Settings,
  Bot,
  MessageSquare,
  HelpCircle,
  Save,
  RotateCcw,
  BarChart3,
  TestTube,
  Zap,
} from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";

interface AiSettings {
  id: number;
  type: "consultations" | "inquiries";
  isEnabled: boolean;
  systemPrompt: string;
  responseDelay: number;
  maxResponseLength: number;
  enabledBy?: number;
  updatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminAiSettingsScreen() {
  const [consultationSettings, setConsultationSettings] = useState<AiSettings | null>(null);
  const [inquirySettings, setInquirySettings] = useState<AiSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Mock admin ID - في التطبيق الحقيقي يجب الحصول عليه من context المستخدم
  const adminId = 1;

  // جلب إعدادات الذكاء الاصطناعي
  const {
    data: aiSettingsData,
    refetch,
    isLoading,
  } = useQuery(
    trpc.admin.aiSettings.get.queryOptions(
      {},
      {
        retry: 1,
      }
    )
  );

  // Mutations
  const updateAiSettings = useMutation(
    trpc.admin.aiSettings.update.mutationOptions({
      onSuccess: () => {
        Alert.alert("نجح", "تم تحديث إعدادات الذكاء الاصطناعي بنجاح");
        refetch();
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message);
      },
    })
  );

  const toggleAi = useMutation(
    trpc.admin.aiSettings.toggle.mutationOptions({
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message);
      },
    })
  );

  // Test AI mutation
  const testAi = useMutation(
    trpc.ai.test.mutationOptions({
      onSuccess: (result) => {
        Alert.alert("نتيجة الاختبار", result.testResponse || "تم الاختبار بنجاح", [{ text: "موافق" }]);
      },
      onError: (error) => {
        Alert.alert("خطأ في الاختبار", error.message);
      },
    })
  );

  useEffect(() => {
    if (aiSettingsData?.success && aiSettingsData.settings) {
      const consultations = aiSettingsData.settings.find((s: any) => s.type === "consultations");
      const inquiries = aiSettingsData.settings.find((s: any) => s.type === "inquiries");

      setConsultationSettings((consultations as AiSettings) || getDefaultSettings("consultations"));
      setInquirySettings((inquiries as AiSettings) || getDefaultSettings("inquiries"));
      setLoading(false);
    } else if (!isLoading && !aiSettingsData) {
      // If no data and not loading, set defaults
      console.log("🔄 No AI settings data, using defaults");
      setConsultationSettings(getDefaultSettings("consultations"));
      setInquirySettings(getDefaultSettings("inquiries"));
      setLoading(false);
    }
  }, [aiSettingsData, isLoading]);

  const getDefaultSettings = (type: "consultations" | "inquiries"): AiSettings => ({
    id: 0,
    type,
    isEnabled: true, // تفعيل الذكاء الاصطناعي افتراضياً
    systemPrompt:
      type === "consultations"
        ? "أنت طبيب بيطري خبير ومساعد ذكي متخصص في الاستشارات البيطرية. قدم نصائح طبية مفيدة ومهنية ودقيقة للمستخدمين حول رعاية الحيوانات الأليفة وعلاج الأمراض. اجعل ردودك واضحة ومفهومة وعملية. في حالة الحالات الطارئة، انصح بزيارة الطبيب البيطري فوراً."
        : "أنت مساعد ذكي متخصص في الرد على استفسارات الأطباء البيطريين والطلاب. قدم إجابات دقيقة ومهنية وعلمية حول الطب البيطري والممارسات المهنية. استخدم المصطلحات الطبية المناسبة وقدم مراجع علمية عند الحاجة.",
    responseDelay: 15, // تقليل وقت التأخير
    maxResponseLength: 1500, // زيادة طول الرد
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const handleToggleAi = (type: "consultations" | "inquiries", isEnabled: boolean) => {
    toggleAi.mutate({
      type,
      isEnabled,
      adminId,
    });

    // تحديث الحالة المحلية فوراً
    if (type === "consultations" && consultationSettings) {
      setConsultationSettings({ ...consultationSettings, isEnabled });
    } else if (type === "inquiries" && inquirySettings) {
      setInquirySettings({ ...inquirySettings, isEnabled });
    }
  };

  const handleSaveSettings = (type: "consultations" | "inquiries") => {
    const settings = type === "consultations" ? consultationSettings : inquirySettings;

    if (!settings) return;

    setSaving(true);
    updateAiSettings.mutate(
      {
        type,
        isEnabled: settings.isEnabled,
        systemPrompt: settings.systemPrompt,
        responseDelay: settings.responseDelay,
        maxResponseLength: settings.maxResponseLength,
        adminId,
      },
      {
        onSettled: () => setSaving(false),
      }
    );
  };

  const handleResetToDefault = (type: "consultations" | "inquiries") => {
    Alert.alert("إعادة تعيين", "هل أنت متأكد من إعادة تعيين الإعدادات إلى القيم الافتراضية؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إعادة تعيين",
        style: "destructive",
        onPress: () => {
          const defaultSettings = getDefaultSettings(type);
          if (type === "consultations") {
            setConsultationSettings(defaultSettings);
          } else {
            setInquirySettings(defaultSettings);
          }
        },
      },
    ]);
  };

  const handleTestAi = (type: "consultations" | "inquiries") => {
    setTesting(type);
    testAi.mutate(
      { type },
      {
        onSettled: () => setTesting(null),
      }
    );
  };

  const renderSettingsCard = (
    title: string,
    settings: AiSettings | null,
    onSettingsChange: (settings: AiSettings) => void,
    type: "consultations" | "inquiries"
  ) => {
    if (!settings) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <View style={styles.iconContainer}>
              {type === "consultations" ? (
                <MessageSquare size={20} color="#10B981" />
              ) : (
                <HelpCircle size={20} color="#3B82F6" />
              )}
            </View>
            <Text style={styles.cardTitle}>{title}</Text>
          </View>
          <Switch
            value={settings.isEnabled}
            onValueChange={(value) => handleToggleAi(type, value)}
            trackColor={{ false: "#E5E7EB", true: "#10B981" }}
            thumbColor={settings.isEnabled ? "#FFFFFF" : "#9CA3AF"}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>النص التوجيهي للذكاء الاصطناعي:</Text>
          <TextInput
            style={styles.textArea}
            value={settings.systemPrompt}
            onChangeText={(text) => onSettingsChange({ ...settings, systemPrompt: text })}
            multiline
            numberOfLines={4}
            placeholder="أدخل النص التوجيهي..."
            editable={settings.isEnabled}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>تأخير الرد (بالثواني):</Text>
          <TextInput
            style={styles.numberInput}
            value={settings.responseDelay.toString()}
            onChangeText={(text) => {
              const delay = parseInt(text) || 30;
              onSettingsChange({ ...settings, responseDelay: Math.max(5, Math.min(300, delay)) });
            }}
            keyboardType="numeric"
            placeholder="30"
            editable={settings.isEnabled}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>الحد الأقصى لطول الرد:</Text>
          <TextInput
            style={styles.numberInput}
            value={settings.maxResponseLength.toString()}
            onChangeText={(text) => {
              const length = parseInt(text) || 1000;
              onSettingsChange({ ...settings, maxResponseLength: Math.max(100, Math.min(2000, length)) });
            }}
            keyboardType="numeric"
            placeholder="1000"
            editable={settings.isEnabled}
          />
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={() => handleResetToDefault(type)}
          >
            <RotateCcw size={16} color="#EF4444" />
            <Text style={styles.resetButtonText}>إعادة تعيين</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={() => handleSaveSettings(type)}
            disabled={saving}
          >
            {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Save size={16} color="#FFFFFF" />}
            <Text style={styles.saveButtonText}>حفظ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("⏰ Loading timeout, setting default values");
        setConsultationSettings(getDefaultSettings("consultations"));
        setInquirySettings(getDefaultSettings("inquiries"));
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading && isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "إعدادات الذكاء الاصطناعي" }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>جاري تحميل الإعدادات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إعدادات الذكاء الاصطناعي",
          headerStyle: { backgroundColor: "#10B981" },
          headerTintColor: "#FFFFFF",
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Bot size={32} color="#10B981" />
          <Text style={styles.headerTitle}>إدارة الذكاء الاصطناعي</Text>
          <Text style={styles.headerSubtitle}>تحكم في إعدادات الرد التلقائي للاستشارات والاستفسارات</Text>
        </View>

        {renderSettingsCard("الاستشارات البيطرية", consultationSettings, setConsultationSettings, "consultations")}

        {renderSettingsCard("استفسارات الأطباء", inquirySettings, setInquirySettings, "inquiries")}

        <View style={styles.infoCard}>
          <Settings size={20} color="#6B7280" />
          <Text style={styles.infoText}>
            عند تفعيل الذكاء الاصطناعي، سيتم الرد تلقائياً على الاستشارات والاستفسارات الجديدة. يمكنك تخصيص النص
            التوجيهي وتأخير الرد لكل نوع بشكل منفصل.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
  },
  settingRow: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    textAlignVertical: "top",
    minHeight: 80,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: "center",
  },
  resetButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  resetButtonText: {
    color: "#EF4444",
    fontWeight: "600",
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginLeft: 12,
  },
});
