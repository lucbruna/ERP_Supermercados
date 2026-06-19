import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:offline/offline.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/product_provider.dart';
import 'providers/stock_provider.dart';
import 'providers/inventory_provider.dart';
import 'providers/transfer_provider.dart';
import 'services/api_service.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final offlineDb = OfflineDatabase();
  await offlineDb.init();

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
        ChangeNotifierProvider(create: (_) => ProductProvider()),
        ChangeNotifierProvider(create: (_) => StockProvider()),
        ChangeNotifierProvider(create: (_) => InventoryProvider()),
        ChangeNotifierProvider(create: (_) => TransferProvider()),
      ],
      child: const InventoryApp(),
    ),
  );
}
