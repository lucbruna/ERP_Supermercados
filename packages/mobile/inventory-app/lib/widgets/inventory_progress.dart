import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';

class InventoryProgress extends StatelessWidget {
  final double progress;
  final int counted;
  final int total;

  const InventoryProgress({
    super.key,
    required this.progress,
    required this.counted,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      color: AppTheme.primary,
      child: Column(
        children: [
          Text('Progresso da Contagem', style: GoogleFonts.inter(fontSize: 14, color: Colors.white70)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: 80, height: 80,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    CircularProgressIndicator(
                      value: progress,
                      backgroundColor: Colors.white.withOpacity(0.2),
                      valueColor: const AlwaysStoppedAnimation(Colors.white),
                      strokeWidth: 8,
                    ),
                    Center(
                      child: Text(
                        '${(progress * 100).toInt()}%',
                        style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 24),
              Text(
                '$counted / $total\nitens',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white, height: 1.3),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
