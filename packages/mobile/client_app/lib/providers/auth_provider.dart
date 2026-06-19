import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

enum AuthStatus { uninitialized, authenticated, unauthenticated, loading }

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  AuthStatus _status = AuthStatus.uninitialized;
  UserModel? _user;
  String? _error;
  bool _isMfaRequired = false;

  AuthStatus get status => _status;
  UserModel? get user => _user;
  String? get error => _error;
  bool get isMfaRequired => _isMfaRequired;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  Future<void> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUser = prefs.getString('user_data');
    final loggedIn = await _authService.isLoggedIn();

    if (loggedIn && savedUser != null) {
      try {
        _user = UserModel.fromJson(Map<String, dynamic>.from(
            await Future.value(_decodeJson(savedUser))));
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

  Map<String, dynamic> _decodeJson(String json) {
    return jsonDecode(json) as Map<String, dynamic>;
  }

  Future<void> _cacheUser(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_data', jsonEncode(user.toJson()));
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
      _user = UserModel.fromJson(data['user']);
      _status = AuthStatus.authenticated;
      _isMfaRequired = false;
      await _cacheUser(_user!);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(Map<String, dynamic> userData) async {
    _status = AuthStatus.loading;
    _error = null;
    notifyListeners();

    try {
      final data = await _authService.register(userData);
      _user = UserModel.fromJson(data['user']);
      _status = AuthStatus.authenticated;
      await _cacheUser(_user!);
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
        await _cacheUser(_user!);
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
    await prefs.remove('user_data');
    _user = null;
    _status = AuthStatus.unauthenticated;
    _error = null;
    notifyListeners();
  }

  Future<void> updateProfile(Map<String, dynamic> profileData) async {
    try {
      _user = await _authService.updateProfile(profileData);
      await _cacheUser(_user!);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> updateUser(UserModel updatedUser) async {
    _user = updatedUser;
    await _cacheUser(_user!);
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
