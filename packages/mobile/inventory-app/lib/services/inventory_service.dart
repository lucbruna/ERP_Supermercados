import '../config/api_config.dart';
import 'api_service.dart';

class InventoryService {
  final ApiService _api = ApiService();

  Future<List<Map<String, dynamic>>> getLotes({String? status}) async {
    final params = <String, String>{};
    if (status != null) params['status'] = status;
    final data = await _api.get(ApiConfig.inventoryLotesEndpoint, queryParams: params);
    return List<Map<String, dynamic>>.from(data['data'] ?? data['lotes'] ?? []);
  }

  Future<Map<String, dynamic>> createInventory(Map<String, dynamic> inventory) async {
    final data = await _api.post(ApiConfig.inventoryEndpoint, body: inventory);
    return data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addInventoryItem(int inventoryId, Map<String, dynamic> item) async {
    final data = await _api.post('${ApiConfig.inventoryEndpoint}/$inventoryId/items', body: item);
    return data as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> getInventories() async {
    final data = await _api.get(ApiConfig.inventoryEndpoint);
    return List<Map<String, dynamic>>.from(data['data'] ?? data['inventories'] ?? []);
  }

  Future<Map<String, dynamic>> getInventoryDetail(int id) async {
    final data = await _api.get('${ApiConfig.inventoryEndpoint}/$id');
    return data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> submitCount(int inventoryId, Map<String, dynamic> countData) async {
    final data = await _api.put('${ApiConfig.inventoryEndpoint}/$inventoryId/submit', body: countData);
    return data as Map<String, dynamic>;
  }
}
