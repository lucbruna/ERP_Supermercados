import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/offline_banner.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _dailyReport = true;
  bool _weeklyReport = false;
  bool _lowStockAlerts = true;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('Configurações')),
      body: Column(
        children: [
          const OwnerOfflineBanner(),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Center(
                            child: Text(
                              (auth.user?['name'] ?? 'S')[0].toUpperCase(),
                              style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(auth.user?['name'] ?? 'Sócio', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600)),
                              Text(auth.user?['email'] ?? '', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text('Notificações', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                const SizedBox(height: 8),
                Card(
                  child: Column(
                    children: [
                      SwitchListTile(
                        title: const Text('Notificações Push'),
                        subtitle: const Text('Receber alertas no celular'),
                        value: _notificationsEnabled,
                        activeColor: AppTheme.primaryColor,
                        onChanged: (v) => setState(() => _notificationsEnabled = v),
                      ),
                      const Divider(height: 1),
                      SwitchListTile(
                        title: const Text('Relatório Diário'),
                        subtitle: const Text('Resumo do dia às 19h'),
                        value: _dailyReport,
                        activeColor: AppTheme.primaryColor,
                        onChanged: (v) => setState(() => _dailyReport = v),
                      ),
                      const Divider(height: 1),
                      SwitchListTile(
                        title: const Text('Relatório Semanal'),
                        subtitle: const Text('Resumo semanal aos domingos'),
                        value: _weeklyReport,
                        activeColor: AppTheme.primaryColor,
                        onChanged: (v) => setState(() => _weeklyReport = v),
                      ),
                      const Divider(height: 1),
                      SwitchListTile(
                        title: const Text('Alertas de Estoque'),
                        subtitle: const Text('Notificar quando estoque estiver baixo'),
                        value: _lowStockAlerts,
                        activeColor: AppTheme.primaryColor,
                        onChanged: (v) => setState(() => _lowStockAlerts = v),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Text('Conta', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                const SizedBox(height: 8),
                Card(
                  child: Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.lock, color: AppTheme.textSecondary),
                        title: const Text('Alterar Senha'),
                        trailing: const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
                        onTap: () {},
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: const Icon(Icons.security, color: AppTheme.textSecondary),
                        title: const Text('Autenticação em Dois Fatores'),
                        trailing: const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
                        onTap: () {},
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: const Icon(Icons.logout, color: AppTheme.error),
                        title: const Text('Sair', style: TextStyle(color: AppTheme.error)),
                        onTap: () async {
                          await auth.logout();
                          if (context.mounted) {
                            Navigator.pushReplacementNamed(context, AppRoutes.login);
                          }
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Center(
                  child: Text('Versão 1.0.0', style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 12)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
