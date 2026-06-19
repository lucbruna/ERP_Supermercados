import '../config/api_config.dart';
import 'api_service.dart';

class StoreService {
  final ApiService _api = ApiService();

  Future<List<dynamic>> getStores() async {
    final data = await _api.get(ApiConfig.storesEndpoint);
    return data['stores'] ?? data['filiais'] ?? [];
  }

  Future<Map<String, dynamic>> getStoreDetail(int storeId) async {
    return await _api.get('${ApiConfig.storesEndpoint}/$storeId');
  }

  Future<List<dynamic>> getStoresComparison() async {
    final data = await _api.get(ApiConfig.storesComparisonEndpoint);
    return data['comparison'] ?? [];
  }
}
