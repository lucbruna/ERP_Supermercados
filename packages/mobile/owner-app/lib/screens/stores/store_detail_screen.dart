import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../widgets/kpi_card.dart';

class StoreDetailScreen extends StatelessWidget {
  final Map<String, dynamic> store;

  const StoreDetailScreen({super.key, required this.store});

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');
    final name = store['name'] ?? store['nome'] ?? 'Loja';
    final revenue = (store['revenue'] ?? store['faturamento'] ?? 0).toDouble();
    final city = store['city'] ?? store['cidade'] ?? '';
    final address = store['address'] ?? store['endereco'] ?? '';
    final manager = store['manager'] ?? store['gerente'] ?? '';
    final employees = store['employees'] ?? store['funcionarios'] ?? 0;
    const expenses = 0.0;
    const profit = 0.0;
    const tickets = 0;
    const avgTicket = 0.0;

    return Scaffold(
      appBar: AppBar(title: Text(name)),
      body: SingleChildScrollView(
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
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.store, color: AppTheme.primaryColor, size: 28),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(name, style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold)),
                              if (city.isNotEmpty) Text(city, style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (address.isNotEmpty) _buildInfoRow(Icons.location_on, address),
                    if (manager.isNotEmpty) _buildInfoRow(Icons.person, 'Gerente: $manager'),
                    _buildInfoRow(Icons.people, '$employees funcionários'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            GridView(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 1.4,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              children: [
                KpiCard(icon: Icons.attach_money, label: 'Faturamento', value: currencyFormat.format(revenue), color: Colors.green),
                KpiCard(icon: Icons.trending_down, label: 'Despesas', value: currencyFormat.format(expenses), color: Colors.red),
                KpiCard(icon: Icons.trending_up, label: 'Lucro', value: currencyFormat.format(profit), color: AppTheme.primaryColor),
                KpiCard(icon: Icons.receipt, label: 'Vendas', value: '$tickets', color: Colors.orange),
                KpiCard(icon: Icons.person, label: 'Ticket Médio', value: currencyFormat.format(avgTicket), color: Colors.purple),
                KpiCard(icon: Icons.people, label: 'Funcionários', value: '$employees', color: Colors.teal),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.textSecondary),
          const SizedBox(width: 8),
          Text(text, style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary)),
        ],
      ),
    );
  }
}
