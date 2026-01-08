import React, { useRef, useEffect, useState, useCallback } from "react";
import { ScrollView, NativeScrollEvent, NativeSyntheticEvent, Platform, View } from "react-native";
import { useI18n } from "@/providers/I18nProvider";

interface AutoScrollViewProps {
  children: React.ReactNode;
  itemWidth: number;
  autoScrollInterval?: number;
  showsHorizontalScrollIndicator?: boolean;
  contentContainerStyle?: any;
  style?: any;
}

export default function AutoScrollView({
  children,
  itemWidth,
  autoScrollInterval = 5000,
  showsHorizontalScrollIndicator = false,
  contentContainerStyle,
  style,
}: AutoScrollViewProps) {
  const { isRTL } = useI18n();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Convert children to array
  const childrenArray = React.Children.toArray(children);
  const originalCount = childrenArray.length;
  const isSingleItem = originalCount <= 1;

  // Duplicate items for infinite scroll effect: [Original, Original, Original]
  // We start at the middle set
  // If single item, don't duplicate
  const data = isSingleItem ? childrenArray : [...childrenArray, ...childrenArray, ...childrenArray];
  const middleSetIndex = originalCount;

  // Initial scroll position (start of middle set)
  const [contentOffsetX, setContentOffsetX] = useState(
    isSingleItem ? 0 : (isRTL ? data.length - (originalCount + 1) : middleSetIndex) * itemWidth
  );

  // Initialize scroll position
  const [isInitialized, setIsInitialized] = useState(false);

  const startAutoScroll = useCallback(() => {
    if (isSingleItem) return; // Don't auto scroll if single item

    stopAutoScroll(); // Clear any existing interval

    scrollIntervalRef.current = setInterval(() => {
      if (scrollViewRef.current && !isUserScrolling) {
        setContentOffsetX((prevOffset) => {
          const nextOffset = isRTL ? prevOffset - itemWidth : prevOffset + itemWidth;
          scrollViewRef.current?.scrollTo({ x: nextOffset, animated: true });
          return nextOffset;
        });
      }
    }, autoScrollInterval);
  }, [autoScrollInterval, isUserScrolling, itemWidth, isSingleItem, isRTL, stopAutoScroll]);

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isInitialized && !isUserScrolling && !isSingleItem) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [isInitialized, isUserScrolling, startAutoScroll, stopAutoScroll, isSingleItem]);

  const handleLayout = () => {
    if (isSingleItem) {
      setIsInitialized(true);
      return;
    }

    if (!isInitialized && scrollViewRef.current) {
      // Jump to middle set without animation, accounting for RTL
      const initialScrollX = isRTL ? data.length - (originalCount + 1) : middleSetIndex * itemWidth;
      scrollViewRef.current.scrollTo({ x: initialScrollX, animated: false });
      setContentOffsetX(initialScrollX);
      setIsInitialized(true);
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isSingleItem) return;

    const offsetX = event.nativeEvent.contentOffset.x;

    // If we are not scrolling (just tracking position), update our ref
    // But we need to handle the infinite loop reset

    const totalWidth = originalCount * itemWidth;
    const threshold = itemWidth / 2;

    if (isRTL) {
      // RTL: offsetX decreases as we scroll to the "next" item (visually right)
      // If we've scrolled past the first set (too far right, offsetX is too small)
      if (offsetX <= totalWidth / 2) {
        // Scrolled near the start of the first copy
        const resetOffsetX = offsetX + totalWidth;
        scrollViewRef.current?.scrollTo({ x: resetOffsetX, animated: false });
        setContentOffsetX(resetOffsetX);
      }
      // If we've scrolled past the last set (too far left, offsetX is too large)
      else if (offsetX >= totalWidth * 2.5) {
        // Scrolled near the end of the last copy
        const resetOffsetX = offsetX - totalWidth;
        scrollViewRef.current?.scrollTo({ x: resetOffsetX, animated: false });
        setContentOffsetX(resetOffsetX);
      }
    } else {
      // LTR: offsetX increases as we scroll to the "next" item (visually left)
      if (offsetX >= totalWidth * 2) {
        const resetOffsetX = offsetX - totalWidth;
        scrollViewRef.current?.scrollTo({ x: resetOffsetX, animated: false });
        setContentOffsetX(resetOffsetX);
      } else if (offsetX < totalWidth) {
        const resetOffsetX = offsetX + totalWidth;
        scrollViewRef.current?.scrollTo({ x: resetOffsetX, animated: false });
        setContentOffsetX(resetOffsetX);
      }
    }
  };

  const onScrollBeginDrag = () => {
    setIsUserScrolling(true);
    stopAutoScroll();
  };

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsUserScrolling(false);
    // Update our offset tracker to where the user left it
    setContentOffsetX(event.nativeEvent.contentOffset.x);
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsUserScrolling(false);
    setContentOffsetX(event.nativeEvent.contentOffset.x);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      contentContainerStyle={contentContainerStyle}
      style={style}
      pagingEnabled={false}
      snapToInterval={itemWidth}
      decelerationRate="fast"
      bounces={false}
      onLayout={handleLayout}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
      onMomentumScrollEnd={onMomentumScrollEnd}
    >
      {data.map((child, index) => (
        <View key={index}>{child}</View>
      ))}
    </ScrollView>
  );
}
