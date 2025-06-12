/**
 * Colors extracted from the customer's logo (assets/images/icon.jpg)
 * Main palette: F83902, F74C07, C96C1A, FA8B20
 */
const colorThemes = {
  // Primary colors from logo
  primary: "#F83902", // Vibrant orange-red - main brand color
  primaryDark: "#D93000", // Darker shade for pressed states
  primaryLight: "#FF5A2C", // Lighter shade for highlights

  // Secondary colors from logo
  secondary: "#F74C07", // Orange - secondary brand color
  secondaryDark: "#C93D00", // Darker shade for pressed states
  secondaryLight: "#FF6E33", // Lighter shade for highlights

  // Accent colors from logo
  accent1: "#C96C1A", // Amber/brown - accent color
  accent2: "#FA8B20", // Golden orange - accent color

  // Neutral colors
  grey: "#a3a3a3",
  greyLight: "#d4d4d4",
  greyDark: "#555555",
  halfWhite: "#F2F2F2",

  // Semantic colors
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  info: "#2196F3",

  // Text colors
  textPrimary: "#212121",
  textSecondary: "#757575",
  textLight: "#FFFFFF",

  // Background colors
  background: "#FFFFFF",
  backgroundLight: "#F9F9F9",
  backgroundDark: "#EEEEEE",

  // Gradients
  gradientPrimary: ["#F83902", "#FA8B20"], // Vibrant orange to golden
  gradientSecondary: ["#F74C07", "#C96C1A"], // Orange to amber/brown

  // Legacy colors (for backward compatibility)
  primary0: "#FA8B20", // Replaced with golden orange from logo
  primary1: "#F83902", // Replaced with vibrant orange-red from logo
  primary2: "#C96C1A", // Replaced with amber/brown from logo
};

// Typography system
export const typography = {
  // Font Families
  fonts: {
    heading: "TitilliumWeb_700Bold",
    bodyBold: "TitilliumWeb_600SemiBold",
    body: "TitilliumWeb_400Regular",
    light: "TitilliumWeb_300Light",
    extraLight: "TitilliumWeb_200ExtraLight",
  },

  // Font Sizes
  sizes: {
    h1: 32,
    h2: 24,
    h3: 20,
    subtitle1: 18,
    subtitle2: 16,
    body1: 16,
    body2: 14,
    caption: 12,
    small: 11,
  },

  // Line Heights
  lineHeights: {
    h1: 40,
    h2: 32,
    h3: 28,
    subtitle1: 24,
    subtitle2: 22,
    body1: 24,
    body2: 20,
    caption: 16,
    small: 14,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// const PRODAPI = "http://103.194.228.71:5000";
// const PRODAPI = "https://2c9f-106-51-217-19.ngrok-free.app";
const PRODAPI = "http://192.168.1.3:5000";
const DEVAPI = "http://192.168.0.106:5000";
export default colorThemes;

export { PRODAPI, DEVAPI };
