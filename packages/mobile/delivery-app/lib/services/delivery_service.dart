import '../config/api_config.dart';
import 'api_service.dart';

class DeliveryService {
  final ApiService _api = ApiService();

  Future<List<Map<String, dynamic>>> getTodayDeliveries() async {
    final data = await _api.get(ApiConfig.deliveryTodayEndpoint);
    return List<Map<String, dynamic>>.from(data['data'] ?? data['deliveries'] ?? []);
  }

  Future<Map<String, dynamic>> getDeliveryDetail(int id) async {
    final data = await _api.get('${ApiConfig.deliveriesEndpoint}/$id');
    return data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateDeliveryStatus(int id, String status, {Map<String, dynamic>? extra}) async {
    final body = <String, dynamic>{'status': status};
    if (extra != null) body.addAll(extra);
    final data = await _api.patch('${ApiConfig.deliveryUpdateEndpoint}/$id', body: body);
    return data as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> getDeliveryHistory({String? startDate, String? endDate}) async {
    final params = <String, String>{};
    if (startDate != null) params['start_date'] = startDate;
    if (endDate != null) params['end_date'] = endDate;
    final data = await _api.get(ApiConfig.deliveryHistoryEndpoint, queryParams: params);
    return List<Map<String, dynamic>>.from(data['data'] ?? data['deliveries'] ?? []);
  }

  Future<Map<String, dynamic>> uploadProof(int deliveryId, String filePath) async {
    final data = await _api.uploadFile(
      '${ApiConfig.deliveriesEndpoint}/$deliveryId/proof',
      File(filePath),
    );
    return data as Map<String, dynamic>;
  }
}
