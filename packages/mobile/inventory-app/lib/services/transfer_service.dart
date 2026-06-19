import '../config/api_config.dart';
import 'api_service.dart';

class TransferService {
  final ApiService _api = ApiService();

  Future<List<Map<String, dynamic>>> getTransfers({String? status}) async {
    final params = <String, String>{};
    if (status != null) params['status'] = status;
    final data = await _api.get(ApiConfig.transfersEndpoint, queryParams: params);
    return List<Map<String, dynamic>>.from(data['data'] ?? data['transfers'] ?? []);
  }

  Future<Map<String, dynamic>> createTransfer(Map<String, dynamic> transferData) async {
    final data = await _api.post(ApiConfig.transfersEndpoint, body: transferData);
    return data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getTransferDetail(int id) async {
    final data = await _api.get('${ApiConfig.transfersEndpoint}/$id');
    return data as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> getDestinations() async {
    final data = await _api.get('${ApiConfig.transfersEndpoint}/destinations');
    return List<Map<String, dynamic>>.from(data['data'] ?? data['destinations'] ?? []);
  }
}
