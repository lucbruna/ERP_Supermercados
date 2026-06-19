import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'config/routes.dart';
import 'providers/auth_provider.dart';
import 'screens/login/login_screen.dart';
import 'screens/login/mfa_screen.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'screens/stores/store_list_screen.dart';
import 'screens/stores/store_detail_screen.dart';
import 'screens/reports/report_list_screen.dart';
import 'screens/settings/settings_screen.dart';

class OwnerApp extends StatelessWidget {
  const OwnerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ERP Supermercado - Sócio',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: AppRoutes.login,
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case AppRoutes.login:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
          case AppRoutes.mfa:
            return MaterialPageRoute(builder: (_) => const MfaScreen());
          case AppRoutes.dashboard:
            return MaterialPageRoute(builder: (_) => const DashboardScreen());
          case AppRoutes.stores:
            return MaterialPageRoute(builder: (_) => const StoreListScreen());
          case AppRoutes.storeDetail:
            final store = settings.arguments as Map<String, dynamic>?;
            return MaterialPageRoute(
              builder: (_) => StoreDetailScreen(store: store ?? {}),
            );
          case AppRoutes.reports:
            return MaterialPageRoute(builder: (_) => const ReportListScreen());
          case AppRoutes.settings:
            return MaterialPageRoute(builder: (_) => const SettingsScreen());
          default:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
        }
      },
    );
  }
}
