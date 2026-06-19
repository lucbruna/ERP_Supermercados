import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';

class FaceCaptureWidget extends StatefulWidget {
  final Function(File image)? onImageCaptured;
  final double? matchPercent;
  final bool showGuide;

  const FaceCaptureWidget({
    super.key,
    this.onImageCaptured,
    this.matchPercent,
    this.showGuide = true,
  });

  @override
  State<FaceCaptureWidget> createState() => _FaceCaptureWidgetState();
}

class _FaceCaptureWidgetState extends State<FaceCaptureWidget>
    with SingleTickerProviderStateMixin {
  File? _capturedImage;
  late AnimationController _scanController;
  late Animation<double> _scanAnimation;

  @override
  void initState() {
    super.initState();
    _scanController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _scanAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _scanController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _scanController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 280,
          height: 280,
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Stack(
            children: [
              if (_capturedImage != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Image.file(
                    _capturedImage!,
                    width: 280,
                    height: 280,
                    fit: BoxFit.cover,
                  ),
                )
              else
                ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Container(
                    color: Colors.grey[900],
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.camera_alt, size: 48, color: Colors.grey[600]),
                          const SizedBox(height: 8),
                          Text('Posicione o rosto no centro',
                              style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[500])),
                        ],
                      ),
                    ),
                  ),
                ),
              if (widget.showGuide && _capturedImage == null)
                Center(
                  child: _AppAnimatedBuilder(
                    listenable: _scanAnimation,
                    builder: (context, child) {
                      return Container(
                        width: 200,
                        height: 2,
                        color: AppTheme.primaryGreen.withOpacity(0.5 * _scanAnimation.value),
                      );
                    },
                  ),
                ),
              if (widget.showGuide)
                Positioned.fill(
                  child: IgnorePointer(
                    child: CustomPaint(
                      painter: _FaceGuidePainter(),
                    ),
                  ),
                ),
              if (widget.matchPercent != null)
                Positioned(
                  bottom: 12,
                  left: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black54,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          widget.matchPercent! >= 75 ? Icons.check_circle : Icons.error,
                          size: 16,
                          color: widget.matchPercent! >= 75 ? AppTheme.success : AppTheme.error,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Match: ${widget.matchPercent!.toStringAsFixed(1)}%',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        if (_capturedImage == null)
          SizedBox(
            width: 200,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.camera_alt),
              label: const Text('Capturar Foto'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryGreen,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          )
        else
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              OutlinedButton.icon(
                onPressed: () => setState(() => _capturedImage = null),
                icon: const Icon(Icons.refresh),
                label: const Text('Tirar Novamente'),
              ),
              const SizedBox(width: 12),
              ElevatedButton.icon(
                onPressed: () => widget.onImageCaptured?.call(_capturedImage!),
                icon: const Icon(Icons.check),
                label: const Text('Confirmar'),
              ),
            ],
          ),
      ],
    );
  }
}

class _FaceGuidePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final ovalRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(size.width / 2, size.height / 2),
        width: size.width * 0.6,
        height: size.height * 0.7,
      ),
      const Radius.circular(16),
    );
    canvas.drawRRect(ovalRect, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _AppAnimatedBuilder extends AnimatedWidget {
  final Widget Function(BuildContext context, Widget? child) builder;
  final Widget? child;

  const _AppAnimatedBuilder({
    super.key,
    required super.listenable,
    required this.builder,
    this.child,
  });

  @override
  Widget build(BuildContext context) {
    return builder(context, child);
  }
}
