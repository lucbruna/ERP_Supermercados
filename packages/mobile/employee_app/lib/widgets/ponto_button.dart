import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import '../providers/ponto_provider.dart';

class PontoButton extends StatefulWidget {
  final PontoStatus status;
  final bool isLoading;
  final VoidCallback? onPressed;

  const PontoButton({
    super.key,
    required this.status,
    this.isLoading = false,
    this.onPressed,
  });

  @override
  State<PontoButton> createState() => _PontoButtonState();
}

class _PontoButtonState extends State<PontoButton> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isClockedIn = widget.status == PontoStatus.clockedIn;
    final isOnBreak = widget.status == PontoStatus.onBreak;
    final isClockedOut = widget.status == PontoStatus.clockedOut;

    Color buttonColor;
    String label;
    IconData icon;

    if (isClockedIn) {
      buttonColor = AppTheme.clockOut;
      label = 'Registrar Saída';
      icon = Icons.logout;
    } else if (isOnBreak) {
      buttonColor = AppTheme.breakColor;
      label = 'Voltar do Intervalo';
      icon = Icons.free_breakfast;
    } else if (isClockedOut) {
      buttonColor = Colors.grey;
      label = 'Expediente Encerrado';
      icon = Icons.check_circle;
    } else {
      buttonColor = AppTheme.clockIn;
      label = 'Registrar Entrada';
      icon = Icons.login;
    }

    return GestureDetector(
      onTap: (isClockedOut || widget.isLoading) ? null : widget.onPressed,
      child: _AppAnimatedBuilder(
        listenable: _pulseAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: (!isClockedOut && !widget.isLoading) ? _pulseAnimation.value : 1.0,
            child: child,
          );
        },
        child: Container(
          width: 200,
          height: 200,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [buttonColor, buttonColor.withOpacity(0.8)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: buttonColor.withOpacity(0.4),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (widget.isLoading)
                const SizedBox(
                  width: 40, height: 40,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                )
              else
                Icon(icon, size: 48, color: Colors.white),
              const SizedBox(height: 8),
              Text(
                label,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
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
