import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, GraduationCap, Play, Clock, User, Plus, Edit3 } from 'lucide-react-native';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";

interface LessonLecture {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  type: 'lesson' | 'lecture';
  level: string;
  description: string;
  thumbnail: string;
}

const mockLessonsLectures: LessonLecture[] = [
  {
    id: '1',
    title: 'أساسيات الطب البيطري للمبتدئين',
    instructor: 'د. أحمد محمد',
    duration: '45 دقيقة',
    type: 'lesson',
    level: 'مبتدئ',
    description: 'درس شامل يغطي الأساسيات الضرورية في الطب البيطري للطلاب المبتدئين',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'
  },
  {
    id: '2',
    title: 'محاضرة: التشخيص المتقدم في الطب البيطري',
    instructor: 'د. فاطمة العلي',
    duration: '90 دقيقة',
    type: 'lecture',
    level: 'متقدم',
    description: 'محاضرة متخصصة حول تقنيات التشخيص الحديثة في الطب البيطري',
    thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
  },
  {
    id: '3',
    title: 'جراحة الحيوانات الأليفة - الجزء الأول',
    instructor: 'د. محمد السعيد',
    duration: '60 دقيقة',
    type: 'lesson',
    level: 'متوسط',
    description: 'درس تطبيقي حول أساسيات الجراحة البيطرية للحيوانات الأليفة',
    thumbnail: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400'
  },
  {
    id: '4',
    title: 'محاضرة: الأمراض المعدية في الحيوانات',
    instructor: 'د. سارة أحمد',
    duration: '75 دقيقة',
    type: 'lecture',
    level: 'متوسط',
    description: 'محاضرة شاملة حول الأمراض المعدية الشائعة وطرق الوقاية والعلاج',
    thumbnail: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400'
  }
];

export default function LessonsLecturesScreen() {
  const { t, isRTL } = useI18n();
  const { isSuperAdmin } = useApp();
  const router = useRouter();

  const renderLessonCard = (item: LessonLecture) => {
    return (
      <TouchableOpacity key={item.id} style={styles.lessonCard} activeOpacity={0.8}>
        <View style={styles.lessonHeader}>
          <View style={styles.lessonTitleContainer}>
            <Text style={styles.lessonTitle}>{item.title}</Text>
            <View style={styles.lessonMeta}>
              <View style={styles.metaItem}>
                <User size={14} color={COLORS.darkGray} />
                <Text style={styles.metaText}>{item.instructor}</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={14} color={COLORS.darkGray} />
                <Text style={styles.metaText}>{item.duration}</Text>
              </View>
            </View>
          </View>
          <View style={styles.playButton}>
            <Play size={24} color={COLORS.white} />
          </View>
        </View>
        
        <Text style={styles.lessonDescription}>{item.description}</Text>
        
        <View style={styles.lessonFooter}>
          <View style={styles.lessonTags}>
            <View style={[styles.tag, { backgroundColor: item.type === 'lesson' ? '#E3F2FD' : '#F3E5F5' }]}>
              <Text style={[styles.tagText, { color: item.type === 'lesson' ? '#1976D2' : '#7B1FA2' }]}>
                {item.type === 'lesson' ? 'درس' : 'محاضرة'}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: '#E8F5E8' }]}>
              <Text style={[styles.tagText, { color: '#2E7D32' }]}>{item.level}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'دروس ومحاضرات',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            isSuperAdmin ? (
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  onPress={() => {
                    router.push('/admin-content-manager?type=lessons');
                  }} 
                  style={[styles.headerButton, styles.addButton]}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    router.push('/admin-content-manager?type=lessons');
                  }} 
                  style={[styles.headerButton, styles.editButton]}
                >
                  <Edit3 size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : null
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <GraduationCap size={48} color={COLORS.primary} />
          <Text style={styles.headerTitle}>دروس ومحاضرات تعليمية</Text>
          <Text style={styles.headerSubtitle}>تعلم وطور مهاراتك في الطب البيطري</Text>
        </View>
        
        <View style={styles.lessonsList}>
          {mockLessonsLectures.map(renderLessonCard)}
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
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  lessonsList: {
    gap: 16,
  },
  lessonCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lessonTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  lessonMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonDescription: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
    marginBottom: 16,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: COLORS.success || '#28a745',
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
});