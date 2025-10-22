import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import React, { useRef } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams, Stack, useFocusEffect } from "expo-router";
import { ArrowLeft, ArrowRight, Heart, MessageCircle, Eye, User, Calendar, Share } from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function ArticleDetailsScreen() {
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

  const { data, isLoading, error } = useQuery(trpc.content.getArticleById.queryOptions({ id: Number(id) }));

  const likeMutation = useMutation({
    mutationFn: trpc.content.likeArticle.mutate,
    onSuccess: () => {
      Alert.alert("Success", "You liked this article!");
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to like this article.");
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "جاري التحميل...",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
          }}
        />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !data?.article) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "المقال غير موجود",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
          }}
        />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>المقال غير موجود</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const article = data.article;

  const handleLike = () => {
    likeMutation.mutate({ id: article.id });
  };

  const handleShare = () => {
    console.log("Share article:", article.title);
    // TODO: Implement share functionality
  };

  const handleComment = () => {
    console.log("Comment on article:", article.title);
    // TODO: Implement comment functionality
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "المقال",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              {isRTL ? <ArrowRight size={24} color={COLORS.white} /> : <ArrowLeft size={24} color={COLORS.white} />}
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Share size={24} color={COLORS.white} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero Image */}
        <Image source={{ uri: article.coverImage }} style={styles.heroImage} />

        {/* Article Content */}
        <View style={styles.articleContainer}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category || "غير مصنف"}</Text>
          </View>

          {/* Title & Description */}
          <Text style={styles.articleTitle}>{article.title}</Text>
          <Text style={styles.articleDescription}>{article.description}</Text>

          {/* Author Info */}
          <View style={styles.authorSection}>
            <View style={styles.authorInfo}>
              <User size={20} color={COLORS.primary} />
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{article.author}</Text>
                <Text style={styles.authorTitle}>{article.authorTitle || "مؤلف"}</Text>
              </View>
            </View>

            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Calendar size={16} color={COLORS.darkGray} />
                <Text style={styles.metaText}>
                  {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : "تاريخ غير متوفر"}
                </Text>
              </View>
              <Text style={styles.readTime}>{article.readTime || "غير محدد"}</Text>
            </View>
          </View>

          {/* Article Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Heart size={18} color={COLORS.error} />
              <Text style={styles.statText}>{article.likes ?? 0}</Text>
            </View>
            <View style={styles.statItem}>
              <MessageCircle size={18} color={COLORS.primary} />
              <Text style={styles.statText}>{article.comments ?? 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Eye size={18} color={COLORS.darkGray} />
              <Text style={styles.statText}>{article.views ?? 0}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentSection}>
            <Text style={styles.contentText}>{article.content || "لا يوجد محتوى لعرضه."}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={handleLike}>
              <Heart size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>إعجاب ({article.likes ?? 0})</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.commentButton]} onPress={handleComment}>
              <MessageCircle size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>تعليق ({article.comments ?? 0})</Text>
            </TouchableOpacity>
          </View>
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
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  heroImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  articleContainer: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    lineHeight: 32,
    marginBottom: 20,
    textAlign: "right",
  },
  articleDescription: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    lineHeight: 32,
    marginBottom: 20,
    textAlign: "right",
  },
  authorSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  authorDetails: {
    gap: 2,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  authorTitle: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  metaInfo: {
    alignItems: "flex-end",
    gap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  readTime: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "600",
  },
  contentSection: {
    marginBottom: 32,
  },
  contentText: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 26,
    textAlign: "right",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  likeButton: {
    backgroundColor: COLORS.error,
  },
  commentButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: COLORS.darkGray,
    marginBottom: 20,
    textAlign: "center",
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
    fontWeight: "bold",
  },
});
