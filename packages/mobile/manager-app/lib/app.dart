import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'config/routes.dart';
import 'providers/auth_provider.dart';
import 'screens/login/login_screen.dart';
import 'screens/login/mfa_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/inventory/inventory_screen.dart';
import 'screens/sales/sales_screen.dart';
import 'screens/employees/employee_screen.dart';
import 'screens/financial/financial_screen.dart';
import 'screens/tasks/task_screen.dart';
import 'screens/settings/settings_screen.dart';

class ManagerApp extends StatelessWidget {
  const ManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ERP Supermercado - Gerente',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: AppRoutes.login,
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case AppRoutes.login:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
          case AppRoutes.mfa:
            return MaterialPageRoute(builder: (_) => const MfaScreen());
          case AppRoutes.home:
            return MaterialPageRoute(builder: (_) => const HomeScreen());
          case AppRoutes.inventory:
            return MaterialPageRoute(builder: (_) => const InventoryScreen());
          case AppRoutes.sales:
            return MaterialPageRoute(builder: (_) => const SalesScreen());
          case AppRoutes.employees:
            return MaterialPageRoute(builder: (_) => const EmployeeScreen());
          case AppRoutes.financial:
            return MaterialPageRoute(builder: (_) => const FinancialScreen());
          case AppRoutes.tasks:
            return MaterialPageRoute(builder: (_) => const TaskScreen());
          case AppRoutes.settings:
            return MaterialPageRoute(builder: (_) => const SettingsScreen());
          default:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
        }
      },
    );
  }
}
