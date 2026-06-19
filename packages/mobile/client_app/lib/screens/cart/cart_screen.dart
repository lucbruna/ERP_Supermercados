import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/cart_provider.dart';
import '../../models/product_model.dart' as prod;

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  String? _pixCode;
  String _selectedPayment = 'pix';
  bool _isCheckoutLoading = false;

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text('Carrinho (${cartProvider.uniqueItemsCount})'),
        actions: [
          if (!cartProvider.isEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: () => _showClearDialog(cartProvider),
            ),
        ],
      ),
      body: cartProvider.isEmpty ? _buildEmptyCart() : _buildCartContent(cartProvider),
      bottomNavigationBar: cartProvider.isEmpty
          ? null
          : _buildCheckoutBar(cartProvider),
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.shopping_cart_outlined,
                size: 48,
                color: AppTheme.primaryGreen,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Seu carrinho está vazio',
              style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Explore nossos produtos e adicione itens ao carrinho',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () => Navigator.pushNamed(context, AppRoutes.products),
              icon: const Icon(Icons.shopping_bag_outlined),
              label: const Text('Ver Produtos'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCartContent(CartProvider cart) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: cart.items.length,
            itemBuilder: (context, index) {
              final item = cart.items[index];
              final product = item.product;
              return Dismissible(
                key: Key(product.id.toString()),
                direction: DismissDirection.endToStart,
                background: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 20),
                  color: AppTheme.error,
                  child: const Icon(Icons.delete_outline, color: Colors.white),
                ),
                onDismissed: (_) => cart.removeItem(product.id),
                child: Card(
                  margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Container(
                          width: 64,
                          height: 64,
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
                                product.name,
                                style: GoogleFonts.inter(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'R\$ ${product.price.toStringAsFixed(2)}',
                                style: GoogleFonts.inter(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primaryGreen,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: AppTheme.divider),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              InkWell(
                                onPressed: () => cart.updateQuantity(product.id, item.quantity - 1),
                                child: const Padding(
                                  padding: EdgeInsets.all(8),
                                  child: Icon(Icons.remove, size: 18),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                child: Text(
                                  '${item.quantity}',
                                  style: GoogleFonts.inter(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: AppTheme.textPrimary,
                                  ),
                                ),
                              ),
                              InkWell(
                                onPressed: () => cart.updateQuantity(product.id, item.quantity + 1),
                                child: const Padding(
                                  padding: EdgeInsets.all(8),
                                  child: Icon(Icons.add, size: 18),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        if (cart.couponCode != null)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.success.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(Icons.confirmation_number, color: AppTheme.success),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Cupom aplicado: ${cart.couponCode}',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.success,
                        ),
                      ),
                      Text(
                        'Desconto: R\$ ${cart.couponDiscount.toStringAsFixed(2)}',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppTheme.success,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 18, color: AppTheme.success),
                  onPressed: () => cart.removeCoupon(),
                ),
              ],
            ),
          ),
        _buildCouponSection(cart),
      ],
    );
  }

  Widget _buildCouponSection(CartProvider cart) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Código do cupom',
                prefixIcon: const Icon(Icons.confirmation_number_outlined, size: 20),
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: AppTheme.divider),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            ),
            child: const Text('Aplicar'),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckoutBar(CartProvider cart) {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 12, 20, MediaQuery.of(context).padding.bottom + 12),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.textSecondary,
                ),
              ),
              Text(
                'R\$ ${cart.total.toStringAsFixed(2)}',
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryGreen,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildPaymentOption('pix', 'PIX', Icons.pix, true),
                const SizedBox(width: 8),
                _buildPaymentOption('credit', 'Crédito', Icons.credit_card, false),
                const SizedBox(width: 8),
                _buildPaymentOption('debit', 'Débito', Icons.credit_card, false),
                const SizedBox(width: 8),
                _buildPaymentOption('cash', 'Dinheiro', Icons.money, false),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: _isCheckoutLoading ? null : () => _handleCheckout(cart),
              child: _isCheckoutLoading
                  ? const SizedBox(
                      height: 24,
                      width: 24,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Text('Finalizar Compra - R\$ ${cart.total.toStringAsFixed(2)}'),
            ),
          ),
          if (_pixCode != null) _buildPixDialog(),
        ],
      ),
    );
  }

  Widget _buildPaymentOption(String value, String label, IconData icon, bool isSelected) {
    final selected = _selectedPayment == value;
    return GestureDetector(
      onTap: () => setState(() => _selectedPayment = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? AppTheme.primaryGreen.withOpacity(0.1) : Colors.grey[50],
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: selected ? AppTheme.primaryGreen : AppTheme.divider,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: selected ? AppTheme.primaryGreen : AppTheme.textSecondary),
            const SizedBox(width: 6),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
                color: selected ? AppTheme.primaryGreen : AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPixDialog() {
    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.primaryGreen.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.primaryGreen.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Text(
            'Pague com PIX',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppTheme.primaryGreen,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: QrImageView(
              data: _pixCode!,
              version: QrVersions.auto,
              size: 200,
              eyeStyle: const QrEyeStyle(
                eyeShape: QrEyeShape.square,
                color: AppTheme.textPrimary,
              ),
              dataModuleStyle: const QrDataModuleStyle(
                dataModuleShape: QrDataModuleShape.square,
                color: AppTheme.textPrimary,
              ),
            ),
          ),
          const SizedBox(height: 12),
          SelectableText(
            _pixCode!,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: AppTheme.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  void _showClearDialog(CartProvider cart) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Limpar carrinho'),
        content: const Text('Tem certeza que deseja remover todos os itens?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              cart.clearCart();
              Navigator.pop(context);
            },
            child: const Text('Limpar'),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.error),
          ),
        ],
      ),
    );
  }

  Future<void> _handleCheckout(CartProvider cart) async {
    if (_selectedPayment == 'pix') {
      setState(() => _isCheckoutLoading = true);
      await Future.delayed(const Duration(seconds: 2));
      setState(() {
        _pixCode = '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000' 
            '52040000530398654061234.005802BR5905Super6008Sao Paulo62070503***6304A1B2';
        _isCheckoutLoading = false;
      });
    } else {
      setState(() => _isCheckoutLoading = true);
      try {
        await cart.checkout();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Compra finalizada com sucesso!'),
            backgroundColor: AppTheme.success,
          ),
        );
        Navigator.pushNamed(context, AppRoutes.saleHistory);
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro: ${e.toString()}'),
            backgroundColor: AppTheme.error,
          ),
        );
      } finally {
        setState(() => _isCheckoutLoading = false);
      }
    }
  }
}
