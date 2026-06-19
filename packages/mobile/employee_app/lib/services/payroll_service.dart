import '../config/api_config.dart';
import '../models/payroll_model.dart';
import 'api_service.dart';

class PayrollService {
  final ApiService _api = ApiService();

  Future<List<PayrollModel>> getPayrollList({int year = 2024}) async {
    final data = await _api.get(ApiConfig.payrollEndpoint, queryParams: {
      'year': year.toString(),
    });
    return (data['payrolls'] as List<dynamic>)
        .map((e) => PayrollModel.fromJson(e))
        .toList();
  }

  Future<PayrollModel> getPayrollDetail(int payrollId) async {
    final data = await _api.get('${ApiConfig.payrollEndpoint}/$payrollId');
    return PayrollModel.fromJson(data['payroll']);
  }

  Future<String> getPaystubUrl(int payrollId) async {
    final data = await _api.get('${ApiConfig.paystubEndpoint}/$payrollId');
    return data['url'] ?? '';
  }

  Future<List<PayrollModel>> getEmployeePayrolls(int employeeId, {int year = 2024}) async {
    final data = await _api.get('${ApiConfig.payrollEndpoint}/employee/$employeeId',
        queryParams: {'year': year.toString()});
    return (data['payrolls'] as List<dynamic>)
        .map((e) => PayrollModel.fromJson(e))
        .toList();
  }

  Future<PayrollModel> processPayroll(int employeeId, Map<String, dynamic> payrollData) async {
    final data = await _api.post('${ApiConfig.payrollEndpoint}/process', body: {
      'employee_id': employeeId,
      ...payrollData,
    });
    return PayrollModel.fromJson(data['payroll']);
  }
}
