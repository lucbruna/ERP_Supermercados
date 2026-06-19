import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/store_provider.dart';
import '../../widgets/offline_banner.dart';

class FinancialScreen extends StatelessWidget {
  const FinancialScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');
    return Scaffold(
      appBar: AppBar(title: const Text('Financeiro')),
      body: Column(
        children: [
          const ManagerOfflineBanner(),
          Expanded(
            child: Consumer<StoreProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading && provider.financialOverview == null) {
                  return _buildShimmer();
                }
                if (provider.error != null && provider.financialOverview == null) {
                  return _buildError(provider);
                }

                final financial = provider.financialOverview ?? {};
                final revenue = (financial['revenue'] ?? financial['faturamento'] ?? 0).toDouble();
                final expenses = (financial['expenses'] ?? financial['despesas'] ?? 0).toDouble();
                final profit = (financial['profit'] ?? financial['lucro'] ?? 0).toDouble();
                final margin = (financial['margin'] ?? financial['margem'] ?? 0).toDouble();
                final cashIn = (financial['cash_in'] ?? financial['entradas'] ?? 0).toDouble();
                final cashOut = (financial['cash_out'] ?? financial['saidas'] ?? 0).toDouble();
                final discrepancies = (financial['discrepancies'] ?? financial['discrepancias'] ?? []) as List;

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
                                Text('Resumo Financeiro', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 16),
                                Row(
                                  children: [
                                    Expanded(child: _buildFinanceItem('Faturamento', currencyFormat.format(revenue), Icons.trending_up, Colors.green)),
                                    const SizedBox(width: 8),
                                    Expanded(child: _buildFinanceItem('Despesas', currencyFormat.format(expenses), Icons.trending_down, AppTheme.negative)),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(child: _buildFinanceItem('Lucro', currencyFormat.format(profit), Icons.account_balance, AppTheme.primaryColor)),
                                    const SizedBox(width: 8),
                                    Expanded(child: _buildFinanceItem('Margem', '${margin.toStringAsFixed(1)}%', Icons.pie_chart, Colors.purple)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text('Fluxo de Caixa', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Entradas', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                                    Text(currencyFormat.format(cashIn), style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: Colors.green)),
                                  ],
                                ),
                                const Divider(),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Saídas', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                                    Text(currencyFormat.format(cashOut), style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: AppTheme.negative)),
                                  ],
                                ),
                                const Divider(),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Saldo', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                                    Text(currencyFormat.format(cashIn - cashOut), style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: cashIn - cashOut >= 0 ? Colors.green : AppTheme.negative)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                        if (discrepancies.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          Text('Discrepâncias', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 8),
                          ...discrepancies.map((d) => Card(
                            child: ListTile(
                              leading: const Icon(Icons.warning, color: AppTheme.warning),
                              title: Text(d['description'] ?? '', style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
                              trailing: Text(currencyFormat.format((d['amount'] ?? 0).toDouble()), style: GoogleFonts.inter(color: AppTheme.negative, fontWeight: FontWeight.bold)),
                            ),
                          )),
                        ],
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

  Widget _buildFinanceItem(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: color.withOpacity(0.05), borderRadius: BorderRadius.circular(12)),
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 6),
          Text(value, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold)),
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
          Container(height: 200, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
          const SizedBox(height: 16),
          Container(height: 150, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
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
