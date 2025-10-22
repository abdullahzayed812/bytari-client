// RTL initialization - this should be imported at the very beginning of the app
import { I18nManager } from 'react-native';

// Force RTL layout for Arabic language support
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}

export {};
