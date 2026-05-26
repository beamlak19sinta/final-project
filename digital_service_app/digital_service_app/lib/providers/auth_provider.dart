import 'package:flutter/material.dart';
import '../models/user_profile.dart';
import '../services/api_service.dart';
import '../services/session_service.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider(this._api, this._session);

  final ApiService _api;
  final SessionService _session;

  String? token;
  UserProfile? user;
  bool isLoading = false;
  String? error;

  bool get isAuthenticated => token != null && user != null;

  Future<void> restoreSession() async {
    final (savedToken, savedUser) = await _session.loadSession();
    token = savedToken;
    user = savedUser;
    notifyListeners();
  }

  Future<bool> login(String phone, String password) async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final data = await _api.login(phone, password);
      final userJson = data['user'] as Map<String, dynamic>? ?? {};
      final parsedUser = UserProfile.fromJson(userJson);
      if (parsedUser.role != 'CITIZEN') {
        throw Exception('This mobile app is for citizens only');
      }
      token = (data['token'] ?? '').toString();
      user = parsedUser;
      await _session.saveSession(token!, parsedUser);
      return true;
    } catch (e) {
      error = e.toString().replaceFirst('Exception: ', '');
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> register({
    required String name,
    required String phone,
    required String nationalId,
    required String password,
  }) async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      await _api.registerCitizen(
        name: name,
        phoneNumber: phone,
        nationalId: nationalId,
        password: password,
      );
      return true;
    } catch (e) {
      error = e.toString().replaceFirst('Exception: ', '');
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<String?> forgotPassword(String phone) async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      return await _api.requestPasswordResetToken(phone);
    } catch (e) {
      error = e.toString().replaceFirst('Exception: ', '');
      return null;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      await _api.resetPassword(token: token, newPassword: newPassword);
      return true;
    } catch (e) {
      error = e.toString().replaceFirst('Exception: ', '');
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    token = null;
    user = null;
    await _session.clearSession();
    notifyListeners();
  }

  Future<void> replaceUser(UserProfile nextUser) async {
    user = nextUser;
    if (token != null) {
      await _session.saveSession(token!, nextUser);
    }
    notifyListeners();
  }
}
