import '../config/api_config.dart';
import '../models/product_model.dart';
import 'api_service.dart';

class ProductService {
  final ApiService _api = ApiService();

  Future<List<ProductModel>> getProducts({
    String? category,
    String? search,
    int page = 1,
    int limit = 20,
    String? sortBy,
  }) async {
    final params = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };
    if (category != null) params['category'] = category;
    if (search != null) params['search'] = search;
    if (sortBy != null) params['sort_by'] = sortBy;

    final data = await _api.get(ApiConfig.productsEndpoint, queryParams: params);
    return (data['products'] as List<dynamic>)
        .map((e) => ProductModel.fromJson(e))
        .toList();
  }

  Future<List<ProductModel>> getOffers({int page = 1, int limit = 10}) async {
    final data = await _api.get(ApiConfig.offersEndpoint, queryParams: {
      'page': page.toString(),
      'limit': limit.toString(),
    });
    return (data['offers'] as List<dynamic>)
        .map((e) => ProductModel.fromJson(e))
        .toList();
  }

  Future<List<String>> getCategories() async {
    final data = await _api.get(ApiConfig.categoriesEndpoint);
    return List<String>.from(data['categories']);
  }

  Future<ProductModel> getProductDetail(int productId) async {
    final data = await _api.get('${ApiConfig.productsEndpoint}/$productId');
    return ProductModel.fromJson(data);
  }

  Future<List<ProductModel>> searchProducts(String query, {int page = 1}) async {
    final data = await _api.get(ApiConfig.searchEndpoint, queryParams: {
      'q': query,
      'page': page.toString(),
    });
    return (data['products'] as List<dynamic>)
        .map((e) => ProductModel.fromJson(e))
        .toList();
  }

  Future<void> toggleFavorite(int productId) async {
    await _api.post('/products/$productId/favorite');
  }

  Future<List<ProductModel>> getFavorites() async {
    final data = await _api.get('/products/favorites');
    return (data['products'] as List<dynamic>)
        .map((e) => ProductModel.fromJson(e))
        .toList();
  }
}
