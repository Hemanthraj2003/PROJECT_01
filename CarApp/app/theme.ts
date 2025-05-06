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

  // Legacy colors (for backward compatibility)
  primary0: "#FA8B20", // Replaced with golden orange from logo
  primary1: "#F83902", // Replaced with vibrant orange-red from logo
  primary2: "#C96C1A", // Replaced with amber/brown from logo
};

const PRODAPI = "http://103.194.228.71:5000";
const DEVAPI = "http://192.168.0.106:5000";
export default colorThemes;

export { PRODAPI, DEVAPI };
