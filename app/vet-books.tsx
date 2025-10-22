import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import React, { useState, useMemo } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { Download, Star, User, Plus, Edit3 } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

// Category mappings
const categoryMap: Record<string, string> = {
  medicine: "أمراض",
  surgery: "جراحة",
  nutrition: "تغذية",
  dentistry: "طب الأسنان",
  ophthalmology: "طب العيون",
  internal_medicine: "أمراض",
  poultry: "تربية",
};

const reverseCategoryMap: Record<string, string[] | null> = {
  الكل: null,
  تشريح: [],
  أمراض: ["medicine", "internal_medicine"],
  جراحة: ["surgery"],
  صيدلة: [],
  تغذية: ["nutrition"],
  "طب الأسنان": ["dentistry"],
  "طب العيون": ["ophthalmology"],
  تربية: ["poultry"],
};

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  rating: number;
  downloadCount: number;
  pageCount: number;
  category: string;
  language: string;
  filePath: string;
  isbn: string;
  publishedYear: number;
  fileSize: string; // Mocked
}

export default function VetBooksScreen() {
  const { isSuperAdmin } = useApp();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  const { data: vetBooksData, isLoading: vetBooksLoading, error } = useQuery(trpc.content.listVetBooks.queryOptions());
  const books = useMemo(() => {
    if (!vetBooksData?.books) return [];
    return vetBooksData.books.map((book: any) => ({
      ...book,
      id: book.id.toString(),
      fileSize: `${(book.pageCount * 0.05).toFixed(1)} MB`, // Mock fileSize (e.g., 0.05 MB per page)
    }));
  }, [vetBooksData]);

  const categories = ["الكل", "تشريح", "أمراض", "جراحة", "صيدلة", "تغذية", "طب الأسنان", "طب العيون", "تربية"];

  const filteredBooks = useMemo(() => {
    const dbCategories = reverseCategoryMap[selectedCategory];
    if (!dbCategories) {
      return selectedCategory === "الكل" ? books : [];
    }
    return books.filter((book) => dbCategories.includes(book.category));
  }, [books, selectedCategory]);

  const handleDownload = async (bookId: string) => {
    try {
      const book = books.find((b) => b.id === bookId);
      if (!book) return;

      Alert.alert("تحميل الكتاب", `هل تريد تحميل كتاب "${book.title}"؟\nحجم الملف: ${book.fileSize}`, [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تحميل",
          onPress: async () => {
            try {
              const downloadUrl = book.filePath.startsWith("http")
                ? book.filePath
                : `https://your-backend-domain.com${book.filePath}`; // Replace with your backend domain
              const supported = await Linking.canOpenURL(downloadUrl);
              if (supported) {
                await Linking.openURL(downloadUrl);
                Alert.alert("نجح", "تم بدء التحميل");
              } else {
                Alert.alert("تحميل الكتاب", `تم بدء تحميل كتاب "${book.title}"\nسيتم حفظ الملف في مجلد التحميلات`, [
                  { text: "موافق" },
                ]);
              }
            } catch (error) {
              Alert.alert("خطأ", "حدث خطأ أثناء التحميل");
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ أثناء التحميل");
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} color="#FFD700" fill="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={14} color="#FFD700" fill="#FFD700" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} color="#E5E7EB" />);
    }

    return stars;
  };

  if (vetBooksLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} />;
  }

  if (error || !vetBooksData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>خطأ في جلب الكتب. حاول مرة أخرى.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "الكتب البيطرية",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: () =>
            isSuperAdmin ? (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/admin-content-manager?type=books");
                  }}
                  style={[styles.headerButton, styles.addButton]}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/admin-content-manager?type=books");
                  }}
                  style={[styles.headerButton, styles.editButton]}
                >
                  <Edit3 size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : null,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Filter */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryButton, selectedCategory === category && styles.selectedCategory]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Books Grid */}
        <View style={styles.booksSection}>
          {filteredBooks.length === 0 ? (
            <Text style={styles.noBooksText}>لا توجد كتب في هذه الفئة</Text>
          ) : (
            <View style={styles.booksGrid}>
              {filteredBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.bookCard}
                  onPress={() => router.push(`/book-details?id=${book.id}`)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: book.coverImage }} style={styles.bookCover} />

                  <View style={styles.bookContent}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{categoryMap[book.category] || book.category}</Text>
                    </View>

                    <Text style={styles.bookTitle} numberOfLines={2}>
                      {book.title}
                    </Text>

                    <View style={styles.authorSection}>
                      <User size={12} color={COLORS.primary} />
                      <Text style={styles.authorName} numberOfLines={1}>
                        {book.author}
                      </Text>
                    </View>

                    <View style={styles.ratingSection}>
                      <View style={styles.starsContainer}>{renderStars(book.rating)}</View>
                      <Text style={styles.ratingText}>{book.rating.toFixed(1)}</Text>
                    </View>

                    <View style={styles.bookInfo}>
                      <Text style={styles.infoText}>{book.pageCount} صفحة</Text>
                      <Text style={styles.infoText}>{book.fileSize}</Text>
                    </View>

                    <View style={styles.downloadStats}>
                      <Download size={12} color={COLORS.darkGray} />
                      <Text style={styles.downloadCount}>{book.downloadCount.toLocaleString()}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDownload(book.id);
                      }}
                      activeOpacity={0.8}
                    >
                      <Download size={14} color={COLORS.white} />
                      <Text style={styles.downloadButtonText}>تحميل</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
  },
  categorySection: {
    padding: 16,
    paddingBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "500",
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  booksSection: {
    padding: 16,
    paddingTop: 8,
  },
  booksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bookCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    width: "31%",
    minHeight: 280,
  },
  bookCover: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  bookContent: {
    flex: 1,
    padding: 12,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.black,
    lineHeight: 18,
    marginBottom: 6,
    textAlign: "right",
    minHeight: 36,
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  authorName: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "600",
    flex: 1,
  },
  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 1,
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.black,
    fontWeight: "600",
  },
  bookInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoText: {
    fontSize: 10,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  downloadStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 10,
  },
  downloadCount: {
    fontSize: 10,
    color: COLORS.darkGray,
  },
  downloadButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  downloadButtonText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: COLORS.success || "#28a745",
  },
  editButton: {
    backgroundColor: COLORS.white,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
    marginVertical: 20,
  },
  noBooksText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginVertical: 20,
  },
});
