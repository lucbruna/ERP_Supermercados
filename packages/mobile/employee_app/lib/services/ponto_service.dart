import '../config/api_config.dart';
import '../models/ponto_record.dart';
import 'api_service.dart';
import 'offline_service.dart';

class PontoService {
  final ApiService _api = ApiService();
  final EmployeeOfflineService _offline = EmployeeOfflineService();

  Future<PontoRecord> clockIn({
    String? facePhotoBase64,
    double? latitude,
    double? longitude,
    double? matchPercent,
    String? note,
    bool biometrico = false,
  }) async {
    final body = <String, dynamic>{
      'action': 'clock_in',
      'timestamp': DateTime.now().toIso8601String(),
    };
    if (facePhotoBase64 != null) body['face_photo'] = facePhotoBase64;
    if (latitude != null) body['latitude'] = latitude;
    if (longitude != null) body['longitude'] = longitude;
    if (matchPercent != null) body['match_percent'] = matchPercent;
    if (note != null) body['note'] = note;
    if (biometrico) body['biometrico'] = true;

    try {
      final data = await _api.post('${ApiConfig.pontoEndpoint}/biometrico', body: body);
      if (data is Map && data['offline'] == true) {
        return PontoRecord(
          id: -1,
          clockIn: DateTime.now(),
          note: note,
          createdAt: DateTime.now(),
        );
      }
      return PontoRecord.fromJson(data['record'] ?? data['data']);
    } catch (e) {
      await _offline.queuePontoRecord(
        action: 'clock_in',
        facePhotoBase64: facePhotoBase64,
        latitude: latitude,
        longitude: longitude,
        matchPercent: matchPercent,
        note: note,
        biometrico: biometrico,
      );
      rethrow;
    }
  }

  Future<PontoRecord> clockOut({
    String? facePhotoBase64,
    double? latitude,
    double? longitude,
    double? matchPercent,
    String? note,
    bool biometrico = false,
  }) async {
    final body = <String, dynamic>{
      'action': 'clock_out',
      'timestamp': DateTime.now().toIso8601String(),
    };
    if (facePhotoBase64 != null) body['face_photo'] = facePhotoBase64;
    if (latitude != null) body['latitude'] = latitude;
    if (longitude != null) body['longitude'] = longitude;
    if (matchPercent != null) body['match_percent'] = matchPercent;
    if (note != null) body['note'] = note;
    if (biometrico) body['biometrico'] = true;

    try {
      final data = await _api.post('${ApiConfig.pontoEndpoint}/biometrico', body: body);
      if (data is Map && data['offline'] == true) {
        return PontoRecord(
          id: -1,
          clockIn: DateTime.now().subtract(const Duration(hours: 8)),
          clockOut: DateTime.now(),
          note: note,
          createdAt: DateTime.now(),
        );
      }
      return PontoRecord.fromJson(data['record'] ?? data['data']);
    } catch (e) {
      await _offline.queuePontoRecord(
        action: 'clock_out',
        facePhotoBase64: facePhotoBase64,
        latitude: latitude,
        longitude: longitude,
        matchPercent: matchPercent,
        note: note,
        biometrico: biometrico,
      );
      rethrow;
    }
  }

  Future<PontoRecord> startBreak({String? note}) async {
    try {
      final data = await _api.post('${ApiConfig.pontoEndpoint}/break/start',
          body: {'timestamp': DateTime.now().toIso8601String(), 'note': note});
      if (data is Map && data['offline'] == true) {
        return PontoRecord(
          id: -1,
          clockIn: DateTime.now(),
          note: note,
          createdAt: DateTime.now(),
        );
      }
      return PontoRecord.fromJson(data['record']);
    } catch (e) {
      await _offline.queueBreakAction(action: 'start', note: note);
      rethrow;
    }
  }

  Future<PontoRecord> endBreak({String? note}) async {
    try {
      final data = await _api.post('${ApiConfig.pontoEndpoint}/break/end',
          body: {'timestamp': DateTime.now().toIso8601String(), 'note': note});
      if (data is Map && data['offline'] == true) {
        return PontoRecord(
          id: -1,
          clockIn: DateTime.now(),
          note: note,
          createdAt: DateTime.now(),
        );
      }
      return PontoRecord.fromJson(data['record']);
    } catch (e) {
      await _offline.queueBreakAction(action: 'end', note: note);
      rethrow;
    }
  }

  Future<PontoRecord?> getCurrentRecord() async {
    try {
      final data = await _api.get('${ApiConfig.pontoEndpoint}/current');
      if (data['record'] != null) return PontoRecord.fromJson(data['record']);
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<List<PontoRecord>> getHistory({int page = 1, int limit = 20}) async {
    final data = await _api.get(ApiConfig.pontoHistoryEndpoint, queryParams: {
      'page': page.toString(),
      'limit': limit.toString(),
    });
    return (data['records'] as List<dynamic>)
        .map((e) => PontoRecord.fromJson(e))
        .toList();
  }

  Future<PontoSummary> getSummary({String? period}) async {
    final params = <String, String>{};
    if (period != null) params['period'] = period;
    final data = await _api.get('${ApiConfig.pontoEndpoint}/summary', queryParams: params);
    return PontoSummary.fromJson(data);
  }

  Future<PontoRecord> getRecordDetail(int recordId) async {
    final data = await _api.get('${ApiConfig.pontoEndpoint}/$recordId');
    return PontoRecord.fromJson(data['record']);
  }
}
