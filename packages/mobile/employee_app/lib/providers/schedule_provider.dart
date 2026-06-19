import 'package:flutter/material.dart';
import '../models/schedule_model.dart';
import '../services/schedule_service.dart';

class ScheduleProvider extends ChangeNotifier {
  final ScheduleService _scheduleService = ScheduleService();

  List<ScheduleModel> _schedules = [];
  Map<String, dynamic>? _monthlySummary;
  bool _isLoading = false;
  String? _error;

  List<ScheduleModel> get schedules => _schedules;
  Map<String, dynamic>? get monthlySummary => _monthlySummary;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<ScheduleModel> get todaySchedule {
    final today = DateTime.now();
    return _schedules.where((s) =>
        s.date.year == today.year &&
        s.date.month == today.month &&
        s.date.day == today.day).toList();
  }

  List<ScheduleModel> get thisWeekSchedule {
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
    final endOfWeek = startOfWeek.add(const Duration(days: 6));
    return _schedules.where((s) =>
        s.date.isAfter(startOfWeek.subtract(const Duration(days: 1))) &&
        s.date.isBefore(endOfWeek.add(const Duration(days: 1)))).toList()
      ..sort((a, b) => a.date.compareTo(b.date));
  }

  Future<void> loadSchedule({DateTime? startDate, DateTime? endDate}) async {
    _isLoading = true;
    notifyListeners();

    try {
      _schedules = await _scheduleService.getSchedule(
        startDate: startDate,
        endDate: endDate,
      );
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadMonthlySummary(int year, int month) async {
    try {
      _monthlySummary = await _scheduleService.getMonthlySummary(year, month);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<List<ScheduleModel>> getEmployeeSchedule(int employeeId) async {
    try {
      return await _scheduleService.getEmployeeSchedule(employeeId);
    } catch (e) {
      _error = e.toString();
      return [];
    }
  }

  Future<bool> createSchedule(Map<String, dynamic> data) async {
    try {
      final schedule = await _scheduleService.createSchedule(data);
      _schedules.add(schedule);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateSchedule(int scheduleId, Map<String, dynamic> data) async {
    try {
      final updated = await _scheduleService.updateSchedule(scheduleId, data);
      final index = _schedules.indexWhere((s) => s.id == scheduleId);
      if (index >= 0) _schedules[index] = updated;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteSchedule(int scheduleId) async {
    try {
      await _scheduleService.deleteSchedule(scheduleId);
      _schedules.removeWhere((s) => s.id == scheduleId);
      notifyListeners();
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
