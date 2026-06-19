import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

enum AuthStatus { uninitialized, authenticated, unauthenticated, loading }

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  AuthStatus _status = AuthStatus.uninitialized;
  EmployeeModel? _user;
  String? _error;
  bool _isMfaRequired = false;

  AuthStatus get status => _status;
  EmployeeModel? get user => _user;
  String? get error => _error;
  bool get isMfaRequired => _isMfaRequired;
  bool get isAuthenticated => _status == AuthStatus.authenticated;
  bool get isRh => _user?.isRh ?? false;

  Future<void> tryAutoLogin() async {
    final loggedIn = await _authService.isLoggedIn();
    if (loggedIn) {
      try {
        _user = await _authService.getProfile();
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
      final data = await _authService.login(email, password);
      if (data['mfa_required'] == true) {
        _isMfaRequired = true;
        _status = AuthStatus.unauthenticated;
        notifyListeners();
        return false;
      }
      _user = EmployeeModel.fromJson(data['user']);
      _status = AuthStatus.authenticated;
      _isMfaRequired = false;
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
    await prefs.remove('employee_user_data');
    _user = null;
    _status = AuthStatus.unauthenticated;
    _error = null;
    notifyListeners();
  }

  Future<void> updateProfile(Map<String, dynamic> profileData) async {
    try {
      _user = await _authService.updateProfile(profileData);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
