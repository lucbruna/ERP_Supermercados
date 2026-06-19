import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/product_provider.dart';
import '../../widgets/product_card.dart';
import '../../widgets/barcode_scanner_widget.dart';

class ProductSearchScreen extends StatefulWidget {
  const ProductSearchScreen({super.key});

  @override
  State<ProductSearchScreen> createState() => _ProductSearchScreenState();
}

class _ProductSearchScreenState extends State<ProductSearchScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearch(String query) {
    context.read<ProductProvider>().searchProducts(query);
  }

  void _openScanner() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => SizedBox(
        height: MediaQuery.of(context).size.height * 0.7,
        child: BarcodeScannerWidget(
          onScan: (barcode) {
            Navigator.pop(context);
            context.read<ProductProvider>().scanBarcode(barcode);
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Consultar Produto')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Buscar por nome ou código...',
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
                    onChanged: _onSearch,
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  width: 52, height: 52,
                  decoration: BoxDecoration(
                    color: AppTheme.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.qr_code_scanner, color: Colors.white),
                    onPressed: _openScanner,
                  ),
                ),
              ],
            ),
          ),
          Consumer<ProductProvider>(
            builder: (context, provider, _) {
              if (provider.isLoading) {
                return const Expanded(
                  child: Center(child: CircularProgressIndicator()),
                );
              }

              if (provider.barcodeResult != null) {
                return Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 60, height: 60,
                                    decoration: BoxDecoration(
                                      color: AppTheme.primary.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Icon(Icons.inventory_2, color: AppTheme.primary, size: 28),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(provider.barcodeResult!['nome'] ?? provider.barcodeResult!['name'] ?? 'Produto', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                                        Text('Cód: ${provider.barcodeResult!['codigo'] ?? provider.barcodeResult!['code'] ?? ''}', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                                      ],
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.arrow_forward_ios, size: 16),
                                    onPressed: () => Navigator.pushNamed(context, AppRoutes.productDetail,
                                        arguments: provider.barcodeResult!['id']),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceAround,
                                children: [
                                  _buildInfoChip('Estoque', '${provider.barcodeResult!['estoque'] ?? provider.barcodeResult!['stock'] ?? 0}', AppTheme.primary),
                                  _buildInfoChip('Preço', 'R\$ ${(provider.barcodeResult!['preco'] ?? provider.barcodeResult!['price'] ?? 0).toStringAsFixed(2)}', AppTheme.success),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }

              if (provider.error != null) {
                return Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline, size: 48, color: AppTheme.error),
                        const SizedBox(height: 16),
                        Text(provider.error!, style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                      ],
                    ),
                  ),
                );
              }

              if (provider.products.isEmpty) {
                return Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.search, size: 48, color: AppTheme.textSecondary),
                        const SizedBox(height: 16),
                        Text('Digite o nome ou código do produto', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                        const SizedBox(height: 8),
                        Text('ou use o leitor de código de barras', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                      ],
                    ),
                  ),
                );
              }

              return Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: provider.products.length,
                  itemBuilder: (_, i) => ProductCard(
                    product: provider.products[i],
                    onTap: () => Navigator.pushNamed(
                      context, AppRoutes.productDetail,
                      arguments: provider.products[i]['id'],
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary)),
      ],
    );
  }
}
