import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useRef } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { ArrowLeft, ArrowRight, Share, Heart, BookOpen, Clock } from 'lucide-react-native';
import { trpc } from '../lib/trpc';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function TipDetailsScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Scroll to top when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const { data, isLoading, error } = useQuery(trpc.content.getTipById.queryOptions({ id: Number(id) }));

  const likeMutation = useMutation({
    mutationFn: trpc.content.likeTip.mutate,
    onSuccess: () => {
      Alert.alert("Success", "You liked this tip!");
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to like this tip.");
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'جاري التحميل...', 
            headerStyle: { backgroundColor: COLORS.white },
            headerTitleStyle: { color: COLORS.black },
          }}
        />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !data?.tip) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'النصيحة غير موجودة',
            headerStyle: { backgroundColor: COLORS.white },
            headerTitleStyle: { color: COLORS.black },
          }}
        />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>النصيحة غير موجودة</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const tip = data.tip;

  const handleShare = () => {
    console.log('Share tip:', tip.title);
    // TODO: Implement share functionality
  };

  const handleLike = () => {
    likeMutation.mutate({ id: tip.id });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'النصيحة',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              {isRTL ? (
                <ArrowRight size={24} color={COLORS.black} />
              ) : (
                <ArrowLeft size={24} color={COLORS.black} />
              )}
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={handleLike}
                style={styles.headerButton}
              >
                <Heart size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleShare}
                style={styles.headerButton}
              >
                <Share size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image source={{ uri: tip.image }} style={styles.heroImage} />
        
        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {tip.category === 'grooming' ? 'العناية' : 
               tip.category === 'training' ? 'التدريب' : 
               tip.category === 'nutrition' ? 'التغذية' : tip.category}
            </Text>
          </View>
          
          {/* Title */}
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
            {tip.title}
          </Text>
          
          {/* Meta Info */}
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <BookOpen size={16} color={COLORS.darkGray} />
              <Text style={styles.metaText}>نصيحة مفيدة</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color={COLORS.darkGray} />
              <Text style={styles.metaText}>5 دقائق قراءة</Text>
            </View>
          </View>
          
          {/* Content */}
          <View style={styles.textContent}>
            <Text style={[styles.contentText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {tip.content}
            </Text>
            
            {/* Additional Tips Section */}
            <View style={styles.additionalTips}>
              <Text style={styles.sectionTitle}>نصائح إضافية:</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.tipItemText}>تأكد من اتباع هذه النصيحة بانتظام للحصول على أفضل النتائج</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.tipItemText}>استشر الطبيب البيطري إذا لاحظت أي تغييرات غير طبيعية</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.tipItemText}>احرص على توفير بيئة آمنة ومريحة لحيوانك الأليف</Text>
                </View>
              </View>
            </View>
            
            {/* Warning Section */}
            <View style={styles.warningSection}>
              <Text style={styles.warningTitle}>تنبيه مهم:</Text>
              <Text style={styles.warningText}>
                هذه النصائح للإرشاد العام فقط ولا تغني عن استشارة الطبيب البيطري المختص. في حالة وجود أي مشاكل صحية، يرجى مراجعة أقرب عيادة بيطرية.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    lineHeight: 32,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  textContent: {
    gap: 24,
  },
  contentText: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 26,
  },
  additionalTips: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  tipItemText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 22,
    textAlign: 'right',
  },
  warningSection: {
    backgroundColor: '#FEF3F2',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'right',
  },
  warningText: {
    fontSize: 14,
    color: '#7C2D12',
    lineHeight: 22,
    textAlign: 'right',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: COLORS.darkGray,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});