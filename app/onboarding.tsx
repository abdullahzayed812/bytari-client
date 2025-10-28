import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import React from "react";
import { COLORS } from "../constants/colors";
import Button from "../components/Button";
import { useRouter } from "expo-router";
import { useI18n } from "../providers/I18nProvider";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useI18n();

  const handleGetStarted = () => {
    router.replace("/auth");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/un3u49hypajjf4iutetx9",
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t("onboarding.welcome")}</Text>
          <Text style={styles.description}>{t("onboarding.description")}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          title={t("onboarding.getStarted")}
          onPress={handleGetStarted}
          type="primary"
          size="large"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: COLORS.black,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: COLORS.darkGray,
    lineHeight: 24,
  },
  footer: {
    padding: 24,
  },
  button: {
    width: "100%",
  },
});
