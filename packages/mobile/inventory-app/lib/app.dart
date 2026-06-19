import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'config/routes.dart';
import 'providers/auth_provider.dart';
import 'screens/login/login_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/products/product_search_screen.dart';
import 'screens/products/product_detail_screen.dart';
import 'screens/stock/movements_screen.dart';
import 'screens/stock/stock_count_screen.dart';
import 'screens/stock/transfers_screen.dart';
import 'screens/stock/lotes_screen.dart';
import 'screens/settings/settings_screen.dart';

class InventoryApp extends StatelessWidget {
  const InventoryApp({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return MaterialApp(
      title: 'Inventário ERP',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: auth.isAuthenticated ? AppRoutes.home : AppRoutes.login,
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case AppRoutes.login:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
          case AppRoutes.home:
            return MaterialPageRoute(builder: (_) => const HomeScreen());
          case AppRoutes.productSearch:
            return MaterialPageRoute(builder: (_) => const ProductSearchScreen());
          case AppRoutes.productDetail:
            final productId = settings.arguments as int?;
            return MaterialPageRoute(
              builder: (_) => ProductDetailScreen(productId: productId ?? 0),
            );
          case AppRoutes.movements:
            return MaterialPageRoute(builder: (_) => const MovementsScreen());
          case AppRoutes.stockCount:
            return MaterialPageRoute(builder: (_) => const StockCountScreen());
          case AppRoutes.transfers:
            return MaterialPageRoute(builder: (_) => const TransfersScreen());
          case AppRoutes.lotes:
            return MaterialPageRoute(builder: (_) => const LotesScreen());
          case AppRoutes.settings:
            return MaterialPageRoute(builder: (_) => const SettingsScreen());
          default:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
        }
      },
    );
  }
}
