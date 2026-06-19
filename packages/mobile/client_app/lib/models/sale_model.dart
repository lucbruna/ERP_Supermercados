import 'product_model.dart';

class SaleItemModel {
  final int id;
  final int productId;
  final String productName;
  final String productImage;
  final double quantity;
  final double unitPrice;
  final double totalPrice;

  SaleItemModel({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productImage,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory SaleItemModel.fromJson(Map<String, dynamic> json) {
    return SaleItemModel(
      id: json['id'] ?? 0,
      productId: json['product_id'] ?? 0,
      productName: json['product_name'] ?? '',
      productImage: json['product_image'] ?? '',
      quantity: (json['quantity'] ?? 0).toDouble(),
      unitPrice: (json['unit_price'] ?? 0).toDouble(),
      totalPrice: (json['total_price'] ?? 0).toDouble(),
    );
  }
}

class SaleModel {
  final int id;
  final String saleCode;
  final double totalAmount;
  final double discount;
  final double finalAmount;
  final int itemsCount;
  final String paymentMethod;
  final String? pixCode;
  final String status;
  final int? fidelityPointsEarned;
  final double? cashbackEarned;
  final String? couponUsed;
  final List<SaleItemModel> items;
  final DateTime createdAt;

  SaleModel({
    required this.id,
    required this.saleCode,
    required this.totalAmount,
    this.discount = 0.0,
    required this.finalAmount,
    required this.itemsCount,
    required this.paymentMethod,
    this.pixCode,
    required this.status,
    this.fidelityPointsEarned,
    this.cashbackEarned,
    this.couponUsed,
    this.items = const [],
    required this.createdAt,
  });

  factory SaleModel.fromJson(Map<String, dynamic> json) {
    return SaleModel(
      id: json['id'] ?? 0,
      saleCode: json['sale_code'] ?? '',
      totalAmount: (json['total_amount'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      finalAmount: (json['final_amount'] ?? 0).toDouble(),
      itemsCount: json['items_count'] ?? 0,
      paymentMethod: json['payment_method'] ?? '',
      pixCode: json['pix_code'],
      status: json['status'] ?? 'pending',
      fidelityPointsEarned: json['fidelity_points_earned'],
      cashbackEarned: json['cashback_earned']?.toDouble(),
      couponUsed: json['coupon_used'],
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => SaleItemModel.fromJson(e))
              .toList() ??
          [],
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  String get formattedTotal => 'R\$ ${totalAmount.toStringAsFixed(2)}';
  String get formattedFinal => 'R\$ ${finalAmount.toStringAsFixed(2)}';
  String get formattedDiscount => 'R\$ ${discount.toStringAsFixed(2)}';

  String get statusLabel {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      case 'refunded':
        return 'Reembolsada';
      default:
        return status;
    }
  }

  String get paymentLabel {
    switch (paymentMethod) {
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'debit_card':
        return 'Cartão de Débito';
      case 'pix':
        return 'PIX';
      case 'cash':
        return 'Dinheiro';
      case 'meal_ticket':
        return 'Vale Refeição';
      default:
        return paymentMethod;
    }
  }
}
