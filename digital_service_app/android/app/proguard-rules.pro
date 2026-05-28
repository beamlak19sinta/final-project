# This file is used only if R8/minify is enabled.
# We keep it in the project so enabling minify later won't break Flutter/plugin code.

# Flutter engine + plugins
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Kotlin metadata (safe)
-keep class kotlin.Metadata { *; }

# Keep annotations used by reflection (safe default)
-keepattributes *Annotation*
