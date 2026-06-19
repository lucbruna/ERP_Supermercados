import 'package:flutter/material.dart';
import '../config/theme.dart';

class StockIndicator extends StatelessWidget {
  final int quantity;
  final int lowThreshold;

  const StockIndicator({super.key, required this.quantity, this.lowThreshold = 10});

  Color get _color {
    if (quantity <= 0) return AppTheme.error;
    if (quantity <= lowThreshold) return AppTheme.warning;
    return AppTheme.success;
  }

  String get _label {
    if (quantity <= 0) return 'Sem estoque';
    if (quantity <= lowThreshold) return 'Estoque baixo';
    return 'Estoque OK';
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10, height: 10,
          decoration: BoxDecoration(
            color: _color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          _label,
          style: TextStyle(
            fontSize: 12,
            color: _color,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
