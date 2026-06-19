import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/auth_provider.dart';

class MfaScreen extends StatefulWidget {
  const MfaScreen({super.key});

  @override
  State<MfaScreen> createState() => _MfaScreenState();
}

class _MfaScreenState extends State<MfaScreen> {
  final _codeController = TextEditingController();
  bool _isVerifying = false;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _verifyCode() async {
    if (_codeController.text.length != 6) return;

    setState(() => _isVerifying = true);

    final auth = context.read<AuthProvider>();
    final success = await auth.verifyMfa(_codeController.text);

    if (!mounted) return;

    if (success) {
      Navigator.pushReplacementNamed(context, AppRoutes.home);
    } else {
      setState(() => _isVerifying = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.error ?? 'Código inválido'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verificação'),
        backgroundColor: Colors.transparent,
        foregroundColor: AppTheme.textPrimary,
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 40),
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppTheme.primaryGreen.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.security_outlined, size: 40, color: AppTheme.primaryGreen),
              ),
              const SizedBox(height: 24),
              Text(
                'Autenticação de Dois Fatores',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 8),
              Text(
                'Digite o código enviado para seu e-mail corporativo',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 40),
              TextField(
                controller: _codeController,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                maxLength: 6,
                style: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.bold, letterSpacing: 8),
                decoration: InputDecoration(
                  counterText: '',
                  hintText: '000000',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: AppTheme.divider),
                  ),
                ),
                onSubmitted: (_) => _verifyCode(),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isVerifying || _codeController.text.length != 6 ? null : _verifyCode,
                  child: _isVerifying
                      ? const SizedBox(height: 24, width: 24,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Verificar'),
                ),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () {},
                child: Text('Reenviar código',
                    style: GoogleFonts.inter(color: AppTheme.primaryGreen, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
