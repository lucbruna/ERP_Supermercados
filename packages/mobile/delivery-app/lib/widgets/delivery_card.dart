import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';

class DeliveryCard extends StatelessWidget {
  final Map<String, dynamic> delivery;
  final VoidCallback? onTap;

  const DeliveryCard({super.key, required this.delivery, this.onTap});

  @override
  Widget build(BuildContext context) {
    final status = delivery['status'] ?? '';
    final color = _getStatusColor(status);
    final label = _getStatusLabel(status);

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Container(
                width: 50, height: 50,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.inventory_2, color: color, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Pedido #${delivery['order_number'] ?? delivery['id']}',
                        style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text(delivery['customer_name'] ?? delivery['cliente'] ?? '',
                        style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.location_on, size: 12, color: AppTheme.textSecondary),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(delivery['address'] ?? delivery['endereco'] ?? '',
                              style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('R\$ ${(delivery['value'] ?? delivery['valor'] ?? 0).toStringAsFixed(2)}',
                      style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: AppTheme.primary, fontSize: 14)),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(label, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
                  ),
                ],
              ),
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
