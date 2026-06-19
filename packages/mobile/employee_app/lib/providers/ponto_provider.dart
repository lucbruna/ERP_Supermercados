import 'package:flutter/material.dart';
import '../models/ponto_record.dart';
import '../services/ponto_service.dart';

enum PontoStatus { none, clockedIn, onBreak, clockedOut }

class PontoProvider extends ChangeNotifier {
  final PontoService _pontoService = PontoService();

  PontoStatus _status = PontoStatus.none;
  PontoRecord? _currentRecord;
  List<PontoRecord> _history = [];
  PontoSummary? _summary;
  bool _isLoading = false;
  String? _error;

  PontoStatus get status => _status;
  PontoRecord? get currentRecord => _currentRecord;
  List<PontoRecord> get history => _history;
  PontoSummary? get summary => _summary;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isClockedIn => _status == PontoStatus.clockedIn;
  bool get isOnBreak => _status == PontoStatus.onBreak;

  String get statusLabel {
    switch (_status) {
      case PontoStatus.none:
        return 'Bater Ponto';
      case PontoStatus.clockedIn:
        return 'Registrar Saída';
      case PontoStatus.onBreak:
        return 'Voltar do Intervalo';
      case PontoStatus.clockedOut:
        return 'Expediente Encerrado';
    }
  }

  Future<void> loadCurrentStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      _currentRecord = await _pontoService.getCurrentRecord();
      if (_currentRecord != null) {
        if (_currentRecord!.clockOut != null) {
          _status = PontoStatus.clockedOut;
        } else if (_currentRecord!.breakStart != null && _currentRecord!.breakEnd == null) {
          _status = PontoStatus.onBreak;
        } else {
          _status = PontoStatus.clockedIn;
        }
      } else {
        _status = PontoStatus.none;
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> clockIn({
    String? facePhotoBase64,
    double? latitude,
    double? longitude,
    double? matchPercent,
    bool biometrico = false,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      _currentRecord = await _pontoService.clockIn(
        facePhotoBase64: facePhotoBase64,
        latitude: latitude,
        longitude: longitude,
        matchPercent: matchPercent,
        biometrico: biometrico,
      );
      _status = PontoStatus.clockedIn;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> clockOut({
    String? facePhotoBase64,
    double? latitude,
    double? longitude,
    double? matchPercent,
    bool biometrico = false,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      _currentRecord = await _pontoService.clockOut(
        facePhotoBase64: facePhotoBase64,
        latitude: latitude,
        longitude: longitude,
        matchPercent: matchPercent,
        biometrico: biometrico,
      );
      _status = PontoStatus.clockedOut;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> startBreak() async {
    try {
      _currentRecord = await _pontoService.startBreak();
      _status = PontoStatus.onBreak;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> endBreak() async {
    try {
      _currentRecord = await _pontoService.endBreak();
      _status = PontoStatus.clockedIn;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> loadHistory({int page = 1}) async {
    _isLoading = true;
    notifyListeners();

    try {
      _history = await _pontoService.getHistory(page: page);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadSummary({String? period}) async {
    try {
      _summary = await _pontoService.getSummary(period: period);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
