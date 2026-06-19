import '../config/api_config.dart';
import 'api_service.dart';

class EmployeeService {
  final ApiService _api = ApiService();

  Future<List<dynamic>> getEmployees() async {
    final data = await _api.get(ApiConfig.employeesEndpoint);
    return data['employees'] ?? data['funcionarios'] ?? [];
  }

  Future<List<dynamic>> getPontoStatus({DateTime? date}) async {
    final params = <String, String>{};
    if (date != null) {
      params['date'] = date.toIso8601String().split('T')[0];
    }
    final data = await _api.get(ApiConfig.pontoStatusEndpoint, queryParams: params);
    return data['records'] ?? data['ponto'] ?? [];
  }

  Future<Map<String, dynamic>> getEmployeeDetail(int employeeId) async {
    return await _api.get('${ApiConfig.employeesEndpoint}/$employeeId');
  }
}
