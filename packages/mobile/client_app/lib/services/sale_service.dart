import '../config/api_config.dart';
import '../models/sale_model.dart';
import 'api_service.dart';

class SaleService {
  final ApiService _api = ApiService();

  Future<List<SaleModel>> getSales({int page = 1, int limit = 20}) async {
    final data = await _api.get(ApiConfig.salesEndpoint, queryParams: {
      'page': page.toString(),
      'limit': limit.toString(),
    });
    return (data['sales'] as List<dynamic>)
        .map((e) => SaleModel.fromJson(e))
        .toList();
  }

  Future<SaleModel> getSaleDetail(int saleId) async {
    final data = await _api.get('${ApiConfig.salesEndpoint}/$saleId');
    return SaleModel.fromJson(data['sale']);
  }

  Future<SaleModel> createSale(Map<String, dynamic> saleData) async {
    final data = await _api.post(ApiConfig.salesEndpoint, body: saleData);
    return SaleModel.fromJson(data['sale']);
  }

  Future<Map<String, dynamic>> generatePix(int saleId) async {
    return await _api.post('${ApiConfig.salesEndpoint}/$saleId/pix');
  }

  Future<String> getPixQrCode(int saleId) async {
    final data = await _api.get('${ApiConfig.salesEndpoint}/$saleId/pix-qr');
    return data['qr_code'] ?? '';
  }

  Future<void> cancelSale(int saleId) async {
    await _api.post('${ApiConfig.salesEndpoint}/$saleId/cancel');
  }
}
