import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/stock_provider.dart';

class MovementsScreen extends StatefulWidget {
  const MovementsScreen({super.key});

  @override
  State<MovementsScreen> createState() => _MovementsScreenState();
}

class _MovementsScreenState extends State<MovementsScreen> {
  String? _typeFilter;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<StockProvider>().loadMovements();
    });
  }

  void _applyFilter(String? type) {
    setState(() => _typeFilter = type);
    final filters = <String, String>{};
    if (type != null) filters['tipo'] = type;
    context.read<StockProvider>().loadMovements(filters: filters);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<StockProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Movimentações')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('Todas', null),
                  const SizedBox(width: 8),
                  _buildFilterChip('Entrada', 'entrada'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Saída', 'saida'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Ajuste', 'ajuste'),
                ],
              ),
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => provider.loadMovements(filters: _typeFilter != null ? {'tipo': _typeFilter!} : null),
              child: provider.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : provider.movements.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.move_up_outlined, size: 48, color: AppTheme.textSecondary),
                              const SizedBox(height: 16),
                              Text('Nenhuma movimentação encontrada', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: provider.movements.length,
                          itemBuilder: (_, i) => _buildMovementCard(provider.movements[i]),
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String? value) {
    final selected = _typeFilter == value;
    return FilterChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => _applyFilter(value),
      selectedColor: AppTheme.primary.withOpacity(0.15),
      checkmarkColor: AppTheme.primary,
      labelStyle: GoogleFonts.inter(
        fontSize: 13,
        color: selected ? AppTheme.primary : AppTheme.textSecondary,
        fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
      ),
    );
  }

  Widget _buildMovementCard(Map<String, dynamic> mov) {
    final tipo = mov['tipo'] ?? mov['type'] ?? '';
    final isEntry = tipo == 'entrada' || tipo == 'in';
    final isAdjust = tipo == 'ajuste' || tipo == 'adjust';

    Color tipoColor;
    IconData tipoIcon;
    if (isEntry) {
      tipoColor = AppTheme.success;
      tipoIcon = Icons.add_circle_outline;
    } else if (isAdjust) {
      tipoColor = AppTheme.warning;
      tipoIcon = Icons.tune;
    } else {
      tipoColor = AppTheme.error;
      tipoIcon = Icons.remove_circle_outline;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(color: tipoColor.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
              child: Icon(tipoIcon, color: tipoColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(mov['produto'] ?? mov['product_name'] ?? 'Produto', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 2),
                  Text(
                    '${mov['quantidade'] ?? mov['quantity'] ?? 0} ${mov['unidade'] ?? mov['unit'] ?? 'un'}',
                    style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
                  ),
                  Text(
                    _formatDate(mov['data'] ?? mov['date'] ?? ''),
                    style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: tipoColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(tipo.toUpperCase(), style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: tipoColor)),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd/MM/yyyy HH:mm').format(date);
    } catch (_) {
      return dateStr;
    }
  }
}
