import React, { useRef, useEffect, useState, ReactNode } from "react";
import { ScrollView, NativeScrollEvent, NativeSyntheticEvent, Platform } from "react-native";

interface AutoScrollViewProps {
  children: ReactNode;
  itemWidth: number;
  autoScrollInterval?: number;
  showsHorizontalScrollIndicator?: boolean;
  contentContainerStyle?: any;
  style?: any;
  onItemPress?: (index: number) => void;
}

export default function AutoScrollView({
  children,
  itemWidth,
  autoScrollInterval = 3000,
  showsHorizontalScrollIndicator = false,
  contentContainerStyle,
  style,
  onItemPress,
}: AutoScrollViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);
  const isTransitioning = useRef(false);

  // Convert children to array to get count
  const childrenArray = React.Children.toArray(children);
  const itemCount = childrenArray.length;

  // Create duplicated content for infinite scroll
  const duplicatedChildren = [...childrenArray, ...childrenArray, ...childrenArray];

  const startAutoScroll = React.useCallback(() => {
    // Clear any existing interval
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }

    // Clear any pending restart timeout
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    // Only start if conditions are met
    if (!isUserScrolling && !isTransitioning.current && itemCount > 1) {
      autoScrollRef.current = setInterval(() => {
        // Double check conditions before proceeding
        if (isUserScrolling || isTransitioning.current) {
          return;
        }

        isTransitioning.current = true;
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          const scrollX = (itemCount + nextIndex) * itemWidth;

          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
          }

          // Reset transitioning flag after animation
          setTimeout(() => {
            isTransitioning.current = false;
          }, 300);

          return nextIndex % itemCount;
        });
      }, autoScrollInterval);
    }
  }, [isUserScrolling, itemCount, itemWidth, autoScrollInterval]);

  const stopAutoScroll = React.useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const scheduleAutoScrollRestart = React.useCallback(() => {
    // Clear any existing timeout
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }

    // Schedule restart after a delay - longer on Android
    const restartDelay = Platform.OS === "android" ? 5000 : 3000;
    restartTimeoutRef.current = setTimeout(() => {
      if (!isUserScrolling && !isTransitioning.current && itemCount > 1) {
        console.log("🔄 AutoScrollView: Restarting auto scroll after user interaction");
        startAutoScroll();
      }
    }, restartDelay);
  }, [startAutoScroll, isUserScrolling, itemCount]);

  useEffect(() => {
    if (itemCount > 1) {
      // Start from the middle set to enable infinite scrolling
      const initialScrollX = itemCount * itemWidth;
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: initialScrollX, animated: false });
        }
      }, 100);

      // Start auto scroll with a delay
      const timeoutId = setTimeout(() => {
        if (!isUserScrolling && !isTransitioning.current) {
          startAutoScroll();
        }
      }, 500);

      return () => {
        clearTimeout(timeoutId);
        stopAutoScroll();
      };
    }

    return () => stopAutoScroll();
  }, [itemCount, itemWidth, autoScrollInterval, startAutoScroll, stopAutoScroll, isUserScrolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoScroll();
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [stopAutoScroll]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    const index = Math.round(contentOffset.x / itemWidth);

    // Handle infinite scroll reset only if not user scrolling
    if (!isUserScrolling) {
      if (index >= itemCount * 2) {
        // Reset to beginning of middle set
        setTimeout(() => {
          if (scrollViewRef.current && !isUserScrolling) {
            scrollViewRef.current.scrollTo({ x: itemCount * itemWidth, animated: false });
          }
        }, 100);
      } else if (index < itemCount) {
        // Reset to end of middle set
        setTimeout(() => {
          if (scrollViewRef.current && !isUserScrolling) {
            scrollViewRef.current.scrollTo({ x: (itemCount * 2 - 1) * itemWidth, animated: false });
          }
        }, 100);
      }
    }

    const actualIndex = index % itemCount;
    if (actualIndex !== currentIndex) {
      setCurrentIndex(actualIndex);
    }
  };

  const handleScrollBeginDrag = () => {
    console.log("🔄 AutoScrollView: User started scrolling");
    setIsUserScrolling(true);
    isTransitioning.current = false; // Reset transitioning state
    stopAutoScroll();
  };

  const handleScrollEndDrag = () => {
    console.log("🔄 AutoScrollView: User ended scrolling");
    // Don't immediately set to false, wait for momentum to end
    // This prevents conflicts on Android
    if (Platform.OS === "android") {
      // On Android, wait longer before restarting auto-scroll
      setTimeout(() => {
        setIsUserScrolling(false);
        scheduleAutoScrollRestart();
      }, 500);
    } else {
      setIsUserScrolling(false);
      scheduleAutoScrollRestart();
    }
  };

  const handleMomentumScrollBegin = () => {
    // console.log('🔄 AutoScrollView: Momentum scroll began');
    setIsUserScrolling(true);
    stopAutoScroll();
  };

  const handleMomentumScrollEnd = () => {
    // console.log('🔄 AutoScrollView: Momentum scroll ended');
    setIsUserScrolling(false);
    // Add extra delay on Android to prevent conflicts
    if (Platform.OS === "android") {
      setTimeout(() => {
        scheduleAutoScrollRestart();
      }, 300);
    } else {
      scheduleAutoScrollRestart();
    }
  };

  if (itemCount === 0) {
    return null;
  }

  if (itemCount === 1) {
    // If only one item, don't auto-scroll
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        contentContainerStyle={contentContainerStyle}
        style={style}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled={false}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      onScroll={handleScroll}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollBegin={handleMomentumScrollBegin}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      scrollEventThrottle={Platform.OS === "android" ? 32 : 16}
      contentContainerStyle={contentContainerStyle}
      style={style}
      decelerationRate={Platform.OS === "android" ? "normal" : "fast"}
      snapToInterval={itemWidth}
      snapToAlignment="start"
      removeClippedSubviews={Platform.OS === "android"}
      overScrollMode="never"
      nestedScrollEnabled={false}
    >
      {duplicatedChildren.map((child, index) =>
        React.cloneElement(child as React.ReactElement, {
          key: `auto-scroll-${index}`,
        })
      )}
    </ScrollView>
  );
}
