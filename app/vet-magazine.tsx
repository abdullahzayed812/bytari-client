import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import React, { useMemo, useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { BookOpen, User, Heart, MessageCircle, Calendar, Eye, Plus, Edit3 } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

// Category mappings
const categoryMap: Record<string, string> = {
  general: "عام",
  surgery: "جراحة",
  pets: "حيوانات أليفة",
  infectious_diseases: "أمراض",
  farming: "تربية",
  nutrition: "تغذية",
};

const reverseCategoryMap: Record<string, string | null> = {
  الكل: null,
  أمراض: "infectious_diseases",
  جراحة: "surgery",
  تغذية: "nutrition",
  سلوك: null,
  طوارئ: null,
  عام: "general",
  "حيوانات أليفة": "pets",
  تربية: "farming",
};

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImage: string;
  publishedDate: string;
  downloadCount: number;
  rating: number;
  author: string;
  authorTitle: string;
  excerpt: string;
  likes: number;
  comments: number;
  views: number;
}

export default function VetMagazineScreen() {
  const { isSuperAdmin } = useApp();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  const { data: articlesData, isLoading: articlesLoading } = useQuery(
    trpc.content.listMagazineArticles.queryOptions({})
  );
  const articles = useMemo(() => {
    if (!articlesData?.articles) return [];
    return articlesData.articles.map((article: any) => ({
      ...article,
      // Mock fields not in seed data (adjust when schema is updated)
      author: "د. غير محدد",
      authorTitle: "طبيب بيطري",
      excerpt: article.description.slice(0, 100) + "...",
      likes: 0,
      comments: 0,
      views: article.downloadCount,
    }));
  }, [articlesData]);

  const categories = ["الكل", "عام", "أمراض", "جراحة", "تغذية", "حيوانات أليفة", "تربية", "سلوك", "طوارئ"];

  const filteredArticles = useMemo(() => {
    const dbCategory = reverseCategoryMap[selectedCategory];
    if (!dbCategory) {
      // For "الكل", return all articles; for unmapped categories (سلوك, طوارئ), return empty array
      return selectedCategory === "الكل" ? articles : [];
    }
    return articles.filter((article) => article.category === dbCategory);
  }, [articles, selectedCategory]);

  const handleArticlePress = (articleId: string) => {
    router.push(`/article-details?id=${articleId}`);
  };

  if (articlesLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "المجلة البيطرية",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: () =>
            isSuperAdmin ? (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/admin-content-manager?type=articles");
                  }}
                  style={[styles.headerButton, styles.addButton]}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/admin-content-manager?type=articles");
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

        {/* Articles List */}
        <View style={styles.articlesSection}>
          {filteredArticles.slice(0, 2).map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              onPress={() => handleArticlePress(article.id)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: article.coverImage }} style={styles.articleImage} />

              <View style={styles.articleContent}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{categoryMap[article.category] || article.category}</Text>
                </View>

                <Text style={styles.articleTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={styles.articleExcerpt} numberOfLines={3}>
                  {article.excerpt}
                </Text>

                <View style={styles.authorSection}>
                  <View style={styles.authorInfo}>
                    <User size={14} color={COLORS.primary} />
                    <View style={styles.authorDetails}>
                      <Text style={styles.authorName} numberOfLines={1}>
                        {article.author}
                      </Text>
                      <Text style={styles.authorTitle} numberOfLines={1}>
                        {article.authorTitle}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.dateText}>{new Date(article.publishedDate).toLocaleDateString("ar-EG")}</Text>
                </View>

                <View style={styles.articleStats}>
                  <View style={styles.statItem}>
                    <Heart size={14} color={COLORS.error} />
                    <Text style={styles.statText}>{article.likes}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <MessageCircle size={14} color={COLORS.primary} />
                    <Text style={styles.statText}>{article.comments}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Eye size={14} color={COLORS.darkGray} />
                    <Text style={styles.statText}>{article.views}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {filteredArticles.length === 0 && <Text style={styles.noArticlesText}>لا توجد مقالات في هذه الفئة</Text>}
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
  articlesSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  articleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    flex: 1,
  },
  articleImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  articleContent: {
    padding: 10,
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
  articleTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    lineHeight: 18,
    marginBottom: 4,
    textAlign: "right",
    minHeight: 36,
  },
  articleExcerpt: {
    fontSize: 12,
    color: COLORS.darkGray,
    lineHeight: 16,
    marginBottom: 8,
    textAlign: "right",
    minHeight: 32,
  },
  authorSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  authorDetails: {
    gap: 1,
    flex: 1,
  },
  authorName: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.black,
  },
  authorTitle: {
    fontSize: 10,
    color: COLORS.darkGray,
  },
  dateText: {
    fontSize: 10,
    color: COLORS.darkGray,
  },
  articleStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: COLORS.darkGray,
    fontWeight: "500",
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
  noArticlesText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginVertical: 20,
  },
});
