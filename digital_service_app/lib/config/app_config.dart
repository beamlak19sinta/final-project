class AppConfig {
  static const String baseApiUrl = String.fromEnvironment(
    'API_BASE_URL',
    // Default to the production/LAN backend. Override with:
    // flutter run/build --dart-define=API_BASE_URL=http://<ip>:5000/api
    defaultValue: 'http://192.168.162.213:5000/api',
  );
  static const List<String> timeSlots = [
    '08:30 - 09:30',
    '09:30 - 10:30',
    '10:30 - 11:30',
    '14:00 - 15:00',
    '15:00 - 16:30',
  ];
}
