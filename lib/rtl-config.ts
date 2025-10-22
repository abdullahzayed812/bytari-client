import { I18nManager } from 'react-native';

export function configureRTL() {
  // Ensure RTL is enabled for Arabic UI
  if (!I18nManager.isRTL) {
    I18nManager.forceRTL(true);
  }
}

export function isRTL() {
  return I18nManager.isRTL;
}

export function getTextAlign(isRTL: boolean = true) {
  return isRTL ? 'right' : 'left';
}

export function getFlexDirection(isRTL: boolean = true) {
  return isRTL ? 'row-reverse' : 'row';
}

export function getMarginStart(value: number, isRTL: boolean = true) {
  return isRTL ? { marginRight: value } : { marginLeft: value };
}

export function getMarginEnd(value: number, isRTL: boolean = true) {
  return isRTL ? { marginLeft: value } : { marginRight: value };
}

export function getPaddingStart(value: number, isRTL: boolean = true) {
  return isRTL ? { paddingRight: value } : { paddingLeft: value };
}

export function getPaddingEnd(value: number, isRTL: boolean = true) {
  return isRTL ? { paddingLeft: value } : { paddingRight: value };
}
