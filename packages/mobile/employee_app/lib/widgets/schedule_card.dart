import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import '../models/schedule_model.dart';

class ScheduleCard extends StatelessWidget {
  final ScheduleModel schedule;

  const ScheduleCard({super.key, required this.schedule});

  @override
  Widget build(BuildContext context) {
    final isToday = schedule.date.day == DateTime.now().day &&
        schedule.date.month == DateTime.now().month;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: isToday ? Border.all(color: AppTheme.primaryGreen, width: 2) : null,
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Column(
                children: [
                  Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(
                      color: _getTypeColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        '${schedule.date.day}',
                        style: GoogleFonts.inter(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: _getTypeColor(),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    schedule.dayLabel,
                    style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary),
                  ),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          schedule.timeRange,
                          style: GoogleFonts.inter(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        if (isToday) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryGreen.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text('Hoje',
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  color: AppTheme.primaryGreen,
                                  fontWeight: FontWeight.w600,
                                )),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.access_time, size: 14, color: Colors.grey[400]),
                        const SizedBox(width: 4),
                        Text(
                          '${schedule.totalHours.toStringAsFixed(1)}h',
                          style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary),
                        ),
                        const SizedBox(width: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: _getStatusColor().withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            schedule.statusLabel,
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              color: _getStatusColor(),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getTypeColor() {
    switch (schedule.type) {
      case 'regular': return AppTheme.primaryGreen;
      case 'overtime': return AppTheme.overtime;
      case 'holiday': return AppTheme.warning;
      default: return AppTheme.accent;
    }
  }

  Color _getStatusColor() {
    switch (schedule.status) {
      case 'scheduled': return AppTheme.primaryGreen;
      case 'completed': return AppTheme.success;
      case 'cancelled': return AppTheme.error;
      case 'absent': return AppTheme.error;
      default: return AppTheme.textSecondary;
    }
  }
}
