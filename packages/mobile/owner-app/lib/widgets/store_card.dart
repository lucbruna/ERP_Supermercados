import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';

class StoreCard extends StatelessWidget {
  final String name;
  final String revenue;
  final String city;
  final String performance;
  final VoidCallback onTap;

  const StoreCard({
    super.key,
    required this.name,
    required this.revenue,
    required this.city,
    this.performance = 'stable',
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color perfColor;
    IconData perfIcon;
    switch (performance) {
      case 'growing' || 'up':
        perfColor = AppTheme.success;
        perfIcon = Icons.trending_up;
        break;
      case 'declining' || 'down':
        perfColor = AppTheme.negative;
        perfIcon = Icons.trending_down;
        break;
      default:
        perfColor = Colors.amber;
        perfIcon = Icons.trending_flat;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.store, color: AppTheme.primaryColor, size: 26),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Icon(Icons.location_on, size: 14, color: AppTheme.textSecondary),
                        const SizedBox(width: 4),
                        Text(city, style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(revenue, style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: perfColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(perfIcon, color: perfColor, size: 22),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
