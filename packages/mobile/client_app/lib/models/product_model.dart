class ProductModel {
  final int id;
  final String name;
  final String description;
  final double price;
  final double? originalPrice;
  final double? discountPercent;
  final String category;
  final String? categoryIcon;
  final String imageUrl;
  final String? barcode;
  final String unit;
  final double? rating;
  final int reviewCount;
  final bool isAvailable;
  final bool isFavorite;
  final int stockQuantity;
  final List<String> tags;
  final DateTime createdAt;

  ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.originalPrice,
    this.discountPercent,
    required this.category,
    this.categoryIcon,
    required this.imageUrl,
    this.barcode,
    required this.unit,
    this.rating,
    this.reviewCount = 0,
    this.isAvailable = true,
    this.isFavorite = false,
    this.stockQuantity = 0,
    this.tags = const [],
    required this.createdAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      originalPrice: json['original_price']?.toDouble(),
      discountPercent: json['discount_percent']?.toDouble(),
      category: json['category'] ?? '',
      categoryIcon: json['category_icon'],
      imageUrl: json['image_url'] ?? '',
      barcode: json['barcode'],
      unit: json['unit'] ?? 'un',
      rating: json['rating']?.toDouble(),
      reviewCount: json['review_count'] ?? 0,
      isAvailable: json['is_available'] ?? true,
      isFavorite: json['is_favorite'] ?? false,
      stockQuantity: json['stock_quantity'] ?? 0,
      tags: List<String>.from(json['tags'] ?? []),
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'original_price': originalPrice,
      'discount_percent': discountPercent,
      'category': category,
      'category_icon': categoryIcon,
      'image_url': imageUrl,
      'barcode': barcode,
      'unit': unit,
      'rating': rating,
      'review_count': reviewCount,
      'is_available': isAvailable,
      'is_favorite': isFavorite,
      'stock_quantity': stockQuantity,
      'tags': tags,
      'created_at': createdAt.toIso8601String(),
    };
  }

  ProductModel copyWith({bool? isFavorite}) {
    return ProductModel(
      id: id,
      name: name,
      description: description,
      price: price,
      originalPrice: originalPrice,
      discountPercent: discountPercent,
      category: category,
      categoryIcon: categoryIcon,
      imageUrl: imageUrl,
      barcode: barcode,
      unit: unit,
      rating: rating,
      reviewCount: reviewCount,
      isAvailable: isAvailable,
      isFavorite: isFavorite ?? this.isFavorite,
      stockQuantity: stockQuantity,
      tags: tags,
      createdAt: createdAt,
    );
  }

  bool get hasDiscount => discountPercent != null && discountPercent! > 0;

  String get formattedPrice => 'R\$ ${price.toStringAsFixed(2)}';

  String get formattedOriginalPrice =>
      originalPrice != null ? 'R\$ ${originalPrice!.toStringAsFixed(2)}' : '';
}
