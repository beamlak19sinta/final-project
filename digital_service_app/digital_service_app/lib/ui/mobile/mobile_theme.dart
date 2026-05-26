import 'package:flutter/material.dart';

/// Android-only visual polish.
///
/// IMPORTANT: This is intentionally applied ONLY on Android (and never on Web),
/// to keep the web UI fully unchanged.
class MobileTheme {
  static ThemeData build({
    required ThemeData base,
    required ColorScheme colorScheme,
  }) {
    // Start from base to preserve the existing web-like look, then enhance for
    // touch ergonomics + premium Android feel.
    final t = base.copyWith(
      colorScheme: colorScheme,
      visualDensity: VisualDensity.comfortable,
      splashFactory: InkSparkle.splashFactory,
      scaffoldBackgroundColor: const Color(0xFFF8FAFC), // soft "muted" background
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: <TargetPlatform, PageTransitionsBuilder>{
          TargetPlatform.android: FadeUpwardsPageTransitionsBuilder(),
        },
      ),
      appBarTheme: base.appBarTheme.copyWith(
        backgroundColor: colorScheme.surface.withValues(alpha: 0.92),
        foregroundColor: colorScheme.onSurface,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: base.cardTheme.copyWith(
        color: Colors.white,
        elevation: 1,
        shadowColor: Colors.black.withValues(alpha: 0.08),
        margin: const EdgeInsets.symmetric(vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: colorScheme.outline.withValues(alpha: 0.70)),
        ),
      ),
      listTileTheme: ListTileThemeData(
        iconColor: colorScheme.primary,
        textColor: colorScheme.onSurface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      dividerTheme: DividerThemeData(
        color: colorScheme.outline.withValues(alpha: 0.70),
        thickness: 1,
        space: 20,
      ),
      navigationBarTheme: base.navigationBarTheme.copyWith(
        height: 76,
        backgroundColor: colorScheme.surface,
        indicatorColor: colorScheme.primary.withValues(alpha: 0.12),
      ),
    );
    return t;
  }
}
