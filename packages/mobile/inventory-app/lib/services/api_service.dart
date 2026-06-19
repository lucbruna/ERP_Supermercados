import 'dart:convert';
import 'dart:io';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:offline/offline.dart';
import '../config/api_config.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, {this.statusCode});
  @override
  String toString() => message;
}

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  final Connectivity _connectivity = Connectivity();
  final SyncService _syncService = SyncService();

  String? _token;
  String? _refreshToken;

  String? get token => _token;

  Future<bool> get isConnected async {
    final result = await _connectivity.checkConnectivity();
    return result != ConnectivityResult.none;
  }

  Future<void> setTokens(String token, String refreshToken) async {
    _token = token;
    _refreshToken = refreshToken;
    _syncService.setAuthToken(token);
    await _secureStorage.write(key: 'inventory_jwt_token', value: token);
    await _secureStorage.write(key: 'inventory_refresh_token', value: refreshToken);
  }

  Future<void> loadTokens() async {
    _token = await _secureStorage.read(key: 'inventory_jwt_token');
    _refreshToken = await _secureStorage.read(key: 'inventory_refresh_token');
    if (_token != null) _syncService.setAuthToken(_token!);
  }

  Future<void> clearTokens() async {
    _token = null;
    _refreshToken = null;
    await _secureStorage.delete(key: 'inventory_jwt_token');
    await _secureStorage.delete(key: 'inventory_refresh_token');
  }

  Future<bool> hasToken() async {
    await loadTokens();
    return _token != null;
  }

  Map<String, String> _buildHeaders({Map<String, String>? extra}) {
    final headers = Map<String, String>.from(ApiConfig.headers);
    if (_token != null) headers['Authorization'] = 'Bearer $_token';
    if (extra != null) headers.addAll(extra);
    return headers;
  }

  Future<dynamic> _handleResponse(http.Response response) async {
    if (response.statusCode == 401) {
      final refreshed = await _refreshAccessToken();
      if (refreshed) throw ApiException('Token renovado', statusCode: 401);
      await clearTokens();
      throw ApiException('Sessão expirada', statusCode: 401);
    }
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    }
    String errorMessage = 'Erro de conexão';
    try {
      final body = jsonDecode(response.body);
      errorMessage = body['message'] ?? body['error'] ?? 'Erro desconhecido';
    } catch (_) {
      errorMessage = response.body.isNotEmpty ? response.body : 'Erro na requisição';
    }
    throw ApiException(errorMessage, statusCode: response.statusCode);
  }

  Future<bool> _refreshAccessToken() async {
    if (_refreshToken == null) return false;
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.refreshTokenEndpoint}'),
        headers: ApiConfig.headers,
        body: jsonEncode({'refresh_token': _refreshToken}),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await setTokens(data['token'], data['refresh_token']);
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<bool> _isOffline() async {
    final result = await _connectivity.checkConnectivity();
    return result == ConnectivityResult.none;
  }

  Future<dynamic> get(String endpoint, {Map<String, String>? queryParams}) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint').replace(queryParameters: queryParams);
    try {
      final response = await http.get(uri, headers: _buildHeaders()).timeout(ApiConfig.timeout);
      return _handleResponse(response);
    } on SocketException {
      throw ApiException('Sem conexão com a internet');
    } on http.ClientException {
      throw ApiException('Erro de conexão com o servidor');
    }
  }

  Future<dynamic> post(String endpoint, {Map<String, dynamic>? body}) async {
    if (await _isOffline()) {
      await _syncService.enqueueOperation(type: 'POST', endpoint: endpoint, payload: body);
      return {'offline': true, 'message': 'Operação salva para sincronização posterior'};
    }
    final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    try {
      final response = await http
          .post(uri, headers: _buildHeaders(), body: body != null ? jsonEncode(body) : null)
          .timeout(ApiConfig.timeout);
      return _handleResponse(response);
    } on SocketException {
      await _syncService.enqueueOperation(type: 'POST', endpoint: endpoint, payload: body);
      return {'offline': true, 'message': 'Operação salva para sincronização posterior'};
    } on http.ClientException {
      throw ApiException('Erro de conexão com o servidor');
    }
  }

  Future<dynamic> put(String endpoint, {Map<String, dynamic>? body}) async {
    if (await _isOffline()) {
      await _syncService.enqueueOperation(type: 'PUT', endpoint: endpoint, payload: body);
      return {'offline': true, 'message': 'Operação salva para sincronização posterior'};
    }
    final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    try {
      final response = await http
          .put(uri, headers: _buildHeaders(), body: body != null ? jsonEncode(body) : null)
          .timeout(ApiConfig.timeout);
      return _handleResponse(response);
    } on SocketException {
      await _syncService.enqueueOperation(type: 'PUT', endpoint: endpoint, payload: body);
      return {'offline': true, 'message': 'Operação salva para sincronização posterior'};
    } on http.ClientException {
      throw ApiException('Erro de conexão com o servidor');
    }
  }

  Future<dynamic> patch(String endpoint, {Map<String, dynamic>? body}) async {
    if (await _isOffline()) {
      await _syncService.enqueueOperation(type: 'PATCH', endpoint: endpoint, payload: body);
      return {'offline': true, 'message': 'Operação salva para sincronização posterior'};
    }
    final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    try {
      final response = await http
          .patch(uri, headers: _buildHeaders(), body: body != null ? jsonEncode(body) : null)
          .timeout(ApiConfig.timeout);
      return _handleResponse(response);
    } on SocketException {
      await _syncService.enqueueOperation(type: 'PATCH', endpoint: endpoint, payload: body);
      return {'offline': true, 'message': 'Operação salva para sincronização posterior'};
    } on http.ClientException {
      throw ApiException('Erro de conexão com o servidor');
    }
  }

  Future<dynamic> delete(String endpoint) async {
    if (await _isOffline()) {
      await _syncService.enqueueOperation(type: 'DELETE', endpoint: endpoint);
      return {'offline': true, 'message': 'Operação salva para sincronização posterior'};
    }
    final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    try {
      final response = await http.delete(uri, headers: _buildHeaders()).timeout(ApiConfig.timeout);
      return _handleResponse(response);
    } on SocketException {
      await _syncService.enqueueOperation(type: 'DELETE', endpoint: endpoint);
      return {'offline': true, 'message': 'Operação salva para sincronização posterior'};
    } on http.ClientException {
      throw ApiException('Erro de conexão com o servidor');
    }
  }

  Future<dynamic> uploadFile(String endpoint, File file, {String fieldName = 'file'}) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    final request = http.MultipartRequest('POST', uri);
    request.headers.addAll(_buildHeaders());
    request.files.add(await http.MultipartFile.fromPath(fieldName, file.path));
    try {
      final streamedResponse = await request.send().timeout(ApiConfig.timeout);
      final response = await http.Response.fromStream(streamedResponse);
      return _handleResponse(response);
    } on SocketException {
      throw ApiException('Sem conexão com a internet');
    }
  }
}
