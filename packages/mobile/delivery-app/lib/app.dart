import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'config/routes.dart';
import 'providers/auth_provider.dart';
import 'screens/login/login_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/delivery/delivery_list_screen.dart';
import 'screens/delivery/delivery_detail_screen.dart';
import 'screens/delivery/route_screen.dart';
import 'screens/delivery/history_screen.dart';
import 'screens/profile/profile_screen.dart';

class DeliveryApp extends StatelessWidget {
  const DeliveryApp({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return MaterialApp(
      title: 'Delivery ERP',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: auth.isAuthenticated ? AppRoutes.home : AppRoutes.login,
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case AppRoutes.login:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
          case AppRoutes.home:
            return MaterialPageRoute(builder: (_) => const HomeScreen());
          case AppRoutes.deliveryList:
            return MaterialPageRoute(builder: (_) => const DeliveryListScreen());
          case AppRoutes.deliveryDetail:
            final deliveryId = settings.arguments as int?;
            return MaterialPageRoute(
              builder: (_) => DeliveryDetailScreen(deliveryId: deliveryId ?? 0),
            );
          case AppRoutes.route:
            return MaterialPageRoute(builder: (_) => const RouteScreen());
          case AppRoutes.history:
            return MaterialPageRoute(builder: (_) => const HistoryScreen());
          case AppRoutes.profile:
            return MaterialPageRoute(builder: (_) => const ProfileScreen());
          default:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
        }
      },
    );
  }
}
