import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/transfer_provider.dart';

class TransfersScreen extends StatefulWidget {
  const TransfersScreen({super.key});

  @override
  State<TransfersScreen> createState() => _TransfersScreenState();
}

class _TransfersScreenState extends State<TransfersScreen> {
  String? _statusFilter;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TransferProvider>().loadTransfers();
      context.read<TransferProvider>().loadDestinations();
    });
  }

  void _createTransfer() {
    final provider = context.read<TransferProvider>();
    final items = <Map<String, dynamic>>[];
    int? selectedDestId;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Nova Transferência'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<int>(
                  decoration: const InputDecoration(labelText: 'Destino'),
                  items: provider.destinations.map((d) => DropdownMenuItem(
                    value: d['id'],
                    child: Text(d['nome'] ?? d['name'] ?? ''),
                  )).toList(),
                  onChanged: (v) => setDialogState(() => selectedDestId = v),
                ),
                const SizedBox(height: 16),
                Text('Adicione os itens para transferência', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
            ElevatedButton(
              onPressed: () {
                if (selectedDestId == null) return;
                provider.createTransfer({
                  'destino_id': selectedDestId,
                  'itens': items,
                });
                Navigator.pop(ctx);
              },
              child: const Text('Criar'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TransferProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transferências'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _createTransfer,
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildStatusChip('Todas', null),
                  const SizedBox(width: 8),
                  _buildStatusChip('Pendente', 'pending'),
                  const SizedBox(width: 8),
                  _buildStatusChip('Em Trânsito', 'in_transit'),
                  const SizedBox(width: 8),
                  _buildStatusChip('Concluída', 'completed'),
                ],
              ),
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => provider.loadTransfers(status: _statusFilter),
              child: provider.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : provider.transfers.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.swap_horiz, size: 48, color: AppTheme.textSecondary),
                              const SizedBox(height: 16),
                              Text('Nenhuma transferência encontrada', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: provider.transfers.length,
                          itemBuilder: (_, i) => _buildTransferCard(provider.transfers[i]),
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String label, String? value) {
    final selected = _statusFilter == value;
    return FilterChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) {
        setState(() => _statusFilter = value);
        provider.loadTransfers(status: value);
      },
      selectedColor: AppTheme.primary.withOpacity(0.15),
      checkmarkColor: AppTheme.primary,
      labelStyle: GoogleFonts.inter(
        fontSize: 13,
        color: selected ? AppTheme.primary : AppTheme.textSecondary,
        fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
      ),
    );
  }

  Widget _buildTransferCard(Map<String, dynamic> transfer) {
    final status = transfer['status'] ?? '';
    Color statusColor;
    String statusLabel;
    switch (status) {
      case 'pending':
        statusColor = AppTheme.warning;
        statusLabel = 'Pendente';
        break;
      case 'in_transit':
        statusColor = AppTheme.primary;
        statusLabel = 'Em Trânsito';
        break;
      case 'completed':
        statusColor = AppTheme.success;
        statusLabel = 'Concluída';
        break;
      default:
        statusColor = AppTheme.textSecondary;
        statusLabel = status;
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
                  child: Icon(Icons.swap_horiz, color: statusColor, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Transferência #${transfer['id']}', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500)),
                      Text('${transfer['origem'] ?? 'Origem'} → ${transfer['destino'] ?? 'Destino'}', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
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
            Text('${transfer['itens_count'] ?? transfer['items_count'] ?? 0} itens', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
          ],
        ),
      ),
    );
  }
}
