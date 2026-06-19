import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';

class RequestCard extends StatelessWidget {
  final String title;
  final String type;
  final String typeIcon;
  final String status;
  final String date;
  final bool isPending;
  final VoidCallback? onTap;

  const RequestCard({
    super.key,
    required this.title,
    required this.type,
    required this.typeIcon,
    required this.status,
    required this.date,
    this.isPending = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  color: isPending ? AppTheme.warning.withOpacity(0.1) : AppTheme.primaryGreen.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _getIconFromName(typeIcon),
                  color: isPending ? AppTheme.warning : AppTheme.primaryGreen,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Text(
                          type,
                          style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                        const SizedBox(width: 8),
                        Icon(Icons.calendar_today, size: 12, color: Colors.grey[400]),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            date,
                            style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _getStatusColor().withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  status,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: _getStatusColor(),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getStatusColor() {
    switch (status) {
      case 'Aprovado': return AppTheme.success;
      case 'Pendente': return AppTheme.warning;
      case 'Rejeitado': return AppTheme.error;
      case 'Cancelado': return AppTheme.textSecondary;
      default: return AppTheme.textSecondary;
    }
  }

  IconData _getIconFromName(String name) {
    switch (name) {
      case 'beach_access': return Icons.beach_access;
      case 'free_breakfast': return Icons.free_breakfast;
      case 'local_hospital': return Icons.local_hospital;
      case 'person': return Icons.person;
      case 'timer': return Icons.timer;
      case 'card_giftcard': return Icons.card_giftcard;
      default: return Icons.description;
    }
  }
}
