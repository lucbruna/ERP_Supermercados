import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/store_card.dart';
import '../../widgets/offline_banner.dart';

class StoreListScreen extends StatefulWidget {
  const StoreListScreen({super.key});

  @override
  State<StoreListScreen> createState() => _StoreListScreenState();
}

class _StoreListScreenState extends State<StoreListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().loadStores();
    });
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');
    return Scaffold(
      appBar: AppBar(title: const Text('Lojas')),
      body: Column(
        children: [
          const OwnerOfflineBanner(),
          Expanded(
            child: Consumer<DashboardProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading && provider.stores.isEmpty) {
                  return _buildShimmer();
                }
                if (provider.error != null && provider.stores.isEmpty) {
                  return _buildError(provider);
                }
                return RefreshIndicator(
                  onRefresh: () => provider.loadStores(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: provider.stores.length,
                    itemBuilder: (context, index) {
                      final store = provider.stores[index] as Map<String, dynamic>;
                      final revenue = (store['revenue'] ?? store['faturamento'] ?? 0).toDouble();
                      final performance = store['performance'] ?? 'stable';
                      return StoreCard(
                        name: store['name'] ?? store['nome'] ?? 'Loja ${index + 1}',
                        revenue: currencyFormat.format(revenue),
                        city: store['city'] ?? store['cidade'] ?? '',
                        performance: performance.toString(),
                        onTap: () => Navigator.pushNamed(
                          context,
                          AppRoutes.storeDetail,
                          arguments: store,
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: List.generate(5, (_) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          height: 120,
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
        )),
      ),
    );
  }

  Widget _buildError(DashboardProvider provider) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.cloud_off, size: 64, color: AppTheme.textSecondary),
          const SizedBox(height: 16),
          Text(provider.error!, style: GoogleFonts.inter(color: AppTheme.textSecondary)),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => provider.loadStores(),
            icon: const Icon(Icons.refresh),
            label: const Text('Tentar Novamente'),
          ),
        ],
      ),
    );
  }
}
