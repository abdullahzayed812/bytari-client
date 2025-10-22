import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Text,
  Linking,
  Animated,
  Alert,
  Platform,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { trpc } from "@/lib/trpc";
import { Edit3, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useApp } from "@/providers/AppProvider";
import { useMutation, useQuery } from "@tanstack/react-query";

// Using hardcoded colors for now
const colors = {
  primary: "#27AE60",
  white: "#FFFFFF",
  black: "#000000",
};

const { width: screenWidth } = Dimensions.get("window");

interface Advertisement {
  id: number;
  title: string;
  content?: string | null;
  image?: string | null;
  link?: string | null;
  type: string;
  position?: string | null;
}

interface AdvertisementCarouselProps {
  position?: string;
  type?: "banner" | "popup" | "inline";
  height?: number;
  autoScrollInterval?: number;
  showDots?: boolean;
  showAdminControls?: boolean;
  onAdClick?: (ad: Advertisement) => void;
}

export default function AdvertisementCarousel({
  position = "home",
  type = "banner",
  height = 200,
  autoScrollInterval = 4000,
  showDots = true,
  showAdminControls = false,
  onAdClick,
}: AdvertisementCarouselProps) {
  const router = useRouter();
  const { isSuperAdmin } = useApp();
  const [currentIndex, setCurrentIndex] = useState<number>(1); // Start at 1 for infinite scroll
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [extendedAds, setExtendedAds] = useState<Advertisement[]>([]);
  const panRef = useRef<PanGestureHandler>(null);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackImpressionRef = useRef<Set<number>>(new Set());
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const isTransitioning = useRef(false);
  const isUserInteracting = useRef(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch active advertisements
  const adsQuery = useQuery(
    trpc.admin.ads.getActive.queryOptions(
      {
        position,
        type,
      },
      {
        retry: 1,
        refetchOnWindowFocus: false,
        select: (data) => {
          console.log("📊 Ads query data received:", data);
          if (!data || !Array.isArray(data)) {
            console.log("⚠️ Invalid ads data, returning empty array");
            return [];
          }
          return data;
        },
        initialData: [],
        enabled: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    )
  );

  // Track ad click mutation
  const trackClickMutation = useMutation(trpc.admin.ads.trackClick.mutationOptions());

  // Track ad impression mutation
  const trackImpressionMutation = useMutation(trpc.admin.ads.trackImpression.mutationOptions());

  // Delete ad mutation
  const deleteAdMutation = useMutation(
    trpc.admin.ads.delete.mutationOptions({
      onSuccess: () => {
        adsQuery.refetch();
      },
    })
  );

  useEffect(() => {
    console.log("🔄 AdvertisementCarousel useEffect triggered");
    console.log("📊 adsQuery.data:", adsQuery.data);
    console.log("📊 adsQuery.isError:", adsQuery.isError);
    console.log("📊 adsQuery.error:", adsQuery.error);

    if (adsQuery.isError) {
      console.error("❌ Ads query error:", adsQuery.error);
      setAdvertisements([]);
      setExtendedAds([]);
      setCurrentIndex(1);
      slideAnimation.setValue(-(screenWidth - 32));
      return;
    }

    const safeData = adsQuery.data ?? [];
    const dataArray = Array.isArray(safeData) ? safeData : [];

    if (dataArray.length > 0) {
      const formattedAds = dataArray.map((ad: any) => ({
        ...ad,
        content: ad.content || undefined,
        image: ad.image || undefined,
        link: ad.link || undefined,
        position: ad.position || undefined,
      }));
      console.log("✅ Setting advertisements:", formattedAds);
      setAdvertisements(formattedAds);

      // Create extended array for infinite scroll: [last, ...ads, first]
      if (formattedAds.length > 1) {
        const extended = [
          formattedAds[formattedAds.length - 1], // Last item at beginning
          ...formattedAds,
          formattedAds[0], // First item at end
        ];
        setExtendedAds(extended);
        setCurrentIndex(1); // Start at first real item
        slideAnimation.setValue(-(screenWidth - 32)); // Position at first real item
      } else {
        setExtendedAds(formattedAds);
        setCurrentIndex(0);
        slideAnimation.setValue(0);
      }
    } else {
      console.log("⚠️ Setting empty advertisements array");
      setAdvertisements([]);
      setExtendedAds([]);
      setCurrentIndex(1);
      slideAnimation.setValue(-(screenWidth - 32));
    }
  }, [adsQuery.data, slideAnimation, adsQuery.isError, adsQuery.error]);

  // Track impressions for visible ads
  useEffect(() => {
    if (advertisements.length > 0) {
      // Get the real index (accounting for infinite scroll)
      const realIndex =
        advertisements.length > 1 ? (currentIndex - 1 + advertisements.length) % advertisements.length : currentIndex;

      if (realIndex >= 0 && realIndex < advertisements.length) {
        const currentAd = advertisements[realIndex];
        if (!trackImpressionRef.current.has(currentAd.id)) {
          trackImpressionRef.current.add(currentAd.id);
          trackImpressionMutation.mutate({ adId: currentAd.id });
        }
      }
    }
  }, [currentIndex, advertisements, trackImpressionMutation]);

  const startAutoSlide = useCallback(() => {
    // Clear any existing interval
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }

    // Clear any pending restart timeout
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    // Only start if we have multiple ads and user is not interacting
    if (advertisements.length > 1 && !isUserInteracting.current && !isTransitioning.current) {
      console.log("🔄 AdvertisementCarousel: Starting auto slide");
      autoSlideRef.current = setInterval(() => {
        // Double check conditions before proceeding
        if (isTransitioning.current || isUserInteracting.current) {
          return;
        }

        isTransitioning.current = true;
        const slideWidth = screenWidth - 32;

        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          const targetValue = -nextIndex * slideWidth;

          Animated.timing(slideAnimation, {
            toValue: targetValue,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            // Handle infinite loop
            if (nextIndex >= extendedAds.length - 1) {
              // Jump to first real item without animation
              slideAnimation.setValue(-slideWidth);
              setCurrentIndex(1);
            }
            isTransitioning.current = false;
          });

          return nextIndex;
        });
      }, autoScrollInterval);
    }
  }, [advertisements.length, autoScrollInterval, slideAnimation, extendedAds.length]);

  const stopAutoSlide = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const scheduleAutoSlideRestart = useCallback(() => {
    // Clear any existing timeout
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }

    // Schedule restart after a delay - longer on Android
    const restartDelay = Platform.OS === "android" ? 5000 : 3000;
    restartTimeoutRef.current = setTimeout(() => {
      if (!isUserInteracting.current && !isTransitioning.current) {
        console.log("🔄 AdvertisementCarousel: Restarting auto slide after user interaction");
        startAutoSlide();
      }
    }, restartDelay);
  }, [startAutoSlide]);

  useEffect(() => {
    if (advertisements.length > 1) {
      // Small delay to ensure everything is set up
      const timeoutId = setTimeout(() => {
        if (!isUserInteracting.current && !isTransitioning.current) {
          startAutoSlide();
        }
      }, 500);

      return () => {
        clearTimeout(timeoutId);
        stopAutoSlide();
      };
    }
    return () => stopAutoSlide();
  }, [advertisements, autoScrollInterval, startAutoSlide, stopAutoSlide]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoSlide();
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [stopAutoSlide]);

  const onGestureEvent = (event: any) => {
    const { translationX, state, velocityX } = event.nativeEvent;

    if (state === State.ACTIVE && advertisements.length > 1) {
      const slideWidth = screenWidth - 32;
      const currentOffset = -currentIndex * slideWidth;
      const newValue = currentOffset + translationX;
      slideAnimation.setValue(newValue);
    } else if (state === State.END && advertisements.length > 1) {
      const slideWidth = screenWidth - 32;
      const threshold = slideWidth * 0.25;
      const velocity = Math.abs(velocityX);

      const shouldSwipe = Math.abs(translationX) > threshold || velocity > 800;

      if (shouldSwipe) {
        isTransitioning.current = true;
        let newIndex;

        if (translationX > 0 || velocityX > 800) {
          // Swipe right - go to previous ad
          newIndex = currentIndex - 1;
        } else {
          // Swipe left - go to next ad
          newIndex = currentIndex + 1;
        }

        setCurrentIndex(newIndex);

        // Animate to new position
        const targetValue = -newIndex * slideWidth;
        Animated.timing(slideAnimation, {
          toValue: targetValue,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Handle infinite loop boundaries
          if (newIndex <= 0) {
            // Jump to last real item
            slideAnimation.setValue(-advertisements.length * slideWidth);
            setCurrentIndex(advertisements.length);
          } else if (newIndex >= extendedAds.length - 1) {
            // Jump to first real item
            slideAnimation.setValue(-slideWidth);
            setCurrentIndex(1);
          }
          isTransitioning.current = false;

          // Mark user interaction as ended and schedule restart
          isUserInteracting.current = false;
          scheduleAutoSlideRestart();
        });
      } else {
        // Snap back to current position
        const targetValue = -currentIndex * slideWidth;
        Animated.timing(slideAnimation, {
          toValue: targetValue,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          // Mark user interaction as ended and schedule restart
          isUserInteracting.current = false;
          scheduleAutoSlideRestart();
        });
      }
    }
  };

  const onHandlerStateChange = (event: any) => {
    const { state } = event.nativeEvent;

    if (state === State.BEGAN) {
      // User started interacting - stop auto slide immediately
      console.log("🔄 AdvertisementCarousel: User started gesture");
      isUserInteracting.current = true;
      isTransitioning.current = false; // Reset transitioning state
      stopAutoSlide();
    } else if (state === State.FAILED || state === State.CANCELLED) {
      // Gesture failed or cancelled - restart auto slide
      console.log("🔄 AdvertisementCarousel: Gesture failed/cancelled");
      isUserInteracting.current = false;
      // Add extra delay on Android
      if (Platform.OS === "android") {
        setTimeout(() => {
          scheduleAutoSlideRestart();
        }, 500);
      } else {
        scheduleAutoSlideRestart();
      }
    }
  };

  const handleAdPress = async (ad: Advertisement) => {
    try {
      await trackClickMutation.mutateAsync({ adId: ad.id });
    } catch (error) {
      console.error("Failed to track ad click:", error);
    }

    if (onAdClick) {
      onAdClick(ad);
    } else if (ad.link) {
      try {
        await Linking.openURL(ad.link);
      } catch (error) {
        console.error("Failed to open ad link:", error);
      }
    } else {
      router.push(`/ad-details?id=${ad.id}&position=${position}`);
    }
  };

  const handleEditAd = (ad: Advertisement) => {
    router.push(`/admin-content-manager?type=ads&id=${ad.id}&position=${position}`);
  };

  const handleDeleteAd = (ad: Advertisement) => {
    Alert.alert("حذف الإعلان", "هل أنت متأكد من حذف هذا الإعلان؟", [
      {
        text: "إلغاء",
        style: "cancel",
      },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAdMutation.mutateAsync({ adminId: 1, adId: ad.id });
          } catch (error) {
            console.error("Failed to delete ad:", error);
            Alert.alert("خطأ", "فشل في حذف الإعلان");
          }
        },
      },
    ]);
  };

  if (adsQuery.isLoading) {
    return null;
  }

  if (adsQuery.isError || !advertisements.length) {
    console.log("⚠️ No advertisements to show");
    return null;
  }

  return (
    <View style={[styles.container, { height }]}>
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={Platform.OS === "android" ? [-15, 15] : [-10, 10]}
        failOffsetY={Platform.OS === "android" ? [-40, 40] : [-30, 30]}
        shouldCancelWhenOutside={true}
        enabled={advertisements.length > 1}
        simultaneousHandlers={[]}
        waitFor={[]}
        minPointers={1}
        maxPointers={1}
      >
        <View style={styles.carouselWrapper}>
          <Animated.View
            style={[
              styles.slidesContainer,
              {
                transform: [{ translateX: slideAnimation }],
                width: (screenWidth - 32) * extendedAds.length,
              },
            ]}
          >
            {extendedAds.map((ad, index) => (
              <TouchableOpacity
                key={`${ad.id}-${index}`}
                style={[styles.adContainer, { width: screenWidth - 32 }]}
                onPress={() => handleAdPress(ad)}
                activeOpacity={0.9}
              >
                {ad.image ? (
                  <Image source={{ uri: ad.image || undefined }} style={styles.adImage} resizeMode="cover" />
                ) : (
                  <View style={styles.textAdContainer}>
                    <Text style={styles.adTitle}>{ad.title}</Text>
                    {ad.content && <Text style={styles.adContent}>{ad.content}</Text>}
                  </View>
                )}

                {/* Overlay for text on image ads */}
                {ad.image && (ad.title || ad.content) && (
                  <View style={styles.textOverlay}>
                    {ad.title && <Text style={styles.overlayTitle}>{ad.title}</Text>}
                    {ad.content && <Text style={styles.overlayContent}>{ad.content}</Text>}
                  </View>
                )}

                {/* Admin Controls */}
                {showAdminControls && isSuperAdmin && (
                  <View style={styles.adminControls}>
                    <TouchableOpacity
                      style={[styles.adminControlButton, styles.editControlButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleEditAd(ad);
                      }}
                    >
                      <Edit3 size={16} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.adminControlButton, styles.deleteControlButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteAd(ad);
                      }}
                    >
                      <Trash2 size={16} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      </PanGestureHandler>

      {/* Pagination Dots */}
      {showDots && advertisements.length > 1 && (
        <View style={styles.paginationContainer}>
          {advertisements.map((_, index) => {
            // Calculate real active index for dots
            const realActiveIndex =
              advertisements.length > 1
                ? (currentIndex - 1 + advertisements.length) % advertisements.length
                : currentIndex;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paginationDot,
                  index === realActiveIndex ? styles.paginationDotActive : styles.paginationDotInactive,
                ]}
                onPress={() => {
                  // Stop auto slide and mark user interaction
                  console.log("🔄 AdvertisementCarousel: Dot pressed, stopping auto slide");
                  isUserInteracting.current = true;
                  isTransitioning.current = false;
                  stopAutoSlide();

                  const targetIndex = index + 1; // Account for extended array
                  setCurrentIndex(targetIndex);
                  const slideWidth = screenWidth - 32;
                  const targetValue = -targetIndex * slideWidth;

                  isTransitioning.current = true;
                  Animated.timing(slideAnimation, {
                    toValue: targetValue,
                    duration: 300,
                    useNativeDriver: true,
                  }).start(() => {
                    isTransitioning.current = false;
                    isUserInteracting.current = false;
                    scheduleAutoSlideRestart();
                  });
                }}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginHorizontal: 16,
    position: "relative",
  },
  carouselWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  slidesContainer: {
    flexDirection: "row",
    height: "100%",
  },
  adContainer: {
    height: "100%",
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  textAdContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    marginBottom: 8,
  },
  adContent: {
    fontSize: 14,
    color: colors.white,
    textAlign: "center",
    lineHeight: 20,
  },
  textOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    marginBottom: 4,
  },
  overlayContent: {
    fontSize: 12,
    color: colors.white,
    textAlign: "center",
    lineHeight: 18,
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
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  paginationDotInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  adminControls: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  adminControlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  editControlButton: {
    backgroundColor: colors.primary,
  },
  deleteControlButton: {
    backgroundColor: "#EF4444",
  },
});
