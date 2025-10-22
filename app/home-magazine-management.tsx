import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import { ArrowLeft, Plus, Edit3, Eye, EyeOff, Trash2, User, Heart, MessageCircle, Download } from "lucide-react-native";
import Button from "../components/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

type Article = {
  id: string;
  title: string;
  author: string;
  authorTitle: string;
  image: string;
  likes: number;
  comments: number;
  isSelectedForHome: boolean;
};

export default function HomeMagazineManagementScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: articlesData, isLoading: articlesLoading } = useQuery(
    trpc.content.listMagazineArticles.queryOptions({})
  );
  const articles = useMemo(() => (articlesData as any)?.articles, [articlesData]);

  const toggleVisibilityMutation = useMutation({
    mutationFn: trpc.content.toggleArticleHomeVisibility.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.content.listMagazineArticles.queryKey);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: trpc.content.deleteArticle.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.content.listMagazineArticles.queryKey);
    },
  });

  const { data: availableArticlesData } = useQuery(trpc.content.getAvailableArticles.queryOptions());

  const handleToggleHomeVisibility = (articleId: string) => {
    toggleVisibilityMutation.mutate({ id: Number(articleId) });
  };

  const handleDeleteArticle = (articleId: string) => {
    Alert.alert("حذف المقال", "هل أنت متأكد من حذف هذا المقال من الصفحة الرئيسية؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate({ id: Number(articleId) });
        },
      },
    ]);
  };

  const handleEditArticle = (articleId: string) => {
    router.push({ pathname: "/edit-article", params: { id: articleId } });
  };

  const handleAddArticle = () => {
    router.push("/add-article");
  };

  const handleImportArticles = () => {
    const availableArticles = (availableArticlesData as any)?.articles || [];

    if (availableArticles.length === 0) {
      Alert.alert("لا توجد مقالات", "جميع المقالات المتاحة موجودة بالفعل في الصفحة الرئيسية");
      return;
    }

    Alert.alert(
      "استيراد المقالات",
      `تم العثور على ${availableArticles.length} مقال متاح للاستيراد. هل تريد استيرادها جميعاً؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "استيراد الكل",
          onPress: () => {
            // In a real app, you would have a mutation to import articles
            Alert.alert("تم الاستيراد", `تم استيراد ${availableArticles.length} مقال بنجاح`);
          },
        },
      ]
    );
  };

  const visibleArticles = articles.filter((article) => article.isSelectedForHome);
  const hiddenArticles = articles.filter((article) => !article.isSelectedForHome);

  const renderArticleCard = (article: Article, isVisible: boolean) => (
    <View key={article.id} style={styles.articleCard}>
      <View style={styles.articleCardContent}>
        <Image source={{ uri: article.image }} style={styles.articleImage} />

        <View style={styles.articleDetails}>
          <Text style={styles.articleTitle} numberOfLines={2}>
            {article.title}
          </Text>

          <View style={styles.authorContainer}>
            <User size={14} color={COLORS.darkGray} />
            <Text style={styles.authorText}>{article.author}</Text>
          </View>

          <Text style={styles.authorTitle} numberOfLines={1}>
            {article.authorTitle}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Heart size={14} color="#EF4444" />
              <Text style={styles.statText}>{article.likes}</Text>
            </View>
            <View style={styles.statItem}>
              <MessageCircle size={14} color={COLORS.darkGray} />
              <Text style={styles.statText}>{article.comments}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.articleActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.visibilityButton]}
          onPress={() => handleToggleHomeVisibility(article.id)}
        >
          {isVisible ? <EyeOff size={16} color={COLORS.white} /> : <Eye size={16} color={COLORS.white} />}
          <Text style={styles.actionButtonText}>{isVisible ? "إخفاء" : "إظهار"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditArticle(article.id)}
        >
          <Edit3 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>تعديل</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteArticle(article.id)}
        >
          <Trash2 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>حذف</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة المجلة - الصفحة الرئيسية",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>إدارة المجلة البيطرية</Text>
          <Text style={styles.headerSubtitle}>تحكم في المقالات التي تظهر في الصفحة الرئيسية</Text>
        </View>

        {/* Add Article Button */}
        <View style={styles.addSection}>
          <View style={styles.buttonRow}>
            <Button
              title="إضافة مقال جديد"
              onPress={handleAddArticle}
              type="primary"
              size="medium"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.halfButton}
            />
            <Button
              title="استيراد من الأقسام"
              onPress={handleImportArticles}
              type="secondary"
              size="medium"
              icon={<Download size={16} color={COLORS.primary} />}
              style={styles.halfButton}
            />
          </View>
        </View>

        {/* Visible Articles Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المقالات المعروضة في الصفحة الرئيسية ({visibleArticles.length})</Text>
          {visibleArticles.length > 0 ? (
            visibleArticles.map((article) => renderArticleCard(article, true))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد مقالات معروضة في الصفحة الرئيسية</Text>
            </View>
          )}
        </View>

        {/* Hidden Articles Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المقالات المخفية ({hiddenArticles.length})</Text>
          {hiddenArticles.length > 0 ? (
            hiddenArticles.map((article) => renderArticleCard(article, false))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد مقالات مخفية</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  addSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  addButton: {
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row-reverse",
    gap: 10,
  },
  halfButton: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 15,
  },
  articleCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleCardContent: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  articleImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  articleDetails: {
    flex: 1,
    marginRight: 16,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 8,
    lineHeight: 22,
  },
  authorContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  authorText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  authorTitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 16,
  },
  statItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  articleActions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  visibilityButton: {
    backgroundColor: COLORS.info,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
});
