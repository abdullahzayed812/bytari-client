import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useRef } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { ArrowLeft, ArrowRight, Download, Star, User, BookOpen, FileText, Globe } from 'lucide-react-native';
import { trpc } from '../lib/trpc';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function BookDetailsScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Scroll to top when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const { data, isLoading, error } = useQuery(trpc.content.getBookById.queryOptions({ id: Number(id) }));

  const downloadMutation = useMutation({
    mutationFn: trpc.content.downloadBook.mutate,
    onSuccess: () => {
      Alert.alert("Success", "Book downloaded successfully!");
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to download the book.");
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'جاري التحميل...',
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
          }}
        />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !data?.book) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'الكتاب غير موجود',
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
          }}
        />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>الكتاب غير موجود</Text>
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

  const book = data.book;

  const handleDownload = () => {
    downloadMutation.mutate({ id: book.id });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} size={16} color="#FFD700" fill="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" size={16} color="#FFD700" fill="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={16} color="#E5E7EB" />
      );
    }

    return stars;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'تفاصيل الكتاب',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              {isRTL ? (
                <ArrowRight size={24} color={COLORS.white} />
              ) : (
                <ArrowLeft size={24} color={COLORS.white} />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Book Header */}
        <View style={styles.bookHeader}>
          <Image source={{ uri: book.coverImage }} style={styles.bookCover} />
          
          <View style={styles.bookInfo}>
            {/* Category Badge */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{book.category}</Text>
            </View>
            
            <Text style={styles.bookTitle}>{book.title}</Text>
            
            {/* Author */}
            <View style={styles.authorSection}>
              <User size={16} color={COLORS.primary} />
              <Text style={styles.authorName}>{book.author}</Text>
            </View>
            
            {/* Rating */}
            <View style={styles.ratingSection}>
              <View style={styles.starsContainer}>
                {renderStars(book.rating)}
              </View>
              <Text style={styles.ratingText}>{book.rating}</Text>
              <Text style={styles.downloadsText}>({book.downloads.toLocaleString()} تحميل)</Text>
            </View>
          </View>
        </View>

        {/* Book Details */}
        <View style={styles.detailsContainer}>
          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <BookOpen size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>الصفحات</Text>
                <Text style={styles.infoValue}>{book.pages}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <FileText size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>الحجم</Text>
                <Text style={styles.infoValue}>{book.fileSize}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Globe size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>اللغة</Text>
                <Text style={styles.infoValue}>{book.language}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>وصف الكتاب</Text>
            <Text style={styles.descriptionText}>{book.description}</Text>
          </View>

          {/* Book Details */}
          <View style={styles.bookDetailsSection}>
            <Text style={styles.sectionTitle}>تفاصيل الكتاب</Text>
            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>سنة النشر:</Text>
                <Text style={styles.detailValue}>{book.publishedYear}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>رقم ISBN:</Text>
                <Text style={styles.detailValue}>{book.isbn}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>التصنيف:</Text>
                <Text style={styles.detailValue}>{book.category}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>عدد التحميلات:</Text>
                <Text style={styles.detailValue}>{book.downloads.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Download Button */}
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownload}
            activeOpacity={0.8}
          >
            <Download size={24} color={COLORS.white} />
            <Text style={styles.downloadButtonText}>تحميل الكتاب</Text>
          </TouchableOpacity>
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
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  bookHeader: {
    backgroundColor: COLORS.white,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
  },
  bookCover: {
    width: 120,
    height: 160,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  bookInfo: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    lineHeight: 24,
    marginBottom: 8,
    textAlign: 'right',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  authorName: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '600',
  },
  downloadsText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  detailsContainer: {
    padding: 20,
    gap: 24,
  },
  quickInfo: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
    gap: 8,
  },
  infoContent: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '600',
  },
  descriptionSection: {
    backgroundColor: COLORS.white,
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
  descriptionText: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 22,
    textAlign: 'right',
  },
  bookDetailsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  detailsList: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  downloadButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
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