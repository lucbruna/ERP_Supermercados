import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/delivery_provider.dart';
import '../../widgets/delivery_card.dart';

class DeliveryListScreen extends StatefulWidget {
  const DeliveryListScreen({super.key});

  @override
  State<DeliveryListScreen> createState() => _DeliveryListScreenState();
}

class _DeliveryListScreenState extends State<DeliveryListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DeliveryProvider>().loadTodayDeliveries();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DeliveryProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Entregas de Hoje')),
      body: RefreshIndicator(
        onRefresh: () => provider.loadTodayDeliveries(),
        child: provider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : provider.todayDeliveries.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.check_circle_outline, size: 48, color: AppTheme.success),
                        const SizedBox(height: 16),
                        Text('Nenhuma entrega pendente', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: provider.todayDeliveries.length,
                    itemBuilder: (_, i) => DeliveryCard(
                      delivery: provider.todayDeliveries[i],
                      onTap: () => Navigator.pushNamed(
                        context, AppRoutes.deliveryDetail,
                        arguments: provider.todayDeliveries[i]['id'],
                      ),
                    ),
                  ),
      ),
    );
  }
}
