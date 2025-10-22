import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { Stack } from 'expo-router';
import Card from "../components/Card";
import { trpc } from '../lib/trpc';

export default function ConsultationsListScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();

  const { data: consultations, isLoading, error } = trpc.consultations.listForUser.useQuery();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'استشاراتك السابقة',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              {isRTL ? (
                <ArrowRight size={24} color={COLORS.black} />
              ) : (
                <ArrowLeft size={24} color={COLORS.black} />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {consultations.map((consultation) => (
          <Card
            key={consultation.id}
            title={consultation.question}
            subtitle={new Date(consultation.createdAt).toLocaleDateString()}
            style={styles.consultationCard}
            onPress={() => {
              console.log(`View consultation ${consultation.id}`);
              // TODO: Navigate to consultation details
            }}
          >
            <View style={[styles.statusContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View
                style={[
                  styles.statusIndicator,
                  consultation.status === 'pending'
                    ? styles.statusPending
                    : consultation.status === 'answered'
                    ? styles.statusAnswered
                    : styles.statusClosed,
                ]}
              />
              <Text style={[styles.statusText, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
                {t(`consultation.${consultation.status}`)}
              </Text>
            </View>
            {consultation.answer && (
              <Text style={[styles.answerText, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={3}>
                {consultation.answer.text}
              </Text>
            )}
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  consultationCard: {
    marginBottom: 16,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusPending: {
    backgroundColor: COLORS.warning,
  },
  statusAnswered: {
    backgroundColor: COLORS.success,
  },
  statusClosed: {
    backgroundColor: COLORS.darkGray,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  answerText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
});