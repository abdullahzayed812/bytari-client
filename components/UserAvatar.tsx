import React from 'react';
import { Image, View, StyleSheet, ImageStyle, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/colors';

interface UserAvatarProps {
  uri?: string | null;
  gender?: 'male' | 'female' | null;
  size?: number;
  style?: ImageStyle | ViewStyle;
}

const DEFAULT_AVATARS = {
  male: 'https://r2-pub.rork.com/generated-images/f12a7eec-1aa3-414d-a6ca-79ff1c250b2f.png',
  female: 'https://r2-pub.rork.com/generated-images/70508295-d0f9-4049-8899-830c9db0ac82.png',
};

export default function UserAvatar({ uri, gender, size = 80, style }: UserAvatarProps) {
  const getAvatarSource = () => {
    if (uri) {
      return { uri };
    }
    
    // Use gender-specific default avatar
    if (gender === 'male') {
      return { uri: DEFAULT_AVATARS.male };
    } else if (gender === 'female') {
      return { uri: DEFAULT_AVATARS.female };
    }
    
    // Default to male avatar if no gender specified
    return { uri: DEFAULT_AVATARS.male };
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={getAvatarSource()}
        style={[styles.avatar, avatarStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});