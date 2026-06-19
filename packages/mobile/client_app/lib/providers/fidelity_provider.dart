import 'package:flutter/material.dart';
import '../models/coupon_model.dart';
import '../services/fidelity_service.dart';

class FidelityProvider extends ChangeNotifier {
  final FidelityService _fidelityService = FidelityService();

  int _totalPoints = 0;
  double _cashbackBalance = 0.0;
  String _tier = 'Básico';
  List<CouponModel> _coupons = [];
  List<Map<String, dynamic>> _pointsHistory = [];
  List<Map<String, dynamic>> _cashbackHistory = [];
  bool _isLoading = false;
  String? _error;

  int get totalPoints => _totalPoints;
  double get cashbackBalance => _cashbackBalance;
  String get tier => _tier;
  List<CouponModel> get coupons => _coupons;
  List<Map<String, dynamic>> get pointsHistory => _pointsHistory;
  List<Map<String, dynamic>> get cashbackHistory => _cashbackHistory;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<CouponModel> get activeCoupons =>
      _coupons.where((c) => c.isValid).toList();

  int get pointsToNextTier {
    switch (_tier) {
      case 'Básico':
        return 500 - _totalPoints;
      case 'Bronze':
        return 1000 - _totalPoints;
      case 'Prata':
        return 2000 - _totalPoints;
      case 'Ouro':
        return 5000 - _totalPoints;
      default:
        return 0;
    }
  }

  String get nextTier {
    switch (_tier) {
      case 'Básico':
        return 'Bronze';
      case 'Bronze':
        return 'Prata';
      case 'Prata':
        return 'Ouro';
      case 'Ouro':
        return 'Diamante';
      default:
        return 'Máximo';
    }
  }

  double get progressToNextTier {
    switch (_tier) {
      case 'Básico':
        return _totalPoints / 500;
      case 'Bronze':
        return (_totalPoints - 500) / 500;
      case 'Prata':
        return (_totalPoints - 1000) / 1000;
      case 'Ouro':
        return (_totalPoints - 2000) / 3000;
      default:
        return 1.0;
    }
  }

  Future<void> loadFidelityData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final summary = await _fidelityService.getFidelitySummary();
      _totalPoints = summary['total_points'] ?? 0;
      _cashbackBalance = (summary['cashback_balance'] ?? 0).toDouble();
      _tier = summary['tier'] ?? 'Básico';

      final coupons = await _fidelityService.getCoupons();
      _coupons = coupons;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadPointsHistory() async {
    try {
      _pointsHistory = await _fidelityService.getPointsHistory();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> loadCashbackHistory() async {
    try {
      _cashbackHistory = await _fidelityService.getCashbackHistory();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<double> convertPointsToCashback(int points) async {
    try {
      final value = await _fidelityService.convertPointsToCashback(points);
      _totalPoints -= points;
      _cashbackBalance += value;
      notifyListeners();
      return value;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return 0;
    }
  }

  Future<CouponModel?> claimCoupon(String code) async {
    try {
      final coupon = await _fidelityService.claimCoupon(code);
      _coupons.add(coupon);
      notifyListeners();
      return coupon;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<CouponModel?> generateCoupon(int points) async {
    try {
      final coupon = await _fidelityService.generateCoupon(points);
      _totalPoints -= points;
      _coupons.add(coupon);
      notifyListeners();
      return coupon;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
