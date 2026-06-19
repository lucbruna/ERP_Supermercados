import 'package:flutter/material.dart';
import '../services/dashboard_service.dart';
import '../services/store_service.dart';

class DashboardProvider extends ChangeNotifier {
  final DashboardService _dashboardService = DashboardService();
  final StoreService _storeService = StoreService();

  bool _isLoading = false;
  String? _error;
  Map<String, dynamic>? _dashboardData;
  Map<String, dynamic>? _kpis;
  Map<String, dynamic>? _financialOverview;
  List<dynamic> _stores = [];
  List<dynamic> _storeComparison = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, dynamic>? get dashboardData => _dashboardData;
  Map<String, dynamic>? get kpis => _kpis;
  Map<String, dynamic>? get financialOverview => _financialOverview;
  List<dynamic> get stores => _stores;
  List<dynamic> get storeComparison => _storeComparison;

  Future<void> loadDashboard() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _dashboardData = await _dashboardService.getDashboard();
      _kpis = await _dashboardService.getKpis();
      _financialOverview = await _dashboardService.getFinancialOverview();
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadStores() async {
    try {
      _stores = await _storeService.getStores();
      _storeComparison = await _storeService.getStoresComparison();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    await Future.wait([loadDashboard(), loadStores()]);
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
