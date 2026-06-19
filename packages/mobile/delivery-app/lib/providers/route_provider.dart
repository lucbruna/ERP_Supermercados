import 'package:flutter/material.dart';
import '../services/route_service.dart';
import '../config/constants.dart';

class RouteProvider extends ChangeNotifier {
  final RouteService _routeService = RouteService();

  List<Map<String, dynamic>> _route = [];
  bool _isLoading = false;
  String? _error;
  Map<String, dynamic>? _currentStop;

  List<Map<String, dynamic>> get route => _route;
  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, dynamic>? get currentStop => _currentStop;

  double get originLat => AppConstants.defaultLat;
  double get originLng => AppConstants.defaultLng;

  Future<void> loadRoute({int? deliveryPersonId}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _route = await _routeService.getOptimizedRoute(deliveryPersonId: deliveryPersonId);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  void setCurrentStop(int index) {
    if (index >= 0 && index < _route.length) {
      _currentStop = _route[index];
      notifyListeners();
    }
  }

  Future<bool> reorderRoute(int oldIndex, int newIndex) async {
    if (newIndex > oldIndex) newIndex--;
    final item = _route.removeAt(oldIndex);
    _route.insert(newIndex, item);
    notifyListeners();

    try {
      await _routeService.updateRouteOrder(_route);
      return true;
    } catch (e) {
      _error = e.toString();
      _route.insert(oldIndex, _route.removeAt(newIndex));
      notifyListeners();
      return false;
    }
  }

  void clearRoute() {
    _route = [];
    _currentStop = null;
    notifyListeners();
  }
}
