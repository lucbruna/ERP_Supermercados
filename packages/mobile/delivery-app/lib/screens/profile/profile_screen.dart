import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(title: const Text('Meu Perfil')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: AppTheme.primary.withOpacity(0.1),
                      child: Text(
                        (user?['name'] as String? ?? 'E').substring(0, 1).toUpperCase(),
                        style: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.bold, color: AppTheme.primary),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(user?['name'] ?? 'Entregador', style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold)),
                    Text(user?['email'] ?? '', style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Estatísticas', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 16),
                    _buildStatRow(Icons.local_shipping, 'Entregas/Dia', '${user?['stats']?['deliveries_per_day'] ?? '-'}'),
                    _buildStatRow(Icons.star, 'Avaliação', '${user?['stats']?['rating'] ?? '-'} ⭐'),
                    _buildStatRow(Icons.speed, 'Desempenho', '${user?['stats']?['performance'] ?? '-'}%'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
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
                    leading: const Icon(Icons.sync, color: AppTheme.primary),
                    title: const Text('Sincronização Automática'),
                    trailing: Switch(value: true, onChanged: (_) {}),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity, height: 52,
              child: OutlinedButton.icon(
                onPressed: () async {
                  await auth.logout();
                  if (context.mounted) Navigator.pushReplacementNamed(context, AppRoutes.login);
                },
                icon: const Icon(Icons.logout),
                label: const Text('Sair'),
                style: OutlinedButton.styleFrom(foregroundColor: AppTheme.error, side: const BorderSide(color: AppTheme.error)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppTheme.primary),
          const SizedBox(width: 12),
          Expanded(child: Text(label, style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary))),
          Text(value, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
        ],
      ),
    );
  }
}
