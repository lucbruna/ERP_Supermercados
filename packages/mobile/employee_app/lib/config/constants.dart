class AppConstants {
  static const String appName = 'Supermercado ERP - Colaborador';
  static const String appVersion = '1.0.0';
  static const String companyName = 'Supermercado ERP Ltda.';
  static const String companyCnpj = '00.000.000/0001-00';
  static const String supportEmail = 'rh@erpsupermercado.com.br';

  static const double minFaceMatchPercent = 75.0;
  static const int maxClockDistanceMeters = 100;
  static const int paginationLimit = 20;

  static const String cacheKeyAuth = 'employee_auth_token';
  static const String cacheKeyUser = 'employee_user_data';
  static const String cacheKeyPonto = 'ponto_data';
  static const String cacheKeySchedule = 'schedule_data';

  static const String storageKeyToken = 'employee_jwt_token';
  static const String storageKeyRefreshToken = 'employee_refresh_token';
  static const String storageKeyBiometric = 'employee_biometric_enabled';
  static const String storageKeyFaceRegistered = 'face_registered';

  static const double overtimeMultiplier = 1.5;
  static const double nightMultiplier = 1.2;
  static const int standardWorkHours = 8;
  static const int maxOvertimeHours = 2;
}
