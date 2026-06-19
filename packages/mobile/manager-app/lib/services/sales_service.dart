import '../config/api_config.dart';
import 'api_service.dart';

class SalesService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> getTodaySales() async {
    return await _api.get(ApiConfig.salesTodayEndpoint);
  }

  Future<List<dynamic>> getSales({int page = 1, DateTime? date}) async {
    final params = <String, String>{'page': page.toString()};
    if (date != null) {
      params['date'] = date.toIso8601String().split('T')[0];
    }
    final data = await _api.get(ApiConfig.salesEndpoint, queryParams: params);
    return data['sales'] ?? data['vendas'] ?? [];
  }

  Future<Map<String, dynamic>> getPaymentBreakdown({DateTime? date}) async {
    final params = <String, String>{};
    if (date != null) {
      params['date'] = date.toIso8601String().split('T')[0];
    }
    return await _api.get('${ApiConfig.salesEndpoint}/payment-breakdown', queryParams: params);
  }
}
