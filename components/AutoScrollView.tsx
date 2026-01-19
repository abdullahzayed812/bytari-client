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
  const currentScrollPos = useRef(0);

  // Convert children to array
  const childrenArray = React.Children.toArray(children);
  const originalCount = childrenArray.length;
  const isSingleItem = originalCount <= 1;

  // Duplicate items for infinite scroll: [Original, Original, Original]
  const data = isSingleItem ? childrenArray : [...childrenArray, ...childrenArray, ...childrenArray];
  const totalWidth = originalCount * itemWidth;

  // Initialize scroll position
  const [isInitialized, setIsInitialized] = useState(false);

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    if (isSingleItem) return;

    stopAutoScroll();

    scrollIntervalRef.current = setInterval(() => {
      if (scrollViewRef.current && !isUserScrolling) {
        currentScrollPos.current += itemWidth;
        scrollViewRef.current.scrollTo({ x: currentScrollPos.current, animated: true });
      }
    }, autoScrollInterval);
  }, [autoScrollInterval, isUserScrolling, itemWidth, isSingleItem, stopAutoScroll]);

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
      // Start at the beginning of the middle set
      const initialScrollX = totalWidth;
      currentScrollPos.current = initialScrollX;
      scrollViewRef.current.scrollTo({ x: initialScrollX, animated: false });
      setIsInitialized(true);
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isSingleItem) return;

    const offsetX = event.nativeEvent.contentOffset.x;

    // When we scroll past the second set, jump back to the middle set
    // This creates the infinite loop effect
    if (offsetX >= totalWidth * 2) {
      const newOffset = offsetX - totalWidth;
      currentScrollPos.current = newOffset;
      scrollViewRef.current?.scrollTo({ x: newOffset, animated: false });
    }
    // If user scrolls backwards past the first set, jump forward
    else if (offsetX < totalWidth) {
      const newOffset = offsetX + totalWidth;
      currentScrollPos.current = newOffset;
      scrollViewRef.current?.scrollTo({ x: newOffset, animated: false });
    } else {
      currentScrollPos.current = offsetX;
    }
  };

  const onScrollBeginDrag = () => {
    setIsUserScrolling(true);
    stopAutoScroll();
  };

  const onScrollEndDrag = () => {
    // Let momentum finish before resuming auto-scroll
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isSingleItem) return;

    const offsetX = event.nativeEvent.contentOffset.x;

    // Update our current position tracker
    currentScrollPos.current = offsetX;

    // Reset if needed after momentum ends
    if (offsetX >= totalWidth * 2) {
      const newOffset = offsetX - totalWidth;
      currentScrollPos.current = newOffset;
      scrollViewRef.current?.scrollTo({ x: newOffset, animated: false });
    } else if (offsetX < totalWidth) {
      const newOffset = offsetX + totalWidth;
      currentScrollPos.current = newOffset;
      scrollViewRef.current?.scrollTo({ x: newOffset, animated: false });
    }

    // Resume auto-scroll
    setIsUserScrolling(false);
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
        <View key={`${index}`} style={{ width: itemWidth }}>
          {child}
        </View>
      ))}
    </ScrollView>
  );
}
