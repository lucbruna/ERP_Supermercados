import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../config/theme.dart';

enum ChartType { line, bar, pie }

class ChartData {
  final String label;
  final double value;
  final Color? color;
  ChartData({required this.label, required this.value, this.color});
}

class ChartWidget extends StatelessWidget {
  final String title;
  final ChartType type;
  final List<ChartData> data;
  final NumberFormat? format;

  const ChartWidget({
    super.key,
    required this.title,
    required this.type,
    required this.data,
    this.format,
  });

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return Card(
        child: Container(
          height: 200,
          padding: const EdgeInsets.all(16),
          child: Center(
            child: Text('Nenhum dado disponível', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
          ),
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: type == ChartType.pie ? _buildPieChart() : _buildBarChart(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBarChart() {
    final maxValue = data.fold(0.0, (max, d) => d.value > max ? d.value : max);
    return Column(
      children: [
        Expanded(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: data.map((d) {
              final height = maxValue > 0 ? (d.value / maxValue) : 0.0;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      if (format != null && d.value > 0)
                        Text(
                          format!.format(d.value),
                          style: GoogleFonts.inter(fontSize: 9, color: AppTheme.textSecondary),
                        ),
                      const SizedBox(height: 2),
                      Container(
                        height: (height * 160).clamp(4, 160),
                        decoration: BoxDecoration(
                          color: d.color ?? AppTheme.primaryColor,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: data.map((d) {
            return Expanded(
              child: Text(
                d.label.length > 8 ? '${d.label.substring(0, 8)}...' : d.label,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 10, color: AppTheme.textSecondary),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildPieChart() {
    final total = data.fold(0.0, (sum, d) => sum + d.value);
    final pieColors = [
      AppTheme.primaryColor,
      Colors.orange,
      Colors.green,
      Colors.purple,
      Colors.teal,
      Colors.red,
      Colors.amber,
      Colors.cyan,
      Colors.brown,
      Colors.indigo,
    ];

    return Row(
      children: [
        Expanded(
          flex: 3,
          child: CustomPaint(
            size: const Size(160, 160),
            painter: _PieChartPainter(data, pieColors, total),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          flex: 2,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: data.asMap().entries.map((entry) {
              final i = entry.key;
              final d = entry.value;
              final percentage = total > 0 ? (d.value / total * 100) : 0.0;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 3),
                child: Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: pieColors[i % pieColors.length],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        d.label,
                        style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      '${percentage.toStringAsFixed(1)}%',
                      style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _PieChartPainter extends CustomPainter {
  final List<ChartData> data;
  final List<Color> colors;
  final double total;

  _PieChartPainter(this.data, this.colors, this.total);

  @override
  void paint(Canvas canvas, Size size) {
    if (total <= 0) return;
    final rect = Rect.fromLTWH(0, 0, size.width, size.height);
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    double startAngle = -1.5708;
    for (var i = 0; i < data.length; i++) {
      final sweepAngle = (data[i].value / total) * 6.28319;
      final paint = Paint()
        ..color = colors[i % colors.length]
        ..style = PaintingStyle.fill;
      canvas.drawArc(rect, startAngle, sweepAngle, true, paint);
      startAngle += sweepAngle;
    }

    canvas.drawCircle(center, radius * 0.5, Paint()..color = Colors.white);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
