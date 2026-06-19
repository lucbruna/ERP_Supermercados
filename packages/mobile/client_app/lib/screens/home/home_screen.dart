import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../models/product_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../services/product_service.dart';
import '../../services/offline_service.dart';
import '../../widgets/product_card.dart';
import '../../widgets/bottom_nav.dart';
import '../../widgets/offline_banner.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _searchController = TextEditingController();
  final _productService = ProductService();
  final _offlineService = ClientOfflineService();
  int _selectedNavIndex = 0;
  List<ProductModel> _offers = [];
  List<ProductModel> _bestSellers = [];
  bool _offersLoading = true;
  bool _bestSellersLoading = true;

  final List<Map<String, dynamic>> _categories = [
    {'name': 'Hortifrúti', 'icon': Icons.eco, 'color': const Color(0xFF4CAF50)},
    {'name': 'Carnes', 'icon': Icons.restaurant, 'color': const Color(0xFFE53935)},
    {'name': 'Laticínios', 'icon': Icons.breakfast_dining, 'color': const Color(0xFFFFB300)},
    {'name': 'Bebidas', 'icon': Icons.local_drink, 'color': const Color(0xFF2196F3)},
    {'name': 'Padaria', 'icon': Icons.bakery_dining, 'color': const Color(0xFF8D6E63)},
    {'name': 'Limpeza', 'icon': Icons.cleaning_services, 'color': const Color(0xFF9C27B0)},
    {'name': 'Higiene', 'icon': Icons.shower, 'color': const Color(0xFF00BCD4)},
    {'name': 'Enlatados', 'icon': Icons.inventory_2, 'color': const Color(0xFF607D8B)},
  ];

  @override
  void initState() {
    super.initState();
    _loadOffers();
    _loadBestSellers();
  }

  Future<void> _loadOffers() async {
    try {
      final offers = await _productService.getOffers();
      _offlineService.cacheProducts(
        offers.map((e) => e.toJson()).toList(),
      );
      setState(() {
        _offers = offers;
        _offersLoading = false;
      });
    } catch (_) {
      final cached = await _offlineService.getCachedProducts();
      if (cached != null) {
        setState(() {
          _offers = cached.map((e) => ProductModel.fromJson(e)).toList();
          _offersLoading = false;
        });
      } else {
        setState(() => _offersLoading = false);
      }
    }
  }

  Future<void> _loadBestSellers() async {
    try {
      final products = await _productService.getProducts(sortBy: 'rating', limit: 6);
      _offlineService.cacheProducts(
        products.map((e) => e.toJson()).toList(),
      );
      setState(() {
        _bestSellers = products;
        _bestSellersLoading = false;
      });
    } catch (_) {
      final cached = await _offlineService.getCachedProducts();
      if (cached != null) {
        setState(() {
          _bestSellers = cached.map((e) => ProductModel.fromJson(e)).toList();
          _bestSellersLoading = false;
        });
      } else {
        setState(() => _bestSellersLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final authProvider = context.watch<AuthProvider>();
    final cartProvider = context.watch<CartProvider>();

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            const ClientOfflineBanner(),
            Expanded(
              child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(authProvider, size),
              _buildSearchBar(),
              _buildOffersSection(size),
              _buildCategoriesSection(),
              _buildProductsSection(),
              const SizedBox(height: 80),
            ],
          ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNav(
        currentIndex: _selectedNavIndex,
        cartItemCount: cartProvider.totalItems,
        onTap: (index) {
          setState(() => _selectedNavIndex = index);
          switch (index) {
            case 1:
              Navigator.pushNamed(context, AppRoutes.products);
              break;
            case 2:
              Navigator.pushNamed(context, AppRoutes.cart);
              break;
            case 3:
              Navigator.pushNamed(context, AppRoutes.fidelity);
              break;
            case 4:
              Navigator.pushNamed(context, AppRoutes.more);
              break;
          }
        },
      ),
    );
  }

  Widget _buildHeader(AuthProvider auth, Size size) {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 16, 20, 20),
      decoration: const BoxDecoration(
        color: AppTheme.primaryGreen,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: Colors.white.withOpacity(0.2),
            child: Text(
              auth.user?.initials ?? '?',
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Olá, ${auth.user?.name?.split(' ').first ?? 'Visitante'}!',
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Bem-vindo ao Supermercado',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: Colors.white.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: InkWell(
        onTap: () => Navigator.pushNamed(context, AppRoutes.products),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              const Icon(Icons.search, color: AppTheme.textSecondary),
              const SizedBox(width: 12),
              Text(
                'Buscar produtos...',
                style: GoogleFonts.inter(
                  color: AppTheme.textSecondary,
                  fontSize: 15,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppTheme.primaryGreen.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.tune, color: AppTheme.primaryGreen, size: 20),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOffersSection(Size size) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Ofertas do Dia 🔥',
                style: GoogleFonts.inter(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, AppRoutes.products),
                child: const Text('Ver todas'),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 200,
          child: _offersLoading
              ? _buildShimmerList(size)
              : ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: _offers.length,
                  itemBuilder: (context, index) {
                    final offer = _offers[index];
                    return Container(
                      width: size.width * 0.55,
                      margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                      child: ProductCard(
                        name: offer.name,
                        price: offer.price,
                        originalPrice: offer.originalPrice,
                        discount: offer.discountPercent != null
                            ? '${offer.discountPercent!.toStringAsFixed(0)}%'
                            : null,
                        imageUrl: offer.imageUrl,
                        onTap: () {},
                        onAddToCart: () {},
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildCategoriesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Text(
            'Categorias',
            style: GoogleFonts.inter(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 90,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: _categories.length,
            itemBuilder: (context, index) {
              final cat = _categories[index];
              return Container(
                width: 80,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                child: Column(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: (cat['color'] as Color).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(cat['icon'] as IconData, color: cat['color'], size: 28),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      cat['name'],
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AppTheme.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildProductsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Mais Vendidos',
                style: GoogleFonts.inter(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, AppRoutes.products),
                child: const Text('Ver todos'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        _buildProductGrid(),
      ],
    );
  }

  Widget _buildProductGrid() {
    if (_bestSellersLoading) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.65,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
          ),
          itemCount: 6,
          itemBuilder: (context, index) {
            return Shimmer.fromColors(
              baseColor: Colors.grey[300]!,
              highlightColor: Colors.grey[100]!,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            );
          },
        ),
      );
    }

    final cartProvider = context.read<CartProvider>();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.65,
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
        ),
        itemCount: _bestSellers.length,
        itemBuilder: (context, index) {
          final product = _bestSellers[index];
          return ProductCard(
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discountPercent != null
                ? '${product.discountPercent!.toStringAsFixed(0)}%'
                : null,
            imageUrl: product.imageUrl,
            rating: product.rating,
            onTap: () => Navigator.pushNamed(
              context,
              AppRoutes.productDetail,
              arguments: product,
            ),
            onAddToCart: () {
              cartProvider.addItem(product);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('${product.name} adicionado ao carrinho'),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildShimmerList(Size size) {
    return ListView.builder(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      itemCount: 4,
      itemBuilder: (context, index) {
        return Container(
          width: size.width * 0.55,
          margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
          child: Shimmer.fromColors(
            baseColor: Colors.grey[300]!,
            highlightColor: Colors.grey[100]!,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        );
      },
    );
  }
}
