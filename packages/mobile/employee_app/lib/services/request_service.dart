import '../config/api_config.dart';
import '../models/request_model.dart';
import 'api_service.dart';

class RequestService {
  final ApiService _api = ApiService();

  Future<List<RequestModel>> getRequests({int page = 1, int limit = 20}) async {
    final data = await _api.get(ApiConfig.requestsEndpoint, queryParams: {
      'page': page.toString(),
      'limit': limit.toString(),
    });
    return (data['requests'] as List<dynamic>)
        .map((e) => RequestModel.fromJson(e))
        .toList();
  }

  Future<RequestModel> createRequest(Map<String, dynamic> requestData) async {
    final data = await _api.post(ApiConfig.requestsEndpoint, body: requestData);
    return RequestModel.fromJson(data['request']);
  }

  Future<RequestModel> getRequestDetail(int requestId) async {
    final data = await _api.get('${ApiConfig.requestsEndpoint}/$requestId');
    return RequestModel.fromJson(data['request']);
  }

  Future<void> cancelRequest(int requestId) async {
    await _api.post('${ApiConfig.requestsEndpoint}/$requestId/cancel');
  }

  Future<RequestModel> approveRequest(int requestId, {String? reason}) async {
    final data = await _api.post('${ApiConfig.requestsEndpoint}/$requestId/approve',
        body: {'reason': reason});
    return RequestModel.fromJson(data['request']);
  }

  Future<RequestModel> rejectRequest(int requestId, {required String reason}) async {
    final data = await _api.post('${ApiConfig.requestsEndpoint}/$requestId/reject',
        body: {'reason': reason});
    return RequestModel.fromJson(data['request']);
  }

  Future<List<RequestModel>> getPendingRequests({int page = 1}) async {
    final data = await _api.get('${ApiConfig.requestsEndpoint}/pending',
        queryParams: {'page': page.toString()});
    return (data['requests'] as List<dynamic>)
        .map((e) => RequestModel.fromJson(e))
        .toList();
  }
}
