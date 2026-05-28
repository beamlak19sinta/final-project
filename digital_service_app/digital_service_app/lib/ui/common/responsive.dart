import 'package:flutter/widgets.dart';

class Breakpoints {
  static const double compact = 600;
  static const double medium = 840;
  static const double expanded = 1200;
}

class Responsive {
  static bool isCompact(BuildContext context) =>
      MediaQuery.sizeOf(context).width < Breakpoints.compact;

  static bool isMedium(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    return w >= Breakpoints.compact && w < Breakpoints.medium;
  }

  static bool isExpanded(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= Breakpoints.medium;

  /// Keeps reading layouts comfortable on large devices (and avoids overly wide
  /// forms on tablets).
  static double contentMaxWidth(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    if (w >= Breakpoints.expanded) return 720;
    if (w >= Breakpoints.medium) return 620;
    return w;
  }
}

