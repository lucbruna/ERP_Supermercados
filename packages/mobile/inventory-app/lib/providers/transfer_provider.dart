import 'package:flutter/material.dart';
import '../services/transfer_service.dart';

class TransferProvider extends ChangeNotifier {
  final TransferService _transferService = TransferService();

  List<Map<String, dynamic>> _transfers = [];
  List<Map<String, dynamic>> _destinations = [];
  bool _isLoading = false;
  String? _error;

  List<Map<String, dynamic>> get transfers => _transfers;
  List<Map<String, dynamic>> get destinations => _destinations;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadTransfers({String? status}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _transfers = await _transferService.getTransfers(status: status);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadDestinations() async {
    try {
      _destinations = await _transferService.getDestinations();
      notifyListeners();
    } catch (_) {}
  }

  Future<bool> createTransfer(Map<String, dynamic> data) async {
    try {
      await _transferService.createTransfer(data);
      await loadTransfers();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
