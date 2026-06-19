import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _cpfController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  bool _acceptTerms = false;
  int _currentStep = 0;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _cpfController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  String _cleanCpf(String cpf) {
    return cpf.replaceAll(RegExp(r'[^\d]'), '');
  }

  String _formatCpf(String cpf) {
    final cleaned = _cleanCpf(cpf);
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return '${cleaned.substring(0, 3)}.${cleaned.substring(3)}';
    if (cleaned.length <= 9) return '${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6)}';
    return '${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9, 11)}';
  }

  String _formatPhone(String phone) {
    final cleaned = phone.replaceAll(RegExp(r'[^\d]'), '');
    if (cleaned.length <= 2) return '($cleaned';
    if (cleaned.length <= 7) return '(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}';
    return '(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}';
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_acceptTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Aceite os termos de uso para continuar')),
      );
      return;
    }

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.register({
      'name': _nameController.text.trim(),
      'email': _emailController.text.trim(),
      'phone': _phoneController.text.trim(),
      'cpf': _cleanCpf(_cpfController.text),
      'password': _passwordController.text,
    });

    if (!mounted) return;

    if (success) {
      Navigator.pushReplacementNamed(context, AppRoutes.home);
    } else if (authProvider.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.error!),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Criar Conta'),
        backgroundColor: Colors.transparent,
        foregroundColor: AppTheme.textPrimary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: size.width * 0.06),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildStepIndicator(),
                const SizedBox(height: 24),
                if (_currentStep == 0) _buildPersonalInfoStep(),
                if (_currentStep == 1) _buildCredentialsStep(),
                if (_currentStep == 2) _buildTermsStep(),
                const SizedBox(height: 32),
                Row(
                  children: [
                    if (_currentStep > 0)
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => setState(() => _currentStep--),
                          child: const Text('Voltar'),
                        ),
                      ),
                    if (_currentStep > 0) const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _currentStep < 2
                            ? () {
                                if (_currentStep == 0) {
                                  if (_nameController.text.isEmpty ||
                                      _emailController.text.isEmpty) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Preencha os campos obrigatórios')),
                                    );
                                    return;
                                  }
                                }
                                setState(() => _currentStep++);
                              }
                            : _handleRegister,
                        child: Text(_currentStep == 2 ? 'Criar Conta' : 'Próximo'),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: size.height * 0.03),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: List.generate(3, (index) {
          final isActive = index <= _currentStep;
          final isLast = index == 2;
          return Expanded(
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isActive ? AppTheme.primaryGreen : Colors.grey[300],
                  ),
                  child: Center(
                    child: Icon(
                      index < _currentStep ? Icons.check : Icons.person_add_outlined,
                      size: 18,
                      color: Colors.white,
                    ),
                  ),
                ),
                if (!isLast)
                  Expanded(
                    child: Container(
                      height: 2,
                      color: isActive ? AppTheme.primaryGreen : Colors.grey[300],
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildPersonalInfoStep() {
    return Column(
      children: [
        TextFormField(
          controller: _nameController,
          decoration: const InputDecoration(
            labelText: 'Nome completo *',
            prefixIcon: Icon(Icons.person_outline),
          ),
          validator: (v) => v == null || v.isEmpty ? 'Informe seu nome' : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(
            labelText: 'E-mail *',
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
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
            labelText: 'Telefone',
            prefixIcon: Icon(Icons.phone_outlined),
          ),
          onChanged: (v) {
            final formatted = _formatPhone(v);
            if (formatted != v) {
              _phoneController.value = TextEditingValue(
                text: formatted,
                selection: TextSelection.collapsed(offset: formatted.length),
              );
            }
          },
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _cpfController,
          keyboardType: TextInputType.number,
          maxLength: 14,
          decoration: const InputDecoration(
            labelText: 'CPF',
            prefixIcon: Icon(Icons.badge_outlined),
            counterText: '',
          ),
          onChanged: (v) {
            final formatted = _formatCpf(v);
            if (formatted != v) {
              _cpfController.value = TextEditingValue(
                text: formatted,
                selection: TextSelection.collapsed(offset: formatted.length),
              );
            }
          },
        ),
      ],
    );
  }

  Widget _buildCredentialsStep() {
    return Column(
      children: [
        TextFormField(
          controller: _passwordController,
          obscureText: _obscurePassword,
          decoration: InputDecoration(
            labelText: 'Senha *',
            prefixIcon: const Icon(Icons.lock_outlined),
            suffixIcon: IconButton(
              icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined),
              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
            ),
          ),
          validator: (v) {
            if (v == null || v.isEmpty) return 'Crie uma senha';
            if (v.length < 6) return 'Mínimo de 6 caracteres';
            return null;
          },
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _confirmPasswordController,
          obscureText: _obscureConfirm,
          decoration: InputDecoration(
            labelText: 'Confirmar senha *',
            prefixIcon: const Icon(Icons.lock_outlined),
            suffixIcon: IconButton(
              icon: Icon(_obscureConfirm ? Icons.visibility_outlined : Icons.visibility_off_outlined),
              onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
            ),
          ),
          validator: (v) {
            if (v != _passwordController.text) return 'Senhas não conferem';
            return null;
          },
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.primaryGreen.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              const Icon(Icons.info_outline, color: AppTheme.primaryGreen, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Sua senha deve ter no mínimo 6 caracteres, incluindo letras e números.',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTermsStep() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.divider),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Termos de Uso',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Ao criar sua conta, você concorda com nossos termos de uso e política de privacidade.',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: AppTheme.textSecondary,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                '• Seus dados estão protegidos conforme a LGPD\n'
                '• Você receberá ofertas personalizadas\n'
                '• Acumule pontos a cada compra\n'
                '• Troque pontos por descontos e produtos',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: AppTheme.textPrimary,
                  height: 1.6,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            SizedBox(
              height: 24,
              width: 24,
              child: Checkbox(
                value: _acceptTerms,
                onChanged: (v) => setState(() => _acceptTerms = v ?? false),
                activeColor: AppTheme.primaryGreen,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Aceito os termos de uso e política de privacidade',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: AppTheme.textPrimary,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
