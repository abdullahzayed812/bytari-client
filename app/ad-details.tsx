import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { ArrowRight, ArrowLeft, ExternalLink, Calendar, MapPin, Eye, CheckCircle, Circle } from "lucide-react-native";
import Button from "../components/Button";

export default function AdDetailsScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string; position: string }>();
  const adId = parseInt(id || "1");

  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [deviceId] = useState(() => Math.random().toString(36).substring(7));
  const [currentUserId] = useState<number | undefined>(1); // Replace with actual user ID from auth

  // Fetch advertisement details
  const {
    data: rawAd,
    isLoading: adLoading,
    isError: adError,
  } = useQuery(trpc.admin.ads.getById.queryOptions({ id: adId }));

  const ad: any = useMemo(() => rawAd, [rawAd]);

  // Fetch poll data
  const { data: rawPollData, isLoading: pollLoading } = useQuery({
    ...trpc.polls.getByAdId.queryOptions({ adId }),
    enabled: !!ad,
  });

  const pollData: any = useMemo(() => rawPollData, [rawPollData]);

  // Check if user has voted
  const { data: rawVoteStatus } = useQuery({
    ...trpc.polls.hasVoted.queryOptions({
      pollId: pollData?.id || 0,
      userId: currentUserId,
      deviceId,
    }),
    enabled: !!pollData?.id,
  });

  const voteStatus: any = useMemo(() => rawVoteStatus, [rawVoteStatus]);

  // Get poll results
  const { data: rawPollResults, refetch: refetchResults } = useQuery({
    ...trpc.polls.getResults.queryOptions({ pollId: pollData?.id || 0 }),
    enabled: !!pollData?.id && (voteStatus?.hasVoted || pollData?.showResults),
  });

  const pollResults: any = useMemo(() => rawPollResults, [rawPollResults]);

  // Track impression on mount
  const trackImpressionMutation = useMutation({
    mutationFn: trpc.admin.ads.trackImpression.mutate,
  });

  // Track click mutation
  const trackClickMutation = useMutation({
    mutationFn: trpc.admin.ads.trackClick.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin.ads.getById", { id: adId }] });
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: trpc.polls.vote.mutate,
    onSuccess: () => {
      Alert.alert("نجاح", "تم تسجيل تصويتك بنجاح");
      queryClient.invalidateQueries({ queryKey: ["polls.hasVoted"] });
      queryClient.invalidateQueries({ queryKey: ["polls.getResults"] });
      setSelectedOptions([]);
    },
    onError: (error: any) => {
      Alert.alert("خطأ", error.message || "فشل في تسجيل التصويت");
    },
  });

  React.useEffect(() => {
    if (adId) {
      trackImpressionMutation.mutate({ adId });
    }
  }, [adId]);

  const handleOpenLink = async () => {
    if (!ad?.link) return;

    try {
      await trackClickMutation.mutateAsync({ adId });
      await Linking.openURL(ad.link);
    } catch (error) {
      console.error("Failed to open link:", error);
      Alert.alert("خطأ", "فشل في فتح الرابط");
    }
  };

  const handleOptionSelect = (optionId: number) => {
    if (voteStatus?.hasVoted) return;

    if (pollData?.isMultipleChoice) {
      setSelectedOptions((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmitVote = () => {
    if (selectedOptions.length === 0) {
      Alert.alert("تنبيه", "يرجى اختيار خيار واحد على الأقل");
      return;
    }

    if (!pollData?.id) return;

    voteMutation.mutate({
      pollId: pollData.id,
      optionIds: selectedOptions,
      userId: currentUserId,
      deviceId,
    });
  };

  if (adLoading || pollLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "تفاصيل الإعلان" }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  if (adError || !ad) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "تفاصيل الإعلان" }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>لم يتم العثور على الإعلان</Text>
          <Button title="العودة" onPress={() => router.back()} type="outline" size="medium" style={styles.backButton} />
        </View>
      </View>
    );
  }

  const hasVoted = voteStatus?.hasVoted || false;
  const showResults = pollResults && (hasVoted || pollData?.showResults);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "تفاصيل الإعلان",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              {isRTL ? <ArrowRight size={24} color={COLORS.black} /> : <ArrowLeft size={24} color={COLORS.black} />}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Ad Image */}
        {ad.image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: ad.image }} style={styles.adImage} resizeMode="cover" />
          </View>
        )}

        {/* Ad Content */}
        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={[styles.title, { textAlign: isRTL ? "right" : "left" }]}>{ad.title}</Text>

          {/* Meta Information */}
          <View style={styles.metaContainer}>
            <View style={[styles.metaRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Calendar size={16} color={COLORS.darkGray} />
              <Text style={[styles.metaText, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
                {new Date(ad.createdAt).toLocaleDateString("ar-SA")}
              </Text>
            </View>

            {ad.position && (
              <View style={[styles.metaRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <MapPin size={16} color={COLORS.darkGray} />
                <Text style={[styles.metaText, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
                  {ad.position === "home"
                    ? "الصفحة الرئيسية"
                    : ad.position === "vet_home"
                    ? "الصفحة الرئيسية للأطباء"
                    : ad.position}
                </Text>
              </View>
            )}

            <View style={[styles.metaRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Eye size={16} color={COLORS.darkGray} />
              <Text style={[styles.metaText, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
                {ad.impressions || 0} مشاهدة • {ad.clicks || 0} نقرة
              </Text>
            </View>
          </View>

          {/* Content */}
          {ad.content && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>الوصف</Text>
              <Text style={[styles.description, { textAlign: isRTL ? "right" : "left" }]}>{ad.content}</Text>
            </View>
          )}

          {/* Poll Section */}
          {pollData && (
            <View style={styles.pollContainer}>
              <Text style={styles.sectionTitle}>{pollData.question}</Text>

              {pollData.description && (
                <Text style={[styles.pollDescription, { textAlign: isRTL ? "right" : "left" }]}>
                  {pollData.description}
                </Text>
              )}

              {!hasVoted && pollData.isActive ? (
                // Voting Interface
                <View style={styles.pollOptions}>
                  {pollData.options.map((option: any) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.pollOption, selectedOptions.includes(option.id) && styles.pollOptionSelected]}
                      onPress={() => handleOptionSelect(option.id)}
                    >
                      {selectedOptions.includes(option.id) ? (
                        <CheckCircle size={20} color={COLORS.primary} />
                      ) : (
                        <Circle size={20} color={COLORS.darkGray} />
                      )}
                      <Text
                        style={[
                          styles.pollOptionText,
                          selectedOptions.includes(option.id) && styles.pollOptionTextSelected,
                        ]}
                      >
                        {option.optionText}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {pollData.isMultipleChoice && (
                    <Text style={styles.multipleChoiceNote}>يمكنك اختيار أكثر من خيار</Text>
                  )}

                  <Button
                    title="تصويت"
                    onPress={handleSubmitVote}
                    type="primary"
                    size="large"
                    disabled={selectedOptions.length === 0 || voteMutation.isPending}
                    style={styles.voteButton}
                  />
                </View>
              ) : showResults ? (
                // Results Display
                <View style={styles.pollResults}>
                  <Text style={styles.resultsTitle}>النتائج</Text>
                  {pollResults?.options.map((option: any) => (
                    <View key={option.id} style={styles.resultItem}>
                      <View style={styles.resultHeader}>
                        <Text style={styles.resultOptionText}>{option.optionText}</Text>
                        <Text style={styles.resultPercentage}>{option.percentage.toFixed(1)}%</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${option.percentage}%` }]} />
                      </View>
                      <Text style={styles.resultVotes}>
                        {option.voteCount} {option.voteCount === 1 ? "صوت" : "أصوات"}
                      </Text>
                    </View>
                  ))}
                  <Text style={styles.totalVotes}>إجمالي الأصوات: {pollResults?.totalVotes || 0}</Text>
                  {hasVoted && <Text style={styles.votedNote}>✓ لقد قمت بالتصويت بالفعل</Text>}
                </View>
              ) : (
                <Text style={styles.pollClosedText}>
                  {!pollData.isActive ? "انتهى التصويت" : "النتائج غير متاحة حاليًا"}
                </Text>
              )}

              {pollData.endDate && (
                <Text style={styles.pollEndDate}>
                  ينتهي التصويت: {new Date(pollData.endDate).toLocaleDateString("ar-SA")}
                </Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {ad.link && (
              <Button
                title="فتح الرابط"
                onPress={handleOpenLink}
                type="primary"
                size="large"
                style={styles.actionButton}
                icon={<ExternalLink size={20} color={COLORS.white} />}
                disabled={trackClickMutation.isPending}
              />
            )}

            <Button
              title="العودة"
              onPress={() => router.back()}
              type="outline"
              size="large"
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 120,
  },
  imageContainer: {
    height: 250,
    backgroundColor: COLORS.lightGray,
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    minHeight: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    lineHeight: 32,
  },
  metaContainer: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  metaRow: {
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "right",
  },
  description: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 24,
  },
  pollContainer: {
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  pollDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
    lineHeight: 20,
  },
  pollOptions: {
    gap: 12,
  },
  pollOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    gap: 12,
  },
  pollOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFF5F5",
  },
  pollOptionText: {
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
    textAlign: "right",
  },
  pollOptionTextSelected: {
    fontWeight: "600",
    color: COLORS.primary,
  },
  multipleChoiceNote: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
    fontStyle: "italic",
  },
  voteButton: {
    marginTop: 8,
  },
  pollResults: {
    gap: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  resultItem: {
    gap: 8,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultOptionText: {
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
    textAlign: "right",
  },
  resultPercentage: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  resultVotes: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  totalVotes: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  votedNote: {
    fontSize: 14,
    color: COLORS.success,
    textAlign: "center",
    fontWeight: "600",
  },
  pollClosedText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    padding: 16,
    fontStyle: "italic",
  },
  pollEndDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 8,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    width: "100%",
  },
});
