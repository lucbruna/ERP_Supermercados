import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:offline/offline.dart';
import '../config/api_config.dart';

class EmployeeOfflineService {
  static final EmployeeOfflineService _instance = EmployeeOfflineService._internal();
  factory EmployeeOfflineService() => _instance;
  EmployeeOfflineService._internal();

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

  Future<int> queuePontoRecord({
    required String action,
    String? facePhotoBase64,
    double? latitude,
    double? longitude,
    double? matchPercent,
    String? note,
    bool biometrico = false,
  }) async {
    return await _syncService.enqueueOperation(
      type: 'POST',
      endpoint: '${ApiConfig.pontoEndpoint}/biometrico',
      payload: {
        'action': action,
        'timestamp': DateTime.now().toIso8601String(),
        if (facePhotoBase64 != null) 'face_photo': facePhotoBase64,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        if (matchPercent != null) 'match_percent': matchPercent,
        if (note != null) 'note': note,
        if (biometrico) 'biometrico': true,
      },
    );
  }

  Future<int> queueBreakAction({
    required String action,
    String? note,
  }) async {
    final endpoint = action == 'start'
        ? '${ApiConfig.pontoEndpoint}/break/start'
        : '${ApiConfig.pontoEndpoint}/break/end';
    return await _syncService.enqueueOperation(
      type: 'POST',
      endpoint: endpoint,
      payload: {
        'timestamp': DateTime.now().toIso8601String(),
        if (note != null) 'note': note,
      },
    );
  }

  Future<void> cacheScheduleData(Map<String, dynamic> data) async {
    final id = data['id'] ?? 0;
    await _cacheService.cacheSchedule(id, data);
  }

  Future<Map<String, dynamic>?> getCachedScheduleData(int id) async {
    return await _cacheService.getCachedSchedule(id);
  }

  Future<List<Map<String, dynamic>>?> getCachedPontoHistory() async {
    final records = await _db.getAllCached(table: 'cached_prices');
    return records.isNotEmpty ? records : null;
  }

  Stream<SyncStatus> get syncStatusStream => _syncService.onStatusChanged;

  Future<void> syncNow() => _syncService.syncAll();
}
