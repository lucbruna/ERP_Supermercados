import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';

class SaleHistoryScreen extends StatefulWidget {
  const SaleHistoryScreen({super.key});

  @override
  State<SaleHistoryScreen> createState() => _SaleHistoryScreenState();
}

class _SaleHistoryScreenState extends State<SaleHistoryScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _sales = List.generate(
    15,
    (i) => {
      'id': i + 1,
      'code': '#VND${2024000 + i}',
      'total': (i + 1) * 47.5 + 12.3,
      'items': (i % 5) + 1,
      'payment': ['pix', 'credit_card', 'debit_card', 'cash'][i % 4],
      'status': ['completed', 'completed', 'completed', 'cancelled', 'refunded'][i % 5],
      'date': DateTime.now().subtract(Duration(days: i)),
      'points': (i + 1) * 47,
    },
  );

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Histórico de Compras'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(text: 'Todas'),
            Tab(text: 'Concluídas'),
            Tab(text: 'Canceladas'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildSaleList(_sales),
          _buildSaleList(_sales.where((s) => s['status'] == 'completed').toList()),
          _buildSaleList(_sales.where((s) => s['status'] != 'completed').toList()),
        ],
      ),
    );
  }

  Widget _buildSaleList(List<Map<String, dynamic>> sales) {
    if (sales.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.receipt_long_outlined, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(
              'Nenhuma venda encontrada',
              style: GoogleFonts.inter(fontSize: 16, color: AppTheme.textSecondary),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: sales.length,
      itemBuilder: (context, index) {
        final sale = sales[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => Navigator.pushNamed(
              context,
              AppRoutes.saleDetail,
              arguments: sale,
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        sale['code'],
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      _buildStatusBadge(sale['status']),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        _formatDate(sale['date']),
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Icon(Icons.shopping_bag_outlined, size: 14, color: Colors.grey[400]),
                      const SizedBox(width: 4),
                      Text(
                        '${sale['items']} itens',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _getPaymentLabel(sale['payment']),
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      Text(
                        'R\$ ${(sale['total'] as double).toStringAsFixed(2)}',
                        style: GoogleFonts.inter(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryGreen,
                        ),
                      ),
                    ],
                  ),
                  if (sale['points'] != null && sale['status'] == 'completed') ...[
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.card_giftcard, size: 14, color: AppTheme.gold),
                        const SizedBox(width: 4),
                        Text(
                          '+${sale['points']} pontos',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppTheme.gold,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String label;
    switch (status) {
      case 'completed':
        color = AppTheme.success;
        label = 'Concluída';
        break;
      case 'cancelled':
        color = AppTheme.error;
        label = 'Cancelada';
        break;
      case 'refunded':
        color = AppTheme.warning;
        label = 'Reembolsada';
        break;
      default:
        color = AppTheme.textSecondary;
        label = status;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          fontSize: 12,
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
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
