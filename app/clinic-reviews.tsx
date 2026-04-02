import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Star, Trash2, MessageSquare } from "lucide-react-native";
import RatingComponent from "../components/RatingComponent";
import { trpc } from "../lib/trpc";
import { useApp } from "@/providers/AppProvider";
import { useToastContext } from "@/providers/ToastProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function ClinicReviewsScreen() {
  const { id, name } = useLocalSearchParams();
  const { user, isSuperAdmin } = useApp();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();
  const clinicId = parseInt(id as string);
  const clinicName = name as string;

  const [showRatingModal, setShowRatingModal] = useState(false);

  const { data: reviewsData, isLoading } = useQuery(
    trpc.reviews.getClinicReviews.queryOptions({ clinicId }),
  );
  const reviews = (reviewsData as any)?.reviews ?? [];

  const addReviewMutation = useMutation(trpc.reviews.addClinicReview.mutationOptions());
  const deleteReviewMutation = useMutation(trpc.reviews.deleteReview.mutationOptions());

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : 0;

  const renderStars = (rating: number, size = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={size}
          color="#FFD700"
          fill={i <= Math.round(rating) ? "#FFD700" : "transparent"}
        />,
      );
    }
    return stars;
  };

  const handleDeleteReview = (reviewId: number) => {
    Alert.alert("حذف التقييم", "هل أنت متأكد من حذف هذا التقييم؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deleteReviewMutation.mutate(
            { reviewId },
            {
              onSuccess: () => {
                queryClient.invalidateQueries(trpc.reviews.getClinicReviews.queryKey as any);
                queryClient.invalidateQueries(trpc.clinics.getDetails.queryKey as any);
              },
              onError: () => {
                showToast({ type: "error", message: "حدث خطأ أثناء حذف التقييم" });
              },
            },
          );
        },
      },
    ]);
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    addReviewMutation.mutate(
      { clinicId, rating, comment } as any,
      {
        onSuccess: () => {
          queryClient.invalidateQueries(trpc.reviews.getClinicReviews.queryKey as any);
          queryClient.invalidateQueries(trpc.clinics.getDetails.queryKey as any);
          setShowRatingModal(false);
        },
        onError: (error) => {
          showToast({ type: "error", message: error.message });
        },
      },
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "التقييمات",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        {/* Rating Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.entityName}>{clinicName}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
            <View style={styles.starsRow}>{renderStars(averageRating, 22)}</View>
          </View>
          <Text style={styles.reviewCountText}>{reviews.length} تقييم</Text>
        </View>

        {/* Reviews List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {reviews.length === 0 ? (
              <View style={styles.emptyState}>
                <MessageSquare size={48} color={COLORS.lightGray} />
                <Text style={styles.emptyText}>لا توجد تقييمات بعد</Text>
                <Text style={styles.emptySubText}>كن أول من يقيم هذه العيادة</Text>
              </View>
            ) : (
              reviews.map((review: any) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{review.user?.name ?? "مستخدم"}</Text>
                      <View style={styles.starsRow}>{renderStars(review.rating)}</View>
                    </View>
                    {isSuperAdmin && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {review.comment ? (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  ) : null}
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString("ar")}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* Add Review Button */}
        {user && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowRatingModal(true)}>
            <MessageSquare size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>أضف تقييماً</Text>
          </TouchableOpacity>
        )}
      </View>

      <RatingComponent
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        title="تقييم العيادة"
        entityName={clinicName}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  backButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  entityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  averageRating: {
    fontSize: 40,
    fontWeight: "bold",
    color: COLORS.black,
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
  },
  reviewCountText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reviewerInfo: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: "right",
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
