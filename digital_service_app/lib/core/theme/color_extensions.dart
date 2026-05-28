import 'package:flutter/material.dart';

/// Backwards-compatible shim for older code using `withValues(alpha: x)`.
/// Converts to `withAlpha(...)` on Color (avoids deprecated `withOpacity`).
extension ColorWithValues on Color {
  Color withValues({required double alpha}) {
    final clamped = (alpha * 255).round().clamp(0, 255).toInt();
    return withAlpha(clamped);
  }
}
