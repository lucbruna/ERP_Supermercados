import 'package:flutter/material.dart';
import '../services/delivery_service.dart';

enum DeliveryStatus { pending, inProgress, completed, problem }

class DeliveryProvider extends ChangeNotifier {
  final DeliveryService _deliveryService = DeliveryService();

  List<Map<String, dynamic>> _todayDeliveries = [];
  List<Map<String, dynamic>> _history = [];
  Map<String, dynamic>? _currentDelivery;
  bool _isLoading = false;
  String? _error;

  List<Map<String, dynamic>> get todayDeliveries => _todayDeliveries;
  List<Map<String, dynamic>> get history => _history;
  Map<String, dynamic>? get currentDelivery => _currentDelivery;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get totalDeliveries => _todayDeliveries.length;
  int get completedDeliveries => _todayDeliveries.where((d) => d['status'] == 'completed' || d['status'] == 'entregue').length;
  int get pendingDeliveries => _todayDeliveries.where((d) => d['status'] != 'completed' && d['status'] != 'entregue').length;

  Future<void> loadTodayDeliveries() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _todayDeliveries = await _deliveryService.getTodayDeliveries();
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadDeliveryDetail(int id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentDelivery = await _deliveryService.getDeliveryDetail(id);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> updateDeliveryStatus(int id, String status, {Map<String, dynamic>? extra}) async {
    try {
      await _deliveryService.updateDeliveryStatus(id, status, extra: extra);
      await loadTodayDeliveries();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> loadHistory({String? startDate, String? endDate}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _history = await _deliveryService.getDeliveryHistory(startDate: startDate, endDate: endDate);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> uploadProof(int deliveryId, String filePath) async {
    try {
      await _deliveryService.uploadProof(deliveryId, filePath);
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearCurrent() {
    _currentDelivery = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
