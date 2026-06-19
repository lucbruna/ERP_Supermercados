import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import '../config/routes.dart';
import '../providers/auth_provider.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Drawer(
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primaryGreen, AppTheme.primaryDark],
              ),
            ),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white.withOpacity(0.2),
              child: Text(
                user?.initials ?? '?',
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
            accountName: Text(
              user?.name ?? 'Usuário',
              style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            accountEmail: Text(
              user?.email ?? '',
              style: GoogleFonts.inter(fontSize: 13),
            ),
          ),
          _buildMenuItem(Icons.home_outlined, 'Início', () {
            Navigator.pop(context);
            Navigator.pushNamed(context, AppRoutes.home);
          }),
          _buildMenuItem(Icons.shopping_bag_outlined, 'Produtos', () {
            Navigator.pop(context);
            Navigator.pushNamed(context, AppRoutes.products);
          }),
          _buildMenuItem(Icons.shopping_cart_outlined, 'Carrinho', () {
            Navigator.pop(context);
            Navigator.pushNamed(context, AppRoutes.cart);
          }),
          _buildMenuItem(Icons.card_giftcard, 'Fidelidade', () {
            Navigator.pop(context);
            Navigator.pushNamed(context, AppRoutes.fidelity);
          }),
          _buildMenuItem(Icons.receipt_long_outlined, 'Histórico', () {
            Navigator.pop(context);
            Navigator.pushNamed(context, AppRoutes.saleHistory);
          }),
          const Divider(),
          _buildMenuItem(Icons.person_outline, 'Meu Perfil', () {
            Navigator.pop(context);
            Navigator.pushNamed(context, AppRoutes.profile);
          }),
          _buildMenuItem(Icons.settings_outlined, 'Configurações', () {
            Navigator.pop(context);
            Navigator.pushNamed(context, AppRoutes.more);
          }),
          const Spacer(),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: AppTheme.error),
            title: Text(
              'Sair',
              style: GoogleFonts.inter(color: AppTheme.error),
            ),
            onTap: () {
              auth.logout();
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, AppRoutes.login);
            },
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.textSecondary),
      title: Text(
        title,
        style: GoogleFonts.inter(fontSize: 15, color: AppTheme.textPrimary),
      ),
      onTap: onTap,
    );
  }
}
