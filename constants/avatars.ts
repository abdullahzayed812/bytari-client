// Default gender avatars
export const DEFAULT_AVATARS = {
  male: 'https://r2-pub.rork.com/generated-images/41859133-7e33-447d-9f6e-5a5ebffa949e.png',
  female: 'https://r2-pub.rork.com/generated-images/3e3c4777-95b3-4663-87cb-f730ec8fbe1a.png',
};

// Function to get default avatar based on gender
export const getDefaultAvatar = (gender?: 'male' | 'female' | string): string => {
  if (gender === 'male') {
    return DEFAULT_AVATARS.male;
  } else if (gender === 'female') {
    return DEFAULT_AVATARS.female;
  }
  // Default to male if no gender specified
  return DEFAULT_AVATARS.male;
};

// Function to get avatar with fallback
export const getAvatarSource = (avatar?: string, gender?: 'male' | 'female' | string): string => {
  if (avatar && avatar.trim() !== '') {
    return avatar;
  }
  return getDefaultAvatar(gender);
};