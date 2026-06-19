import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/store_provider.dart';
import '../../widgets/employee_card.dart';
import '../../widgets/offline_banner.dart';

class EmployeeScreen extends StatefulWidget {
  const EmployeeScreen({super.key});

  @override
  State<EmployeeScreen> createState() => _EmployeeScreenState();
}

class _EmployeeScreenState extends State<EmployeeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<StoreProvider>();
      provider.loadEmployees();
      provider.loadPontoStatus();
    });
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd/MM/yyyy');
    return Scaffold(
      appBar: AppBar(
        title: const Text('Funcionários'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              final provider = context.read<StoreProvider>();
              provider.loadEmployees();
              provider.loadPontoStatus();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          const ManagerOfflineBanner(),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: AppTheme.success.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle, size: 14, color: AppTheme.success),
                      const SizedBox(width: 4),
                      Text(DateFormat('EEEE', 'pt_BR').format(DateTime.now()).replaceFirst(DateFormat('EEEE', 'pt_BR').format(DateTime.now())[0], DateFormat('EEEE', 'pt_BR').format(DateTime.now())[0].toUpperCase()), style: GoogleFonts.inter(fontSize: 12, color: AppTheme.success)),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Text(dateFormat.format(DateTime.now()), style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 13)),
              ],
            ),
          ),
          Expanded(
            child: Consumer<StoreProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading && provider.employees.isEmpty && provider.pontoStatus.isEmpty) {
                  return _buildShimmer();
                }
                if (provider.error != null && provider.employees.isEmpty) {
                  return _buildError(provider);
                }

                final pontoStatus = provider.pontoStatus;

                if (pontoStatus.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.people_outline, size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 16),
                        Text('Nenhum funcionário registrado hoje', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    await provider.loadPontoStatus();
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: pontoStatus.length,
                    itemBuilder: (context, index) {
                      final record = pontoStatus[index] as Map<String, dynamic>;
                      final name = record['name'] ?? record['nome'] ?? 'Funcionário';
                      final role = record['role'] ?? record['cargo'] ?? '';
                      final status = record['status'] ?? 'present';
                      final entryTime = record['entry_time'] ?? record['entrada'] ?? '';
                      final exitTime = record['exit_time'] ?? record['saida'] ?? '';
                      return EmployeeCard(
                        name: name,
                        role: role,
                        status: status.toString(),
                        entryTime: entryTime.toString(),
                        exitTime: exitTime.toString(),
                        onTap: () {},
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
        children: List.generate(6, (_) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          height: 80,
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
        )),
      ),
    );
  }

  Widget _buildError(StoreProvider provider) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.cloud_off, size: 64, color: AppTheme.textSecondary),
          const SizedBox(height: 16),
          Text(provider.error!, style: GoogleFonts.inter(color: AppTheme.textSecondary)),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => provider.loadEmployees(),
            icon: const Icon(Icons.refresh),
            label: const Text('Tentar Novamente'),
          ),
        ],
      ),
    );
  }
}
