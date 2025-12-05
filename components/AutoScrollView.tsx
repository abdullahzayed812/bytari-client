import React, { useRef, useEffect, useState, useCallback } from "react";
import { ScrollView, NativeScrollEvent, NativeSyntheticEvent, Platform, View } from "react-native";

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
  autoScrollInterval = 3000,
  showsHorizontalScrollIndicator = false,
  contentContainerStyle,
  style,
}: AutoScrollViewProps) {
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
  const [contentOffsetX, setContentOffsetX] = useState(isSingleItem ? 0 : middleSetIndex * itemWidth);

  // Initialize scroll position
  const [isInitialized, setIsInitialized] = useState(false);

  const startAutoScroll = useCallback(() => {
    if (isSingleItem) return; // Don't auto scroll if single item

    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);

    scrollIntervalRef.current = setInterval(() => {
      if (scrollViewRef.current && !isUserScrolling) {
        setContentOffsetX((prevOffset) => {
          const nextOffset = prevOffset + itemWidth;
          scrollViewRef.current?.scrollTo({ x: nextOffset, animated: true });
          return nextOffset;
        });
      }
    }, autoScrollInterval);
  }, [autoScrollInterval, isUserScrolling, itemWidth, isSingleItem]);

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
      // Jump to middle set without animation
      scrollViewRef.current.scrollTo({ x: middleSetIndex * itemWidth, animated: false });
      setContentOffsetX(middleSetIndex * itemWidth);
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

    // Check if we've scrolled past the last set (or close to it)
    if (offsetX >= totalWidth * 2) {
      // Reset to middle set
      const resetOffsetX = offsetX - totalWidth;
      scrollViewRef.current?.scrollTo({ x: resetOffsetX, animated: false });
      setContentOffsetX(resetOffsetX);
    }
    // Check if we've scrolled before the first set
    else if (offsetX < totalWidth) {
      // Reset to middle set
      const resetOffsetX = offsetX + totalWidth;
      scrollViewRef.current?.scrollTo({ x: resetOffsetX, animated: false });
      setContentOffsetX(resetOffsetX);
    } else {
      // Just update local state if needed, but be careful not to cause re-renders loop
      // We mainly use contentOffsetX for the auto-scroll target
      if (!isUserScrolling) {
        // Sync state with actual position if we are auto-scrolling
        // This helps keep the target correct
        if (Math.abs(contentOffsetX - offsetX) > itemWidth) {
          setContentOffsetX(offsetX);
        }
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
        <View key={index} style={{ width: itemWidth }}>
          {child}
        </View>
      ))}
    </ScrollView>
  );
}
