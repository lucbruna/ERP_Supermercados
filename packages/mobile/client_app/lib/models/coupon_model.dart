class CouponModel {
  final int id;
  final String code;
  final String title;
  final String description;
  final double? discountPercent;
  final double? discountFixed;
  final double? minPurchaseValue;
  final String? applicableCategory;
  final int? maxUses;
  final int currentUses;
  final DateTime validFrom;
  final DateTime validUntil;
  final bool isActive;
  final bool isUsed;
  final String status;

  CouponModel({
    required this.id,
    required this.code,
    required this.title,
    required this.description,
    this.discountPercent,
    this.discountFixed,
    this.minPurchaseValue,
    this.applicableCategory,
    this.maxUses,
    this.currentUses = 0,
    required this.validFrom,
    required this.validUntil,
    this.isActive = true,
    this.isUsed = false,
    this.status = 'active',
  });

  factory CouponModel.fromJson(Map<String, dynamic> json) {
    return CouponModel(
      id: json['id'] ?? 0,
      code: json['code'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      discountPercent: json['discount_percent']?.toDouble(),
      discountFixed: json['discount_fixed']?.toDouble(),
      minPurchaseValue: json['min_purchase_value']?.toDouble(),
      applicableCategory: json['applicable_category'],
      maxUses: json['max_uses'],
      currentUses: json['current_uses'] ?? 0,
      validFrom: DateTime.parse(json['valid_from'] ?? DateTime.now().toIso8601String()),
      validUntil: DateTime.parse(json['valid_until'] ?? DateTime.now().toIso8601String()),
      isActive: json['is_active'] ?? true,
      isUsed: json['is_used'] ?? false,
      status: json['status'] ?? 'active',
    );
  }

  bool get isExpired => DateTime.now().isAfter(validUntil);
  bool get isValid => isActive && !isUsed && !isExpired && (maxUses == null || currentUses < maxUses!);
  bool get isPercentual => discountPercent != null;

  String get discountText {
    if (discountPercent != null) {
      return '${discountPercent!.toStringAsFixed(0)}% OFF';
    } else if (discountFixed != null) {
      return 'R\$ ${discountFixed!.toStringAsFixed(2)} OFF';
    }
    return '';
  }

  String get statusLabel {
    if (isUsed) return 'Usado';
    if (isExpired) return 'Expirado';
    if (!isActive) return 'Inativo';
    return 'Ativo';
  }

  String get formattedValidUntil {
    final months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return '${validUntil.day} ${months[validUntil.month - 1]} ${validUntil.year}';
  }
}
