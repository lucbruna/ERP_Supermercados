import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/delivery_provider.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  DateTimeRange? _selectedRange;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DeliveryProvider>().loadHistory();
    });
  }

  Future<void> _selectDateRange() async {
    final range = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2024),
      lastDate: DateTime.now(),
      initialDateRange: _selectedRange ?? DateTimeRange(
        start: DateTime.now().subtract(const Duration(days: 30)),
        end: DateTime.now(),
      ),
    );
    if (range != null) {
      setState(() => _selectedRange = range);
      context.read<DeliveryProvider>().loadHistory(
        startDate: DateFormat('yyyy-MM-dd').format(range.start),
        endDate: DateFormat('yyyy-MM-dd').format(range.end),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DeliveryProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Histórico'),
        actions: [
          IconButton(
            icon: const Icon(Icons.date_range),
            onPressed: _selectDateRange,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => provider.loadHistory(),
        child: provider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : provider.history.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.history, size: 48, color: AppTheme.textSecondary),
                        const SizedBox(height: 16),
                        Text('Nenhuma entrega encontrada', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: provider.history.length,
                    itemBuilder: (_, i) {
                      final d = provider.history[i];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: Container(
                            width: 40, height: 40,
                            decoration: BoxDecoration(
                              color: AppTheme.success.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.check_circle, color: AppTheme.success, size: 20),
                          ),
                          title: Text('Pedido #${d['order_number'] ?? d['id']}', style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
                          subtitle: Text(
                            '${d['customer_name'] ?? d['cliente'] ?? ''} - ${d['data'] ?? d['date'] ?? ''}',
                            style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
                          ),
                          trailing: Text('R\$ ${(d['value'] ?? d['valor'] ?? 0).toStringAsFixed(2)}', style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: AppTheme.primary)),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
