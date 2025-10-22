import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { COLORS } from '@/constants/colors';
import { useI18n } from '@/providers/I18nProvider';

interface CardProps {
  title: string;
  subtitle?: string;
  image?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  style?: object;
}

export default function Card({
  title,
  subtitle,
  image,
  onPress,
  children,
  footer,
  style,
}: CardProps) {
  const { isRTL } = useI18n();
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}>{subtitle}</Text>}
        {children && <View style={styles.children}>{children}</View>}
      </View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  children: {
    marginTop: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    padding: 12,
  },
});