import '../config/api_config.dart';
import 'api_service.dart';

class DashboardService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> getDashboard() async {
    return await _api.get(ApiConfig.dashboardEndpoint);
  }

  Future<Map<String, dynamic>> getKpis() async {
    return await _api.get(ApiConfig.dashboardKpisEndpoint);
  }

  Future<Map<String, dynamic>> getFinancialOverview({
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    final params = <String, String>{};
    if (startDate != null) params['start_date'] = startDate.toIso8601String().split('T')[0];
    if (endDate != null) params['end_date'] = endDate.toIso8601String().split('T')[0];
    return await _api.get(ApiConfig.financialEndpoint, queryParams: params.isNotEmpty ? params : null);
  }
}
