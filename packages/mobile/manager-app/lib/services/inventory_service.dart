import '../config/api_config.dart';
import 'api_service.dart';

class InventoryService {
  final ApiService _api = ApiService();

  Future<List<dynamic>> getProducts({String? search, int page = 1}) async {
    final params = <String, String>{
      'page': page.toString(),
      'limit': '20',
    };
    if (search != null && search.isNotEmpty) {
      params['search'] = search;
    }
    final data = await _api.get(ApiConfig.inventoryEndpoint, queryParams: params);
    return data['products'] ?? data['produtos'] ?? [];
  }

  Future<Map<String, dynamic>> getProductDetail(int productId) async {
    return await _api.get('${ApiConfig.inventoryEndpoint}/$productId');
  }

  Future<List<dynamic>> getLowStockProducts() async {
    final data = await _api.get('${ApiConfig.inventoryEndpoint}/low-stock');
    return data['products'] ?? data['produtos'] ?? [];
  }

  Future<List<dynamic>> getMovements({int? productId, int page = 1}) async {
    final params = <String, String>{'page': page.toString()};
    if (productId != null) params['product_id'] = productId.toString();
    final data = await _api.get(ApiConfig.inventoryMovementsEndpoint, queryParams: params);
    return data['movements'] ?? data['movimentacoes'] ?? [];
  }
}
