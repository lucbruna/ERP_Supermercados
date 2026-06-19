import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import '../services/biometric_service.dart';

class BiometricDialog extends StatefulWidget {
  final String reason;
  final bool requireFace;
  final VoidCallback? onAuthenticated;
  final VoidCallback? onFailed;

  const BiometricDialog({
    super.key,
    this.reason = 'Autenticação necessária',
    this.requireFace = false,
    this.onAuthenticated,
    this.onFailed,
  });

  @override
  State<BiometricDialog> createState() => _BiometricDialogState();
}

class _BiometricDialogState extends State<BiometricDialog> {
  final BiometricService _biometricService = BiometricService();
  bool _isAuthenticating = false;
  bool _faceCaptured = false;

  @override
  void initState() {
    super.initState();
    _biometricService.initialize();
  }

  Future<void> _authenticateWithBiometrics() async {
    setState(() => _isAuthenticating = true);

    final authenticated = await _biometricService.authenticate(
      reason: widget.reason,
    );

    setState(() => _isAuthenticating = false);

    if (authenticated && mounted) {
      if (widget.requireFace) {
        setState(() => _faceCaptured = true);
      } else {
        widget.onAuthenticated?.call();
        Navigator.pop(context);
      }
    } else if (mounted) {
      widget.onFailed?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: _isAuthenticating
                  ? const CircularProgressIndicator(color: AppTheme.primaryGreen)
                  : Icon(
                      widget.requireFace && !_faceCaptured
                          ? Icons.face_outlined
                          : Icons.fingerprint,
                      size: 40,
                      color: AppTheme.primaryGreen,
                    ),
            ),
            const SizedBox(height: 24),
            Text(
              widget.requireFace && !_faceCaptured
                  ? 'Reconhecimento Facial'
                  : 'Autenticação Biométrica',
              style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              widget.reason,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isAuthenticating ? null : _authenticateWithBiometrics,
                icon: Icon(
                  widget.requireFace && !_faceCaptured
                      ? Icons.camera_alt
                      : Icons.fingerprint,
                ),
                label: Text(
                  _isAuthenticating
                      ? 'Autenticando...'
                      : widget.requireFace && !_faceCaptured
                          ? 'Capturar Face'
                          : 'Autenticar',
                ),
              ),
            ),
            if (!widget.requireFace) ...[
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancelar'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
