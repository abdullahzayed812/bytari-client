import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useRef } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import Button from "../components/Button";
import { mockConsultations } from "../mocks/data";

export default function VetInquiriesScreen() {
  const { t, isRTL } = useI18n();
  const { userMode } = useApp();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Scroll to top when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const handleSendConsultation = () => {
    if (userMode === 'veterinarian') {
      router.push('/new-inquiry');
    } else {
      router.push('/consultation');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: userMode === 'veterinarian' ? 'الاستفسارات' : 'الاستشارات',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Consultation Section */}
        <View style={styles.consultationSection}>
          <View style={styles.consultationCard}>
            <Text style={[styles.consultationText, { textAlign: 'center' }]}>
              {userMode === 'veterinarian' ? t('home.consultationVet') : t('home.consultation')}
            </Text>
            <Button
              title={userMode === 'veterinarian' ? 'ارسل استفسارك' : t('home.sendConsultation')}
              onPress={handleSendConsultation}
              type="primary"
              size="medium"
              style={styles.consultationButton}
            />
          </View>
        </View>

        {/* Previous Consultations/Inquiries Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {userMode === 'veterinarian' ? 'استفساراتك السابقة' : 'استشاراتك السابقة'}
          </Text>
          
          {mockConsultations.map((consultation) => (
            <TouchableOpacity
              key={consultation.id}
              style={styles.consultationHistoryCard}
              onPress={() => {
                if (userMode === 'veterinarian') {
                  router.push('/vet-inquiries');
                } else {
                  router.push('/consultation');
                }
              }}
            >
              <View style={[styles.consultationHistoryContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {/* Status Badge */}
                <View style={[styles.statusContainer, { alignSelf: isRTL ? 'flex-start' : 'flex-end' }]}>
                  <View style={[
                    styles.statusIndicator,
                    consultation.status === 'pending' ? styles.statusPending :
                    consultation.status === 'answered' ? styles.statusAnswered : styles.statusClosed
                  ]} />
                  <Text style={styles.statusText}>
                    {consultation.status === 'pending' ? 'قيد المراجعة' :
                     consultation.status === 'answered' ? 'تم الرد' : 'مغلق'}
                  </Text>
                </View>
                
                {/* Consultation Info */}
                <View style={styles.consultationHistoryDetails}>
                  <Text style={[styles.consultationHistoryTitle, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
                    {consultation.title}
                  </Text>
                  
                  {consultation.petName && (
                    <Text style={[styles.consultationHistoryPet, { textAlign: isRTL ? 'right' : 'left' }]}>
                      الحيوان: {consultation.petName}
                    </Text>
                  )}
                  
                  <Text style={[styles.consultationHistoryDescription, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={3}>
                    {consultation.description}
                  </Text>
                  
                  <Text style={[styles.consultationHistoryDate, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {new Date(consultation.createdAt).toLocaleDateString('ar-SA')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  content: {
    flex: 1,
    paddingBottom: 90,
  },
  consultationSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 16,
  },
  consultationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultationText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 26,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  consultationButton: {
    width: '100%',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  consultationHistoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultationHistoryContent: {
    alignItems: 'flex-start',
  },
  consultationHistoryDetails: {
    flex: 1,
  },
  consultationHistoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 6,
    lineHeight: 22,
  },
  consultationHistoryPet: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 6,
  },
  consultationHistoryDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 8,
  },
  consultationHistoryDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  statusContainer: {
    alignItems: 'center',
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
});