import 'package:flutter/material.dart';
import '../services/inventory_service.dart';

class InventoryProvider extends ChangeNotifier {
  final InventoryService _inventoryService = InventoryService();

  List<Map<String, dynamic>> _lotes = [];
  List<Map<String, dynamic>> _inventories = [];
  Map<String, dynamic>? _currentInventory;
  Map<String, int> _countedItems = {};
  bool _isLoading = false;
  String? _error;

  List<Map<String, dynamic>> get lotes => _lotes;
  List<Map<String, dynamic>> get inventories => _inventories;
  Map<String, dynamic>? get currentInventory => _currentInventory;
  Map<String, int> get countedItems => _countedItems;
  bool get isLoading => _isLoading;
  String? get error => _error;
  int get totalCounted => _countedItems.length;
  int get totalExpected => _currentInventory?['expected_items'] ?? 0;
  double get progress => totalExpected > 0 ? totalCounted / totalExpected : 0;

  Future<void> loadLotes({String? status}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _lotes = await _inventoryService.getLotes(status: status);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadInventories() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _inventories = await _inventoryService.getInventories();
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> startInventory(Map<String, dynamic> data) async {
    try {
      final result = await _inventoryService.createInventory(data);
      _currentInventory = result;
      _countedItems = {};
      notifyListeners();
      return result;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<bool> addCountItem(int productId, int quantity) async {
    if (_currentInventory == null) return false;
    try {
      await _inventoryService.addInventoryItem(
        _currentInventory!['id'],
        {'product_id': productId, 'quantity': quantity},
      );
      _countedItems[productId.toString()] = quantity;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> submitCount() async {
    if (_currentInventory == null) return false;
    try {
      await _inventoryService.submitCount(
        _currentInventory!['id'],
        {'items': _countedItems},
      );
      _currentInventory = null;
      _countedItems = {};
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearCount() {
    _currentInventory = null;
    _countedItems = {};
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
