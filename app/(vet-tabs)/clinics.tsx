import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { MessageSquare, Calendar, Bookmark, AlertTriangle, Bell, Award, Building2 } from 'lucide-react-native';
import { router } from 'expo-router';

export default function VetSectionsScreen() {
  const { t } = useI18n();

  const sections = [
    {
      id: '1',
      title: t('sections.consultations'),
      icon: MessageSquare,
      color: '#4CAF50',
      onPress: () => router.push('/consultations-list'),
    },
    {
      id: '2',
      title: t('sections.appointments'),
      icon: Calendar,
      color: '#2196F3',
      onPress: () => router.push('/appointments'),
    },
    {
      id: '3',
      title: t('sections.bestTips'),
      icon: Bookmark,
      color: '#4CAF50',
      onPress: () => router.push('/tips-list'),
    },
    {
      id: '4',
      title: t('sections.lostAnimals'),
      icon: AlertTriangle,
      color: '#F44336',
      onPress: () => router.push('/lost-pets-list'),
    },
    {
      id: '5',
      title: t('sections.reminders'),
      icon: Bell,
      color: '#FF9800',
      onPress: () => router.push('/reminders'),
    },
    {
      id: '6',
      title: t('sections.premiumMembership'),
      icon: Award,
      color: '#4CAF50',
      onPress: () => router.push('/premium-subscription'),
    },
    {
      id: '7',
      title: t('sections.clinics'),
      icon: Building2,
      color: '#2196F3',
      onPress: () => router.push('/clinic-system'),
    },
  ];

  const renderSectionCard = (section: typeof sections[0]) => {
    const IconComponent = section.icon;
    return (
      <TouchableOpacity
        key={section.id}
        style={[styles.sectionCard, { backgroundColor: section.color }]}
        onPress={section.onPress}
        testID={`section-${section.id}`}
      >
        <View style={styles.iconContainer}>
          <IconComponent size={32} color={COLORS.white} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('sections.title')}</Text>
      </View>
      
      <View style={styles.sectionsGrid}>
        {sections.map(renderSectionCard)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  sectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  sectionCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 20,
  },
});