import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:offline/offline.dart';
import '../config/api_config.dart';

class ClientOfflineService {
  static final ClientOfflineService _instance = ClientOfflineService._internal();
  factory ClientOfflineService() => _instance;
  ClientOfflineService._internal();

  final OfflineDatabase _db = OfflineDatabase();
  final SyncService _syncService = SyncService();
  final CacheService _cacheService = CacheService();
  final ConnectivityService _connectivity = ConnectivityService();

  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;
    await _db.init();
    await _connectivity.init();
    _syncService.configure(
      baseUrl: ApiConfig.baseUrl,
      headers: ApiConfig.headers,
    );

    final connectivity = Connectivity();
    final result = await connectivity.checkConnectivity();
    if (result != ConnectivityResult.none) {
      _syncService.syncAll();
    }

    connectivity.onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none) {
        _syncService.syncAll();
      }
    });

    _initialized = true;
  }

  void setAuthToken(String token) {
    _syncService.setAuthToken(token);
  }

  Future<bool> get isOnline => _connectivity.checkConnectivity();

  Future<int> queueOperation({
    required String type,
    required String endpoint,
    Map<String, dynamic>? payload,
  }) async {
    return await _syncService.enqueueOperation(
      type: type,
      endpoint: endpoint,
      payload: payload,
    );
  }

  Future<void> cacheProducts(List<Map<String, dynamic>> products) async {
    for (final product in products) {
      final id = product['id'] ?? 0;
      await _cacheService.cacheProduct(id, product);
    }
  }

  Future<List<Map<String, dynamic>>?> getCachedProducts() async {
    final rows = await _db.getAllCached(table: 'cached_products');
    return rows.isNotEmpty ? rows : null;
  }

  Future<void> cacheProductDetail(Map<String, dynamic> product) async {
    final id = product['id'] ?? 0;
    await _cacheService.cacheProduct(id, product);
  }

  Future<Map<String, dynamic>?> getCachedProductDetail(int id) async {
    return await _cacheService.getCachedProduct(id);
  }

  Future<void> cacheCustomerData(Map<String, dynamic> data) async {
    final id = data['id'] ?? 0;
    await _cacheService.cacheCustomer(id, data);
  }

  Future<Map<String, dynamic>?> getCachedCustomerData(int id) async {
    return await _cacheService.getCachedCustomer(id);
  }

  int get pendingOperations => _syncService.isSyncing ? 0 : 0;

  Stream<SyncStatus> get syncStatusStream => _syncService.onStatusChanged;

  Future<void> syncNow() => _syncService.syncAll();
}
