import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  style?: object;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function NotificationBadge({
  count,
  style,
  size = 'medium',
  color = '#E74C3C'
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <View style={[
      styles.badge,
      styles[size],
      { backgroundColor: color },
      style
    ]}>
      <Text style={[
        styles.badgeText,
        styles[`${size}Text`]
      ]}>
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    minWidth: 20,
  },
  small: {
    height: 16,
    minWidth: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  medium: {
    height: 20,
    minWidth: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  large: {
    height: 24,
    minWidth: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
});