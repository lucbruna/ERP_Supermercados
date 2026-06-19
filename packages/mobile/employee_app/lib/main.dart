import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:offline/offline.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/ponto_provider.dart';
import 'providers/schedule_provider.dart';
import 'providers/payroll_provider.dart';
import 'providers/request_provider.dart';
import 'services/api_service.dart';
import 'services/offline_service.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final offlineDb = OfflineDatabase();
  await offlineDb.init();

  final offlineService = EmployeeOfflineService();
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
        ChangeNotifierProvider(create: (_) => PontoProvider()),
        ChangeNotifierProvider(create: (_) => ScheduleProvider()),
        ChangeNotifierProvider(create: (_) => PayrollProvider()),
        ChangeNotifierProvider(create: (_) => RequestProvider()),
      ],
      child: const EmployeeApp(),
    ),
  );
}
