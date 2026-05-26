import 'package:flutter/material.dart';
import 'colors.dart';
import 'typography.dart';

class AppTheme {
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 24;
  static const double radiusXl = 32;
  static const double radius2xl = 40;

  static const double space2 = 8;
  static const double space4 = 16;
  static const double space6 = 24;
  static const double space8 = 32;

  static ThemeData webLight() {
    final colorScheme = const ColorScheme.light(
      primary: WebColors.primary,
      onPrimary: WebColors.primaryForeground,
      secondary: WebColors.secondary,
      onSecondary: WebColors.secondaryForeground,
      error: WebColors.destructive,
      onError: WebColors.destructiveForeground,
      surface: WebColors.background,
      onSurface: WebColors.foreground,
      outline: WebColors.border,
    );

    final base = ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: WebColors.background,
      fontFamily: WebTypography.fontFamily(),
      fontFamilyFallback: WebTypography.fontFamilyFallback(),
    );

    final textTheme = WebTypography.textTheme(base.textTheme).apply(
      bodyColor: WebColors.foreground,
      displayColor: WebColors.foreground,
    );

    return base.copyWith(
      textTheme: textTheme,
      primaryTextTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: WebColors.background.withValues(alpha: 0.60),
        foregroundColor: WebColors.foreground,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: textTheme.titleLarge?.copyWith(
          fontWeight: FontWeight.w900,
          color: WebColors.foreground,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: WebColors.border,
        thickness: 1,
        space: 24,
      ),
      cardTheme: CardThemeData(
        color: WebColors.background,
        elevation: 1,
        shadowColor: Colors.black.withValues(alpha: 0.08),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusLg),
          side: const BorderSide(color: WebColors.border, width: 1),
        ),
        margin: const EdgeInsets.symmetric(vertical: 8),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: false,
        hintStyle: textTheme.bodyMedium?.copyWith(
          color: WebColors.mutedForeground.withValues(alpha: 0.50),
          fontWeight: FontWeight.w600,
        ),
        prefixIconColor: WebColors.mutedForeground.withValues(alpha: 0.50),
        suffixIconColor: WebColors.mutedForeground.withValues(alpha: 0.70),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMd),
          borderSide: const BorderSide(color: WebColors.input, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMd),
          borderSide: const BorderSide(color: WebColors.input, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMd),
          borderSide: const BorderSide(color: WebColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMd),
          borderSide: const BorderSide(color: WebColors.destructive, width: 1),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMd),
          borderSide: const BorderSide(color: WebColors.destructive, width: 2),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: WebColors.primary,
          foregroundColor: WebColors.primaryForeground,
          minimumSize: const Size.fromHeight(44),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusMd),
          ),
          textStyle: textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w800),
        ).copyWith(
          overlayColor: WidgetStateProperty.resolveWith<Color?>(
            (states) => states.contains(WidgetState.pressed)
                ? Colors.white.withValues(alpha: 0.10)
                : null,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: WebColors.foreground,
          minimumSize: const Size.fromHeight(44),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusMd),
          ),
          side: const BorderSide(color: WebColors.border, width: 2),
          textStyle: textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w800),
        ).copyWith(
          overlayColor: WidgetStateProperty.resolveWith<Color?>(
            (states) => states.contains(WidgetState.pressed)
                ? WebColors.accent.withValues(alpha: 0.30)
                : null,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: WebColors.primary,
          textStyle: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w800),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 72,
        backgroundColor: WebColors.background,
        indicatorColor: WebColors.primary.withValues(alpha: 0.10),
        labelTextStyle: WidgetStateProperty.resolveWith<TextStyle?>(
          (states) {
            final selected = states.contains(WidgetState.selected);
            return textTheme.labelSmall?.copyWith(
              fontWeight: selected ? FontWeight.w900 : FontWeight.w700,
              color: selected ? WebColors.primary : WebColors.mutedForeground,
            );
          },
        ),
        iconTheme: WidgetStateProperty.resolveWith<IconThemeData?>(
          (states) {
            final selected = states.contains(WidgetState.selected);
            return IconThemeData(
              size: 24,
              color: selected ? WebColors.primary : WebColors.mutedForeground,
            );
          },
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: WebColors.foreground,
        contentTextStyle: textTheme.bodyMedium?.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w700,
        ),
        behavior: SnackBarBehavior.floating,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusMd),
        ),
      ),
    );
  }
}

