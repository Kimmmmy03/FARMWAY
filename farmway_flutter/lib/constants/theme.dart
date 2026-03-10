import 'package:flutter/material.dart';

class AppColors {
  static const primary = Color(0xFF1A6335);
  static const primaryDark = Color(0xFF0D4B25);
  static const primaryLight = Color(0xFF2E8B57);
  static const accent = Color(0xFFF5A623);
  static const accentLight = Color(0xFFFFC857);
  static const background = Color(0xFFF8FAF9);
  static const surface = Colors.white;
  static const surfaceAlt = Color(0xFFF0F5F2);
  static const textPrimary = Color(0xFF1A1A2E);
  static const textSecondary = Color(0xFF4A5568);
  static const textMuted = Color(0xFF9CA3AF);
  static const teal = Color(0xFF1B5E5B);
  static const tealMid = Color(0xFF2B7A78);
  static const tealLight = Color(0xFF3AAFA9);
  static const error = Color(0xFFE53E3E);
  static const success = Color(0xFF38A169);
  static const cardShadow = Color(0x0A000000);
}

class AppTheme {
  static ThemeData get theme => ThemeData(
        primaryColor: AppColors.primary,
        scaffoldBackgroundColor: AppColors.background,
        fontFamily: 'Roboto',
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          secondary: AppColors.accent,
          surface: AppColors.surface,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          foregroundColor: AppColors.textPrimary,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 22,
            fontWeight: FontWeight.w700,
          ),
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.grey.shade100),
          ),
          color: AppColors.surface,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 52),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Colors.white,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.textMuted,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          selectedLabelStyle: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          unselectedLabelStyle: TextStyle(fontSize: 12),
        ),
      );
}
