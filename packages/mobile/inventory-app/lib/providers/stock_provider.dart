import 'package:flutter/material.dart';
import '../services/stock_service.dart';

class StockProvider extends ChangeNotifier {
  final StockService _stockService = StockService();

  List<Map<String, dynamic>> _movements = [];
  List<Map<String, dynamic>> _lowStockAlerts = [];
  Map<String, dynamic>? _productStock;
  bool _isLoading = false;
  String? _error;

  List<Map<String, dynamic>> get movements => _movements;
  List<Map<String, dynamic>> get lowStockAlerts => _lowStockAlerts;
  Map<String, dynamic>? get productStock => _productStock;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadMovements({Map<String, String>? filters}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _movements = await _stockService.getMovements(filters: filters);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadLowStockAlerts() async {
    try {
      _lowStockAlerts = await _stockService.getLowStockAlerts();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> loadStockByProduct(int productId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _productStock = await _stockService.getStockByProduct(productId);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createMovement(Map<String, dynamic> movement) async {
    try {
      await _stockService.createMovement(movement);
      await loadMovements();
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
