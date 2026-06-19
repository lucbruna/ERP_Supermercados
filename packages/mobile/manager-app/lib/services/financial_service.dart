import '../config/api_config.dart';
import 'api_service.dart';

class FinancialService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> getFinancialOverview() async {
    return await _api.get(ApiConfig.financialEndpoint);
  }

  Future<Map<String, dynamic>> getDayClosure({DateTime? date}) async {
    final params = <String, String>{};
    if (date != null) {
      params['date'] = date.toIso8601String().split('T')[0];
    }
    return await _api.get('${ApiConfig.financialEndpoint}/day-closure', queryParams: params);
  }

  Future<Map<String, dynamic>> getCashSummary({DateTime? date}) async {
    final params = <String, String>{};
    if (date != null) {
      params['date'] = date.toIso8601String().split('T')[0];
    }
    return await _api.get('${ApiConfig.financialEndpoint}/cash-summary', queryParams: params);
  }
}
