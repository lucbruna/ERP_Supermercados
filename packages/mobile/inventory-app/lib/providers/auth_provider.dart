import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

enum AuthStatus { uninitialized, authenticated, unauthenticated, loading }

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  AuthStatus _status = AuthStatus.uninitialized;
  Map<String, dynamic>? _user;
  String? _error;

  AuthStatus get status => _status;
  Map<String, dynamic>? get user => _user;
  String? get error => _error;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  Future<void> tryAutoLogin() async {
    final loggedIn = await _apiService.hasToken();
    if (loggedIn) {
      try {
        final data = await _apiService.get('/profile');
        _user = data['user'] as Map<String, dynamic>? ?? data as Map<String, dynamic>?;
        _status = AuthStatus.authenticated;
      } catch (_) {
        _status = AuthStatus.unauthenticated;
      }
    } else {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiService._instance.post(
        '/auth/login',
        body: {'email': email, 'password': password},
      );
      await _apiService.setTokens(data['token'], data['refresh_token']);
      _user = data['user'] as Map<String, dynamic>?;
      _status = AuthStatus.authenticated;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_data', data['user']?.toString() ?? '');
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _apiService.clearTokens();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_data');
    _user = null;
    _status = AuthStatus.unauthenticated;
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
