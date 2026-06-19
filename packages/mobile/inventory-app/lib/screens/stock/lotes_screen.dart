import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/inventory_provider.dart';

class LotesScreen extends StatefulWidget {
  const LotesScreen({super.key});

  @override
  State<LotesScreen> createState() => _LotesScreenState();
}

class _LotesScreenState extends State<LotesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<InventoryProvider>().loadLotes();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<InventoryProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Lotes')),
      body: RefreshIndicator(
        onRefresh: () => provider.loadLotes(),
        child: provider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : provider.lotes.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.inventory_2_outlined, size: 48, color: AppTheme.textSecondary),
                        const SizedBox(height: 16),
                        Text('Nenhum lote encontrado', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: provider.lotes.length,
                    itemBuilder: (_, i) => _buildLoteCard(provider.lotes[i]),
                  ),
      ),
    );
  }

  Widget _buildLoteCard(Map<String, dynamic> lote) {
    final validadeStr = lote['validade'] ?? lote['expiry_date'] ?? '';
    DateTime? validade;
    try {
      validade = DateTime.parse(validadeStr);
    } catch (_) {}

    bool isExpiringSoon = false;
    bool isExpired = false;
    if (validade != null) {
      final daysUntilExpiry = validade.difference(DateTime.now()).inDays;
      isExpired = daysUntilExpiry < 0;
      isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
    }

    Color statusColor;
    String statusLabel;
    if (isExpired) {
      statusColor = AppTheme.error;
      statusLabel = 'Vencido';
    } else if (isExpiringSoon) {
      statusColor = AppTheme.warning;
      statusLabel = 'Próximo ao vencimento';
    } else {
      statusColor = AppTheme.success;
      statusLabel = 'OK';
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  child: Icon(
                    isExpired ? Icons.error_outline : isExpiringSoon ? Icons.warning_amber_rounded : Icons.check_circle_outline,
                    color: statusColor, size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Lote: ${lote['numero'] ?? lote['number'] ?? '-'}', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500)),
                      Text(lote['produto'] ?? lote['product_name'] ?? '', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(statusLabel, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: statusColor)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Qtd: ${lote['quantidade'] ?? lote['quantity'] ?? 0}', style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textPrimary)),
                Text(
                  validade != null ? DateFormat('dd/MM/yyyy').format(validade) : validadeStr,
                  style: GoogleFonts.inter(fontSize: 13, color: isExpired ? AppTheme.error : AppTheme.textSecondary),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
