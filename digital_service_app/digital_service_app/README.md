# Digital Service Flutter App

Flutter frontend migrated from React Native/Expo.

## Structure

- `lib/main.dart`
- `lib/screens/`
- `lib/services/`
- `lib/models/`

## Run

```bash
flutter pub get
flutter run
```

## Backend Connection

- Backend remains Node.js + Prisma and is unchanged.
- API client is in `lib/services/api_service.dart`.
- Default base URL is `http://10.0.2.2:5000/api` (Android emulator loopback).
