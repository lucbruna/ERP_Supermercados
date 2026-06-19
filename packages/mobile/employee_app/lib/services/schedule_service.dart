import '../config/api_config.dart';
import '../models/schedule_model.dart';
import 'api_service.dart';

class ScheduleService {
  final ApiService _api = ApiService();

  Future<List<ScheduleModel>> getSchedule({
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    final params = <String, String>{};
    if (startDate != null) params['start_date'] = startDate.toIso8601String().split('T')[0];
    if (endDate != null) params['end_date'] = endDate.toIso8601String().split('T')[0];

    final data = await _api.get(ApiConfig.scheduleEndpoint, queryParams: params);
    return (data['schedules'] as List<dynamic>)
        .map((e) => ScheduleModel.fromJson(e))
        .toList();
  }

  Future<List<ScheduleModel>> getEmployeeSchedule(int employeeId, {
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    final params = <String, String>{};
    if (startDate != null) params['start_date'] = startDate.toIso8601String().split('T')[0];
    if (endDate != null) params['end_date'] = endDate.toIso8601String().split('T')[0];

    final data = await _api.get('${ApiConfig.scheduleEndpoint}/employee/$employeeId',
        queryParams: params);
    return (data['schedules'] as List<dynamic>)
        .map((e) => ScheduleModel.fromJson(e))
        .toList();
  }

  Future<ScheduleModel> createSchedule(Map<String, dynamic> scheduleData) async {
    final data = await _api.post(ApiConfig.scheduleEndpoint, body: scheduleData);
    return ScheduleModel.fromJson(data['schedule']);
  }

  Future<ScheduleModel> updateSchedule(int scheduleId, Map<String, dynamic> scheduleData) async {
    final data = await _api.put('${ApiConfig.scheduleEndpoint}/$scheduleId', body: scheduleData);
    return ScheduleModel.fromJson(data['schedule']);
  }

  Future<void> deleteSchedule(int scheduleId) async {
    await _api.delete('${ApiConfig.scheduleEndpoint}/$scheduleId');
  }

  Future<Map<String, dynamic>> getMonthlySummary(int year, int month) async {
    final data = await _api.get('${ApiConfig.scheduleEndpoint}/summary', queryParams: {
      'year': year.toString(),
      'month': month.toString().padLeft(2, '0'),
    });
    return data;
  }
}
