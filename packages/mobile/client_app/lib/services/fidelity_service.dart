import '../config/api_config.dart';
import '../models/coupon_model.dart';
import 'api_service.dart';

class FidelityService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> getFidelitySummary() async {
    final data = await _api.get(ApiConfig.fidelityEndpoint);
    return data;
  }

  Future<List<Map<String, dynamic>>> getPointsHistory({int page = 1}) async {
    final data = await _api.get('${ApiConfig.fidelityEndpoint}/points', queryParams: {
      'page': page.toString(),
    });
    return List<Map<String, dynamic>>.from(data['points']);
  }

  Future<double> convertPointsToCashback(int points) async {
    final data = await _api.post('${ApiConfig.fidelityEndpoint}/convert', body: {
      'points': points,
    });
    return (data['cashback_value'] ?? 0).toDouble();
  }

  Future<List<CouponModel>> getCoupons({bool activeOnly = true}) async {
    final params = <String, String>{};
    if (activeOnly) params['active'] = 'true';
    final data = await _api.get(ApiConfig.couponsEndpoint, queryParams: params);
    return (data['coupons'] as List<dynamic>)
        .map((e) => CouponModel.fromJson(e))
        .toList();
  }

  Future<CouponModel> claimCoupon(String couponCode) async {
    final data = await _api.post('${ApiConfig.couponsEndpoint}/claim', body: {
      'code': couponCode,
    });
    return CouponModel.fromJson(data['coupon']);
  }

  Future<CouponModel> generateCoupon(int pointsSpent) async {
    final data = await _api.post('${ApiConfig.couponsEndpoint}/generate', body: {
      'points': pointsSpent,
    });
    return CouponModel.fromJson(data['coupon']);
  }

  Future<List<Map<String, dynamic>>> getCashbackHistory({int page = 1}) async {
    final data = await _api.get('${ApiConfig.fidelityEndpoint}/cashback', queryParams: {
      'page': page.toString(),
    });
    return List<Map<String, dynamic>>.from(data['cashback_history']);
  }
}
