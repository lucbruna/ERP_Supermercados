import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(title: const Text('Meu Perfil')),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: AppTheme.primaryGreen,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(32),
                  bottomRight: Radius.circular(32),
                ),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 44,
                    backgroundColor: Colors.white.withOpacity(0.2),
                    child: Text(user?.initials ?? '?',
                        style: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                  const SizedBox(height: 12),
                  Text(user?.name ?? 'Colaborador',
                      style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 4),
                  Text(user?.position ?? '',
                      style: GoogleFonts.inter(fontSize: 14, color: Colors.white70)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
                    child: Text(user?.department ?? '',
                        style: GoogleFonts.inter(fontSize: 13, color: Colors.white, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  _buildInfoTile(Icons.badge_outlined, 'Matrícula', user?.registrationNumber ?? '---'),
                  _buildInfoTile(Icons.email_outlined, 'E-mail', user?.email ?? ''),
                  _buildInfoTile(Icons.phone_outlined, 'Telefone', user?.phone ?? ''),
                  _buildInfoTile(Icons.badge_outlined, 'CPF', user?.maskedCpf ?? ''),
                  _buildInfoTile(Icons.calendar_today, 'Admissão', user?.hireDateFormatted ?? ''),
                  _buildInfoTile(Icons.work_outline, 'Cargo', user?.position ?? ''),
                  _buildInfoTile(Icons.business_outlined, 'Departamento', user?.department ?? ''),
                  _buildInfoTile(Icons.schedule, 'Turno', _getShiftLabel(user?.workShift ?? '')),
                  _buildInfoTile(Icons.attractions_outlined, 'RH', user?.isRh == true ? 'Sim' : 'Não'),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Card(
                child: ListTile(
                  leading: Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryGreen.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.edit_outlined, color: AppTheme.primaryGreen),
                  ),
                  title: const Text('Editar Perfil'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.pushNamed(context, AppRoutes.editProfile),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _showLogoutDialog(context, auth),
                  icon: const Icon(Icons.logout, color: AppTheme.error),
                  label: const Text('Sair', style: TextStyle(color: AppTheme.error)),
                  style: OutlinedButton.styleFrom(side: const BorderSide(color: AppTheme.error)),
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value) {
    return Card(
      margin: const EdgeInsets.only(bottom: 6),
      child: ListTile(
        leading: Container(
          width: 36, height: 36,
          decoration: BoxDecoration(
            color: AppTheme.primaryGreen.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppTheme.primaryGreen, size: 18),
        ),
        title: Text(label, style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary)),
        subtitle: Text(value, style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500, color: AppTheme.textPrimary)),
      ),
    );
  }

  String _getShiftLabel(String shift) {
    switch (shift) {
      case 'comercial': return 'Comercial (08h-18h)';
      case 'morning': return 'Matutino (06h-14h)';
      case 'afternoon': return 'Vespertino (14h-22h)';
      case 'night': return 'Noturno (22h-06h)';
      default: return shift;
    }
  }

  void _showLogoutDialog(BuildContext context, AuthProvider auth) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Sair'),
        content: const Text('Deseja realmente sair?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () {
              auth.logout();
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, AppRoutes.login);
            },
            child: const Text('Sair'),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.error),
          ),
        ],
      ),
    );
  }
}
