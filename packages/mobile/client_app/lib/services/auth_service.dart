import '../config/api_config.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> login(String email, String password) async {
    final data = await _api.post(ApiConfig.loginEndpoint, body: {
      'email': email,
      'password': password,
    });
    await _api.setTokens(data['token'], data['refresh_token']);
    return data;
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    final data = await _api.post(ApiConfig.registerEndpoint, body: userData);
    await _api.setTokens(data['token'], data['refresh_token']);
    return data;
  }

  Future<bool> verifyMfa(String code) async {
    try {
      await _api.post(ApiConfig.mfaEndpoint, body: {'code': code});
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<UserModel> getProfile() async {
    final data = await _api.get(ApiConfig.profileEndpoint);
    return UserModel.fromJson(data['user']);
  }

  Future<UserModel> updateProfile(Map<String, dynamic> profileData) async {
    final data = await _api.put(ApiConfig.profileEndpoint, body: profileData);
    return UserModel.fromJson(data['user']);
  }

  Future<void> logout() async {
    await _api.clearTokens();
  }

  Future<bool> isLoggedIn() async {
    return await _api.hasToken();
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    await _api.put('/auth/password', body: {
      'current_password': currentPassword,
      'new_password': newPassword,
    });
  }

  Future<void> forgotPassword(String email) async {
    await _api.post('/auth/forgot-password', body: {'email': email});
  }

  Future<void> enableMfa() async {
    await _api.post('/auth/mfa/enable');
  }

  Future<void> disableMfa() async {
    await _api.post('/auth/mfa/disable');
  }
}
