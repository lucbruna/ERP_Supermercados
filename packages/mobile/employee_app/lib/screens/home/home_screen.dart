import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:offline/offline.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/auth_provider.dart';
import '../../providers/ponto_provider.dart';
import '../../widgets/ponto_button.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final SyncService _syncService = SyncService();
  StreamSubscription<SyncStatus>? _syncSub;
  int _selectedIndex = 0;
  bool _isOffline = false;
  int _pendingCount = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PontoProvider>().loadCurrentStatus();
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
    final ponto = context.watch<PontoProvider>();
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            if (_isOffline && !_syncService.isSyncing)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                color: _isOffline ? Colors.red[800] : Colors.blue[700],
                child: Row(
                  children: [
                    Icon(_isOffline ? Icons.wifi_off : Icons.sync, color: Colors.white, size: 16),
                    const SizedBox(width: 8),
                    Text(
                      _isOffline
                          ? 'Modo Offline - $_pendingCount pendentes'
                          : 'Sincronizando...',
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 12),
                    ),
                    const Spacer(),
                    if (_pendingCount > 0)
                      GestureDetector(
                        onTap: () => _syncService.syncAll(),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text('Sincronizar',
                              style: GoogleFonts.inter(color: Colors.white, fontSize: 11)),
                        ),
                      ),
                  ],
                ),
              ),
            Expanded(
              child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(auth, size),
              _buildPontoSection(ponto, size),
              _buildQuickActions(context),
              _buildSchedulePreview(context),
              const SizedBox(height: 80),
            ],
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
        color: AppTheme.primaryGreen,
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
                child: Text(auth.user?.initials ?? '?',
                    style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Olá, ${auth.user?.name?.split(' ').first ?? 'Colaborador'}!',
                        style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
                    Text(auth.user?.position ?? '',
                        style: GoogleFonts.inter(fontSize: 13, color: Colors.white70)),
                  ],
                ),
              ),
              SyncStatusIndicator(),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                onPressed: () {},
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPontoSection(PontoProvider ponto, Size size) {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 16, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Ponto Eletrônico',
                      style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                  Text(
                    ponto.isClockedIn
                        ? 'Expediente em andamento'
                        : ponto.isOnBreak
                            ? 'Em intervalo'
                            : ponto.status == PontoStatus.clockedOut
                                ? 'Expediente encerrado'
                                : 'Aguardando registro',
                    style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary),
                  ),
                ],
              ),
              if (ponto.currentRecord != null && ponto.isClockedIn)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('Entrada',
                        style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                    Text(ponto.currentRecord!.clockInFormatted,
                        style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 20),
          PontoButton(
            status: ponto.status,
            isLoading: ponto.isLoading,
            onPressed: () => Navigator.pushNamed(context, AppRoutes.ponto),
          ),
          const SizedBox(height: 16),
          if (ponto.summary != null)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem('Horas', ponto.summary!.totalHoursFormatted, AppTheme.primaryGreen),
                _buildStatItem('Extras', ponto.summary!.overtimeFormatted, AppTheme.overtime),
                _buildStatItem('Dias', '${ponto.summary!.totalDays}', AppTheme.accent),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(value,
            style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        Text(label,
            style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Ações Rápidas',
              style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildActionCard(context, Icons.calendar_month_outlined, 'Escala', AppTheme.primaryGreen, AppRoutes.schedule),
              const SizedBox(width: 12),
              _buildActionCard(context, Icons.receipt_long_outlined, 'Holerites', AppTheme.accent, AppRoutes.payroll),
              const SizedBox(width: 12),
              _buildActionCard(context, Icons.description_outlined, 'Solicitações', AppTheme.warning, AppRoutes.requests),
              const SizedBox(width: 12),
              _buildActionCard(context, Icons.person_outline, 'Perfil', AppTheme.textSecondary, AppRoutes.profile),
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
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
            ],
          ),
          child: Column(
            children: [
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(height: 8),
              Text(label,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSchedulePreview(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Escala da Semana',
                  style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, AppRoutes.schedule),
                child: const Text('Ver todas'),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(7, (index) {
                final days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                final now = DateTime.now();
                final date = now.subtract(Duration(days: now.weekday - 1)).add(Duration(days: index));
                final isToday = index == now.weekday - 1;
                return Column(
                  children: [
                    Text(days[index],
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: isToday ? AppTheme.primaryGreen : AppTheme.textSecondary,
                          fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
                        )),
                    const SizedBox(height: 4),
                    Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(
                        color: isToday ? AppTheme.primaryGreen : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(
                        child: Text('${date.day}',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: isToday ? Colors.white : AppTheme.textPrimary,
                              fontWeight: FontWeight.w600,
                            )),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text('08-18h',
                        style: GoogleFonts.inter(fontSize: 9, color: AppTheme.textSecondary)),
                  ],
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    return BottomNavigationBar(
      currentIndex: _selectedIndex,
      onTap: (index) {
        setState(() => _selectedIndex = index);
        switch (index) {
          case 1: Navigator.pushNamed(context, AppRoutes.pontoHistory); break;
          case 2: Navigator.pushNamed(context, AppRoutes.schedule); break;
          case 3: Navigator.pushNamed(context, AppRoutes.profile); break;
        }
      },
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Início'),
        BottomNavigationBarItem(icon: Icon(Icons.access_time_outlined), activeIcon: Icon(Icons.access_time), label: 'Histórico'),
        BottomNavigationBarItem(icon: Icon(Icons.calendar_month_outlined), activeIcon: Icon(Icons.calendar_month), label: 'Escala'),
        BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Perfil'),
      ],
    );
  }
}
