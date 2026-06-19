import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../config/constants.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../config/routes.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final theme = context.watch<ThemeProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Mais')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.primaryGreen, AppTheme.primaryDark],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryGreen.withOpacity(0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: Colors.white.withOpacity(0.2),
                    child: Text(
                      auth.user?.initials ?? '?',
                      style: GoogleFonts.inter(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          auth.user?.name ?? 'Usuário',
                          style: GoogleFonts.inter(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          auth.user?.email ?? '',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: Colors.white),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Configurações',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            const SizedBox(height: 8),
            _buildSettingsGroup([
              _buildSettingItem(
                icon: Icons.dark_mode_outlined,
                title: 'Modo Escuro',
                trailing: Switch(
                  value: theme.isDarkMode,
                  onChanged: (_) => theme.toggleTheme(),
                  activeColor: AppTheme.primaryGreen,
                ),
              ),
              _buildSettingItem(
                icon: Icons.notifications_outlined,
                title: 'Notificações',
                trailing: Switch(value: true, onChanged: (_) {}),
              ),
              _buildSettingItem(
                icon: Icons.fingerprint,
                title: 'Biometria',
                subtitle: 'Acessar com digital',
                trailing: Switch(value: false, onChanged: (_) {}),
              ),
            ]),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Suporte',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            const SizedBox(height: 8),
            _buildSettingsGroup([
              _buildSettingItem(
                icon: Icons.help_outline,
                title: 'Ajuda',
                onTap: () {},
              ),
              _buildSettingItem(
                icon: Icons.chat_outlined,
                title: 'Fale Conosco',
                subtitle: 'Suporte via chat',
                onTap: () {},
              ),
              _buildSettingItem(
                icon: Icons.phone_outlined,
                title: 'Telefone',
                subtitle: AppConstants.supportPhone,
                onTap: () {},
              ),
              _buildSettingItem(
                icon: Icons.email_outlined,
                title: 'E-mail',
                subtitle: AppConstants.supportEmail,
                onTap: () {},
              ),
            ]),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Informações',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            const SizedBox(height: 8),
            _buildSettingsGroup([
              _buildSettingItem(icon: Icons.info_outline, title: 'Sobre', subtitle: 'Versão ${AppConstants.appVersion}'),
              _buildSettingItem(icon: Icons.description_outlined, title: 'Termos de Uso'),
              _buildSettingItem(icon: Icons.privacy_tip_outlined, title: 'Política de Privacidade'),
              _buildSettingItem(icon: Icons.gavel_outlined, title: 'LGPD'),
            ]),
            const SizedBox(height: 24),
            Center(
              child: TextButton.icon(
                onPressed: () {
                  auth.logout();
                  Navigator.pushReplacementNamed(context, AppRoutes.login);
                },
                icon: const Icon(Icons.logout, color: AppTheme.error),
                label: const Text(
                  'Sair da Conta',
                  style: TextStyle(color: AppTheme.error),
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsGroup(List<Widget> items) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(children: items),
    );
  }

  Widget _buildSettingItem({
    required IconData icon,
    required String title,
    String? subtitle,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return Column(
      children: [
        ListTile(
          leading: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppTheme.primaryGreen.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppTheme.primaryGreen, size: 20),
          ),
          title: Text(
            title,
            style: GoogleFonts.inter(
              fontSize: 15,
              fontWeight: FontWeight.w500,
              color: AppTheme.textPrimary,
            ),
          ),
          subtitle: subtitle != null
              ? Text(
                  subtitle,
                  style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
                )
              : null,
          trailing: trailing ?? (onTap != null ? const Icon(Icons.chevron_right, color: AppTheme.textSecondary) : null),
          onTap: onTap,
        ),
        const Divider(height: 1, indent: 60, endIndent: 16),
      ],
    );
  }
}
