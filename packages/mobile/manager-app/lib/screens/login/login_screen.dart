import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.login(
      _emailController.text.trim(),
      _passwordController.text,
    );
    if (!mounted) return;
    if (success) {
      Navigator.pushReplacementNamed(context, AppRoutes.home);
    } else if (authProvider.isMfaRequired) {
      Navigator.pushReplacementNamed(context, AppRoutes.mfa);
    } else if (authProvider.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(authProvider.error!), backgroundColor: AppTheme.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: size.width * 0.06),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: size.height * 0.08),
                Center(
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryColor.withOpacity(0.3),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.store_mall_directory, size: 48, color: Colors.white),
                  ),
                ),
                SizedBox(height: size.height * 0.04),
                Text(
                  'Gestão da Loja',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                ),
                const SizedBox(height: 8),
                Text(
                  'Acesse o painel do gerente',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(fontSize: 16, color: AppTheme.textSecondary),
                ),
                SizedBox(height: size.height * 0.05),
                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          labelText: 'E-mail',
                          prefixIcon: Icon(Icons.email_outlined),
                        ),
                        validator: (v) {
                          if (v == null || v.isEmpty) return 'Informe seu e-mail';
                          if (!v.contains('@')) return 'E-mail inválido';
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          labelText: 'Senha',
                          prefixIcon: const Icon(Icons.lock_outlined),
                          suffixIcon: IconButton(
                            icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                          ),
                        ),
                        validator: (v) {
                          if (v == null || v.isEmpty) return 'Informe sua senha';
                          if (v.length < 6) return 'Senha deve ter no mínimo 6 caracteres';
                          return null;
                        },
                      ),
                      SizedBox(height: size.height * 0.03),
                      Consumer<AuthProvider>(
                        builder: (context, auth, _) {
                          return SizedBox(
                            width: double.infinity,
                            height: 52,
                            child: ElevatedButton(
                              onPressed: auth.status == AuthStatus.loading ? null : _handleLogin,
                              child: auth.status == AuthStatus.loading
                                  ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                  : const Text('Entrar'),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
                SizedBox(height: size.height * 0.03),
                Row(
                  children: [
                    const Expanded(child: Divider()),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text('ou', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                    ),
                    const Expanded(child: Divider()),
                  ],
                ),
                SizedBox(height: size.height * 0.03),
                OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.fingerprint),
                  label: const Text('Entrar com Biometria'),
                  style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
