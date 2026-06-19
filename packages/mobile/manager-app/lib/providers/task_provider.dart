import 'package:flutter/material.dart';
import '../services/task_service.dart';

class TaskProvider extends ChangeNotifier {
  final TaskService _taskService = TaskService();

  bool _isLoading = false;
  String? _error;
  List<dynamic> _tasks = [];
  String _currentFilter = '';

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<dynamic> get tasks => _tasks;
  String get currentFilter => _currentFilter;

  Future<void> loadTasks({String? status}) async {
    _isLoading = true;
    _error = null;
    _currentFilter = status ?? '';
    notifyListeners();
    try {
      _tasks = await _taskService.getTasks(status: status);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createTask(Map<String, dynamic> taskData) async {
    try {
      await _taskService.createTask(taskData);
      await loadTasks();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> completeTask(int taskId) async {
    try {
      await _taskService.completeTask(taskId);
      await loadTasks();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteTask(int taskId) async {
    try {
      await _taskService.deleteTask(taskId);
      await loadTasks();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
