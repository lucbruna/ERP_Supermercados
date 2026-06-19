import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../providers/product_provider.dart';
import '../../providers/stock_provider.dart';
import '../../widgets/product_card.dart';
import '../../services/api_service.dart';

class ProductDetailScreen extends StatefulWidget {
  final int productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductProvider>().loadProductDetail(widget.productId);
      context.read<StockProvider>().loadStockByProduct(widget.productId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();
    final stockProvider = context.watch<StockProvider>();
    final product = productProvider.selectedProduct;
    final stock = stockProvider.productStock;

    return Scaffold(
      appBar: AppBar(title: const Text('Detalhes do Produto')),
      body: productProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : product == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 48, color: AppTheme.error),
                      const SizedBox(height: 16),
                      Text(productProvider.error ?? 'Produto não encontrado', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () async {
                    await context.read<ProductProvider>().loadProductDetail(widget.productId);
                    await context.read<StockProvider>().loadStockByProduct(widget.productId);
                  },
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
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
                                      width: 80, height: 80,
                                      decoration: BoxDecoration(
                                        color: AppTheme.primary.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      child: const Icon(Icons.inventory_2, color: AppTheme.primary, size: 40),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(product['nome'] ?? product['name'] ?? '', style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold)),
                                          const SizedBox(height: 4),
                                          Text('Código: ${product['codigo'] ?? product['code'] ?? ''}', style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary)),
                                          Text('Cód. Barras: ${product['barcode'] ?? product['codigo_barras'] ?? '-'}', style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary)),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                const Divider(),
                                const SizedBox(height: 8),
                                _buildInfoRow('Categoria', product['categoria'] ?? product['category'] ?? '-'),
                                _buildInfoRow('Marca', product['marca'] ?? product['brand'] ?? '-'),
                                _buildInfoRow('Unidade', product['unidade'] ?? product['unit'] ?? 'un'),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Preços', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 12),
                                _buildInfoRow('Preço de Custo', 'R\$ ${(product['preco_custo'] ?? product['cost_price'] ?? 0).toStringAsFixed(2)}'),
                                _buildInfoRow('Preço de Venda', 'R\$ ${(product['preco_venda'] ?? product['sale_price'] ?? 0).toStringAsFixed(2)}'),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Estoque por Lote', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 12),
                                if (stock != null && stock['lotes'] != null)
                                  ...List<Widget>.from((stock['lotes'] as List).map((lote) => _buildLoteItem(lote)))
                                else
                                  Text('Nenhum lote encontrado', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Localização', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 8),
                                _buildInfoRow('Corredor', product['corredor'] ?? product['aisle'] ?? '-'),
                                _buildInfoRow('Prateleira', product['prateleira'] ?? product['shelf'] ?? '-'),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        if (stock != null && stock['movements'] != null)
                          Card(
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Últimas Movimentações', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                                  const SizedBox(height: 12),
                                  ...List<Widget>.from((stock['movements'] as List).take(5).map((mov) => _buildMovementItem(mov))),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary)),
          Text(value, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppTheme.textPrimary)),
        ],
      ),
    );
  }

  Widget _buildLoteItem(dynamic lote) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Lote: ${lote['numero'] ?? lote['number'] ?? '-'}', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500)),
              Text('Validade: ${lote['validade'] ?? lote['expiry_date'] ?? '-'}', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
            ],
          ),
          Text('${lote['quantidade'] ?? lote['quantity'] ?? 0}', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primary)),
        ],
      ),
    );
  }

  Widget _buildMovementItem(dynamic mov) {
    final tipo = mov['tipo'] ?? mov['type'] ?? '';
    final isEntry = tipo == 'entrada' || tipo == 'in';
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: (isEntry ? AppTheme.success : AppTheme.error).withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(isEntry ? Icons.add_circle_outline : Icons.remove_circle_outline, color: isEntry ? AppTheme.success : AppTheme.error, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(mov['descricao'] ?? mov['description'] ?? tipo, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500)),
                Text(mov['data'] ?? mov['date'] ?? '', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          Text('${isEntry ? '+' : '-'}${mov['quantidade'] ?? mov['quantity'] ?? 0}', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: isEntry ? AppTheme.success : AppTheme.error)),
        ],
      ),
    );
  }
}
