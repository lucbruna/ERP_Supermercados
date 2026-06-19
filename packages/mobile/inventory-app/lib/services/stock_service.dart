import '../config/api_config.dart';
import 'api_service.dart';

class StockService {
  final ApiService _api = ApiService();

  Future<List<Map<String, dynamic>>> getMovements({Map<String, String>? filters}) async {
    final data = await _api.get(ApiConfig.stockMovementsEndpoint, queryParams: filters);
    return List<Map<String, dynamic>>.from(data['data'] ?? data['movements'] ?? []);
  }

  Future<List<Map<String, dynamic>>> getLowStockAlerts() async {
    final data = await _api.get(ApiConfig.stockAlertsEndpoint);
    return List<Map<String, dynamic>>.from(data['data'] ?? data['alerts'] ?? []);
  }

  Future<Map<String, dynamic>> createMovement(Map<String, dynamic> movement) async {
    final data = await _api.post(ApiConfig.stockMovementsEndpoint, body: movement);
    return data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getStockByProduct(int productId) async {
    final data = await _api.get('${ApiConfig.stockEndpoint}/product/$productId');
    return data as Map<String, dynamic>;
  }
}
