import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:offline/offline.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/delivery_provider.dart';
import 'providers/route_provider.dart';
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
        ChangeNotifierProvider(create: (_) => DeliveryProvider()),
        ChangeNotifierProvider(create: (_) => RouteProvider()),
      ],
      child: const DeliveryApp(),
    ),
  );
}
