class ApiConfig {
  static const String baseUrl = 'https://api.erpsupermercado.com.br/v1';
  static const String apiVersion = 'v1';
  static const Duration timeout = Duration(seconds: 30);
  static const Duration cacheDuration = Duration(minutes: 15);

  static const String loginEndpoint = '/auth/login';
  static const String mfaEndpoint = '/auth/mfa/verify';
  static const String refreshTokenEndpoint = '/auth/refresh';
  static const String profileEndpoint = '/profile';
  static const String pontoEndpoint = '/ponto';
  static const String pontoHistoryEndpoint = '/ponto/history';
  static const String scheduleEndpoint = '/schedule';
  static const String payrollEndpoint = '/payroll';
  static const String paystubEndpoint = '/paystub';
  static const String requestsEndpoint = '/requests';
  static const String employeesEndpoint = '/employees';
  static const String notificationsEndpoint = '/notifications';

  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
