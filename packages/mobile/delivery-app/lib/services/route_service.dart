import '../config/api_config.dart';
import 'api_service.dart';

class RouteService {
  final ApiService _api = ApiService();

  Future<List<Map<String, dynamic>>> getOptimizedRoute({int? deliveryPersonId}) async {
    final params = <String, String>{};
    if (deliveryPersonId != null) params['delivery_person_id'] = deliveryPersonId.toString();
    final data = await _api.get(ApiConfig.routeOptimizeEndpoint, queryParams: params);
    return List<Map<String, dynamic>>.from(data['data'] ?? data['route'] ?? []);
  }

  Future<bool> updateRouteOrder(List<Map<String, dynamic>> routeOrder) async {
    await _api.put(ApiConfig.routeOptimizeEndpoint, body: {'route': routeOrder});
    return true;
  }
}
