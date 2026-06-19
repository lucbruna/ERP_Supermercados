import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/auth_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Configurações')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppTheme.primary.withOpacity(0.1),
                    child: const Icon(Icons.person, color: AppTheme.primary),
                  ),
                  title: Text(auth.user?['name'] ?? 'Usuário', style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
                  subtitle: Text(auth.user?['email'] ?? '', style: GoogleFonts.inter(fontSize: 12)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.notifications_outlined, color: AppTheme.primary),
                  title: const Text('Notificações'),
                  trailing: Switch(value: true, onChanged: (_) {}),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.storage_outlined, color: AppTheme.primary),
                  title: const Text('Sincronização Automática'),
                  subtitle: Text('Ativada', style: GoogleFonts.inter(fontSize: 12)),
                  trailing: Switch(value: true, onChanged: (_) {}),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.info_outline, color: AppTheme.primary),
                  title: const Text('Versão'),
                  trailing: Text('1.0.0', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: OutlinedButton.icon(
              onPressed: () async {
                await auth.logout();
                if (context.mounted) {
                  Navigator.pushReplacementNamed(context, AppRoutes.login);
                }
              },
              icon: const Icon(Icons.logout),
              label: const Text('Sair'),
              style: OutlinedButton.styleFrom(foregroundColor: AppTheme.error, side: const BorderSide(color: AppTheme.error)),
            ),
          ),
        ],
      ),
    );
  }
}
