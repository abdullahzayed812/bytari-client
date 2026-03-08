import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { Stack, router } from 'expo-router';
import { ArrowRight, HelpCircle, ChevronDown, ChevronUp, MessageCircle, Phone, Mail } from 'lucide-react-native';
import { useI18n } from "@/providers/I18nProvider";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function HelpScreen() {
  const { t } = useI18n();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const faqData: FAQItem[] = [
    { id: '1', question: t("help.faq.q1"), answer: t("help.faq.a1") },
    { id: '2', question: t("help.faq.q2"), answer: t("help.faq.a2") },
    { id: '3', question: t("help.faq.q3"), answer: t("help.faq.a3") },
    { id: '4', question: t("help.faq.q4"), answer: t("help.faq.a4") },
    { id: '5', question: t("help.faq.q5"), answer: t("help.faq.a5") },
    { id: '6', question: t("help.faq.q6"), answer: t("help.faq.a6") },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t("help.title"),
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black, fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowRight size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <HelpCircle size={40} color={COLORS.white} />
          <Text style={styles.headerText}>{t("help.headerText")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("help.faqTitle")}</Text>

          <View style={styles.faqCard}>
            {faqData.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.faqItem}
                  onPress={() => toggleExpanded(item.id)}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                    {expandedItems.includes(item.id) ? (
                      <ChevronUp size={20} color={COLORS.primary} />
                    ) : (
                      <ChevronDown size={20} color={COLORS.primary} />
                    )}
                  </View>
                </TouchableOpacity>

                {expandedItems.includes(item.id) && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}

                {index < faqData.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>{t("help.notFound")}</Text>
          <Text style={styles.contactSubtitle}>{t("help.contactUs")}</Text>

          <View style={styles.contactOptions}>
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => router.push('/contact-us')}
            >
              <MessageCircle size={24} color={COLORS.primary} />
              <Text style={styles.contactOptionText}>{t("help.sendMessage")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactOption}>
              <Phone size={24} color={COLORS.primary} />
              <Text style={styles.contactOptionText}>{t("help.phoneCall")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactOption}>
              <Mail size={24} color={COLORS.primary} />
              <Text style={styles.contactOptionText}>{t("common.email")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>{t("help.tipsTitle")}</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Text style={styles.tipTitle}>{t("help.tip1.title")}</Text>
              <Text style={styles.tipDescription}>{t("help.tip1.desc")}</Text>
            </View>

            <View style={styles.tipItem}>
              <Text style={styles.tipTitle}>{t("help.tip2.title")}</Text>
              <Text style={styles.tipDescription}>{t("help.tip2.desc")}</Text>
            </View>

            <View style={styles.tipItem}>
              <Text style={styles.tipTitle}>{t("help.tip3.title")}</Text>
              <Text style={styles.tipDescription}>{t("help.tip3.desc")}</Text>
            </View>
          </View>
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
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqItem: {
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
    marginRight: 12,
  },
  faqAnswer: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  faqAnswerText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
  },
  contactSection: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  contactOption: {
    alignItems: 'center',
    padding: 12,
  },
  contactOptionText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 8,
    fontWeight: '500',
  },
  tipsSection: {
    margin: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  tipsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipItem: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
  tipDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    lineHeight: 20,
  },
});
