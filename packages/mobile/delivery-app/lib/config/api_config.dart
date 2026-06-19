class ApiConfig {
  static const String baseUrl = 'https://api.erpsupermercado.com.br/v1';
  static const String apiVersion = 'v1';
  static const Duration timeout = Duration(seconds: 30);

  static const String loginEndpoint = '/auth/login';
  static const String refreshTokenEndpoint = '/auth/refresh';
  static const String profileEndpoint = '/profile';

  static const String deliveriesEndpoint = '/deliveries';
  static const String deliveryUpdateEndpoint = '/deliveries/update-status';
  static const String deliveryHistoryEndpoint = '/deliveries/history';
  static const String deliveryTodayEndpoint = '/deliveries/today';
  static const String routeOptimizeEndpoint = '/deliveries/route-optimize';

  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
