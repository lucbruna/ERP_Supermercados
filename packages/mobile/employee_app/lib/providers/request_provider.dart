import 'package:flutter/material.dart';
import '../models/request_model.dart';
import '../services/request_service.dart';

class RequestProvider extends ChangeNotifier {
  final RequestService _requestService = RequestService();

  List<RequestModel> _requests = [];
  List<RequestModel> _pendingRequests = [];
  bool _isLoading = false;
  String? _error;

  List<RequestModel> get requests => _requests;
  List<RequestModel> get pendingRequests => _pendingRequests;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get pendingCount => _requests.where((r) => r.status == 'pending').length;

  Future<void> loadRequests({int page = 1}) async {
    _isLoading = true;
    notifyListeners();

    try {
      _requests = await _requestService.getRequests(page: page);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createRequest(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      final request = await _requestService.createRequest(data);
      _requests.insert(0, request);
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

  Future<bool> cancelRequest(int requestId) async {
    try {
      await _requestService.cancelRequest(requestId);
      final index = _requests.indexWhere((r) => r.id == requestId);
      if (index >= 0) {
        _requests[index] = RequestModel(
          id: _requests[index].id,
          type: _requests[index].type,
          title: _requests[index].title,
          description: _requests[index].description,
          startDate: _requests[index].startDate,
          endDate: _requests[index].endDate,
          status: 'cancelled',
          createdAt: _requests[index].createdAt,
        );
      }
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> approveRequest(int requestId, {String? reason}) async {
    try {
      await _requestService.approveRequest(requestId, reason: reason);
      await loadRequests();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> rejectRequest(int requestId, {required String reason}) async {
    try {
      await _requestService.rejectRequest(requestId, reason: reason);
      await loadRequests();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> loadPendingRequests() async {
    try {
      _pendingRequests = await _requestService.getPendingRequests();
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
