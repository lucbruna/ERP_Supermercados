import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:offline/offline.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/auth_provider.dart';
import '../../providers/stock_provider.dart';
import '../../providers/inventory_provider.dart';
import '../../providers/transfer_provider.dart';
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
      context.read<StockProvider>().loadLowStockAlerts();
      context.read<InventoryProvider>().loadInventories();
      context.read<TransferProvider>().loadTransfers();
    });
    _syncSub = _syncService.onStatusChanged.listen((status) {
      if (mounted) {
        setState(() {
          _isOffline = !status.isOnline;
          _pendingCount = status.pendingCount;
        });
      }
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
    final stock = context.watch<StockProvider>();
    final inventory = context.watch<InventoryProvider>();
    final transfer = context.watch<TransferProvider>();
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            if (_isOffline) OfflineBanner(pendingCount: _pendingCount, syncService: _syncService),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async {
                  await context.read<StockProvider>().loadLowStockAlerts();
                  await context.read<InventoryProvider>().loadInventories();
                  await context.read<TransferProvider>().loadTransfers();
                },
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(auth, size),
                      _buildQuickActions(context),
                      _buildTodaySection(context, inventory),
                      _buildAlertsSection(stock),
                      _buildTransfersSection(transfer),
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
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(32),
          bottomRight: Radius.circular(32),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: Colors.white.withOpacity(0.2),
                child: Text(
                  auth.user != null ? (auth.user!['name'] as String? ?? '?').substring(0, 1).toUpperCase() : '?',
                  style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Olá, ${(auth.user?['name'] as String? ?? 'Estoquista').split(' ').first}!',
                      style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white),
                    ),
                    Text('Controle de Estoque', style: GoogleFonts.inter(fontSize: 13, color: Colors.white70)),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.settings_outlined, color: Colors.white),
                onPressed: () => Navigator.pushNamed(context, AppRoutes.settings),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Ações Rápidas', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildActionCard(context, Icons.qr_code_scanner, 'Contar Estoque', AppTheme.primary, AppRoutes.stockCount),
              const SizedBox(width: 12),
              _buildActionCard(context, Icons.swap_horiz, 'Transferir', AppTheme.accent, AppRoutes.transfers),
              const SizedBox(width: 12),
              _buildActionCard(context, Icons.search, 'Consultar Produto', AppTheme.warning, AppRoutes.productSearch),
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
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
          ),
          child: Column(
            children: [
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(height: 8),
              Text(label, textAlign: TextAlign.center, style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTodaySection(BuildContext context, InventoryProvider inventory) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Itens para Conferir Hoje', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, AppRoutes.stockCount),
                child: const Text('Ver todos'),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 60, height: 60,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      CircularProgressIndicator(
                        value: inventory.progress,
                        backgroundColor: Colors.grey[200],
                        valueColor: AlwaysStoppedAnimation(AppTheme.primary),
                        strokeWidth: 6,
                      ),
                      Center(
                        child: Text(
                          '${(inventory.progress * 100).toInt()}%',
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primary),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${inventory.totalCounted} de ${inventory.totalExpected} itens', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                      const SizedBox(height: 4),
                      Text('${inventory.inventories.length} inventários ativos', style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertsSection(StockProvider stock) {
    final alerts = stock.lowStockAlerts;
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Alertas de Estoque Baixo', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, AppRoutes.movements),
                child: const Text('Ver mais'),
              ),
            ],
          ),
          alerts.isEmpty
              ? Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.check_circle, color: AppTheme.success, size: 20),
                      const SizedBox(width: 12),
                      Text('Nenhum alerta no momento', style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary)),
                    ],
                  ),
                )
              : Column(
                  children: alerts.take(3).map((alert) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.warning.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.warning_amber_rounded, color: AppTheme.warning, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(alert['product_name'] ?? 'Produto', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppTheme.textPrimary)),
                              Text('Estoque: ${alert['quantity']} ${alert['unit'] ?? 'un'}', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  )).toList(),
                ),
        ],
      ),
    );
  }

  Widget _buildTransfersSection(TransferProvider transfer) {
    final pendings = transfer.transfers.where((t) => t['status'] == 'pending').toList();
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Transferências Pendentes', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, AppRoutes.transfers),
                child: const Text('Ver mais'),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Icon(Icons.swap_horiz, color: AppTheme.warning, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    '${pendings.length} transferências pendentes',
                    style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppTheme.textPrimary),
                  ),
                ),
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, AppRoutes.transfers),
                  child: const Text('Nova'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    return BottomNavigationBar(
      currentIndex: 0,
      onTap: (index) {
        switch (index) {
          case 1: Navigator.pushNamed(context, AppRoutes.movements);
          case 2: Navigator.pushNamed(context, AppRoutes.lotes);
          case 3: Navigator.pushNamed(context, AppRoutes.settings);
        }
      },
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Início'),
        BottomNavigationBarItem(icon: Icon(Icons.move_up_outlined), activeIcon: Icon(Icons.move_up), label: 'Mov.'),
        BottomNavigationBarItem(icon: Icon(Icons.inventory_2_outlined), activeIcon: Icon(Icons.inventory_2), label: 'Lotes'),
        BottomNavigationBarItem(icon: Icon(Icons.settings_outlined), activeIcon: Icon(Icons.settings), label: 'Config'),
      ],
    );
  }
}
