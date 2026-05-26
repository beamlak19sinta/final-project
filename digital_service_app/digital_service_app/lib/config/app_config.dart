class AppConfig {
  static const String baseApiUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.161.82.64:5000/api',
  );
  static const List<String> timeSlots = [
    '08:30 - 09:30',
    '09:30 - 10:30',
    '10:30 - 11:30',
    '14:00 - 15:00',
    '15:00 - 16:30',
  ];
}
