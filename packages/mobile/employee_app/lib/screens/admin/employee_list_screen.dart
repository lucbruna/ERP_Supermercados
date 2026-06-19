import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../providers/auth_provider.dart';

class EmployeeListScreen extends StatefulWidget {
  const EmployeeListScreen({super.key});

  @override
  State<EmployeeListScreen> createState() => _EmployeeListScreenState();
}

class _EmployeeListScreenState extends State<EmployeeListScreen> {
  final _searchController = TextEditingController();
  String _selectedDepartment = 'Todos';

  final List<Map<String, dynamic>> _employees = List.generate(
    20,
    (i) => {
      'id': i + 1,
      'name': 'Funcionário ${i + 1}',
      'position': ['Operador de Caixa', 'Repositor', 'Açougueiro', 'Padeiro', 'Gerente'][i % 5],
      'department': ['Operacional', 'Logística', 'Açougue', 'Padaria', 'Administrativo'][i % 5],
      'status': i % 4 == 0 ? 'inactive' : 'active',
    },
  );

  List<Map<String, dynamic>> get _filteredEmployees {
    var filtered = _employees;
    if (_selectedDepartment != 'Todos') {
      filtered = filtered.where((e) => e['department'] == _selectedDepartment).toList();
    }
    if (_searchController.text.isNotEmpty) {
      final q = _searchController.text.toLowerCase();
      filtered = filtered.where((e) => e['name'].toLowerCase().contains(q)).toList();
    }
    return filtered;
  }

  final List<String> _departments = [
    'Todos', 'Operacional', 'Logística', 'Açougue', 'Padaria', 'Administrativo', 'RH',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Funcionários'),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Buscar funcionário...',
                prefixIcon: const Icon(Icons.search, size: 20),
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: Colors.grey[100],
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          Container(
            height: 44,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              itemCount: _departments.length,
              itemBuilder: (context, index) {
                final isSelected = _selectedDepartment == _departments[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                  child: ChoiceChip(
                    label: Text(_departments[index]),
                    selected: isSelected,
                    onSelected: (_) => setState(() => _selectedDepartment = _departments[index]),
                    selectedColor: AppTheme.primaryGreen,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppTheme.textSecondary,
                      fontSize: 12,
                    ),
                    backgroundColor: Colors.grey[100],
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide.none),
                  ),
                );
              },
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: _filteredEmployees.length,
              itemBuilder: (context, index) {
                final emp = _filteredEmployees[index];
                final isActive = emp['status'] == 'active';
                return Card(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isActive
                          ? AppTheme.primaryGreen.withOpacity(0.1)
                          : Colors.grey[200],
                      child: Text(
                        (emp['name'] as String).split(' ').map((s) => s[0]).take(2).join(),
                        style: GoogleFonts.inter(
                          color: isActive ? AppTheme.primaryGreen : Colors.grey,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    title: Text(emp['name'],
                        style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 15)),
                    subtitle: Text('${emp['position']} • ${emp['department']}',
                        style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary)),
                    trailing: Container(
                      width: 8, height: 8,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isActive ? AppTheme.success : AppTheme.error,
                      ),
                    ),
                    onTap: () => Navigator.pushNamed(context, AppRoutes.adminEmployeeDetail, arguments: emp),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
