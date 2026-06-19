import 'package:flutter/material.dart';
import '../services/inventory_service.dart';
import '../services/sales_service.dart';
import '../services/employee_service.dart';
import '../services/financial_service.dart';

class StoreProvider extends ChangeNotifier {
  final InventoryService _inventoryService = InventoryService();
  final SalesService _salesService = SalesService();
  final EmployeeService _employeeService = EmployeeService();
  final FinancialService _financialService = FinancialService();

  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? _todaySales;
  List<dynamic> _products = [];
  List<dynamic> _lowStockProducts = [];
  List<dynamic> _employees = [];
  List<dynamic> _pontoStatus = [];
  Map<String, dynamic>? _financialOverview;

  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, dynamic>? get todaySales => _todaySales;
  List<dynamic> get products => _products;
  List<dynamic> get lowStockProducts => _lowStockProducts;
  List<dynamic> get employees => _employees;
  List<dynamic> get pontoStatus => _pontoStatus;
  Map<String, dynamic>? get financialOverview => _financialOverview;

  Future<void> loadTodayDashboard() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _todaySales = await _salesService.getTodaySales();
      _lowStockProducts = await _inventoryService.getLowStockProducts();
      _pontoStatus = await _employeeService.getPontoStatus();
      _financialOverview = await _financialService.getFinancialOverview();
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadProducts({String? search}) async {
    try {
      _products = await _inventoryService.getProducts(search: search);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> loadEmployees() async {
    try {
      _employees = await _employeeService.getEmployees();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> loadPontoStatus() async {
    try {
      _pontoStatus = await _employeeService.getPontoStatus();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    await loadTodayDashboard();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
