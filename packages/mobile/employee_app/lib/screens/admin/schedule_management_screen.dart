import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../widgets/schedule_card.dart';

class ScheduleManagementScreen extends StatefulWidget {
  const ScheduleManagementScreen({super.key});

  @override
  State<ScheduleManagementScreen> createState() => _ScheduleManagementScreenState();
}

class _ScheduleManagementScreenState extends State<ScheduleManagementScreen> {
  DateTime _currentWeekStart = DateTime.now().subtract(Duration(days: DateTime.now().weekday - 1));

  final List<Map<String, dynamic>> _employees = [
    {'name': 'Ana Silva', 'position': 'Operadora de Caixa', 'schedules': [
      {'day': 0, 'start': '08:00', 'end': '14:00'},
      {'day': 1, 'start': '08:00', 'end': '14:00'},
      {'day': 2, 'start': '14:00', 'end': '20:00'},
      {'day': 3, 'start': '14:00', 'end': '20:00'},
      {'day': 4, 'start': '08:00', 'end': '14:00'},
      {'day': 5, 'start': '08:00', 'end': '12:00'},
    ]},
    {'name': 'Carlos Oliveira', 'position': 'Repositor', 'schedules': [
      {'day': 0, 'start': '06:00', 'end': '14:00'},
      {'day': 1, 'start': '06:00', 'end': '14:00'},
      {'day': 2, 'start': '06:00', 'end': '14:00'},
      {'day': 3, 'start': '14:00', 'end': '22:00'},
      {'day': 4, 'start': '14:00', 'end': '22:00'},
    ]},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gerenciar Escalas'),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: () => _showAddScheduleDialog()),
        ],
      ),
      body: Column(
        children: [
          _buildWeekNavigator(),
          _buildDayHeaders(),
          Expanded(child: _buildEmployeeList()),
        ],
      ),
    );
  }

  Widget _buildWeekNavigator() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: () => setState(() => _currentWeekStart = _currentWeekStart.subtract(const Duration(days: 7))),
          ),
          Text(
            'Semana de ${_currentWeekStart.day}/${_currentWeekStart.month}',
            style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: () => setState(() => _currentWeekStart = _currentWeekStart.add(const Duration(days: 7))),
          ),
        ],
      ),
    );
  }

  Widget _buildDayHeaders() {
    final days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: days.map((d) => Expanded(
          child: Center(
            child: Text(d, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textSecondary)),
          ),
        )).toList(),
      ),
    );
  }

  Widget _buildEmployeeList() {
    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: _employees.length,
      itemBuilder: (context, index) {
        final emp = _employees[index];
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 4),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(emp['name'],
                    style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                Text(emp['position'],
                    style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                const SizedBox(height: 8),
                Row(
                  children: List.generate(7, (i) {
                    final daySchedules = (emp['schedules'] as List)
                        .where((s) => s['day'] == i)
                        .toList();
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => _showEditScheduleDialog(emp, i),
                        child: Container(
                          margin: const EdgeInsets.all(2),
                          height: 40,
                          decoration: BoxDecoration(
                            color: daySchedules.isNotEmpty
                                ? AppTheme.primaryGreen.withOpacity(0.15)
                                : Colors.grey[100],
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: daySchedules.isNotEmpty
                              ? Center(
                                  child: Text(
                                    '${daySchedules.first['start']}\n${daySchedules.first['end']}',
                                    textAlign: TextAlign.center,
                                    style: GoogleFonts.inter(fontSize: 8, fontWeight: FontWeight.w600, color: AppTheme.primaryGreen),
                                  ),
                                )
                              : null,
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showAddScheduleDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Nova Escala'),
        content: const Text('Funcionalidade de criação de escala'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Fechar')),
        ],
      ),
    );
  }

  void _showEditScheduleDialog(Map<String, dynamic> employee, int day) {
    final days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('${employee['name']} - ${days[day]}'),
        content: const Text('Clique para editar horários'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Fechar')),
        ],
      ),
    );
  }
}
