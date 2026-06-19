import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';

class SaleDetailScreen extends StatelessWidget {
  const SaleDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final sale = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;

    if (sale == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Detalhes da Venda')),
        body: const Center(child: Text('Venda não encontrada')),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text('Venda ${sale['code']}')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(sale),
            const SizedBox(height: 24),
            _buildInfoSection(sale),
            const SizedBox(height: 24),
            _buildItemsSection(sale),
            const SizedBox(height: 24),
            _buildTotalsSection(sale),
            const SizedBox(height: 24),
            _buildActions(sale),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(Map<String, dynamic> sale) {
    final status = sale['status'] as String;
    final isCompleted = status == 'completed';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isCompleted
              ? [AppTheme.primaryGreen, AppTheme.primaryLight]
              : [Colors.grey[400]!, Colors.grey[300]!],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Icon(
            isCompleted ? Icons.check_circle_outline : Icons.cancel_outlined,
            size: 48,
            color: Colors.white,
          ),
          const SizedBox(height: 12),
          Text(
            isCompleted ? 'Compra Finalizada' : 'Compra Cancelada',
            style: GoogleFonts.inter(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            sale['code'],
            style: GoogleFonts.inter(
              fontSize: 14,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection(Map<String, dynamic> sale) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildInfoRow(Icons.calendar_today, 'Data', _formatDate(sale['date'])),
            const Divider(),
            _buildInfoRow(Icons.shopping_bag_outlined, 'Itens', '${sale['items']} produtos'),
            const Divider(),
            _buildInfoRow(Icons.payment_outlined, 'Pagamento', _getPaymentLabel(sale['payment'])),
            if (sale['points'] != null) ...[
              const Divider(),
              _buildInfoRow(Icons.card_giftcard, 'Pontos ganhos', '+${sale['points']} pts'),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppTheme.primaryGreen),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppTheme.textSecondary,
              ),
            ),
          ),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItemsSection(Map<String, dynamic> sale) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Produtos',
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        List.generate(
          3,
          (i) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.image, color: Colors.grey, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Produto ${i + 1}',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      Text(
                        '${i + 1}x R\$ ${((i + 1) * 15.5).toStringAsFixed(2)}',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  'R\$ ${((i + 1) * 15.5).toStringAsFixed(2)}',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTotalsSection(Map<String, dynamic> sale) {
    final total = sale['total'] as double;
    return Card(
      color: AppTheme.primaryGreen.withOpacity(0.03),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Subtotal', style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary)),
                Text('R\$ ${(total * 0.95).toStringAsFixed(2)}',
                    style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textPrimary)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Desconto', style: GoogleFonts.inter(fontSize: 14, color: AppTheme.success)),
                Text('-R\$ ${(total * 0.05).toStringAsFixed(2)}',
                    style: GoogleFonts.inter(fontSize: 14, color: AppTheme.success)),
              ],
            ),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                Text('R\$ ${total.toStringAsFixed(2)}',
                    style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActions(Map<String, dynamic> sale) {
    if (sale['status'] != 'completed') return const SizedBox.shrink();

    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.receipt_long, size: 20),
            label: const Text('Nota Fiscal'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.share, size: 20),
            label: const Text('Compartilhar'),
          ),
        ),
      ],
    );
  }

  String _formatDate(dynamic date) {
    if (date is DateTime) {
      return '${date.day}/${date.month}/${date.year}';
    }
    return '';
  }

  String _getPaymentLabel(String method) {
    switch (method) {
      case 'pix': return 'PIX';
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      case 'cash': return 'Dinheiro';
      default: return method;
    }
  }
}
