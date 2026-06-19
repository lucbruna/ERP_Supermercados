import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/kpi_card.dart';
import '../../widgets/chart_widget.dart';
import '../../widgets/offline_banner.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().refresh();
    });
  }

  Future<void> _onRefresh() async {
    await context.read<DashboardProvider>().refresh();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');
    final percentFormat = NumberFormat.percentPattern('pt_BR');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Executivo'),
        actions: [
          IconButton(
            icon: const Icon(Icons.store),
            onPressed: () => Navigator.pushNamed(context, AppRoutes.stores),
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => Navigator.pushNamed(context, AppRoutes.settings),
          ),
        ],
      ),
      drawer: _buildDrawer(context),
      body: Column(
        children: [
          const OwnerOfflineBanner(),
          Expanded(
            child: Consumer<DashboardProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading && provider.dashboardData == null) {
                  return _buildShimmerLoading();
                }
                if (provider.error != null && provider.dashboardData == null) {
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
                        _buildGaugesRow(size, provider, currencyFormat),
                        const SizedBox(height: 20),
                        _buildSectionTitle('Vendas Últimos 12 Meses'),
                        const SizedBox(height: 8),
                        _buildSalesChart(provider, currencyFormat),
                        const SizedBox(height: 20),
                        _buildSectionTitle('Vendas por Loja'),
                        const SizedBox(height: 8),
                        _buildStoresBarChart(provider, currencyFormat),
                        const SizedBox(height: 20),
                        _buildSectionTitle('Formas de Pagamento'),
                        const SizedBox(height: 8),
                        _buildPaymentPieChart(provider),
                        const SizedBox(height: 20),
                        _buildSectionTitle('Indicadores de Performance'),
                        const SizedBox(height: 8),
                        _buildKpiGrid(provider, currencyFormat, percentFormat),
                        const SizedBox(height: 20),
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
    final userName = auth.user?['name'] ?? 'Sócio';
    final userEmail = auth.user?['email'] ?? '';

    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(color: AppTheme.primaryColor),
            accountName: Text(userName, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600)),
            accountEmail: Text(userEmail, style: GoogleFonts.inter(fontSize: 14)),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                userName.isNotEmpty ? userName[0].toUpperCase() : 'S',
                style: GoogleFonts.inter(fontSize: 28, color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.dashboard),
            title: const Text('Dashboard'),
            selected: true,
            onTap: () => Navigator.pop(context),
          ),
          ListTile(
            leading: const Icon(Icons.store),
            title: const Text('Lojas'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, AppRoutes.stores);
            },
          ),
          ListTile(
            leading: const Icon(Icons.assessment),
            title: const Text('Relatórios'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, AppRoutes.reports);
            },
          ),
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('Configurações'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, AppRoutes.settings);
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout),
            title: const Text('Sair'),
            onTap: () async {
              Navigator.pop(context);
              await auth.logout();
              if (context.mounted) {
                Navigator.pushReplacementNamed(context, AppRoutes.login);
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerLoading() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(height: 120, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
          const SizedBox(height: 16),
          Container(height: 200, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
          const SizedBox(height: 16),
          Container(height: 200, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
          const SizedBox(height: 16),
          Container(height: 300, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
        ],
      ),
    );
  }

  Widget _buildError(DashboardProvider provider) {
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

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(title, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
    );
  }

  Widget _buildGaugesRow(Size size, DashboardProvider provider, NumberFormat format) {
    final kpis = provider.kpis ?? {};
    return SizedBox(
      height: 140,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _buildGaugeCard('Faturamento Hoje', kpis['revenue_today'], format, Icons.today, Colors.green),
          _buildGaugeCard('Faturamento Mês', kpis['revenue_month'], format, Icons.date_range, AppTheme.primaryColor),
          _buildGaugeCard('Lucro', kpis['profit'], format, Icons.trending_up, Colors.orange),
          _buildGaugeCard('Ticket Médio', kpis['average_ticket'], format, Icons.receipt, Colors.purple),
        ],
      ),
    );
  }

  Widget _buildGaugeCard(String label, dynamic value, NumberFormat format, IconData icon, Color color) {
    final displayValue = value != null ? format.format(value) : 'R\$ 0,00';
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 8),
          Text(displayValue, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
          const SizedBox(height: 2),
          Text(label, style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary)),
        ],
      ),
    );
  }

  Widget _buildSalesChart(DashboardProvider provider, NumberFormat format) {
    final salesData = (provider.dashboardData?['sales_last_12_months'] ?? []) as List;
    return ChartWidget(
      title: 'Evolução de Vendas',
      type: ChartType.line,
      data: salesData.map((e) => ChartData(
        label: e['month'] ?? '',
        value: (e['value'] ?? 0).toDouble(),
      )).toList(),
      format: format,
    );
  }

  Widget _buildStoresBarChart(DashboardProvider provider, NumberFormat format) {
    final storesData = provider.storeComparison.isNotEmpty
        ? provider.storeComparison
        : (provider.dashboardData?['sales_by_store'] ?? []) as List;
    return ChartWidget(
      title: 'Comparativo de Lojas',
      type: ChartType.bar,
      data: storesData.map((e) => ChartData(
        label: e['name'] ?? e['store_name'] ?? '',
        value: (e['revenue'] ?? e['value'] ?? 0).toDouble(),
      )).toList(),
      format: format,
    );
  }

  Widget _buildPaymentPieChart(DashboardProvider provider) {
    final paymentData = (provider.dashboardData?['payment_methods'] ?? []) as List;
    return ChartWidget(
      title: 'Formas de Pagamento',
      type: ChartType.pie,
      data: paymentData.map((e) => ChartData(
        label: e['method'] ?? e['name'] ?? '',
        value: (e['amount'] ?? e['percentage'] ?? 0).toDouble(),
      )).toList(),
    );
  }

  Widget _buildKpiGrid(DashboardProvider provider, NumberFormat currencyFormat, NumberFormat percentFormat) {
    final kpis = provider.kpis ?? {};
    final indicators = [
      KpiData(Icons.shopping_cart, 'Vendas Hoje', '${kpis['sales_today'] ?? 0}', AppTheme.primaryColor),
      KpiData(Icons.shopping_bag, 'Vendas Mês', '${kpis['sales_month'] ?? 0}', Colors.blue),
      KpiData(Icons.people, 'Clientes Ativos', '${kpis['active_clients'] ?? 0}', Colors.teal),
      KpiData(Icons.trending_up, 'Ticket Médio', kpis['average_ticket'] != null ? currencyFormat.format(kpis['average_ticket']) : 'R\$ 0,00', Colors.purple),
      KpiData(Icons.inventory, 'Produtos', '${kpis['total_products'] ?? 0}', Colors.indigo),
      KpiData(Icons.receipt, 'Notas Emitidas', '${kpis['invoices'] ?? 0}', Colors.deepOrange),
      KpiData(Icons.arrow_upward, 'Margem Média', kpis['average_margin'] != null ? '${kpis['average_margin']}%' : '0%', Colors.green),
      KpiData(Icons.star, 'Satisfação', kpis['satisfaction'] != null ? '${kpis['satisfaction']}/5' : '0/5', Colors.amber),
      KpiData(Icons.people_outline, 'Funcionários', '${kpis['total_employees'] ?? 0}', Colors.cyan),
      KpiData(Icons.store, 'Lojas Ativas', '${kpis['active_stores'] ?? (provider.stores.length)}', AppTheme.primaryColor),
      KpiData(Icons.local_shipping, 'Entregas Hoje', '${kpis['deliveries_today'] ?? 0}', Colors.brown),
      KpiData(Icons.inventory_2, 'Estoque Baixo', '${kpis['low_stock_items'] ?? 0}', AppTheme.negative),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 0.9,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: indicators.length,
      itemBuilder: (context, index) => KpiCard(
        icon: indicators[index].icon,
        label: indicators[index].label,
        value: indicators[index].value,
        color: indicators[index].color,
      ),
    );
  }
}

class KpiData {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  KpiData(this.icon, this.label, this.value, this.color);
}
