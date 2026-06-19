import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:offline/offline.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../models/product_model.dart';
import '../../providers/cart_provider.dart';
import '../../services/product_service.dart';
import '../../services/offline_service.dart';
import '../../widgets/product_card.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  final _productService = ProductService();
  final _offlineService = ClientOfflineService();
  final SyncService _syncService = SyncService();
  StreamSubscription<SyncStatus>? _syncSub;
  String _selectedCategory = 'Todos';
  String _sortBy = 'relevance';
  bool _isGridView = true;
  bool _isLoading = true;
  bool _isOffline = false;

  final List<String> _categories = [
    'Todos', 'Hortifrúti', 'Carnes', 'Laticínios', 'Bebidas',
    'Padaria', 'Limpeza', 'Higiene', 'Enlatados', 'Massas',
    'Congelados', 'Doces', 'Biscoitos', 'Grãos',
  ];

  List<Map<String, dynamic>> _products = [];
  int _pendingCount = 0;

  @override
  void initState() {
    super.initState();
    _loadProducts();
    _syncSub = _syncService.onStatusChanged.listen((status) {
      if (mounted) {
        setState(() {
          _isOffline = !status.isOnline;
          _pendingCount = status.pendingCount;
        });
      }
    });
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoading = true);
    try {
      final data = await _productService.getProducts();
      _offlineService.cacheProducts(data.map((e) => e.toJson()).toList());
      setState(() {
        _products = data.map((e) => e.toJson()).toList();
        _isLoading = false;
        _isOffline = false;
      });
    } catch (_) {
      final cached = await _offlineService.getCachedProducts();
      setState(() {
        _products = cached ?? [];
        _isLoading = false;
        _isOffline = true;
      });
    }
  }

  List<Map<String, dynamic>> get _filteredProducts {
    var filtered = List<Map<String, dynamic>>.from(_products);
    if (_selectedCategory != 'Todos') {
      filtered = filtered.where((p) => p['category'] == _selectedCategory).toList();
    }
    if (_searchController.text.isNotEmpty) {
      final query = _searchController.text.toLowerCase();
      filtered = filtered.where((p) => (p['name'] as String).toLowerCase().contains(query)).toList();
    }
    switch (_sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a['price'] as double).compareTo(b['price'] as double));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b['price'] as double).compareTo(a['price'] as double));
        break;
      case 'rating':
        filtered.sort((a, b) => (b['rating'] as double).compareTo(a['rating'] as double));
        break;
      case 'name':
        filtered.sort((a, b) => (a['name'] as String).compareTo(b['name'] as String));
        break;
    }
    return filtered;
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    _syncSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Produtos'),
        actions: [
          SyncStatusIndicator(),
          const SizedBox(width: 8),
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined),
                onPressed: () => Navigator.pushNamed(context, AppRoutes.cart),
              ),
              if (cartProvider.totalItems > 0)
                Positioned(
                  right: 4,
                  top: 4,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${cartProvider.totalItems}',
                      style: const TextStyle(fontSize: 10, color: Colors.white),
                    ),
                  ),
                ),
            ],
          ),
          IconButton(
            icon: Icon(_isGridView ? Icons.view_list : Icons.grid_view),
            onPressed: () => setState(() => _isGridView = !_isGridView),
          ),
        ],
      ),
      body: Column(
        children: [
          if (_isOffline)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: Colors.amber[800],
              child: Row(
                children: [
                  const Icon(Icons.wifi_off, color: Colors.white, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Modo Offline - Exibindo dados em cache',
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 12),
                    ),
                  ),
                  if (_pendingCount > 0)
                    Text(
                      '$_pendingCount pendentes',
                      style: GoogleFonts.inter(color: Colors.white70, fontSize: 12),
                    ),
                ],
              ),
            ),
          _buildSearchFilterBar(),
          _buildCategoriesHorizontal(),
          Expanded(child: _buildProductList()),
        ],
      ),
    );
  }

  Widget _buildSearchFilterBar() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Buscar...',
                prefixIcon: const Icon(Icons.search, size: 20),
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: Colors.grey[100],
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          const SizedBox(width: 8),
          PopupMenuButton<String>(
            onSelected: (v) => setState(() => _sortBy = v),
            icon: const Icon(Icons.sort, color: AppTheme.primaryGreen),
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'relevance', child: Text('Relevância')),
              const PopupMenuItem(value: 'price_asc', child: Text('Menor Preço')),
              const PopupMenuItem(value: 'price_desc', child: Text('Maior Preço')),
              const PopupMenuItem(value: 'rating', child: Text('Melhor Avaliação')),
              const PopupMenuItem(value: 'name', child: Text('Nome A-Z')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCategoriesHorizontal() {
    return Container(
      height: 48,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedCategory == _categories[index];
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            child: ChoiceChip(
              label: Text(_categories[index]),
              selected: isSelected,
              onSelected: (_) => setState(() => _selectedCategory = _categories[index]),
              selectedColor: AppTheme.primaryGreen,
              labelStyle: TextStyle(
                color: isSelected ? Colors.white : AppTheme.textSecondary,
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
              backgroundColor: Colors.grey[100],
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide.none,
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildProductList() {
    final products = _filteredProducts;

    if (products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(
              'Nenhum produto encontrado',
              style: GoogleFonts.inter(
                fontSize: 16,
                color: AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    if (_isGridView) {
      return GridView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(8),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.65,
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
        ),
        itemCount: products.length,
        itemBuilder: (context, index) {
          final product = products[index];
          return ProductCard(
            name: product['name'],
            price: product['price'],
            originalPrice: product['original_price'],
            discount: product['discount'],
            imageUrl: product['image'],
            rating: product['rating'],
            onTap: () => Navigator.pushNamed(
              context,
              AppRoutes.productDetail,
              arguments: product,
            ),
            onAddToCart: () {
              cartProvider.addItem(
                _createProductModel(product),
              );
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('${product['name']} adicionado ao carrinho'),
                  duration: const Duration(seconds: 2),
                  action: SnackBarAction(
                    label: 'OK',
                    onPressed: () {},
                  ),
                ),
              );
            },
          );
        },
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(8),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => Navigator.pushNamed(
              context,
              AppRoutes.productDetail,
              arguments: product,
            ),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.image, color: Colors.grey),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product['name'],
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          product['category'],
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Text(
                              'R\$ ${product['price'].toStringAsFixed(2)}',
                              style: GoogleFonts.inter(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryGreen,
                              ),
                            ),
                            if (product['original_price'] != null) ...[
                              const SizedBox(width: 8),
                              Text(
                                'R\$ ${product['original_price'].toStringAsFixed(2)}',
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  decoration: TextDecoration.lineThrough,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.add_shopping_cart, color: AppTheme.primaryGreen),
                    onPressed: () {
                      cartProvider.addItem(_createProductModel(product));
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('${product['name']} adicionado')),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  dynamic _createProductModel(Map<String, dynamic> product) {
    return ProductModel(
      id: product['id'],
      name: product['name'],
      description: '',
      price: product['price'],
      originalPrice: product['original_price'],
      discountPercent: product['discount'] != null
          ? double.tryParse(product['discount'].toString().replaceAll('%', ''))
          : null,
      category: product['category'],
      imageUrl: product['image'] ?? '',
      unit: 'un',
      rating: product['rating'],
      reviewCount: 0,
      isAvailable: true,
      isFavorite: false,
      stockQuantity: 50,
      tags: [],
      createdAt: DateTime.now(),
    );
  }
}
