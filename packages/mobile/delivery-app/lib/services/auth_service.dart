import '../config/api_config.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();

  Future<bool> isLoggedIn() => _api.hasToken();

  Future<Map<String, dynamic>> login(String email, String password) async {
    final data = await _api.post(ApiConfig.loginEndpoint, body: {
      'email': email,
      'password': password,
    });
    await _api.setTokens(data['token'], data['refresh_token']);
    return data;
  }

  Future<void> logout() async {
    await _api.clearTokens();
  }

  Future<Map<String, dynamic>> getProfile() async {
    final data = await _api.get(ApiConfig.profileEndpoint);
    return data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> profileData) async {
    final data = await _api.put(ApiConfig.profileEndpoint, body: profileData);
    return data as Map<String, dynamic>;
  }
}
