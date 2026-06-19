import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';

class EmployeeCard extends StatelessWidget {
  final String name;
  final String role;
  final String status;
  final String entryTime;
  final String exitTime;
  final VoidCallback onTap;

  const EmployeeCard({
    super.key,
    required this.name,
    required this.role,
    required this.status,
    required this.entryTime,
    required this.exitTime,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    IconData statusIcon;
    String statusText;

    switch (status) {
      case 'present':
        statusColor = AppTheme.success;
        statusIcon = Icons.check_circle;
        statusText = 'Presente';
        break;
      case 'late':
        statusColor = AppTheme.warning;
        statusIcon = Icons.warning;
        statusText = 'Atrasado';
        break;
      case 'absent':
        statusColor = AppTheme.negative;
        statusIcon = Icons.cancel;
        statusText = 'Ausente';
        break;
      case 'left':
        statusColor = AppTheme.textSecondary;
        statusIcon = Icons.logout;
        statusText = 'Saiu';
        break;
      default:
        statusColor = Colors.grey;
        statusIcon = Icons.help;
        statusText = status;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : '?',
                    style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600)),
                    if (role.isNotEmpty)
                      Text(role, style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        if (entryTime.isNotEmpty)
                          Text('Ent: $entryTime', style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary)),
                        if (entryTime.isNotEmpty && exitTime.isNotEmpty)
                          Text('  |  ', style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary)),
                        if (exitTime.isNotEmpty)
                          Text('Sai: $exitTime', style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary)),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(statusIcon, size: 14, color: statusColor),
                    const SizedBox(width: 4),
                    Text(statusText, style: GoogleFonts.inter(fontSize: 11, color: statusColor, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
