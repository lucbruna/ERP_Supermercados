class ApiConfig {
  static const String baseUrl = 'https://api.erpsupermercado.com.br/v1';
  static const String apiVersion = 'v1';
  static const Duration timeout = Duration(seconds: 30);

  static const String loginEndpoint = '/auth/login';
  static const String refreshTokenEndpoint = '/auth/refresh';
  static const String profileEndpoint = '/profile';

  static const String productsEndpoint = '/inventory/produtos';
  static const String productBarcodeEndpoint = '/inventory/produtos/barcode';
  static const String categoriesEndpoint = '/inventory/categorias';

  static const String stockEndpoint = '/estoque';
  static const String stockMovementsEndpoint = '/estoque/movimentos';
  static const String stockAlertsEndpoint = '/estoque/alertas';

  static const String inventoryEndpoint = '/inventarios';
  static const String inventoryLotesEndpoint = '/inventarios/lotes';

  static const String transfersEndpoint = '/transferencias';

  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
