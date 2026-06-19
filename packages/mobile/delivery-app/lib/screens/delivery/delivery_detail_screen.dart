import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/delivery_provider.dart';
import '../../widgets/status_timeline.dart';
import '../../widgets/signature_pad.dart';
import '../../widgets/photo_proof.dart';

class DeliveryDetailScreen extends StatefulWidget {
  final int deliveryId;
  const DeliveryDetailScreen({super.key, required this.deliveryId});

  @override
  State<DeliveryDetailScreen> createState() => _DeliveryDetailScreenState();
}

class _DeliveryDetailScreenState extends State<DeliveryDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DeliveryProvider>().loadDeliveryDetail(widget.deliveryId);
    });
  }

  void _startDelivery() async {
    final success = await context.read<DeliveryProvider>().updateDeliveryStatus(
      widget.deliveryId, 'in_transit',
    );
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Entrega iniciada!')),
      );
    }
  }

  void _confirmDelivery() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 16, right: 16, top: 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Confirmar Entrega', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 16),
            const PhotoProof(),
            const SizedBox(height: 16),
            const SignaturePad(),
            const SizedBox(height: 16),
            SizedBox(
              height: 52,
              child: ElevatedButton(
                onPressed: () async {
                  Navigator.pop(context);
                  final success = await context.read<DeliveryProvider>().updateDeliveryStatus(
                    widget.deliveryId, 'completed',
                    extra: {'completed_at': DateTime.now().toIso8601String()},
                  );
                  if (success && mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Entrega confirmada com sucesso!')),
                    );
                  }
                },
                child: const Text('Finalizar Entrega'),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _reportProblem() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Problema na Entrega'),
        content: TextField(
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: 'Descreva o problema',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<DeliveryProvider>().updateDeliveryStatus(
                widget.deliveryId, 'problem',
                extra: {'problem_reported': true},
              );
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Problema reportado!')),
                );
              }
            },
            child: const Text('Reportar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DeliveryProvider>();
    final delivery = provider.currentDelivery;

    return Scaffold(
      appBar: AppBar(title: const Text('Detalhes da Entrega')),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : delivery == null
              ? Center(child: Text(provider.error ?? 'Entrega não encontrada', style: GoogleFonts.inter(color: AppTheme.textSecondary)))
              : RefreshIndicator(
                  onRefresh: () => provider.loadDeliveryDetail(widget.deliveryId),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
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
                                      width: 50, height: 50,
                                      decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                                      child: const Icon(Icons.receipt, color: AppTheme.primary, size: 24),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text('Pedido #${delivery['order_number'] ?? delivery['id']}',
                                              style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold)),
                                          Text('R\$ ${(delivery['value'] ?? delivery['valor'] ?? 0).toStringAsFixed(2)}',
                                              style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.primary)),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: _getStatusColor(delivery['status'] ?? '').withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        _getStatusLabel(delivery['status'] ?? ''),
                                        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: _getStatusColor(delivery['status'] ?? '')),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        StatusTimeline(status: delivery['status'] ?? 'pending'),
                        const SizedBox(height: 12),
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Cliente', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 8),
                                Text(delivery['customer_name'] ?? delivery['cliente'] ?? '', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500)),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(Icons.phone, size: 14, color: AppTheme.textSecondary),
                                    const SizedBox(width: 6),
                                    Text(delivery['customer_phone'] ?? delivery['telefone'] ?? '', style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary)),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Icon(Icons.location_on, size: 14, color: AppTheme.textSecondary),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: Text(delivery['address'] ?? delivery['endereco'] ?? '', style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        if (delivery['items'] != null)
                          Card(
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Itens', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                                  const SizedBox(height: 8),
                                  ...List<Widget>.from((delivery['items'] as List).map((item) => Padding(
                                    padding: const EdgeInsets.only(bottom: 8),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(item['nome'] ?? item['name'] ?? 'Item', style: GoogleFonts.inter(fontSize: 14)),
                                        ),
                                        Text('${item['quantidade'] ?? item['quantity'] ?? 1}x', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppTheme.textSecondary)),
                                      ],
                                    ),
                                  ))),
                                ],
                              ),
                            ),
                          ),
                        const SizedBox(height: 24),
                        Row(
                          children: [
                            Expanded(
                              child: SizedBox(
                                height: 48,
                                child: ElevatedButton.icon(
                                  onPressed: _startDelivery,
                                  icon: const Icon(Icons.play_arrow, size: 18),
                                  label: const Text('Iniciar Entrega'),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: SizedBox(
                                height: 48,
                                child: ElevatedButton.icon(
                                  onPressed: _confirmDelivery,
                                  icon: const Icon(Icons.check, size: 18),
                                  label: const Text('Confirmar Entrega'),
                                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.success),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: SizedBox(
                                height: 48,
                                child: OutlinedButton.icon(
                                  onPressed: _reportProblem,
                                  icon: const Icon(Icons.warning, size: 18),
                                  label: const Text('Problema'),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: AppTheme.error,
                                    side: const BorderSide(color: AppTheme.error),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending': return AppTheme.warning;
      case 'in_transit': return AppTheme.primary;
      case 'completed': case 'entregue': return AppTheme.success;
      case 'problem': return AppTheme.error;
      default: return AppTheme.textSecondary;
    }
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_transit': return 'Em Rota';
      case 'completed': case 'entregue': return 'Entregue';
      case 'problem': return 'Problema';
      default: return status;
    }
  }
}
