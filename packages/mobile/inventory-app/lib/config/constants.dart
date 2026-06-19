class AppConstants {
  static const String appName = 'Inventário ERP';
  static const String appVersion = '1.0.0';

  static const String storageKeyToken = 'inventory_jwt_token';
  static const String storageKeyRefreshToken = 'inventory_refresh_token';
  static const String cacheKeyUser = 'inventory_user_data';

  static const int paginationLimit = 20;
  static const int lowStockThreshold = 10;
  static const int expiringSoonDays = 30;
}
