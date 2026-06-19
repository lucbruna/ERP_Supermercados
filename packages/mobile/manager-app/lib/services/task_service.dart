import '../config/api_config.dart';
import 'api_service.dart';

class TaskService {
  final ApiService _api = ApiService();

  Future<List<dynamic>> getTasks({String? status}) async {
    final params = <String, String>{};
    if (status != null) params['status'] = status;
    final data = await _api.get(ApiConfig.tasksEndpoint, queryParams: params.isNotEmpty ? params : null);
    return data['tasks'] ?? data['tarefas'] ?? [];
  }

  Future<Map<String, dynamic>> createTask(Map<String, dynamic> taskData) async {
    return await _api.post(ApiConfig.tasksEndpoint, body: taskData);
  }

  Future<Map<String, dynamic>> updateTask(int taskId, Map<String, dynamic> taskData) async {
    return await _api.put('${ApiConfig.tasksEndpoint}/$taskId', body: taskData);
  }

  Future<void> completeTask(int taskId) async {
    await _api.put('${ApiConfig.tasksEndpoint}/$taskId/complete');
  }

  Future<void> deleteTask(int taskId) async {
    await _api.delete('${ApiConfig.tasksEndpoint}/$taskId');
  }
}
