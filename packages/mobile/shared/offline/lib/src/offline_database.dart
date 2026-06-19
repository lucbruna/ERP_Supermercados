import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;

class OfflineDatabase {
  static final OfflineDatabase _instance = OfflineDatabase._internal();
  factory OfflineDatabase() => _instance;
  OfflineDatabase._internal();

  Database? _db;

  Database get db {
    if (_db == null) throw StateError('Database not initialized');
    return _db!;
  }

  Future<void> init() async {
    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, 'offline.db');
    _db = await openDatabase(
      path,
      version: 1,
      onCreate: _createTables,
    );
  }

  Future<void> _createTables(Database db, int version) async {
    await db.execute('''
      CREATE TABLE pending_operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        payload TEXT,
        created_at TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending'
      )
    ''');
    await db.execute('''
      CREATE TABLE cached_products (
        id INTEGER PRIMARY KEY,
        json_data TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )
    ''');
    await db.execute('''
      CREATE TABLE cached_customers (
        id INTEGER PRIMARY KEY,
        json_data TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )
    ''');
    await db.execute('''
      CREATE TABLE cached_prices (
        id INTEGER PRIMARY KEY,
        json_data TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )
    ''');
    await db.execute('''
      CREATE TABLE cached_employee_schedules (
        id INTEGER PRIMARY KEY,
        json_data TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )
    ''');
  }

  Future<int> insertOperation({
    required String type,
    required String endpoint,
    Map<String, dynamic>? payload,
  }) async {
    return await db.insert('pending_operations', {
      'type': type,
      'endpoint': endpoint,
      'payload': payload != null ? jsonEncode(payload) : null,
      'created_at': DateTime.now().toUtc().toIso8601String(),
      'retry_count': 0,
      'status': 'pending',
    });
  }

  Future<List<Map<String, dynamic>>> getPendingOperations({int limit = 10}) async {
    return await db.query(
      'pending_operations',
      where: 'status = ?',
      whereArgs: ['pending'],
      orderBy: 'created_at ASC',
      limit: limit,
    );
  }

  Future<int> countPendingOperations() async {
    final result = await db.rawQuery(
      "SELECT COUNT(*) as count FROM pending_operations WHERE status = 'pending'",
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<void> markCompleted(int id) async {
    await db.update(
      'pending_operations',
      {'status': 'completed'},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<void> markFailed(int id, {int? retryCount}) async {
    final updates = <String, dynamic>{'status': 'failed'};
    if (retryCount != null) updates['retry_count'] = retryCount;
    await db.update(
      'pending_operations',
      updates,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<void> incrementRetry(int id) async {
    await db.rawUpdate(
      'UPDATE pending_operations SET retry_count = retry_count + 1 WHERE id = ?',
      [id],
    );
  }

  Future<List<Map<String, dynamic>>> getFailedOperations() async {
    return await db.query(
      'pending_operations',
      where: 'status = ?',
      whereArgs: ['failed'],
      orderBy: 'created_at DESC',
    );
  }

  Future<void> cleanOldOperations({Duration olderThan = const Duration(days: 7)}) async {
    final cutoff = DateTime.now().subtract(olderThan).toUtc().toIso8601String();
    await db.delete(
      'pending_operations',
      where: 'created_at < ? AND status IN (?, ?)',
      whereArgs: [cutoff, 'completed', 'failed'],
    );
  }

  Future<void> cacheData({
    required String table,
    required int id,
    required Map<String, dynamic> data,
    required Duration ttl,
  }) async {
    final expiresAt = DateTime.now().add(ttl).toUtc().toIso8601String();
    await db.insert(
      table,
      {
        'id': id,
        'json_data': jsonEncode(data),
        'expires_at': expiresAt,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<Map<String, dynamic>?> getCachedData({
    required String table,
    required int id,
  }) async {
    final rows = await db.query(
      table,
      where: 'id = ? AND expires_at > ?',
      whereArgs: [id, DateTime.now().toUtc().toIso8601String()],
      limit: 1,
    );
    if (rows.isEmpty) return null;
    return jsonDecode(rows.first['json_data'] as String) as Map<String, dynamic>;
  }

  Future<void> clearCache({String? table}) async {
    if (table != null) {
      await db.delete(table);
    } else {
      await db.delete('cached_products');
      await db.delete('cached_customers');
      await db.delete('cached_prices');
      await db.delete('cached_employee_schedules');
    }
  }

  Future<List<Map<String, dynamic>>> getAllCached({required String table}) async {
    final now = DateTime.now().toUtc().toIso8601String();
    final rows = await db.query(
      table,
      where: 'expires_at > ?',
      whereArgs: [now],
    );
    return rows.map((r) => jsonDecode(r['json_data'] as String) as Map<String, dynamic>).toList();
  }
}
