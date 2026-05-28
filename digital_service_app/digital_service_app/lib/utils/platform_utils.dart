import 'package:flutter/foundation.dart';

class PlatformUtils {
  static bool get isWeb => kIsWeb;

  /// NOTE: `dart:io` is intentionally NOT used here so this stays safe for web.
  static bool get isAndroid =>
      !kIsWeb && defaultTargetPlatform == TargetPlatform.android;

  static bool get isIOS =>
      !kIsWeb && defaultTargetPlatform == TargetPlatform.iOS;
}
