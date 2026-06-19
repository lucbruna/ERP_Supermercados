class AppConstants {
  static const String appName = 'Supermercado ERP';
  static const String appVersion = '1.0.0';
  static const String companyName = 'Supermercado ERP Ltda.';
  static const String companyCnpj = '00.000.000/0001-00';
  static const String supportEmail = 'suporte@erpsupermercado.com.br';
  static const String supportPhone = '(11) 3000-0000';
  static const String privacyPolicy = 'https://erpsupermercado.com.br/privacidade';
  static const String termsOfUse = 'https://erpsupermercado.com.br/termos';

  static const int splashDuration = 2;
  static const int searchDebounceMs = 500;
  static const int maxCartItems = 50;
  static const int maxFavorites = 100;
  static const double minPixValue = 1.0;
  static const int paginationLimit = 20;

  static const String cacheKeyAuth = 'auth_token';
  static const String cacheKeyUser = 'user_data';
  static const String cacheKeyCart = 'cart_data';
  static const String cacheKeyFidelity = 'fidelity_data';
  static const String cacheKeyTheme = 'theme_mode';

  static const String storageKeyToken = 'jwt_token';
  static const String storageKeyRefreshToken = 'refresh_token';
  static const String storageKeyBiometric = 'biometric_enabled';

  static const int fidelityPointsPerReal = 10;
  static const double cashbackPercent = 0.05;
  static const double cashbackMinPoints = 100;
  static const String couponPrefix = 'CUPOM';
}
