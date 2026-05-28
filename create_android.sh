#!/bin/bash
# Script to generate Flutter platform folders (android/ios/web) for the digital_service_app
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/digital_service_app" || exit 1
echo "Running: flutter create ."
flutter create .
if [ $? -ne 0 ]; then
  echo "Flutter create failed. Ensure Flutter SDK is installed and on PATH."
  exit 1
fi
echo "Flutter create completed. Now run:
  cd digital_service_app
  flutter pub get
  flutter build apk --debug
  flutter build apk --release"
echo "Done."