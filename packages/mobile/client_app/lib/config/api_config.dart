class ApiConfig {
  static const String baseUrl = 'https://api.erpsupermercado.com.br/v1';
  static const String apiVersion = 'v1';
  static const Duration timeout = Duration(seconds: 30);
  static const Duration cacheDuration = Duration(minutes: 15);

  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String mfaEndpoint = '/auth/mfa/verify';
  static const String refreshTokenEndpoint = '/auth/refresh';
  static const String productsEndpoint = '/products';
  static const String categoriesEndpoint = '/categories';
  static const String offersEndpoint = '/offers';
  static const String cartEndpoint = '/cart';
  static const String salesEndpoint = '/sales';
  static const String fidelityEndpoint = '/fidelity';
  static const String couponsEndpoint = '/coupons';
  static const String profileEndpoint = '/profile';
  static const String notificationsEndpoint = '/notifications';
  static const String searchEndpoint = '/products/search';

  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
