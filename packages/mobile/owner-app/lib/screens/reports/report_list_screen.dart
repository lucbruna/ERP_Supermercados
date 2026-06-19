import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../widgets/offline_banner.dart';

class ReportListScreen extends StatelessWidget {
  const ReportListScreen({super.key});

  static const _reports = [
    {'icon': Icons.assessment, 'title': 'Relatório Gerencial', 'description': 'Visão completa do negócio'},
    {'icon': Icons.trending_up, 'title': 'Análise de Vendas', 'description': 'Vendas por período, loja e produto'},
    {'icon': Icons.show_chart, 'title': 'DRE Consolidado', 'description': 'Demonstração de resultados'},
    {'icon': Icons.inventory, 'title': 'Relatório de Estoque', 'description': 'Giro de estoque e baixas'},
    {'icon': Icons.people, 'title': 'Relatório de Clientes', 'description': 'Clientes ativos e inadimplência'},
    {'icon': Icons.monetization_on, 'title': 'Fluxo de Caixa', 'description': 'Entradas e saídas do período'},
    {'icon': Icons.compare_arrows, 'title': 'Comparativo Lojas', 'description': 'Performance entre filiais'},
    {'icon': Icons.timeline, 'title': 'Metas e Resultados', 'description': 'Acompanhamento de metas'},
    {'icon': Icons.receipt_long, 'title': 'Relatório Fiscal', 'description': 'Impostos e obrigações fiscais'},
    {'icon': Icons.credit_card, 'title': 'Taxas de Cartão', 'description': 'Custos por bandeira e parcela'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Relatórios')),
      body: Column(
        children: [
          const OwnerOfflineBanner(),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _reports.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final report = _reports[index];
                return Card(
                  child: ListTile(
                    leading: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(report['icon'] as IconData, color: AppTheme.primaryColor),
                    ),
                    title: Text(report['title'] as String, style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                    subtitle: Text(report['description'] as String, style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary)),
                    trailing: const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('${report['title']} - Em breve')),
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
}
