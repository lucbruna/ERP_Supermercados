import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:offline/offline.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/auth_provider.dart';
import '../../providers/delivery_provider.dart';
import '../../widgets/offline_banner.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final SyncService _syncService = SyncService();
  StreamSubscription<SyncStatus>? _syncSub;
  bool _isOffline = false;
  int _pendingCount = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DeliveryProvider>().loadTodayDeliveries();
    });
    _syncSub = _syncService.onStatusChanged.listen((status) {
      if (mounted) setState(() { _isOffline = !status.isOnline; _pendingCount = status.pendingCount; });
    });
  }

  @override
  void dispose() {
    _syncSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final delivery = context.watch<DeliveryProvider>();
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            if (_isOffline) OfflineBanner(pendingCount: _pendingCount, syncService: _syncService),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () => context.read<DeliveryProvider>().loadTodayDeliveries(),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(auth, size),
                      _buildStatsSection(delivery),
                      _buildQuickActions(context),
                      _buildTodayPreview(delivery),
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildHeader(AuthProvider auth, Size size) {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 16, 20, 24),
      decoration: const BoxDecoration(
        color: AppTheme.primary,
        borderRadius: BorderRadius.only(bottomLeft: Radius.circular(32), bottomRight: Radius.circular(32)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: Colors.white.withOpacity(0.2),
                child: Text(
                  (auth.user?['name'] as String? ?? 'E').substring(0, 1).toUpperCase(),
                  style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Olá, ${(auth.user?['name'] as String? ?? 'Entregador').split(' ').first}!',
                        style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
                    Text('App do Entregador', style: GoogleFonts.inter(fontSize: 13, color: Colors.white70)),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.person_outline, color: Colors.white),
                onPressed: () => Navigator.pushNamed(context, AppRoutes.profile),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatsSection(DeliveryProvider delivery) {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 16, offset: const Offset(0, 4))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem('${delivery.totalDeliveries}', 'Entregas Hoje', AppTheme.primary),
          _buildStatItem('${delivery.completedDeliveries}', 'Concluídas', AppTheme.success),
          _buildStatItem('${delivery.pendingDeliveries}', 'Pendentes', AppTheme.warning),
        ],
      ),
    );
  }

  Widget _buildStatItem(String value, String label, Color color) {
    return Column(
      children: [
        Text(value, style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Ações Rápidas', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildActionCard(context, Icons.route, 'Iniciar Rota', AppTheme.primary, AppRoutes.route),
              const SizedBox(width: 12),
              _buildActionCard(context, Icons.list_alt, 'Ver Entregas', AppTheme.accent, AppRoutes.deliveryList),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard(BuildContext context, IconData icon, String label, Color color, String route) {
    return Expanded(
      child: GestureDetector(
        onTap: () => Navigator.pushNamed(context, route),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
          ),
          child: Column(
            children: [
              Container(
                width: 48, height: 48,
                decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(14)),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(height: 8),
              Text(label, textAlign: TextAlign.center, style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textPrimary, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTodayPreview(DeliveryProvider delivery) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Entregas de Hoje', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, AppRoutes.deliveryList),
                child: const Text('Ver todas'),
              ),
            ],
          ),
          delivery.todayDeliveries.isEmpty
              ? Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(Icons.check_circle, size: 48, color: AppTheme.success),
                        const SizedBox(height: 12),
                        Text('Todas as entregas concluídas!', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                      ],
                    ),
                  ),
                )
              : Column(
                  children: delivery.todayDeliveries.take(3).map((d) => _buildMiniDeliveryCard(d)).toList(),
                ),
        ],
      ),
    );
  }

  Widget _buildMiniDeliveryCard(Map<String, dynamic> delivery) {
    final status = delivery['status'] ?? '';
    final statusColors = {
      'pending': AppTheme.warning,
      'in_transit': AppTheme.primary,
      'completed': AppTheme.success,
      'entregue': AppTheme.success,
      'problem': AppTheme.error,
    };
    final color = statusColors[status] ?? AppTheme.textSecondary;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          width: 40, height: 40,
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
          child: Icon(Icons.inventory_2, color: color, size: 20),
        ),
        title: Text('Pedido #${delivery['order_number'] ?? delivery['id']}', style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
        subtitle: Text(delivery['customer_name'] ?? delivery['cliente'] ?? '', style: GoogleFonts.inter(fontSize: 12)),
        trailing: Text('R\$ ${(delivery['value'] ?? delivery['valor'] ?? 0).toStringAsFixed(2)}', style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: AppTheme.primary)),
      ),
    );
  }

  Widget _buildBottomNav() {
    return BottomNavigationBar(
      currentIndex: 0,
      onTap: (index) {
        switch (index) {
          case 1: Navigator.pushNamed(context, AppRoutes.deliveryList);
          case 2: Navigator.pushNamed(context, AppRoutes.history);
          case 3: Navigator.pushNamed(context, AppRoutes.profile);
        }
      },
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Início'),
        BottomNavigationBarItem(icon: Icon(Icons.list_alt_outlined), activeIcon: Icon(Icons.list_alt), label: 'Entregas'),
        BottomNavigationBarItem(icon: Icon(Icons.history_outlined), activeIcon: Icon(Icons.history), label: 'Histórico'),
        BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Perfil'),
      ],
    );
  }
}
