import { StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import Button from "../components/Button";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "../lib/trpc";
import { useMutation } from "@tanstack/react-query";

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmailCodeScreen() {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const { login } = useApp();
  const { userId, email } = useLocalSearchParams<{ userId: string; email: string }>();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const verifyMutation = useMutation(trpc.auth.verifyRegistrationCode.mutationOptions());
  const resendMutation = useMutation(trpc.auth.resendVerificationCode.mutationOptions());

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = () => {
    if (!code.trim()) {
      setError(t("emailVerification.codeRequired"));
      return;
    }
    setError("");
    verifyMutation.mutate(
      { userId: Number(userId), code: code.trim() },
      {
        onSuccess: async (data: any) => {
          await login(data.user, data.tokens.accessToken);
          router.replace("/(tabs)");
        },
        onError: (err) => {
          setError(err.message || t("emailVerification.invalidCode"));
        },
      },
    );
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    setError("");
    resendMutation.mutate(
      { userId: Number(userId) },
      {
        onSuccess: (data: any) => {
          if (data?.success === false) {
            setError(data.message || t("emailVerification.resendCooldown"));
            return;
          }
          setCooldown(RESEND_COOLDOWN_SECONDS);
        },
        onError: (err) => {
          setError(err.message || t("emailVerification.resendFailed"));
        },
      },
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: t("emailVerification.title") }} />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.content}>
          <Text style={[styles.title, { textAlign: isRTL ? "right" : "left" }]}>{t("emailVerification.title")}</Text>
          <Text style={[styles.subtitle, { textAlign: isRTL ? "right" : "left" }]}>
            {t("emailVerification.subtitle")} {email}
          </Text>

          <TextInput
            style={[styles.input, { textAlign: "center" }]}
            value={code}
            onChangeText={setCode}
            placeholder={t("emailVerification.codePlaceholder")}
            placeholderTextColor={COLORS.darkGray}
            keyboardType="number-pad"
            maxLength={6}
          />

          {!!error && <Text style={[styles.errorText, { textAlign: isRTL ? "right" : "left" }]}>{error}</Text>}

          <Button
            title={verifyMutation.isPending ? t("common.loading") : t("emailVerification.verifyButton")}
            onPress={handleVerify}
            disabled={verifyMutation.isPending}
            loading={verifyMutation.isPending}
            style={styles.verifyButton}
          />

          <TouchableOpacity onPress={handleResend} disabled={cooldown > 0 || resendMutation.isPending} style={styles.resendButton}>
            <Text style={[styles.resendText, cooldown > 0 && styles.resendTextDisabled]}>
              {cooldown > 0
                ? `${t("emailVerification.resendButton")} (${cooldown})`
                : resendMutation.isPending
                  ? t("common.loading")
                  : t("emailVerification.resendButton")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingVertical: 14,
    fontSize: 24,
    letterSpacing: 8,
    color: COLORS.black,
    marginBottom: 12,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 12,
  },
  verifyButton: {
    marginTop: 8,
  },
  resendButton: {
    marginTop: 20,
    alignItems: "center",
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  resendTextDisabled: {
    color: COLORS.darkGray,
  },
});
