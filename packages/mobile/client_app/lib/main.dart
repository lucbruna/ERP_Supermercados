import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:offline/offline.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/fidelity_provider.dart';
import 'providers/theme_provider.dart';
import 'services/offline_service.dart';
import 'services/api_service.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final themeProvider = ThemeProvider();
  await themeProvider.loadTheme();

  final offlineDb = OfflineDatabase();
  await offlineDb.init();

  final offlineService = ClientOfflineService();
  await offlineService.init();

  final token = await ApiService().hasToken();
  if (token) {
    final storedToken = ApiService().token;
    if (storedToken != null) {
      SyncService().setAuthToken(storedToken);
    }
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => FidelityProvider()),
        ChangeNotifierProvider.value(value: themeProvider),
      ],
      child: const ClientApp(),
    ),
  );
}
