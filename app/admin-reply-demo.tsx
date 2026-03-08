import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { COLORS } from "../constants/colors";
import { useI18n } from "@/providers/I18nProvider";
import AdminReplyForm from "../components/AdminReplyForm";
import UserReplyForm from "../components/UserReplyForm";

export default function AdminReplyDemoScreen() {
  const { t } = useI18n();
  const handleReplySuccess = () => {
    console.log('Reply sent successfully!');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t("replyDemo.title"),
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t("replyDemo.forModerators")}</Text>
        <Text style={styles.description}>
          {t("replyDemo.forModeratorDesc")}
        </Text>
        
        <AdminReplyForm
          type="inquiry"
          itemId={1}
          moderatorId={1}
          onReplySuccess={handleReplySuccess}
        />

        <Text style={styles.sectionTitle}>{t("replyDemo.forUsers")}</Text>
        <Text style={styles.description}>
          {t("replyDemo.forUserDesc")}
        </Text>
        
        <UserReplyForm
          type="consultation"
          itemId={1}
          userId={1}
          isConversationOpen={true}
          onReplySuccess={handleReplySuccess}
        />

        <Text style={styles.sectionTitle}>{t("replyDemo.closedConversation")}</Text>
        <Text style={styles.description}>
          {t("replyDemo.closedDesc")}
        </Text>
        
        <UserReplyForm
          type="inquiry"
          itemId={2}
          userId={1}
          isConversationOpen={false}
          onReplySuccess={handleReplySuccess}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{t("replyDemo.howItWorks")}</Text>
          <Text style={styles.infoText}>
            {t("replyDemo.step1")}{'\n'}
            {t("replyDemo.step2")}{'\n'}
            {t("replyDemo.step3")}{'\n'}
            {t("replyDemo.step4")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 24,
    textAlign: 'right',
  },
});