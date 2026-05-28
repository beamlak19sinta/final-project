import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class WebTypography {
  static TextTheme textTheme(TextTheme base) {
    final t = GoogleFonts.interTextTheme(base);
    return t.copyWith(
      headlineLarge: t.headlineLarge?.copyWith(
        fontSize: 30,
        fontWeight: FontWeight.w900,
        letterSpacing: -0.2,
      ),
      headlineSmall: t.headlineSmall?.copyWith(
        fontSize: 20,
        fontWeight: FontWeight.w900,
        letterSpacing: -0.1,
      ),
      titleLarge: t.titleLarge?.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w800,
      ),
      titleMedium: t.titleMedium?.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w800,
      ),
      bodyLarge: t.bodyLarge?.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        height: 1.35,
      ),
      bodyMedium: t.bodyMedium?.copyWith(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        height: 1.35,
      ),
      labelLarge: t.labelLarge?.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w700,
      ),
      labelMedium: t.labelMedium?.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w800,
        letterSpacing: 0.6,
      ),
      labelSmall: t.labelSmall?.copyWith(
        fontSize: 11,
        fontWeight: FontWeight.w700,
      ),
    );
  }

  static String? fontFamily() => GoogleFonts.inter().fontFamily;

  static List<String> fontFamilyFallback() => const ['Noto Sans Ethiopic'];
}

