import 'package:flutter/material.dart';
import '../services/product_service.dart';

class ProductProvider extends ChangeNotifier {
  final ProductService _productService = ProductService();

  List<Map<String, dynamic>> _products = [];
  List<Map<String, dynamic>> _categories = [];
  Map<String, dynamic>? _selectedProduct;
  Map<String, dynamic>? _barcodeResult;
  bool _isLoading = false;
  String? _error;
  String _searchQuery = '';

  List<Map<String, dynamic>> get products => _products;
  List<Map<String, dynamic>> get categories => _categories;
  Map<String, dynamic>? get selectedProduct => _selectedProduct;
  Map<String, dynamic>? get barcodeResult => _barcodeResult;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get searchQuery => _searchQuery;

  Future<void> searchProducts(String query) async {
    if (query.isEmpty) {
      _products = [];
      notifyListeners();
      return;
    }
    _searchQuery = query;
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _products = await _productService.searchProducts(query);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> scanBarcode(String barcode) async {
    _isLoading = true;
    _error = null;
    _barcodeResult = null;
    notifyListeners();

    try {
      _barcodeResult = await _productService.getProductByBarcode(barcode);
      if (_barcodeResult == null) {
        _error = 'Produto não encontrado para o código de barras: $barcode';
      }
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadProductDetail(int id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _selectedProduct = await _productService.getProductDetail(id);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadCategories() async {
    try {
      _categories = await _productService.getCategories();
      notifyListeners();
    } catch (_) {}
  }

  void clearSearch() {
    _products = [];
    _searchQuery = '';
    _barcodeResult = null;
    _error = null;
    notifyListeners();
  }

  void clearSelected() {
    _selectedProduct = null;
    notifyListeners();
  }
}
