import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'offline_database.dart';
import 'connectivity_service.dart';

class SyncService {
  static final SyncService _instance = SyncService._internal();
  factory SyncService() => _instance;
  SyncService._internal();

  final OfflineDatabase _db = OfflineDatabase();
  final ConnectivityService _connectivity = ConnectivityService();
  StreamSubscription<bool>? _connectivitySub;

  bool _isSyncing = false;
  int _pendingCount = 0;
  final StreamController<SyncStatus> _statusController =
      StreamController<SyncStatus>.broadcast();

  Stream<SyncStatus> get onStatusChanged => _statusController.stream;
  bool get isSyncing => _isSyncing;

  static const int _maxRetries = 5;
  static const int _batchSize = 10;
  static const Duration _maxBackoff = Duration(seconds: 60);

  List<Duration> _backoffDelays = const [
    Duration(seconds: 1),
    Duration(seconds: 2),
    Duration(seconds: 4),
    Duration(seconds: 8),
    Duration(seconds: 16),
    Duration(seconds: 32),
  ];

  String? _baseUrl;
  Map<String, String>? _defaultHeaders;

  void configure({
    required String baseUrl,
    Map<String, String>? headers,
  }) {
    _baseUrl = baseUrl;
    _defaultHeaders = headers ?? {'Content-Type': 'application/json'};
  }

  void setAuthToken(String token) {
    _defaultHeaders = _defaultHeaders ?? {'Content-Type': 'application/json'};
    _defaultHeaders!['Authorization'] = 'Bearer $token';
  }

  Future<void> init() async {
    await _connectivity.init();
    _pendingCount = await _db.countPendingOperations();
    _statusController.add(SyncStatus(
      isOnline: _connectivity.isOnline,
      isSyncing: false,
      pendingCount: _pendingCount,
    ));

    if (_connectivity.isOnline && _pendingCount > 0) {
      syncAll();
    }

    _connectivitySub = _connectivity.onConnectivityChanged.listen((isOnline) {
      _statusController.add(SyncStatus(
        isOnline: isOnline,
        isSyncing: _isSyncing,
        pendingCount: _pendingCount,
      ));
      if (isOnline && _pendingCount > 0) {
        syncAll();
      }
    });
  }

  Future<int> enqueueOperation({
    required String type,
    required String endpoint,
    Map<String, dynamic>? payload,
  }) async {
    final id = await _db.insertOperation(
      type: type,
      endpoint: endpoint,
      payload: payload,
    );
    _pendingCount++;
    _statusController.add(SyncStatus(
      isOnline: _connectivity.isOnline,
      isSyncing: _isSyncing,
      pendingCount: _pendingCount,
    ));
    return id;
  }

  Future<void> syncAll() async {
    if (_isSyncing) return;
    if (_baseUrl == null) return;

    _isSyncing = true;
    _statusController.add(SyncStatus(
      isOnline: _connectivity.isOnline,
      isSyncing: true,
      pendingCount: _pendingCount,
    ));

    try {
      while (true) {
        final operations = await _db.getPendingOperations(limit: _batchSize);
        if (operations.isEmpty) break;

        for (final op in operations) {
          final id = op['id'] as int;
          final retryCount = (op['retry_count'] as int?) ?? 0;
          final type = op['type'] as String;
          final endpoint = op['endpoint'] as String;
          final payloadStr = op['payload'] as String?;

          Map<String, dynamic>? payload;
          if (payloadStr != null && payloadStr.isNotEmpty) {
            payload = jsonDecode(payloadStr) as Map<String, dynamic>;
          }

          final success = await _executeOperation(
            type: type,
            endpoint: endpoint,
            payload: payload,
          );

          if (success) {
            await _db.markCompleted(id);
            _pendingCount--;
          } else {
            await _db.incrementRetry(id);
            if (retryCount + 1 >= _maxRetries) {
              await _db.markFailed(id, retryCount: retryCount + 1);
              _pendingCount--;
            }

            if (!await _connectivity.checkConnectivity()) {
              break;
            }

            final delay = retryCount < _backoffDelays.length
                ? _backoffDelays[retryCount]
                : _maxBackoff;
            await Future.delayed(delay);
          }

          _statusController.add(SyncStatus(
            isOnline: _connectivity.isOnline,
            isSyncing: true,
            pendingCount: _pendingCount,
          ));
        }
      }
    } finally {
      _isSyncing = false;
      _statusController.add(SyncStatus(
        isOnline: _connectivity.isOnline,
        isSyncing: false,
        pendingCount: _pendingCount,
      ));
    }
  }

  Future<bool> _executeOperation({
    required String type,
    required String endpoint,
    Map<String, dynamic>? payload,
  }) async {
    try {
      final uri = Uri.parse('$_baseUrl$endpoint');
      final headers = Map<String, String>.from(_defaultHeaders ?? {});

      http.Response response;
      switch (type.toUpperCase()) {
        case 'GET':
          response = await http.get(uri, headers: headers);
          break;
        case 'POST':
          response = await http.post(
            uri,
            headers: headers,
            body: payload != null ? jsonEncode(payload) : null,
          );
          break;
        case 'PUT':
          response = await http.put(
            uri,
            headers: headers,
            body: payload != null ? jsonEncode(payload) : null,
          );
          break;
        case 'PATCH':
          response = await http.patch(
            uri,
            headers: headers,
            body: payload != null ? jsonEncode(payload) : null,
          );
          break;
        case 'DELETE':
          response = await http.delete(uri, headers: headers);
          break;
        default:
          return false;
      }

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return true;
      }

      if (response.statusCode == 409) {
        return type == 'POST' || type.toUpperCase() == 'POST';
      }

      return false;
    } catch (_) {
      return false;
    }
  }

  Future<void> refreshPendingCount() async {
    _pendingCount = await _db.countPendingOperations();
    _statusController.add(SyncStatus(
      isOnline: _connectivity.isOnline,
      isSyncing: _isSyncing,
      pendingCount: _pendingCount,
    ));
  }

  void dispose() {
    _connectivitySub?.cancel();
    _statusController.close();
  }
}

class SyncStatus {
  final bool isOnline;
  final bool isSyncing;
  final int pendingCount;

  const SyncStatus({
    required this.isOnline,
    required this.isSyncing,
    required this.pendingCount,
  });
}
