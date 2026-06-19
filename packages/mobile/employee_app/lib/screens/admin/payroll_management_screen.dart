import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';

class PayrollManagementScreen extends StatefulWidget {
  const PayrollManagementScreen({super.key});

  @override
  State<PayrollManagementScreen> createState() => _PayrollManagementScreenState();
}

class _PayrollManagementScreenState extends State<PayrollManagementScreen> {
  final List<Map<String, dynamic>> _payrolls = List.generate(
    10,
    (i) => {
      'id': i + 1,
      'employee': 'Funcionário ${i + 1}',
      'reference': 'Junho/2024',
      'gross': 2500.0 + (i * 150),
      'net': 2100.0 + (i * 120),
      'status': i % 3 == 0 ? 'pending' : 'paid',
    },
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Folha de Pagamento'),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: () => _showProcessPayrollDialog()),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: AppTheme.primaryGreen.withOpacity(0.05),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildSummaryItem('Total Folha', 'R\$ 65.430,00'),
                _buildSummaryItem('Funcionários', '20'),
                _buildSummaryItem('Pendentes', '5'),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: _payrolls.length,
              itemBuilder: (context, index) {
                final p = _payrolls[index];
                final isPaid = p['status'] == 'paid';
                return Card(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isPaid ? AppTheme.success.withOpacity(0.1) : AppTheme.warning.withOpacity(0.1),
                      child: Icon(
                        isPaid ? Icons.check_circle_outline : Icons.schedule,
                        color: isPaid ? AppTheme.success : AppTheme.warning,
                      ),
                    ),
                    title: Text(p['employee'],
                        style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 15)),
                    subtitle: Text(p['reference'],
                        style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('R\$ ${(p['net'] as double).toStringAsFixed(2)}',
                            style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                        Container(
                          margin: const EdgeInsets.only(top: 2),
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isPaid ? AppTheme.success.withOpacity(0.1) : AppTheme.warning.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(isPaid ? 'Pago' : 'Pendente',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                color: isPaid ? AppTheme.success : AppTheme.warning,
                              )),
                        ),
                      ],
                    ),
                    onTap: () => _showPayrollDetail(p),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value) {
    return Column(
      children: [
        Text(value,
            style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
        Text(label, style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
      ],
    );
  }

  void _showProcessPayrollDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Processar Folha'),
        content: const Text('Deseja processar a folha de pagamento do mês atual?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Folha processada com sucesso!'), backgroundColor: AppTheme.success),
              );
            },
            child: const Text('Processar'),
          ),
        ],
      ),
    );
  }

  void _showPayrollDetail(Map<String, dynamic> payroll) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4,
                decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            Text(payroll['employee'],
                style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(payroll['reference'],
                style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary)),
            const SizedBox(height: 24),
            _buildRow('Salário Bruto', 'R\$ ${(payroll['gross'] as double).toStringAsFixed(2)}'),
            _buildRow('Descontos', '-R\$ ${((payroll['gross'] as double) - (payroll['net'] as double)).toStringAsFixed(2)}'),
            const Divider(),
            _buildRow('Salário Líquido', 'R\$ ${(payroll['net'] as double).toStringAsFixed(2)}',
                bold: true, color: AppTheme.primaryGreen),
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
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool bold = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary)),
          Text(value,
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: bold ? FontWeight.bold : FontWeight.w600,
                color: color ?? AppTheme.textPrimary,
              )),
        ],
      ),
    );
  }
}
