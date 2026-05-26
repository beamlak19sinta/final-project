@echo off
REM Script to generate Flutter platform folders (android/ios/web) for the digital_service_app
cd /d "%~dp0\digital_service_app"
echo Running: flutter create .
flutter create .
if ERRORLEVEL 1 (
  echo.
  echo Flutter create failed. Ensure Flutter SDK is installed and added to PATH, and you have a working internet connection.
  exit /b 1
)
echo Flutter create completed. Now run:
echo   cd digital_service_app
echo   flutter pub get
echo   flutter build apk --debug
echo   flutter build apk --release
echo Script finished.
pause