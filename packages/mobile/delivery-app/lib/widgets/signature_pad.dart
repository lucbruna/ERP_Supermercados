import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';

class SignaturePad extends StatefulWidget {
  const SignaturePad({super.key});

  @override
  State<SignaturePad> createState() => _SignaturePadState();
}

class _SignaturePadState extends State<SignaturePad> {
  List<List<Offset>> _points = [];
  List<Offset> _currentPoints = [];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Assinatura do Cliente', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)),
            TextButton(
              onPressed: () => setState(() { _points.clear(); _currentPoints.clear(); }),
              child: const Text('Limpar', style: TextStyle(fontSize: 12)),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          height: 120,
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.divider),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: GestureDetector(
              onPanStart: (details) {
                setState(() => _currentPoints = [details.localPosition]);
              },
              onPanUpdate: (details) {
                setState(() => _currentPoints.add(details.localPosition));
              },
              onPanEnd: (_) {
                setState(() {
                  _points.add(List.from(_currentPoints));
                  _currentPoints = [];
                });
              },
              child: CustomPaint(
                painter: _SignaturePainter(_points, _currentPoints),
                size: const Size(double.infinity, 120),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _SignaturePainter extends CustomPainter {
  final List<List<Offset>> points;
  final List<Offset> currentPoints;

  _SignaturePainter(this.points, this.currentPoints);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.textPrimary
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;

    for (final line in points) {
      _drawLine(canvas, line, paint);
    }
    if (currentPoints.isNotEmpty) {
      _drawLine(canvas, currentPoints, paint);
    }
  }

  void _drawLine(Canvas canvas, List<Offset> points, Paint paint) {
    for (var i = 0; i < points.length - 1; i++) {
      canvas.drawLine(points[i], points[i + 1], paint);
    }
  }

  @override
  bool shouldRepaint(covariant _SignaturePainter oldDelegate) =>
      oldDelegate.points != points || oldDelegate.currentPoints != currentPoints;
}
