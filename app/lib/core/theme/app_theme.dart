import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_typography.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        error: AppColors.error,
        background: AppColors.background,
        surface: AppColors.background,
      ),
      scaffoldBackgroundColor: AppColors.backgroundLight,

      // App Bar Theme
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textLight,
        elevation: 4,
        centerTitle: false,
        titleTextStyle: AppTypography.h3Style(color: AppColors.textLight),
      ),

      // Card Theme
      cardTheme: CardThemeData(
        color: AppColors.background,
        elevation: 4,
        shadowColor: AppColors.primary.withOpacity(0.1),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),

      // Elevated Button Theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.textLight,
          elevation: 4,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: AppTypography.subtitle2Style(),
        ),
      ),

      // Text Button Theme
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: AppTypography.subtitle2Style(),
        ),
      ),

      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.background,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.greyLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.greyLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.error),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        labelStyle: AppTypography.body1Style(color: AppColors.textSecondary),
        hintStyle: AppTypography.body2Style(color: AppColors.grey),
      ),

      // Bottom Navigation Bar Theme
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: AppColors.background,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.greyDark,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: AppTypography.captionStyle(),
        unselectedLabelStyle: AppTypography.captionStyle(),
      ),

      // Text Theme
      textTheme: TextTheme(
        displayLarge: AppTypography.h1Style(color: AppColors.textPrimary),
        displayMedium: AppTypography.h2Style(color: AppColors.textPrimary),
        displaySmall: AppTypography.h3Style(color: AppColors.textPrimary),
        titleLarge: AppTypography.subtitle1Style(color: AppColors.textPrimary),
        titleMedium: AppTypography.subtitle2Style(color: AppColors.textPrimary),
        bodyLarge: AppTypography.body1Style(color: AppColors.textPrimary),
        bodyMedium: AppTypography.body2Style(color: AppColors.textPrimary),
        bodySmall: AppTypography.captionStyle(color: AppColors.textSecondary),
        labelSmall: AppTypography.smallStyle(color: AppColors.textSecondary),
      ),

      // Icon Theme
      iconTheme: IconThemeData(color: AppColors.textSecondary, size: 24),
    );
  }
}
