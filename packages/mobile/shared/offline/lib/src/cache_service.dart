import 'dart:collection';
import 'offline_database.dart';

class MemoryCacheEntry<T> {
  final T data;
  final DateTime expiresAt;
  MemoryCacheEntry(this.data, this.expiresAt);

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}

class CacheService {
  static final CacheService _instance = CacheService._internal();
  factory CacheService() => _instance;
  CacheService._internal();

  final OfflineDatabase _db = OfflineDatabase();
  final LinkedHashMap<String, MemoryCacheEntry> _memoryCache =
      LinkedHashMap<String, MemoryCacheEntry>();
  static const int _maxMemoryEntries = 200;

  static const Duration pricesTtl = Duration(minutes: 5);
  static const Duration productsTtl = Duration(minutes: 30);
  static const Duration customersTtl = Duration(hours: 1);
  static const Duration schedulesTtl = Duration(hours: 1);

  String _memKey(String table, int id) => '$table:$id';

  Future<void> cacheProduct(int id, Map<String, dynamic> data, {Duration? ttl}) async {
    final effectiveTtl = ttl ?? productsTtl;
    await _db.cacheData(table: 'cached_products', id: id, data: data, ttl: effectiveTtl);
    _addToMemoryCache('products:$id', data, effectiveTtl);
  }

  Future<Map<String, dynamic>?> getCachedProduct(int id) async {
    final memKey = 'products:$id';
    final memEntry = _memoryCache[memKey];
    if (memEntry != null && !memEntry.isExpired) {
      return memEntry.data as Map<String, dynamic>;
    }
    if (memEntry != null) _memoryCache.remove(memKey);
    return await _db.getCachedData(table: 'cached_products', id: id);
  }

  Future<void> cacheCustomer(int id, Map<String, dynamic> data, {Duration? ttl}) async {
    final effectiveTtl = ttl ?? customersTtl;
    await _db.cacheData(table: 'cached_customers', id: id, data: data, ttl: effectiveTtl);
    _addToMemoryCache('customers:$id', data, effectiveTtl);
  }

  Future<Map<String, dynamic>?> getCachedCustomer(int id) async {
    final memKey = 'customers:$id';
    final memEntry = _memoryCache[memKey];
    if (memEntry != null && !memEntry.isExpired) {
      return memEntry.data as Map<String, dynamic>;
    }
    if (memEntry != null) _memoryCache.remove(memKey);
    return await _db.getCachedData(table: 'cached_customers', id: id);
  }

  Future<void> cachePrice(int id, Map<String, dynamic> data, {Duration? ttl}) async {
    final effectiveTtl = ttl ?? pricesTtl;
    await _db.cacheData(table: 'cached_prices', id: id, data: data, ttl: effectiveTtl);
    _addToMemoryCache('prices:$id', data, effectiveTtl);
  }

  Future<Map<String, dynamic>?> getCachedPrice(int id) async {
    final memKey = 'prices:$id';
    final memEntry = _memoryCache[memKey];
    if (memEntry != null && !memEntry.isExpired) {
      return memEntry.data as Map<String, dynamic>;
    }
    if (memEntry != null) _memoryCache.remove(memKey);
    return await _db.getCachedData(table: 'cached_prices', id: id);
  }

  Future<void> cacheSchedule(int id, Map<String, dynamic> data, {Duration? ttl}) async {
    final effectiveTtl = ttl ?? schedulesTtl;
    await _db.cacheData(table: 'cached_employee_schedules', id: id, data: data, ttl: effectiveTtl);
    _addToMemoryCache('schedules:$id', data, effectiveTtl);
  }

  Future<Map<String, dynamic>?> getCachedSchedule(int id) async {
    final memKey = 'schedules:$id';
    final memEntry = _memoryCache[memKey];
    if (memEntry != null && !memEntry.isExpired) {
      return memEntry.data as Map<String, dynamic>;
    }
    if (memEntry != null) _memoryCache.remove(memKey);
    return await _db.getCachedData(table: 'cached_employee_schedules', id: id);
  }

  void _addToMemoryCache(String key, dynamic data, Duration ttl) {
    if (_memoryCache.length >= _maxMemoryEntries) {
      _memoryCache.remove(_memoryCache.keys.first);
    }
    _memoryCache[key] = MemoryCacheEntry(data, DateTime.now().add(ttl));
  }

  Future<void> clearAll() async {
    _memoryCache.clear();
    await _db.clearCache();
  }

  void clearMemoryCache() {
    _memoryCache.clear();
  }
}
