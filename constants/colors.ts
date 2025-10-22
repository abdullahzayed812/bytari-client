export const COLORS = {
  primary: "#27AE60",
  secondary: "#2196F3",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#F5F5F5",
  darkGray: "#757575",
  lightGray: "#E0E0E0",
  lightBlue: "#E3F2FD",
  error: "#FF5252",
  red: "#FF5252",
  success: "#4CAF50",
  green: "#4CAF50",
  warning: "#FFC107",
  yellow: "#FFC107",
  info: "#2196F3",
  transparent: "transparent",
  overlay: "rgba(0, 0, 0, 0.5)",
  background: "#F8F9FA",
};

export default {
  light: {
    text: COLORS.black,
    background: COLORS.white,
    tint: COLORS.primary,
    tabIconDefault: COLORS.darkGray,
    tabIconSelected: COLORS.primary,
  },
};
