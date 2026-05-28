Platform setup and APK build instructions

This repository's Flutter package (digital_service_app) currently does not include Android/iOS/web platform folders. The environment used to inspect the repo cannot run `flutter` commands.

Recommended automated approach (run locally):

Windows (recommended):
1. Open PowerShell or cmd and navigate to the repo root.
2. Run: scripts\create_android.bat
3. Follow printed instructions: cd digital_service_app && flutter pub get && flutter build apk --debug && flutter build apk --release --no-tree-shake-icons

macOS/Linux:
1. Open terminal at repo root.
2. Run: bash scripts/create_android.sh
3. Then: cd digital_service_app && flutter pub get && flutter build apk --debug && flutter build apk --release --no-tree-shake-icons

Notes:
- Ensure Flutter SDK, Android SDK, JDK 17, and platform tools are installed and on PATH before running.
- After running, APKs will be generated at: digital_service_app\build\app\outputs\flutter-apk\
- If build fails, copy the terminal output and re-run setup; include logs when requesting further automated fixes.
