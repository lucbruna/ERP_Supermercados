import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/product_model.dart';
import '../services/sale_service.dart';

class CartItem {
  final ProductModel product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});

  double get totalPrice => product.price * quantity;

  Map<String, dynamic> toJson() => {
        'product_id': product.id,
        'quantity': quantity,
        'price': product.price,
      };
}

class CartProvider extends ChangeNotifier {
  final SaleService _saleService = SaleService();

  List<CartItem> _items = [];
  String? _couponCode;
  double _couponDiscount = 0.0;
  bool _isLoading = false;

  List<CartItem> get items => List.unmodifiable(_items);
  String? get couponCode => _couponCode;
  double get couponDiscount => _couponDiscount;
  bool get isLoading => _isLoading;
  bool get isEmpty => _items.isEmpty;

  int get totalItems => _items.fold(0, (sum, item) => sum + item.quantity);

  double get subtotal =>
      _items.fold(0.0, (sum, item) => sum + item.totalPrice);

  double get total => subtotal - _couponDiscount;

  int get uniqueItemsCount => _items.length;

  Future<void> loadCart() async {
    final prefs = await SharedPreferences.getInstance();
    final cartData = prefs.getString('cart_data');
    if (cartData != null) {
      try {
        final List<dynamic> decoded = jsonDecode(cartData);
        _items = decoded.map((e) {
          final product = ProductModel.fromJson(e['product']);
          return CartItem(product: product, quantity: e['quantity']);
        }).toList();
        notifyListeners();
      } catch (_) {}
    }
  }

  Future<void> _saveCart() async {
    final prefs = await SharedPreferences.getInstance();
    final cartData = jsonEncode(
      _items.map((e) => {
            'product': e.product.toJson(),
            'quantity': e.quantity,
          }).toList(),
    );
    await prefs.setString('cart_data', cartData);
  }

  Future<void> addItem(ProductModel product, {int quantity = 1}) async {
    final existingIndex = _items.indexWhere((item) => item.product.id == product.id);
    if (existingIndex >= 0) {
      _items[existingIndex].quantity += quantity;
    } else {
      _items.add(CartItem(product: product, quantity: quantity));
    }
    await _saveCart();
    notifyListeners();
  }

  Future<void> removeItem(int productId) async {
    _items.removeWhere((item) => item.product.id == productId);
    await _saveCart();
    notifyListeners();
  }

  Future<void> updateQuantity(int productId, int quantity) async {
    final index = _items.indexWhere((item) => item.product.id == productId);
    if (index >= 0) {
      if (quantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].quantity = quantity;
      }
      await _saveCart();
      notifyListeners();
    }
  }

  Future<void> clearCart() async {
    _items.clear();
    _couponCode = null;
    _couponDiscount = 0.0;
    await _saveCart();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('coupon_code');
    notifyListeners();
  }

  void applyCoupon(String code, double discount) {
    _couponCode = code;
    _couponDiscount = discount;
    notifyListeners();
  }

  void removeCoupon() {
    _couponCode = null;
    _couponDiscount = 0.0;
    notifyListeners();
  }

  Future<Map<String, dynamic>> checkout() async {
    _isLoading = true;
    notifyListeners();

    try {
      final saleData = {
        'items': _items.map((e) => e.toJson()).toList(),
        'coupon_code': _couponCode,
        'total': total,
        'subtotal': subtotal,
        'discount': _couponDiscount,
      };

      final result = await _saleService.createSale(saleData);
      await clearCart();
      return result;
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
