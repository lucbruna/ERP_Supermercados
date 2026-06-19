import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/auth_service.dart';

enum AuthStatus { uninitialized, authenticated, unauthenticated, loading }

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  AuthStatus _status = AuthStatus.uninitialized;
  Map<String, dynamic>? _user;
  String? _error;
  bool _isMfaRequired = false;

  AuthStatus get status => _status;
  Map<String, dynamic>? get user => _user;
  String? get error => _error;
  bool get isMfaRequired => _isMfaRequired;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  Future<void> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUser = prefs.getString('manager_user');
    final loggedIn = await _authService.isLoggedIn();
    if (loggedIn && savedUser != null) {
      try {
        _user = Map<String, dynamic>.from(jsonDecode(savedUser));
        _status = AuthStatus.authenticated;
      } catch (_) {
        _user = await _authService.getProfile();
        _status = AuthStatus.authenticated;
        await _cacheUser(_user!);
      }
    } else {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<void> _cacheUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('manager_user', jsonEncode(user));
  }

  Future<bool> login(String email, String password) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();
    try {
      final data = await _authService.login(email, password);
      if (data['mfa_required'] == true) {
        _isMfaRequired = true;
        _status = AuthStatus.unauthenticated;
        notifyListeners();
        return false;
      }
      _user = data['user'] as Map<String, dynamic>?;
      _status = AuthStatus.authenticated;
      _isMfaRequired = false;
      if (_user != null) await _cacheUser(_user!);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  Future<bool> verifyMfa(String code) async {
    try {
      final valid = await _authService.verifyMfa(code);
      if (valid) {
        _user = await _authService.getProfile();
        _status = AuthStatus.authenticated;
        _isMfaRequired = false;
        if (_user != null) await _cacheUser(_user!);
        notifyListeners();
        return true;
      }
      _error = 'Código inválido';
      notifyListeners();
      return false;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('manager_user');
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
