class ApiConfig {
  static const String baseUrl = 'https://api.erpsupermercado.com.br/v1';
  static const String apiVersion = 'v1';
  static const Duration timeout = Duration(seconds: 30);

  static const String loginEndpoint = '/auth/login';
  static const String mfaEndpoint = '/auth/mfa/verify';
  static const String refreshTokenEndpoint = '/auth/refresh';
  static const String profileEndpoint = '/profile';

  static const String dashboardEndpoint = '/dashboard';
  static const String dashboardKpisEndpoint = '/dashboard/kpis';
  static const String financialEndpoint = '/dashboard/financial';

  static const String storesEndpoint = '/filiais';
  static const String storesComparisonEndpoint = '/stores/comparison';

  static const String reportsEndpoint = '/reports';

  static const String settingsEndpoint = '/settings';
  static const String notificationsEndpoint = '/notifications';

  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
