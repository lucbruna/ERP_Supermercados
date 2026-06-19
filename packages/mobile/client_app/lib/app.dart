import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'config/routes.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/auth/mfa_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/products/products_screen.dart';
import 'screens/products/product_detail_screen.dart';
import 'screens/cart/cart_screen.dart';
import 'screens/sales/sale_history_screen.dart';
import 'screens/sales/sale_detail_screen.dart';
import 'screens/fidelity/fidelity_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/profile/edit_profile_screen.dart';
import 'screens/more/more_screen.dart';

class ClientApp extends StatelessWidget {
  const ClientApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();

    return MaterialApp(
      title: 'Supermercado ERP',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      themeMode: themeProvider.themeMode,
      initialRoute: AppRoutes.login,
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case AppRoutes.login:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
          case AppRoutes.register:
            return MaterialPageRoute(builder: (_) => const RegisterScreen());
          case AppRoutes.mfa:
            return MaterialPageRoute(builder: (_) => const MfaScreen());
          case AppRoutes.home:
            return MaterialPageRoute(builder: (_) => const HomeScreen());
          case AppRoutes.products:
            return MaterialPageRoute(builder: (_) => const ProductsScreen());
          case AppRoutes.productDetail:
            final product = settings.arguments;
            return MaterialPageRoute(
              builder: (_) => ProductDetailScreen(product: product as Map<String, dynamic>?),
            );
          case AppRoutes.cart:
            return MaterialPageRoute(builder: (_) => const CartScreen());
          case AppRoutes.saleHistory:
            return MaterialPageRoute(builder: (_) => const SaleHistoryScreen());
          case AppRoutes.saleDetail:
            return MaterialPageRoute(builder: (_) => const SaleDetailScreen());
          case AppRoutes.fidelity:
            return MaterialPageRoute(builder: (_) => const FidelityScreen());
          case AppRoutes.profile:
            return MaterialPageRoute(builder: (_) => const ProfileScreen());
          case AppRoutes.editProfile:
            return MaterialPageRoute(builder: (_) => const EditProfileScreen());
          case AppRoutes.more:
            return MaterialPageRoute(builder: (_) => const MoreScreen());
          default:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
        }
      },
    );
  }
}
