import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/inventory_provider.dart';
import '../../providers/product_provider.dart';
import '../../widgets/inventory_progress.dart';
import '../../widgets/barcode_scanner_widget.dart';

class StockCountScreen extends StatefulWidget {
  const StockCountScreen({super.key});

  @override
  State<StockCountScreen> createState() => _StockCountScreenState();
}

class _StockCountScreenState extends State<StockCountScreen> {
  final _quantityController = TextEditingController();
  bool _isCounting = false;

  @override
  void dispose() {
    _quantityController.dispose();
    super.dispose();
  }

  void _startNewCount() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nova Contagem'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: const InputDecoration(labelText: 'Área/Seção'),
            ),
            const SizedBox(height: 16),
            TextField(
              decoration: const InputDecoration(labelText: 'Descrição'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              setState(() => _isCounting = true);
              context.read<InventoryProvider>().startInventory({'area': 'Geral', 'description': 'Contagem geral'});
            },
            child: const Text('Iniciar'),
          ),
        ],
      ),
    );
  }

  void _scanProduct() {
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

  void _confirmCount(int productId) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirmar Quantidade'),
        content: TextField(
          controller: _quantityController,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'Quantidade contada'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () {
              final qty = int.tryParse(_quantityController.text) ?? 0;
              context.read<InventoryProvider>().addCountItem(productId, qty);
              _quantityController.clear();
              Navigator.pop(ctx);
            },
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final inventory = context.watch<InventoryProvider>();
    final productProvider = context.watch<ProductProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Contar Estoque'),
        actions: [
          if (_isCounting)
            IconButton(
              icon: const Icon(Icons.check),
              onPressed: () async {
                final success = await inventory.submitCount();
                if (success && mounted) {
                  setState(() => _isCounting = false);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Contagem finalizada com sucesso!')),
                  );
                }
              },
            ),
        ],
      ),
      body: Column(
        children: [
          if (_isCounting && inventory.currentInventory != null)
            InventoryProgress(
              progress: inventory.progress,
              counted: inventory.totalCounted,
              total: inventory.totalExpected,
            ),
          Expanded(
            child: _isCounting
                ? _buildCountingUI(inventory, productProvider)
                : _buildStartUI(inventory),
          ),
        ],
      ),
    );
  }

  Widget _buildStartUI(InventoryProvider inventory) {
    return RefreshIndicator(
      onRefresh: () => inventory.loadInventories(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _startNewCount,
                icon: const Icon(Icons.add),
                label: const Text('Nova Contagem'),
              ),
            ),
            const SizedBox(height: 24),
            Text('Contagens Anteriores', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            if (inventory.inventories.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    children: [
                      Icon(Icons.inventory_2_outlined, size: 48, color: AppTheme.textSecondary),
                      const SizedBox(height: 16),
                      Text('Nenhuma contagem realizada', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                    ],
                  ),
                ),
              )
            else
              ...inventory.inventories.map((inv) => Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.inventory_2, color: AppTheme.primary, size: 20),
                  ),
                  title: Text(inv['description'] ?? 'Contagem', style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
                  subtitle: Text('${inv['counted'] ?? 0}/${inv['expected'] ?? 0} itens', style: GoogleFonts.inter(fontSize: 12)),
                  trailing: Text(inv['status'] ?? '', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                ),
              )),
          ],
        ),
      ),
    );
  }

  Widget _buildCountingUI(InventoryProvider inventory, ProductProvider productProvider) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 52,
                  child: ElevatedButton.icon(
                    onPressed: _scanProduct,
                    icon: const Icon(Icons.qr_code_scanner),
                    label: const Text('Ler Código'),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (productProvider.barcodeResult != null)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(productProvider.barcodeResult!['nome'] ?? productProvider.barcodeResult!['name'] ?? '', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                              Text('Cód: ${productProvider.barcodeResult!['codigo'] ?? productProvider.barcodeResult!['code'] ?? ''}', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                            ],
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () => _confirmCount(productProvider.barcodeResult!['id']),
                          child: const Text('Contar'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          if (inventory.countedItems.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text('Itens Contados', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            ...inventory.countedItems.entries.map((entry) => Card(
              margin: const EdgeInsets.only(bottom: 4),
              child: ListTile(
                dense: true,
                title: Text('Produto #${entry.key}', style: GoogleFonts.inter(fontSize: 14)),
                trailing: Text('${entry.value} un', style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: AppTheme.primary)),
              ),
            )),
          ],
        ],
      ),
    );
  }
}
