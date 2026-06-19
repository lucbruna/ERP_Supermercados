import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/store_provider.dart';
import '../../widgets/offline_banner.dart';

class SalesScreen extends StatelessWidget {
  const SalesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');
    return Scaffold(
      appBar: AppBar(title: const Text('Vendas')),
      body: Column(
        children: [
          const ManagerOfflineBanner(),
          Expanded(
            child: Consumer<StoreProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading && provider.todaySales == null) {
                  return _buildShimmer();
                }
                if (provider.error != null && provider.todaySales == null) {
                  return _buildError(provider);
                }

                final data = provider.todaySales ?? {};
                final total = (data['revenue'] ?? data['faturamento'] ?? 0).toDouble();
                final salesCount = data['sales_count'] ?? data['total_vendas'] ?? 0;
                final avgTicket = (data['average_ticket'] ?? data['ticket_medio'] ?? 0).toDouble();
                final paymentMethods = (data['payment_methods'] ?? data['formas_pagamento'] ?? []) as List;

                return RefreshIndicator(
                  onRefresh: () => provider.refresh(),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              children: [
                                Text('Total de Vendas Hoje', style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary)),
                                const SizedBox(height: 8),
                                Text(currencyFormat.format(total), style: GoogleFonts.inter(fontSize: 36, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(child: _buildStatCard('Vendas', '$salesCount', Icons.receipt, Colors.blue)),
                                    const SizedBox(width: 8),
                                    Expanded(child: _buildStatCard('Ticket Médio', currencyFormat.format(avgTicket), Icons.receipt_long, Colors.purple)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text('Formas de Pagamento', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        if (paymentMethods.isEmpty)
                          Card(
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Center(child: Text('Nenhum dado disponível', style: GoogleFonts.inter(color: AppTheme.textSecondary))),
                            ),
                          )
                        else
                          ...paymentMethods.map((pm) {
                            final method = pm['method'] ?? pm['nome'] ?? '';
                            final amount = (pm['amount'] ?? pm['valor'] ?? 0).toDouble();
                            final percentage = (pm['percentage'] ?? pm['percentual'] ?? 0).toDouble();
                            return Card(
                              child: ListTile(
                                leading: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(color: AppTheme.primaryColor.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                                  child: Center(child: Text('${percentage.toStringAsFixed(0)}%', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryColor))),
                                ),
                                title: Text(method, style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
                                trailing: Text(currencyFormat.format(amount), style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
                              ),
                            );
                          }),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: color.withOpacity(0.05), borderRadius: BorderRadius.circular(12)),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 4),
          Text(value, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold)),
          Text(label, style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary)),
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
        children: [
          Container(height: 180, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
          const SizedBox(height: 16),
          Container(height: 100, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
          const SizedBox(height: 8),
          Container(height: 60, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
          const SizedBox(height: 8),
          Container(height: 60, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
        ],
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
            onPressed: () => provider.refresh(),
            icon: const Icon(Icons.refresh),
            label: const Text('Tentar Novamente'),
          ),
        ],
      ),
    );
  }
}
