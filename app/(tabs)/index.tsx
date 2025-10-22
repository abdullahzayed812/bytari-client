import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { useRouter, useFocusEffect } from "expo-router";
import Button from "../../components/Button";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/Card";
import { trpc } from "../../lib/trpc";
import { Bell, Calendar, MapPin, MessageCircle, Phone, Star, Search, Heart, Download, User } from "lucide-react-native";
import { UserModeToggle } from "../../components/UserModeToggle";
import AutoScrollView from "../../components/AutoScrollView";
import { useQuery } from "@tanstack/react-query";

const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const { t, isRTL } = useI18n();
  const { user, userMode, isSuperAdmin } = useApp();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  // Mock data for notifications and messages count (will be replaced with real data later)
  const [notificationsCount, setNotificationsCount] = useState<number>(5);
  const [messagesCount, setMessagesCount] = useState<number>(12);
  const adScrollViewRef = useRef<ScrollView>(null);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Real backend data queries
  const {
    data: heroImagesData,
    isLoading: heroImagesLoading,
    error: heroError,
  } = useQuery(trpc.admin.ads.getAll.queryOptions({ adminId: 1 }));
  const heroImages = useMemo(() => (heroImagesData as any)?.ads, [heroImagesData]);

  const { data, isLoading: clinicsLoading, error } = useQuery(trpc.clinics.getActiveList.queryOptions({}));
  // Real backend data for clinics that should be shown on home screen
  const clinics = useMemo(() => (data as any)?.clinics, [data]);

  // Real backend data for vet stores (when userMode is veterinarian)
  const { data: rawVetStores, isLoading: vetStoresLoading } = useQuery(
    trpc.stores.list.queryOptions(undefined, {
      enabled: userMode === "veterinarian",
    })
  );

  const vetStores = useMemo(() => (rawVetStores as any)?.stores, [rawVetStores]);

  const { data: inquiriesData, isLoading: inquiriesLoading } = useQuery(
    trpc.inquiries.listForUser.queryOptions({ vetId: user?.id, userId: user?.id })
  );
  const inquiries = useMemo(() => (inquiriesData as any)?.inquiries, [inquiriesData]);

  const { data: tipsData, isLoading: tipsLoading } = useQuery(trpc.content.listTips.queryOptions());
  const tips = useMemo(() => (tipsData as any)?.tips, [tipsData]);

  const { data: articlesData, isLoading: articlesLoading } = useQuery(
    trpc.content.listMagazineArticles.queryOptions({})
  );
  const articles = useMemo(() => (articlesData as any)?.articles, [articlesData]);

  const { data: vetBooksData, isLoading: vetBooksLoading } = useQuery(trpc.content.listVetBooks.queryOptions());
  const vetBooks = useMemo(() => (vetBooksData as any)?.books, [vetBooksData]);

  const { data: lostPetsData, isLoading: lostPetsLoading } = useQuery(
    trpc.pets.getApproved.queryOptions({ requestType: "lost_pet" })
  );
  const lostPets = useMemo(() => (lostPetsData as any)?.pets, [lostPetsData]);

  const { data: adoptionPetsData, isLoading: adoptionPetsLoading } = useQuery(
    trpc.pets.getApproved.queryOptions({ requestType: "adoption" })
  );
  const adoptionPets = useMemo(() => (adoptionPetsData as any)?.pets, [adoptionPetsData]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update counts to simulate real-time data
      if (Math.random() > 0.7) {
        setNotificationsCount((prev) => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
      }
      if (Math.random() > 0.7) {
        setMessagesCount((prev) => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
      }
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Scroll to top when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const startAutoSlide = () => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
    autoSlideRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % heroImages?.length;
        // Scroll to the next image immediately
        if (adScrollViewRef.current) {
          adScrollViewRef.current.scrollTo({ x: nextIndex * screenWidth, animated: true });
        }
        return nextIndex;
      });
    }, 4000);
  };

  const stopAutoSlide = () => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  // Remove this useEffect as we handle scrolling directly in startAutoSlide
  // useEffect(() => {
  //   if (adScrollViewRef.current) {
  //     adScrollViewRef.current.scrollTo({ x: currentImageIndex * screenWidth, animated: true });
  //   }
  // }, [currentImageIndex]);

  const handleAdScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const newIndex = Math.round(contentOffset.x / screenWidth);
    if (newIndex !== currentImageIndex && newIndex >= 0 && newIndex < heroImages?.length) {
      setCurrentImageIndex(newIndex);
    }
  };

  const handleAdScrollBegin = () => {
    // console.log("🔄 Main carousel: User started scrolling");
    stopAutoSlide();
  };

  const handleAdScrollEnd = () => {
    // console.log("🔄 Main carousel: User ended scrolling");
    // Delay restart to avoid interference - longer on Android
    const restartDelay = Platform.OS === "android" ? 4000 : 2000;
    setTimeout(() => {
      startAutoSlide();
    }, restartDelay);
  };

  const handleAdMomentumScrollBegin = () => {
    // console.log("🔄 Main carousel: Momentum scroll began");
    stopAutoSlide();
  };

  const handleAdMomentumScrollEnd = () => {
    // console.log("🔄 Main carousel: Momentum scroll ended");
    // Add extra delay on Android to prevent conflicts
    const restartDelay = Platform.OS === "android" ? 4000 : 2000;
    setTimeout(() => {
      startAutoSlide();
    }, restartDelay);
  };

  const handleSendConsultation = () => {
    if (userMode === "veterinarian") {
      router.push("/new-inquiry");
    } else {
      router.push("/consultation");
    }
  };

  const handleViewTips = () => {
    if (userMode === "veterinarian") {
      router.push("/vet-magazine");
    } else {
      router.push("/tips-list");
    }
  };

  const handleViewClinics = () => {
    if (userMode === "veterinarian") {
      router.push("/vet-stores-list");
    } else {
      router.push("/clinics-list");
    }
  };

  const handleViewLostPets = () => {
    if (userMode === "veterinarian") {
      router.push("/vet-books");
    } else {
      router.push("/lost-pets-list");
    }
  };

  const handleReportLostPet = () => {
    router.push("/report-lost-pet");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: "row" }]}>
        {/* Left side - User info */}
        <View style={[styles.userInfoContainer, { flexDirection: "row" }]}>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/(tabs)/profile")}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>

          <View style={[styles.userTextContainer, { marginRight: isRTL ? 8 : 0, marginLeft: isRTL ? 0 : 8 }]}>
            <Text style={[styles.greetingText]}>{userMode === "veterinarian" ? "مرحباً دكتور" : "مرحباً"}</Text>
            <Text style={[styles.userNameText]}>{user?.name || "Unkown"}</Text>
          </View>
        </View>

        {/* Right side - Icons */}
        <View style={[styles.rightIcons, { flexDirection: "row" }]}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              if (userMode === "veterinarian") {
                // For veterinarians: Search for pet records, medical history, or patient files
                router.push("/search");
              } else {
                // For pet owners: Search for clinics, products, etc.
                router.push("/search");
              }
            }}
          >
            <Search size={22} color={COLORS.black} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              if (userMode === "veterinarian") {
                // For veterinarians: Clinic requests, appointment notifications, medical alerts
                router.push("/notifications");
              } else {
                // For pet owners: General notifications, appointment reminders
                router.push("/notifications");
              }
            }}
          >
            <Bell size={22} color={COLORS.black} />
            {notificationsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationsCount > 99 ? "99+" : notificationsCount.toString()}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              if (userMode === "veterinarian") {
                // For veterinarians: Professional consultations, clinic communications, patient updates
                router.push("/messages");
              } else {
                // For pet owners: Consultation replies, clinic messages
                router.push("/messages");
              }
            }}
          >
            <MessageCircle size={22} color={COLORS.black} />
            {messagesCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{messagesCount > 99 ? "99+" : messagesCount.toString()}</Text>
              </View>
            )}
          </TouchableOpacity>

          <UserModeToggle />
        </View>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
        {/* New Advertisement Section */}
        <View style={styles.advertisementSection}>
          {isSuperAdmin ? (
            <SectionHeader
              title="الإعلانات"
              showSeeAll={false}
              isRTL={isRTL}
              showAddButton={isSuperAdmin}
              onAdd={() => router.push("/admin-ads-management")}
            />
          ) : (
            <View style={{ height: 20 }} />
          )}

          <View style={styles.adContainer}>
            <ScrollView
              ref={adScrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleAdScroll}
              onScrollBeginDrag={handleAdScrollBegin}
              onScrollEndDrag={handleAdScrollEnd}
              onMomentumScrollBegin={handleAdMomentumScrollBegin}
              onMomentumScrollEnd={handleAdMomentumScrollEnd}
              scrollEventThrottle={Platform.OS === "android" ? 32 : 16}
              contentContainerStyle={styles.adScrollContent}
              decelerationRate={Platform.OS === "android" ? "normal" : "fast"}
              removeClippedSubviews={Platform.OS === "android"}
              overScrollMode="never"
              nestedScrollEnabled={false}
            >
              {heroImagesLoading ? (
                <View style={styles.adImageWrapper}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : (
                heroImages?.map((ad, index) => (
                  <TouchableOpacity
                    key={ad.id}
                    style={styles.adImageWrapper}
                    onPress={() => {
                      // Navigate to ad details page
                      router.push(`/ad-details?id=${ad.id}`);
                    }}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: ad.imageUrl }} style={styles.adImage} resizeMode="cover" />
                    {/* Ad Text Overlay - Direct on image without background */}
                    <View style={styles.adTextOverlay}>
                      <Text style={styles.adTitle}>{ad.title}</Text>
                      <Text style={styles.adSubtitle}>{ad.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {heroImages && (
              <View style={styles.paginationContainer}>
                {heroImages?.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex ? styles.paginationDotActive : styles.paginationDotInactive,
                    ]}
                    onPress={() => {
                      setCurrentImageIndex(index);
                      // Scroll to the selected image immediately
                      if (adScrollViewRef.current) {
                        adScrollViewRef.current.scrollTo({ x: index * screenWidth, animated: true });
                      }
                      // Restart auto slide after a longer delay to avoid interference
                      const restartDelay = Platform.OS === "android" ? 4000 : 2000;
                      setTimeout(() => startAutoSlide(), restartDelay);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Consultation Section */}
        <View style={styles.consultationSection}>
          <View style={styles.consultationCard}>
            <Text style={[styles.consultationText, { textAlign: "center" }]}>
              {userMode === "veterinarian" ? t("home.consultationVet") : t("home.consultation")}
            </Text>
            <Button
              title={userMode === "veterinarian" ? "ارسل استفسارك" : t("home.sendConsultation")}
              onPress={handleSendConsultation}
              type="primary"
              size="medium"
              style={styles.consultationButton}
            />
          </View>
        </View>

        {/* Previous Consultations/Inquiries Section */}
        <View style={styles.section}>
          <SectionHeader
            title={userMode === "veterinarian" ? "استفساراتك السابقة" : "استشاراتك السابقة"}
            isRTL={isRTL}
            showSeeAll={true}
            onSeeAll={() => (userMode === "veterinarian" ? router.navigate("/") : router.navigate("/"))}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.horizontalScrollContent, { flexDirection: isRTL ? "row" : "row-reverse" }]}
          >
            {inquiriesLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : inquiries?.length > 0 ? (
              inquiries?.slice(0, 3).map((inquiry) => (
                <TouchableOpacity
                  key={inquiry.id}
                  style={[styles.consultationHistoryCard, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                  onPress={() => {
                    if (userMode === "veterinarian") {
                      router.push("/vet-inquiries");
                    } else {
                      router.push("/consultation");
                    }
                  }}
                >
                  <View style={[styles.consultationHistoryContent, { flexDirection: isRTL ? "row" : "row-reverse" }]}>
                    {/* Status Badge */}
                    <View style={[styles.statusContainer, { alignSelf: isRTL ? "flex-start" : "flex-end" }]}>
                      <View
                        style={[
                          styles.statusIndicator,
                          inquiry.status === "pending"
                            ? styles.statusPending
                            : inquiry.status === "answered"
                            ? styles.statusAnswered
                            : styles.statusClosed,
                        ]}
                      />
                      <Text style={styles.statusText}>
                        {inquiry.status === "pending"
                          ? "قيد المراجعة"
                          : inquiry.status === "answered"
                          ? "تم الرد"
                          : "مغلق"}
                      </Text>
                    </View>

                    {/* Consultation Info */}
                    <View style={styles.consultationHistoryDetails}>
                      <Text
                        style={[styles.consultationHistoryTitle, { textAlign: isRTL ? "left" : "right" }]}
                        numberOfLines={2}
                      >
                        {inquiry.title}
                      </Text>

                      {inquiry.petName && (
                        <Text style={[styles.consultationHistoryPet, { textAlign: isRTL ? "left" : "right" }]}>
                          الحيوان: {inquiry.petName}
                        </Text>
                      )}

                      <Text
                        style={[styles.consultationHistoryDescription, { textAlign: isRTL ? "left" : "right" }]}
                        numberOfLines={3}
                      >
                        {inquiry.content}
                      </Text>

                      <Text style={[styles.consultationHistoryDate, { textAlign: isRTL ? "left" : "right" }]}>
                        {new Date(inquiry.createdAt).toLocaleDateString("ar-SA")}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text>لا يوجد استفسارات</Text>
            )}
          </ScrollView>
        </View>

        {/* Available Clinics / Veterinary Stores Section */}
        <View style={styles.section}>
          <SectionHeader
            title={userMode === "veterinarian" ? "المذاخر البيطرية" : t("home.availableClinics")}
            onSeeAll={handleViewClinics}
            isRTL={isRTL}
            showEditButton={isSuperAdmin}
            onEdit={() => {
              if (userMode === "veterinarian") {
                router.push("/home-stores-management");
              } else {
                router.push("/home-clinics-management");
              }
            }}
          />
          <AutoScrollView
            itemWidth={336}
            autoScrollInterval={5000}
            contentContainerStyle={[styles.horizontalScrollContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}
          >
            {userMode === "veterinarian"
              ? vetStores?.map((store) => (
                  <TouchableOpacity
                    key={store.id}
                    style={[styles.clinicCardNew, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                    onPress={() => router.push({ pathname: "/store-details", params: { id: store.id } })}
                  >
                    <View style={[styles.clinicCardContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                      {/* Store Info */}
                      <View
                        style={[
                          styles.clinicDetails,
                          { flex: 1, marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 },
                        ]}
                      >
                        {/* Active Badge */}
                        {store.isActive && (
                          <View
                            style={[styles.premiumBadgeContainer, { alignSelf: isRTL ? "flex-start" : "flex-end" }]}
                          >
                            <View style={styles.premiumBadge}>
                              <Star size={12} color={COLORS.white} fill={COLORS.white} />
                              <Text style={styles.premiumBadgeText}>نشط</Text>
                            </View>
                          </View>
                        )}

                        {/* Store Name */}
                        <Text style={[styles.clinicName, { textAlign: isRTL ? "right" : "left" }]}>{store.name}</Text>

                        {/* Location */}
                        <View style={[styles.clinicInfoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <MapPin size={16} color="#10B981" />
                          <Text
                            style={[
                              styles.clinicInfoRowText,
                              { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 },
                            ]}
                          >
                            {store.address}
                          </Text>
                        </View>

                        {/* Phone */}
                        <View style={[styles.clinicInfoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <Phone size={16} color="#10B981" />
                          <Text
                            style={[
                              styles.clinicInfoRowText,
                              { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 },
                            ]}
                          >
                            {store.phone}
                          </Text>
                        </View>

                        {/* Rating */}
                        <View style={[styles.clinicRatingRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <Text
                            style={[styles.clinicRatingText, { marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }]}
                          >
                            {store.rating}
                          </Text>
                          <Star size={16} color="#FFD700" fill="#FFD700" />
                        </View>
                      </View>

                      {/* Store Image */}
                      <Image source={{ uri: store.images[0] }} style={styles.clinicImage} />
                    </View>

                    {/* Action Buttons */}
                    <View style={[styles.clinicActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                      <TouchableOpacity
                        style={[styles.clinicActionButton, styles.primaryClinicActionButton]}
                        onPress={() => {
                          console.log(`Call store ${store.id}: ${store.phone}`);
                          // TODO: Implement phone call functionality
                        }}
                      >
                        <Text style={[styles.clinicActionButtonText, styles.primaryClinicActionButtonText]}>اتصال</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.clinicActionButton}
                        onPress={() => {
                          console.log(`View store products ${store.id}`);
                          router.push({ pathname: "/store-products", params: { id: store.id } });
                        }}
                      >
                        <Text style={styles.clinicActionButtonText}>المنتجات</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              : clinics?.map((clinic) => (
                  <TouchableOpacity
                    key={clinic.id}
                    style={[styles.clinicCardNew, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                    onPress={() => router.push({ pathname: "/clinic-profile", params: { id: clinic.id } })}
                  >
                    <View style={[styles.clinicCardContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                      {/* Clinic Info */}
                      <View
                        style={[
                          styles.clinicDetails,
                          { flex: 1, marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 },
                        ]}
                      >
                        {/* Premium Badge */}
                        {clinic.isPremium && (
                          <View
                            style={[styles.premiumBadgeContainer, { alignSelf: isRTL ? "flex-start" : "flex-end" }]}
                          >
                            <View style={styles.premiumBadge}>
                              <Star size={12} color={COLORS.white} fill={COLORS.white} />
                              <Text style={styles.premiumBadgeText}>مميز</Text>
                            </View>
                          </View>
                        )}

                        {/* Clinic Name */}
                        <Text style={[styles.clinicName, { textAlign: isRTL ? "right" : "left" }]}>{clinic.name}</Text>

                        {/* Location */}
                        <View style={[styles.clinicInfoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <MapPin size={16} color="#10B981" />
                          <Text
                            style={[
                              styles.clinicInfoRowText,
                              { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 },
                            ]}
                          >
                            {clinic.address}
                          </Text>
                        </View>

                        {/* Phone */}
                        <View style={[styles.clinicInfoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <Phone size={16} color="#10B981" />
                          <Text
                            style={[
                              styles.clinicInfoRowText,
                              { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 },
                            ]}
                          >
                            {clinic.phone}
                          </Text>
                        </View>

                        {/* Rating */}
                        <View style={[styles.clinicRatingRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <Text
                            style={[styles.clinicRatingText, { marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }]}
                          >
                            {clinic.rating}
                          </Text>
                          <Star size={16} color="#FFD700" fill="#FFD700" />
                        </View>
                      </View>

                      {/* Clinic Image */}
                      <Image source={{ uri: clinic.images[0] }} style={styles.clinicImage} />
                    </View>

                    {/* Action Buttons */}
                    <View style={[styles.clinicActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                      <TouchableOpacity
                        style={[styles.clinicActionButton, styles.primaryClinicActionButton]}
                        onPress={() => {
                          console.log(`Call clinic ${clinic.id}: ${clinic.phone}`);
                          // TODO: Implement phone call functionality
                        }}
                      >
                        <Text style={[styles.clinicActionButtonText, styles.primaryClinicActionButtonText]}>اتصال</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.clinicActionButton}
                        onPress={() => {
                          console.log(`Show map for clinic ${clinic.id}`);
                          // TODO: Implement map functionality
                        }}
                      >
                        <Text style={styles.clinicActionButtonText}>الخريطة</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
          </AutoScrollView>
        </View>

        {/* Best Tips / Veterinary Magazine Section */}
        <View style={styles.section}>
          <SectionHeader
            title={userMode === "veterinarian" ? t("home.vetMagazine") : t("home.bestTips")}
            onSeeAll={handleViewTips}
            isRTL={isRTL}
            showEditButton={isSuperAdmin}
            onEdit={() => {
              if (userMode === "veterinarian") {
                router.push("/home-magazine-management");
              } else {
                router.push("/home-tips-management");
              }
            }}
          />
          <AutoScrollView
            itemWidth={280}
            autoScrollInterval={6000}
            contentContainerStyle={[styles.horizontalScrollContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}
          >
            {userMode === "veterinarian" ? (
              articlesLoading ? (
                <ActivityIndicator />
              ) : (
                articles?.map((article) => (
                  <TouchableOpacity
                    key={article.id}
                    style={[styles.articleCard, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                    onPress={() => {
                      router.push(`/article-details?id=${article.id}`);
                    }}
                  >
                    <Image source={{ uri: article.coverImage }} style={styles.articleImage} />
                    <View style={styles.articleContent}>
                      <Text style={[styles.articleTitle, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={2}>
                        {article.title}
                      </Text>
                      <Text
                        style={[styles.articleDescription, { textAlign: isRTL ? "right" : "left" }]}
                        numberOfLines={2}
                      >
                        {article.description}
                      </Text>
                      <View style={[styles.articleAuthor, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        <User size={14} color={COLORS.darkGray} />
                        <Text
                          style={[styles.articleAuthorText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}
                        >
                          {article.author}
                        </Text>
                      </View>
                      <Text
                        style={[styles.articleAuthorTitle, { textAlign: isRTL ? "right" : "left" }]}
                        numberOfLines={1}
                      >
                        {article.authorTitle}
                      </Text>
                      <View style={[styles.articleStats, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        <View style={[styles.articleStat, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <Heart size={14} color="#EF4444" />
                          <Text
                            style={[styles.articleStatText, { marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }]}
                          >
                            {article.likes}
                          </Text>
                        </View>
                        <View style={[styles.articleStat, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <MessageCircle size={14} color={COLORS.darkGray} />
                          <Text
                            style={[styles.articleStatText, { marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }]}
                          >
                            {article.comments}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )
            ) : tipsLoading ? (
              <ActivityIndicator />
            ) : (
              tips?.map((tip) => (
                <Card
                  key={tip.id}
                  title={tip.title}
                  image={tip.images[0]}
                  style={[styles.tipCard, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                  onPress={() => {
                    router.push(`/tip-details?id=${tip.id}`);
                  }}
                >
                  <Text style={[styles.tipContent, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={2}>
                    {tip.content}
                  </Text>
                </Card>
              ))
            )}
          </AutoScrollView>
        </View>

        {/* Adoption and Breeding Section - Only for pet owners */}
        {userMode !== "veterinarian" && (
          <View style={styles.section}>
            <SectionHeader
              title="حيوانات للتبني أو للتزاوج"
              onSeeAll={() => router.push("/adoption-breeding-list")}
              isRTL={isRTL}
            />
            <AutoScrollView
              itemWidth={316}
              autoScrollInterval={7000}
              contentContainerStyle={[styles.horizontalScrollContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}
            >
              {adoptionPetsLoading ? (
                <ActivityIndicator />
              ) : (
                adoptionPets?.slice(0, 3).map((pet) => (
                  <TouchableOpacity
                    key={`adoption-${pet.id}`}
                    style={[styles.adoptionPetCard, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                    onPress={() =>
                      router.push({ pathname: "/adoption-pet-details", params: { id: pet.id, type: "adoption" } })
                    }
                  >
                    <View style={[styles.adoptionPetCardContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                      {/* Pet Image */}
                      <Image source={{ uri: pet.images[0] }} style={styles.adoptionPetImage} />

                      {/* Pet Info */}
                      <View
                        style={[
                          styles.adoptionPetDetails,
                          { flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 },
                        ]}
                      >
                        {/* Status Badge */}
                        <View style={[styles.adoptionBadgeContainer, { alignSelf: isRTL ? "flex-start" : "flex-end" }]}>
                          <View style={styles.adoptionBadge}>
                            <Text style={styles.adoptionBadgeText}>للتبني</Text>
                          </View>
                        </View>

                        {/* Pet Name and Type */}
                        <Text style={[styles.adoptionPetName, { textAlign: isRTL ? "right" : "left" }]}>
                          {pet.name}
                        </Text>
                        <Text style={[styles.adoptionPetType, { textAlign: isRTL ? "right" : "left" }]}>
                          {t(`pets.types.${pet.type}`)}
                        </Text>

                        {/* Age */}
                        <View style={[styles.adoptionPetInfoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <Calendar size={14} color="#10B981" />
                          <Text
                            style={[
                              styles.adoptionPetInfoRowText,
                              { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 },
                            ]}
                          >
                            عمر سنتين
                          </Text>
                        </View>

                        {/* Location */}
                        <View style={[styles.adoptionPetInfoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <MapPin size={14} color="#10B981" />
                          <Text
                            style={[
                              styles.adoptionPetInfoRowText,
                              { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 },
                            ]}
                          >
                            {pet?.lastSeen?.location}
                          </Text>
                        </View>

                        {/* Phone */}
                        <View style={[styles.adoptionPetInfoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <Phone size={14} color="#10B981" />
                          <Text
                            style={[
                              styles.adoptionPetInfoRowText,
                              { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 },
                            ]}
                          >
                            {pet?.contactInfo.phone}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Description */}
                    <Text
                      style={[styles.adoptionPetDescription, { textAlign: isRTL ? "right" : "left" }]}
                      numberOfLines={2}
                    >
                      حيوان أليف ودود ومدرب، يحتاج إلى منزل محب ورعاية جيدة.
                    </Text>

                    {/* Action Buttons */}
                    <View style={[styles.adoptionPetActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                      <TouchableOpacity
                        style={styles.adoptionActionButton}
                        onPress={() => {
                          console.log(`View details for adoption pet ${pet.id}`);
                          router.push({ pathname: "/adoption-pet-details", params: { id: pet.id, type: "adoption" } });
                        }}
                      >
                        <Text style={styles.adoptionActionButtonText}>التفاصيل</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.adoptionActionButton, styles.primaryAdoptionActionButton]}
                        onPress={() => {
                          console.log(`Contact owner for adoption pet ${pet.id}`);
                          // TODO: Implement contact owner functionality
                        }}
                      >
                        <Text style={[styles.adoptionActionButtonText, styles.primaryAdoptionActionButtonText]}>
                          اتصال
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </AutoScrollView>
          </View>
        )}

        {/* Lost Pets / Veterinary Books Section */}
        <View style={styles.section}>
          <SectionHeader
            title={userMode === "veterinarian" ? t("home.vetBooks") : t("home.lostPets")}
            onSeeAll={handleViewLostPets}
            isRTL={isRTL}
            showEditButton={isSuperAdmin && userMode === "veterinarian"}
            onEdit={() => router.push("/home-books-management")}
          />
          <AutoScrollView
            itemWidth={280}
            autoScrollInterval={8000}
            contentContainerStyle={[styles.horizontalScrollContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}
          >
            {userMode === "veterinarian" ? (
              vetBooksLoading ? (
                <ActivityIndicator />
              ) : (
                vetBooks?.map((book) => (
                  <TouchableOpacity
                    key={book.id}
                    style={[styles.bookCard, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                    onPress={() => {
                      router.push(`/book-details?id=${book.id}`);
                    }}
                  >
                    <Image source={{ uri: book.coverImage }} style={styles.bookImage} />
                    <View style={styles.bookContent}>
                      <Text style={[styles.bookTitle, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={2}>
                        {book.title}
                      </Text>
                      <Text style={[styles.bookAuthor, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={1}>
                        {book.author}
                      </Text>
                      <Text style={[styles.bookDescription, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={2}>
                        {book.description}
                      </Text>
                      <View style={[styles.bookStats, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        <View style={[styles.bookStat, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <Download size={14} color="#10B981" />
                          <Text
                            style={[styles.bookStatText, { marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }]}
                          >
                            {book.downloads}
                          </Text>
                        </View>
                        <Text style={styles.bookPages}>{book.pages} صفحة</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.downloadButton}
                        onPress={() => {
                          console.log(`Download book ${book.id}`);
                          // TODO: Implement download functionality
                        }}
                      >
                        <Download size={16} color={COLORS.white} />
                        <Text style={styles.downloadButtonText}>تحميل</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              )
            ) : lostPetsLoading ? (
              <ActivityIndicator />
            ) : (
              lostPets?.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[styles.lostPetCardNew, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                  onPress={() => router.push({ pathname: "/lost-pet", params: { id: pet.id } })}
                >
                  <View style={[styles.lostPetCardContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                    {/* Pet Image */}
                    <Image source={{ uri: pet.images[0] }} style={styles.lostPetImage} />

                    {/* Pet Info */}
                    <View
                      style={[
                        styles.lostPetDetails,
                        { flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 },
                      ]}
                    >
                      {/* Status Badge */}
                      <View style={[styles.statusBadgeContainer, { alignSelf: isRTL ? "flex-start" : "flex-end" }]}>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusBadgeText}>مفقود</Text>
                        </View>
                      </View>

                      {/* Pet Name and Type */}
                      <Text style={[styles.lostPetName, { textAlign: isRTL ? "right" : "left" }]}>{pet.name}</Text>
                      <Text style={[styles.lostPetType, { textAlign: isRTL ? "right" : "left" }]}>
                        {t(`pets.types.${pet.type}`)}
                      </Text>

                      {/* Location */}
                      <View style={[styles.lostPetInfoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        <MapPin size={14} color="#10B981" />
                        <Text
                          style={[styles.lostPetInfoRowText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}
                        >
                          {pet?.lastSeen?.location}
                        </Text>
                      </View>

                      {/* Date */}
                      <View style={[styles.lostPetInfoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        <Calendar size={14} color="#10B981" />
                        <Text
                          style={[styles.lostPetInfoRowText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}
                        >
                          {new Date(pet?.lastSeen?.date).toLocaleDateString("ar-SA")}
                        </Text>
                      </View>

                      {/* Phone */}
                      <View style={[styles.lostPetInfoRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                        <Phone size={14} color="#10B981" />
                        <Text
                          style={[styles.lostPetInfoRowText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}
                        >
                          {pet?.contactInfo?.phone}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Description */}
                  <Text style={[styles.lostPetDescription, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={2}>
                    {pet.description}
                  </Text>

                  {/* Action Buttons */}
                  <View style={[styles.lostPetActions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        console.log(`Show location for lost pet ${pet.id}`);
                        // TODO: Implement map/location functionality
                      }}
                    >
                      <Text style={styles.actionButtonText}>الموقع</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        console.log(`Report found pet ${pet.id}`);
                        // TODO: Implement report found functionality
                      }}
                    >
                      <Text style={styles.actionButtonText}>ابلاغ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.primaryActionButton]}
                      onPress={() => {
                        console.log(`Contact owner for pet ${pet.id}`);
                        // TODO: Implement contact owner functionality
                      }}
                    >
                      <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>اتصال</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </AutoScrollView>
          {userMode !== "veterinarian" && (
            <Button
              title={t("home.reportLostPet")}
              onPress={handleReportLostPet}
              type="outline"
              size="medium"
              style={styles.reportButton}
            />
          )}
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
  header: {
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  rightIcons: {
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -7,
    right: -7,
    backgroundColor: "#10B981",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  userInfoContainer: {
    alignItems: "center",
    gap: 12,
  },
  userTextContainer: {
    alignItems: "flex-start",
  },

  greetingText: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  userNameText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
  },

  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
  },

  advertisementSection: {
    marginBottom: 16,
  },
  adContainer: {
    height: 220,
    marginHorizontal: 16,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  adScrollContent: {
    flexDirection: "row",
  },
  adImageWrapper: {
    width: screenWidth - 32,
    height: 220,
    position: "relative",
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  adTextOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  adTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 6,
    textAlign: "right",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  adSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: "right",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  paginationContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    zIndex: 1,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  paginationDotInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  consultationSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  consultationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultationText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 26,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  consultationButton: {
    width: "100%",
  },
  section: {
    marginBottom: 24,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
  },
  tipCard: {
    width: 264,
  },
  tipContent: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  clinicCard: {
    width: 250,
  },
  clinicInfo: {
    marginTop: 8,
  },
  clinicInfoItem: {
    alignItems: "center",
    marginBottom: 4,
  },
  clinicInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  ratingContainer: {
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  ratingStars: {
    fontSize: 14,
    color: "#FFD700",
  },
  clinicCardNew: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: 320,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clinicCardContent: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  clinicImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  clinicDetails: {
    justifyContent: "flex-start",
  },
  premiumBadgeContainer: {
    marginBottom: 8,
  },
  premiumBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  premiumBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  clinicName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
  },
  clinicInfoRow: {
    alignItems: "center",
    marginBottom: 6,
  },
  clinicInfoRowText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  clinicRatingRow: {
    alignItems: "center",
    marginTop: 4,
  },
  clinicRatingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  clinicActions: {
    justifyContent: "space-between",
    gap: 12,
  },
  clinicActionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  clinicActionButtonText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },
  primaryClinicActionButton: {
    backgroundColor: "#10B981",
  },
  primaryClinicActionButtonText: {
    color: COLORS.white,
  },
  consultationHistoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: 300,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultationHistoryContent: {
    alignItems: "flex-start",
    gap: 14,
  },
  consultationHistoryDetails: {
    flex: 1,
  },
  consultationHistoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 6,
    lineHeight: 22,
  },
  consultationHistoryPet: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
    marginBottom: 6,
  },
  consultationHistoryDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 8,
  },
  consultationHistoryDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  statusContainer: {
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusPending: {
    backgroundColor: COLORS.warning,
  },
  statusAnswered: {
    backgroundColor: COLORS.success,
  },
  statusClosed: {
    backgroundColor: COLORS.darkGray,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  lostPetCard: {
    width: 250,
  },
  lostPetInfo: {
    marginTop: 8,
  },
  lostPetInfoItem: {
    alignItems: "center",
    marginBottom: 4,
  },
  lostPetInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  lostPetDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  lostPetsContainer: {
    paddingHorizontal: 16,
  },
  lostPetCardNew: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: 264,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lostPetCardContent: {
    alignItems: "flex-start",
    marginBottom: 12,
  },
  lostPetImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  lostPetDetails: {
    justifyContent: "flex-start",
  },
  statusBadgeContainer: {
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  lostPetName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  lostPetType: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  lostPetInfoRow: {
    alignItems: "center",
    marginBottom: 4,
  },
  lostPetInfoRowText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  lostPetDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    lineHeight: 18,
    marginBottom: 12,
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderRadius: 6,
  },
  lostPetActions: {
    justifyContent: "space-between",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
  primaryActionButton: {
    backgroundColor: "#10B981",
  },
  primaryActionButtonText: {
    color: COLORS.white,
  },
  reportButton: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  // Article Card Styles
  articleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: 264,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  articleImage: {
    width: "100%",
    height: 120,
  },
  articleContent: {
    padding: 16,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    lineHeight: 22,
  },
  articleDescription: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    lineHeight: 22,
  },
  articleAuthor: {
    alignItems: "center",
    marginBottom: 4,
  },
  articleAuthorText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  articleAuthorTitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  articleStats: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  articleStat: {
    alignItems: "center",
    marginRight: 16,
  },
  articleStatText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  // Book Card Styles
  bookCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: 264,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  bookImage: {
    width: "100%",
    height: 120,
  },
  bookContent: {
    padding: 16,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 6,
    lineHeight: 22,
  },
  bookAuthor: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "600",
    marginBottom: 8,
  },
  bookDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    lineHeight: 18,
    marginBottom: 12,
  },
  bookStats: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bookStat: {
    alignItems: "center",
  },
  bookStatText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  bookPages: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  downloadButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  downloadButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  // Adoption Pet Card Styles
  adoptionPetCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: 300,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adoptionPetCardContent: {
    alignItems: "flex-start",
    marginBottom: 12,
  },
  adoptionPetImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  adoptionPetDetails: {
    justifyContent: "flex-start",
  },
  adoptionBadgeContainer: {
    marginBottom: 8,
  },
  adoptionBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adoptionBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  adoptionPetName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  adoptionPetType: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  adoptionPetInfoRow: {
    alignItems: "center",
    marginBottom: 4,
  },
  adoptionPetInfoRowText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  adoptionPetDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    lineHeight: 18,
    marginBottom: 12,
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderRadius: 6,
  },
  adoptionPetActions: {
    justifyContent: "space-between",
    gap: 8,
  },
  adoptionActionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  adoptionActionButtonText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
  primaryAdoptionActionButton: {
    backgroundColor: "#10B981",
  },
  primaryAdoptionActionButtonText: {
    color: COLORS.white,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeaderWithAdmin: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
  },
  adminActionsCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  seeAllButton: {
    alignItems: "center",
  },
  seeAllTextWithArrow: {
    fontSize: 14,
    color: COLORS.primary,
  },
  adminActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  adminButton: {
    padding: 6,
    borderRadius: 6,
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: COLORS.success || "#28a745",
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  sectionHeaderWithEdit: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderWithCenteredEdit: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAllContainer: {
    alignItems: "center",
  },
  adSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  adSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
});
