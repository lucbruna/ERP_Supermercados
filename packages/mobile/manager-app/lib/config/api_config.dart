class ApiConfig {
  static const String baseUrl = 'https://api.erpsupermercado.com.br/v1';
  static const Duration timeout = Duration(seconds: 30);

  static const String loginEndpoint = '/auth/login';
  static const String mfaEndpoint = '/auth/mfa/verify';
  static const String refreshTokenEndpoint = '/auth/refresh';
  static const String profileEndpoint = '/profile';

  static const String inventoryEndpoint = '/inventory/produtos';
  static const String inventoryMovementsEndpoint = '/inventory/movements';

  static const String salesEndpoint = '/pdv/vendas';
  static const String salesTodayEndpoint = '/pdv/vendas/hoje';

  static const String employeesEndpoint = '/rh/funcionarios';
  static const String pontoStatusEndpoint = '/rh/ponto/status';

  static const String financialEndpoint = '/financial/overview';

  static const String tasksEndpoint = '/tasks';

  static const String settingsEndpoint = '/settings';

  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
