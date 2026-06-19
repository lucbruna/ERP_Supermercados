import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../providers/payroll_provider.dart';
import '../../widgets/paystub_card.dart';

class PayrollScreen extends StatefulWidget {
  const PayrollScreen({super.key});

  @override
  State<PayrollScreen> createState() => _PayrollScreenState();
}

class _PayrollScreenState extends State<PayrollScreen> {
  int _selectedYear = DateTime.now().year;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PayrollProvider>().loadPayrolls(year: _selectedYear);
    });
  }

  void _changeYear(int delta) {
    setState(() => _selectedYear += delta);
    context.read<PayrollProvider>().loadPayrolls(year: _selectedYear);
  }

  @override
  Widget build(BuildContext context) {
    final payroll = context.watch<PayrollProvider>();
    final latest = payroll.latestPayroll;

    return Scaffold(
      appBar: AppBar(title: const Text('Holerites')),
      body: Column(
        children: [
          if (latest != null) _buildLatestPaystub(latest),
          _buildYearSelector(),
          Expanded(child: _buildPayrollList(payroll)),
        ],
      ),
    );
  }

  Widget _buildLatestPaystub(paystub) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.primaryGreen, AppTheme.primaryDark],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryGreen.withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.receipt_long, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(paystub.reference,
                    style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                const SizedBox(height: 4),
                Text('Líquido: ${paystub.formattedNet}',
                    style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                const SizedBox(height: 2),
                Text('Bruto: ${paystub.formattedGross}',
                    style: GoogleFonts.inter(fontSize: 13, color: Colors.white70)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(paystub.statusLabel,
                style: GoogleFonts.inter(fontSize: 11, color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildYearSelector() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: () => _changeYear(-1),
          ),
          Text('$_selectedYear',
              style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: () => _changeYear(1),
          ),
        ],
      ),
    );
  }

  Widget _buildPayrollList(PayrollProvider payroll) {
    if (payroll.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (payroll.payrolls.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.receipt_long_outlined, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text('Nenhum holerite encontrado',
                style: GoogleFonts.inter(fontSize: 16, color: AppTheme.textSecondary)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      itemCount: payroll.payrolls.length,
      itemBuilder: (context, index) {
        final p = payroll.payrolls[index];
        return PaystubCard(
          reference: p.reference,
          grossSalary: p.formattedGross,
          netSalary: p.formattedNet,
          deductions: p.formattedDeductions,
          status: p.statusLabel,
          isPaid: p.status == 'paid',
          onTap: () => _showPaystubDetail(p),
        );
      },
    );
  }

  void _showPaystubDetail(paystub) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        expand: false,
        builder: (_, scrollController) {
          return SingleChildScrollView(
            controller: scrollController,
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40, height: 4,
                    decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
                  ),
                ),
                const SizedBox(height: 20),
                Text(paystub.reference,
                    style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                const SizedBox(height: 24),
                _buildDetailRow('Salário Bruto', paystub.formattedGross),
                _buildDetailRow('INSS', paystub.inss != null ? '-R\$ ${paystub.inss!.toStringAsFixed(2)}' : '---'),
                _buildDetailRow('IRRF', paystub.irrf != null ? '-R\$ ${paystub.irrf!.toStringAsFixed(2)}' : '---'),
                _buildDetailRow('FGTS', paystub.fgts != null ? 'R\$ ${paystub.fgts!.toStringAsFixed(2)}' : '---'),
                if (paystub.overtimeValue != null)
                  _buildDetailRow('Horas Extras', '+R\$ ${paystub.overtimeValue!.toStringAsFixed(2)}'),
                if (paystub.bonus != null)
                  _buildDetailRow('Bônus', '+R\$ ${paystub.bonus!.toStringAsFixed(2)}'),
                if (paystub.benefits != null)
                  _buildDetailRow('Benefícios', 'R\$ ${paystub.benefits!.toStringAsFixed(2)}'),
                const Divider(height: 32),
                _buildDetailRow('Total Descontos', paystub.formattedDeductions,
                    color: AppTheme.error),
                const SizedBox(height: 8),
                _buildDetailRow('Salário Líquido', paystub.formattedNet,
                    color: AppTheme.primaryGreen, bold: true, fontSize: 20),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.download),
                    label: const Text('Baixar Holerite'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {Color? color, bool bold = false, double fontSize = 15}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary)),
          Text(value,
              style: GoogleFonts.inter(
                fontSize: fontSize,
                fontWeight: bold ? FontWeight.bold : FontWeight.w600,
                color: color ?? AppTheme.textPrimary,
              )),
        ],
      ),
    );
  }
}
