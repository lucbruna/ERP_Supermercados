import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';

class EmployeeDetailScreen extends StatelessWidget {
  const EmployeeDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final employee = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;

    if (employee == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Detalhes')),
        body: const Center(child: Text('Funcionário não encontrado')),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(employee['name'] ?? 'Detalhes')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 48,
                    backgroundColor: AppTheme.primaryGreen.withOpacity(0.1),
                    child: Text(
                      (employee['name'] as String).split(' ').map((s) => s[0]).take(2).join(),
                      style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(employee['name'],
                      style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                  Text(employee['position'],
                      style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary)),
                ],
              ),
            ),
            const SizedBox(height: 32),
            Text('Informações',
                style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
            const SizedBox(height: 12),
            _buildInfoCard([
              _buildInfoRow('Departamento', employee['department']),
              _buildInfoRow('Cargo', employee['position']),
              _buildInfoRow('Status', employee['status'] == 'active' ? 'Ativo' : 'Inativo'),
              _buildInfoRow('Data de Admissão', '01/01/2024'),
              _buildInfoRow('Salário', 'R\$ 2.500,00'),
              _buildInfoRow('Turno', 'Comercial'),
            ]),
            const SizedBox(height: 24),
            Text('Ações',
                style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pushNamed(context, AppRoutes.adminSchedule),
                    icon: const Icon(Icons.calendar_month_outlined),
                    label: const Text('Escala'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pushNamed(context, AppRoutes.adminPayroll),
                    icon: const Icon(Icons.receipt_long_outlined),
                    label: const Text('Holerites'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.edit_outlined),
                label: const Text('Editar Funcionário'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(List<Widget> rows) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: rows),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary)),
          Text(value, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
        ],
      ),
    );
  }
}
