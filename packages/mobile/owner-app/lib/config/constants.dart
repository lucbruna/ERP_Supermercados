class AppConstants {
  static const String appName = 'ERP Supermercado - Sócio';
  static const String appVersion = '1.0.0';
  static const String companyName = 'Supermercado ERP Ltda.';

  static const int paginationLimit = 20;
  static const int searchDebounceMs = 500;
  static const Duration refreshInterval = Duration(minutes: 5);

  static const String cacheKeyAuth = 'owner_auth_token';
  static const String cacheKeyUser = 'owner_user_data';
  static const String cacheKeyDashboard = 'owner_dashboard_cache';
  static const String cacheKeyStores = 'owner_stores_cache';

  static const String storageKeyToken = 'owner_jwt_token';
  static const String storageKeyRefreshToken = 'owner_refresh_token';
}
