import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, Linking, Alert, ActivityIndicator, Platform, Share } from "react-native";
import React from "react";
import { COLORS } from "../constants/colors";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, MapPin, Phone, Clock, Star, Navigation, MessageSquare, Earth, Facebook, Instagram, Bell, BellOff, Share2 } from "lucide-react-native";
import Button from "../components/Button";
import { trpc } from "../lib/trpc";
import { useApp } from "@/providers/AppProvider";
import { useToastContext } from "@/providers/ToastProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const { width } = Dimensions.get("window");

export default function ClinicProfileScreen() {
  const { user, isSuperAdmin } = useApp();
  const { showToast } = useToastContext();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const clinicId = parseInt(id as string);
  const userId = Number(user?.id);

  // Follow queries
  const { data: isFollowingData } = useQuery(trpc.clinics.isFollowing.queryOptions({ clinicId, userId }, { enabled: !!user }));
  const isFollowing = isFollowingData?.isFollowing;

  const { data: followerCountData } = useQuery(trpc.clinics.getFollowerCount.queryOptions({ clinicId }));
  const followerCount = followerCountData?.count;

  const followMutation = useMutation(trpc.clinics.follow.mutationOptions());
  const unfollowMutation = useMutation(trpc.clinics.unfollow.mutationOptions());

  const { data, isLoading, error } = useQuery(
    trpc.clinics.getDetails.queryOptions({
      clinicId,
      userId,
    }),
  );

  const clinic = (data as any)?.clinic;

  const services = clinic?.services?.split("،");
  const doctors = clinic?.doctors?.split("،");

  // const renderStars = (rating: number) => {
  //   const stars = [];
  //   const fullStars = Math.floor(rating);
  //   const hasHalfStar = rating % 1 !== 0;

  //   for (let i = 0; i < fullStars; i++) {
  //     stars.push(<Star key={i} size={16} color="#FFD700" fill="#FFD700" />);
  //   }

  //   if (hasHalfStar) {
  //     stars.push(<Star key="half" size={16} color="#FFD700" fill="#FFD700" />);
  //   }

  //   const remainingStars = 5 - Math.ceil(rating);
  //   for (let i = 0; i < remainingStars; i++) {
  //     stars.push(<Star key={`empty-${i}`} size={16} color="#E5E7EB" />);
  //   }

  //   return stars;
  // };

  // Open external links
  const handleOpenLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("خطأ", "لا يمكن فتح الرابط");
      }
    } catch (error) {
      console.error("Failed to open link:", error);
    }
  };

  // Make phone call
  const handleCall = async (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    handleOpenLink(phoneUrl);
  };

  // Open WhatsApp chat
  const handleWhatsApp = (phone: string) => {
    const whatsappUrl = `https://wa.me/${phone}`;
    handleOpenLink(whatsappUrl);
  };

  const handleFollowClinic = () => {
    if (!user) {
      showToast({
        type: "error",
        message: "الرجاء تسجيل الدخول لمتابعة العيادة",
      });
      return;
    }
    if (!clinic) return;
    if (isFollowing) {
      Alert.alert("إلغاء المتابعة", "هل تريد إلغاء متابعة هذه العيادة؟", [
        { text: "إلغاء", style: "cancel" },
        {
          text: "نعم",
          style: "destructive",
          onPress: () => {
            unfollowMutation.mutate(
              { clinicId },
              {
                onSuccess: () => {
                  showToast({
                    type: "success",
                    message: "تم إلغاء المتابعة بنجاح",
                  });
                  queryClient.invalidateQueries(trpc.clinics.isFollowing.queryKey as any);
                  queryClient.invalidateQueries(trpc.clinics.getFollowerCount.queryKey as any);
                },
                onError: (error) => {
                  showToast({
                    type: "error",
                    message: error.message,
                  });
                },
              },
            );
          },
        },
      ]);
    } else {
      followMutation.mutate(
        { clinicId },
        {
          onSuccess: () => {
            showToast({
              type: "success",
              message: "تم المتابعة بنجاح",
            });
            queryClient.invalidateQueries(trpc.clinics.isFollowing.queryKey as any);
            queryClient.invalidateQueries(trpc.clinics.getFollowerCount.queryKey as any);
          },
          onError: (error) => {
            showToast({
              type: "error",
              message: error.message,
            });
          },
        },
      );
    }
  };

  const handleShareClinic = async () => {
    try {
      const appUrl = "https://bytari.app"; // TODO: replace with store link
      const message = `تحقق من تطبيق بيطاري ${appUrl}`;
      await Share.share({ message, url: appUrl, title: "بيطاري" });
    } catch {}
  };

  // Open in Maps
  const handleOpenMaps = (address: string) => {
    const query = encodeURIComponent(address);
    const mapsUrl = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    })!;
    handleOpenLink(mapsUrl);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل بيانات العيادة...</Text>
      </View>
    );
  }

  // Error state
  if (error || !clinic) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error?.message || "حدث خطأ أثناء تحميل بيانات العيادة"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>العودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: clinic.name,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                console.log("Clinic profile back button pressed");
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/");
                }
              }}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Clinic Header */}
        <View style={styles.clinicHeader}>
          {clinic.images.length > 0 && <Image source={{ uri: clinic.images[0] }} style={styles.clinicHeaderImage} />}
          <View style={styles.clinicHeaderOverlay}>
            <View style={[styles.statusBadge, !clinic.isActive && styles.closedBadge]}>
              <Text style={styles.statusText}>{clinic.isActive ? "مفتوح الآن" : "مغلق"}</Text>
            </View>
            <Text style={styles.clinicHeaderName}>{clinic.name}</Text>
            <TouchableOpacity onPress={handleShareClinic} style={styles.shareIconButton}>
              <Share2 size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Follower Count */}
          <Text style={styles.followerCount}>{followerCount ?? 0} متابع</Text>

          {/* Premium Badge */}
          {clinic.isPremium && (
            <View style={styles.premiumBadge}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.premiumText}>عيادة مميزة</Text>
            </View>
          )}

          {/* Rating and Reviews */}
          {/* <View style={styles.ratingSection}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>{clinic.rating?.toFixed(1) || "0.0"}</Text>
              <View style={styles.starsContainer}>{renderStars(clinic.rating || 0)}</View>
              <Text style={styles.reviewsCount}>({clinic.reviewsCount || 0} تقييم)</Text>
            </View>
          </View> */}

          {/* Description */}
          {clinic.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>نبذة عن العيادة</Text>
              <Text style={styles.descriptionText}>{clinic.description}</Text>
            </View>
          )}

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>معلومات الاتصال</Text>

            {clinic.address && (
              <TouchableOpacity style={styles.contactItem} onPress={() => handleOpenMaps(clinic.address)}>
                <MapPin size={20} color={COLORS.primary} />
                <Text style={styles.contactText}>{clinic.address}</Text>
              </TouchableOpacity>
            )}

            {clinic.phone && (
              <TouchableOpacity style={styles.contactItem} onPress={() => handleCall(clinic.phone)}>
                <Phone size={20} color={COLORS.primary} />
                <Text style={styles.contactText}>{clinic.phone}</Text>
              </TouchableOpacity>
            )}

            {clinic.website && (
              <TouchableOpacity style={styles.contactItem} onPress={() => handleOpenLink(clinic.website)}>
                <Earth size={20} color={COLORS.primary} />
                <Text style={styles.contactText}>{clinic.website}</Text>
              </TouchableOpacity>
            )}

            {clinic.facebook && (
              <TouchableOpacity style={styles.contactItem} onPress={() => handleOpenLink(clinic.facebook)}>
                <Facebook size={20} color={COLORS.primary} />
                <Text style={styles.contactText}>{clinic.facebook}</Text>
              </TouchableOpacity>
            )}

            {clinic.instagram && (
              <TouchableOpacity style={styles.contactItem} onPress={() => handleOpenLink(clinic.instagram)}>
                <Instagram size={20} color={COLORS.primary} />
                <Text style={styles.contactText}>{clinic.instagram}</Text>
              </TouchableOpacity>
            )}

            {clinic.whatsapp && (
              <TouchableOpacity style={styles.contactItem} onPress={() => handleWhatsApp(clinic.whatsapp)}>
                <Image style={{ width: 20, height: 20 }} source={require("../assets/whatsapp.png")} />
                <Text style={styles.contactText}>{clinic.whatsapp}</Text>
              </TouchableOpacity>
            )}

            {clinic.workingHours && (
              <View style={styles.contactItem}>
                <Clock size={20} color={COLORS.primary} />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactText}>ساعات العمل: {clinic.workingHours}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Services */}
          {services?.length > 0 && (
            <View style={styles.servicesSection}>
              <Text style={styles.sectionTitle}>الخدمات المتوفرة</Text>
              {services?.map((service: string, index: number) => (
                <View key={index} style={styles.serviceItem}>
                  <Text style={styles.serviceText}>• {service}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Doctors */}
          {doctors?.length > 0 && (
            <View style={styles.doctorsSection}>
              <Text style={styles.sectionTitle}>الأطباء</Text>
              {doctors?.map((doctor: string, index: number) => (
                <View key={index} style={styles.doctorItem}>
                  <Text style={styles.doctorName}>{doctor}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {clinic.phone && (
              <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={handleCall}>
                <Phone size={20} color={COLORS.white} />
                <Text style={styles.actionButtonText}>اتصال</Text>
              </TouchableOpacity>
            )}

            {clinic.latitude && clinic.longitude && (
              <TouchableOpacity
                style={[styles.actionButton, styles.directionsButton]}
                onPress={() => {
                  console.log("Opening directions to clinic");
                  router.push({
                    pathname: "/map-location",
                    params: {
                      latitude: clinic.latitude,
                      longitude: clinic.longitude,
                      name: clinic.name,
                      address: clinic.address,
                      mode: "directions",
                    },
                  });
                }}
              >
                <Navigation size={20} color={COLORS.white} />
                <Text style={styles.actionButtonText}>الاتجاهات</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Follow Button */}
          <View style={styles.followSection}>
            <Button
              title={isFollowing ? "إلغاء المتابعة" : "متابعة العيادة"}
              onPress={handleFollowClinic}
              type={isFollowing ? "outline" : "primary"}
              style={[styles.followButton, isFollowing && styles.unfollowButton]}
              icon={isFollowing ? <BellOff size={20} color={isFollowing ? COLORS.error : COLORS.white} /> : <Bell size={20} color={COLORS.white} />}
            />
          </View>

          {/* Rating Button */}
          <TouchableOpacity
            style={styles.ratingButton}
            onPress={() => router.push({ pathname: "/clinic-reviews", params: { id: clinicId, name: clinic.name } })}
          >
            <MessageSquare size={20} color={COLORS.primary} />
            <Text style={styles.ratingButtonText}>التقييمات</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.gray,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.gray,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    padding: 8,
  },
  clinicHeader: {
    height: 200,
    position: "relative",
  },
  clinicHeaderImage: {
    width: width,
    height: 200,
    resizeMode: "cover",
  },
  clinicHeaderOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shareIconButton: {
    padding: 4,
  },
  clinicHeaderName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    flex: 1,
    textAlign: "left",
  },
  statusBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 15,
  },
  closedBadge: {
    backgroundColor: COLORS.error,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  premiumBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF9E6",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#B8860B",
  },
  ratingSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingContainer: {
    alignItems: "center",
  },
  ratingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  reviewsCount: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  descriptionSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: "left",
  },
  contactSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
    textAlign: "left",
  },
  contactTextContainer: {
    flex: 1,
  },
  contactSubText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: "left",
  },
  emergencyText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "left",
  },
  servicesSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "left",
  },
  serviceItem: {
    paddingVertical: 8,
  },
  serviceText: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: "left",
  },
  doctorsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "left",
  },
  actionButtons: {
    flexDirection: "row-reverse",
    gap: 16,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    backgroundColor: COLORS.success,
  },
  directionsButton: {
    backgroundColor: COLORS.info,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  ratingButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    gap: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  reviewsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  reviewHeader: {
    justifyContent: "space-between",
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: "left",
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "left",
  },
  deleteReviewButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },
  followerCount: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "left",
    marginBottom: 8,
  },
  followSection: {
    marginBottom: 20,
  },
  followButton: {
    borderRadius: 12,
  },
  unfollowButton: {
    borderColor: COLORS.error,
  },
});
