import '../config/api_config.dart';
import 'api_service.dart';

class ProductService {
  final ApiService _api = ApiService();

  Future<List<Map<String, dynamic>>> searchProducts(String query) async {
    final data = await _api.get(
      ApiConfig.productsEndpoint,
      queryParams: {'search': query},
    );
    return List<Map<String, dynamic>>.from(data['data'] ?? data['products'] ?? []);
  }

  Future<Map<String, dynamic>?> getProductByBarcode(String barcode) async {
    try {
      final data = await _api.get('${ApiConfig.productBarcodeEndpoint}/$barcode');
      return data as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, dynamic>> getProductDetail(int id) async {
    final data = await _api.get('${ApiConfig.productsEndpoint}/$id');
    return data as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> getCategories() async {
    final data = await _api.get(ApiConfig.categoriesEndpoint);
    return List<Map<String, dynamic>>.from(data['data'] ?? data['categories'] ?? []);
  }
}
