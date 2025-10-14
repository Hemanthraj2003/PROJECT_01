import 'package:flutter/material.dart';

/// Colors extracted from the Friends Cars logo
/// Main palette: F83902, F74C07, C96C1A, FA8B20
class AppColors {
  // Primary colors from logo
  static const Color primary = Color(0xFFF83902); // Vibrant orange-red
  static const Color primaryDark = Color(0xFFD93000);
  static const Color primaryLight = Color(0xFFFF5A2C);

  // Secondary colors from logo
  static const Color secondary = Color(0xFFF74C07);
  static const Color secondaryDark = Color(0xFFC93D00);
  static const Color secondaryLight = Color(0xFFFF6E33);

  // Accent colors from logo
  static const Color accent1 = Color(0xFFC96C1A); // Amber/brown
  static const Color accent2 = Color(0xFFFA8B20); // Golden orange

  // Neutral colors
  static const Color grey = Color(0xFFA3A3A3);
  static const Color greyLight = Color(0xFFD4D4D4);
  static const Color greyDark = Color(0xFF555555);
  static const Color halfWhite = Color(0xFFF2F2F2);

  // Semantic colors
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFFC107);
  static const Color error = Color(0xFFF44336);
  static const Color info = Color(0xFF2196F3);

  // Text colors
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color textLight = Color(0xFFFFFFFF);

  // Background colors
  static const Color background = Color(0xFFFFFFFF);
  static const Color backgroundLight = Color(0xFFF9F9F9);
  static const Color backgroundDark = Color(0xFFEEEEEE);

  // Gradients
  static const List<Color> gradientPrimary = [primary, accent2];
  static const List<Color> gradientSecondary = [secondary, accent1];
}
