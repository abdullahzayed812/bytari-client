import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import React, { useRef, useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams, Stack, useFocusEffect } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  MessageCircle,
  Eye,
  User,
  Calendar,
  Share,
  Send,
  X,
  Download,
} from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBookDownload } from "@/hooks/useBookDownload";

export default function ArticleDetailsScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();
  const articleId = Number(id);
  const scrollViewRef = useRef<ScrollView>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Scroll to top when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const { data, isLoading, error } = useQuery(trpc.content.getArticleById.queryOptions({ id: articleId }));
  const statsQuery = useQuery(trpc.content.getArticleStats.queryOptions({ articleId }));
  const commentsQuery = useQuery(trpc.content.getComments.queryOptions({ articleId }));

  const likeMutation = useMutation(trpc.content.toggleLike.mutationOptions());
  const addCommentMutation = useMutation(trpc.content.addComment.mutationOptions());

  const { downloadBook, isDownloading } = useBookDownload();

  const article: any = data?.article;
  const stats: any = statsQuery?.data;
  const comments: any = commentsQuery?.data?.comments || [];

  const handleLike = () => {
    likeMutation.mutate(
      { articleId },
      {
        onSuccess: () => {
          statsQuery.refetch();
          queryClient.invalidateQueries(trpc.content.listMagazineArticles.queryKey as any);
        },
      }
    );
  };

  const handleDownload = () => {
    downloadBook({
      id: article.id,
      title: article.title,
      filePath: article.filePath,
    });
  };

  const sendComment = () => {
    if (!commentText.trim()) return;
    addCommentMutation.mutate(
      { articleId, content: commentText },
      {
        onSuccess: () => {
          setCommentModalVisible(false);
          setCommentText("");
          commentsQuery.refetch();
          statsQuery.refetch();
          queryClient.invalidateQueries(trpc.content.listMagazineArticles.queryKey as any);
          Alert.alert("نجح", "تم إضافة التعليق بنجاح");
        },
        onError: () => {
          Alert.alert("خطأ", "فشل إضافة التعليق");
        },
      }
    );
  };

  const handleShare = () => {
    console.log("Share article:", article.title);
    // TODO: Implement share functionality
  };

  const handleComment = () => {
    setCommentModalVisible(true);
  };

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
              <Heart
                size={18}
                color={stats?.isLiked ? COLORS.error : COLORS.darkGray}
                fill={stats?.isLiked ? COLORS.error : "none"}
              />
              <Text style={styles.statText}>{stats?.likes ?? 0}</Text>
            </View>
            <View style={styles.statItem}>
              <MessageCircle size={18} color={COLORS.primary} />
              <Text style={styles.statText}>{stats?.comments ?? 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Eye size={18} color={COLORS.darkGray} />
              <Text style={styles.statText}>{article.watchCount ?? 0}</Text>
            </View>
            <TouchableOpacity style={styles.statItem} onPress={handleDownload}>
              <Download size={18} color={COLORS.darkGray} />
              <Text style={styles.statText}>{article.downloadCount ?? 0}</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentSection}>
            <Text style={styles.contentText}>{article.content || "لا يوجد محتوى لعرضه."}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={handleLike}>
              <Heart size={20} color={COLORS.white} fill={stats?.isLiked ? COLORS.white : "none"} />
              <Text style={styles.actionButtonText}>
                {stats?.isLiked ? "أعجبني" : "إعجاب"} ({stats?.likes ?? 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.commentButton]} onPress={handleComment}>
              <MessageCircle size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>تعليق ({stats?.comments ?? 0})</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.downloadButton]} onPress={handleDownload}>
              <Download size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>تحميل ({article.downloadCount ?? 0})</Text>
            </TouchableOpacity>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>التعليقات</Text>
            {comments.length > 0 ? (
              comments.map((comment: any) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUser}>{comment.user?.name || "مستخدم"}</Text>
                    <Text style={styles.commentDate}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noCommentsText}>لا توجد تعليقات بعد. كن أول من يعلق!</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إضافة تعليق</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <X size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="اكتب تعليقك هنا..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
              onPress={sendComment}
              disabled={!commentText.trim() || addCommentMutation.isPending}
            >
              <Send size={20} color={COLORS.white} />
              <Text style={styles.sendButtonText}>{addCommentMutation.isPending ? "جاري الإرسال..." : "إرسال"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    textAlign: "left",
  },
  articleDescription: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    lineHeight: 32,
    marginBottom: 20,
    textAlign: "left",
  },
  authorSection: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  authorInfo: {
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  statItem: {
    flexDirection: "row-reverse",
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
    textAlign: "left",
  },
  actionButtons: {
    flexDirection: "row-reverse",
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row-reverse",
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
  downloadButton: {
    backgroundColor: COLORS.success,
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
  commentsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "left",
  },
  commentItem: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  commentUser: {
    fontWeight: "bold",
    color: COLORS.black,
  },
  commentDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  commentContent: {
    color: COLORS.darkGray,
    textAlign: "left",
  },
  noCommentsText: {
    textAlign: "center",
    color: COLORS.gray,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    height: 120,
    textAlign: "left",
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  sendButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});
