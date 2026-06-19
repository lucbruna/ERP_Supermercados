import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/store_provider.dart';
import '../../widgets/product_card.dart';
import '../../widgets/offline_banner.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final _searchController = TextEditingController();
  bool _showLowStock = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<StoreProvider>().loadProducts();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearch(String query) {
    context.read<StoreProvider>().loadProducts(search: query.isNotEmpty ? query : null);
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');
    return Scaffold(
      appBar: AppBar(title: const Text('Estoque')),
      body: Column(
        children: [
          const ManagerOfflineBanner(),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Buscar produto...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              _onSearch('');
                            },
                          )
                        : null,
                  ),
                  onSubmitted: _onSearch,
                  onChanged: (v) => setState(() {}),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    FilterChip(
                      label: Text('Estoque Baixo', style: GoogleFonts.inter(fontSize: 12)),
                      selected: _showLowStock,
                      onSelected: (v) => setState(() => _showLowStock = v),
                      selectedColor: AppTheme.warning.withOpacity(0.2),
                    ),
                    const SizedBox(width: 8),
                    if (_showLowStock)
                      TextButton(
                        onPressed: () => setState(() => _showLowStock = false),
                        child: const Text('Limpar Filtro'),
                      ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: Consumer<StoreProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading && provider.products.isEmpty) {
                  return _buildShimmer();
                }
                if (provider.error != null && provider.products.isEmpty) {
                  return _buildError(provider);
                }

                var products = provider.products;
                if (_showLowStock) {
                  products = provider.lowStockProducts;
                }

                if (products.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.inventory_2, size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 16),
                        Text('Nenhum produto encontrado', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => provider.loadProducts(),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: products.length,
                    itemBuilder: (context, index) {
                      final product = products[index] as Map<String, dynamic>;
                      final name = product['name'] ?? product['nome'] ?? 'Produto';
                      final price = (product['price'] ?? product['preco'] ?? 0).toDouble();
                      final stock = product['stock'] ?? product['estoque'] ?? 0;
                      final minStock = product['min_stock'] ?? product['estoque_minimo'] ?? 0;
                      final isLow = stock <= minStock;
                      return ProductCard(
                        name: name,
                        price: currencyFormat.format(price),
                        stock: '$stock',
                        isLowStock: isLow,
                        onTap: () {},
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: List.generate(8, (_) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          height: 80,
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
        )),
      ),
    );
  }

  Widget _buildError(StoreProvider provider) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.cloud_off, size: 64, color: AppTheme.textSecondary),
          const SizedBox(height: 16),
          Text(provider.error!, style: GoogleFonts.inter(color: AppTheme.textSecondary)),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => provider.loadProducts(),
            icon: const Icon(Icons.refresh),
            label: const Text('Tentar Novamente'),
          ),
        ],
      ),
    );
  }
}
