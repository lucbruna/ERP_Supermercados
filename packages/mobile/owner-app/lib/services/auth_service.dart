import '../config/api_config.dart';
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

  Future<bool> verifyMfa(String code) async {
    try {
      await _api.post(ApiConfig.mfaEndpoint, body: {'code': code});
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<Map<String, dynamic>> getProfile() async {
    return await _api.get(ApiConfig.profileEndpoint);
  }

  Future<void> logout() async {
    await _api.clearTokens();
  }

  Future<bool> isLoggedIn() async {
    return await _api.hasToken();
  }
}
