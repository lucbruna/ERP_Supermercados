import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/store_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/quick_action_card.dart';
import '../../widgets/offline_banner.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<StoreProvider>().loadTodayDashboard();
    });
  }

  Future<void> _onRefresh() async {
    await context.read<StoreProvider>().refresh();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Minha Loja'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => Navigator.pushNamed(context, AppRoutes.settings),
          ),
        ],
      ),
      drawer: _buildDrawer(context),
      body: Column(
        children: [
          const ManagerOfflineBanner(),
          Expanded(
            child: Consumer<StoreProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading && provider.todaySales == null) {
                  return _buildShimmer();
                }
                if (provider.error != null && provider.todaySales == null) {
                  return _buildError(provider);
                }
                return RefreshIndicator(
                  onRefresh: _onRefresh,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSalesTodayCard(provider, currencyFormat),
                        const SizedBox(height: 16),
                        _buildQuickActions(context, size),
                        const SizedBox(height: 16),
                        _buildSectionTitle('Resumo do Dia'),
                        const SizedBox(height: 8),
                        _buildDaySummary(provider, currencyFormat),
                        const SizedBox(height: 16),
                        _buildSectionTitle('Alertas'),
                        const SizedBox(height: 8),
                        _buildAlerts(provider, currencyFormat),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final userName = auth.user?['name'] ?? 'Gerente';

    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(color: AppTheme.primaryColor),
            accountName: Text(userName, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600)),
            accountEmail: Text(auth.user?['email'] ?? '', style: GoogleFonts.inter(fontSize: 14)),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                userName.isNotEmpty ? userName[0].toUpperCase() : 'G',
                style: GoogleFonts.inter(fontSize: 28, color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          ListTile(leading: const Icon(Icons.home), title: const Text('Início'), selected: true, onTap: () => Navigator.pop(context)),
          ListTile(leading: const Icon(Icons.inventory), title: const Text('Estoque'), onTap: () { Navigator.pop(context); Navigator.pushNamed(context, AppRoutes.inventory); }),
          ListTile(leading: const Icon(Icons.receipt), title: const Text('Vendas'), onTap: () { Navigator.pop(context); Navigator.pushNamed(context, AppRoutes.sales); }),
          ListTile(leading: const Icon(Icons.people), title: const Text('Funcionários'), onTap: () { Navigator.pop(context); Navigator.pushNamed(context, AppRoutes.employees); }),
          ListTile(leading: const Icon(Icons.attach_money), title: const Text('Financeiro'), onTap: () { Navigator.pop(context); Navigator.pushNamed(context, AppRoutes.financial); }),
          ListTile(leading: const Icon(Icons.checklist), title: const Text('Tarefas'), onTap: () { Navigator.pop(context); Navigator.pushNamed(context, AppRoutes.tasks); }),
          const Divider(),
          ListTile(leading: const Icon(Icons.settings), title: const Text('Configurações'), onTap: () { Navigator.pop(context); Navigator.pushNamed(context, AppRoutes.settings); }),
          ListTile(leading: const Icon(Icons.logout), title: const Text('Sair'), onTap: () async {
            Navigator.pop(context);
            await auth.logout();
            if (context.mounted) Navigator.pushReplacementNamed(context, AppRoutes.login);
          }),
        ],
      ),
    );
  }

  Widget _buildSalesTodayCard(StoreProvider provider, NumberFormat format) {
    final data = provider.todaySales ?? {};
    final revenue = (data['revenue'] ?? data['faturamento'] ?? 0).toDouble();
    final goal = (data['goal'] ?? data['meta'] ?? 0).toDouble();
    final goalProgress = goal > 0 ? (revenue / goal * 100).clamp(0, 100) : 0.0;
    final salesCount = data['sales_count'] ?? data['total_vendas'] ?? 0;
    final avgTicket = (data['average_ticket'] ?? data['ticket_medio'] ?? 0).toDouble();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Vendas Hoje', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.success.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text('${salesCount} vendas', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.success)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(format.format(revenue), style: GoogleFonts.inter(fontSize: 36, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: goalProgress / 100,
                minHeight: 10,
                backgroundColor: Colors.grey[200],
                valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.success),
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Meta: ${format.format(goal)}', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                Text('${goalProgress.toStringAsFixed(0)}%', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.success)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildMiniStat('Ticket Médio', format.format(avgTicket))),
                const SizedBox(width: 8),
                Expanded(child: _buildMiniStat('% Meta', '${goalProgress.toStringAsFixed(0)}%')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniStat(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(value, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
          Text(label, style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary)),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context, Size size) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Ações Rápidas'),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: QuickActionCard(
                icon: Icons.point_of_sale,
                label: 'Abrir PDV',
                color: Colors.green,
                onTap: () {},
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: QuickActionCard(
                icon: Icons.inventory,
                label: 'Ver Estoque',
                color: AppTheme.primaryColor,
                onTap: () => Navigator.pushNamed(context, AppRoutes.inventory),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: QuickActionCard(
                icon: Icons.access_time,
                label: 'Ponto',
                color: Colors.orange,
                onTap: () => Navigator.pushNamed(context, AppRoutes.employees),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: QuickActionCard(
                icon: Icons.checklist,
                label: 'Tarefas',
                color: Colors.purple,
                onTap: () => Navigator.pushNamed(context, AppRoutes.tasks),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDaySummary(StoreProvider provider, NumberFormat format) {
    final financial = provider.financialOverview ?? {};
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(child: _buildSummaryItem(Icons.shopping_cart, 'Vendas', '${provider.todaySales?['sales_count'] ?? 0}', Colors.blue)),
                Expanded(child: _buildSummaryItem(Icons.people, 'Func. Hoje', '${provider.pontoStatus.length}', Colors.teal)),
                Expanded(child: _buildSummaryItem(Icons.inventory, 'Est. Baixo', '${provider.lowStockProducts.length}', AppTheme.warning)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildSummaryItem(Icons.receipt, 'Ticket Médio', format.format((provider.todaySales?['average_ticket'] ?? 0).toDouble()), Colors.purple)),
                Expanded(child: _buildSummaryItem(Icons.monetization_on, 'Despesas', format.format((financial['expenses'] ?? 0).toDouble()), AppTheme.negative)),
                Expanded(child: _buildSummaryItem(Icons.trending_up, 'Margem', '${(financial['margin'] ?? 0).toStringAsFixed(1)}%', Colors.green)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(IconData icon, String label, String value, Color color) {
    return Column(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(height: 4),
        Text(value, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold)),
        Text(label, style: GoogleFonts.inter(fontSize: 10, color: AppTheme.textSecondary)),
      ],
    );
  }

  Widget _buildAlerts(StoreProvider provider, NumberFormat format) {
    final lowStock = provider.lowStockProducts;
    final alerts = <Widget>[];

    if (provider.error != null) {
      alerts.add(Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: AppTheme.warning.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
        child: Row(
          children: [
            const Icon(Icons.warning, color: AppTheme.warning),
            const SizedBox(width: 8),
            Expanded(child: Text(provider.error!, style: GoogleFonts.inter(fontSize: 13))),
          ],
        ),
      ));
    }

    if (lowStock.isNotEmpty) {
      alerts.add(Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: AppTheme.negative.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
        child: Row(
          children: [
            const Icon(Icons.inventory_2, color: AppTheme.negative),
            const SizedBox(width: 8),
            Expanded(
              child: Text('${lowStock.length} produtos com estoque baixo', style: GoogleFonts.inter(fontSize: 13)),
            ),
            TextButton(
              onPressed: () => Navigator.pushNamed(context, AppRoutes.inventory),
              child: const Text('Ver'),
            ),
          ],
        ),
      ));
    }

    if (alerts.isEmpty) {
      alerts.add(Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: AppTheme.success.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
        child: Row(
          children: [
            const Icon(Icons.check_circle, color: AppTheme.success),
            const SizedBox(width: 8),
            Text('Tudo em ordem!', style: GoogleFonts.inter(fontSize: 13, color: AppTheme.success)),
          ],
        ),
      ));
    }

    return Column(children: alerts.map((a) => Padding(padding: const EdgeInsets.only(bottom: 8), child: a)).toList());
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(title, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(height: 200, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
          const SizedBox(height: 16),
          Container(height: 100, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
          const SizedBox(height: 16),
          Container(height: 120, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
        ],
      ),
    );
  }

  Widget _buildError(StoreProvider provider) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off, size: 64, color: AppTheme.textSecondary),
            const SizedBox(height: 16),
            Text('Erro ao carregar dados', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(provider.error!, textAlign: TextAlign.center, style: GoogleFonts.inter(color: AppTheme.textSecondary)),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => provider.refresh(),
              icon: const Icon(Icons.refresh),
              label: const Text('Tentar Novamente'),
            ),
          ],
        ),
      ),
    );
  }
}
