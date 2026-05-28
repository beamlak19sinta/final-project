import 'package:flutter/material.dart';

/// Professional fintech/government service design system
class AppTheme {
  AppTheme._();

  // ======================== Spacing System ========================
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double xxxl = 32;

  // ======================== Radius System ========================
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;
  static const double radiusXl = 20;
  static const double radiusMax = 24;

  // ======================== Elevation System ========================
  static const double elevationSm = 1;
  static const double elevationMd = 2;
  static const double elevationLg = 4;
  static const double elevationXl = 8;

  // ======================== Animation Durations ========================
  static const Duration durationFast = Duration(milliseconds: 150);
  static const Duration durationNormal = Duration(milliseconds: 300);
  static const Duration durationSlow = Duration(milliseconds: 500);

  // ======================== Theme Data ========================
  static ThemeData createTheme({
    required ColorScheme colorScheme,
    required TextTheme baseTextTheme,
    required String? fontFamily,
    required List<String>? fontFamilyFallback,
    required bool isAndroid,
  }) {
    final textTheme = baseTextTheme.apply(
      bodyColor: colorScheme.onSurface,
      displayColor: colorScheme.onSurface,
    );

    return ThemeData(
      colorScheme: colorScheme,
      useMaterial3: true,
      textTheme: textTheme,
      primaryTextTheme: textTheme,
      fontFamily: fontFamily,
      fontFamilyFallback: fontFamilyFallback,
      scaffoldBackgroundColor: colorScheme.surface,

      // ======================== App Bar ========================
      appBarTheme: AppBarTheme(
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
        centerTitle: false,
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
      ),

      // ======================== Card Theme ========================
      cardTheme: CardThemeData(
        elevation: 0,
        color: colorScheme.surface,
        shadowColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusMax),
          side: BorderSide(
            color: colorScheme.outline,
            width: 1.0,
          ),
        ),
        margin: const EdgeInsets.symmetric(vertical: md),
      ),

      // ======================== Input Decoration ========================
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colorScheme.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusSm),
          borderSide: BorderSide(
            color: colorScheme.outline,
            width: 1.0,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusSm),
          borderSide: BorderSide(
            color: colorScheme.outline,
            width: 1.0,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusSm),
          borderSide: BorderSide(color: colorScheme.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusSm),
          borderSide: BorderSide(color: colorScheme.error, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: lg,
          vertical: lg,
        ),
        prefixIconColor: WidgetStateColor.resolveWith((states) {
          if (states.contains(WidgetState.focused)) {
            return colorScheme.primary;
          }
          return Colors.grey.shade600;
        }),
        suffixIconColor: WidgetStateColor.resolveWith((states) {
          if (states.contains(WidgetState.focused)) {
            return colorScheme.primary;
          }
          return Colors.grey.shade600;
        }),
      ),

      // ======================== Filled Button Theme ========================
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: lg, vertical: lg),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusSm),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
          elevation: 0,
        ),
      ),

      // ======================== Outlined Button Theme ========================
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: lg, vertical: lg),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusSm),
          ),
          side: BorderSide(color: colorScheme.primary, width: 1.5),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
          elevation: 0,
        ),
      ),

      // ======================== Text Button Theme ========================
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: md, vertical: md),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusSm),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ),

      // ======================== Navigation Bar ========================
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 8,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => TextStyle(
            fontWeight: states.contains(WidgetState.selected)
                ? FontWeight.w700
                : FontWeight.w600,
            fontSize: 11,
            color: states.contains(WidgetState.selected)
                ? colorScheme.primary
                : Colors.grey.shade700,
          ),
        ),
        indicatorColor: colorScheme.primary.withValues(alpha: 0.12),
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            color: states.contains(WidgetState.selected)
                ? colorScheme.primary
                : Colors.grey.shade700,
          ),
        ),
      ),

      // ======================== Page Transitions ========================
      pageTransitionsTheme: PageTransitionsTheme(
        builders: {
          if (isAndroid)
            TargetPlatform.android: const FadeUpwardsPageTransitionsBuilder(),
        },
      ),

      // ======================== Snack Bar ========================
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusLg),
        ),
        elevation: elevationXl,
      ),

      // ======================== Dialog ========================
      dialogTheme: DialogThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusLg),
        ),
        elevation: elevationXl,
        surfaceTintColor: Colors.transparent,
      ),

      // ======================== Checkbox ========================
      checkboxTheme: CheckboxThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusSm),
        ),
        side: const BorderSide(width: 2),
      ),

      // ======================== Chip ========================
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusMd),
        ),
        showCheckmark: true,
        selectedColor: colorScheme.primary.withValues(alpha: 0.2),
        disabledColor: Colors.grey.withValues(alpha: 0.1),
      ),
    );
  }
}

/// Color constants for the app
class AppColors {
  AppColors._();

  // Ethiopian flag colors (primaries)
  static const Color ethiopianGreen = Color(0xFF009A44);
  static const Color ethiopianYellow = Color(0xFFFCD116);
  static const Color ethiopianRed = Color(0xFFCE1126);
  static const Color primaryBlue = Color(0xFF0B2C4A);

  // Neutrals
  static const Color darkGrey = Color(0xFF1F2937);
  static const Color mediumGrey = Color(0xFF6B7280);
  static const Color lightGrey = Color(0xFFF3F4F6);
  static const Color veryLightGrey = Color(0xFFF8FAFC);

  // Status colors
  static const Color statusPending = Color(0xFFEAB308);
  static const Color statusScheduled = Color(0xFF3B82F6);
  static const Color statusCompleted = Color(0xFF009A44);
  static const Color statusCancelled = Color(0xFFEF4444);
  static const Color statusRejected = Color(0xFFDC2626);

  // Semantic colors
  static const Color success = Color(0xFF009A44);
  static const Color warning = Color(0xFFFCD116);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
}

/// Gradients for the app
class AppGradients {
  AppGradients._();

  static LinearGradient primaryGradient = const LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.ethiopianGreen, Color(0xFF007A35)],
  );

  static LinearGradient secondaryGradient = const LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.ethiopianYellow, Color(0xFFFFC400)],
  );

  static LinearGradient successGradient = const LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.success, Color(0xFF059669)],
  );

  static LinearGradient errorGradient = const LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.error, Color(0xFFDC2626)],
  );

  static LinearGradient infoGradient = const LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.info, Color(0xFF1D4ED8)],
  );
}
