import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'config/routes.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/mfa_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/ponto/ponto_screen.dart';
import 'screens/ponto/ponto_history_screen.dart';
import 'screens/schedule/schedule_screen.dart';
import 'screens/payroll/payroll_screen.dart';
import 'screens/requests/requests_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/profile/edit_profile_screen.dart';
import 'screens/admin/employee_list_screen.dart';
import 'screens/admin/employee_detail_screen.dart';
import 'screens/admin/schedule_management_screen.dart';
import 'screens/admin/payroll_management_screen.dart';

class EmployeeApp extends StatelessWidget {
  const EmployeeApp({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return MaterialApp(
      title: 'ERP Supermercado - Colaborador',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: auth.isAuthenticated ? AppRoutes.home : AppRoutes.login,
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case AppRoutes.login:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
          case AppRoutes.mfa:
            return MaterialPageRoute(builder: (_) => const MfaScreen());
          case AppRoutes.home:
            return MaterialPageRoute(builder: (_) => const HomeScreen());
          case AppRoutes.ponto:
            return MaterialPageRoute(builder: (_) => const PontoScreen());
          case AppRoutes.pontoHistory:
            return MaterialPageRoute(builder: (_) => const PontoHistoryScreen());
          case AppRoutes.schedule:
            return MaterialPageRoute(builder: (_) => const ScheduleScreen());
          case AppRoutes.payroll:
            return MaterialPageRoute(builder: (_) => const PayrollScreen());
          case AppRoutes.requests:
            return MaterialPageRoute(builder: (_) => const RequestsScreen());
          case AppRoutes.profile:
            return MaterialPageRoute(builder: (_) => const ProfileScreen());
          case AppRoutes.editProfile:
            return MaterialPageRoute(builder: (_) => const EditProfileScreen());
          case AppRoutes.adminEmployees:
            return MaterialPageRoute(builder: (_) => const EmployeeListScreen());
          case AppRoutes.adminEmployeeDetail:
            return MaterialPageRoute(builder: (_) => const EmployeeDetailScreen());
          case AppRoutes.adminSchedule:
            return MaterialPageRoute(builder: (_) => const ScheduleManagementScreen());
          case AppRoutes.adminPayroll:
            return MaterialPageRoute(builder: (_) => const PayrollManagementScreen());
          default:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
        }
      },
    );
  }
}
