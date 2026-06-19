import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';

class StatusTimeline extends StatelessWidget {
  final String status;

  const StatusTimeline({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final steps = [
      _StatusStep(title: 'Pendente', icon: Icons.pending, isActive: true),
      _StatusStep(title: 'Em Rota', icon: Icons.local_shipping, isActive: status == 'in_transit' || status == 'completed' || status == 'entregue'),
      _StatusStep(title: 'Entregue', icon: Icons.check_circle, isActive: status == 'completed' || status == 'entregue'),
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Status da Entrega', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 16),
            Row(
              children: List.generate(steps.length * 2 - 1, (i) {
                if (i.isOdd) {
                  return Expanded(
                    child: Container(
                      height: 2,
                      color: i ~/ 2 < steps.length - 1 && steps[i ~/ 2 + 1].isActive
                          ? AppTheme.primary
                          : AppTheme.divider,
                    ),
                  );
                }
                final step = steps[i ~/ 2];
                return Column(
                  children: [
                    Container(
                      width: 36, height: 36,
                      decoration: BoxDecoration(
                        color: step.isActive ? AppTheme.primary : Colors.grey[200],
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(step.icon, color: step.isActive ? Colors.white : AppTheme.textSecondary, size: 18),
                    ),
                    const SizedBox(height: 4),
                    Text(step.title, style: GoogleFonts.inter(
                      fontSize: 11,
                      color: step.isActive ? AppTheme.primary : AppTheme.textSecondary,
                      fontWeight: step.isActive ? FontWeight.w600 : FontWeight.normal,
                    )),
                  ],
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusStep {
  final String title;
  final IconData icon;
  final bool isActive;

  _StatusStep({required this.title, required this.icon, required this.isActive});
}
