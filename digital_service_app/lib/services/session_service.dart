import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_profile.dart';

class SessionService {
  static const _tokenKey = 'auth_token';
  static const _nameKey = 'user_name';
  static const _phoneKey = 'user_phone';
  static const _roleKey = 'user_role';
  static const _idKey = 'user_id';
  static const _nationalIdKey = 'user_national_id';

  Future<void> saveSession(String token, UserProfile user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_nameKey, user.fullName);
    await prefs.setString(_phoneKey, user.phoneNumber);
    await prefs.setString(_roleKey, user.role);
    await prefs.setString(_idKey, user.id);
    if (user.nationalId != null) {
      await prefs.setString(_nationalIdKey, user.nationalId!);
    } else {
      await prefs.remove(_nationalIdKey);
    }
  }

  Future<(String?, UserProfile?)> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    if (token == null) return (null, null);
    final user = UserProfile(
      id: prefs.getString(_idKey) ?? '',
      fullName: prefs.getString(_nameKey) ?? '',
      phoneNumber: prefs.getString(_phoneKey) ?? '',
      role: prefs.getString(_roleKey) ?? '',
      nationalId: prefs.getString(_nationalIdKey),
      createdAt: null,
    );
    return (token, user);
  }

  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_nameKey);
    await prefs.remove(_phoneKey);
    await prefs.remove(_roleKey);
    await prefs.remove(_idKey);
    await prefs.remove(_nationalIdKey);
  }
}
