import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../providers/ponto_provider.dart';

class PontoHistoryScreen extends StatefulWidget {
  const PontoHistoryScreen({super.key});

  @override
  State<PontoHistoryScreen> createState() => _PontoHistoryScreenState();
}

class _PontoHistoryScreenState extends State<PontoHistoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PontoProvider>().loadHistory();
      context.read<PontoProvider>().loadSummary();
    });
  }

  @override
  Widget build(BuildContext context) {
    final ponto = context.watch<PontoProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Histórico de Ponto')),
      body: Column(
        children: [
          if (ponto.summary != null) _buildSummaryCard(ponto),
          Expanded(child: _buildHistoryList(ponto)),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(PontoProvider ponto) {
    final s = ponto.summary!;
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildSummaryItem(Icons.access_time, 'Total', s.totalHoursFormatted, AppTheme.primaryGreen),
          _buildSummaryItem(Icons.timer_outlined, 'Extras', s.overtimeFormatted, AppTheme.overtime),
          _buildSummaryItem(Icons.today, 'Dias', '${s.totalDays}', AppTheme.accent),
          _buildSummaryItem(Icons.warning_amber_outlined, 'Atrasos', '${s.lateMinutes.toStringAsFixed(0)}min', AppTheme.warning),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(IconData icon, String label, String value, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(value, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
        Text(label, style: GoogleFonts.inter(fontSize: 10, color: AppTheme.textSecondary)),
      ],
    );
  }

  Widget _buildHistoryList(PontoProvider ponto) {
    if (ponto.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (ponto.history.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.access_time, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text('Nenhum registro encontrado',
                style: GoogleFonts.inter(fontSize: 16, color: AppTheme.textSecondary)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      itemCount: ponto.history.length,
      itemBuilder: (context, index) {
        final record = ponto.history[index];
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 4),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: _getStatusColor(record.status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(_getStatusIcon(record.status),
                      color: _getStatusColor(record.status)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(record.dateFormatted,
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.login, size: 14, color: Colors.grey[400]),
                          const SizedBox(width: 4),
                          Text(record.clockInFormatted,
                              style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary)),
                          const SizedBox(width: 16),
                          Icon(Icons.logout, size: 14, color: Colors.grey[400]),
                          const SizedBox(width: 4),
                          Text(record.clockOutFormatted,
                              style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary)),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(record.totalHours,
                        style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                    Container(
                      margin: const EdgeInsets.only(top: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: _getStatusColor(record.status).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(record.statusLabel,
                          style: GoogleFonts.inter(fontSize: 10, color: _getStatusColor(record.status))),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'approved': return AppTheme.success;
      case 'pending': return AppTheme.warning;
      case 'rejected': return AppTheme.error;
      default: return AppTheme.textSecondary;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'approved': return Icons.check_circle_outline;
      case 'pending': return Icons.schedule;
      case 'rejected': return Icons.cancel_outlined;
      default: return Icons.access_time;
    }
  }
}
